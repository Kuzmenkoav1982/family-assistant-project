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

// Размер viewBox: широкий, с местом под подписи слоёв слева/справа
const VB_W = 900;
const VB_H = 700;
const CX = VB_W / 2;
const CY = VB_H / 2;
const CENTER_R = 60;
const INNER_OUTER_R = 140;
const OUTER_OUTER_R = 260;

// Цвета слоёв — для обводки кольца и подписей
const LAYER_FAMILY = '#059669';
const LAYER_STRATEGY = '#7c3aed';

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

// Разбиваем название на 1–3 строки, длинные слова сокращаем
function wrapName(name: string, maxLen: number): string[] {
  const words = name.split(' ');
  if (words.length === 1) {
    return [name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name];
  }
  // Жадно собираем строки длиной ~maxLen
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) {
      cur = w;
    } else if ((cur + ' ' + w).length <= maxLen) {
      cur += ' ' + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  // Максимум 3 строки
  if (lines.length > 3) {
    const last = lines.slice(2).join(' ');
    lines.length = 2;
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

// Подпись слоя с выноской того же цвета, что и обводка кольца
interface LayerLabelProps {
  label: string;
  sublabel?: string;
  color: string;
  ringR: number; // средний радиус кольца — точка касания
  angleDeg: number; // угол точки касания (0=право, 180=лево)
  labelX: number; // абсолютный X подписи
}

function LayerLabel({ label, sublabel, color, ringR, angleDeg, labelX }: LayerLabelProps) {
  const angle = (angleDeg * Math.PI) / 180;
  const sx = CX + ringR * Math.cos(angle);
  const sy = CY + ringR * Math.sin(angle);
  const isRight = Math.cos(angle) >= 0;

  return (
    <g>
      <path
        d={`M ${sx} ${sy} L ${labelX} ${sy}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={sx} cy={sy} r={3.5} fill={color} />
      <text
        x={labelX + (isRight ? 8 : -8)}
        y={sy - (sublabel ? 4 : 0)}
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
          y={sy + 13}
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
    INNER_OUTER_R + 3,
    OUTER_OUTER_R,
    INNER_OUTER_R + 22,
    (INNER_OUTER_R + OUTER_OUTER_R) / 2 + 12,
  );

  const innerSegs = buildRing(
    innerIds,
    CENTER_R + 3,
    INNER_OUTER_R,
    CENTER_R + 18,
    (CENTER_R + INNER_OUTER_R) / 2 + 10,
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
          Внутренний круг — ядро Family OS, что работает уже сейчас.<br />
          Внешний круг — стратегические модули по Распоряжению № 615-р до 2036 года.
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
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full max-w-[920px] h-auto"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(168,85,247,0.15))' }}
        >
          {/* Outer ring сегменты */}
          {outerSegs.map((seg, i) => (
            <Segment
              key={`outer-${i}`}
              seg={seg}
              iconSize={18}
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
              iconSize={15}
              fontSize={11}
              maxLen={10}
              onClick={() => handleClick(innerIds[i])}
            />
          ))}

          {/* Цветные граничные окружности слоёв */}
          {/* Family OS: внутренняя и внешняя границы зелёным */}
          <circle cx={CX} cy={CY} r={CENTER_R + 1} fill="none" stroke={LAYER_FAMILY} strokeWidth={2.5} opacity={0.9} />
          <circle cx={CX} cy={CY} r={INNER_OUTER_R} fill="none" stroke={LAYER_FAMILY} strokeWidth={2.5} opacity={0.9} />
          {/* Стратегия 615-р: внутренняя (рядом с Family OS) и внешняя — фиолетовым */}
          <circle cx={CX} cy={CY} r={INNER_OUTER_R + 3} fill="none" stroke={LAYER_STRATEGY} strokeWidth={2.5} opacity={0.9} />
          <circle cx={CX} cy={CY} r={OUTER_OUTER_R} fill="none" stroke={LAYER_STRATEGY} strokeWidth={2.5} opacity={0.9} />

          {/* Central logo */}
          <circle cx={CX} cy={CY} r={CENTER_R} fill="url(#centerGrad)" />
          <defs>
            <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          <text x={CX} y={CY - 8} textAnchor="middle" fontSize="16" fontWeight="800" fill="white">
            Наша Семья
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize="10" fill="white" opacity="0.9">
            Family OS
          </text>

          {/* Подписи слоёв с выносками того же цвета */}
          <LayerLabel
            label="FAMILY OS"
            sublabel="Ядро · уже работает"
            color={LAYER_FAMILY}
            ringR={INNER_OUTER_R}
            angleDeg={180}
            labelX={CX - OUTER_OUTER_R - 35}
          />
          <LayerLabel
            label="СТРАТЕГИЯ 615-р"
            sublabel="Модули до 2036"
            color={LAYER_STRATEGY}
            ringR={OUTER_OUTER_R}
            angleDeg={0}
            labelX={CX + OUTER_OUTER_R + 35}
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