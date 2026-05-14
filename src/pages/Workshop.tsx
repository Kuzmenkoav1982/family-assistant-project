import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { lifeApi } from '@/components/life-road/api';
import { normalizeLegacyGoals } from '@/lib/goals/goalMappers';
import {
  applyFilter,
  applySort,
  buildHubSummary,
  buildHubView,
  type GoalFilterPreset,
  type GoalSortPreset,
} from '@/lib/goals/hubHelpers';
import GoalHubCard from '@/components/goals/hub/GoalHubCard';
import GoalsSummary from '@/components/goals/hub/GoalsSummary';
import GoalsHubFilters from '@/components/goals/hub/GoalsHubFilters';
import WeeklyReviewSection from '@/components/goals/review/WeeklyReviewSection';
import FocusSection from '@/components/goals/focus/FocusSection';
import type { GoalCheckin, LifeGoal } from '@/components/life-road/types';

// Хаб Мастерской жизни — раздел триады «Куда и зачем я иду».
// В Этапе 1 это лёгкий лендинг с быстрым входом в цели.
// Постепенно сюда подтянем смыслы, сезоны, сверку часов.

export default function WorkshopPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [checkinsByGoalId, setCheckinsByGoalId] = useState<Record<string, GoalCheckin[]>>({});
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [filter, setFilter] = useState<GoalFilterPreset>('active');
  const [sort, setSort] = useState<GoalSortPreset>('updated');

  const reload = () => {
    let cancelled = false;
    setLoading(true);
    setReviewLoading(true);
    setError(null);
    setReviewError(null);
    lifeApi
      .listGoals()
      .then(async (rows) => {
        if (cancelled) return;
        const normalized = normalizeLegacyGoals(rows);
        setGoals(normalized);
        setLoading(false);

        // Параллельно подтягиваем check-ins по всем целям.
        // Ошибки по отдельным целям не валят весь обзор — пустой массив = «нет замеров».
        try {
          const pairs = await Promise.all(
            normalized.map((g) =>
              lifeApi
                .listCheckins(g.id)
                .then((rows) => [g.id, rows as GoalCheckin[]] as const)
                .catch(() => [g.id, [] as GoalCheckin[]] as const),
            ),
          );
          if (cancelled) return;
          const map: Record<string, GoalCheckin[]> = {};
          for (const [gid, list] of pairs) map[gid] = list;
          setCheckinsByGoalId(map);
        } catch (e) {
          if (cancelled) return;
          setReviewError((e as Error).message || 'Не удалось загрузить замеры');
        } finally {
          if (!cancelled) setReviewLoading(false);
        }
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setGoals([]);
        setCheckinsByGoalId({});
        setError(e.message || 'Не удалось загрузить цели');
        setLoading(false);
        setReviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    const cleanup = reload();
    return cleanup;
  }, []);

  // Один вычислительный путь: views → summary → filtered → sorted.
  const views = useMemo(() => goals.map((g) => buildHubView(g)), [goals]);
  const summary = useMemo(() => buildHubSummary(views), [views]);
  const filtered = useMemo(() => applyFilter(views, filter), [views, filter]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4">
        {/* Hero */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center">
              <Icon name="Compass" size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Мастерская жизни</h1>
              <p className="text-xs text-gray-500">Куда и зачем я иду</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Это место, где смыслы становятся целями, а цели — живут с тобой. Не просто «список задач», а
            компас на сезон, год и длинный путь.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={() => navigate('/life-road')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Icon name="ArrowRight" size={14} className="mr-1.5" /> Открыть «Дорогу жизни»
            </Button>
            <Button variant="outline" onClick={() => navigate('/portfolio')}>
              <Icon name="LineChart" size={14} className="mr-1.5" /> Где я сейчас (Портфолио)
            </Button>
            <Button variant="outline" onClick={() => navigate('/planning-hub')}>
              <Icon name="ListChecks" size={14} className="mr-1.5" /> Что делаю сейчас (План)
            </Button>
          </div>
        </div>

        {/* Триада */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              k: 'mirror',
              title: 'Зеркало',
              sub: 'Где я сейчас',
              icon: 'LineChart',
              gradient: 'from-emerald-500 to-teal-500',
              to: '/portfolio',
              desc: 'Портфолио развития: сферы, достижения, следующий шаг.',
            },
            {
              k: 'compass',
              title: 'Компас',
              sub: 'Куда и зачем',
              icon: 'Compass',
              gradient: 'from-purple-600 to-pink-600',
              to: '/life-road',
              desc: 'Мастерская: длинные цели, методики, сезоны, смыслы.',
            },
            {
              k: 'engine',
              title: 'Двигатель',
              sub: 'Что делаю сейчас',
              icon: 'Zap',
              gradient: 'from-blue-500 to-cyan-500',
              to: '/planning-hub',
              desc: 'Планирование: задачи, привычки, календарь, ритуалы.',
            },
          ].map((item) => (
            <button
              key={item.k}
              onClick={() => navigate(item.to)}
              className="text-left bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center mb-2`}>
                <Icon name={item.icon} size={18} />
              </div>
              <div className="text-sm font-bold text-gray-900">{item.title}</div>
              <div className="text-[11px] text-gray-500 mb-1.5">{item.sub}</div>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Goals Focus V1 — что делать сейчас (overdue → regressed → stale) */}
        <FocusSection
          goals={goals}
          checkinsByGoalId={checkinsByGoalId}
          loading={reviewLoading}
          error={reviewError}
          onRetry={reload}
        />

        {/* Goals Hub V1 — единый верхний экран по всем целям */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Icon name="Target" size={16} className="text-purple-600" />
              <div className="text-sm font-bold text-gray-900">Мои цели</div>
              <Badge variant="secondary" className="text-[10px]">{summary.total}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={() => navigate('/life-road')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                <Icon name="Plus" size={12} className="mr-1" /> Цель
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate('/life-road')}>
                Дорога <Icon name="ArrowRight" size={12} className="ml-1" />
              </Button>
            </div>
          </div>

          {/* Summary */}
          {!loading && !error && summary.total > 0 && (
            <GoalsSummary
              summary={summary}
              onPickFilter={(preset) => setFilter(preset)}
            />
          )}

          {/* Filters + Sort */}
          {!loading && !error && summary.total > 0 && (
            <GoalsHubFilters
              filter={filter}
              sort={sort}
              onFilterChange={setFilter}
              onSortChange={setSort}
              visibleCount={sorted.length}
              totalCount={summary.total}
            />
          )}

          {/* States: loading / error / empty / grid */}
          <div className="min-h-[180px]" aria-live="polite" aria-busy={loading}>
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div
                role="alert"
                className="flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3"
              >
                <Icon name="AlertCircle" size={14} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold mb-0.5">Не удалось загрузить цели</div>
                  <div className="text-rose-600">{error}</div>
                  <button
                    onClick={reload}
                    className="mt-1 text-rose-700 underline hover:no-underline"
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && summary.total === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-purple-200 rounded-xl">
                <Icon name="Compass" size={28} className="mx-auto text-purple-300 mb-2" />
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  Пока нет целей
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Создай первую длинную цель — Домовой поможет с методикой.
                </p>
                <Button
                  onClick={() => navigate('/life-road')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  size="sm"
                >
                  <Icon name="Plus" size={12} className="mr-1" /> Создать цель
                </Button>
              </div>
            )}

            {!loading && !error && summary.total > 0 && sorted.length === 0 && (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500">
                <Icon name="Filter" size={20} className="mx-auto text-gray-300 mb-2" />
                Нет целей под выбранный фильтр.{' '}
                <button
                  onClick={() => setFilter('all')}
                  className="text-purple-600 underline hover:no-underline"
                >
                  Сбросить
                </button>
              </div>
            )}

            {!loading && !error && sorted.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sorted.map((view) => (
                  <GoalHubCard
                    key={view.goal.id}
                    view={view}
                    onOpen={() => navigate(`/workshop/goal/${view.goal.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Review V1 — обзор недели */}
        <WeeklyReviewSection
          goals={goals}
          checkinsByGoalId={checkinsByGoalId}
          loading={reviewLoading}
          error={reviewError}
          onRetry={reload}
        />

        {/* Заметка про этап */}
        <div className="text-[11px] text-gray-400 text-center italic">
          Этап 1 триады • фундамент модели. Методики, мосты и сверка часов появятся следующими волнами.
        </div>
      </div>
    </div>
  );
}