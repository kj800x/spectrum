import ws from 'ws';

const SPECTRUMS = [
  ["cold", "hot"],
  ["poor", "rich"],
  ["quiet", "loud"],
  ["slow", "fast"],
  ["small", "big"],
  ["sad", "happy"],
  ["dark", "light"],
  ["old", "new"],
  ["weak", "strong"],
  ["narrow", "wide"],
  ["boring", "exciting"],
  ["empty", "full"]
]

let playerId = 1;

export class Player {
  id: string;
  name: string;
  connection: ws;
  lobby?: Lobby;

  constructor(name: string, connection: ws) {
    this.id = `${playerId++}`;
    this.name = name;
    this.connection = connection;
  }
}

type Spectrum = {
  id: string;
  left: string;
  right: string;
  correctValue?: number; // [0.0, 1.0]
  submittedValue?: number; // [0.0, 1.0]
  prompt?: string;
  assigned: Player;
};

type GameState =
  | {
      state: 'lobby';
    }
  | {
      state: 'initializing';
      spectrums: Spectrum[];
    }
  | { state: 'round-playing'; spectrums: Spectrum[]; current: Spectrum, ready: Player[], proposedValue: number }
  | { state: 'round-completed'; spectrums: Spectrum[]; current: Spectrum }
  | { state: 'results'; spectrums: Spectrum[] };

function asClientSafeSpectrum(spectrum: Spectrum, currentPlayer: Player): Spectrum {
  // The assigned player can always see all attributes of the spectrum until the value is submitted
  if (currentPlayer === spectrum.assigned || spectrum.submittedValue != null) {
    return {...spectrum, assigned: asClientSafePlayer(spectrum.assigned, currentPlayer)};
  }

  const result: Spectrum = {...spectrum, assigned: asClientSafePlayer(spectrum.assigned, currentPlayer)};
  delete result.correctValue;
  return result;
}

function asClientSafePlayer(player: Player, _currentPlayer: Player): Player {
   // FIXME: I'm actually hiding the connection here, so this isn't a real Player
  return {
    id: player.id,
    name: player.name,
  } as Player;
}

function asClientSafeGameState(state: GameState, currentPlayer: Player): GameState {
  switch (state.state) {
    case 'lobby':
      return state;
    case 'initializing':
      return {
        state: 'initializing',
        spectrums: state.spectrums.map(spectrum => asClientSafeSpectrum(spectrum, currentPlayer)),
      };
    case 'round-playing':
      return {
        state: 'round-playing',
        spectrums: state.spectrums.map(spectrum => asClientSafeSpectrum(spectrum, currentPlayer)),
        current: asClientSafeSpectrum(state.current, currentPlayer),
        ready: state.ready.map(player => asClientSafePlayer(player, currentPlayer)),
        proposedValue: state.proposedValue,
      };
    case 'round-completed':
      return {
        state: 'round-completed',
        spectrums: state.spectrums.map(spectrum => asClientSafeSpectrum(spectrum, currentPlayer)),
        current: asClientSafeSpectrum(state.current, currentPlayer),
      };
    case 'results':
      return {
        state: 'results',
        spectrums: state.spectrums.map(spectrum => asClientSafeSpectrum(spectrum, currentPlayer)),
      };
  }
}

// Select a random subset of an array without repeats
function selectRandom<T>(array: T[], count: number): T[] {
  if (count > array.length) {
    throw new Error('Cannot select more elements than are in the array');
  }

  const used = new Set();
  const result: T[] = [];

  for (let i = 0; i < count; i++) {
    let index: number;
    do {
      index = Math.floor(Math.random() * array.length);
    } while (used.has(index));

    used.add(index);
    result.push(array[index]!);
  }

  return result;
}

// Double an array
function double<T>(array: T[]): T[] {
  return array.concat(array);
}

// FIXME: I have no clue if this works correctly, copilot wrote it for me.
function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  for (let i = 0; i < result.length; i++) {
    const j = Math.floor(Math.random() * (result.length - i) + i);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

function createSpectrums(players: Player[]): Spectrum[] {
  let id = 1;

  const playerOrder = shuffle(double(players));
  const spectrums = selectRandom(SPECTRUMS, playerOrder.length * 2);

  return shuffle(double(players)).map(
    (player, i) =>
      ({
        id: `${id++}`,
        left: spectrums[i]![0]!,
        right: spectrums[i]![1]!,
        correctValue: Math.random(),
        assigned: player,
      } satisfies Spectrum)
  );
}


class Lobby {
  code: string;
  players: Player[];
  state: GameState;

  constructor(code: string) {
    this.code = code;
    this.players = [];
    this.state = { state: 'lobby' };
  }

  sync() {
    this.players.forEach(player => {
      player.connection.send(
        JSON.stringify({
          type: 'sync',
          you: asClientSafePlayer(player, player),
          state: asClientSafeGameState(this.state, player),
          players: this.players.map(p => asClientSafePlayer(p, player)),
          code: this.code,
        })
      );
    });
  }

  addPlayer(player: Player) {
    this.players.push(player);
    player.lobby = this;
    this.sync();
  }

  startGame() {
    if (this.state.state !== 'lobby') {
      throw new Error('Game already started');
    }

    this.state = {
      state: 'initializing',
      spectrums: createSpectrums(this.players),
    };
    this.sync();
  }

  submitPrompt(player: Player, spectrumId: string, prompt: string) {
    if (this.state.state !== 'initializing') {
      throw new Error('Game not initializing');
    }

    const spectrum = this.state.spectrums.find(spectrum => spectrum.id === spectrumId);
    if (!spectrum) {
      throw new Error('Spectrum not found');
    }

    if (spectrum.assigned !== player) {
      throw new Error('Spectrum not assigned to player');
    }

    spectrum.prompt = prompt;

    // If all prompts are submitted, start the game
    if (this.state.spectrums.every(spectrum => spectrum.prompt)) {
      this.state = {
        state: 'round-playing',
        spectrums: this.state.spectrums,
        current: this.state.spectrums[0]!,
        ready: [],
        proposedValue: 0.5,
      };
    }
    this.sync();
  }

  proposeValue(player: Player, value: number) {
    if (this.state.state !== 'round-playing') {
      throw new Error('Game not playing');
    }

    if (this.state.current.assigned === player) {
      throw new Error('Cannot propose a value on your own spectrum');
    }

    this.state.proposedValue = value;
    this.state.ready = [];
    this.sync();
  }

  readyUp(player: Player) {
    if (this.state.state !== 'round-playing') {
      throw new Error('Game not playing');
    }

    if (this.state.current.assigned === player) {
      throw new Error('Cannot ready up on your own spectrum');
    }

    if (!this.state.ready.includes(player)) {
      this.state.ready.push(player);
    }

    if (this.state.ready.length === this.players.length - 1) {
      this.state.current.submittedValue = this.state.proposedValue;
      this.state = {
        state: 'round-completed',
        spectrums: this.state.spectrums,
        current: this.state.current,
      };
    }
    this.sync();
  }

  nextRound(_player: Player) {
    if (this.state.state !== 'round-completed') {
      throw new Error('Round not completed');
    }

    const index = this.state.spectrums.indexOf(this.state.current);
    if (index === this.state.spectrums.length - 1) {
      this.state = {
        state: 'results',
        spectrums: this.state.spectrums,
      };
    } else {
      this.state = {
        state: 'round-playing',
        spectrums: this.state.spectrums,
        current: this.state.spectrums[index + 1]!,
        ready: [],
        proposedValue: 0.5,
      };
    }
    this.sync();
  }

  clearReady(player: Player) {
    if (this.state.state !== 'round-playing') {
      throw new Error('Game not playing');
    }

    const index = this.state.ready.indexOf(player);
    if (index !== -1) {
      this.state.ready.splice(index, 1);
      this.sync();
    }
  }
}

class LobbyManager {
  lobbies: Lobby[];

  constructor() {
    this.lobbies = [];
  }

  lobbyExists(code: string) {
    return !!this.lobbies.find(lobby => lobby.code === code);
  }

  getLobby(code: string): Lobby | undefined {
    return this.lobbies.find(lobby => lobby.code === code);
  }

  createLobby() {
    let code: string;
    do {
      // TODO: Better code generation that doesn't require a loop or generate look-similar codes.
      code = Math.random()
        .toString(36)
        .substring(9)
        .toUpperCase();
    } while (this.lobbyExists(code));

    const lobby = new Lobby(code);
    this.lobbies.push(lobby);

    return code;
  }
}

export default new LobbyManager();
