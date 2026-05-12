import Icon from '@/components/ui/icon';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';

interface Props {
  goal: LifeGoal;
  milestones: GoalMilestone[];
  keyResults: GoalKeyResult[];
}

export default function GoalExecutionCard({ goal, milestones, keyResults }: Props) {
  const hasItems = milestones.length > 0 || keyResults.length > 0 || (goal.steps?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center">
          <Icon name="ListChecks" size={16} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">Исполнение</div>
          <div className="text-[11px] text-gray-500">Вехи, шаги и ключевые результаты</div>
        </div>
      </div>

      {!hasItems && (
        <div className="text-xs text-gray-400 italic rounded-xl bg-slate-50 border border-slate-100 p-3">
          Пока ничего нет. На следующем этапе появится мастер «Разбить на месяц» — он создаст
          вехи и задачи из методики автоматически.
        </div>
      )}

      {milestones.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Вехи</div>
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
              >
                <Icon
                  name={m.status === 'done' ? 'CheckCircle2' : 'Circle'}
                  size={14}
                  className={m.status === 'done' ? 'text-emerald-600' : 'text-gray-400'}
                />
                <span className={m.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}>
                  {m.title}
                </span>
                {m.dueDate && (
                  <span className="ml-auto text-[10px] text-gray-400">
                    {new Date(m.dueDate).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {keyResults.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Ключевые результаты</div>
          <div className="space-y-1.5">
            {keyResults.map((kr) => (
              <div
                key={kr.id}
                className="flex items-center gap-2 text-xs bg-white rounded-lg border border-gray-100 p-2"
              >
                <Icon name="Target" size={14} className="text-violet-600" />
                <span className="text-gray-800">{kr.title}</span>
                <span className="ml-auto text-violet-700 font-semibold">
                  {kr.currentValue}/{kr.targetValue} {kr.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {goal.steps?.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Шаги (legacy)</div>
          <div className="space-y-1">
            {goal.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Icon
                  name={s.done ? 'CheckCircle2' : 'Circle'}
                  size={12}
                  className={s.done ? 'text-emerald-600' : 'text-gray-400'}
                />
                <span className={s.done ? 'text-gray-500 line-through' : 'text-gray-700'}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
