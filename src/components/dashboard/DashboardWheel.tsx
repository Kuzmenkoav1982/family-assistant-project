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
const HUB_RADIUS = 235;
const HUB_SIZE = 96;
const ARC_RADIUS = HUB_SIZE / 2 + 6;
const CAPSULE_RADIUS = 318;

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
          <linearGradient id="overallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[170, 230, 290, 340].map((r) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="#cbd5e1"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        ))}

        <circle cx={CENTER} cy={CENTER} r="145" fill="white" filter="url(#softShadow)" />
        <circle cx={CENTER} cy={CENTER} r="138" fill="white" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="130"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="6"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="130"
          fill="none"
          stroke="url(#overallGrad)"
          strokeWidth="6"
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
          const arcCircum = 2 * Math.PI * ARC_RADIUS;
          const offset = arcCircum * (1 - hub.progress / 100);
          return (
            <g key={`arc-${hub.id}`}>
              <circle
                cx={x}
                cy={y}
                r={ARC_RADIUS}
                fill="none"
                stroke={`${hub.color}1a`}
                strokeWidth="2.5"
              />
              <circle
                cx={x}
                cy={y}
                r={ARC_RADIUS}
                fill="none"
                stroke={hub.color}
                strokeWidth="2.5"
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
                zIndex: isActive ? 20 : 10,
              }}
              aria-label={hub.title}
            >
              <div
                className="rounded-full flex flex-col items-center justify-center transition-all duration-300 will-change-transform"
                style={{
                  width: HUB_SIZE,
                  height: HUB_SIZE,
                  background: `radial-gradient(circle at 30% 25%, white 0%, ${hub.color}22 45%, ${hub.color}55 100%)`,
                  boxShadow: isActive
                    ? `0 0 0 3px white, 0 0 0 5px ${hub.color}, 0 14px 32px -6px ${hub.color}88, inset 0 -6px 12px ${hub.color}33, inset 0 3px 6px rgba(255,255,255,0.9)`
                    : `0 8px 22px -5px ${hub.color}55, inset 0 -5px 10px ${hub.color}22, inset 0 3px 6px rgba(255,255,255,0.9)`,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <Icon
                  name={hub.icon}
                  size={28}
                  className="transition-transform group-hover:scale-110 drop-shadow-sm"
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
          style={{ width: 230, height: 230, zIndex: 5 }}
        >
          <div className="mb-1.5">
            <Icon name="Users" size={32} className="text-pink-500 mx-auto drop-shadow-sm" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1.5">Наша Семья</h2>
          <div className="flex items-baseline justify-center gap-1 mb-0.5">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              {stats.overall_progress}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              готовность
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            <span className="text-slate-700 font-semibold">{stats.active_hubs}</span> активных хабов
          </div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            <span className="text-slate-700 font-semibold">
              {stats.completed_sections}/{stats.total_sections}
            </span>{' '}
            разделов
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
  const w = 110;
  const h = 26;
  const isBottom = angle > 90 && angle < 270;
  const tangent = isBottom ? angle + 180 : angle;

  const iconX = -w / 2 + 13;
  const percentX = w / 2 - 13;
  const barX = -w / 2 + 26;
  const barW = w - 52;

  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${tangent})`}
      style={{
        opacity: isActive ? 1 : 0.95,
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
        stroke={`${color}66`}
        strokeWidth="1.5"
        opacity="0.95"
        filter={
          isActive ? `drop-shadow(0 0 10px ${color}99)` : `drop-shadow(0 2px 4px ${color}22)`
        }
      />

      <circle cx={iconX} cy="0" r="7" fill={`${color}1a`} />
      <foreignObject x={iconX - 6} y={-6} width="12" height="12">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 12,
            height: 12,
          }}
        >
          <Icon name={icon} size={10} style={{ color }} />
        </div>
      </foreignObject>

      <rect
        x={barX}
        y="-2.5"
        width={barW}
        height="5"
        rx="2.5"
        ry="2.5"
        fill={`${color}1a`}
      />
      <rect
        x={barX}
        y="-2.5"
        width={barW * (progress / 100)}
        height="5"
        rx="2.5"
        ry="2.5"
        fill={color}
        style={{ transition: 'width 0.7s ease' }}
      />

      <text
        x={percentX}
        y="3.5"
        fontSize="9.5"
        fontWeight="700"
        fill={color}
        textAnchor="middle"
      >
        {progress}%
      </text>
    </g>
  );
}