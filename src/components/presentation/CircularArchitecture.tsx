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

const VB = 760;
const CX = VB / 2;
const CY = VB / 2;

const ringFoundation: RingItem[] = [
  { name: 'Auth', icon: 'Lock', status: 'live' },
  { name: 'PostgreSQL', icon: 'Database', status: 'live' },
  { name: 'Functions', icon: 'Cloud', status: 'live' },
  { name: 'S3', icon: 'HardDrive', status: 'live' },
  { name: 'Push', icon: 'Bell', status: 'live' },
  { name: '152-ФЗ', icon: 'ShieldCheck', status: 'dev' },
  { name: 'Реестр ПО', icon: 'BadgeCheck', status: 'planned' },
  { name: 'Аналитика', icon: 'BarChart3', status: 'live' },
];

const ringCore: RingItem[] = [
  { name: 'Древо', icon: 'TreeDeciduous', status: 'live', moduleId: 'family-tree' },
  { name: 'Календарь', icon: 'Calendar', status: 'live', moduleId: 'calendar' },
  { name: 'Задачи', icon: 'CheckSquare', status: 'live', moduleId: 'tasks' },
  { name: 'Бюджет', icon: 'Wallet', status: 'live', moduleId: 'budget' },
  { name: 'Чат', icon: 'MessageCircle', status: 'live', moduleId: 'chat' },
  { name: 'Дети', icon: 'Baby', status: 'live', moduleId: 'children' },
  { name: 'Здоровье', icon: 'HeartPulse', status: 'live', moduleId: 'health' },
  { name: 'Документы', icon: 'FileText', status: 'live', moduleId: 'documents' },
  { name: 'Места', icon: 'MapPin', status: 'live', moduleId: 'places' },
  { name: 'Покупки', icon: 'ShoppingCart', status: 'live', moduleId: 'shopping' },
  { name: 'Альбом', icon: 'Image', status: 'live', moduleId: 'memories' },
  { name: 'AI', icon: 'Sparkles', status: 'dev', moduleId: 'ai-assistant' },
];

const ringStrategy: RingItem[] = [
  { name: 'Навигатор льгот', icon: 'Compass', status: 'dev', moduleId: 'support-navigator' },
  { name: 'Многодетная', icon: 'Users', status: 'dev', moduleId: 'large-family' },
  { name: 'Беременность', icon: 'HeartHandshake', status: 'dev', moduleId: 'pregnancy' },
  { name: 'Case Manager', icon: 'GitBranch', status: 'planned', moduleId: 'case-manager' },
  { name: 'Семья СВО', icon: 'Shield', status: 'planned', moduleId: 'svo-family' },
  { name: 'Студ. семья', icon: 'GraduationCap', status: 'planned', moduleId: 'student-family' },
  { name: 'Соцконтракт', icon: 'FileSignature', status: 'planned', moduleId: 'social-contract' },
  { name: 'ЗОЖ', icon: 'Activity', status: 'planned', moduleId: 'zog' },
  { name: 'Няни', icon: 'UserCheck', status: 'planned', moduleId: 'nannies' },
  { name: 'Прокат', icon: 'Package', status: 'planned', moduleId: 'rental' },
  { name: 'Продлёнка', icon: 'BookOpen', status: 'planned', moduleId: 'after-school' },
  { name: 'Медиация', icon: 'Handshake', status: 'planned', moduleId: 'mediation' },
];

const ringChannels: RingItem[] = [
  { name: 'Госуслуги', icon: 'Landmark', status: 'planned' },
  { name: 'Соцказна', icon: 'Database', status: 'planned' },
  { name: 'Регион. ИС', icon: 'Network', status: 'planned', moduleId: 'region-api' },
  { name: 'Telegram', icon: 'Send', status: 'dev' },
  { name: 'Web', icon: 'Globe', status: 'live' },
  { name: 'API регионам', icon: 'Code', status: 'planned', moduleId: 'region-api' },
  { name: 'HR-системы', icon: 'Briefcase', status: 'planned', moduleId: 'b2b2c' },
  { name: 'Туризм', icon: 'Mountain', status: 'planned', moduleId: 'tourism' },
];

const rings: RingDef[] = [
  {
    label: 'КАНАЛЫ',
    sublabel: 'Интеграции и B2B2C',
    labelColor: '#2563eb',
    rIn: 195,
    rOut: 240,
    items: ringChannels,
    fontSize: 11,
    iconSize: 14,
    maxLen: 12,
  },
  {
    label: 'СТРАТЕГИЯ 615-р',
    sublabel: 'Модули до 2036',
    labelColor: '#7c3aed',
    rIn: 150,
    rOut: 192,
    items: ringStrategy,
    fontSize: 10,
    iconSize: 13,
    maxLen: 11,
  },
  {
    label: 'FAMILY OS',
    sublabel: 'Ядро · уже работает',
    labelColor: '#059669',
    rIn: 105,
    rOut: 147,
    items: ringCore,
    fontSize: 10,
    iconSize: 13,
    maxLen: 10,
  },
  {
    label: 'ФУНДАМЕНТ',
    sublabel: 'Платформа · 152-ФЗ',
    labelColor: '#475569',
    rIn: 60,
    rOut: 102,
    items: ringFoundation,
    fontSize: 9,
    iconSize: 12,
    maxLen: 10,
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

function wrapName(name: string, maxLen: number): string[] {
  const words = name.split(' ');
  if (words.length === 1) {
    return [name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name];
  }
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxLen) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > 3) {
    const last = lines.slice(2).join(' ');
    lines.length = 2;
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
        fill={hover ? config.hover : config.fill}
        stroke={config.stroke}
        strokeWidth={1}
        style={{ transition: 'fill 0.2s' }}
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

interface LayerLabelProps {
  label: string;
  sublabel?: string;
  color: string;
  ringR: number;
  angleDeg: number;
}

function LayerLabel({ label, sublabel, color, ringR, angleDeg }: LayerLabelProps) {
  const angle = (angleDeg * Math.PI) / 180;
  const sx = CX + ringR * Math.cos(angle);
  const sy = CY + ringR * Math.sin(angle);

  const elbowR = 250;
  const ex = CX + elbowR * Math.cos(angle);
  const ey = CY + elbowR * Math.sin(angle);

  const isRight = Math.cos(angle) >= 0;
  const labelX = isRight ? CX + 290 : CX - 290;
  const labelY = ey;

  return (
    <g>
      <path
        d={`M ${sx} ${sy} L ${ex} ${ey} L ${labelX} ${labelY}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={sx} cy={sy} r={3} fill={color} />
      <circle cx={labelX} cy={labelY} r={2} fill={color} />
      <text
        x={labelX + (isRight ? 6 : -6)}
        y={labelY - (sublabel ? 4 : 0)}
        textAnchor={isRight ? 'start' : 'end'}
        fontSize={13}
        fontWeight={800}
        fill={color}
        fontFamily="system-ui"
        letterSpacing={0.5}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={labelX + (isRight ? 6 : -6)}
          y={labelY + 11}
          textAnchor={isRight ? 'start' : 'end'}
          fontSize={10}
          fontWeight={500}
          fill={color}
          opacity={0.75}
          fontFamily="system-ui"
        >
          {sublabel}
        </text>
      )}
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

  const labels = [
    { ring: rings[3], angle: 155 },
    { ring: rings[2], angle: 205 },
    { ring: rings[1], angle: 335 },
    { ring: rings[0], angle: 25 },
  ];

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
          viewBox={`0 0 ${VB} ${VB}`}
          className="w-full max-w-[760px] h-auto"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.08))' }}
        >
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
                    onClick={() => handleClick(seg.item.moduleId)}
                  />
                ))}
              </g>
            );
          })}

          {labels.map((l, i) => (
            <LayerLabel
              key={i}
              label={l.ring.label}
              sublabel={l.ring.sublabel}
              color={l.ring.labelColor}
              ringR={(l.ring.rIn + l.ring.rOut) / 2}
              angleDeg={l.angle}
            />
          ))}

          <circle cx={CX} cy={CY} r={45} fill="url(#archGrad)" />
          <defs>
            <linearGradient id="archGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          <text x={CX} y={CY - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="white">
            Наша Семья
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" fontSize="7" fill="white" opacity="0.9">
            Family OS
          </text>
        </svg>
      </div>

      <p className="text-[11px] text-purple-600 text-center mt-3 font-medium flex items-center justify-center gap-1">
        <Icon name="MousePointerClick" size={11} />
        Кликните на модуль — раскроется цитата из Стратегии и привязка к KPI
      </p>

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
        Слайд 2 · Круговая архитектура · 4 кольца · Версия 2.5
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default CircularArchitecture;
