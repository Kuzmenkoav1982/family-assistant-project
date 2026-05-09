import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { STATUS_FILL, wrapName, type SegmentDef } from './utils';

interface SegmentProps {
  seg: SegmentDef;
  iconSize: number;
  fontSize: number;
  maxLen: number;
  onClick: () => void;
}

export function Segment({ seg, iconSize, fontSize, maxLen, onClick }: SegmentProps) {
  const [hover, setHover] = useState(false);
  const config = STATUS_FILL[seg.module.status];
  const lines = wrapName(seg.module.name, maxLen);
  const lineHeight = fontSize * 1.05;
  const totalHeight = lines.length * lineHeight;
  const startY = seg.textY - totalHeight / 2 + lineHeight / 2;

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer' }}
    >
      <path
        d={seg.d}
        fill={`url(#${hover ? config.hoverGradId : config.gradId})`}
        stroke={config.stroke}
        strokeWidth={1.2}
        opacity={0.92}
        style={{ transition: 'opacity 0.2s' }}
      />

      <foreignObject
        x={seg.iconX - iconSize / 2}
        y={seg.iconY - iconSize / 2}
        width={iconSize}
        height={iconSize}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: iconSize,
            height: iconSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.text,
          }}
        >
          <Icon name={seg.module.icon} size={iconSize - 2} />
        </div>
      </foreignObject>

      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight={600}
        fill={config.text}
        fontFamily="system-ui, -apple-system, sans-serif"
        transform={`rotate(${seg.deg}, ${seg.textX}, ${seg.textY})`}
        style={{ pointerEvents: 'none' }}
      >
        {lines.map((line, idx) => (
          <tspan key={idx} x={seg.textX} y={startY + idx * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export default Segment;
