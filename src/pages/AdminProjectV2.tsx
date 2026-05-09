import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { OVERLAP_CASES } from "@/data/atlas/platformDecisions";
import type { OverlapCase } from "@/data/atlas/types";
import {
  SECTIONS_V2,
  HUBS_AS_IS,
  LAYERS_V2,
  LAYER_ORDER_V2,
  COMPARISON_ROWS,
  DATA_FLOWS,
  FLOW_STYLE,
  getSectionsByLayer,
  getSectionsByHub,
  getLayerConfig,
  type SectionV2,
  type ArchLayer,
  type DataFlow,
} from "@/data/projectV2/sections";

// ─────────────────────────────────────────
// Типы и константы
// ─────────────────────────────────────────
type Mode = "as-is" | "after" | "compare" | "conflicts";

const MODES: Array<{ id: Mode; label: string; icon: string }> = [
  { id: "as-is",     label: "Как есть сейчас",   icon: "Eye" },
  { id: "after",     label: "После изменений",    icon: "Sparkles" },
  { id: "compare",   label: "Сравнение",          icon: "ArrowLeftRight" },
  { id: "conflicts", label: "Конфликты",          icon: "AlertTriangle" },
];

const ROLE_LAYER_LABEL: Record<ArchLayer, string> = {
  sources:   "Источник",
  panorama:  "Панорама",
  reflection:"Осмысление",
  codes:     "Кодекс",
  execution: "Исполнение",
  service:   "Служебный",
};

const ROLE_LAYER_COLOR: Record<ArchLayer, string> = {
  sources:   "bg-slate-100 text-slate-700 border-slate-300",
  panorama:  "bg-emerald-50 text-emerald-700 border-emerald-300",
  reflection:"bg-amber-50 text-amber-700 border-amber-300",
  codes:     "bg-purple-50 text-purple-700 border-purple-300",
  execution: "bg-blue-50 text-blue-700 border-blue-300",
  service:   "bg-gray-50 text-gray-500 border-gray-200",
};

// ─────────────────────────────────────────
// Бейдж архитектурной роли
// ─────────────────────────────────────────
function RoleBadge({ layer }: { layer: ArchLayer }) {
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${ROLE_LAYER_COLOR[layer]}`}>
      {ROLE_LAYER_LABEL[layer]}
    </span>
  );
}

// ─────────────────────────────────────────
// РЕЖИМ 1: Как есть сейчас
// ─────────────────────────────────────────
function AsIsMode({ onSectionClick }: { onSectionClick: (s: SectionV2) => void }) {
  const mainHubs = HUBS_AS_IS.filter((h) => h.id !== "articles" && h.id !== "in-dev");
  const serviceHubs = HUBS_AS_IS.filter((h) => h.id === "articles" || h.id === "in-dev");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        Текущая структура платформы: хабы-контейнеры и разделы внутри них. У каждого раздела — бейдж его будущей архитектурной роли.
        <span className="font-medium text-slate-700"> Кликни на раздел → откроется полная карточка.</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mainHubs.map((hub) => {
          const sections = getSectionsByHub(hub.id);
          if (sections.length === 0) return null;
          const hasMixedRoles = new Set(sections.map((s) => s.layer)).size > 1;
          return (
            <div key={hub.id} className={`rounded-xl border overflow-hidden ${hasMixedRoles ? "border-amber-300" : "border-slate-200"}`}>
              {/* Шапка хаба */}
              <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${hub.color} text-white`}>
                <Icon name={hub.icon} size={14} />
                <span className="text-xs font-bold">{hub.label}</span>
                {hasMixedRoles && (
                  <span className="ml-auto text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
                    ⚠ смешаны роли
                  </span>
                )}
              </div>
              {/* Список разделов */}
              <div className="flex flex-col divide-y divide-slate-100 bg-white">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSectionClick(s)}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon name={s.icon} size={11} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-700 group-hover:text-slate-900 truncate">
                        {s.labelNew ?? s.label}
                        {s.labelNew && s.labelNew !== s.label && (
                          <span className="ml-1 text-[9px] text-slate-400 line-through">{s.label}</span>
                        )}
                      </span>
                    </div>
                    <RoleBadge layer={s.layer} />
                  </button>
                ))}
              </div>
              {/* Проблема хаба */}
              {hub.problem && (
                <div className="px-3 py-2 bg-amber-50 border-t border-amber-200">
                  <p className="text-[10px] text-amber-700 leading-tight">{hub.problem}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Служебные */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Служебные (вне основной архитектуры)</p>
        <div className="flex gap-2 flex-wrap">
          {serviceHubs.map((h) => (
            <span key={h.id} className="flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-lg">
              <Icon name={h.icon} size={11} />
              {h.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// РЕЖИМ 2: После изменений — Древо по слоям
// ─────────────────────────────────────────
type FlowVisibility = "none" | "layers" | "section";

// Получаем потоки между двумя конкретными слоями
function getFlowsBetween(from: ArchLayer, to: ArchLayer): DataFlow[] {
  return DATA_FLOWS.filter((f) => f.from === from && f.to === to);
}

// Потоки, которые затрагивают выбранный раздел
function getSectionFlows(section: SectionV2): DataFlow[] {
  return DATA_FLOWS.filter(
    (f) => f.from === section.layer || f.to === section.layer
  );
}

function FlowArrow({
  flow,
  isActive,
  isDimmed,
  onClick,
}: {
  flow: DataFlow;
  isActive: boolean;
  isDimmed: boolean;
  onClick: (flow: DataFlow) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const st = FLOW_STYLE[flow.color];
  const highlighted = isActive || hovered;

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Линия сверху */}
      <div
        className={`w-0.5 h-3 border-l-2 border-dashed transition-all ${
          highlighted ? st.line : isDimmed ? "border-slate-200" : "border-slate-300"
        }`}
      />

      {/* Кнопка стрелки */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onClick(flow)}
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-[11px] font-semibold transition-all cursor-pointer ${
          highlighted
            ? `${st.bg} ${st.border} ${st.text} shadow-md scale-105`
            : isDimmed
            ? "bg-white border-slate-100 text-slate-300"
            : "bg-white border-slate-200 text-slate-500 hover:shadow-sm"
        }`}
      >
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${highlighted ? st.dot : isDimmed ? "bg-slate-200" : "bg-slate-300"}`} />
        {flow.label}
        <Icon name="ChevronDown" size={10} className={highlighted ? st.text : "text-slate-300"} />

        {/* Tooltip */}
        {hovered && !isActive && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl px-3 py-2 shadow-xl z-50 pointer-events-none">
            <p className="font-bold mb-0.5 text-[11px]">{flow.from} → {flow.to}</p>
            {flow.tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </div>
        )}
      </button>

      {/* Линия снизу */}
      <div
        className={`w-0.5 h-3 border-l-2 border-dashed transition-all ${
          highlighted ? st.line : isDimmed ? "border-slate-200" : "border-slate-300"
        }`}
      />
      <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] transition-all ${
        highlighted ? st.line.replace("border-", "border-t-") : isDimmed ? "border-t-slate-200" : "border-t-slate-300"
      }`} />
    </div>
  );
}

// Панель детального потока (по клику на стрелку)
function FlowDetailPanel({ flow, onClose }: { flow: DataFlow; onClose: () => void }) {
  const st = FLOW_STYLE[flow.color];
  const relatedConflicts = OVERLAP_CASES.filter((c) => flow.conflictIds.includes(c.id));
  const LAYER_NAME: Record<ArchLayer, string> = {
    codes: "Кодексы", reflection: "Осмысление", panorama: "Панорамы",
    execution: "Исполнение", sources: "Источники", service: "Служебные",
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Шапка */}
      <div className={`flex items-center justify-between gap-2 px-4 py-3 ${st.bg} border-b ${st.border}`}>
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${st.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${st.text}`}>Поток данных</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            {LAYER_NAME[flow.from]} → {LAYER_NAME[flow.to]}
          </h3>
          <p className="text-[11px] text-slate-500">{flow.label}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 shrink-0">
          <Icon name="X" size={14} />
        </Button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Что передаётся */}
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Что передаётся</p>
          <div className="flex flex-wrap gap-1.5">
            {flow.what.map((w, i) => (
              <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${st.bg} ${st.border} ${st.text}`}>{w}</span>
            ))}
          </div>
        </div>

        {/* Разделы */}
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Главные участники</p>
          <div className="flex flex-col gap-1">
            {flow.sections.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                <div className={`w-1 h-1 rounded-full ${st.dot} shrink-0`} />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Сценарии */}
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Примеры маршрутов</p>
          <div className="flex flex-col gap-2">
            {flow.scenarios.map((sc, i) => (
              <div key={i} className={`rounded-lg border ${st.border} ${st.bg} p-2`}>
                <p className={`text-[10px] font-bold ${st.text} mb-1`}>{sc.title}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {sc.path.map((step, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <span className="text-[11px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-700">{step}</span>
                      {j < sc.path.length - 1 && <Icon name="ArrowRight" size={10} className="text-slate-400" />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Конфликты */}
        {relatedConflicts.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Конфликтные узлы</p>
            {relatedConflicts.map((c) => (
              <div key={c.id} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 mb-1">
                <p className="text-[11px] font-semibold text-amber-800">{c.sharedFunction}</p>
                <p className="text-[10px] text-amber-600">{c.sectionA} ↔ {c.sectionB}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionChip({
  section,
  onClick,
  isSelected,
  isHighlighted,
  isDimmed,
}: {
  section: SectionV2;
  onClick: () => void;
  isSelected: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
}) {
  const hasConflict = section.conflicts.length > 0;
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
        isSelected
          ? "bg-violet-600 text-white border-violet-600 shadow-md scale-105"
          : isHighlighted
          ? "bg-violet-50 text-violet-800 border-violet-400 shadow-sm ring-2 ring-violet-200"
          : isDimmed
          ? "bg-white text-slate-300 border-slate-100"
          : "bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:shadow-sm"
      }`}
    >
      <Icon name={section.icon} size={12} className={isSelected ? "text-white" : isHighlighted ? "text-violet-600" : "text-slate-400"} />
      <span>{section.labelNew ?? section.label}</span>
      {section.labelNew && section.labelNew !== section.label && !isSelected && (
        <span className="text-[9px] text-amber-500">↑</span>
      )}
      {hasConflict && !isSelected && !isDimmed && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
      )}
    </button>
  );
}

function AfterMode({
  selectedSection,
  onSectionClick,
  selectedFlow,
  onFlowClick,
}: {
  selectedSection: SectionV2 | null;
  onSectionClick: (s: SectionV2) => void;
  selectedFlow: DataFlow | null;
  onFlowClick: (f: DataFlow) => void;
}) {
  const [flowVis, setFlowVis] = useState<FlowVisibility>("layers");

  // Вычисляем подсвеченные/приглушённые разделы при выборе раздела
  const activeLayers = selectedSection
    ? new Set([
        selectedSection.layer,
        ...DATA_FLOWS.filter((f) => f.from === selectedSection.layer || f.to === selectedSection.layer).flatMap((f) => [f.from, f.to]),
      ])
    : null;

  // Подсвеченные разделы = те, с которыми выбранный раздел связан данными
  const linkedSectionLabels = selectedSection
    ? new Set([...selectedSection.dataFrom, ...selectedSection.dataTo])
    : null;

  const VIS_OPTS: Array<{ id: FlowVisibility; label: string }> = [
    { id: "none",    label: "Скрыть связи" },
    { id: "layers",  label: "Потоки слоёв" },
    { id: "section", label: "Путь раздела" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Подсказка + переключатель */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
          Разделы по архитектурным слоям.
          <span className="text-amber-600 font-medium"> ↑ = переименование · </span>
          <span className="text-red-500 font-medium">● = конфликт</span>.
          {flowVis === "layers" && " Кликни на стрелку — откроется панель потока."}
          {flowVis === "section" && selectedSection && <span className="text-violet-600 font-medium"> Подсвечен путь: {selectedSection.labelNew ?? selectedSection.label}</span>}
        </p>
        {/* Переключатель отображения связей */}
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
          {VIS_OPTS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFlowVis(opt.id)}
              className={`px-2.5 py-1.5 text-[11px] font-medium border-r border-slate-100 last:border-0 transition-colors ${
                flowVis === opt.id ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Легенда */}
      {flowVis === "layers" && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-slate-400 font-medium">Тип потока:</span>
          {([
            { color: "blue",   label: "данные / факты" },
            { color: "green",  label: "исполнение" },
            { color: "violet", label: "смыслы / мостики" },
            { color: "amber",  label: "новые факты (петля)" },
          ] as const).map((item) => (
            <div key={item.color} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${FLOW_STYLE[item.color].dot}`} />
              <span className={`text-[10px] font-medium ${FLOW_STYLE[item.color].text}`}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Дерево слоёв */}
      {LAYER_ORDER_V2.map((layerId, idx) => {
        const cfg = getLayerConfig(layerId);
        const sections = getSectionsByLayer(layerId);
        const isLayerActive = !activeLayers || activeLayers.has(layerId);

        // Потоки от этого слоя к следующему
        const nextLayer = LAYER_ORDER_V2[idx + 1];
        const flowsBetween = nextLayer ? getFlowsBetween(layerId, nextLayer) : [];
        // Обратная петля: Исполнение → Источники
        const loopFlows = layerId === "execution" ? getFlowsBetween("execution", "sources") : [];

        return (
          <div key={layerId} className="flex flex-col items-center gap-0">
            {/* Блок слоя */}
            <div
              className={`w-full rounded-2xl border-2 transition-all ${cfg.borderColor} ${cfg.bgColor} p-3 ${
                !isLayerActive ? "opacity-30" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor}`}>{cfg.name}</span>
                <span className={`text-[11px] ${cfg.textColor} opacity-60`}>— {cfg.description}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sections.map((s) => {
                  const isSelected = selectedSection?.id === s.id;
                  const isHighlighted = flowVis === "section" && selectedSection && !isSelected
                    ? linkedSectionLabels?.has(s.label) || linkedSectionLabels?.has(s.labelNew ?? s.label)
                    : false;
                  const isDimmed = flowVis === "section" && selectedSection && !isSelected && !isHighlighted;
                  return (
                    <SectionChip
                      key={s.id}
                      section={s}
                      onClick={() => onSectionClick(s)}
                      isSelected={isSelected}
                      isHighlighted={!!isHighlighted}
                      isDimmed={!!isDimmed}
                    />
                  );
                })}
              </div>
            </div>

            {/* Стрелки между слоями */}
            {idx < LAYER_ORDER_V2.length - 1 && (
              <div className="flex flex-col items-center gap-0 py-0">
                {flowVis === "none" && (
                  <>
                    <div className="w-px h-3 bg-slate-200" />
                    <Icon name="ChevronDown" size={13} className="text-slate-300" />
                    <div className="w-px h-3 bg-slate-200" />
                  </>
                )}
                {flowVis !== "none" && flowsBetween.map((flow) => {
                  const sectionFlows = selectedSection ? getSectionFlows(selectedSection) : [];
                  const isActive = flowVis === "section"
                    ? sectionFlows.some((f) => f.id === flow.id)
                    : selectedFlow?.id === flow.id;
                  const isDimmed = flowVis === "section" && selectedSection
                    ? !sectionFlows.some((f) => f.id === flow.id)
                    : false;
                  return (
                    <FlowArrow
                      key={flow.id}
                      flow={flow}
                      isActive={isActive}
                      isDimmed={isDimmed}
                      onClick={onFlowClick}
                    />
                  );
                })}
                {/* Петля: Исполнение → Источники (показываем рядом с последней стрелкой вниз) */}
                {layerId === "execution" && flowVis !== "none" && loopFlows.map((flow) => {
                  const sectionFlows = selectedSection ? getSectionFlows(selectedSection) : [];
                  const isActive = flowVis === "section"
                    ? sectionFlows.some((f) => f.id === flow.id)
                    : selectedFlow?.id === flow.id;
                  return (
                    <div key={flow.id} className="mt-1 flex items-center gap-1">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <Icon name="RefreshCcw" size={12} className={isActive ? FLOW_STYLE[flow.color].text : "text-slate-300"} />
                          <button
                            onClick={() => onFlowClick(flow)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all ${
                              isActive
                                ? `${FLOW_STYLE[flow.color].bg} ${FLOW_STYLE[flow.color].border} ${FLOW_STYLE[flow.color].text} shadow-sm`
                                : "bg-white border-slate-200 text-slate-400 hover:border-amber-300"
                            }`}
                          >
                            → {flow.label}
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Петля: Исполнение → Источники</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Служебные */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Служебные (вне основной архитектуры)</p>
        <div className="flex gap-2 flex-wrap text-xs text-gray-500">
          {["Полезные статьи", "В разработке"].map((n) => (
            <span key={n} className="bg-white border border-gray-200 px-2 py-1 rounded-lg">{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// РЕЖИМ 3: Сравнение
// ─────────────────────────────────────────
function CompareMode() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        Что конкретно меняется в платформе: названия, роли и решённые конфликты.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-bold text-slate-600">Было</th>
              <th className="text-left px-3 py-2 font-bold text-slate-600">Старая роль</th>
              <th className="text-left px-3 py-2 font-bold text-slate-600 text-center">→</th>
              <th className="text-left px-3 py-2 font-bold text-slate-600">Стало</th>
              <th className="text-left px-3 py-2 font-bold text-slate-600">Новая роль</th>
              <th className="text-left px-3 py-2 font-bold text-slate-600">Конфликт</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-slate-800 line-through decoration-slate-400">{row.was}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-400 text-[11px]">{row.wasRole}</td>
                <td className="px-3 py-2.5 text-center text-slate-400">→</td>
                <td className="px-3 py-2.5">
                  <span className="font-semibold text-slate-900">{row.became}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">
                    {row.becameRole}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {row.conflictResolved === true && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">✓ Снят</span>
                  )}
                  {row.conflictResolved === false && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">В работе</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Пояснения */}
      <div className="flex flex-col gap-2">
        {COMPARISON_ROWS.map((row, i) => (
          <div key={i} className={`rounded-lg border px-3 py-2 ${row.conflictResolved === false ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white"}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-semibold text-slate-800">{row.was}</span>
              <Icon name="ArrowRight" size={11} className="text-slate-400" />
              <span className="text-xs font-semibold text-violet-700">{row.became}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{row.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// РЕЖИМ 4: Конфликты
// ─────────────────────────────────────────
const RISK_CONFIG = {
  high:   { label: "Высокий риск", className: "bg-red-100 text-red-700 border-red-200", borderLeft: "border-l-red-400" },
  medium: { label: "Средний риск", className: "bg-amber-100 text-amber-700 border-amber-200", borderLeft: "border-l-amber-400" },
  low:    { label: "Низкий риск",  className: "bg-slate-100 text-slate-600 border-slate-200", borderLeft: "border-l-slate-300" },
};

const STATUS_CONFIG = {
  open:     { label: "Открыт",    className: "bg-red-50 text-red-600 border-red-200" },
  decided:  { label: "Решён",     className: "bg-green-50 text-green-700 border-green-200" },
  deferred: { label: "Отложен",   className: "bg-slate-50 text-slate-500 border-slate-200" },
};

const DECISION_LABEL: Record<string, string> = {
  keep: "Оставить", merge: "Объединить", split: "Разделить",
  rename: "Переименовать", move: "Перенести", deprecate: "Убрать",
  "needs-review": "Требует решения",
};

function ConflictCard({ c, index }: { c: OverlapCase; index: number }) {
  const [open, setOpen] = useState(false);
  const risk = RISK_CONFIG[c.riskLevel];
  const status = STATUS_CONFIG[c.status];
  return (
    <Card className={`overflow-hidden border-l-4 ${risk.borderLeft}`}>
      <button className="w-full text-left p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors" onClick={() => setOpen((v) => !v)}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${c.riskLevel === "high" ? "bg-red-100" : c.riskLevel === "medium" ? "bg-amber-100" : "bg-slate-100"}`}>
          <span className={`text-[10px] font-bold ${c.riskLevel === "high" ? "text-red-600" : c.riskLevel === "medium" ? "text-amber-600" : "text-slate-500"}`}>{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 items-center mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${risk.className}`}>{risk.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${status.className}`}>{status.label}</span>
            {c.decision && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-violet-50 text-violet-700 border-violet-200">
                {DECISION_LABEL[c.decision] ?? c.decision}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-800">{c.sharedFunction ?? c.sharedEntity ?? c.id}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            <span className="font-medium text-slate-600">{c.sectionA}</span>{" ↔ "}
            <span className="font-medium text-slate-600">{c.sectionB}</span>
          </p>
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-slate-400 shrink-0 mt-1" />
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">В чём проблема</p>
            <p className="text-xs text-slate-700 leading-relaxed">{c.problem}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Рекомендация</p>
            <p className="text-xs text-slate-600 leading-relaxed">{c.recommendation}</p>
          </div>
          {c.notes && (
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-[10px] text-slate-400 font-medium">Заметка: {c.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ConflictsMode() {
  const [filter, setFilter] = useState<"all" | "open" | "decided" | "deferred">("open");
  const filtered = OVERLAP_CASES.filter((c) => filter === "all" || c.status === filter);
  const counts = {
    all: OVERLAP_CASES.length,
    open: OVERLAP_CASES.filter((c) => c.status === "open").length,
    decided: OVERLAP_CASES.filter((c) => c.status === "decided").length,
    deferred: OVERLAP_CASES.filter((c) => c.status === "deferred").length,
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["all","open","decided","deferred"] as const).map((f) => {
          const labels = { all: "Все", open: "Открытые", decided: "Решённые", deferred: "Отложенные" };
          const colors = { all: "text-slate-700", open: "text-red-600", decided: "text-green-600", deferred: "text-slate-500" };
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
              {labels[f]}
              <span className={`text-[10px] font-bold ${filter === f ? colors[f] : "text-slate-400"}`}>{counts[f]}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((c, i) => <ConflictCard key={c.id} c={c} index={OVERLAP_CASES.indexOf(c)} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Мини-схема связей раздела
// ─────────────────────────────────────────
const MAX_NODES = 5;

interface MiniNodeProps {
  label: string;
  type: "from" | "to" | "bridge";
  hasConflict?: boolean;
  tooltip?: string;
}

function MiniNode({ label, type, hasConflict, tooltip }: MiniNodeProps) {
  const [hovered, setHovered] = useState(false);
  const styles = {
    from:   "bg-blue-50 border-blue-300 text-blue-700",
    to:     "bg-emerald-50 border-emerald-300 text-emerald-700",
    bridge: "bg-violet-50 border-violet-300 text-violet-700 border-dashed",
  };
  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium whitespace-nowrap ${styles[type]} ${hasConflict ? "ring-1 ring-amber-400" : ""}`}>
        {label}
        {hasConflict && <span className="ml-1 text-amber-500">⚠</span>}
      </div>
      {hovered && tooltip && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-44 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg px-2.5 py-1.5 shadow-xl z-50 pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

function SectionMiniMap({ section }: { section: SectionV2 }) {
  const [detail, setDetail] = useState(false);
  const cfg = getLayerConfig(section.layer);

  const fromNodes = section.dataFrom.slice(0, detail ? MAX_NODES : 4);
  const fromExtra = section.dataFrom.length - fromNodes.length;
  const toNodes   = section.dataTo.slice(0, detail ? MAX_NODES : 4);
  const toExtra   = section.dataTo.length - toNodes.length;
  const bridgeNodes = section.bridges.slice(0, detail ? 5 : 3);
  const bridgeExtra = section.bridges.length - bridgeNodes.length;

  // Тип потока в одну строку
  const FLOW_TYPE_LABEL: Record<string, string> = {
    sources:   "Вход: факты → Выход: сигналы",
    panorama:  "Вход: данные → Выход: картина и рекомендации",
    reflection:"Вход: картина → Выход: принципы и решения",
    codes:     "Вход: осмысление → Выход: правила и рамки",
    execution: "Вход: решения → Выход: действия и факты",
    service:   "Служебный раздел",
  };

  // Путь на общей карте (upstream → current → downstream)
  const FLOW_PATH: Record<string, string> = {
    sources:   "Источники → [сюда] → Панорамы",
    panorama:  "Источники → [сюда] → Осмысление / Исполнение",
    reflection:"Панорамы → [сюда] → Кодексы / Исполнение",
    codes:     "Осмысление → [сюда] → Исполнение",
    execution: "Кодексы / Осмысление / Панорамы → [сюда] → Источники",
    service:   "Вне основной архитектуры",
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Заголовок + переключатель */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-slate-400">Схема связей</p>
        <button
          onClick={() => setDetail((v) => !v)}
          className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-violet-600 transition-colors"
        >
          <Icon name={detail ? "Minus" : "Plus"} size={10} />
          {detail ? "Упрощённо" : "Подробно"}
        </button>
      </div>

      {/* Путь на карте */}
      <div className="flex items-center gap-1 flex-wrap">
        {FLOW_PATH[section.layer].split("→").map((part, i, arr) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
              part.includes("[сюда]")
                ? `bg-gradient-to-r ${cfg.color} text-white`
                : "bg-slate-100 text-slate-600"
            }`}>{part.trim()}</span>
            {i < arr.length - 1 && <Icon name="ArrowRight" size={9} className="text-slate-400 shrink-0" />}
          </span>
        ))}
      </div>

      {/* Визуальная схема: вход → центр → выход */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col gap-2">

        {/* ВХОД */}
        {fromNodes.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="text-[9px] font-bold uppercase text-blue-500 tracking-wider">Вход — данные и сигналы</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {fromNodes.map((n, i) => (
                <MiniNode key={i} label={n} type="from" tooltip={`Передаёт данные/сигналы в «${section.labelNew ?? section.label}»`} />
              ))}
              {fromExtra > 0 && (
                <span className="text-[10px] text-blue-400 self-center">+{fromExtra}</span>
              )}
            </div>
          </div>
        )}

        {/* Стрелка вниз к центру */}
        {fromNodes.length > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-0">
              <div className="w-px h-2 bg-slate-300" />
              <Icon name="ChevronDown" size={12} className="text-slate-400" />
            </div>
          </div>
        )}

        {/* ЦЕНТР — текущий раздел */}
        <div className={`rounded-xl border-2 ${cfg.borderColor} bg-gradient-to-br ${cfg.bgColor} p-2.5 flex items-center gap-2.5`}>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
            <Icon name={section.icon} size={14} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-bold ${cfg.textColor} leading-tight truncate`}>{section.labelNew ?? section.label}</p>
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${cfg.textColor} opacity-70`}>{cfg.name}</span>
          </div>
          <div className="ml-auto shrink-0">
            <span className="text-[9px] bg-white/60 border border-white/80 px-1.5 py-0.5 rounded-full text-slate-500 font-medium">
              {section.hubLabel}
            </span>
          </div>
        </div>

        {/* Стрелка вниз к выходу */}
        {toNodes.length > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-0">
              <div className="w-px h-2 bg-slate-300" />
              <Icon name="ChevronDown" size={12} className="text-slate-400" />
            </div>
          </div>
        )}

        {/* ВЫХОД */}
        {toNodes.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-wider">Выход — результат</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {toNodes.map((n, i) => (
                <MiniNode key={i} label={n} type="to" tooltip={`«${section.labelNew ?? section.label}» передаёт данные/решения сюда`} />
              ))}
              {toExtra > 0 && (
                <span className="text-[10px] text-emerald-400 self-center">+{toExtra}</span>
              )}
            </div>
          </div>
        )}

        {/* Разделитель */}
        {bridgeNodes.length > 0 && <div className="border-t border-dashed border-slate-200 mt-1" />}

        {/* МОСТИКИ */}
        {bridgeNodes.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
              <span className="text-[9px] font-bold uppercase text-violet-500 tracking-wider">Мостики — переходы</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {bridgeNodes.map((b, i) => (
                <MiniNode key={i} label={b} type="bridge" tooltip="Смысловой переход — пользователь может перейти отсюда" />
              ))}
              {bridgeExtra > 0 && (
                <span className="text-[10px] text-violet-400 self-center">+{bridgeExtra}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Тип потока одной строкой */}
      <p className="text-[10px] text-slate-400 italic">{FLOW_TYPE_LABEL[section.layer]}</p>
    </div>
  );
}

// ─────────────────────────────────────────
// Правая панель: карточка раздела (3 колонки)
// ─────────────────────────────────────────
function SectionDetailPanel({ section, onClose }: { section: SectionV2; onClose: () => void }) {
  const cfg = getLayerConfig(section.layer);
  const relatedConflicts = OVERLAP_CASES.filter((c) => section.conflicts.includes(c.id));

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto">
      {/* Шапка */}
      <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white shadow shrink-0`}>
            <Icon name={section.icon} size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{section.labelNew ?? section.label}</h2>
            {section.labelNew && section.labelNew !== section.label && (
              <p className="text-[10px] text-slate-400">Было: <span className="line-through">{section.label}</span></p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${ROLE_LAYER_COLOR[section.layer]}`}>
                {cfg.name}
              </span>
              <span className="text-[10px] text-slate-400">хаб: {section.hubLabel}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-7 w-7">
          <Icon name="X" size={14} />
        </Button>
      </div>

      {/* Тэглайн */}
      <p className="text-xs text-slate-500 italic px-4 py-2 bg-slate-50 border-b border-slate-100">
        «{section.tagline}»
      </p>

      {/* 3 колонки */}
      <div className="flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* Левая: мета */}
        <div className="lg:w-[28%] p-4 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Зачем нужен</p>
            <p className="text-xs text-slate-700 leading-relaxed">{section.purpose}</p>
          </div>

          {/* Что внутри */}
          {section.sections.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Что внутри</p>
                <div className="flex flex-col gap-0.5">
                  {section.sections.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-br ${cfg.color} shrink-0`} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {section.changeNote && (
            <>
              <Separator />
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Было → Стало</p>
                <p className="text-xs text-slate-600 leading-relaxed">{section.changeNote}</p>
              </div>
            </>
          )}
          {section.path && (
            <Button variant="outline" size="sm" className="w-full gap-1.5 mt-auto text-xs h-7"
              onClick={() => window.open(section.path, "_blank")}>
              <Icon name="ExternalLink" size={12} />
              Открыть раздел
            </Button>
          )}
        </div>

        {/* Центр: МИНИ-СХЕМА */}
        <div className="lg:w-[40%] p-4">
          <SectionMiniMap section={section} />
        </div>

        {/* Правая: что не делает + конфликты */}
        <div className="lg:w-[32%] p-4 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Что НЕ делает</p>
            <div className="flex flex-col gap-1">
              {section.notDoes.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                  <Icon name="X" size={10} className="text-red-400 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {relatedConflicts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Конфликты</p>
              <div className="flex flex-col gap-1">
                {relatedConflicts.map((c) => {
                  const risk = RISK_CONFIG[c.riskLevel];
                  return (
                    <div key={c.id} className={`rounded-lg border px-2 py-1.5 ${c.riskLevel === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-[9px] px-1 py-0.5 rounded border font-bold ${risk.className}`}>{risk.label}</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded border font-medium ${STATUS_CONFIG[c.status].className}`}>{STATUS_CONFIG[c.status].label}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium">{c.sharedFunction}</p>
                      <p className="text-[10px] text-slate-500">{c.sectionA} ↔ {c.sectionB}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ГЛАВНЫЙ КОМПОНЕНТ
// ─────────────────────────────────────────
export default function AdminProjectV2() {
  const [mode, setMode] = useState<Mode>("as-is");
  const [selectedSection, setSelectedSection] = useState<SectionV2 | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<DataFlow | null>(null);

  const handleSectionClick = (s: SectionV2) => {
    setSelectedFlow(null);
    setSelectedSection((prev) => (prev?.id === s.id ? null : s));
  };
  const handleFlowClick = (f: DataFlow) => {
    setSelectedSection(null);
    setSelectedFlow((prev) => (prev?.id === f.id ? null : f));
  };
  const handleClose = () => {
    setSelectedSection(null);
    setSelectedFlow(null);
  };

  const openConflicts = OVERLAP_CASES.filter((c) => c.status === "open").length;
  const renamed = SECTIONS_V2.filter((s) => s.labelNew && s.labelNew !== s.label).length;

  const hasRightPanel = (selectedSection && (mode === "as-is" || mode === "after"))
    || (selectedFlow && mode === "after");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">

        {/* Шапка */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-slate-400">Админка / Инструменты управления / Проект после изменения</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow shrink-0">
              <Icon name="Layers" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Проект платформы «Наша Семья»</h1>
              <p className="text-xs text-slate-500">Визуальный макет текущей и целевой архитектуры платформы</p>
            </div>
          </div>
        </div>

        {/* Сводка */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Хабов", value: HUBS_AS_IS.filter(h => h.id !== "articles" && h.id !== "in-dev").length, icon: "LayoutGrid", color: "text-violet-600" },
            { label: "Разделов", value: SECTIONS_V2.length, icon: "List", color: "text-blue-600" },
            { label: "Переименований", value: renamed, icon: "Tag", color: "text-amber-600" },
            { label: "Открытых конфликтов", value: openConflicts, icon: "AlertTriangle", color: "text-red-500" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 flex items-center gap-3">
              <div className={stat.color}><Icon name={stat.icon} size={20} /></div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Переключатель режимов */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white overflow-hidden w-fit shadow-sm">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); handleClose(); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors border-r border-slate-100 last:border-0 ${
                mode === m.id ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}>
              <Icon name={m.icon} size={13} />
              {m.label}
              {m.id === "conflicts" && openConflicts > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mode === "conflicts" ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                  {openConflicts}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Основной контент */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Левая часть: основной режим */}
          <div className={`transition-all duration-200 ${hasRightPanel ? "lg:w-[45%]" : "w-full"}`}>
            {mode === "as-is"     && <AsIsMode onSectionClick={handleSectionClick} />}
            {mode === "after"     && (
              <AfterMode
                selectedSection={selectedSection}
                onSectionClick={handleSectionClick}
                selectedFlow={selectedFlow}
                onFlowClick={handleFlowClick}
              />
            )}
            {mode === "compare"   && <CompareMode />}
            {mode === "conflicts" && <ConflictsMode />}
          </div>

          {/* Правая панель */}
          {hasRightPanel && (
            <div className="lg:w-[55%]">
              <Card className="overflow-hidden sticky top-4 max-h-[88vh]">
                {selectedSection && <SectionDetailPanel section={selectedSection} onClose={handleClose} />}
                {selectedFlow && !selectedSection && <FlowDetailPanel flow={selectedFlow} onClose={handleClose} />}
              </Card>
            </div>
          )}
        </div>

        {/* Легенда слоёв */}
        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Архитектурные слои платформы</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {LAYERS_V2.filter((l) => l.id !== "service").map((layer) => (
              <div key={layer.id} className={`rounded-xl border-2 ${layer.borderColor} ${layer.bgColor} p-2.5`}>
                <p className={`text-xs font-bold ${layer.textColor} mb-1`}>{layer.name}</p>
                <p className="text-[10px] text-slate-600 leading-tight">{layer.description}</p>
                <p className="text-[10px] text-slate-400 mt-1">{getSectionsByLayer(layer.id).length} разделов</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}