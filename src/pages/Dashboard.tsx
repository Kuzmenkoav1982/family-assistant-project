import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import DashboardWheel from '@/components/dashboard/DashboardWheel';
import HubDetailsCard from '@/components/dashboard/HubDetailsCard';
import type { DashboardData, Hub } from '@/components/dashboard/types';

const DASHBOARD_API = 'https://functions.poehali.dev/e5fa4039-2f5c-437c-a147-7efe71d06f23';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '1';

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHubId, setActiveHubId] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(DASHBOARD_API, {
        headers: { 'X-User-Id': String(userId) },
      });
      if (!res.ok) throw new Error('Не удалось загрузить дашборд');
      const json: DashboardData = await res.json();
      setData(json);
      if (!activeHubId && json.hubs.length) setActiveHubId(json.hubs[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, [userId, activeHubId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const toggleStep = useCallback(
    async (stepId: number, completed: boolean) => {
      if (!data) return;
      const next: DashboardData = JSON.parse(JSON.stringify(data));
      for (const h of next.hubs) {
        for (const s of h.sections) {
          for (const st of s.steps) {
            if (st.id === stepId) st.completed = completed;
          }
          const total = s.steps.length;
          const done = s.steps.filter((x) => x.completed).length;
          s.progress = total ? Math.round((done / total) * 100) : 0;
          s.completed_steps = done;
          s.total_steps = total;
        }
        const hubDone = h.sections.reduce((a, s) => a + s.completed_steps, 0);
        const hubTotal = h.sections.reduce((a, s) => a + s.total_steps, 0);
        h.progress = hubTotal ? Math.round((hubDone / hubTotal) * 100) : 0;
        h.completed_sections = h.sections.filter((s) => s.progress === 100).length;
      }
      const allDone = next.hubs.reduce(
        (a, h) => a + h.sections.reduce((b, s) => b + s.completed_steps, 0),
        0,
      );
      const allTotal = next.hubs.reduce(
        (a, h) => a + h.sections.reduce((b, s) => b + s.total_steps, 0),
        0,
      );
      next.stats.overall_progress = allTotal ? Math.round((allDone / allTotal) * 100) : 0;
      next.stats.active_hubs = next.hubs.filter((h) => h.progress > 0).length;
      next.stats.completed_sections = next.hubs.reduce(
        (a, h) => a + h.completed_sections,
        0,
      );
      setData(next);

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

  const activeHub: Hub | null = useMemo(
    () => data?.hubs.find((h) => h.id === activeHubId) || null,
    [data, activeHubId],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Загружаем дашборд...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center max-w-sm px-6">
          <Icon name="CircleAlert" size={48} className="mx-auto text-red-400 mb-3" />
          <p className="text-slate-700 mb-4">{error || 'Не удалось загрузить'}</p>
          <button
            onClick={loadDashboard}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_#ffffff_0%,_#f1f5f9_60%,_#e2e8f0_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-pink-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-slate-200/50" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-slate-200/40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full border border-slate-200/30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-4 pb-32">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)] flex items-center justify-center hover:shadow-[0_6px_25px_-4px_rgba(15,23,42,0.15)] transition-all"
            aria-label="Назад"
          >
            <Icon name="ChevronLeft" size={20} className="text-slate-600" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-[0.15em] text-slate-800">
            НАША СЕМЬЯ
          </h1>
          <button
            onClick={() => navigate('/notifications')}
            className="w-11 h-11 rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)] flex items-center justify-center relative hover:shadow-[0_6px_25px_-4px_rgba(15,23,42,0.15)] transition-all"
            aria-label="Уведомления"
          >
            <Icon name="Bell" size={20} className="text-slate-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr,360px] lg:gap-6 lg:items-start">
          <DashboardWheel
            hubs={data.hubs}
            stats={data.stats}
            activeHubId={activeHubId}
            onSelectHub={setActiveHubId}
          />

          <div className="mt-6 lg:mt-12">
            {activeHub && (
              <HubDetailsCard
                hub={activeHub}
                onToggleStep={toggleStep}
                onOpenSection={(route) => navigate(route)}
                onOpenHub={(route) => navigate(route)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
