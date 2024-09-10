import { useState } from 'react';
import { InitializingState, ServerSyncPayload } from '../protocol';
import { Spectrum } from '../components/Spectrum';

interface Props {
  syncPayload: ServerSyncPayload;
  onSubmitPrompt: ({ spectrumId, prompt }: { spectrumId: string; prompt: string }) => void;
}

function nextSpectrumForCurrentPlayer(syncPayload: ServerSyncPayload) {
  const currentPlayerId = syncPayload.you.id;
  const state = syncPayload.state as InitializingState;

  return state.spectrums.find(
    spectrum => spectrum.assigned.id === currentPlayerId && !spectrum.prompt
  );
}

export function GameInitializing({ syncPayload, onSubmitPrompt }: Props) {
  const [answer, setAnswer] = useState('');
  const spectrum = nextSpectrumForCurrentPlayer(syncPayload);

  if (!spectrum) {
    return (
      <div>
        <h1>Waiting on other players...</h1>
      </div>
    );
  }

  return (
    <div>
      <Spectrum
        spectrum={spectrum}
        readonly={true}
        value={spectrum.correctValue!}
        onValueChange={() => {
          // unused
        }}
      />

      <h1 style={{ fontSize: 32 }}>
        <label>
          Clue:{' '}
          <input
            style={{ fontSize: 32, maxWidth: '81vw' }}
            value={answer}
            onChange={e => {
              setAnswer(e.target.value);
            }}
          ></input>
        </label>
      </h1>

      <br />
      <button
        disabled={!answer}
        onClick={() => {
          onSubmitPrompt({ spectrumId: spectrum.id, prompt: answer });
          setAnswer('');
        }}
      >
        Submit
      </button>
    </div>
  );
}
