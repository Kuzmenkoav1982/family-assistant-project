import { useEffect, useMemo, useState } from 'react';
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
import type { GoalCheckin, LifeGoal } from '@/components/life-road/types';

export function useWorkshopData() {
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
    return () => { cancelled = true; };
  };

  useEffect(() => {
    const cleanup = reload();
    return cleanup;
  }, []);

  const views = useMemo(() => goals.map((g) => buildHubView(g)), [goals]);
  const summary = useMemo(() => buildHubSummary(views), [views]);
  const filtered = useMemo(() => applyFilter(views, filter), [views, filter]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  return {
    goals, checkinsByGoalId,
    loading, reviewLoading,
    error, reviewError,
    filter, setFilter,
    sort, setSort,
    summary, sorted,
    reload,
  };
}
