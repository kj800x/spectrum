import { ServerSyncPayload } from '../protocol';

interface Props {
  syncPayload: ServerSyncPayload;
  onGameStart: () => void;
}

export function Lobby({ syncPayload, onGameStart }: Props) {
  return (
    <div>
      <h1>Room: {syncPayload.code}</h1>
      <h3 style={{ textAlign: 'left' }}>Players:</h3>
      <ul style={{ textAlign: 'left' }}>
        {syncPayload.players.map(player => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
      <button
        style={{ fontSize: 24 }}
        onClick={() => {
          onGameStart();
        }}
        disabled={syncPayload.players.length < 2}
      >
        Start game
      </button>
    </div>
  );
}
