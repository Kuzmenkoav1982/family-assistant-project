import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail, type ModuleStatus } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

const STATUS_FILL: Record<ModuleStatus, { fill: string; hover: string; stroke: string; text: string }> = {
  live: { fill: '#10b981', hover: '#059669', stroke: '#047857', text: '#ffffff' },
  dev: { fill: '#fbbf24', hover: '#f59e0b', stroke: '#d97706', text: '#451a03' },
  planned: { fill: '#e9d5ff', hover: '#d8b4fe', stroke: '#a855f7', text: '#581c87' },
};

interface RingItem {
  id: string;
  name: string;
  icon: string;
  status: ModuleStatus;
  moduleId?: string;
}

interface RingDef {
  label: string;
  labelColor: string;
  rIn: number;
  rOut: number;
  items: RingItem[];
  fontSize: number;
  textMaxLen: number;
}

const CX = 400;
const CY = 400;

const ringFoundation: RingItem[] = [
  { id: 'auth', name: 'Auth', icon: 'Lock', status: 'live' },
  { id: 'pg', name: 'PostgreSQL', icon: 'Database', status: 'live' },
  { id: 'cf', name: 'Functions', icon: 'Cloud', status: 'live' },
  { id: 's3', name: 'S3', icon: 'HardDrive', status: 'live' },
  { id: 'push', name: 'Push', icon: 'Bell', status: 'live' },
  { id: 'pdn', name: '152-ФЗ', icon: 'ShieldCheck', status: 'dev' },
  { id: 'reestr', name: 'Реестр ПО', icon: 'BadgeCheck', status: 'planned' },
  { id: 'analytics', name: 'Аналитика', icon: 'BarChart3', status: 'live' },
];

const ringCore: RingItem[] = [
  { id: 'family-tree', name: 'Древо', icon: 'TreeDeciduous', status: 'live', moduleId: 'family-tree' },
  { id: 'calendar', name: 'Календарь', icon: 'Calendar', status: 'live', moduleId: 'calendar' },
  { id: 'tasks', name: 'Задачи', icon: 'CheckSquare', status: 'live', moduleId: 'tasks' },
  { id: 'budget', name: 'Бюджет', icon: 'Wallet', status: 'live', moduleId: 'budget' },
  { id: 'chat', name: 'Чат', icon: 'MessageCircle', status: 'live', moduleId: 'chat' },
  { id: 'children', name: 'Дети', icon: 'Baby', status: 'live', moduleId: 'children' },
  { id: 'health', name: 'Здоровье', icon: 'HeartPulse', status: 'live', moduleId: 'health' },
  { id: 'docs', name: 'Документы', icon: 'FileText', status: 'live', moduleId: 'documents' },
  { id: 'places', name: 'Места', icon: 'MapPin', status: 'live', moduleId: 'places' },
  { id: 'shop', name: 'Покупки', icon: 'ShoppingCart', status: 'live', moduleId: 'shopping' },
  { id: 'mem', name: 'Воспоминания', icon: 'Image', status: 'live', moduleId: 'memories' },
  { id: 'ai', name: 'AI', icon: 'Sparkles', status: 'dev', moduleId: 'ai-assistant' },
];

const ringStrategy: RingItem[] = [
  { id: 'sn', name: 'Навигатор льгот', icon: 'Compass', status: 'dev', moduleId: 'support-navigator' },
  { id: 'lf', name: 'Многодетная', icon: 'Users', status: 'dev', moduleId: 'large-family' },
  { id: 'pr', name: 'Беременность', icon: 'HeartHandshake', status: 'dev', moduleId: 'pregnancy' },
  { id: 'cm', name: 'Case Manager', icon: 'GitBranch', status: 'planned', moduleId: 'case-manager' },
  { id: 'svo', name: 'Семья СВО', icon: 'Shield', status: 'planned', moduleId: 'svo-family' },
  { id: 'st', name: 'Студ. семья', icon: 'GraduationCap', status: 'planned', moduleId: 'student-family' },
  { id: 'sc', name: 'Соцконтракт', icon: 'FileSignature', status: 'planned', moduleId: 'social-contract' },
  { id: 'zo', name: 'ЗОЖ', icon: 'Activity', status: 'planned', moduleId: 'zog' },
  { id: 'na', name: 'Няни', icon: 'UserCheck', status: 'planned', moduleId: 'nannies' },
  { id: 're', name: 'Прокат', icon: 'Package', status: 'planned', moduleId: 'rental' },
  { id: 'as', name: 'Продлёнка', icon: 'BookOpen', status: 'planned', moduleId: 'after-school' },
  { id: 'me', name: 'Медиация', icon: 'Handshake', status: 'planned', moduleId: 'mediation' },
];

const ringChannels: RingItem[] = [
  { id: 'gosuslugi', name: 'Госуслуги', icon: 'Landmark', status: 'planned' },
  { id: 'soccaz', name: 'Соцказна', icon: 'Database', status: 'planned' },
  { id: 'regis', name: 'Регион. ИС', icon: 'Network', status: 'planned', moduleId: 'region-api' },
  { id: 'tg', name: 'Telegram', icon: 'Send', status: 'dev' },
  { id: 'web', name: 'Web', icon: 'Globe', status: 'live' },
  { id: 'api', name: 'API регионам', icon: 'Code', status: 'planned', moduleId: 'region-api' },
  { id: 'hr', name: 'HR-системы', icon: 'Briefcase', status: 'planned', moduleId: 'b2b2c' },
  { id: 'turism', name: 'Туризм', icon: 'Mountain', status: 'planned', moduleId: 'tourism' },
];

const rings: RingDef[] = [
  {
    label: 'КАНАЛЫ И ИНТЕГРАЦИИ',
    labelColor: '#2563eb',
    rIn: 285,
    rOut: 360,
    items: ringChannels,
    fontSize: 11,
    textMaxLen: 11,
  },
  {
    label: 'СТРАТЕГИЯ 615-р · МОДУЛИ ДО 2036',
    labelColor: '#7c3aed',
    rIn: 215,
    rOut: 280,
    items: ringStrategy,
    fontSize: 10,
    textMaxLen: 11,
  },
  {
    label: 'FAMILY OS · ЯДРО',
    labelColor: '#059669',
    rIn: 145,
    rOut: 210,
    items: ringCore,
    fontSize: 10,
    textMaxLen: 10,
  },
  {
    label: 'ПЛАТФОРМЕННЫЙ ФУНДАМЕНТ',
    labelColor: '#475569',
    rIn: 75,
    rOut: 140,
    items: ringFoundation,
    fontSize: 9,
    textMaxLen: 10,
  },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSectorPath(startAngle: number, endAngle: number, rIn: number, rOut: number) {
  const p1 = polarToCartesian(CX, CY, rOut, endAngle);
  const p2 = polarToCartesian(CX, CY, rOut, startAngle);
  const p3 = polarToCartesian(CX, CY, rIn, startAngle);
  const p4 = polarToCartesian(CX, CY, rIn, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const candidate = (cur + ' ' + w).trim();
    if (candidate.length <= maxLen) {
      cur = candidate;
    } else {
      if (cur) lines.push(cur);
      if (w.length > maxLen) {
        cur = w.slice(0, maxLen - 1) + '…';
      } else {
        cur = w;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

function RingSector({
  item,
  startAngle,
  endAngle,
  rIn,
  rOut,
  fontSize,
  textMaxLen,
  onClick,
}: {
  item: RingItem;
  startAngle: number;
  endAngle: number;
  rIn: number;
  rOut: number;
  fontSize: number;
  textMaxLen: number;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const config = STATUS_FILL[item.status];
  const sectorD = buildSectorPath(startAngle, endAngle, rIn, rOut);
  const isClickable = !!item.moduleId;
  const iconSize = 14;

  const midAngle = (startAngle + endAngle) / 2;
  const midR = (rIn + rOut) / 2;
  const center = polarToCartesian(CX, CY, midR, midAngle);

  let rotation = midAngle - 90;
  if (midAngle > 90 && midAngle < 270) {
    rotation += 180;
  }

  const lines = wrapText(item.name, textMaxLen);
  const iconOffset = -fontSize * (lines.length / 2) - iconSize / 2 - 1;
  const textStartY = iconOffset + iconSize + 3 + fontSize / 2;

  return (
    <g
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => isClickable && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <path
        d={sectorD}
        fill={hover ? config.hover : config.fill}
        stroke={config.stroke}
        strokeWidth={1.5}
        style={{ transition: 'fill 0.2s' }}
      />

      <g
        transform={`translate(${center.x}, ${center.y}) rotate(${rotation})`}
        style={{ pointerEvents: 'none' }}
      >
        <foreignObject x={-iconSize / 2} y={iconOffset} width={iconSize} height={iconSize}>
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
            <Icon name={item.icon} size={iconSize - 2} />
          </div>
        </foreignObject>

        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight={600}
          fill={config.text}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {lines.map((line, i) => (
            <tspan key={i} x="0" y={textStartY + i * fontSize * 1.05}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    </g>
  );
}

export function CircularArchitecture() {
  const [selected, setSelected] = useState<ModuleDetail | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (moduleId?: string) => {
    if (!moduleId) return;
    const module = MODULES[moduleId];
    if (module) {
      setSelected(module);
      setOpen(true);
    }
  };

  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full mb-3">
          <Icon name="Layers" size={14} className="text-gray-700" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Архитектура</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Круговая карта платформы</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          От ядра наружу: фундамент → Family OS → стратегические модули по 615-р → каналы и интеграции
        </p>
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-gray-700">Уже работает</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs font-medium text-gray-700">В разработке</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-300" />
          <span className="text-xs font-medium text-gray-700">План по 615-р</span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 800 800"
          className="w-full max-w-[700px] h-auto"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.1))' }}
        >
          {rings.map((ring, ringIdx) => {
            const step = 360 / ring.items.length;
            return (
              <g key={ringIdx}>
                {ring.items.map((item, i) => {
                  const start = i * step;
                  const end = start + step;
                  return (
                    <RingSector
                      key={item.id}
                      item={item}
                      startAngle={start}
                      endAngle={end}
                      rIn={ring.rIn}
                      rOut={ring.rOut}
                      fontSize={ring.fontSize}
                      textMaxLen={ring.textMaxLen}
                      onClick={() => handleClick(item.moduleId)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Center logo */}
          <circle cx={CX} cy={CY} r={70} fill="url(#archGrad)" />
          <defs>
            <linearGradient id="archGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <foreignObject x={CX - 70} y={CY - 70} width={140} height={140}>
            <div
              style={{
                width: 140,
                height: 140,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Icon name="Heart" size={24} className="text-white mb-0.5" />
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>Наша Семья</div>
              <div style={{ fontSize: 8, opacity: 0.9, marginTop: 4 }}>Family OS</div>
            </div>
          </foreignObject>

          {/* Метки колец сверху */}
          {rings.map((r, i) => (
            <text
              key={i}
              x={CX}
              y={CY - r.rOut - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill={r.labelColor}
              fontFamily="system-ui"
              letterSpacing="1.2"
            >
              {r.label}
            </text>
          ))}
        </svg>
      </div>

      <p className="text-[11px] text-purple-600 text-center mt-3 font-medium flex items-center justify-center gap-1">
        <Icon name="MousePointerClick" size={11} />
        Кликните на модуль — раскроется цитата из Стратегии и привязка к KPI
      </p>

      {/* Итоговые цифры */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">11</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">модулей живых</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">5</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">в разработке</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">15+</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">в плане по 615-р</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 2 · Круговая архитектура · 4 кольца от ядра до интеграций · Версия 2.3
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default CircularArchitecture;
