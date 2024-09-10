import { useState } from 'react';

interface Props {
  onRoomCreate: ({ nickname }: { nickname: string }) => void;
  onRoomJoin: ({ nickname, code }: { nickname: string; code: string }) => void;
}

export function Connection({ onRoomCreate, onRoomJoin }: Props) {
  const [roomCode, setRoomCode] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  return (
    <div style={{ fontSize: 20, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: 32 }}>Spectrum</h1>
        <label>
          Nickname:{' '}
          <input
            style={{ fontSize: 'inherit' }}
            type="text"
            onChange={e => {
              setNickname(e.target.value);
            }}
            value={nickname}
          />
        </label>
      </div>
      <div>
        <label>
          Room code:{' '}
          <input
            style={{ fontSize: 'inherit' }}
            type="text"
            onChange={e => {
              setRoomCode(e.target.value);
            }}
            value={roomCode}
          />
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          style={{ marginRight: '8px' }}
          onClick={() => {
            onRoomCreate({ nickname });
          }}
          disabled={!nickname}
        >
          Create room
        </button>
        <div>or</div>
        <button
          style={{ marginLeft: '8px' }}
          onClick={() => {
            onRoomJoin({ nickname, code: roomCode });
          }}
          disabled={!roomCode || !nickname}
        >
          Join room
        </button>
      </div>
    </div>
  );
}
