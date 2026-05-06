import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail, type ModuleStatus } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

// Светофор: насыщенные градиенты + лёгкая прозрачность = сочный 3D-эффект
const STATUS_FILL: Record<
  ModuleStatus,
  { gradId: string; hoverGradId: string; stroke: string; text: string }
> = {
  live: { gradId: 'ecoLive', hoverGradId: 'ecoLiveH', stroke: '#047857', text: '#ffffff' },
  dev: { gradId: 'ecoDev', hoverGradId: 'ecoDevH', stroke: '#b45309', text: '#3a1d03' },
  planned: { gradId: 'ecoPlanned', hoverGradId: 'ecoPlannedH', stroke: '#b91c1c', text: '#ffffff' },
};

const innerIds = [
  'family-tree',
  'calendar',
  'tasks',
  'budget',
  'chat',
  'children',
  'health',
  'documents',
  'places',
  'shopping',
  'memories',
  'ai-assistant',
];

const outerIds = [
  'support-navigator',
  'large-family',
  'pregnancy',
  'case-manager',
  'svo-family',
  'student-family',
  'social-contract',
  'zog',
  'nannies',
  'rental',
  'after-school',
  'mediation',
  'tourism',
  'b2b2c',
  'region-api',
  'compatriots',
];

// Размер viewBox: широкий, с местом под подписи слоёв слева/справа
const VB_W = 1080;
const VB_H = 820;
const CX = VB_W / 2;
const CY = VB_H / 2;
const CENTER_R = 70;
const INNER_OUTER_R = 175;
const OUTER_OUTER_R = 305;

// Цвета слоёв — для обводки кольца и подписей
const LAYER_FAMILY = '#059669';
const LAYER_STRATEGY = '#b91c1c';

interface SegmentDef {
  module: ModuleDetail;
  d: string;
  iconX: number;
  iconY: number;
  textX: number;
  textY: number;
  deg: number;
}

function buildRing(
  ids: string[],
  rIn: number,
  rOut: number,
  iconRadius: number,
  textRadius: number,
): SegmentDef[] {
  const total = ids.length;
  const gap = 0.012;

  return ids.map((id, i) => {
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
    if (deg > 90 && deg < 270) {
      deg += 180;
    }

    const module = MODULES[id];
    return { module, d, iconX, iconY, textX, textY, deg };
  });
}

// Разбиваем название на до 4 строк, длинные слова режем по буквам
function wrapName(name: string, maxLen: number): string[] {
  const MAX_LINES = 4;
  const words = name.split(' ');
  const tokens: string[] = [];
  for (const w of words) {
    if (w.length <= maxLen) tokens.push(w);
    else for (let i = 0; i < w.length; i += maxLen) tokens.push(w.slice(i, i + maxLen));
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

interface SegmentProps {
  seg: SegmentDef;
  iconSize: number;
  fontSize: number;
  maxLen: number;
  onClick: () => void;
}

function Segment({ seg, iconSize, fontSize, maxLen, onClick }: SegmentProps) {
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

function LayerLabel({ label, sublabel, color, ringROut, angleDeg, labelX }: LayerLabelProps) {
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

export function CircularEcosystem() {
  const [selected, setSelected] = useState<ModuleDetail | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (id: string) => {
    const module = MODULES[id];
    if (module) {
      setSelected(module);
      setOpen(true);
    }
  };

  const outerSegs = buildRing(
    outerIds,
    INNER_OUTER_R + 4,
    OUTER_OUTER_R,
    INNER_OUTER_R + 26,
    (INNER_OUTER_R + OUTER_OUTER_R) / 2 + 18,
  );

  const innerSegs = buildRing(
    innerIds,
    CENTER_R + 4,
    INNER_OUTER_R,
    CENTER_R + 22,
    (CENTER_R + INNER_OUTER_R) / 2 + 14,
  );

  return (
    <section
      data-pdf-slide
      className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl shadow-xl my-6 overflow-hidden border border-purple-100 px-5 py-7 sm:px-8 sm:py-10"
    >
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full mb-3">
          <Icon name="LayoutGrid" size={14} className="text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Экосистема платформы</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          «Наша Семья» — карта продукта
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Внутренний круг — ядро «Наша Семья», что работает уже сейчас.<br />
          Внешний круг — стратегические модули по Распоряжению № 615-р до 2036 года.
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
          style={{ filter: 'drop-shadow(0 4px 16px rgba(239,68,68,0.18))' }}
        >
          <defs>
            {/* Светофор: насыщенные радиальные градиенты */}
            <radialGradient id="ecoLive" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
            <radialGradient id="ecoLiveH" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <radialGradient id="ecoDev" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
            <radialGradient id="ecoDevH" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
            <radialGradient id="ecoPlanned" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>
            <radialGradient id="ecoPlannedH" cx="35%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="55%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
            {/* Центр — оранжево-красный градиент в цвет лого 7Я */}
            <radialGradient id="centerGrad" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="35%" stopColor="#fb923c" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
          </defs>

          {/* Outer ring сегменты */}
          {outerSegs.map((seg, i) => (
            <Segment
              key={`outer-${i}`}
              seg={seg}
              iconSize={20}
              fontSize={12}
              maxLen={11}
              onClick={() => handleClick(outerIds[i])}
            />
          ))}

          {/* Inner ring сегменты */}
          {innerSegs.map((seg, i) => (
            <Segment
              key={`inner-${i}`}
              seg={seg}
              iconSize={17}
              fontSize={11}
              maxLen={10}
              onClick={() => handleClick(innerIds[i])}
            />
          ))}

          {/* Цветные граничные окружности слоёв */}
          <circle cx={CX} cy={CY} r={CENTER_R + 1} fill="none" stroke={LAYER_FAMILY} strokeWidth={2.5} opacity={0.9} />
          <circle cx={CX} cy={CY} r={INNER_OUTER_R} fill="none" stroke={LAYER_FAMILY} strokeWidth={2.5} opacity={0.9} />
          <circle cx={CX} cy={CY} r={INNER_OUTER_R + 3} fill="none" stroke={LAYER_STRATEGY} strokeWidth={2.5} opacity={0.9} />
          <circle cx={CX} cy={CY} r={OUTER_OUTER_R} fill="none" stroke={LAYER_STRATEGY} strokeWidth={2.5} opacity={0.9} />

          {/* Логотип «7Я» — большой, в центре, без "матрёшки". Тень + сама картинка */}
          <defs>
            <clipPath id="ecoLogoClip">
              <circle cx={CX} cy={CY} r={CENTER_R} />
            </clipPath>
            <filter id="ecoLogoShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#b91c1c" floodOpacity="0.35" />
            </filter>
          </defs>
          <g filter="url(#ecoLogoShadow)">
            <circle cx={CX} cy={CY} r={CENTER_R} fill="#fff" />
            <image
              href="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/1b0ac6ec-2228-436a-822c-157151c6c28f.jpeg"
              x={CX - CENTER_R}
              y={CY - CENTER_R}
              width={CENTER_R * 2}
              height={CENTER_R * 2}
              clipPath="url(#ecoLogoClip)"
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={CX} cy={CY} r={CENTER_R} fill="none" stroke="#b91c1c" strokeWidth={2.5} />
          </g>

          {/* Подписи слоёв с выносками */}
          <LayerLabel
            label="ЯДРО · НАША СЕМЬЯ"
            sublabel="Уже работает"
            color={LAYER_FAMILY}
            ringROut={INNER_OUTER_R}
            angleDeg={195}
            labelX={CX - OUTER_OUTER_R - 30}
          />
          <LayerLabel
            label="СТРАТЕГИЯ 615-р"
            sublabel="Модули до 2036"
            color={LAYER_STRATEGY}
            ringROut={OUTER_OUTER_R}
            angleDeg={0}
            labelX={CX + OUTER_OUTER_R + 30}
          />
        </svg>
      </div>

      <p className="text-[11px] text-purple-600 text-center mt-3 font-medium flex items-center justify-center gap-1">
        <Icon name="MousePointerClick" size={11} />
        Нажмите на любой сектор — откроется карточка с цитатой Стратегии и KPI
      </p>

      <div className="grid grid-cols-3 gap-2 mt-5">
        <div className="bg-white border border-blue-200 rounded-xl p-3 text-center">
          <Icon name="User" size={16} className="text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-blue-900">B2C</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">Семьи — приложение</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-3 text-center">
          <Icon name="Landmark" size={16} className="text-emerald-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-emerald-900">B2G</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">Регионы — соцказначейство</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-3 text-center">
          <Icon name="Briefcase" size={16} className="text-amber-600 mx-auto mb-1" />
          <p className="text-xs font-bold text-amber-900">B2B2C</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">Работодатели — family-benefit</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 text-center mt-4">
        Слайд 1 · Круговая экосистема · Версия 2.6 от 06.05.2026
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default CircularEcosystem;