import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MODULES, type ModuleDetail } from './moduleData';
import { ModuleDetailDialog } from './ModuleDetailDialog';
import {
  buildRing,
  innerIds,
  outerIds,
  VB_W,
  VB_H,
  CX,
  CY,
  CENTER_R,
  INNER_OUTER_R,
  OUTER_OUTER_R,
  LAYER_FAMILY,
  LAYER_STRATEGY,
} from './circular-ecosystem/utils';
import { Segment } from './circular-ecosystem/Segment';
import { LayerLabel } from './circular-ecosystem/LayerLabel';
import { EcosystemSvgDefs } from './circular-ecosystem/EcosystemSvgDefs';

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
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Архитектура платформы</span>
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
          <EcosystemSvgDefs />

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
