import { Debug } from '../components/Debug';
import { ServerSyncPayload } from '../protocol';

interface Props {
  syncPayload: ServerSyncPayload;
}

export function Results({ syncPayload }: Props) {
  return (
    <div>
      <h1>Results</h1>
      <Debug>{syncPayload}</Debug>
    </div>
  );
}
