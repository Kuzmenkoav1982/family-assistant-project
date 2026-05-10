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
import {
  REAL_HUBS,
  STATUS_META,
  TYPE_META,
  MODALITY_META,
  KIND_META,
  countHub,
  getDiscrepancies,
  resolveEntityKind,
  type RealHub,
  type RealRow,
  type RealEntryStatus,
  type RealNodeType,
  type Modality,
  type EntityKind,
} from "@/data/projectV2/asIsReality";
import { LIFE_CYCLES, type LifeCycle, type LifeCycleId } from "@/data/projectV2/lifeCycles";
import ModalityBadge from "@/components/admin/ModalityBadge";
import KindBadge from "@/components/admin/KindBadge";
import PrinciplesMode from "@/components/admin/PrinciplesMode";
import ProgressMap, { type ProgressStep } from "@/components/ui/progress-map";

// ─────────────────────────────────────────
// Типы и константы
// ─────────────────────────────────────────
type Mode = "as-is" | "after" | "cycles" | "principles" | "compare" | "conflicts";

const MODES: Array<{ id: Mode; label: string; icon: string }> = [
  { id: "as-is",      label: "Как есть сейчас",   icon: "Eye" },
  { id: "after",      label: "После изменений",    icon: "Sparkles" },
  { id: "cycles",     label: "Циклы",              icon: "RefreshCcw" },
  { id: "principles", label: "Правила и логики",   icon: "BookOpen" },
  { id: "compare",    label: "Сравнение",          icon: "ArrowLeftRight" },
  { id: "conflicts",  label: "Конфликты",          icon: "AlertTriangle" },
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
// РЕЖИМ 1: Как есть сейчас (фактическая карта продукта)
// Источник A — реальное левое меню
// Источник B — реальные страницы хабов
// Расхождения показываем явно, не скрываем.
// ─────────────────────────────────────────
type AsIsFilter = "all" | "diff" | "hub" | "service" | "content";

const AS_IS_FILTERS: Array<{ id: AsIsFilter; label: string; icon: string }> = [
  { id: "all",     label: "Все",                 icon: "List" },
  { id: "diff",    label: "Требуют внимания",    icon: "AlertCircle" },
  { id: "hub",     label: "Только хабы",         icon: "LayoutGrid" },
  { id: "service", label: "Сервисные",           icon: "Settings" },
  { id: "content", label: "Контентные",          icon: "FileText" },
];

// ─────────────────────────────────────────
// Карта реализации плана архитектурной дочистки.
// Здесь команда сразу видит: что сделано, что в работе, что впереди.
// Обновляется по мере прохождения этапов.
// ─────────────────────────────────────────
const ROADMAP_STEPS: ProgressStep[] = [
  {
    id: "canon",
    label: "Канон сущностей",
    hint: "EntityKind + Modality",
    icon: "Boxes",
    status: "done",
  },
  {
    id: "modality",
    label: "Бейджи модальности",
    hint: "Право · Госданные · ИИ · …",
    icon: "ShieldCheck",
    status: "done",
  },
  {
    id: "cycles",
    label: "Карта циклов",
    hint: "5 фаз семьи в админке",
    icon: "RefreshCcw",
    status: "done",
  },
  {
    id: "household",
    label: "Дом и быт",
    hint: "Зонтики + заглушка «Дом»",
    icon: "Home",
    status: "done",
  },
  {
    id: "gov",
    label: "Госуслуги",
    hint: "Сервисы + Знание",
    icon: "Landmark",
    status: "done",
  },
  {
    id: "development",
    label: "Развитие",
    hint: "4 слоя-таба",
    icon: "Brain",
    status: "done",
  },
  {
    id: "positioning",
    label: "Позиционирование",
    hint: "«Семейная ОС» в hero и онбординге",
    icon: "Sparkles",
    status: "done",
  },
  {
    id: "investor",
    label: "Презентации",
    hint: "InvestorDeck + SlideHubs обновлены",
    icon: "Presentation",
    status: "done",
  },
  {
    id: "landing-audit",
    label: "Аудит лендинга",
    hint: "Противоречия устранены",
    icon: "Search",
    status: "done",
  },
  {
    id: "instructions",
    label: "Инструкции",
    hint: "Раздел «Семейная ОС» добавлен",
    icon: "BookOpen",
    status: "done",
  },
  {
    id: "home-module",
    label: "Модуль «Дом»",
    hint: "Квартира, коммуналка, показания, ремонты",
    icon: "Building",
    status: "done",
  },
  {
    id: "principles",
    label: "Правила и логики ОС",
    hint: "Каталог паттернов в админке",
    icon: "BookOpen",
    status: "done",
  },
  {
    id: "home-backend",
    label: "Backend для «Дома»",
    hint: "PostgreSQL + Cloud Function + изоляция family_id",
    icon: "Database",
    status: "done",
  },
];

function StatusBadge({ status }: { status: RealEntryStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold whitespace-nowrap ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function TypeBadge({ type }: { type: RealNodeType }) {
  const m = TYPE_META[type];
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

// Найти будущую архитектурную роль для пункта (по совпадению названия)
function findFutureLayer(hubArchId: string | undefined, label: string | null): ArchLayer | null {
  if (!hubArchId || !label) return null;
  const arch = SECTIONS_V2.filter((s) => s.hubId === hubArchId);
  const norm = (x: string) => x.toLowerCase().replace(/ё/g, "е").trim();
  const target = norm(label);
  const found = arch.find((s) => {
    if (norm(s.label) === target) return true;
    if (s.labelNew && norm(s.labelNew) === target) return true;
    return s.sections.some((sec) => norm(sec) === target);
  });
  return found?.layer ?? null;
}

function HubAsIsCard({
  hub,
  onRowClick,
  selectedRowKey,
}: {
  hub: RealHub;
  onRowClick: (hub: RealHub, row: RealRow) => void;
  selectedRowKey: string | null;
}) {
  const counters = countHub(hub);
  const discrepancies = getDiscrepancies(hub);
  const aiBlocks = hub.rows.filter((r) => r.status === "hero-ai");
  const linkedBlocks = hub.rows.filter((r) => r.status === "linked");
  const isHub = hub.type === "hub";

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {/* Шапка */}
      <div className={`flex items-start gap-2 px-3 py-2.5 bg-gradient-to-r ${hub.color} text-white`}>
        <Icon name={hub.icon} size={16} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold">{hub.menuLabel}</span>
            {hub.hubLabel && hub.hubLabel !== hub.menuLabel && (
              <>
                <Icon name="ArrowLeftRight" size={10} className="opacity-70" />
                <span className="text-xs font-bold opacity-90">{hub.hubLabel}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
              {TYPE_META[hub.type].label}
            </span>
            {isHub && (
              <>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
                  Меню: {counters.menu}
                </span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
                  На хабе: {counters.hub}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${counters.diff > 0 ? "bg-red-500/40" : "bg-emerald-500/40"}`}>
                  {counters.diff > 0 ? `Требуют внимания: ${counters.diff}` : "Всё в порядке"}
                </span>
                {counters.aiBlocks > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-violet-500/40">
                    ИИ-блоков: {counters.aiBlocks}
                  </span>
                )}
              </>
            )}
          </div>
          {counters.hasNameMismatch && (
            <p className="text-[10px] mt-1 text-white/90 italic">
              ⚠ Разное название: меню «{hub.menuLabel}» ↔ страница «{hub.hubLabel}»
            </p>
          )}
        </div>
      </div>

      {/* Тело */}
      {isHub ? (
        <>
          {/* Шапка таблицы */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
            <span className="text-[9px] font-bold uppercase text-slate-500">Левое меню</span>
            <span className="text-[9px] font-bold uppercase text-slate-500">Страница хаба</span>
            <span className="text-[9px] font-bold uppercase text-slate-500">Статус</span>
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            {hub.rows.map((r, i) => {
              const futureLayer = findFutureLayer(hub.archHubId, r.menu ?? r.hub);
              const key = `${hub.id}::${i}`;
              const isSel = selectedRowKey === key;
              return (
                <button
                  key={i}
                  onClick={() => onRowClick(hub, r)}
                  className={`grid grid-cols-[1fr_1fr_auto] gap-2 px-3 py-1.5 items-center text-left transition-colors ${
                    isSel ? "bg-violet-50 ring-1 ring-violet-300" : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[11px] truncate ${r.menu ? "text-slate-700" : "text-slate-300 italic"}`}>
                    {r.menu ?? "—"}
                  </span>
                  <span className={`text-[11px] truncate ${r.hub ? "text-slate-700" : "text-slate-300 italic"}`}>
                    {r.hub ?? "—"}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {r.modality && <ModalityBadge modality={r.modality} showLabel={false} />}
                    <StatusBadge status={r.status} />
                    {futureLayer && <RoleBadge layer={futureLayer} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Требуют внимания */}
          {discrepancies.length > 0 && (
            <div className="px-3 py-2 bg-amber-50 border-t border-amber-200">
              <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">
                Требуют внимания ({discrepancies.length})
              </p>
              <ul className="flex flex-col gap-0.5">
                {discrepancies.map((r) => (
                  <li key={`${hub.id}-d-${hub.rows.indexOf(r)}`}>
                    <button
                      onClick={() => onRowClick(hub, r)}
                      className="w-full text-left text-[10px] text-amber-800 leading-snug hover:bg-amber-100 rounded px-1 py-0.5 transition-colors"
                    >
                      <span className="font-semibold">{STATUS_META[r.status].label}:</span>{" "}
                      {r.menu && r.hub ? (
                        <>«{r.menu}» ↔ «{r.hub}»</>
                      ) : r.menu ? (
                        <>«{r.menu}»</>
                      ) : (
                        <>«{r.hub}»</>
                      )}
                      {r.crossHubOn && <> · показан также на «{r.crossHubOn}»</>}
                      {r.note && <span className="text-amber-600"> · {r.note}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Связки-шорткаты (намеренные карточки на чужие хабы) */}
          {linkedBlocks.length > 0 && (
            <div className="px-3 py-2 bg-sky-50 border-t border-sky-200">
              <p className="text-[10px] font-bold uppercase text-sky-700 mb-1">
                Связки-шорткаты ({linkedBlocks.length})
              </p>
              <ul className="flex flex-col gap-0.5">
                {linkedBlocks.map((r) => (
                  <li key={`${hub.id}-l-${hub.rows.indexOf(r)}`}>
                    <button
                      onClick={() => onRowClick(hub, r)}
                      className="w-full text-left text-[10px] text-sky-800 leading-snug hover:bg-sky-100 rounded px-1 py-0.5 transition-colors"
                    >
                      <span className="font-semibold">«{r.hub}»</span>
                      {r.crossHubOn && <> · из «{r.crossHubOn}»</>}
                      {r.note && <span className="text-sky-600"> · {r.note}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ИИ-блоки (нормальная hero-секция, не баг) */}
          {aiBlocks.length > 0 && (
            <div className="px-3 py-2 bg-violet-50 border-t border-violet-200">
              <p className="text-[10px] font-bold uppercase text-violet-700 mb-1">
                ИИ-блоки на странице ({aiBlocks.length})
              </p>
              <ul className="flex flex-col gap-0.5">
                {aiBlocks.map((r) => (
                  <li key={`${hub.id}-ai-${hub.rows.indexOf(r)}`}>
                    <button
                      onClick={() => onRowClick(hub, r)}
                      className="w-full text-left text-[10px] text-violet-800 leading-snug hover:bg-violet-100 rounded px-1 py-0.5 transition-colors"
                    >
                      <span className="font-semibold">«{r.hub}»</span>
                      {r.note && <span className="text-violet-600"> · {r.note}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="px-3 py-2.5 flex flex-col gap-2">
          {hub.description && (
            <p className="text-[11px] text-slate-600 leading-snug">{hub.description}</p>
          )}
          {hub.menuChild && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Icon name="CornerDownRight" size={11} />
              Подпункт меню: <span className="font-semibold text-slate-700">{hub.menuChild}</span>
            </div>
          )}
          {hub.tabs && hub.tabs.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase text-slate-500">Внутренние вкладки/фильтры</span>
              <div className="flex gap-1 flex-wrap">
                {hub.tabs.map((t) => (
                  <span key={t} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="text-[10px] text-slate-400 italic">
            Не относится к архитектурным хабам
          </div>
        </div>
      )}
    </div>
  );
}

function CrossHubBanner({
  onRowClick,
}: {
  onRowClick: (hub: RealHub, row: RealRow) => void;
}) {
  const crossRows: Array<{ label: string; hub: RealHub; row: RealRow; menuHub: string; pageHub: string }> = [];
  REAL_HUBS.forEach((h) => {
    h.rows.forEach((r) => {
      if (r.status === "cross-hub" && (r.menu || r.hub) && r.crossHubOn) {
        const label = r.menu ?? r.hub!;
        const exists = crossRows.find((x) => x.label === label);
        if (!exists) {
          crossRows.push({ label, hub: h, row: r, menuHub: h.menuLabel, pageHub: r.crossHubOn });
        }
      }
    });
  });
  if (crossRows.length === 0) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon name="GitBranch" size={14} className="text-red-600" />
        <span className="text-xs font-bold text-red-700 uppercase">Кросс-хаб кейсы</span>
      </div>
      <ul className="flex flex-col gap-1">
        {crossRows.map((r) => (
          <li key={r.label}>
            <button
              onClick={() => onRowClick(r.hub, r.row)}
              className="w-full text-left text-[11px] text-red-800 hover:bg-red-100 rounded px-1.5 py-0.5 transition-colors"
            >
              <span className="font-semibold">«{r.label}»</span>
              <span className="text-red-600"> · в меню: </span>«{r.menuHub}»
              <span className="text-red-600"> · на странице хаба: </span>«{r.pageHub}»
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AsIsMode({
  onSectionClick: _onSectionClick,
  onRowClick,
  selectedRowKey,
}: {
  onSectionClick: (s: SectionV2) => void;
  onRowClick: (hub: RealHub, row: RealRow) => void;
  selectedRowKey: string | null;
}) {
  const [filter, setFilter] = useState<AsIsFilter>("all");

  const filtered = REAL_HUBS.filter((h) => {
    if (filter === "all") return true;
    if (filter === "diff") {
      const c = countHub(h);
      return h.type === "hub" && c.diff > 0;
    }
    if (filter === "hub") return h.type === "hub";
    if (filter === "service") return h.type === "service";
    if (filter === "content") return h.type === "content";
    return true;
  });

  // Общая статистика
  const totals = REAL_HUBS.reduce(
    (acc, h) => {
      if (h.type === "hub") {
        const c = countHub(h);
        acc.hubs += 1;
        acc.diff += c.diff;
        acc.aiBlocks += c.aiBlocks;
      } else if (h.type === "service") acc.service += 1;
      else if (h.type === "content") acc.content += 1;
      return acc;
    },
    { hubs: 0, service: 0, content: 0, diff: 0, aiBlocks: 0 }
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
        <span className="font-bold text-slate-800">Фактическая карта продукта.</span>{" "}
        Слева — реальное левое меню (гармошка), справа — реальная страница хаба.
        В «Требуют внимания» попадают только реальные несоответствия (другое название, только в меню, только на хабе, кросс-хаб).
        ИИ-блоки и точки входа считаются нормой и вынесены отдельно.
        Бейджи будущих ролей оставлены как вторичный слой.
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="text-[9px] font-bold uppercase text-slate-400">Хабов</div>
          <div className="text-lg font-bold text-slate-800">{totals.hubs}</div>
        </div>
        <div className={`rounded-lg border px-3 py-2 ${totals.diff > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className={`text-[9px] font-bold uppercase ${totals.diff > 0 ? "text-red-500" : "text-emerald-600"}`}>Требуют внимания</div>
          <div className={`text-lg font-bold ${totals.diff > 0 ? "text-red-700" : "text-emerald-700"}`}>{totals.diff}</div>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
          <div className="text-[9px] font-bold uppercase text-violet-500">ИИ-блоков</div>
          <div className="text-lg font-bold text-violet-700">{totals.aiBlocks}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="text-[9px] font-bold uppercase text-slate-400">Сервисных</div>
          <div className="text-lg font-bold text-slate-800">{totals.service}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="text-[9px] font-bold uppercase text-slate-400">Контентных</div>
          <div className="text-lg font-bold text-slate-800">{totals.content}</div>
        </div>
      </div>

      {/* Фильтр */}
      <div className="flex gap-1.5 flex-wrap">
        {AS_IS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-semibold transition-all ${
              filter === f.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon name={f.icon} size={11} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Кросс-хаб */}
      <CrossHubBanner onRowClick={onRowClick} />

      {/* Карточки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((h) => (
          <HubAsIsCard
            key={h.id}
            hub={h}
            onRowClick={onRowClick}
            selectedRowKey={selectedRowKey}
          />
        ))}
      </div>

      {/* Легенда статусов */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Легенда статусов</p>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(STATUS_META) as RealEntryStatus[]).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Легенда канона сущностей */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Канон сущностей</p>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
          Что вообще существует в продукте. Каждый объект меню/хаба относится к одному из этих типов.
          Поле <span className="font-mono text-slate-600">kind</span> опционально — если не задано, тип выводится из статуса автоматически.
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(KIND_META) as EntityKind[]).map((k) => (
            <KindBadge key={k} kind={k} />
          ))}
        </div>
      </div>

      {/* Легенда модальности */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Модальность раздела</p>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
          «Жанр» доверия в глазах пользователя. Помогает удерживать единый язык в продукте, где рядом живут серьёзные (право, госданные)
          и мягкие (рефлексия, ИИ) сущности. Маркируется только там, где это важно — у обычных утилитарных функций бейдж не показывается.
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(MODALITY_META) as Modality[]).map((m) => (
            <ModalityBadge key={m} modality={m} />
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
// РЕЖИМ: Циклы (5 жизненных фаз семьи)
// Смысловая модель поверх хабов: Сбор → Панорама →
// Осмысление → Договорённости → Исполнение → (петля).
// ─────────────────────────────────────────
function CyclesMode({
  selectedCycle,
  onCycleClick,
}: {
  selectedCycle: LifeCycleId | null;
  onCycleClick: (id: LifeCycleId) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Подводка */}
      <div className="text-xs text-slate-600 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-lg px-3 py-2.5 leading-relaxed">
        <span className="font-bold text-slate-800">Жизненные циклы семьи.</span>{" "}
        Поверх предметных хабов работает 5 фаз жизни семьи: от сбора фактов до исполнения и обратной связи.
        Это смысловая модель продукта — она помогает понять, <span className="italic">зачем</span> каждый раздел существует,
        а не только <span className="italic">где</span> он лежит. Один хаб может работать в нескольких фазах одновременно.
      </div>

      {/* Лента циклов */}
      <div className="flex flex-col gap-2">
        {LIFE_CYCLES.map((cycle, idx) => (
          <CycleCard
            key={cycle.id}
            cycle={cycle}
            isSelected={selectedCycle === cycle.id}
            onClick={() => onCycleClick(cycle.id)}
            isLast={idx === LIFE_CYCLES.length - 1}
          />
        ))}
      </div>

      {/* Петля обратной связи */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shrink-0">
          <Icon name="RefreshCcw" size={16} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-700">Петля обратной связи</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            Результаты <span className="font-semibold text-blue-700">Исполнения</span> (выполненные задачи, потраченные деньги,
            пройденные привычки, состоявшиеся поездки) возвращаются в <span className="font-semibold text-slate-700">Сбор</span> как
            новые факты. Семья видит обновлённую картину — цикл запускается заново.
          </p>
        </div>
      </div>

      {/* Принципы использования модели */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="Compass" size={13} className="text-violet-600" />
            <p className="text-[11px] font-bold text-slate-700">Зачем эта карта</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Единый язык для команды: куда добавлять фичу, в какой фазе семьи она работает, какую ценность даёт.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="Layers" size={13} className="text-emerald-600" />
            <p className="text-[11px] font-bold text-slate-700">Как читать</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Циклы — горизонтальный разрез поверх вертикальных хабов. Один хаб может жить сразу в нескольких фазах.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="Target" size={13} className="text-amber-600" />
            <p className="text-[11px] font-bold text-slate-700">Что это даёт</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Помогает не превращать продукт в свалку фич: каждая идея получает место в одной из 5 фаз.
          </p>
        </div>
      </div>
    </div>
  );
}

function CycleCard({
  cycle,
  isSelected,
  onClick,
  isLast,
}: {
  cycle: LifeCycle;
  isSelected: boolean;
  onClick: () => void;
  isLast: boolean;
}) {
  return (
    <>
      <button
        onClick={onClick}
        className={`text-left rounded-xl border-2 transition-all ${cycle.bg} ${
          isSelected ? `${cycle.border} shadow-md ring-2 ring-offset-1 ring-violet-300` : `${cycle.border} hover:shadow-sm`
        }`}
      >
        <div className="flex items-start gap-3 p-3">
          {/* Порядковый номер + иконка */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cycle.color} flex items-center justify-center text-white shadow`}>
              <Icon name={cycle.icon} size={18} />
            </div>
            <span className={`text-[10px] font-bold ${cycle.textAccent}`}>Фаза {cycle.order}</span>
          </div>

          {/* Тело */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className={`text-sm font-bold ${cycle.textAccent}`}>{cycle.title}</h3>
              <span className="text-[11px] text-slate-500 italic">{cycle.subtitle}</span>
            </div>
            <p className="text-[11px] text-slate-700 mt-1 font-medium italic">«{cycle.question}»</p>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{cycle.description}</p>

            {/* Хабы фазы */}
            <div className="mt-2 flex flex-wrap gap-1">
              {cycle.hubs.map((h) => (
                <span
                  key={h.hubId + h.label}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${
                    h.primary
                      ? "bg-white border-slate-300 text-slate-700"
                      : "bg-white/60 border-slate-200 text-slate-500"
                  }`}
                  title={h.role}
                >
                  {h.primary && <span className="mr-1">●</span>}
                  {h.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Развёрнутая часть — роли хабов */}
        {isSelected && (
          <div className="border-t-2 border-dashed border-white/60 px-3 py-2.5 bg-white/50">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">Роли хабов в этой фазе</p>
            <ul className="flex flex-col gap-1">
              {cycle.hubs.map((h) => (
                <li key={h.hubId + h.label} className="text-[11px] flex items-baseline gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold shrink-0 ${
                    h.primary ? "bg-white border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    {h.label}
                  </span>
                  <span className="text-slate-600 leading-snug">{h.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </button>

      {/* Стрелка между циклами */}
      {!isLast && (
        <div className="flex items-center gap-2 px-4 py-0.5">
          <Icon name="ChevronDown" size={14} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 italic">{cycle.nextHint}</span>
        </div>
      )}
      {isLast && (
        <div className="flex items-center gap-2 px-4 py-0.5">
          <Icon name="RefreshCcw" size={14} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 italic">{cycle.nextHint}</span>
        </div>
      )}
    </>
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
// Утилита: найти раздел по метке
// ─────────────────────────────────────────
function findSectionByLabel(label: string): SectionV2 | undefined {
  return SECTIONS_V2.find(
    (s) => s.label === label || s.labelNew === label || s.id === label
  );
}

// ─────────────────────────────────────────
// Мини-схема связей раздела
// ─────────────────────────────────────────
const MAX_NODES = 5;

// Мини-панель мостика (открывается по клику)
function BridgePopup({
  bridge,
  onClose,
  onNavigate,
}: {
  bridge: string;
  onClose: () => void;
  onNavigate: (s: SectionV2) => void;
}) {
  // Пытаемся извлечь куда ведёт мостик из строки вида "Текст → Раздел"
  const parts = bridge.split("→");
  const action = parts[0].trim();
  const target = parts[1]?.trim() ?? null;
  const targetSection = target ? findSectionByLabel(target) : null;

  return (
    <div className="absolute z-50 bottom-full mb-2 left-0 w-52 bg-white border border-violet-200 rounded-xl shadow-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-violet-500 tracking-wider">Мостик</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <Icon name="X" size={11} />
        </button>
      </div>
      <p className="text-xs font-semibold text-slate-800">{action}</p>
      {target && (
        <p className="text-[10px] text-slate-500">
          Ведёт в: <span className="font-semibold text-violet-700">{target}</span>
        </p>
      )}
      <p className="text-[10px] text-slate-400 leading-relaxed">
        Смысловой переход — пользователь сам решает, когда перейти отсюда.
      </p>
      {targetSection && (
        <button
          onClick={() => { onNavigate(targetSection); onClose(); }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1 hover:bg-violet-100 transition-colors"
        >
          <Icon name="ArrowRight" size={11} />
          Перейти в «{targetSection.labelNew ?? targetSection.label}»
        </button>
      )}
      <div className="absolute top-full left-4 border-4 border-transparent border-t-white" style={{ filter: "drop-shadow(0 1px 0 rgb(167 139 250 / 0.4))" }} />
    </div>
  );
}

interface MiniNodeProps {
  label: string;
  type: "from" | "to" | "bridge";
  hasConflict?: boolean;
  tooltip?: string;
  onClick?: () => void;
  onConflictClick?: () => void;
  isClickable?: boolean;
}

function MiniNode({ label, type, hasConflict, tooltip, onClick, onConflictClick, isClickable }: MiniNodeProps) {
  const [hovered, setHovered] = useState(false);
  const styles = {
    from:   "bg-blue-50 border-blue-300 text-blue-700",
    to:     "bg-emerald-50 border-emerald-300 text-emerald-700",
    bridge: "bg-violet-50 border-violet-300 text-violet-700 border-dashed",
  };
  const hoverStyles = {
    from:   "hover:bg-blue-100 hover:border-blue-400 hover:shadow-sm",
    to:     "hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm",
    bridge: "hover:bg-violet-100 hover:border-violet-400 hover:shadow-sm",
  };

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onClick}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium whitespace-nowrap transition-all
            ${styles[type]}
            ${isClickable ? `${hoverStyles[type]} cursor-pointer` : "cursor-default"}
            ${hasConflict ? "ring-1 ring-amber-400" : ""}`}
        >
          {isClickable && type !== "bridge" && (
            <Icon name="ArrowUpRight" size={9} className="opacity-50 shrink-0" />
          )}
          {label}
        </button>
        {hasConflict && onConflictClick && (
          <button
            onClick={(e) => { e.stopPropagation(); onConflictClick(); }}
            className="text-amber-500 hover:text-amber-600 transition-colors px-0.5"
            title="Открыть конфликт"
          >
            ⚠
          </button>
        )}
      </div>
      {hovered && tooltip && !onClick && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-44 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg px-2.5 py-1.5 shadow-xl z-50 pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

function SectionMiniMap({
  section,
  onNavigate,
  onConflictOpen,
}: {
  section: SectionV2;
  onNavigate: (s: SectionV2) => void;
  onConflictOpen: (conflictId: string) => void;
}) {
  const [detail, setDetail] = useState(false);
  const [openBridge, setOpenBridge] = useState<string | null>(null);
  const cfg = getLayerConfig(section.layer);

  const fromNodes   = section.dataFrom.slice(0, detail ? MAX_NODES : 4);
  const fromExtra   = section.dataFrom.length - fromNodes.length;
  const toNodes     = section.dataTo.slice(0, detail ? MAX_NODES : 4);
  const toExtra     = section.dataTo.length - toNodes.length;
  const bridgeNodes = section.bridges.slice(0, detail ? 5 : 3);
  const bridgeExtra = section.bridges.length - bridgeNodes.length;

  const FLOW_TYPE_LABEL: Record<string, string> = {
    sources:   "Вход: факты → Выход: сигналы",
    panorama:  "Вход: данные → Выход: картина и рекомендации",
    reflection:"Вход: картина → Выход: принципы и решения",
    codes:     "Вход: осмысление → Выход: правила и рамки",
    execution: "Вход: решения → Выход: действия и факты",
    service:   "Служебный раздел",
  };

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

      {/* Визуальная схема */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col gap-2">

        {/* ВХОД */}
        {fromNodes.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="text-[9px] font-bold uppercase text-blue-500 tracking-wider">Вход — данные и сигналы</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {fromNodes.map((n, i) => {
                const target = findSectionByLabel(n);
                const conflictId = target
                  ? section.conflicts.find((cid) => {
                      const c = OVERLAP_CASES.find((oc) => oc.id === cid);
                      return c && (c.sectionA === target.id || c.sectionB === target.id);
                    })
                  : undefined;
                return (
                  <MiniNode
                    key={i}
                    label={n}
                    type="from"
                    isClickable={!!target}
                    hasConflict={!!conflictId}
                    tooltip={target ? undefined : `Передаёт данные/сигналы в «${section.labelNew ?? section.label}»`}
                    onClick={target ? () => onNavigate(target) : undefined}
                    onConflictClick={conflictId ? () => onConflictOpen(conflictId) : undefined}
                  />
                );
              })}
              {fromExtra > 0 && (
                <button onClick={() => setDetail(true)} className="text-[10px] text-blue-400 hover:text-blue-600 self-center font-medium">
                  +{fromExtra} ещё
                </button>
              )}
            </div>
          </div>
        )}

        {/* Стрелка ↓ */}
        {fromNodes.length > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-slate-300" />
              <Icon name="ChevronDown" size={12} className="text-slate-400" />
            </div>
          </div>
        )}

        {/* ЦЕНТР */}
        <div className={`rounded-xl border-2 ${cfg.borderColor} bg-gradient-to-br ${cfg.bgColor} p-2.5 flex items-center gap-2.5`}>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
            <Icon name={section.icon} size={14} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-bold ${cfg.textColor} leading-tight truncate`}>{section.labelNew ?? section.label}</p>
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${cfg.textColor} opacity-70`}>{cfg.name}</span>
          </div>
          <span className="ml-auto shrink-0 text-[9px] bg-white/60 border border-white/80 px-1.5 py-0.5 rounded-full text-slate-500 font-medium">
            {section.hubLabel}
          </span>
        </div>

        {/* Стрелка ↓ */}
        {toNodes.length > 0 && (
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
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
              {toNodes.map((n, i) => {
                const target = findSectionByLabel(n);
                const conflictId = target
                  ? section.conflicts.find((cid) => {
                      const c = OVERLAP_CASES.find((oc) => oc.id === cid);
                      return c && (c.sectionA === target.id || c.sectionB === target.id);
                    })
                  : undefined;
                return (
                  <MiniNode
                    key={i}
                    label={n}
                    type="to"
                    isClickable={!!target}
                    hasConflict={!!conflictId}
                    tooltip={target ? undefined : `«${section.labelNew ?? section.label}» передаёт результат сюда`}
                    onClick={target ? () => onNavigate(target) : undefined}
                    onConflictClick={conflictId ? () => onConflictOpen(conflictId) : undefined}
                  />
                );
              })}
              {toExtra > 0 && (
                <button onClick={() => setDetail(true)} className="text-[10px] text-emerald-400 hover:text-emerald-600 self-center font-medium">
                  +{toExtra} ещё
                </button>
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
                <div key={i} className="relative">
                  <button
                    onClick={() => setOpenBridge((prev) => prev === b ? null : b)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-violet-300 bg-violet-50 text-violet-700 text-[10px] font-medium hover:bg-violet-100 hover:border-violet-400 transition-all cursor-pointer"
                  >
                    <Icon name="Waypoints" size={9} className="opacity-60" />
                    {b}
                  </button>
                  {openBridge === b && (
                    <BridgePopup
                      bridge={b}
                      onClose={() => setOpenBridge(null)}
                      onNavigate={onNavigate}
                    />
                  )}
                </div>
              ))}
              {bridgeExtra > 0 && (
                <button onClick={() => setDetail(true)} className="text-[10px] text-violet-400 hover:text-violet-600 self-center font-medium">
                  +{bridgeExtra} ещё
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 italic">{FLOW_TYPE_LABEL[section.layer]}</p>
    </div>
  );
}

// ─────────────────────────────────────────
// Правая панель: контекстная карточка строки «Как есть»
// ─────────────────────────────────────────
const STATUS_DESCRIPTION: Record<RealEntryStatus, string> = {
  match:
    "Раздел совпадает в левом меню и на странице хаба. Это эталонный случай.",
  rename:
    "Это один и тот же смысловой раздел, но в меню и на странице хаба он назван по-разному. Нужно выбрать единое имя.",
  "menu-only":
    "Раздел присутствует в левой навигации, но отсутствует на витрине хаба. Возможно, забыли вынести карточкой или он сейчас «висит» только в гармошке.",
  "hub-only":
    "Раздел показан на странице хаба, но в левой навигации его нет. Часто это hero/AI-блок или внутренний модуль без отдельного пункта меню.",
  "cross-hub":
    "Кросс-хаб: раздел живёт в одном хабе по навигации и показан на витрине другого хаба. Один из самых ценных кейсов — нужно решить смысловой дом.",
  "hero-ai":
    "Это не пункт меню, а витринный hero/AI-блок страницы хаба. Точка входа в сценарий или AI-функцию.",
  "hub-root":
    "Пункт меню ведёт на корень самого хаба, а не на отдельную внутреннюю страницу. Это вход в сам хаб, а не самостоятельный модуль.",
};

function findRealRowSection(hub: RealHub, row: RealRow): SectionV2 | undefined {
  const labels = [row.menu, row.hub].filter(Boolean) as string[];
  for (const l of labels) {
    const f = findSectionByLabel(l);
    if (f) return f;
  }
  // fallback: ищем по hubId+label
  if (hub.archHubId) {
    const arch = SECTIONS_V2.filter((s) => s.hubId === hub.archHubId);
    const norm = (x: string) => x.toLowerCase().replace(/ё/g, "е").trim();
    for (const l of labels) {
      const t = norm(l);
      const f = arch.find(
        (s) =>
          norm(s.label) === t ||
          (s.labelNew && norm(s.labelNew) === t) ||
          s.sections.some((sec) => norm(sec) === t)
      );
      if (f) return f;
    }
  }
  return undefined;
}

function RealRowPanel({
  hub,
  row,
  onClose,
  onOpenSection,
  onJumpToAfter,
}: {
  hub: RealHub;
  row: RealRow;
  onClose: () => void;
  onOpenSection: (s: SectionV2) => void;
  onJumpToAfter: (s: SectionV2 | null) => void;
}) {
  const meta = STATUS_META[row.status];
  const futureLayer = findFutureLayer(hub.archHubId, row.menu ?? row.hub);
  const layerCfg = futureLayer ? getLayerConfig(futureLayer) : null;
  const linkedSection = findRealRowSection(hub, row);
  const title = row.menu ?? row.hub ?? "—";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-100 flex-wrap">
        <span className="text-[10px] text-slate-400">Как есть сейчас</span>
        <Icon name="ChevronRight" size={9} className="text-slate-300" />
        {row.status === "cross-hub" && row.crossHubOn ? (
          <>
            <span className="text-[10px] text-slate-500">
              Меню: <span className="font-semibold text-slate-700">{hub.menuLabel}</span>
            </span>
            <Icon name="ChevronRight" size={9} className="text-slate-300" />
            <span className="text-[10px] text-slate-500">
              Хаб: <span className="font-semibold text-slate-700">{row.crossHubOn}</span>
            </span>
          </>
        ) : (
          <span className="text-[10px] font-semibold text-slate-700">{hub.menuLabel}</span>
        )}
        <Icon name="ChevronRight" size={9} className="text-slate-300" />
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${meta.cls}`}>
          {title}
        </span>
      </div>

      {/* Шапка */}
      <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center text-white shadow shrink-0`}>
            <Icon name={hub.icon} size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate">{title}</h2>
            {row.menu && row.hub && row.menu !== row.hub && (
              <p className="text-[10px] text-slate-500 leading-tight">
                в меню: <span className="font-medium text-slate-700">«{row.menu}»</span>
                {" · "}на хабе: <span className="font-medium text-slate-700">«{row.hub}»</span>
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <StatusBadge status={row.status} />
              <TypeBadge type={hub.type} />
              <KindBadge kind={resolveEntityKind(row, hub.type)} />
              {row.modality && <ModalityBadge modality={row.modality} />}
              {layerCfg && futureLayer && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${ROLE_LAYER_COLOR[futureLayer]}`}>
                  → {layerCfg.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-7 w-7">
          <Icon name="X" size={14} />
        </Button>
      </div>

      {/* Блок 1: Что это */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase text-slate-400">Что это</p>
        <p className="text-xs text-slate-700 leading-relaxed">{STATUS_DESCRIPTION[row.status]}</p>
        {row.note && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-600 italic">
            {row.note}
          </div>
        )}
      </div>

      {/* Блок 2: Где найдено */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase text-slate-400">Где найдено</p>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg border px-2.5 py-2 ${row.menu ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200 opacity-60"}`}>
            <div className="flex items-center gap-1 mb-0.5">
              <Icon name="Menu" size={11} className={row.menu ? "text-blue-600" : "text-slate-400"} />
              <span className="text-[9px] font-bold uppercase text-slate-500">Левое меню</span>
            </div>
            <p className={`text-xs font-semibold ${row.menu ? "text-blue-800" : "text-slate-400 italic"}`}>
              {row.menu ?? "отсутствует"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {row.menu ? `в хабе «${hub.menuLabel}»` : "—"}
            </p>
          </div>
          <div className={`rounded-lg border px-2.5 py-2 ${row.hub ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 opacity-60"}`}>
            <div className="flex items-center gap-1 mb-0.5">
              <Icon name="LayoutGrid" size={11} className={row.hub ? "text-emerald-600" : "text-slate-400"} />
              <span className="text-[9px] font-bold uppercase text-slate-500">Страница хаба</span>
            </div>
            <p className={`text-xs font-semibold ${row.hub ? "text-emerald-800" : "text-slate-400 italic"}`}>
              {row.hub ?? "отсутствует"}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {row.hub ? `на хабе «${hub.hubLabel ?? hub.menuLabel}»` : "—"}
            </p>
          </div>
        </div>
        {row.crossHubOn && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Icon name="GitBranch" size={11} className="text-red-600" />
              <span className="text-[9px] font-bold uppercase text-red-600">Кросс-хаб</span>
            </div>
            <p className="text-[11px] text-red-800 leading-snug">
              Раздел также показан на хабе «<span className="font-semibold">{row.crossHubOn}</span>».
              Это значит, что у пункта два смысловых дома одновременно.
            </p>
          </div>
        )}
      </div>

      {/* Блок 3: Расхождение */}
      {row.status !== "match" && (
        <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase text-slate-400">В чём расхождение</p>
          <div className={`rounded-lg border px-2.5 py-2 ${meta.cls}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              <span className="text-[11px] font-bold">{meta.label}</span>
            </div>
            {row.status === "rename" && (
              <p className="text-[11px] leading-snug">
                Меню: «<span className="font-semibold">{row.menu}</span>» ↔ Хаб: «<span className="font-semibold">{row.hub}</span>». Один и тот же раздел под двумя разными именами.
              </p>
            )}
            {row.status === "menu-only" && (
              <p className="text-[11px] leading-snug">
                Пункт «<span className="font-semibold">{row.menu}</span>» есть в меню, но отсутствует на витрине хаба.
              </p>
            )}
            {row.status === "hub-only" && (
              <p className="text-[11px] leading-snug">
                Карточка «<span className="font-semibold">{row.hub}</span>» есть на витрине хаба, но отсутствует в меню.
              </p>
            )}
            {row.status === "cross-hub" && (
              <p className="text-[11px] leading-snug">
                «<span className="font-semibold">{row.menu ?? row.hub}</span>» относится сразу к двум хабам.
              </p>
            )}
            {row.status === "hero-ai" && (
              <p className="text-[11px] leading-snug">
                «<span className="font-semibold">{row.hub}</span>» — это hero/AI-блок страницы, не пункт меню.
              </p>
            )}
            {row.status === "hub-root" && (
              <p className="text-[11px] leading-snug">
                «<span className="font-semibold">{row.menu}</span>» в меню — это вход в сам хаб, а не отдельный модуль.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Блок 4: Связь с целевой архитектурой */}
      {(linkedSection || layerCfg) && (
        <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase text-slate-400">Куда попадает в целевой архитектуре</p>
          {layerCfg && futureLayer && (
            <div className={`rounded-lg border-2 ${layerCfg.borderColor} ${layerCfg.bgColor} px-2.5 py-2`}>
              <p className={`text-[11px] font-bold ${layerCfg.textColor}`}>{layerCfg.name}</p>
              <p className="text-[10px] text-slate-600 leading-snug">{layerCfg.description}</p>
            </div>
          )}
          {linkedSection && (
            <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Будущее имя</p>
              <p className="text-xs font-semibold text-slate-800">{linkedSection.labelNew ?? linkedSection.label}</p>
              <p className="text-[11px] text-slate-500 italic mt-0.5">«{linkedSection.tagline}»</p>
            </div>
          )}
        </div>
      )}

      {/* Блок 5: Действия */}
      <div className="p-4 flex flex-col gap-1.5">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Действия</p>
        {linkedSection ? (
          <>
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start gap-1.5 text-xs h-8"
              onClick={() => onOpenSection(linkedSection)}
            >
              <Icon name="FileText" size={12} />
              Открыть полную карточку раздела
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-1.5 text-xs h-8"
              onClick={() => onJumpToAfter(linkedSection)}
            >
              <Icon name="Sparkles" size={12} />
              Показать в режиме «После изменений»
            </Button>
          </>
        ) : (
          <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 leading-snug">
            У этой сущности нет полноценной карточки раздела (это {TYPE_META[hub.type].label.toLowerCase()} или специальный блок). Контекстная информация выше — единственный источник.
          </div>
        )}
        {linkedSection?.path && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1.5 text-xs h-8"
            onClick={() => window.open(linkedSection.path, "_blank")}
          >
            <Icon name="ExternalLink" size={12} />
            Открыть на сайте
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Правая панель: карточка раздела (3 колонки)
// ─────────────────────────────────────────
function SectionDetailPanel({
  section,
  history,
  onClose,
  onNavigate,
  onGoBack,
  onConflictOpen,
}: {
  section: SectionV2;
  history: SectionV2[];
  onClose: () => void;
  onNavigate: (s: SectionV2) => void;
  onGoBack: () => void;
  onConflictOpen: (id: string) => void;
}) {
  const cfg = getLayerConfig(section.layer);
  const relatedConflicts = OVERLAP_CASES.filter((c) => section.conflicts.includes(c.id));

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto">

      {/* Хлебные крошки / история */}
      {history.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-100 flex-wrap">
          <button
            onClick={onGoBack}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-violet-600 transition-colors font-medium"
          >
            <Icon name="ArrowLeft" size={11} />
            Назад
          </button>
          <div className="flex items-center gap-1 flex-wrap">
            {history.map((h, i) => {
              const hCfg = getLayerConfig(h.layer);
              return (
                <span key={i} className="flex items-center gap-1">
                  <button
                    onClick={() => onNavigate(h)}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${ROLE_LAYER_COLOR[h.layer]} hover:opacity-80 transition-opacity`}
                  >
                    {h.labelNew ?? h.label}
                  </button>
                  <Icon name="ChevronRight" size={9} className="text-slate-300 shrink-0" />
                </span>
              );
            })}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${ROLE_LAYER_COLOR[section.layer]}`}>
              {section.labelNew ?? section.label}
            </span>
          </div>
        </div>
      )}

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

        {/* Центр: МИНИ-СХЕМА — кликабельная навигация */}
        <div className="lg:w-[40%] p-4">
          <SectionMiniMap
            section={section}
            onNavigate={onNavigate}
            onConflictOpen={onConflictOpen}
          />
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
                    <button
                      key={c.id}
                      onClick={() => onConflictOpen(c.id)}
                      className={`w-full text-left rounded-lg border px-2 py-1.5 transition-opacity hover:opacity-80 ${c.riskLevel === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-[9px] px-1 py-0.5 rounded border font-bold ${risk.className}`}>{risk.label}</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded border font-medium ${STATUS_CONFIG[c.status].className}`}>{STATUS_CONFIG[c.status].label}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium">{c.sharedFunction}</p>
                      <p className="text-[10px] text-slate-500">{c.sectionA} ↔ {c.sectionB}</p>
                    </button>
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
  // История переходов по карточкам
  const [navHistory, setNavHistory] = useState<SectionV2[]>([]);
  // Выбранная строка из режима «Как есть»
  const [selectedReal, setSelectedReal] = useState<{ hub: RealHub; row: RealRow; key: string } | null>(null);
  // Выбранный цикл в режиме «Циклы»
  const [selectedCycle, setSelectedCycle] = useState<LifeCycleId | null>(null);

  // Навигация вперёд — сохраняем текущую в историю, открываем новую
  const handleNavigate = (s: SectionV2) => {
    setSelectedFlow(null);
    setSelectedSection((prev) => {
      if (prev) setNavHistory((h) => [...h, prev]);
      return s;
    });
  };

  // Навигация из дерева — сбрасываем историю
  const handleSectionClick = (s: SectionV2) => {
    setSelectedFlow(null);
    setNavHistory([]);
    setSelectedSection((prev) => (prev?.id === s.id ? null : s));
  };

  // Назад по истории
  const handleGoBack = () => {
    setNavHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) setSelectedSection(prev);
      return h.slice(0, -1);
    });
  };

  // Клик по конфликту — переключаемся в режим конфликтов
  const handleConflictOpen = (_id: string) => {
    setMode("conflicts");
    setSelectedSection(null);
    setSelectedFlow(null);
    setNavHistory([]);
  };

  const handleFlowClick = (f: DataFlow) => {
    setSelectedSection(null);
    setNavHistory([]);
    setSelectedFlow((prev) => (prev?.id === f.id ? null : f));
  };

  const handleClose = () => {
    setSelectedSection(null);
    setSelectedFlow(null);
    setNavHistory([]);
    setSelectedReal(null);
    setSelectedCycle(null);
  };

  const handleCycleClick = (id: LifeCycleId) => {
    setSelectedCycle((prev) => (prev === id ? null : id));
  };

  // Клик по строке режима «Как есть»
  const handleRealRowClick = (hub: RealHub, row: RealRow) => {
    const idx = hub.rows.indexOf(row);
    const key = `${hub.id}::${idx}`;
    setSelectedSection(null);
    setSelectedFlow(null);
    setNavHistory([]);
    setSelectedReal((prev) => (prev?.key === key ? null : { hub, row, key }));
  };

  // Из панели «Как есть» — открыть полную карточку раздела
  const handleOpenSectionFromReal = (s: SectionV2) => {
    setSelectedReal(null);
    setSelectedFlow(null);
    setNavHistory([]);
    setSelectedSection(s);
  };

  // Из панели «Как есть» — перейти в режим «После изменений»
  const handleJumpToAfter = (s: SectionV2 | null) => {
    setSelectedReal(null);
    setSelectedFlow(null);
    setNavHistory([]);
    setSelectedSection(s);
    setMode("after");
  };

  const openConflicts = OVERLAP_CASES.filter((c) => c.status === "open").length;
  const renamed = SECTIONS_V2.filter((s) => s.labelNew && s.labelNew !== s.label).length;
  const hasRightPanel = (selectedSection && (mode === "as-is" || mode === "after"))
    || (selectedFlow && mode === "after")
    || (selectedReal && mode === "as-is");

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

        {/* Карта реализации плана архитектурной дочистки */}
        <Card className="p-4 bg-gradient-to-br from-violet-50/40 via-white to-fuchsia-50/40 border-violet-100">
          <ProgressMap
            title="План архитектурной дочистки"
            subtitle="Видим, что сделано, что в работе и что впереди"
            accent="violet"
            steps={ROADMAP_STEPS}
          />
        </Card>

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
        <div className="flex flex-wrap rounded-xl border border-slate-200 bg-white overflow-hidden w-fit shadow-sm">
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
          <div className={`transition-all duration-200 ${hasRightPanel ? "lg:w-[45%]" : "w-full"}`}>
            {mode === "as-is"     && (
              <AsIsMode
                onSectionClick={handleSectionClick}
                onRowClick={handleRealRowClick}
                selectedRowKey={selectedReal?.key ?? null}
              />
            )}
            {mode === "after"     && (
              <AfterMode
                selectedSection={selectedSection}
                onSectionClick={handleSectionClick}
                selectedFlow={selectedFlow}
                onFlowClick={handleFlowClick}
              />
            )}
            {mode === "cycles"    && (
              <CyclesMode
                selectedCycle={selectedCycle}
                onCycleClick={handleCycleClick}
              />
            )}
            {mode === "principles" && <PrinciplesMode />}
            {mode === "compare"   && <CompareMode />}
            {mode === "conflicts" && <ConflictsMode />}
          </div>

          {/* Правая панель */}
          {hasRightPanel && (
            <div className="lg:w-[55%]">
              <Card className="overflow-hidden sticky top-4 max-h-[88vh]">
                {selectedReal && mode === "as-is" && !selectedSection && (
                  <RealRowPanel
                    hub={selectedReal.hub}
                    row={selectedReal.row}
                    onClose={handleClose}
                    onOpenSection={handleOpenSectionFromReal}
                    onJumpToAfter={handleJumpToAfter}
                  />
                )}
                {selectedSection && (
                  <SectionDetailPanel
                    section={selectedSection}
                    history={navHistory}
                    onClose={handleClose}
                    onNavigate={handleNavigate}
                    onGoBack={handleGoBack}
                    onConflictOpen={handleConflictOpen}
                  />
                )}
                {selectedFlow && !selectedSection && !selectedReal && (
                  <FlowDetailPanel flow={selectedFlow} onClose={handleClose} />
                )}
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