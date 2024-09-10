import { SpectrumBand } from './Spectrum';

export const bandsForTargetNumber = (target: number): SpectrumBand[] => {
  return [
    {
      score: 1,
      color: '#a17419',
      start: target - 0.15,
      end: target + 0.15,
    },
    {
      score: 2,
      color: '#b7b7b7',
      start: target - 0.1,
      end: target + 0.1,
    },
    {
      score: 4,
      color: '#d5a500',
      start: target - 0.05,
      end: target + 0.05,
    },
  ];
};

export function score(target: number, value: number): number {
  let bestBand: SpectrumBand | null = null;

  const bands = bandsForTargetNumber(target);
  for (const band of bands) {
    if (band.start <= value && value <= band.end) {
      bestBand = band;
    }
  }

  return bestBand?.score ?? 0;
}
