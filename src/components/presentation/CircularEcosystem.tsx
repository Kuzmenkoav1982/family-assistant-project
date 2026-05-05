import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail, type ModuleStatus } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';

const STATUS_FILL: Record<ModuleStatus, { fill: string; hover: string; stroke: string; text: string }> = {
  live: { fill: '#10b981', hover: '#059669', stroke: '#047857', text: '#ffffff' },
  dev: { fill: '#fbbf24', hover: '#f59e0b', stroke: '#d97706', text: '#451a03' },
  planned: { fill: '#e9d5ff', hover: '#d8b4fe', stroke: '#a855f7', text: '#581c87' },
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

const CX = 400;
const CY = 400;
const CENTER_R = 78;
const INNER_OUTER_R = 165;
const OUTER_OUTER_R = 270;

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

/**
 * Строит дугу для textPath. Направление выбирается так,
 * чтобы текст всегда читался "сверху вниз" (не вверх ногами).
 * Для верхней половины круга (midAngle 270-360 и 0-90) — дуга идёт по часовой стрелке.
 * Для нижней половины (90-270) — против часовой стрелки.
 */
function buildTextArc(startAngle: number, endAngle: number, r: number, id: string) {
  const midAngle = (startAngle + endAngle) / 2;
  const isBottom = midAngle > 90 && midAngle < 270;

  // Для нижней половины меняем направление дуги, чтобы текст не был перевёрнут
  const start = isBottom ? endAngle : startAngle;
  const end = isBottom ? startAngle : endAngle;
  const sweep = isBottom ? '0' : '1';

  const p1 = polarToCartesian(CX, CY, r, start);
  const p2 = polarToCartesian(CX, CY, r, end);
  const largeArc = Math.abs(end - start) <= 180 ? '0' : '1';

  return {
    id,
    d: `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${p2.x} ${p2.y}`,
    isBottom,
  };
}

interface SectorProps {
  module: ModuleDetail;
  startAngle: number;
  endAngle: number;
  rIn: number;
  rOut: number;
  fontSize: number;
  iconSize: number;
  pathId: string;
  ringName: 'inner' | 'outer';
  onClick: () => void;
}

function Sector({
  module,
  startAngle,
  endAngle,
  rIn,
  rOut,
  fontSize,
  iconSize,
  pathId,
  ringName,
  onClick,
}: SectorProps) {
  const [hover, setHover] = useState(false);
  const config = STATUS_FILL[module.status];
  const sectorD = buildSectorPath(startAngle, endAngle, rIn, rOut);

  const midAngle = (startAngle + endAngle) / 2;
  const isBottom = midAngle > 90 && midAngle < 270;

  // Иконка в радиальном направлении (ближе к центру кольца, под текстом)
  // Для верхней половины — иконка ниже текста, для нижней — выше
  const iconR = ringName === 'outer' ? rIn + (rOut - rIn) * 0.32 : rIn + (rOut - rIn) * 0.32;
  const iconPos = polarToCartesian(CX, CY, iconR, midAngle);

  // Радиус для текстовой дуги (текст идёт вдоль кольца)
  const textR = rIn + (rOut - rIn) * 0.68;
  const textArc = buildTextArc(startAngle, endAngle, textR, pathId);

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer' }}
    >
      <path
        d={sectorD}
        fill={hover ? config.hover : config.fill}
        stroke={config.stroke}
        strokeWidth={1.5}
        style={{ transition: 'fill 0.2s' }}
      />

      {/* Скрытая дуга для textPath */}
      <defs>
        <path id={pathId} d={textArc.d} />
      </defs>

      {/* Иконка */}
      <g
        transform={`translate(${iconPos.x - iconSize / 2}, ${iconPos.y - iconSize / 2})`}
        style={{ pointerEvents: 'none' }}
      >
        <foreignObject width={iconSize} height={iconSize}>
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
            <Icon name={module.icon} size={iconSize - 2} />
          </div>
        </foreignObject>
      </g>

      {/* Текст вдоль дуги */}
      <text
        fontSize={fontSize}
        fontWeight={600}
        fill={config.text}
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {module.name}
        </textPath>
      </text>
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

  const innerStep = 360 / innerIds.length;
  const outerStep = 360 / outerIds.length;

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
          Внутренний круг — ядро Family OS, что работает уже сейчас.<br />
          Внешний круг — стратегические модули по Распоряжению № 615-р до 2036 года.
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

      {/* Круговая схема */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 800 800"
          className="w-full max-w-[640px] h-auto"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(168,85,247,0.15))' }}
        >
          {/* Outer ring — 615-р */}
          {outerIds.map((id, i) => {
            const m = MODULES[id];
            if (!m) return null;
            const start = i * outerStep;
            const end = start + outerStep;
            return (
              <Sector
                key={id}
                module={m}
                startAngle={start}
                endAngle={end}
                rIn={INNER_OUTER_R + 5}
                rOut={OUTER_OUTER_R}
                fontSize={11}
                iconSize={18}
                pathId={`eco-outer-arc-${i}`}
                ringName="outer"
                onClick={() => handleClick(id)}
              />
            );
          })}

          {/* Inner ring — Family OS */}
          {innerIds.map((id, i) => {
            const m = MODULES[id];
            if (!m) return null;
            const start = i * innerStep;
            const end = start + innerStep;
            return (
              <Sector
                key={id}
                module={m}
                startAngle={start}
                endAngle={end}
                rIn={CENTER_R + 5}
                rOut={INNER_OUTER_R}
                fontSize={10}
                iconSize={16}
                pathId={`eco-inner-arc-${i}`}
                ringName="inner"
                onClick={() => handleClick(id)}
              />
            );
          })}

          {/* Central logo */}
          <circle cx={CX} cy={CY} r={CENTER_R} fill="url(#centerGrad)" />
          <defs>
            <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <foreignObject x={CX - CENTER_R} y={CY - CENTER_R} width={CENTER_R * 2} height={CENTER_R * 2}>
            <div
              style={{
                width: CENTER_R * 2,
                height: CENTER_R * 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                padding: 8,
              }}
            >
              <Icon name="Heart" size={26} className="text-white mb-1" />
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>Наша Семья</div>
              <div style={{ fontSize: 8, opacity: 0.9, marginTop: 4, lineHeight: 1.2 }}>Family OS</div>
            </div>
          </foreignObject>

          {/* Метки колец сверху */}
          <text
            x={CX}
            y={50}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#7c3aed"
            fontFamily="system-ui"
            letterSpacing="2"
          >
            СТРАТЕГИЯ 615-р · ДО 2036
          </text>
        </svg>
      </div>

      <p className="text-[11px] text-purple-600 text-center mt-3 font-medium flex items-center justify-center gap-1">
        <Icon name="MousePointerClick" size={11} />
        Нажмите на любой сектор — откроется карточка с цитатой Стратегии и KPI
      </p>

      {/* Каналы */}
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
        Слайд 1 · Круговая экосистема · Версия 2.2 от 06.05.2026
      </p>

      <ModuleDetailDialog module={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

export default CircularEcosystem;
