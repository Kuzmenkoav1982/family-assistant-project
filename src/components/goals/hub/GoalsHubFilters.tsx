import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FILTER_LABELS,
  SORT_LABELS,
  type GoalFilterPreset,
  type GoalSortPreset,
} from '@/lib/goals/hubHelpers';

interface Props {
  filter: GoalFilterPreset;
  sort: GoalSortPreset;
  onFilterChange: (next: GoalFilterPreset) => void;
  onSortChange: (next: GoalSortPreset) => void;
  /** Сколько целей видно после фильтра — показываем рядом для контекста. */
  visibleCount: number;
  /** Всего целей в системе (без фильтра). */
  totalCount: number;
}

const FILTER_ORDER: GoalFilterPreset[] = [
  'all',
  'active',
  'attention',
  'smart',
  'okr',
  'wheel',
  'completed',
];

const SORT_ORDER: GoalSortPreset[] = ['updated', 'progress', 'alphabet', 'created'];

export default function GoalsHubFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  visibleCount,
  totalCount,
}: Props) {
  return (
    <div className="space-y-2">
      {/* Chips-фильтры. На мобиле — горизонтальный скролл. */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1"
        role="tablist"
        aria-label="Фильтр целей"
      >
        {FILTER_ORDER.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(f)}
              className={
                'shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ' +
                (active
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-sm'
                  : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-200')
              }
            >
              {FILTER_LABELS[f]}
            </button>
          );
        })}
      </div>

      {/* Низ — счётчик и сортировка */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] text-gray-500 flex items-center gap-1">
          <Icon name="ListFilter" size={11} />
          Показано {visibleCount} из {totalCount}
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="ArrowDownUp" size={11} className="text-gray-400" />
          <Select value={sort} onValueChange={(v) => onSortChange(v as GoalSortPreset)}>
            <SelectTrigger
              className="h-7 text-xs px-2 min-w-[140px]"
              aria-label="Сортировка"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
