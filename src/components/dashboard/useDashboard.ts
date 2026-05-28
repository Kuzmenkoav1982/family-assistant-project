import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { demoDashboardData } from '@/data/demoDashboardData';
import type { DashboardData, Hub } from './types';

const DASHBOARD_API = 'https://functions.poehali.dev/e5fa4039-2f5c-437c-a147-7efe71d06f23';

export function useDashboard() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '1';
  const isDemo = localStorage.getItem('isDemoMode') === 'true';

  const [data, setData] = useState<DashboardData | null>(isDemo ? demoDashboardData : null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);
  const [activeHubId, setActiveHubId] = useState<number | null>(isDemo ? demoDashboardData.hubs[0].id : null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const completedHubsRef = useRef<Set<number>>(new Set());

  const loadDashboard = useCallback(async () => {
    if (localStorage.getItem('isDemoMode') === 'true') {
      setData(demoDashboardData);
      setActiveHubId((prev) => prev ?? demoDashboardData.hubs[0].id);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(DASHBOARD_API, {
        headers: { 'X-User-Id': String(userId) },
      });
      if (!res.ok) throw new Error('Не удалось загрузить дашборд');
      const json: DashboardData = await res.json();
      setData(json);
      completedHubsRef.current = new Set(json.hubs.filter((h) => h.progress === 100).map((h) => h.id));
      setActiveHubId((prev) => prev ?? (json.hubs.length ? json.hubs[0].id : null));
      setError(null);
    } catch (e) {
      console.error('loadDashboard failed', e);
      setData((prev) => {
        if (!prev) setError(e instanceof Error ? e.message : 'Ошибка');
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const toggleStep = useCallback(
    async (stepId: number, completed: boolean) => {
      if (!data) return;
      const next: DashboardData = JSON.parse(JSON.stringify(data));

      for (const h of next.hubs) {
        for (const s of h.sections) {
          if (s.mode === 'auto') continue;
          let touched = false;
          for (const st of s.steps) {
            if (st.id === stepId) {
              st.completed = completed;
              touched = true;
            }
          }
          if (touched) {
            const total = s.steps.length;
            const done = s.steps.filter((x) => x.completed).length;
            s.progress = total ? Math.round((done / total) * 100) : 0;
            s.completed_steps = done;
            s.total_steps = total;
          }
        }
        if (h.sections.length) {
          const avg = h.sections.reduce((a, s) => a + s.progress, 0) / h.sections.length;
          h.progress = Math.round(avg);
          h.completed_sections = h.sections.filter((s) => s.progress === 100).length;
        }
      }

      let overallSum = 0;
      let overallCount = 0;
      for (const h of next.hubs) {
        if (h.sections.length) {
          overallSum += h.sections.reduce((a, s) => a + s.progress, 0) / h.sections.length;
          overallCount += 1;
        }
      }
      next.stats.overall_progress = overallCount ? Math.round(overallSum / overallCount) : 0;
      next.stats.active_hubs = next.hubs.filter((h) => h.progress > 0).length;
      next.stats.completed_sections = next.hubs.reduce((a, h) => a + h.completed_sections, 0);

      for (const h of next.hubs) {
        const wasComplete = completedHubsRef.current.has(h.id);
        if (h.progress === 100 && !wasComplete) {
          completedHubsRef.current.add(h.id);
          setConfettiTrigger((c) => c + 1);
        } else if (h.progress < 100 && wasComplete) {
          completedHubsRef.current.delete(h.id);
        }
      }

      setData(next);

      if (localStorage.getItem('isDemoMode') === 'true') return;

      try {
        await fetch(DASHBOARD_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userId),
          },
          body: JSON.stringify({ step_id: stepId, completed }),
        });
      } catch (e) {
        console.error('toggle step failed', e);
      }
    },
    [data, userId],
  );

  const setSectionMode = useCallback(
    async (sectionId: number, mode: 'auto' | 'manual') => {
      try {
        await fetch(DASHBOARD_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userId),
          },
          body: JSON.stringify({ action: 'mode', section_id: sectionId, mode }),
        });
        await loadDashboard();
      } catch (e) {
        console.error('set mode failed', e);
      }
    },
    [userId, loadDashboard],
  );

  const setBulkMode = useCallback(
    async (sectionIds: number[], mode: 'auto' | 'manual') => {
      if (!sectionIds.length) return;
      try {
        await fetch(DASHBOARD_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userId),
          },
          body: JSON.stringify({ action: 'mode_bulk', section_ids: sectionIds, mode }),
        });
        await loadDashboard();
      } catch (e) {
        console.error('set bulk mode failed', e);
      }
    },
    [userId, loadDashboard],
  );

  const activeHub: Hub | null = useMemo(
    () => data?.hubs.find((h) => h.id === activeHubId) || null,
    [data, activeHubId],
  );

  return {
    userId,
    data,
    loading,
    error,
    loadDashboard,
    activeHubId,
    setActiveHubId,
    confettiTrigger,
    activeHub,
    toggleStep,
    setSectionMode,
    setBulkMode,
  };
}