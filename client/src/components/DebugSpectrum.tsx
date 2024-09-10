import { useState } from 'react';
import { ClientSpectrum } from '../protocol';
import { Spectrum } from './Spectrum';
import { bandsForTargetNumber } from './util';

const SPECTRUM: ClientSpectrum = {
  id: '0',
  left: 'cold',
  right: 'hot',
  assigned: {
    id: '0',
    name: 'Alice',
  },
};

export function DebugSpectrum() {
  const [value, setValue] = useState(0.5);

  return (
    <div>
      <Spectrum
        readonly={false}
        spectrum={SPECTRUM}
        value={value}
        onValueChange={setValue}
        bands={bandsForTargetNumber(0.5)}
      />
    </div>
  );
}
