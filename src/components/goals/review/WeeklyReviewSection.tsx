import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { GoalCheckin, LifeGoal } from '@/components/life-road/types';
import {
  buildWeeklySummary,
  buildWeeklyView,
  recentWeeklyCheckins,
  viewsBySegment,
} from '@/lib/goals/weeklyReviewHelpers';
import {
  buildWeeklyNarrative,
  type NarrativeNudge,
} from '@/lib/goals/weeklyReviewNarrative';
import WeeklyReviewSummary, { type WeeklyTab } from './WeeklyReviewSummary';
import WeeklyReviewGoalRow from './WeeklyReviewGoalRow';
import WeeklyCheckinsList from './WeeklyCheckinsList';
import WeeklyReviewNarrative from './WeeklyReviewNarrative';

// Weekly Review V1 — обзор недели по целям.
//
// Принимает уже загруженные данные (goals + checkins). Сам не делает запросов —
// это нужно, чтобы родитель (Workshop) мог batch'ем подгрузить и переиспользовать
// в Hub.

interface Props {
  goals: LifeGoal[];
  checkinsByGoalId: Record<string, GoalCheckin[]>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function WeeklyReviewSection({
  goals,
  checkinsByGoalId,
  loading,
  error,
  onRetry,
}: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<WeeklyTab>('progress');

  const views = useMemo(
    () => buildWeeklyView({ goals, checkinsByGoalId }),
    [goals, checkinsByGoalId],
  );
  const summary = useMemo(() => buildWeeklySummary(views), [views]);
  const { progressed, regressed, needsReview } = useMemo(
    () => viewsBySegment(views),
    [views],
  );
  const updated = useMemo(() => views.filter((v) => v.weeklyCount > 0), [views]);
  const recent = useMemo(() => recentWeeklyCheckins(views, 7), [views]);

  // V1.1 — детерминированный итог недели + 1–2 nudges.
  const narrative = useMemo(
    () =>
      buildWeeklyNarrative({
        summary,
        segments: { progressed, regressed, needsReview },
        totalGoals: goals.length,
      }),
    [summary, progressed, regressed, needsReview, goals.length],
  );

  const totalChanges =
    summary.checkinsThisWeek +
    summary.goalsProgressed +
    summary.goalsRegressed +
    summary.goalsNeedingReview;

  const goOpen = (id: string) => navigate(`/workshop/goal/${id}`);

  // Один обработчик для всех nudges: ведёт в конкретную цель / переключает таб / route.
  const handleNudge = (n: NarrativeNudge) => {
    switch (n.target.kind) {
      case 'goal':
        goOpen(n.target.goalId);
        return;
      case 'tab':
        setTab(n.target.tab);
        return;
      case 'route':
        navigate(n.target.path);
        return;
    }
  };

  // Активный список по вкладке.
  const activeList: typeof progressed = (() => {
    switch (tab) {
      case 'progress':
        return progressed;
      case 'regress':
        return regressed;
      case 'review':
        return needsReview;
      case 'updated':
        return updated;
    }
  })();

  const activeListEmptyText = (() => {
    switch (tab) {
      case 'progress':
        return 'За последние 7 дней нет целей с прогрессом.';
      case 'regress':
        return 'Откатов за неделю не зафиксировано — отлично.';
      case 'review':
        return 'Целей, требующих пересмотра, нет.';
      case 'updated':
        return 'За неделю не было замеров ни по одной цели.';
    }
  })();

  return (
    <section
      aria-label="Обзор недели"
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="CalendarHeart" size={16} className="text-amber-600" />
          <div className="text-sm font-bold text-gray-900">Обзор недели</div>
          <span className="text-[10px] text-gray-500">последние 7 дней</span>
        </div>
        <div className="text-[10px] text-gray-400">
          {summary.goalsUpdatedThisWeek > 0
            ? `${summary.goalsUpdatedThisWeek} цел${
                summary.goalsUpdatedThisWeek === 1 ? 'ь' : 'ей'
              } обновлялись`
            : 'без обновлений'}
        </div>
      </div>

      <div className="min-h-[420px]" aria-live="polite" aria-busy={loading}>
        {loading && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse"
                />
              ))}
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3"
          >
            <Icon name="AlertCircle" size={14} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold mb-0.5">Не удалось собрать обзор недели</div>
              <div className="text-rose-600">{error}</div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-1 text-rose-700 underline hover:no-underline"
                >
                  Повторить
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && goals.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-amber-200 rounded-xl">
            <Icon name="CalendarHeart" size={24} className="mx-auto text-amber-300 mb-2" />
            <div className="text-sm font-semibold text-gray-700 mb-1">
              Обзор недели появится, когда будут цели
            </div>
            <p className="text-[11px] text-gray-500">
              Создай первую цель — и через неделю здесь будет твой первый ревью.
            </p>
          </div>
        )}

        {!loading && !error && goals.length > 0 && totalChanges === 0 && (
          <div className="space-y-3">
            <WeeklyReviewNarrative
              narrative={narrative}
              goalsUpdatedThisWeek={summary.goalsUpdatedThisWeek}
              onNudgeClick={handleNudge}
            />
            <div className="text-center py-6 border-2 border-dashed border-amber-200 rounded-xl space-y-2">
              <Icon name="CalendarHeart" size={24} className="mx-auto text-amber-300" />
              <div className="text-sm font-semibold text-gray-700">
                За последние 7 дней не было замеров
              </div>
              <p className="text-[11px] text-gray-500">
                Загляни в цели и сделай первый замер — он сразу появится в обзоре.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/life-road')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                Открыть цели
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && goals.length > 0 && totalChanges > 0 && (
          <div className="space-y-3">
            <WeeklyReviewNarrative
              narrative={narrative}
              goalsUpdatedThisWeek={summary.goalsUpdatedThisWeek}
              onNudgeClick={handleNudge}
            />
            <WeeklyReviewSummary summary={summary} activeTab={tab} onTabChange={setTab} />

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                {tab === 'progress' && 'Прогресс за неделю'}
                {tab === 'regress' && 'Откат и просадка'}
                {tab === 'review' && 'Требуют пересмотра'}
                {tab === 'updated' && 'Обновлялись за неделю'}
              </div>
              {activeList.length === 0 ? (
                <div className="text-xs text-gray-500 italic rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                  {activeListEmptyText}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {activeList.map((v) => (
                    <li key={v.goal.id}>
                      <WeeklyReviewGoalRow
                        view={v}
                        variant={tab}
                        onOpen={() => goOpen(v.goal.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                Последние замеры
              </div>
              <WeeklyCheckinsList entries={recent} onOpenGoal={goOpen} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}