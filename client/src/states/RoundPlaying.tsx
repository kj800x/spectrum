import { useCallback } from 'react';
import { RoundPlayingState, ServerSyncPayload } from '../protocol';
import { Spectrum } from '../components/Spectrum';

interface Props {
  syncPayload: ServerSyncPayload;
  onProposeValue: ({ value }: { value: number }) => void;
  onReadyUp: () => void;
  onReadyClear: () => void;
}

export function RoundPlaying({ syncPayload, onProposeValue, onReadyUp, onReadyClear }: Props) {
  const state = syncPayload.state as RoundPlayingState;
  const currentSpectrum = state.current;
  const isOwnSpectrum = currentSpectrum.assigned.id === syncPayload.you.id;
  const isReady = state.ready.some(player => player.id === syncPayload.you.id);

  const proposeValue = useCallback(
    (value: number) => {
      console.log({ value });
      onProposeValue({ value });
    },
    [onProposeValue]
  );

  return (
    <div>
      <Spectrum
        spectrum={currentSpectrum}
        value={state.proposedValue}
        onValueChange={proposeValue}
        readonly={isOwnSpectrum}
      />

      {isOwnSpectrum ? (
        <h3>This is your own clue, so no participating. Let's see your best poker-face.</h3>
      ) : null}

      {!isOwnSpectrum ? (
        <button
          disabled={isOwnSpectrum}
          style={{ fontSize: 24 }}
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
