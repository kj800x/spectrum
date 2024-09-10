import { Fragment } from 'react/jsx-runtime';
import { Spectrum } from '../components/Spectrum';
import { ResultsState, ServerSyncPayload } from '../protocol';
import { bandsForTargetNumber, score } from '../components/util';

interface Props {
  syncPayload: ServerSyncPayload;
}

export function Results({ syncPayload }: Props) {
  const state = syncPayload.state as ResultsState;

  return (
    <div>
      <h1>Final Results</h1>
      <hr />
      {state.spectrums.map(spectrum => (
        <Fragment key={spectrum.id}>
          <Spectrum
            value={spectrum.submittedValue!}
            readonly={true}
            spectrum={spectrum}
            bands={bandsForTargetNumber(spectrum.correctValue!)}
            score={score(spectrum.correctValue!, spectrum.submittedValue!)}
          />

          <hr />
        </Fragment>
      ))}
    </div>
  );
}
