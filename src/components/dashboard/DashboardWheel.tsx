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
const HUB_RADIUS = 230;
const HUB_SIZE = 86;
const ARC_RADIUS = HUB_SIZE / 2 + 8;
const CAPSULE_RADIUS = 320;

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

  const overallCircum = 2 * Math.PI * 120;
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
        </defs>

        {[170, 220, 270, 320].map((r) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        ))}

        <circle cx={CENTER} cy={CENTER} r="135" fill="white" opacity="0.95" />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="120"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="6"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r="120"
          fill="none"
          stroke="url(#overallGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={overallCircum}
          strokeDashoffset={overallOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

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
        {items.map(({ hub, cx, cy }) => {
          const left = (cx / SIZE) * 100;
          const top = (cy / SIZE) * 100;
          const isActive = activeHubId === hub.id;
          return (
            <div
              key={`cap-${hub.id}`}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 border backdrop-blur-sm transition-all"
                style={{
                  borderColor: `${hub.color}55`,
                  boxShadow: isActive
                    ? `0 0 12px ${hub.color}66, 0 4px 12px -4px ${hub.color}44`
                    : `0 2px 6px -2px ${hub.color}33`,
                  minWidth: 64,
                }}
              >
                <Icon name={hub.icon} size={11} style={{ color: hub.color }} />
                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${hub.progress}%`,
                      background: hub.color,
                    }}
                  />
                </div>
                <span
                  className="text-[9px] font-bold leading-none"
                  style={{ color: hub.color }}
                >
                  {hub.progress}%
                </span>
              </div>
            </div>
          );
        })}

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
          style={{ width: 220, height: 220, zIndex: 5 }}
        >
          <div className="mb-1.5">
            <Icon name="Users" size={28} className="text-pink-500 mx-auto" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1 tracking-wide">НАША СЕМЬЯ</h2>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              {stats.overall_progress}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium">ГОТОВНОСТЬ</span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium">
            {stats.active_hubs} АКТИВНЫХ ХАБОВ
          </div>
          <div className="text-[10px] text-slate-600 font-medium">
            {stats.completed_sections}/{stats.total_sections} РАЗДЕЛОВ
          </div>
        </div>
      </div>
    </div>
  );
}
