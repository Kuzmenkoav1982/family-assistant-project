import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GoalFrameworkPanel from '@/components/goals/GoalFrameworkPanel';
import GoalProgressCard from '@/components/goals/GoalProgressCard';
import GoalWhyCard from '@/components/goals/GoalWhyCard';
import GoalExecutionCard from '@/components/goals/GoalExecutionCard';
import { lifeApi } from '@/components/life-road/api';
import { normalizeLegacyGoal } from '@/lib/goals/goalMappers';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';

export default function WorkshopGoalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<LifeGoal | null>(null);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [keyResults, setKeyResults] = useState<GoalKeyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      lifeApi.listGoals(),
      lifeApi.listMilestones(id).catch(() => []),
      lifeApi.listKeyResults(id).catch(() => []),
    ])
      .then(([allGoals, ms, krs]) => {
        if (cancelled) return;
        const raw = allGoals.find((g) => g.id === id);
        if (!raw) {
          setError('Цель не найдена. Возможно, она была удалена.');
          setGoal(null);
        } else {
          setGoal(normalizeLegacyGoal(raw));
          setMilestones(ms as GoalMilestone[]);
          setKeyResults(krs as GoalKeyResult[]);
        }
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message || 'Не удалось загрузить цель');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLegacy = useMemo(
    () => goal?.frameworkType === 'generic' && !!goal?.framework && goal.framework !== 'generic',
    [goal],
  );

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
          <div className="ml-auto flex items-center gap-1.5">
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

        {/* Block 2 — Методика */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm">
          <GoalFrameworkPanel goal={goal} milestones={milestones} keyResults={keyResults} />
        </div>

        {/* Block 3 — Исполнение */}
        <GoalExecutionCard goal={goal} milestones={milestones} keyResults={keyResults} />

        {/* Block 4 — Прогресс */}
        <GoalProgressCard goal={goal} milestones={milestones} keyResults={keyResults} />
      </div>
    </div>
  );
}
