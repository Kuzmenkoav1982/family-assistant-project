import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail, type ModuleStatus } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';
import { VALUES_809, VALUES_ORDER, type ValueDetail } from './values809Data';

// Светофор для статусов модулей (как в существующих колёсах)
const STATUS_FILL: Record<
  ModuleStatus,
  { gradId: string; hoverGradId: string; stroke: string; text: string }
> = {
  live: { gradId: 'matLive', hoverGradId: 'matLiveHover', stroke: '#047857', text: '#ffffff' },
  dev: { gradId: 'matDev', hoverGradId: 'matDevHover', stroke: '#b45309', text: '#3a1d03' },
  planned: { gradId: 'matPlanned', hoverGradId: 'matPlannedHover', stroke: '#b91c1c', text: '#ffffff' },
};

// Цвет ячеек центра (ценности 809) — багровый/золотой
const VALUE_FILL = {
  gradId: 'matValue',
  hoverGradId: 'matValueHover',
  stroke: '#7c2d12',
  text: '#ffffff',
};

interface RingItem {
  name: string;
  icon: string;
  status: ModuleStatus;
  moduleId?: string;
}

interface RingDef {
  label: string;
  sublabel?: string;
  labelColor: string;
  rIn: number;
  rOut: number;
  items: RingItem[];
  fontSize: number;
  iconSize: number;
  maxLen: number;
}

// viewBox больше старых, чтобы поместилось 4 кольца + центр + подписи слоёв
const VB_W = 1200;
const VB_H = 1000;
const CX = VB_W / 2;
const CY = VB_H / 2;

// ============ КОЛЬЦО 2 — ЯДРО (8 модулей, оставляем только то что REAL и связано с гос-повесткой) ============
const ringCore: RingItem[] = [
  { name: 'Древо', icon: 'TreeDeciduous', status: 'live', moduleId: 'family-tree' },
  { name: 'Дети', icon: 'Baby', status: 'live', moduleId: 'children' },
  { name: 'Здоровье', icon: 'HeartPulse', status: 'live', moduleId: 'health' },
  { name: 'Бюджет', icon: 'Wallet', status: 'live', moduleId: 'budget' },
  { name: 'Календарь', icon: 'Calendar', status: 'live', moduleId: 'calendar' },
  { name: 'Задачи', icon: 'CheckSquare', status: 'live', moduleId: 'tasks' },
  { name: 'Места', icon: 'MapPin', status: 'live', moduleId: 'places' },
  { name: 'AI', icon: 'Sparkles', status: 'live', moduleId: 'ai-assistant' },
];

// ============ КОЛЬЦО 3 — СТРАТЕГИЯ 615-р (12 ячеек) ============
// СВО — одна из ячеек, не в центре (по согласованию с экспертом)
const ringStrategy: RingItem[] = [
  { name: 'Навигатор льгот', icon: 'Compass', status: 'dev', moduleId: 'support-navigator' },
  { name: 'Многодетная', icon: 'Users', status: 'dev', moduleId: 'large-family' },
  { name: 'Беременность', icon: 'HeartHandshake', status: 'dev', moduleId: 'pregnancy' },
  { name: 'Кейс-менеджер', icon: 'GitBranch', status: 'planned', moduleId: 'case-manager' },
  { name: 'Семья СВО', icon: 'Shield', status: 'planned', moduleId: 'svo-family' },
  { name: 'Студ. семья', icon: 'GraduationCap', status: 'planned', moduleId: 'student-family' },
  { name: 'Соцконтракт', icon: 'FileSignature', status: 'planned', moduleId: 'social-contract' },
  { name: 'ЗОЖ', icon: 'Activity', status: 'planned', moduleId: 'zog' },
  { name: 'Няни', icon: 'UserCheck', status: 'planned', moduleId: 'nannies' },
  { name: 'Прокат', icon: 'Package', status: 'planned', moduleId: 'rental' },
  { name: 'Продлёнка', icon: 'BookOpen', status: 'planned', moduleId: 'after-school' },
  { name: 'Медиация', icon: 'Handshake', status: 'planned', moduleId: 'mediation' },
];

// ============ КОЛЬЦО 4 — КАНАЛЫ ГОСУДАРСТВА (8) ============
const ringChannels: RingItem[] = [
  { name: 'Госуслуги', icon: 'Landmark', status: 'planned' },
  { name: 'Соцказна', icon: 'Database', status: 'planned' },
  { name: 'Регион. ИС', icon: 'Network', status: 'planned', moduleId: 'region-api' },
  { name: 'МАХ', icon: 'Send', status: 'live' },
  { name: 'Web', icon: 'Globe', status: 'live' },
  { name: 'API регионам', icon: 'Code', status: 'planned', moduleId: 'region-api' },
  { name: 'HR / B2B2C', icon: 'Briefcase', status: 'planned', moduleId: 'b2b2c' },
  { name: 'Реестр ПО', icon: 'BadgeCheck', status: 'dev' },
];

const rings: RingDef[] = [
  {
    label: 'КАНАЛЫ ГОСУДАРСТВА',
    sublabel: 'Дистрибуция и интеграции',
    labelColor: '#1e3a8a',
    rIn: 295,
    rOut: 360,
    items: ringChannels,
    fontSize: 11,
    iconSize: 16,
    maxLen: 12,
  },
  {
    label: 'СТРАТЕГИЯ 615-р',
    sublabel: 'Прикладные сервисы до 2036',
    labelColor: '#ea580c',
    rIn: 220,
    rOut: 290,
    items: ringStrategy,
    fontSize: 10,
    iconSize: 14,
    maxLen: 11,
  },
  {
    label: 'ЯДРО · НАША СЕМЬЯ',
    sublabel: 'Уже работает',
    labelColor: '#059669',
    rIn: 145,
    rOut: 215,
    items: ringCore,
    fontSize: 11,
    iconSize: 16,
    maxLen: 11,
  },
];

interface SegmentDef {
  item: RingItem;
  d: string;
  iconX: number;
  iconY: number;
  textX: number;
  textY: number;
  deg: number;
}

function buildRing(items: RingItem[], rIn: number, rOut: number): SegmentDef[] {
  const total = items.length;
  const gap = 0.012;
  const iconRadius = rIn + (rOut - rIn) * 0.32;
  const textRadius = rIn + (rOut - rIn) * 0.7;

  return items.map((item, i) => {
    const startAngle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = CX + rOut * Math.cos(startAngle + gap);
    const y1 = CY + rOut * Math.sin(startAngle + gap);
    const x2 = CX + rOut * Math.cos(endAngle - gap);
    const y2 = CY + rOut * Math.sin(endAngle - gap);
    const x3 = CX + rIn * Math.cos(endAngle - gap);
    const y3 = CY + rIn * Math.sin(endAngle - gap);
    const x4 = CX + rIn * Math.cos(startAngle + gap);
    const y4 = CY + rIn * Math.sin(startAngle + gap);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const midAngle = (startAngle + endAngle) / 2;
    const iconX = CX + iconRadius * Math.cos(midAngle);
    const iconY = CY + iconRadius * Math.sin(midAngle);
    const textX = CX + textRadius * Math.cos(midAngle);
    const textY = CY + textRadius * Math.sin(midAngle);

    let deg = (midAngle * 180) / Math.PI + 90;
    if (deg > 90 && deg < 270) deg += 180;

    return { item, d, iconX, iconY, textX, textY, deg };
  });
}

// Строим центр со ценностями (7 сегментов вокруг логотипа-сердцевины)
interface ValueSegmentDef {
  value: ValueDetail;
  d: string;
  iconX: number;
  iconY: number;
  textX: number;
  textY: number;
  deg: number;
}

const VALUES_R_IN = 60;
const VALUES_R_OUT = 138;

function buildValuesRing(): ValueSegmentDef[] {
  const total = VALUES_ORDER.length;
  const gap = 0.014;
  const iconRadius = VALUES_R_IN + (VALUES_R_OUT - VALUES_R_IN) * 0.35;
  const textRadius = VALUES_R_IN + (VALUES_R_OUT - VALUES_R_IN) * 0.72;

  return VALUES_ORDER.map((id, i) => {
    const value = VALUES_809[id];
    const startAngle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = CX + VALUES_R_OUT * Math.cos(startAngle + gap);
    const y1 = CY + VALUES_R_OUT * Math.sin(startAngle + gap);
    const x2 = CX + VALUES_R_OUT * Math.cos(endAngle - gap);
    const y2 = CY + VALUES_R_OUT * Math.sin(endAngle - gap);
    const x3 = CX + VALUES_R_IN * Math.cos(endAngle - gap);
    const y3 = CY + VALUES_R_IN * Math.sin(endAngle - gap);
    const x4 = CX + VALUES_R_IN * Math.cos(startAngle + gap);
    const y4 = CY + VALUES_R_IN * Math.sin(startAngle + gap);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${VALUES_R_OUT} ${VALUES_R_OUT} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${VALUES_R_IN} ${VALUES_R_IN} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const midAngle = (startAngle + endAngle) / 2;
    const iconX = CX + iconRadius * Math.cos(midAngle);
    const iconY = CY + iconRadius * Math.sin(midAngle);
    const textX = CX + textRadius * Math.cos(midAngle);
    const textY = CY + textRadius * Math.sin(midAngle);

    let deg = (midAngle * 180) / Math.PI + 90;
    if (deg > 90 && deg < 270) deg += 180;

    return { value, d, iconX, iconY, textX, textY, deg };
  });
}

// Перенос названий
function wrapName(name: string, maxLen: number): string[] {
  const MAX_LINES = 4;
  const HARD_LIMIT = maxLen + 4;
  const words = name.split(' ');

  const tokens: string[] = [];
  for (const w of words) {
    if (w.length <= HARD_LIMIT) {
      tokens.push(w);
    } else if (w.includes('-')) {
      const parts = w.split('-');
      let acc = '';
      for (let i = 0; i < parts.length; i++) {
        const piece = parts[i] + (i < parts.length - 1 ? '-' : '');
        if ((acc + piece).length <= HARD_LIMIT) {
          acc += piece;
        } else {
          if (acc) tokens.push(acc);
          acc = piece;
        }
      }
      if (acc) tokens.push(acc);
    } else {
      for (let i = 0; i < w.length; i += maxLen) {
        tokens.push(w.slice(i, i + maxLen));
      }
    }
  }

  const lines: string[] = [];
  let cur = '';
  for (const t of tokens) {
    if (!cur) cur = t;
    else if ((cur + ' ' + t).length <= maxLen) cur += ' ' + t;
    else {
      lines.push(cur);
      cur = t;
    }
  }
  if (cur) lines.push(cur);

  if (lines.length > MAX_LINES) {
    const last = lines.slice(MAX_LINES - 1).join(' ');
    lines.length = MAX_LINES - 1;
    lines.push(last.length > maxLen ? last.slice(0, maxLen - 1) + '…' : last);
  }
  return lines;
}

function Segment({
  seg,
  iconSize,
  fontSize,
  maxLen,
  onClick,
}: {
  seg: SegmentDef;
  iconSize: number;
  fontSize: number;
  maxLen: number;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const config = STATUS_FILL[seg.item.status];
  const isClickable = !!seg.item.moduleId;

  const lines = wrapName(seg.item.name, maxLen);
  const lineHeight = fontSize * 1.05;
  const totalHeight = lines.length * lineHeight;
  const startY = seg.textY - totalHeight / 2 + lineHeight / 2;

  return (
    <g
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => isClickable && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <path
        d={seg.d}
        fill={`url(#${hover ? config.hoverGradId : config.gradId})`}
        stroke={config.stroke}
        strokeWidth={1.2}
        opacity={0.92}
        style={{ transition: 'opacity 0.2s', filter: 'url(#matCell3d)' }}
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
          <Icon name={seg.item.icon} size={iconSize - 2} />
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

function ValueSegment({ seg, onClick }: { seg: ValueSegmentDef; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const lines = wrapName(seg.value.shortName, 10);
  const fontSize = 10;
  const iconSize = 16;
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
        fill={`url(#${hover ? VALUE_FILL.hoverGradId : VALUE_FILL.gradId})`}
        stroke={VALUE_FILL.stroke}
        strokeWidth={1.2}
        opacity={0.95}
        style={{ transition: 'opacity 0.2s', filter: 'url(#matCell3d)' }}
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
            color: VALUE_FILL.text,
          }}
        >
          <Icon name={seg.value.icon} size={iconSize - 2} />
        </div>
      </foreignObject>

      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight={700}
        fill={VALUE_FILL.text}
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

interface LayerLabelProps {
  label: string;
  sublabel?: string;
  color: string;
  ringROut: number;
  side: 'left' | 'right';
  labelX: number;
  labelY: number;
}

/**
 * Выноска идёт через ось 0°/180° (горизонтально), чтобы попадать в зазор между ячейками
 * и не пересекать названия модулей.
 *  - точка-якорь на контуре rOut по горизонтали (право или лево)
 *  - короткий радиальный отрезок наружу (горизонтально)
 *  - L-изгиб: вертикальная полка вверх/вниз до уровня подписи
 *  - короткая горизонтальная подводка к самому тексту
 */
function LayerLabel({ label, sublabel, color, ringROut, side, labelX, labelY }: LayerLabelProps) {
  const isRight = side === 'right';
  const dir = isRight ? 1 : -1;

  // Точка-якорь строго на горизонтали (0° или 180°) — гарантированно зазор между ячейками
  const ax = CX + dir * ringROut;
  const ay = CY;

  // Короткий радиальный отрезок наружу
  const radialOut = 28;
  const bx = ax + dir * radialOut;
  const by = CY;

  // Вертикальная полка до уровня подписи
  // Затем короткая горизонтальная подводка к тексту
  const bendX = bx;
  const bendY = labelY;

  return (
    <g>
      {/* Горизонтальная "иголка" от контура наружу */}
      <path
        d={`M ${ax} ${ay} L ${bx} ${by}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Вертикальная полка */}
      <path
        d={`M ${bx} ${by} L ${bendX} ${bendY}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Горизонтальная подводка к тексту */}
      <path
        d={`M ${bendX} ${bendY} L ${labelX} ${labelY}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Якорь на контуре */}
      <circle cx={ax} cy={ay} r={4.5} fill="white" stroke={color} strokeWidth={2.5} />

      <text
        x={labelX + dir * 8}
        y={labelY - (sublabel ? 4 : 0)}
        textAnchor={isRight ? 'start' : 'end'}
        fontSize={15}
        fontWeight={800}
        fill={color}
        fontFamily="system-ui"
        letterSpacing={0.5}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={labelX + dir * 8}
          y={labelY + 14}
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

export function CircularMatryoshka() {
  const [selected, setSelected] = useState<ModuleDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<ValueDetail | null>(null);
  const [valueOpen, setValueOpen] = useState(false);

  const handleModuleClick = (moduleId?: string) => {
    if (!moduleId) return;
    const m = MODULES[moduleId];
    if (m) {
      setSelected(m);
      setOpen(true);
    }
  };

  const handleValueClick = (value: ValueDetail) => {
    setSelectedValue(value);
    setValueOpen(true);
  };

  const valueSegs = buildValuesRing();

  // Подписи слоёв слева/справа.
  // Подвинуты ближе к матрёшке, чтобы длинные подписи не уходили за viewBox.
  // Все выноски идут через горизонтальную ось (0°/180°) — там зазор между ячейками,
  // поэтому полка не пересекает названия модулей.
  // labelY разносим по высоте, чтобы 4 подписи не накладывались друг на друга.
  const leftX = CX - 380;
  const rightX = CX + 380;
  const labels = [
    // Слева сверху вниз: ЯДРО, ЦЕННОСТИ
    { ring: rings[2], side: 'left' as const, labelX: leftX, labelY: CY - 80 },
    // ЦЕННОСТИ — отдельной записью ниже
    // Справа сверху вниз: КАНАЛЫ, СТРАТЕГИЯ
    { ring: rings[0], side: 'right' as const, labelX: rightX, labelY: CY - 80 },
    { ring: rings[1], side: 'right' as const, labelX: rightX, labelY: CY + 80 },
  ];

  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl my-6 overflow-hidden border border-gray-200 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-200">
          <Icon name="Crown" size={14} className="text-amber-700" />
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Ценностная матрёшка
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          От ценностей — к каналам государства
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-3xl mx-auto">
          В центре — традиционные ценности по Указу № 809. Вокруг — наше работающее ядро,
          прикладные сервисы Стратегии 615-р и каналы дистрибуции.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #fde68a, #d97706 60%, #7c2d12)',
            }}
          />
          <span className="text-xs font-medium text-gray-700">Ценности 809</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #6ee7b7, #10b981 60%, #047857)',
            }}
          />
          <span className="text-xs font-medium text-gray-700">Уже работает</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #fef08a, #facc15 60%, #ca8a04)',
            }}
          />
          <span className="text-xs font-medium text-gray-700">В разработке</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #fca5a5, #ef4444 60%, #991b1b)',
            }}
          />
          <span className="text-xs font-medium text-gray-700">План по 615-р</span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full max-w-[1200px] h-auto"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.08))' }}
        >
          <defs>
            {/* Градиенты статусов */}
            <radialGradient id="matLive" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
            <radialGradient id="matLiveHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>

            <radialGradient id="matDev" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
            <radialGradient id="matDevHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>

            <radialGradient id="matPlanned" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <radialGradient id="matPlannedHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="55%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>

            {/* Градиент для центральных ценностей — багровый/золотой */}
            <radialGradient id="matValue" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="40%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>
            <radialGradient id="matValueHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>

            <filter id="matCell3d" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>

            <clipPath id="matLogoClip">
              <circle cx={CX} cy={CY} r={55} />
            </clipPath>
            <filter id="matLogoShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="5"
                floodColor="#7c2d12"
                floodOpacity="0.45"
              />
            </filter>
          </defs>

          {/* Ценности — внутреннее кольцо вокруг логотипа */}
          <g>
            {valueSegs.map((seg, i) => (
              <ValueSegment key={`v-${i}`} seg={seg} onClick={() => handleValueClick(seg.value)} />
            ))}
          </g>

          {/* Кольца модулей */}
          {rings.map((ring, ringIdx) => {
            const segs = buildRing(ring.items, ring.rIn, ring.rOut);
            return (
              <g key={ringIdx}>
                {segs.map((seg, i) => (
                  <Segment
                    key={`r${ringIdx}-${i}`}
                    seg={seg}
                    iconSize={ring.iconSize}
                    fontSize={ring.fontSize}
                    maxLen={ring.maxLen}
                    onClick={() => handleModuleClick(seg.item.moduleId)}
                  />
                ))}
              </g>
            );
          })}

          {/* Белые "прокладки" между кольцами */}
          <circle cx={CX} cy={CY} r={VALUES_R_IN} fill="none" stroke="#ffffff" strokeWidth={4} />
          <circle cx={CX} cy={CY} r={VALUES_R_OUT} fill="none" stroke="#ffffff" strokeWidth={4} />
          {rings.map((ring, idx) => (
            <g key={`gap-${idx}`}>
              <circle cx={CX} cy={CY} r={ring.rIn} fill="none" stroke="#ffffff" strokeWidth={4} />
              <circle cx={CX} cy={CY} r={ring.rOut} fill="none" stroke="#ffffff" strokeWidth={4} />
            </g>
          ))}

          {/* Цветные контуры слоёв */}
          <circle
            cx={CX}
            cy={CY}
            r={VALUES_R_OUT}
            fill="none"
            stroke="#7c2d12"
            strokeWidth={2}
          />
          {rings.map((ring, idx) => (
            <g key={`b-${idx}`}>
              <circle
                cx={CX}
                cy={CY}
                r={ring.rIn}
                fill="none"
                stroke={ring.labelColor}
                strokeWidth={2}
              />
              <circle
                cx={CX}
                cy={CY}
                r={ring.rOut}
                fill="none"
                stroke={ring.labelColor}
                strokeWidth={2}
              />
            </g>
          ))}

          {labels.map((l, i) => (
            <LayerLabel
              key={i}
              label={l.ring.label}
              sublabel={l.ring.sublabel}
              color={l.ring.labelColor}
              ringROut={l.ring.rOut}
              side={l.side}
              labelX={l.labelX}
              labelY={l.labelY}
            />
          ))}

          {/* Подпись слоя ценностей — слева, ниже подписи ЯДРА */}
          <LayerLabel
            label="ЦЕННОСТИ · УКАЗ № 809"
            sublabel="Сердце продукта"
            color="#7c2d12"
            ringROut={VALUES_R_OUT}
            side="left"
            labelX={leftX}
            labelY={CY + 80}
          />

          {/* Логотип в центре — сердцевина */}
          <g filter="url(#matLogoShadow)">
            <circle cx={CX} cy={CY} r={55} fill="#fff" />
            <image
              href="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/1b0ac6ec-2228-436a-822c-157151c6c28f.jpeg"
              x={CX - 55}
              y={CY - 55}
              width={110}
              height={110}
              clipPath="url(#matLogoClip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={CX} cy={CY} r={55} fill="none" stroke="#7c2d12" strokeWidth={2.5} />
          </g>
        </svg>
      </div>

      <p className="text-[11px] text-purple-600 text-center mt-3 font-medium flex items-center justify-center gap-1">
        <Icon name="MousePointerClick" size={11} />
        Кликните на любую ячейку — раскроется описание ценности или модуля
      </p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">7</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">ценностей 809</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">8</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">модулей живые</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">12</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">сервисов 615-р</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">8</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">каналов государства</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Ценностная матрёшка · Указ № 809 → Стратегия 615-р → Продукт «Наша Семья»
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />

      {/* Диалог для ценности */}
      {selectedValue && valueOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setValueOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-800 p-6 rounded-t-2xl text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 backdrop-blur p-2 rounded-xl">
                  <Icon name={selectedValue.icon} size={28} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-100">
                    Ценность
                  </p>
                  <h3 className="text-xl font-bold">{selectedValue.name}</h3>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedValue.description}
              </p>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Какие модули реализуют эту ценность
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedValue.productMatch.map((m) => (
                    <span
                      key={m}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                  Источник
                </p>
                <p className="text-xs text-amber-900 italic">{selectedValue.citation}</p>
              </div>
              <button
                onClick={() => setValueOpen(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-xl transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CircularMatryoshka;