import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  OS_PRINCIPLES,
  CATEGORY_META,
  STATUS_META,
  type OsPrinciple,
  type PrincipleCategory,
} from '@/data/projectV2/osPrinciples';

const FILTERS: Array<{ id: PrincipleCategory | 'all'; label: string; icon: string }> = [
  { id: 'all',          label: 'Все',                icon: 'List' },
  { id: 'concept',      label: 'Концепции',          icon: 'Compass' },
  { id: 'architecture', label: 'Архитектура',        icon: 'Boxes' },
  { id: 'ux',           label: 'UX-паттерны',        icon: 'LayoutDashboard' },
  { id: 'data',         label: 'Данные',             icon: 'Database' },
  { id: 'visual',       label: 'Визуальный язык',    icon: 'Palette' },
  { id: 'workflow',     label: 'Процесс',            icon: 'GitBranch' },
];

const ACCENT_BORDER: Record<OsPrinciple['accent'], string> = {
  violet:  'border-l-violet-500',
  emerald: 'border-l-emerald-500',
  blue:    'border-l-blue-500',
  amber:   'border-l-amber-500',
  rose:    'border-l-rose-500',
  cyan:    'border-l-cyan-500',
  slate:   'border-l-slate-400',
};

const ACCENT_BG: Record<OsPrinciple['accent'], string> = {
  violet:  'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  blue:    'bg-blue-50 text-blue-700',
  amber:   'bg-amber-50 text-amber-700',
  rose:    'bg-rose-50 text-rose-700',
  cyan:    'bg-cyan-50 text-cyan-700',
  slate:   'bg-slate-50 text-slate-600',
};

/**
 * Раздел «Правила и логики ОС» в админке.
 * Каталог переиспользуемых паттернов, чтобы при новых
 * реализациях были видны все наши шаблоны и смыслы.
 */
export default function PrinciplesMode() {
  const [filter, setFilter] = useState<PrincipleCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === 'all' ? OS_PRINCIPLES : OS_PRINCIPLES.filter((p) => p.category === filter);

  const totalByCategory = OS_PRINCIPLES.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Подводка */}
      <div className="text-xs text-slate-600 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-lg px-3 py-2.5 leading-relaxed">
        <span className="font-bold text-slate-800">Правила и логики Семейной ОС.</span>{' '}
        Каталог переиспользуемых паттернов, смыслов и решений, которые мы применяем при разработке
        новых хабов и разделов. Когда создаём новый модуль — сверяемся с этим списком, чтобы UX и
        архитектура соответствовали уже принятым правилам.
      </div>

      {/* Сводка по категориям */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(Object.keys(CATEGORY_META) as PrincipleCategory[]).map((c) => {
          const meta = CATEGORY_META[c];
          const count = totalByCategory[c] ?? 0;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-left rounded-lg border-2 px-2.5 py-2 transition-all ${
                filter === c ? `${meta.cls} shadow-sm scale-105` : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon name={meta.icon} size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {meta.label}
                </span>
              </div>
              <p className="text-base font-bold leading-none">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Фильтры */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-semibold transition-all ${
              filter === f.id
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Icon name={f.icon} size={11} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Карточки принципов */}
      <div className="flex flex-col gap-2">
        {filtered.map((p) => (
          <PrincipleCard
            key={p.id}
            principle={p}
            isExpanded={expandedId === p.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === p.id ? null : p.id))
            }
          />
        ))}
      </div>

      {/* Пояснение, как использовать */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border-amber-200">
        <div className="flex items-start gap-2.5">
          <Icon name="Lightbulb" size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800 mb-1">
              Как использовать этот раздел
            </p>
            <ul className="text-[11px] text-slate-600 leading-relaxed list-disc list-inside space-y-0.5">
              <li>При создании нового хаба — пройти чеклист «Чеклист нового хаба»</li>
              <li>При расширении типов данных — свериться с правилом «Изменения только дополняющие»</li>
              <li>При добавлении нового UI-паттерна — поискать готовый среди UX-паттернов</li>
              <li>При коммуникации продукта (тексты, презентации) — соблюдать концепции «Семейная ОС» и «5 циклов»</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface PrincipleCardProps {
  principle: OsPrinciple;
  isExpanded: boolean;
  onToggle: () => void;
}

function PrincipleCard({ principle, isExpanded, onToggle }: PrincipleCardProps) {
  const catMeta = CATEGORY_META[principle.category];
  const statusMeta = STATUS_META[principle.status];
  const accentBorder = ACCENT_BORDER[principle.accent];
  const accentBg = ACCENT_BG[principle.accent];

  return (
    <div
      className={`rounded-xl bg-white border-2 border-slate-200 ${accentBorder} border-l-[6px] overflow-hidden`}
    >
      {/* Заголовок (кликабельный) */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accentBg}`}>
          <Icon name={principle.icon} size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800 leading-tight">{principle.title}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${statusMeta.cls}`}>
              {statusMeta.label}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${catMeta.cls}`}>
              <Icon name={catMeta.icon} size={9} className="inline -mt-0.5 mr-0.5" />
              {catMeta.label}
            </span>
          </div>
          <p className="text-xs text-slate-600 italic leading-snug">{principle.summary}</p>
        </div>
        <Icon
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          size={14}
          className="text-slate-400 shrink-0 mt-2"
        />
      </button>

      {/* Развёрнутый контент */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-3 space-y-3">
          {/* Описание */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Описание</p>
            <p className="text-xs text-slate-700 leading-relaxed">{principle.description}</p>
          </div>

          {/* Когда применяем */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-blue-500 mb-1 flex items-center gap-1">
                <Icon name="Clock" size={10} />
                Когда применяем
              </p>
              <ul className="space-y-0.5">
                {principle.when.map((w, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex gap-1.5">
                    <span className="text-blue-400">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1 flex items-center gap-1">
                <Icon name="CheckCircle" size={10} />
                Что делаем
              </p>
              <ul className="space-y-0.5">
                {principle.rule.map((r, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex gap-1.5">
                    <span className="text-emerald-500">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Анти-паттерны */}
          {principle.antiPatterns && principle.antiPatterns.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-rose-500 mb-1 flex items-center gap-1">
                <Icon name="XCircle" size={10} />
                Чего НЕ делаем
              </p>
              <ul className="space-y-0.5">
                {principle.antiPatterns.map((a, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex gap-1.5">
                    <span className="text-rose-400">✗</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Примеры применения */}
          <div>
            <p className="text-[10px] font-bold uppercase text-violet-500 mb-1 flex items-center gap-1">
              <Icon name="Sparkles" size={10} />
              Где уже применили ({principle.examples.length})
            </p>
            <div className="space-y-1">
              {principle.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5"
                >
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-800">{ex.where}</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[11px] text-slate-600">{ex.description}</span>
                  </div>
                  {ex.ref && (
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{ex.ref}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Связанные принципы */}
          {principle.relatedIds && principle.relatedIds.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Icon name="Link" size={10} />
                Связано
              </p>
              <div className="flex flex-wrap gap-1">
                {principle.relatedIds.map((rid) => {
                  const related = OS_PRINCIPLES.find((x) => x.id === rid);
                  if (!related) return null;
                  return (
                    <span
                      key={rid}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {related.title}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
