import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { getFramework } from '@/lib/goals/frameworkRegistry';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';
import SmartPanel from './frameworks/SmartPanel';
import OkrPanel from './frameworks/OkrPanel';
import WheelPanel from './frameworks/WheelPanel';

interface Props {
  goal: LifeGoal;
  milestones?: GoalMilestone[];
  keyResults?: GoalKeyResult[];
  readOnly?: boolean;
  onGoalChanged?: (next: LifeGoal) => void;
  onCollectionsChanged?: () => Promise<void> | void;
}

// Роутит к редактируемым framework-панелям.
// Generic — оставляем простым (правило 6: не натягиваем SMART/OKR поведение).

export default function GoalFrameworkPanel({
  goal,
  keyResults = [],
  readOnly,
  onGoalChanged,
  onCollectionsChanged,
}: Props) {
  const fw = getFramework(goal.frameworkType);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${fw.gradient} text-white flex items-center justify-center`}>
          <Icon name={fw.icon} size={16} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">{fw.title}</div>
          <div className="text-[11px] text-gray-500">{fw.short}</div>
        </div>
        {readOnly && (
          <Badge variant="outline" className="ml-auto text-[10px]">
            только чтение
          </Badge>
        )}
      </div>

      {goal.frameworkType === 'smart' && !readOnly && (
        <SmartPanel goal={goal} onSaved={onGoalChanged} />
      )}
      {goal.frameworkType === 'okr' && !readOnly && (
        <OkrPanel goal={goal} keyResults={keyResults} onChanged={onCollectionsChanged} />
      )}
      {goal.frameworkType === 'wheel' && !readOnly && (
        <WheelPanel goal={goal} onSaved={onGoalChanged} />
      )}
      {goal.frameworkType === 'generic' && (
        <div className="rounded-xl bg-white/70 border border-slate-200 p-3 text-xs text-gray-500">
          У этой цели нет методики. Можешь оставить как есть — это нормально для коротких задач.
          Если хочешь, чтобы Домовой вёл цель по системе, выбери методику в редакторе.
        </div>
      )}

      {readOnly && goal.frameworkType !== 'generic' && (
        <div className="text-[11px] text-gray-400 italic">
          Режим только чтения. Редактирование доступно на странице цели.
        </div>
      )}
    </div>
  );
}
