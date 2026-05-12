import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { getFramework } from '@/lib/goals/frameworkRegistry';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';

interface Props {
  goal: LifeGoal;
  milestones?: GoalMilestone[];
  keyResults?: GoalKeyResult[];
  readOnly?: boolean;
}

export default function GoalFrameworkPanel({ goal, milestones = [], keyResults = [], readOnly }: Props) {
  const fw = getFramework(goal.frameworkType);
  const state = goal.frameworkState as Record<string, string | number | undefined>;

  const renderSmart = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
      {[
        { k: 'specific', label: 'S — Конкретно', icon: 'CircleDot' },
        { k: 'measurable', label: 'M — Измеримо', icon: 'Gauge' },
        { k: 'achievable', label: 'A — Достижимо', icon: 'CheckCircle2' },
        { k: 'relevant', label: 'R — Релевантно', icon: 'Compass' },
        { k: 'timeBound', label: 'T — Срок', icon: 'CalendarClock' },
      ].map((f) => (
        <div key={f.k} className="rounded-xl bg-white/70 border border-blue-100 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 mb-1">
            <Icon name={f.icon} size={12} /> {f.label}
          </div>
          <div className="text-xs text-gray-700 min-h-[2.5em] whitespace-pre-wrap">
            {state?.[f.k] ? String(state[f.k]) : <span className="text-gray-400 italic">не заполнено</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderOkr = () => (
    <div className="space-y-2">
      <div className="rounded-xl bg-white/70 border border-violet-100 p-3">
        <div className="text-[11px] font-semibold text-violet-700 mb-1 flex items-center gap-1.5">
          <Icon name="Rocket" size={12} /> Objective
        </div>
        <div className="text-sm text-gray-800">
          {state?.objective ? String(state.objective) : <span className="text-gray-400 italic">не заполнено</span>}
        </div>
      </div>
      <div className="rounded-xl bg-white/70 border border-violet-100 p-3">
        <div className="text-[11px] font-semibold text-violet-700 mb-2 flex items-center gap-1.5">
          <Icon name="ListChecks" size={12} /> Key Results ({keyResults.length})
        </div>
        {keyResults.length === 0 && (
          <div className="text-xs text-gray-400 italic">
            Ключевые результаты ещё не добавлены. Появятся здесь после добавления.
          </div>
        )}
        <div className="space-y-1.5">
          {keyResults.map((kr) => {
            const span = kr.targetValue - kr.startValue || 1;
            const pct = Math.max(0, Math.min(100, Math.round(((kr.currentValue - kr.startValue) / span) * 100)));
            return (
              <div key={kr.id} className="text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-gray-700">{kr.title}</span>
                  <span className="text-violet-700 font-semibold">
                    {kr.currentValue}/{kr.targetValue} {kr.unit || ''}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderWheel = () => {
    const baseline = (state?.baselineScores as unknown as Record<string, number>) || {};
    const target = (state?.targetScores as unknown as Record<string, number>) || {};
    const current = (state?.currentScores as unknown as Record<string, number>) || {};
    const linked = goal.linkedSphereIds || [];
    if (linked.length === 0) {
      return (
        <div className="text-xs text-gray-400 italic rounded-xl bg-white/70 border border-emerald-100 p-3">
          Сферы пока не привязаны. Выбери сферы Колеса баланса в редакторе цели.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {linked.map((sid) => {
          const bs = baseline[sid] ?? 0;
          const tg = target[sid] ?? 0;
          const cur = current[sid] ?? bs;
          const span = tg - bs;
          const pct = span > 0 ? Math.max(0, Math.min(100, Math.round(((cur - bs) / span) * 100))) : 0;
          return (
            <div key={sid} className="rounded-xl bg-white/70 border border-emerald-100 p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 mb-1.5">
                <span>{sid}</span>
                <span>было {bs} → стало {cur} / цель {tg}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGeneric = () => (
    <div className="rounded-xl bg-white/70 border border-slate-200 p-3 text-xs text-gray-500">
      У этой цели нет методики. Можешь оставить как есть — это нормально для коротких задач.
      Если хочешь, чтобы Домовой вёл цель по системе, выбери методику в редакторе.
    </div>
  );

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

      {goal.frameworkType === 'smart' && renderSmart()}
      {goal.frameworkType === 'okr' && renderOkr()}
      {goal.frameworkType === 'wheel' && renderWheel()}
      {goal.frameworkType === 'generic' && renderGeneric()}
    </div>
  );
}
