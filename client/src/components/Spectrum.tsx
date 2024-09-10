import { useEffect, useRef } from 'react';
import { ClientSpectrum } from '../protocol';

export interface SpectrumBand {
  score: number;
  color: string;
  start: number;
  end: number;
}

interface Props {
  readonly: boolean;
  spectrum: ClientSpectrum;
  value: number;
  onValueChange?: (value: number) => void;
  bands?: SpectrumBand[];
  score?: number;
}

const PAGE_MARGIN = 12; // Keep in sync with App.css
const MARGIN = 15;
const MAX_DISK_DIAMETER = window.outerWidth - 2 * MARGIN - 2 * PAGE_MARGIN;
const DISK_RADIUS = Math.min(250, MAX_DISK_DIAMETER / 2);
const CENTER_RADIUS = Math.round(DISK_RADIUS / 5);
const POINTER_CIRCLE_RADIUS = Math.min(Math.round(CENTER_RADIUS / 5), MARGIN);

function SpectrumBand({ band }: { band: SpectrumBand }) {
  const startAngle = Math.PI * (1 - band.start);
  const endAngle = Math.PI * (1 - band.end);
  const startX = Math.cos(startAngle) * DISK_RADIUS + (DISK_RADIUS + MARGIN);
  const startY = -Math.sin(startAngle) * DISK_RADIUS + (DISK_RADIUS + MARGIN);
  const endX = Math.cos(endAngle) * DISK_RADIUS + (DISK_RADIUS + MARGIN);
  const endY = -Math.sin(endAngle) * DISK_RADIUS + (DISK_RADIUS + MARGIN);

  return (
    <path
      clipPath="url(#disk-clipper)"
      d={`
        M ${DISK_RADIUS + MARGIN} ${DISK_RADIUS + MARGIN}
        L ${startX} ${startY}
        A ${DISK_RADIUS} ${DISK_RADIUS} 0 0 1 ${endX} ${endY}
        Z
      `}
      fill={band.color}
    ></path>
  );
}

export function Spectrum({ spectrum, readonly, onValueChange, value, bands, score }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const isPressed = useRef(false);

  const angle = Math.PI * (1 - value);
  const pointerX = Math.cos(angle) * (DISK_RADIUS * 0.9) + (DISK_RADIUS + MARGIN);
  const pointerY = -Math.sin(angle) * (DISK_RADIUS * 0.9) + (DISK_RADIUS + MARGIN);

  const minorPointerAAngle = angle - Math.PI / 2;
  const minorPointerBAngle = angle + Math.PI / 2;
  const minorPointerAX = Math.cos(minorPointerAAngle) * CENTER_RADIUS + (DISK_RADIUS + MARGIN);
  const minorPointerAY = -Math.sin(minorPointerAAngle) * CENTER_RADIUS + (DISK_RADIUS + MARGIN);
  const minorPointerBX = Math.cos(minorPointerBAngle) * CENTER_RADIUS + (DISK_RADIUS + MARGIN);
  const minorPointerBY = -Math.sin(minorPointerBAngle) * CENTER_RADIUS + (DISK_RADIUS + MARGIN);
  const pointerEdgeAX = Math.cos(minorPointerAAngle) * POINTER_CIRCLE_RADIUS + pointerX;
  const pointerEdgeAY = -Math.sin(minorPointerAAngle) * POINTER_CIRCLE_RADIUS + pointerY;
  const pointerEdgeBX = Math.cos(minorPointerBAngle) * POINTER_CIRCLE_RADIUS + pointerX;
  const pointerEdgeBY = -Math.sin(minorPointerBAngle) * POINTER_CIRCLE_RADIUS + pointerY;

  useEffect(() => {
    const documentOnMoveListener = (e: TouchEvent | MouseEvent) => {
      if (isPressed.current) {
        const rect = ref.current!.getBoundingClientRect();
        let x: number;
        let y: number;
        if (e instanceof MouseEvent) {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        } else if (e instanceof TouchEvent && e.touches.length === 1) {
          const touch = e.touches[0];
          x = touch.clientX - rect.left;
          y = touch.clientY - rect.top;
        } else {
          return;
        }
        const dx = x - (DISK_RADIUS + MARGIN);
        const dy = y - (DISK_RADIUS + MARGIN);
        const angle = Math.atan2(-dy, dx);
        let value = 1 - angle / Math.PI;
        if (value > 1.5) {
          value = 0;
        }
        if (value > 1) {
          value = 1;
        }
        if (!readonly && onValueChange) {
          onValueChange(value);
        }
      }
    };

    const documentOnMouseUpListener = () => {
      isPressed.current = false;
    };

    document.addEventListener('touchmove', documentOnMoveListener);
    document.addEventListener('mousemove', documentOnMoveListener);
    document.addEventListener('touchend', documentOnMouseUpListener);
    document.addEventListener('mouseup', documentOnMouseUpListener);

    return () => {
      document.removeEventListener('touchmove', documentOnMoveListener);
      document.removeEventListener('touchend', documentOnMouseUpListener);
    };
  }, [onValueChange, readonly]);

  return (
    <div style={{ width: DISK_RADIUS * 2 + MARGIN * 2, marginLeft: 'auto', marginRight: 'auto' }}>
      {spectrum.prompt ? (
        <div>
          <h3>{spectrum.assigned.name} gave the clue:</h3>
          <h1>{spectrum.prompt!}</h1>
        </div>
      ) : null}

      <svg
        ref={ref}
        width={(DISK_RADIUS + MARGIN) * 2}
        height={DISK_RADIUS + CENTER_RADIUS + MARGIN * 2}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        style={{ touchAction: 'none' }}
        onTouchStart={() => {
          isPressed.current = true;
        }}
        onMouseDown={() => {
          isPressed.current = true;
        }}
      >
        <clipPath id="disk-clipper">
          <rect x={0} y={0} width={(DISK_RADIUS + MARGIN) * 2} height={DISK_RADIUS + MARGIN} />
        </clipPath>

        <circle
          clipPath="url(#disk-clipper)"
          cx={DISK_RADIUS + MARGIN}
          cy={DISK_RADIUS + MARGIN}
          r={DISK_RADIUS}
          fill="#000000"
        />
        {bands?.map(band => <SpectrumBand key={band.score} band={band} />)}
        <circle
          id="center-circle"
          cx={DISK_RADIUS + MARGIN}
          cy={DISK_RADIUS + MARGIN}
          r={CENTER_RADIUS}
          fill="#FF0000"
        />
        <circle
          id="pointer-circle"
          cx={pointerX}
          cy={pointerY}
          r={POINTER_CIRCLE_RADIUS}
          fill="#FF0000"
        />
        <path
          d={`
            M ${minorPointerAX} ${minorPointerAY}
            L ${minorPointerBX} ${minorPointerBY}
            L ${pointerEdgeBX} ${pointerEdgeBY}
            L ${pointerEdgeAX} ${pointerEdgeAY}
            Z
          `}
          fill="#FF0000"
        ></path>
      </svg>
      <div
        style={{
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          fontSize: 32,
          marginTop: -64,
          textTransform: 'capitalize',
        }}
      >
        <div>{spectrum.left}</div>
        <div>{spectrum.right}</div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 32 }}>
        {score !== undefined ? `Score: ${score}` : ''}
      </div>
    </div>
  );
}
