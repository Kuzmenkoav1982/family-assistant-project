import { CX, CY } from './utils';

// Подпись слоя — выноска идёт от ВНЕШНЕГО контура слоя (точка-якорь на rOut),
// потом радиальная "иголка" наружу, потом горизонтальная полка к подписи.
interface LayerLabelProps {
  label: string;
  sublabel?: string;
  color: string;
  ringROut: number;
  angleDeg: number;
  labelX: number;
}

export function LayerLabel({ label, sublabel, color, ringROut, angleDeg, labelX }: LayerLabelProps) {
  const angle = (angleDeg * Math.PI) / 180;
  const ax = CX + ringROut * Math.cos(angle);
  const ay = CY + ringROut * Math.sin(angle);
  const radialOut = 22;
  const bx = CX + (ringROut + radialOut) * Math.cos(angle);
  const by = CY + (ringROut + radialOut) * Math.sin(angle);
  const isRight = Math.cos(angle) >= 0;

  return (
    <g>
      <path d={`M ${ax} ${ay} L ${bx} ${by}`} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <path d={`M ${bx} ${by} L ${labelX} ${by}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={ax} cy={ay} r={4.5} fill="white" stroke={color} strokeWidth={2.5} />
      <text
        x={labelX + (isRight ? 8 : -8)}
        y={by - (sublabel ? 4 : 0)}
        textAnchor={isRight ? 'start' : 'end'}
        fontSize={14}
        fontWeight={800}
        fill={color}
        fontFamily="system-ui"
        letterSpacing={0.5}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={labelX + (isRight ? 8 : -8)}
          y={by + 13}
          textAnchor={isRight ? 'start' : 'end'}
          fontSize={11}
          fontWeight={500}
          fill={color}
          opacity={0.8}
          fontFamily="system-ui"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

export default LayerLabel;
