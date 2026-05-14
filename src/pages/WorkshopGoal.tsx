import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GoalFrameworkPanel from '@/components/goals/GoalFrameworkPanel';
import GoalProgressCard from '@/components/goals/GoalProgressCard';
import GoalWhyCard from '@/components/goals/GoalWhyCard';
import SmartProgressDisplay from '@/components/goals/SmartProgressDisplay';
import SmartCheckin from '@/components/goals/SmartCheckin';
import GoalExecutionCard from '@/components/goals/GoalExecutionCard';
import GoalCheckinsCard from '@/components/goals/GoalCheckinsCard';
import GoalLinkedTasksCard from '@/components/goals/GoalLinkedTasksCard';
import GoalPortfolioLinksCard from '@/components/goals/GoalPortfolioLinksCard';
import CreateTaskFromGoalDialog from '@/components/goals/CreateTaskFromGoalDialog';
import CreateAchievementFromGoalDialog from '@/components/goals/CreateAchievementFromGoalDialog';
import { lifeApi } from '@/components/life-road/api';
import { normalizeLegacyGoal } from '@/lib/goals/goalMappers';
import { computeProgress } from '@/lib/goals/progress';
import {
  buildPrefillFromGoal,
  buildPrefillFromKr,
  buildPrefillFromMilestone,
  type CreateTaskFromGoalInput,
} from '@/lib/goals/tasksBridge';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';

export default function WorkshopGoalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<LifeGoal | null>(null);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [keyResults, setKeyResults] = useState<GoalKeyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bridge state: prefill + видимость диалога + счётчик-триггер для refresh linked tasks
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskPrefill, setTaskPrefill] = useState<CreateTaskFromGoalInput | null>(null);
  const [linkedTasksRefresh, setLinkedTasksRefresh] = useState(0);
  // Этап 3.4.1: manual handoff в Portfolio.
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [portfolioLinksRefresh, setPortfolioLinksRefresh] = useState(0);
  // Счётчик-триггер для перечитывания истории check-ins после быстрого замера.
  const [checkinsRefreshKey, setCheckinsRefreshKey] = useState(0);
  // ID только что созданного check-in — нужен, чтобы подсветить именно эту строку,
  // а не первую по порядку. После того как UI подсветил запись, сбрасывается в null.
  const [pendingHighlightCheckinId, setPendingHighlightCheckinId] = useState<string | null>(null);
  // Pulse-эффект прогресса: показываем только при реальном изменении execution.
  // Не переживает hard refresh — это runtime-only состояние.
  const [progressFlash, setProgressFlash] = useState<{
    delta: number;
    from: number;
    to: number;
    nonce: number;
  } | null>(null);

  const loadGoal = async (gid: string) => {
    const [allGoals, ms, krs] = await Promise.all([
      lifeApi.listGoals(),
      lifeApi.listMilestones(gid).catch(() => []),
      lifeApi.listKeyResults(gid).catch(() => []),
    ]);
    const raw = allGoals.find((g) => g.id === gid);
    if (!raw) throw new Error('Цель не найдена. Возможно, она была удалена.');
    setGoal(normalizeLegacyGoal(raw));
    setMilestones(ms as GoalMilestone[]);
    setKeyResults(krs as GoalKeyResult[]);
  };

  const reloadCollections = async () => {
    if (!id) return;
    const [ms, krs] = await Promise.all([
      lifeApi.listMilestones(id).catch(() => []),
      lifeApi.listKeyResults(id).catch(() => []),
    ]);
    setMilestones(ms as GoalMilestone[]);
    setKeyResults(krs as GoalKeyResult[]);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadGoal(id)
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || 'Не удалось загрузить цель');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
     
  }, [id]);

  // Автосброс pulse-эффекта прогресса через 2 сек.
  // nonce в зависимостях гарантирует, что повторный check-in даст свежий таймер,
  // а не «доживёт» старый.
  useEffect(() => {
    if (!progressFlash) return;
    const t = setTimeout(() => setProgressFlash(null), 2000);
    return () => clearTimeout(t);
  }, [progressFlash?.nonce]);

  // Обёртка над setGoal после check-in: сравниваем execution до/после
  // и поднимаем pulse только при реальном изменении.
  const applyGoalAfterCheckin = (next: LifeGoal) => {
    const normalized = normalizeLegacyGoal(next);
    const prevExec = goal ? computeProgress(goal, [], []).execution : 0;
    const nextExec = computeProgress(normalized, [], []).execution;
    const delta = nextExec - prevExec;
    setGoal(normalized);
    if (delta !== 0) {
      setProgressFlash({
        delta,
        from: prevExec,
        to: nextExec,
        nonce: Date.now(),
      });
    }
  };

  const isLegacy = useMemo(
    () => goal?.frameworkType === 'generic' && !!goal?.framework && goal.framework !== 'generic',
    [goal],
  );

  const openCreateTask = (prefill: CreateTaskFromGoalInput) => {
    setTaskPrefill(prefill);
    setTaskDialogOpen(true);
  };

  const openCreateTaskFromGoal = () => {
    if (!goal) return;
    openCreateTask(
      buildPrefillFromGoal({
        goalId: goal.id,
        goalTitle: goal.title,
        goalDeadline: goal.deadline,
      }),
    );
  };

  const openCreateTaskFromMilestone = (m: GoalMilestone) => {
    if (!goal) return;
    openCreateTask(
      buildPrefillFromMilestone({
        goalId: goal.id,
        goalTitle: goal.title,
        milestoneId: m.id,
        milestoneTitle: m.title,
        milestoneDueDate: m.dueDate,
      }),
    );
  };

  const openCreateTaskFromKr = (kr: GoalKeyResult) => {
    if (!goal) return;
    openCreateTask(
      buildPrefillFromKr({
        goalId: goal.id,
        goalTitle: goal.title,
        krId: kr.id,
        krTitle: kr.title,
        krDueDate: kr.dueDate,
      }),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
          Загружаем цель...
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
        <div className="max-w-2xl mx-auto bg-white/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <Icon name="CircleAlert" size={20} />
            <h2 className="text-lg font-bold">Не удалось открыть цель</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">{error || 'Цель не найдена'}</p>
          <Button onClick={() => navigate('/workshop')}>
            <Icon name="ArrowLeft" size={14} className="mr-1.5" /> К Мастерской
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/workshop')}>
            <Icon name="ArrowLeft" size={14} className="mr-1.5" /> Мастерская
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={openCreateTaskFromGoal}
            title="Создать задачу из этой цели"
          >
            <Icon name="Plus" size={12} className="mr-1" /> Задача из цели
          </Button>
          {goal.status === 'done' && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setAchievementDialogOpen(true)}
              title="Создать достижение в Портфолио"
            >
              <Icon name="Trophy" size={12} className="mr-1" /> Достижение
            </Button>
          )}
          <div className="flex items-center gap-1.5">
            {goal.status === 'done' && (
              <Badge className="bg-emerald-100 text-emerald-700">Достигнуто</Badge>
            )}
            {goal.status === 'paused' && <Badge variant="secondary">Пауза</Badge>}
            {goal.status === 'archived' && <Badge variant="outline">Архив</Badge>}
          </div>
        </div>

        {/* Title */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{goal.title}</h1>
          {goal.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Icon name="CalendarClock" size={12} />
              срок: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
            </div>
          )}
          {isLegacy && (
            <div className="mt-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-2 flex items-start gap-1.5">
              <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0" />
              <div>
                Цель создана в старом формате — методика записана как «{goal.framework}», но без структуры.
                Чтобы методика стала живой, открой редактирование и выбери Конкретную методику заново.
              </div>
            </div>
          )}
        </div>

        {/* Block 1 — Смысл */}
        <GoalWhyCard goal={goal} />

        {/* Smart vertical slice: панель прогресса + быстрый замер.
            Видны сразу под смыслом, до редактирования методики.
            Поддерживаем и legacy-цели, где SMART записан в framework строкой. */}
        {(goal.frameworkType === 'smart' ||
          (goal.framework === 'smart' &&
            goal.frameworkType !== 'okr' &&
            goal.frameworkType !== 'wheel')) && (
          <>
            <SmartProgressDisplay
              goal={goal}
              variant="full"
              flash={progressFlash}
            />
            <SmartCheckin
              goal={goal}
              onSaved={applyGoalAfterCheckin}
              onCheckinSaved={(checkinId) => {
                setCheckinsRefreshKey((n) => n + 1);
                if (checkinId) setPendingHighlightCheckinId(checkinId);
              }}
            />
          </>
        )}

        {/* Block 2 — Методика (живая, редактируемая) */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm">
          <GoalFrameworkPanel
            goal={goal}
            milestones={milestones}
            keyResults={keyResults}
            onGoalChanged={(next) => setGoal(normalizeLegacyGoal(next))}
            onCollectionsChanged={reloadCollections}
          />
        </div>

        {/* Block 3 — Исполнение */}
        <GoalExecutionCard
          goal={goal}
          milestones={milestones}
          keyResults={keyResults}
          onChanged={reloadCollections}
          onCreateTaskFromMilestone={openCreateTaskFromMilestone}
          onCreateTaskFromKr={openCreateTaskFromKr}
        />

        {/* Block 4 — Прогресс */}
        <GoalProgressCard goal={goal} milestones={milestones} keyResults={keyResults} />

        {/* Block 5 — Связанные задачи (мост в Планирование) */}
        <GoalLinkedTasksCard
          goal={goal}
          onCreateClick={openCreateTaskFromGoal}
          refreshKey={linkedTasksRefresh}
        />

        {/* Block 6 — Связанные материалы из Портфолио (Этап 3.3.1) */}
        <GoalPortfolioLinksCard goal={goal} refreshKey={portfolioLinksRefresh} />

        {/* Block 7 — Check-ins (reflection, не source) */}
        <GoalCheckinsCard
          goal={goal}
          keyResults={keyResults}
          refreshKey={checkinsRefreshKey}
          highlightCheckinId={pendingHighlightCheckinId ?? undefined}
          onHighlightConsumed={() => setPendingHighlightCheckinId(null)}
        />
      </div>

      <CreateTaskFromGoalDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        prefill={taskPrefill}
        onCreated={() => setLinkedTasksRefresh((n) => n + 1)}
      />

      <CreateAchievementFromGoalDialog
        open={achievementDialogOpen}
        onOpenChange={setAchievementDialogOpen}
        goal={goal}
        onCreated={() => setPortfolioLinksRefresh((n) => n + 1)}
      />
    </div>
  );
}