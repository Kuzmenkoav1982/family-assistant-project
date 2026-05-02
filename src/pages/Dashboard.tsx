import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import DashboardWheel from '@/components/dashboard/DashboardWheel';
import HubDetailsCard from '@/components/dashboard/HubDetailsCard';
import AnimatedBackground from '@/components/dashboard/AnimatedBackground';
import DomovoyTip from '@/components/dashboard/DomovoyTip';
import Confetti from '@/components/dashboard/Confetti';
import FamilyRatingWidget from '@/components/dashboard/FamilyRatingWidget';
import RatingCampaignWidget from '@/components/dashboard/RatingCampaignWidget';
import { SectionHelp } from '@/components/children/SectionHelp';
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
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const completedHubsRef = useRef<Set<number>>(new Set());

  const loadDashboard = useCallback(async () => {
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
      next.stats.completed_sections = next.hubs.reduce(
        (a, h) => a + h.completed_sections,
        0,
      );

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
          body: JSON.stringify({
            action: 'mode_bulk',
            section_ids: sectionIds,
            mode,
          }),
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
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <Confetti trigger={confettiTrigger} />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-32">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(251,146,60,0.2)] flex items-center justify-center hover:shadow-[0_6px_25px_-4px_rgba(251,146,60,0.3)] hover:scale-105 transition-all"
            aria-label="Назад"
          >
            <Icon name="ChevronLeft" size={20} className="text-slate-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Наша Семья
          </h1>
          <button
            onClick={() => navigate('/notifications')}
            className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(251,146,60,0.2)] flex items-center justify-center relative hover:shadow-[0_6px_25px_-4px_rgba(251,146,60,0.3)] hover:scale-105 transition-all"
            aria-label="Уведомления"
          >
            <Icon name="Bell" size={20} className="text-slate-700" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>
        </div>

        <div className="mb-3">
          <SectionHelp
            emoji="🧭"
            title="Как пользоваться дашбордом"
            description="Дашборд — твой штаб семейной жизни. Здесь видно прогресс по каждой сфере (здоровье, финансы, питание, развитие и т.д.) и куда стоит направить силы прямо сейчас."
            tips={[
              "Колесо хабов — кликни на любой сектор, чтобы увидеть детали раздела и быстро перейти внутрь",
              "Шаги в разделах: отмечай выполненные — прогресс автоматически растёт по сферам",
              "Авто-режим: если не хочешь чек-листы, переключи раздел в авто и прогресс будет считаться сам",
              "Рейтинг семей внизу — соревнуйся с другими семьями и попадай в топ за призы",
              "Домовой подсказывает, на что обратить внимание именно сейчас",
            ]}
          />
        </div>

        <DomovoyTip hubs={data.hubs} overall={data.stats.overall_progress} />

        <div className="lg:grid lg:grid-cols-[1fr,360px] lg:gap-6 lg:items-start">
          <div className="-mx-3 sm:mx-0">
            <DashboardWheel
              hubs={data.hubs}
              stats={data.stats}
              activeHubId={activeHubId}
              onSelectHub={setActiveHubId}
            />
          </div>

          <div className="mt-4 lg:mt-12">
            {activeHub && (
              <HubDetailsCard
                hub={activeHub}
                onToggleStep={toggleStep}
                onSetMode={setSectionMode}
                onSetBulkMode={setBulkMode}
                onOpenSection={(route) => navigate(route)}
                onOpenHub={(route) => navigate(route)}
              />
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <RatingCampaignWidget userId={String(userId)} />
          <FamilyRatingWidget userId={String(userId)} />
        </div>
      </div>
    </div>
  );
}