import { useMemo } from 'react';
import Icon from '@/components/ui/icon';
import type { Hub, DashboardStats } from './types';

interface Props {
  hubs: Hub[];
  stats: DashboardStats;
  activeHubId: number | null;
  onSelectHub: (id: number) => void;
}

const SIZE = 720;
const CENTER = SIZE / 2;
const HUB_RADIUS = 250;
const HUB_SIZE = 88;
const ARC_RADIUS = HUB_SIZE / 2 + 6;
const CAPSULE_RADIUS = 330;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function DashboardWheel({ hubs, stats, activeHubId, onSelectHub }: Props) {
  const items = useMemo(() => {
    const step = 360 / hubs.length;
    return hubs.map((h, i) => {
      const angle = i * step;
      const pos = polar(CENTER, CENTER, HUB_RADIUS, angle);
      const cap = polar(CENTER, CENTER, CAPSULE_RADIUS, angle);
      return { hub: h, angle, x: pos.x, y: pos.y, cx: cap.x, cy: cap.y };
    });
  }, [hubs]);

  const overallCircum = 2 * Math.PI * 130;
  const overallOffset = overallCircum * (1 - stats.overall_progress / 100);

  return (
    <div className="relative mx-auto w-full max-w-[720px] aspect-square">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="overallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {[180, 230, 280, 330].map((r) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        ))}

        <circle cx={CENTER} cy={CENTER} r="140" fill="white" opacity="0.9" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="130"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="8"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="130"
          fill="none"
          stroke="url(#overallGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={overallCircum}
          strokeDashoffset={overallOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

        {items.map(({ hub, cx, cy, angle }) => (
          <CapsuleProgress
            key={`cap-${hub.id}`}
            cx={cx}
            cy={cy}
            angle={angle}
            color={hub.color}
            progress={hub.progress}
            icon={hub.icon}
            isActive={activeHubId === hub.id}
          />
        ))}

        {items.map(({ hub, x, y }) => {
          const r = HUB_SIZE / 2;
          const arcCircum = 2 * Math.PI * ARC_RADIUS;
          const offset = arcCircum * (1 - hub.progress / 100);
          return (
            <g key={`arc-${hub.id}`}>
              <circle
                cx={x}
                cy={y}
                r={ARC_RADIUS}
                fill="none"
                stroke={`${hub.color}22`}
                strokeWidth="3"
              />
              <circle
                cx={x}
                cy={y}
                r={ARC_RADIUS}
                fill="none"
                stroke={hub.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={arcCircum}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${x} ${y})`}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {items.map(({ hub, x, y }) => {
          const isActive = activeHubId === hub.id;
          const left = (x / SIZE) * 100;
          const top = (y / SIZE) * 100;
          return (
            <button
              key={hub.id}
              onClick={() => onSelectHub(hub.id)}
              className="absolute pointer-events-auto group"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
              }}
              aria-label={hub.title}
            >
              <div
                className="rounded-full flex flex-col items-center justify-center transition-all duration-300 will-change-transform"
                style={{
                  width: HUB_SIZE,
                  height: HUB_SIZE,
                  background: `radial-gradient(circle at 30% 30%, white 0%, ${hub.color}33 60%, ${hub.color}55 100%)`,
                  boxShadow: isActive
                    ? `0 0 0 3px white, 0 0 0 5px ${hub.color}, 0 12px 30px -6px ${hub.color}77, inset 0 -4px 8px ${hub.color}22`
                    : `0 6px 20px -4px ${hub.color}55, inset 0 -3px 6px ${hub.color}22, inset 0 2px 4px white`,
                  transform: isActive ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                <Icon
                  name={hub.icon}
                  size={26}
                  className="transition-transform group-hover:scale-110"
                  style={{ color: hub.color }}
                />
                <span
                  className="text-[9px] font-bold tracking-wider mt-0.5 leading-tight text-center px-1"
                  style={{ color: hub.color }}
                >
                  {hub.title.toUpperCase()}
                </span>
              </div>
            </button>
          );
        })}

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center"
          style={{ width: 240, height: 240 }}
        >
          <div className="mb-2">
            <Icon name="Users" size={32} className="text-pink-500 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-wide">НАША СЕМЬЯ</h2>
          <div className="text-2xl font-bold mb-1">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              {stats.overall_progress}%
            </span>
            <span className="text-xs text-slate-500 font-medium ml-1">ГОТОВНОСТЬ</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {stats.active_hubs} АКТИВНЫХ ХАБОВ
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {stats.completed_sections}/{stats.total_sections} РАЗДЕЛОВ
          </div>
        </div>
      </div>
    </div>
  );
}

function CapsuleProgress({
  cx,
  cy,
  angle,
  color,
  progress,
  icon,
  isActive,
}: {
  cx: number;
  cy: number;
  angle: number;
  color: string;
  progress: number;
  icon: string;
  isActive: boolean;
}) {
  const w = 92;
  const h = 28;
  const tangent = angle;
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${tangent})`}
      style={{
        opacity: isActive ? 1 : 0.85,
        transition: 'opacity 0.3s',
      }}
    >
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        ry={h / 2}
        fill="white"
        stroke={`${color}55`}
        strokeWidth="1.5"
        opacity="0.9"
        filter={isActive ? `drop-shadow(0 0 8px ${color}88)` : undefined}
      />
      <rect
        x={-w / 2 + 8}
        y={-2}
        width={w - 16}
        height="4"
        rx="2"
        ry="2"
        fill={`${color}22`}
      />
      <rect
        x={-w / 2 + 8}
        y={-2}
        width={(w - 16) * (progress / 100)}
        height="4"
        rx="2"
        ry="2"
        fill={color}
        style={{ transition: 'width 0.8s ease' }}
      />
      <circle
        cx={-w / 2 + 14}
        cy={-h / 2 + 6}
        r="4"
        fill="white"
        stroke={color}
        strokeWidth="1.5"
      />
      <text
        x={w / 2 - 10}
        y="2"
        fontSize="9"
        fontWeight="700"
        fill={color}
        textAnchor="end"
        transform={tangent > 90 && tangent < 270 ? `rotate(180 ${w / 2 - 10} 0)` : ''}
      >
        {progress}%
      </text>
    </g>
  );
}