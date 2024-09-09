import { useState } from 'react';

interface Props {
  onRoomCreate: ({ nickname }: { nickname: string }) => void;
  onRoomJoin: ({ nickname, code }: { nickname: string; code: string }) => void;
}

export function Connection({ onRoomCreate, onRoomJoin }: Props) {
  const [roomCode, setRoomCode] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  return (
    <div>
      <label>
        Nickname:{' '}
        <input
          type="text"
          onChange={e => {
            setNickname(e.target.value);
          }}
          value={nickname}
        />
      </label>
      <button
        onClick={() => {
          onRoomCreate({ nickname });
        }}
        disabled={!nickname}
      >
        Create room
      </button>
      <label>
        Room code:{' '}
        <input
          type="text"
          onChange={e => {
            setRoomCode(e.target.value);
          }}
          value={roomCode}
        />
      </label>
      <button
        onClick={() => {
          onRoomJoin({ nickname, code: roomCode });
        }}
        disabled={!roomCode || !nickname}
      >
        Join room
      </button>
    </div>
  );
}
