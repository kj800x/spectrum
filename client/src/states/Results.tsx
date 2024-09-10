import { Fragment } from "react/jsx-runtime";
import { Spectrum, SpectrumBand } from "../components/Spectrum";
import { ResultsState, ServerSyncPayload } from "../protocol";
import { bandsForTargetNumber, score } from "../components/util";

interface Props {
  syncPayload: ServerSyncPayload;
}

const FINAL_SCORE_SPECTRUM_BANDS: SpectrumBand[] = [
  {
    score: 0,
    color: "darkred",
    start: 0,
    end: 0.2,
  },
  {
    score: 1,
    color: "orange",
    start: 0.2,
    end: 0.4,
  },
  {
    score: 0,
    color: "yellow",
    start: 0.4,
    end: 0.7,
  },
  {
    score: 0,
    color: "green",
    start: 0.7,
    end: 1,
  },
];

function FinalScore({ state }: { state: ResultsState }) {
  const totalScore = state.spectrums.reduce((acc, spectrum) => {
    return acc + score(spectrum.correctValue!, spectrum.submittedValue!);
  }, 0);
  const totalPotentialScore = state.spectrums.length * 4;
  const percent = totalScore / totalPotentialScore;
  return (
    <>
      <h2>Total Score: {totalScore}</h2>
      <Spectrum
        value={percent!}
        readonly={true}
        spectrum={{
          id: "results",
          left: "0%",
          right: "100%",
          assigned: {
            id: "system",
            name: "system",
          },
        }}
        bands={FINAL_SCORE_SPECTRUM_BANDS}
      />
    </>
  );
}

export function Results({ syncPayload }: Props) {
  const state = syncPayload.state as ResultsState;

  return (
    <div>
      <h1>Final Results</h1>
      <hr />
      {state.spectrums.map((spectrum) => (
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
      <FinalScore state={state} />
    </div>
  );
}
