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
  getSectionsByLayer,
  getSectionsByHub,
  getLayerConfig,
  type SectionV2,
  type ArchLayer,
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
function SectionChip({
  section,
  onClick,
  isSelected,
}: {
  section: SectionV2;
  onClick: () => void;
  isSelected: boolean;
}) {
  const hasConflict = section.conflicts.length > 0;
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
        isSelected
          ? "bg-violet-600 text-white border-violet-600 shadow-md"
          : "bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:shadow-sm"
      }`}
    >
      <Icon name={section.icon} size={12} className={isSelected ? "text-white" : "text-slate-400"} />
      <span>{section.labelNew ?? section.label}</span>
      {section.labelNew && section.labelNew !== section.label && !isSelected && (
        <span className="text-[9px] text-amber-500">↑</span>
      )}
      {hasConflict && !isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
      )}
    </button>
  );
}

function AfterMode({
  selectedSection,
  onSectionClick,
}: {
  selectedSection: SectionV2 | null;
  onSectionClick: (s: SectionV2) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        Разделы расположены по архитектурным слоям — не по хабам.
        <span className="text-amber-600 font-medium"> ↑ = переименование · </span>
        <span className="text-red-500 font-medium">● = открытый конфликт</span>.
        Кликни на раздел — увидишь полную карточку.
      </p>
      {LAYER_ORDER_V2.map((layerId, idx) => {
        const cfg = getLayerConfig(layerId);
        const sections = getSectionsByLayer(layerId);
        return (
          <div key={layerId} className="flex flex-col items-center gap-0">
            <div className={`w-full rounded-2xl border-2 ${cfg.borderColor} ${cfg.bgColor} p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor}`}>{cfg.name}</span>
                <span className={`text-[11px] ${cfg.textColor} opacity-70`}>— {cfg.description}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sections.map((s) => (
                  <SectionChip
                    key={s.id}
                    section={s}
                    onClick={() => onSectionClick(s)}
                    isSelected={selectedSection?.id === s.id}
                  />
                ))}
              </div>
            </div>
            {idx < LAYER_ORDER_V2.length - 1 && (
              <div className="flex flex-col items-center py-0.5">
                <div className="w-px h-3 bg-slate-300" />
                <Icon name="ChevronDown" size={13} className="text-slate-400" />
                <div className="w-px h-3 bg-slate-300" />
              </div>
            )}
          </div>
        );
      })}
      {/* Служебные */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Служебные</p>
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
        <div className="lg:w-[30%] p-4 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Зачем нужен</p>
            <p className="text-xs text-slate-700 leading-relaxed">{section.purpose}</p>
          </div>
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

        {/* Центр: схема связей */}
        <div className="lg:w-[35%] p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase text-slate-400">Схема связей</p>

          {/* Что внутри */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 mb-1">Что внутри ({section.sections.length})</p>
            <div className="flex flex-col gap-0.5">
              {section.sections.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className={`w-1 h-1 rounded-full bg-gradient-to-br ${cfg.color} shrink-0`} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {section.dataFrom.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-blue-500 mb-1">⬅ Берёт данные из</p>
              <div className="flex flex-col gap-0.5">
                {section.dataFrom.map((d, i) => (
                  <div key={i} className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5">{d}</div>
                ))}
              </div>
            </div>
          )}

          {section.dataTo.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-emerald-500 mb-1">➡ Передаёт данные в</p>
              <div className="flex flex-col gap-0.5">
                {section.dataTo.map((d, i) => (
                  <div key={i} className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">{d}</div>
                ))}
              </div>
            </div>
          )}

          {section.bridges.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-violet-500 mb-1">🔗 Мостики</p>
              <div className="flex flex-col gap-0.5">
                {section.bridges.map((b, i) => (
                  <div key={i} className="text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-md px-2 py-0.5">{b}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Правая: что не делает + конфликты */}
        <div className="lg:w-[35%] p-4 flex flex-col gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">⚠ Что НЕ делает</p>
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

  const handleSectionClick = (s: SectionV2) => {
    setSelectedSection((prev) => (prev?.id === s.id ? null : s));
  };
  const handleClose = () => setSelectedSection(null);

  const openConflicts = OVERLAP_CASES.filter((c) => c.status === "open").length;
  const renamed = SECTIONS_V2.filter((s) => s.labelNew && s.labelNew !== s.label).length;

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
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden w-fit shadow-sm">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); setSelectedSection(null); }}
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
          <div className={`transition-all ${selectedSection ? "lg:w-[45%]" : "w-full"}`}>
            {mode === "as-is"     && <AsIsMode onSectionClick={handleSectionClick} />}
            {mode === "after"     && <AfterMode selectedSection={selectedSection} onSectionClick={handleSectionClick} />}
            {mode === "compare"   && <CompareMode />}
            {mode === "conflicts" && <ConflictsMode />}
          </div>

          {/* Правая панель: карточка раздела */}
          {selectedSection && (mode === "as-is" || mode === "after") && (
            <div className="lg:w-[55%]">
              <Card className="overflow-hidden sticky top-4 max-h-[88vh]">
                <SectionDetailPanel section={selectedSection} onClose={handleClose} />
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
