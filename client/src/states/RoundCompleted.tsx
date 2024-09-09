import { Debug } from '../components/Debug';
import { ServerSyncPayload } from '../protocol';

interface Props {
  syncPayload: ServerSyncPayload;
  onProceed: () => void;
}

export function RoundCompleted({ syncPayload, onProceed }: Props) {
  return (
    <div>
      <h1>Round Completed</h1>

      <button
        onClick={() => {
          onProceed();
        }}
      >
        Proceed
      </button>

      <Debug>{syncPayload}</Debug>
    </div>
  );
}
