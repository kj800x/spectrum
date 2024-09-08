import ws from 'ws';
import { isClientMessage } from './protocol';
import LobbyManager, { Player } from './game';

export const wss = new ws.Server({ noServer: true });

type HydratedConnection = ws & { player?: Player };

wss.on('connection', (connection: HydratedConnection) => {
  connection.on('message', (message: any) => {
    let parsed: any;
    try {
      parsed = JSON.parse((message as unknown) as string);
    } catch (e) {
      console.error('Invalid JSON', message);
      return;
    }

    if (!isClientMessage(parsed)) {
      console.error('Valid JSON but not per protocol', parsed);
      return;
    }

    switch (parsed.type) {
      case 'create-room': {
        connection.player = new Player(parsed.nickname, connection);
        const code = LobbyManager.createLobby();
        const lobby = LobbyManager.getLobby(code)!;
        lobby.addPlayer(connection.player!);
        break;
      }
      case 'join-room': {
        connection.player = new Player(parsed.nickname, connection);
        const lobby = LobbyManager.getLobby(parsed.code);
        if (!lobby) {
          console.error("Player tried to join a lobby that didn't exist", parsed.code);
          return;
        }
        lobby.addPlayer(connection.player!);
        break;
      }
      case 'start-game': {
        if (!connection.player) {
          console.error('Player tried to start a game without being initialized');
          return;
        }
        if (!connection.player.lobby) {
          console.error('Player tried to start a game without being in a lobby');
          return;
        }
        connection.player.lobby.startGame();
        break;
      }
      case 'submit-prompt': {
        if (!connection.player) {
          console.error('Player tried to submit a prompt without being initialized');
          return;
        }
        if (!connection.player.lobby) {
          console.error('Player tried to submit a prompt without being in a lobby');
          return;
        }
        connection.player.lobby.submitPrompt(connection.player, parsed.spectrumId, parsed.prompt);
        break;
      }
      case 'propose-value': {
        if (!connection.player) {
          console.error('Player tried to propose a value without being initialized');
          return;
        }
        if (!connection.player.lobby) {
          console.error('Player tried to propose a value without being in a lobby');
          return;
        }
        connection.player.lobby.proposeValue(connection.player, parsed.value);
        break;
      }
      case 'ready-up': {
        if (!connection.player) {
          console.error('Player tried to ready up without being initialized');
          return;
        }
        if (!connection.player.lobby) {
          console.error('Player tried to ready up without being in a lobby');
          return;
        }
        connection.player.lobby.readyUp(connection.player);
        break;
      }
      case 'clear-ready': {
        if (!connection.player) {
          console.error('Player tried to clear ready without being initialized');
          return;
        }
        if (!connection.player.lobby) {
          console.error('Player tried to clear ready without being in a lobby');
          return;
        }
        connection.player.lobby.clearReady(connection.player);
        break;
      }
      case 'proceed': {
        if (!connection.player) {
          console.error('Player tried to proceed the round without being initialized');
          return;
        }
        if (!connection.player.lobby) {
          console.error('Player tried to proceed the round without being in a lobby');
          return;
        }
        connection.player.lobby.nextRound(connection.player);
        break;
      }
    }
  });
});

export function broadcast(data: any) {
  wss.clients.forEach(client => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
