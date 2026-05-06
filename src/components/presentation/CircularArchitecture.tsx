import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail, type ModuleStatus } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

// Цвета по принципу светофора: зелёный — работает, жёлтый — в разработке, красный — план по 615-р.
// Используются градиенты и внутренние блики, чтобы получить сочный 3D-эффект и лёгкую полупрозрачность.
const STATUS_FILL: Record<
  ModuleStatus,
  { gradId: string; hoverGradId: string; stroke: string; text: string }
> = {
  live: { gradId: 'gradLive', hoverGradId: 'gradLiveHover', stroke: '#047857', text: '#ffffff' },
  dev: { gradId: 'gradDev', hoverGradId: 'gradDevHover', stroke: '#b45309', text: '#3a1d03' },
  planned: { gradId: 'gradPlanned', hoverGradId: 'gradPlannedHover', stroke: '#b91c1c', text: '#ffffff' },
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

const VB_W = 1080;
const VB_H = 860;
const CX = VB_W / 2;
const CY = VB_H / 2;

const ringFoundation: RingItem[] = [
  { name: 'Auth', icon: 'Lock', status: 'live' },
  { name: 'PostgreSQL', icon: 'Database', status: 'live' },
  { name: 'Functions', icon: 'Cloud', status: 'live' },
  { name: 'S3', icon: 'HardDrive', status: 'live' },
  { name: 'Push', icon: 'Bell', status: 'live' },
  { name: '152-ФЗ', icon: 'ShieldCheck', status: 'live' },
  { name: 'Реестр ПО', icon: 'BadgeCheck', status: 'dev' },
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
  { name: 'AI', icon: 'Sparkles', status: 'live', moduleId: 'ai-assistant' },
];

const ringStrategy: RingItem[] = [
  { name: 'Навигатор льгот', icon: 'Compass', status: 'dev', moduleId: 'support-navigator' },
  { name: 'Многодетная', icon: 'Users', status: 'dev', moduleId: 'large-family' },
  { name: 'Беременность', icon: 'HeartHandshake', status: 'dev', moduleId: 'pregnancy' },
  { name: 'Кейс-менеджер семьи', icon: 'GitBranch', status: 'planned', moduleId: 'case-manager' },
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
  { name: 'МАХ', icon: 'Send', status: 'live' },
  { name: 'Web', icon: 'Globe', status: 'live' },
  { name: 'API регионам', icon: 'Code', status: 'planned', moduleId: 'region-api' },
  { name: 'HR-системы', icon: 'Briefcase', status: 'planned', moduleId: 'b2b2c' },
  { name: 'Туризм', icon: 'Mountain', status: 'planned', moduleId: 'tourism' },
];

const rings: RingDef[] = [
  {
    label: 'КАНАЛЫ',
    sublabel: 'Интеграции и B2B2C',
    labelColor: '#991b1b',
    rIn: 230,
    rOut: 290,
    items: ringChannels,
    fontSize: 11,
    iconSize: 16,
    maxLen: 11,
  },
  {
    label: 'СТРАТЕГИЯ 615-р',
    sublabel: 'Модули до 2036',
    labelColor: '#ea580c',
    rIn: 175,
    rOut: 227,
    items: ringStrategy,
    fontSize: 10,
    iconSize: 14,
    maxLen: 10,
  },
  {
    label: 'ЯДРО · НАША СЕМЬЯ',
    sublabel: 'Уже работает',
    labelColor: '#059669',
    rIn: 122,
    rOut: 172,
    items: ringCore,
    fontSize: 10,
    iconSize: 14,
    maxLen: 10,
  },
  {
    label: 'ФУНДАМЕНТ',
    sublabel: 'Платформа · 152-ФЗ',
    labelColor: '#ca8a04',
    rIn: 70,
    rOut: 119,
    items: ringFoundation,
    fontSize: 9,
    iconSize: 13,
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

// Перенос названия на до 4 строк. Слова стараемся не резать —
// допускаем небольшое превышение maxLen, чтобы не отрывать одну букву.
function wrapName(name: string, maxLen: number): string[] {
  const MAX_LINES = 4;
  const HARD_LIMIT = maxLen + 4;
  const words = name.split(' ');

  // Разбиваем очень длинные слова: по дефису или по буквам
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
        style={{ transition: 'opacity 0.2s', filter: 'url(#cell3d)' }}
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
  ringROut: number;
  angleDeg: number;
  labelX: number;
}

/**
 * Выноска идёт от ВНЕШНЕГО контура слоя:
 *  - точка-якорь лежит точно на окружности rOut (контур слоя)
 *  - короткий радиальный отрезок выходит наружу перпендикулярно контуру (как стрелка от обода колеса)
 *  - затем горизонтальная полка ведёт к подписи
 * Это считывается как "подпись ко всему слою", а не к конкретной ячейке.
 */
function LayerLabel({ label, sublabel, color, ringROut, angleDeg, labelX }: LayerLabelProps) {
  const angle = (angleDeg * Math.PI) / 180;

  // Точка на самом контуре слоя
  const ax = CX + ringROut * Math.cos(angle);
  const ay = CY + ringROut * Math.sin(angle);

  // Короткий радиальный отрезок наружу от контура
  const radialOut = 22;
  const bx = CX + (ringROut + radialOut) * Math.cos(angle);
  const by = CY + (ringROut + radialOut) * Math.sin(angle);

  const isRight = Math.cos(angle) >= 0;
  const labelY = by;

  return (
    <g>
      {/* Радиальная "иголка" от контура наружу */}
      <path
        d={`M ${ax} ${ay} L ${bx} ${by}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Горизонтальная полка к подписи */}
      <path
        d={`M ${bx} ${by} L ${labelX} ${labelY}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Маленькая "скоба" поверх контура для усиления связи со слоем */}
      <circle cx={ax} cy={ay} r={4.5} fill="white" stroke={color} strokeWidth={2.5} />

      <text
        x={labelX + (isRight ? 8 : -8)}
        y={labelY - (sublabel ? 4 : 0)}
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
          y={labelY + 13}
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

  // Подписи слева/справа на разной высоте, чтобы не пересекались.
  // Каждая выноска идёт от ВНЕШНЕГО контура (rOut) своего слоя — поэтому подпись
  // относится ко всему кольцу, а не к конкретной ячейке.
  // rings[0] = КАНАЛЫ (внешнее), rings[1] = СТРАТЕГИЯ, rings[2] = FAMILY OS, rings[3] = ФУНДАМЕНТ
  // Подвинуты ближе к центру, чтобы длинная подпись «ЯДРО · НАША СЕМЬЯ»
  // не упиралась в левый край viewBox (раньше обрезалась первая буква).
  const leftX = CX - 355;
  const rightX = CX + 355;
  const labels = [
    // Слева сверху вниз: FAMILY OS, ФУНДАМЕНТ
    { ring: rings[2], angle: 200, labelX: leftX },
    { ring: rings[3], angle: 160, labelX: leftX },
    // Справа сверху вниз: СТРАТЕГИЯ, КАНАЛЫ
    { ring: rings[1], angle: 340, labelX: rightX },
    { ring: rings[0], angle: 20, labelX: rightX },
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
          От ядра наружу: фундамент → ядро «Наша Семья» → стратегические модули по 615-р → каналы и интеграции
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: 'radial-gradient(circle at 30% 30%, #6ee7b7, #10b981 60%, #047857)' }}
          />
          <span className="text-xs font-medium text-gray-700">Уже работает</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: 'radial-gradient(circle at 30% 30%, #fef08a, #facc15 60%, #ca8a04)' }}
          />
          <span className="text-xs font-medium text-gray-700">В разработке</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: 'radial-gradient(circle at 30% 30%, #fca5a5, #ef4444 60%, #991b1b)' }}
          />
          <span className="text-xs font-medium text-gray-700">План по 615-р</span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full max-w-[1080px] h-auto"
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

          {/* Белые "прокладки" между кольцами — визуально разделяют слои, не перекрывая ячейки */}
          {rings.map((ring, idx) => (
            <g key={`gap-${idx}`}>
              <circle
                cx={CX}
                cy={CY}
                r={ring.rIn}
                fill="none"
                stroke="#ffffff"
                strokeWidth={4}
              />
              <circle
                cx={CX}
                cy={CY}
                r={ring.rOut}
                fill="none"
                stroke="#ffffff"
                strokeWidth={4}
              />
            </g>
          ))}

          {/* Тонкие цветные контуры слоёв поверх белой прокладки */}
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
              angleDeg={l.angle}
              labelX={l.labelX}
            />
          ))}

          {/* Центр — оранжево-красный градиент в цвет лого "7Я / Наша Семья" */}
          <defs>
            <radialGradient id="archGrad" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="35%" stopColor="#fb923c" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>

            {/* Градиенты статусов: насыщенные, сочные, лёгкая прозрачность даёт стеклянный 3D-эффект */}
            <radialGradient id="gradLive" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
            <radialGradient id="gradLiveHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>

            <radialGradient id="gradDev" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
            <radialGradient id="gradDevHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>

            <radialGradient id="gradPlanned" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <radialGradient id="gradPlannedHover" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="55%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>

            {/* Лёгкий 3D-объём для ячеек */}
            <filter id="cell3d" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>

          {/* Логотип «7Я» — большой, в центре. Только тень + сама картинка, никакой "матрёшки" */}
          <defs>
            <clipPath id="archLogoClip">
              <circle cx={CX} cy={CY} r={70} />
            </clipPath>
            <filter id="archLogoShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#b91c1c" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#archLogoShadow)">
            <circle cx={CX} cy={CY} r={70} fill="#fff" />
            <image
              href="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/1b0ac6ec-2228-436a-822c-157151c6c28f.jpeg"
              x={CX - 70}
              y={CY - 70}
              width={140}
              height={140}
              clipPath="url(#archLogoClip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={CX} cy={CY} r={70} fill="none" stroke="#b91c1c" strokeWidth={2.5} />
          </g>
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">15+</p>
          <p className="text-[10px] text-gray-600 leading-tight mt-0.5">в плане по 615-р</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 2 · Круговая архитектура · 4 кольца · Версия 2.6
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default CircularArchitecture;