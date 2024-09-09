import { useEffect, useState } from 'react';
import { RoundPlayingState, ServerSyncPayload } from '../protocol';

interface Props {
  syncPayload: ServerSyncPayload;
  onProposeValue: ({ value }: { value: number }) => void;
  onReadyUp: () => void;
  onReadyClear: () => void;
}

export function RoundPlaying({ syncPayload, onProposeValue, onReadyUp, onReadyClear }: Props) {
  const state = syncPayload.state as RoundPlayingState;
  const currentSpectrum = state.current;
  const guess = state.proposedValue;
  const isOwnSpectrum = currentSpectrum.assigned.id === syncPayload.you.id;
  const [proposedValue, setProposedValue] = useState('');
  const isReady = state.ready.some(player => player.id === syncPayload.you.id);

  useEffect(() => {
    setProposedValue('');
  }, [currentSpectrum.id]);

  useEffect(() => {
    setProposedValue('');
  }, [guess]);

  return (
    <div>
      <h1>Round Playing</h1>
      <p>
        On a scale from {currentSpectrum.left} to {currentSpectrum.right}, what percent is the clue
        "{currentSpectrum.prompt!}"?
      </p>

      <label>Group's current guess: {(guess * 100).toFixed(0)}%</label>

      {isOwnSpectrum ? (
        <h1>This is your own clue, so no participating. Let's see your best poker-face.</h1>
      ) : (
        <div>
          <label>
            Propose new guess:{' '}
            <input
              type="number"
              min="0"
              max="100"
              value={proposedValue}
              onChange={e => {
                setProposedValue(e.target.value);
              }}
            ></input>
          </label>

          <button
            disabled={
              !proposedValue ||
              isNaN(parseFloat(proposedValue)) ||
              parseFloat(proposedValue) < 0 ||
              parseFloat(proposedValue) > 100 ||
              isOwnSpectrum
            }
            onClick={() => {
              onProposeValue({ value: parseFloat(proposedValue) / 100.0 });
              setProposedValue('');
            }}
          >
            Submit proposal
          </button>
        </div>
      )}

      {!isOwnSpectrum ? (
        <button
          disabled={isOwnSpectrum}
          onClick={() => {
            if (isReady) {
              onReadyClear();
            } else {
              onReadyUp();
            }
          }}
        >
          {isReady ? 'Not ready' : 'Ready'}
        </button>
      ) : null}
    </div>
  );
}
