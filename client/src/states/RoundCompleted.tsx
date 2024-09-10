import { Spectrum } from '../components/Spectrum';
import { bandsForTargetNumber, score } from '../components/util';
import { RoundCompletedState, ServerSyncPayload } from '../protocol';

interface Props {
  syncPayload: ServerSyncPayload;
  onProceed: () => void;
}

export function RoundCompleted({ syncPayload, onProceed }: Props) {
  const state = syncPayload.state as RoundCompletedState;
  const currentSpectrum = state.current;

  return (
    <div>
      <Spectrum
        readonly={true}
        spectrum={currentSpectrum}
        bands={bandsForTargetNumber(currentSpectrum.correctValue!)}
        value={currentSpectrum.submittedValue!}
        score={score(currentSpectrum.correctValue!, currentSpectrum.submittedValue!)}
      />

      <h2>Round Complete</h2>

      <button
        onClick={() => {
          onProceed();
        }}
      >
        Proceed
      </button>
    </div>
  );
}
