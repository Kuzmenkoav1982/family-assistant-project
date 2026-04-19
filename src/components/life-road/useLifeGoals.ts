import { useCallback, useEffect, useState } from 'react';
import { lifeApi } from './api';
import type { LifeGoal } from './types';

export function useLifeGoals() {
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lifeApi.listGoals();
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(async (g: Partial<LifeGoal>) => {
    const created = await lifeApi.createGoal(g);
    setGoals((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, g: Partial<LifeGoal>) => {
    const updated = await lifeApi.updateGoal(id, g);
    setGoals((prev) => prev.map((x) => (x.id === id ? updated : x)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await lifeApi.deleteGoal(id);
    setGoals((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { goals, loading, error, reload, create, update, remove };
}
