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
const HUB_RADIUS = 240;
const HUB_SIZE = 84;
const ARC_RADIUS = HUB_SIZE / 2 + 6;
const CAPSULE_RADIUS = 332;

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
          const isComplete = hub.progress === 100;
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
                className="relative rounded-full flex flex-col items-center justify-center transition-all duration-300 will-change-transform"
                style={{
                  width: HUB_SIZE,
                  height: HUB_SIZE,
                  background: `
                    radial-gradient(circle at 32% 22%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 22%, transparent 45%),
                    radial-gradient(circle at 70% 80%, ${hub.color} 0%, ${hub.color}aa 60%, ${hub.color}55 100%),
                    radial-gradient(circle at 50% 50%, ${hub.color}aa 0%, ${hub.color} 100%)
                  `,
                  boxShadow: isActive
                    ? `0 0 0 2px white, 0 0 0 3.5px ${hub.color}, 0 14px 30px -6px ${hub.color}cc, 0 4px 10px -3px ${hub.color}99, inset 0 -7px 12px ${hub.color}, inset 0 4px 8px rgba(255,255,255,0.7), inset 0 0 16px rgba(255,255,255,0.2)`
                    : `0 12px 28px -6px ${hub.color}aa, 0 4px 10px -3px ${hub.color}88, inset 0 -7px 12px ${hub.color}cc, inset 0 4px 8px rgba(255,255,255,0.65), inset 0 0 14px rgba(255,255,255,0.2)`,
                  transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  animation: isActive
                    ? 'hubBreath 2.5s ease-in-out infinite'
                    : undefined,
                }}
              >
                <Icon
                  name={hub.icon}
                  size={22}
                  className="transition-transform group-hover:scale-110"
                  style={{
                    color: 'white',
                    filter: `drop-shadow(0 1px 2px ${hub.color}) drop-shadow(0 0 4px ${hub.color}88)`,
                    strokeWidth: 2.5,
                  }}
                />
                <span
                  className="text-[8px] font-extrabold tracking-wider mt-0.5 leading-tight text-center px-1"
                  style={{
                    color: 'white',
                    textShadow: `0 1px 2px ${hub.color}, 0 0 6px ${hub.color}cc`,
                  }}
                >
                  {hub.title.toUpperCase()}
                </span>

                {isComplete && (
                  <div
                    className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      boxShadow: '0 4px 12px rgba(251,191,36,0.6), inset 0 1px 2px rgba(255,255,255,0.6)',
                      animation: 'achievePop 0.6s cubic-bezier(0.68,-0.55,0.265,1.55)',
                    }}
                  >
                    <Icon name="Star" size={14} className="text-white fill-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center"
          style={{
            width: '36%',
            height: '36%',
            zIndex: 5,
            animation: 'centerBreath 4s ease-in-out infinite',
          }}
        >
          <h2
            className="font-bold text-slate-800 leading-tight"
            style={{ fontSize: 'clamp(13px, 3.5vw, 20px)', marginBottom: '2%' }}
          >
            Наша Семья
          </h2>
          <div className="flex items-baseline justify-center gap-1 leading-none">
            <span
              className="font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"
              style={{ fontSize: 'clamp(16px, 4.5vw, 26px)' }}
            >
              {stats.overall_progress}%
            </span>
            <span
              className="text-slate-500 font-medium"
              style={{ fontSize: 'clamp(8px, 1.8vw, 11px)' }}
            >
              готовность
            </span>
          </div>
          <div
            className="text-slate-600 font-medium tracking-wide leading-tight mt-1"
            style={{ fontSize: 'clamp(8px, 1.8vw, 11px)' }}
          >
            <span className="font-bold text-slate-800">{stats.active_hubs}</span> АКТИВНЫХ ХАБОВ
          </div>
          <div
            className="text-slate-600 font-medium tracking-wide leading-tight"
            style={{ fontSize: 'clamp(8px, 1.8vw, 11px)' }}
          >
            <span className="font-bold text-slate-800">
              {stats.completed_sections}/{stats.total_sections}
            </span>{' '}
            РАЗДЕЛОВ
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hubBreath {
          0%, 100% { transform: scale(1.12); }
          50% { transform: scale(1.16); }
        }
        @keyframes centerBreath {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.025); }
        }
        @keyframes achievePop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(20deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
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