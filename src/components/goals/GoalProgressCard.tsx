import Icon from '@/components/ui/icon';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';

interface Props {
  goal: LifeGoal;
  milestones: GoalMilestone[];
  keyResults: GoalKeyResult[];
}

const SOURCE_LABEL: Record<string, string> = {
  milestones: 'по вехам',
  keyResults: 'по ключевым результатам',
  wheel: 'по сферам колеса',
  steps: 'по шагам',
  manual: 'ручная оценка',
};

export default function GoalProgressCard({ goal, milestones, keyResults }: Props) {
  const { execution, source, outcomeSignal } = computeProgress(goal, milestones, keyResults);

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon name="Gauge" size={14} className="text-purple-600" />
            <div className="text-xs font-bold text-gray-700">Прогресс исполнения</div>
          </div>
          <div className="flex items-end gap-2 mb-1">
            <div className="text-3xl font-extrabold text-purple-700">{execution}%</div>
            <div className="text-[11px] text-gray-500 mb-1">{SOURCE_LABEL[source]}</div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${execution}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon name="Sparkles" size={14} className="text-emerald-600" />
            <div className="text-xs font-bold text-gray-700">Сигнал результата</div>
          </div>
          {outcomeSignal !== null ? (
            <div className="flex items-end gap-2 mb-1">
              <div className="text-3xl font-extrabold text-emerald-700">
                {outcomeSignal > 0 ? '+' : ''}
                {outcomeSignal}
              </div>
              <div className="text-[11px] text-gray-500 mb-1">изменение сферы</div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic mt-2">
              Появится, когда сфера будет переоценена в Портфолио.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
