import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GoalHubCard from '@/components/goals/hub/GoalHubCard';
import GoalsSummary from '@/components/goals/hub/GoalsSummary';
import GoalsHubFilters from '@/components/goals/hub/GoalsHubFilters';
import type { GoalFilterPreset, GoalSortPreset } from '@/lib/goals/hubHelpers';
import type { HubGoalView, HubSummary } from '@/lib/goals/hubHelpers';

interface Props {
  loading: boolean;
  error: string | null;
  summary: HubSummary;
  sorted: HubGoalView[];
  filter: GoalFilterPreset;
  sort: GoalSortPreset;
  onFilterChange: (f: GoalFilterPreset) => void;
  onSortChange: (s: GoalSortPreset) => void;
  onRetry: () => void;
}

export default function WorkshopGoalsPanel({
  loading, error, summary, sorted,
  filter, sort, onFilterChange, onSortChange, onRetry,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="Target" size={16} className="text-purple-600" />
          <div className="text-sm font-bold text-gray-900">Мои цели</div>
          <Badge variant="secondary" className="text-[10px]">{summary.total}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" onClick={() => navigate('/life-road')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Icon name="Plus" size={12} className="mr-1" /> Цель
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/life-road')}>
            Дорога <Icon name="ArrowRight" size={12} className="ml-1" />
          </Button>
        </div>
      </div>

      {!loading && !error && summary.total > 0 && (
        <GoalsSummary summary={summary} onPickFilter={onFilterChange} />
      )}

      {!loading && !error && summary.total > 0 && (
        <GoalsHubFilters
          filter={filter}
          sort={sort}
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          visibleCount={sorted.length}
          totalCount={summary.total}
        />
      )}

      <div className="min-h-[180px]" aria-live="polite" aria-busy={loading}>
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
            <Icon name="AlertCircle" size={14} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold mb-0.5">Не удалось загрузить цели</div>
              <div className="text-rose-600">{error}</div>
              <button onClick={onRetry} className="mt-1 text-rose-700 underline hover:no-underline">Повторить</button>
            </div>
          </div>
        )}

        {!loading && !error && summary.total === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-purple-200 rounded-xl">
            <Icon name="Compass" size={28} className="mx-auto text-purple-300 mb-2" />
            <div className="text-sm font-semibold text-gray-700 mb-1">Пока нет целей</div>
            <p className="text-xs text-gray-500 mb-3">Создай первую длинную цель — Домовой поможет с методикой.</p>
            <Button onClick={() => navigate('/life-road')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" size="sm">
              <Icon name="Plus" size={12} className="mr-1" /> Создать цель
            </Button>
          </div>
        )}

        {!loading && !error && summary.total > 0 && sorted.length === 0 && (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500">
            <Icon name="Filter" size={20} className="mx-auto text-gray-300 mb-2" />
            Нет целей под выбранный фильтр.{' '}
            <button onClick={() => onFilterChange('all')} className="text-purple-600 underline hover:no-underline">Сбросить</button>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sorted.map((view) => (
              <GoalHubCard key={view.goal.id} view={view} onOpen={() => navigate(`/workshop/goal/${view.goal.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
