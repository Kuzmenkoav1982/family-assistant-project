import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { OVERLAP_CASES } from "@/data/atlas/platformDecisions";
import type { OverlapCase } from "@/data/atlas/types";
import {
  HUBS_V2,
  LAYERS,
  LAYER_ORDER,
  getHubsByLayer,
  getLayerConfig,
  type HubV2,
  type LayerType,
} from "@/data/projectV2/hubs";

// ─────────────────────────────────────────
// Бейджи
// ─────────────────────────────────────────
const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  P1: { label: "P1 · Срочно", className: "bg-red-100 text-red-700 border-red-200" },
  P2: { label: "P2 · Важно", className: "bg-amber-100 text-amber-700 border-amber-200" },
  P3: { label: "P3 · Позже", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const CHANGE_BADGE: Record<string, { label: string; className: string }> = {
  rename: { label: "Переименование", className: "bg-blue-100 text-blue-700 border-blue-200" },
  restructure: { label: "Реструктуризация", className: "bg-orange-100 text-orange-700 border-orange-200" },
  unchanged: { label: "Без изменений", className: "bg-green-100 text-green-700 border-green-200" },
  new: { label: "Новый раздел", className: "bg-purple-100 text-purple-700 border-purple-200" },
};

// ─────────────────────────────────────────
// Карточка хаба в дереве
// ─────────────────────────────────────────
function HubTreeCard({
  hub,
  onClick,
  isSelected,
}: {
  hub: HubV2;
  onClick: (hub: HubV2) => void;
  isSelected: boolean;
}) {
  const changed = hub.changeType === "rename" || hub.changeType === "restructure" || hub.changeType === "new";
  return (
    <button
      onClick={() => onClick(hub)}
      className={`
        group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer
        ${isSelected ? "border-violet-400 bg-violet-50 shadow-md scale-105" : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm hover:scale-102"}
      `}
      style={{ minWidth: 96, maxWidth: 120 }}
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}
      >
        <Icon name={hub.icon} size={18} />
      </div>
      <span className="text-[11px] font-semibold text-center leading-tight text-slate-800">
        {hub.nameNew}
      </span>
      {changed && (
        <span className="text-[9px] text-slate-400 line-through leading-none">{hub.nameOld}</span>
      )}
      {hub.changeType !== "unchanged" && (
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────
// Слой в дереве
// ─────────────────────────────────────────
function LayerRow({
  layerId,
  selectedHub,
  onHubClick,
}: {
  layerId: LayerType;
  selectedHub: HubV2 | null;
  onHubClick: (hub: HubV2) => void;
}) {
  const config = getLayerConfig(layerId);
  const hubs = getHubsByLayer(layerId);

  return (
    <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold uppercase tracking-widest ${config.color}`}>
          {config.name}
        </span>
        <span className={`text-xs ${config.color} opacity-70`}>— {config.description}</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {hubs.map((hub) => (
          <div key={hub.id} className="relative">
            <HubTreeCard
              hub={hub}
              onClick={onHubClick}
              isSelected={selectedHub?.id === hub.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Карточка детали хаба (правая панель)
// ─────────────────────────────────────────
function HubDetailPanel({ hub, onClose }: { hub: HubV2; onClose: () => void }) {
  const layerConfig = getLayerConfig(hub.layer);
  const pBadge = PRIORITY_BADGE[hub.priority];
  const cBadge = CHANGE_BADGE[hub.changeType];

  const fromConnections = hub.connections.filter((c) => c.direction === "from");
  const toConnections = hub.connections.filter((c) => c.direction === "to");

  const getHubName = (id: string) => HUBS_V2.find((h) => h.id === id)?.nameNew ?? id;
  const getHubColor = (id: string) => HUBS_V2.find((h) => h.id === id)?.color ?? "from-slate-400 to-slate-500";
  const getHubIcon = (id: string) => HUBS_V2.find((h) => h.id === id)?.icon ?? "Circle";

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Шапка */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center text-white shadow`}
          >
            <Icon name={hub.icon} size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{hub.nameNew}</h2>
            {hub.changeType !== "unchanged" && (
              <p className="text-xs text-slate-400">Было: {hub.nameOld}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <Icon name="X" size={16} />
        </Button>
      </div>

      {/* Бейджи */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${layerConfig.bgColor} ${layerConfig.color} ${layerConfig.borderColor}`}
        >
          {layerConfig.name}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${pBadge.className}`}>
          {pBadge.label}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cBadge.className}`}>
          {cBadge.label}
        </span>
      </div>

      {/* Тэглайн */}
      <p className="text-sm font-medium text-slate-600 italic">«{hub.tagline}»</p>

      <Separator />

      {/* Зачем нужен */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Зачем нужен</h3>
        <p className="text-sm text-slate-700 leading-relaxed">{hub.purpose}</p>
      </div>

      {/* Что внутри */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Что внутри ({hub.sections.length} разделов)
        </h3>
        <div className="flex flex-col gap-1.5">
          {hub.sections.map((s, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${hub.color} flex items-center justify-center text-white shrink-0 mt-0.5`}>
                <span className="text-[9px] font-bold">{i + 1}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Схема связей */}
      {(fromConnections.length > 0 || toConnections.length > 0) && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Связи с другими разделами</h3>
          <div className="flex flex-col gap-2">
            {fromConnections.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5">⬅ Берёт данные из</p>
                <div className="flex flex-col gap-1">
                  {fromConnections.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 border border-blue-100">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getHubColor(c.hubId)} flex items-center justify-center text-white shrink-0`}>
                        <Icon name={getHubIcon(c.hubId)} size={11} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-blue-800">{getHubName(c.hubId)}</span>
                        <span className="text-xs text-blue-600"> — {c.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {toConnections.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5">➡ Передаёт данные в</p>
                <div className="flex flex-col gap-1">
                  {toConnections.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${getHubColor(c.hubId)} flex items-center justify-center text-white shrink-0`}>
                        <Icon name={getHubIcon(c.hubId)} size={11} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-emerald-800">{getHubName(c.hubId)}</span>
                        <span className="text-xs text-emerald-600"> — {c.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Что НЕ делает */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">⚠ Что НЕ делает</h3>
        <div className="flex flex-col gap-1">
          {hub.notDoes.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-red-50 border border-red-100 rounded-lg p-2">
              <Icon name="X" size={12} className="text-red-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Перейти в раздел */}
      {hub.path && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => window.open(hub.path, "_blank")}
        >
          <Icon name="ExternalLink" size={14} />
          Открыть раздел
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Вид: Сетка карточек
// ─────────────────────────────────────────
function GridView({
  selectedHub,
  onHubClick,
}: {
  selectedHub: HubV2 | null;
  onHubClick: (hub: HubV2) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {LAYER_ORDER.map((layerId) => {
        const config = getLayerConfig(layerId);
        const hubs = getHubsByLayer(layerId);
        return (
          <div key={layerId}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-sm font-bold ${config.color}`}>{config.name}</span>
              <span className="text-xs text-slate-400">{config.description}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {hubs.map((hub) => {
                const changed = hub.changeType !== "unchanged";
                const cBadge = CHANGE_BADGE[hub.changeType];
                return (
                  <button
                    key={hub.id}
                    onClick={() => onHubClick(hub)}
                    className={`
                      text-left flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer
                      ${selectedHub?.id === hub.id ? "border-violet-400 bg-violet-50 shadow-md" : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm"}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                        <Icon name={hub.icon} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{hub.nameNew}</p>
                        {changed && (
                          <p className="text-[10px] text-slate-400 line-through leading-none">{hub.nameOld}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{hub.tagline}</p>
                    <div className="flex flex-wrap gap-1">
                      {changed && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${cBadge.className}`}>
                          {cBadge.label}
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200 font-medium">
                        {hub.sections.length} разделов
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// Вид: Древо
// ─────────────────────────────────────────
function TreeView({
  selectedHub,
  onHubClick,
}: {
  selectedHub: HubV2 | null;
  onHubClick: (hub: HubV2) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {LAYER_ORDER.map((layerId, idx) => (
        <div key={layerId} className="flex flex-col items-center gap-0">
          <LayerRow layerId={layerId} selectedHub={selectedHub} onHubClick={onHubClick} />
          {idx < LAYER_ORDER.length - 1 && (
            <div className="flex flex-col items-center gap-0 py-1">
              <div className="w-px h-3 bg-slate-300" />
              <Icon name="ChevronDown" size={14} className="text-slate-400" />
              <div className="w-px h-3 bg-slate-300" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Блок: Открытые конфликты
// ─────────────────────────────────────────
const RISK_CONFIG = {
  high:   { label: "Высокий риск",   className: "bg-red-100 text-red-700 border-red-200",     icon: "AlertTriangle" },
  medium: { label: "Средний риск",   className: "bg-amber-100 text-amber-700 border-amber-200", icon: "AlertCircle" },
  low:    { label: "Низкий риск",    className: "bg-slate-100 text-slate-600 border-slate-200", icon: "Info" },
};

const STATUS_CONFIG = {
  open:     { label: "Открыт",   className: "bg-red-50 text-red-600 border-red-200" },
  decided:  { label: "Решён",    className: "bg-green-50 text-green-700 border-green-200" },
  deferred: { label: "Отложен", className: "bg-slate-50 text-slate-500 border-slate-200" },
};

const DECISION_LABEL: Record<string, string> = {
  keep: "Оставить как есть",
  merge: "Объединить",
  split: "Разделить",
  rename: "Переименовать",
  move: "Перенести",
  deprecate: "Убрать",
  "needs-review": "Требует решения",
};

function ConflictCard({ c, index }: { c: OverlapCase; index: number }) {
  const [open, setOpen] = useState(false);
  const risk = RISK_CONFIG[c.riskLevel];
  const status = STATUS_CONFIG[c.status];

  return (
    <Card className={`overflow-hidden border-l-4 ${c.riskLevel === "high" ? "border-l-red-400" : c.riskLevel === "medium" ? "border-l-amber-400" : "border-l-slate-300"}`}>
      <button
        className="w-full text-left p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${c.riskLevel === "high" ? "bg-red-100" : c.riskLevel === "medium" ? "bg-amber-100" : "bg-slate-100"}`}>
          <span className={`text-[10px] font-bold ${c.riskLevel === "high" ? "text-red-600" : c.riskLevel === "medium" ? "text-amber-600" : "text-slate-500"}`}>
            {index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 items-center mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${risk.className}`}>
              {risk.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${status.className}`}>
              {status.label}
            </span>
            {c.decision && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-violet-50 text-violet-700 border-violet-200">
                {DECISION_LABEL[c.decision] ?? c.decision}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-800">
            {c.sharedFunction ?? c.sharedEntity ?? c.id}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            <span className="font-medium text-slate-600">{c.sectionA}</span>
            {" ↔ "}
            <span className="font-medium text-slate-600">{c.sectionB}</span>
          </p>
        </div>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={14}
          className="text-slate-400 shrink-0 mt-1"
        />
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

function ConflictsSection() {
  const [filter, setFilter] = useState<"all" | "open" | "decided" | "deferred">("open");

  const filtered = OVERLAP_CASES.filter((c) => filter === "all" || c.status === filter);
  const openCount = OVERLAP_CASES.filter((c) => c.status === "open").length;
  const decidedCount = OVERLAP_CASES.filter((c) => c.status === "decided").length;
  const deferredCount = OVERLAP_CASES.filter((c) => c.status === "deferred").length;

  const FILTERS: Array<{ key: typeof filter; label: string; count: number; color: string }> = [
    { key: "all",      label: "Все",      count: OVERLAP_CASES.length, color: "text-slate-700" },
    { key: "open",     label: "Открытые", count: openCount,    color: "text-red-600" },
    { key: "decided",  label: "Решённые", count: decidedCount, color: "text-green-600" },
    { key: "deferred", label: "Отложенные", count: deferredCount, color: "text-slate-500" },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
            <Icon name="AlertTriangle" size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Открытые конфликты архитектуры</h3>
            <p className="text-[11px] text-slate-500">Пересечения и дублирования, которые нужно решить</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
          <Icon name="AlertCircle" size={14} />
          {openCount} требуют решения
        </div>
      </div>

      {/* Фильтр */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === f.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
            <span className={`text-[10px] font-bold ${filter === f.key ? f.color : "text-slate-400"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Список */}
      <div className="flex flex-col gap-2">
        {filtered.map((c, i) => (
          <ConflictCard key={c.id} c={c} index={OVERLAP_CASES.indexOf(c)} />
        ))}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────
// Главный компонент страницы
// ─────────────────────────────────────────
export default function AdminProjectV2() {
  const [view, setView] = useState<"tree" | "grid">("tree");
  const [selectedHub, setSelectedHub] = useState<HubV2 | null>(null);

  const handleHubClick = (hub: HubV2) => {
    setSelectedHub((prev) => (prev?.id === hub.id ? null : hub));
  };

  // Статистика изменений
  const renamed = HUBS_V2.filter((h) => h.changeType === "rename").length;
  const p1 = HUBS_V2.filter((h) => h.priority === "P1").length;
  const totalSections = HUBS_V2.reduce((sum, h) => sum + h.sections.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
        {/* Шапка */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow">
              <Icon name="Layers" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Проект v2 — Платформа «Наша Семья»</h1>
              <p className="text-xs text-slate-500">Визуальный макет после реорганизации по советам эксперта</p>
            </div>
          </div>
        </div>

        {/* Сводка */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Разделов платформы", value: HUBS_V2.length, icon: "LayoutGrid", color: "text-violet-600" },
            { label: "Всего подразделов", value: totalSections, icon: "List", color: "text-blue-600" },
            { label: "Переименований", value: renamed, icon: "Tag", color: "text-amber-600" },
            { label: "Приоритет P1", value: p1, icon: "Flame", color: "text-red-500" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 flex items-center gap-3">
              <div className={`${stat.color}`}>
                <Icon name={stat.icon} size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Легенда изменений */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 font-medium">Легенда:</span>
          {Object.entries(CHANGE_BADGE).map(([key, val]) => (
            <span key={key} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${val.className}`}>
              {val.label}
            </span>
          ))}
          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 font-medium">
            ● = есть изменения
          </span>
        </div>

        {/* Переключатель вида */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Вид:</span>
          <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => setView("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "tree" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon name="GitBranch" size={13} />
              Древо
            </button>
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "grid" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon name="LayoutGrid" size={13} />
              Карточки
            </button>
          </div>
          {selectedHub && (
            <span className="text-xs text-slate-400">
              Выбран: <span className="font-semibold text-violet-600">{selectedHub.nameNew}</span> — кликни снова чтобы закрыть
            </span>
          )}
        </div>

        {/* Основной контент */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Левая часть: дерево или сетка */}
          <div className={`transition-all ${selectedHub ? "lg:w-[55%]" : "w-full"}`}>
            {view === "tree" ? (
              <TreeView selectedHub={selectedHub} onHubClick={handleHubClick} />
            ) : (
              <GridView selectedHub={selectedHub} onHubClick={handleHubClick} />
            )}
          </div>

          {/* Правая панель: детали хаба */}
          {selectedHub && (
            <div className="lg:w-[45%]">
              <Card className="p-4 sticky top-4 max-h-[85vh] overflow-y-auto">
                <HubDetailPanel hub={selectedHub} onClose={() => setSelectedHub(null)} />
              </Card>
            </div>
          )}
        </div>

        {/* Слои — легенда внизу */}
        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Архитектурные слои платформы</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {LAYERS.map((layer) => (
              <div key={layer.id} className={`flex-1 rounded-xl border-2 ${layer.borderColor} ${layer.bgColor} p-3`}>
                <p className={`text-xs font-bold ${layer.color} mb-1`}>{layer.name}</p>
                <p className="text-[11px] text-slate-600 leading-tight">{layer.description}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {getHubsByLayer(layer.id).length} разделов
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Конфликты архитектуры */}
        <ConflictsSection />
      </div>
    </div>
  );
}