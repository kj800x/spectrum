import { useState } from 'react';
import { InitializingState, ServerSyncPayload } from '../protocol';

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
      <p>
        On a scale from {spectrum.left} to {spectrum.right}, what is{' '}
        {(spectrum.correctValue! * 100).toFixed(0)}% {spectrum.right}?
      </p>

      <label>
        Answer: <input value={answer} onChange={e => setAnswer(e.target.value)}></input>
      </label>
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
