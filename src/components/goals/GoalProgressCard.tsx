import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';
import { computeProgress, type DeadlineStatus } from '@/lib/goals/progress';

interface Props {
  goal: LifeGoal;
  milestones: GoalMilestone[];
  keyResults: GoalKeyResult[];
}

const SOURCE_LABEL: Record<string, string> = {
  milestones: 'по вехам',
  keyResults: 'по ключевым результатам',
  wheel: 'по сферам колеса',
  smart: 'по метрике SMART',
  steps: 'по шагам',
  manual: 'недостаточно данных',
};

const DEADLINE_BADGE: Record<DeadlineStatus, { label: string; icon: string; className: string } | null> = {
  none: null,
  on_track: { label: 'В графике', icon: 'CalendarCheck', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  due_soon: { label: 'Срок близко', icon: 'CalendarClock', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  overdue: { label: 'Просрочено', icon: 'CalendarX', className: 'bg-rose-100 text-rose-700 border-rose-200' },
};

export default function GoalProgressCard({ goal, milestones, keyResults }: Props) {
  const p = computeProgress(goal, milestones, keyResults);
  const deadlineBadge = DEADLINE_BADGE[p.deadlineStatus];

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Execution — без срока, чистый показатель движения */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon name="Gauge" size={14} className="text-purple-600" />
            <div className="text-xs font-bold text-gray-700">Прогресс исполнения</div>
            {p.overshoot && (
              <Badge variant="outline" className="text-[9px] border-violet-300 text-violet-700 ml-auto">
                <Icon name="Sparkles" size={9} className="mr-0.5" /> перевыполнено
              </Badge>
            )}
          </div>
          <div className="flex items-end gap-2 mb-1">
            <div className="text-3xl font-extrabold text-purple-700">{p.execution}%</div>
            <div className="text-[11px] text-gray-500 mb-1">{SOURCE_LABEL[p.source]}</div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${p.execution}%` }}
            />
          </div>
          {p.insufficientData && (
            <p className="text-[10px] text-amber-700 bg-amber-50 rounded p-1.5 mt-1.5 flex items-start gap-1">
              <Icon name="TriangleAlert" size={10} className="mt-0.5 flex-shrink-0" />
              {p.insufficientData}
            </p>
          )}
        </div>

        {/* Outcome signal + Deadline — раздельные каналы */}
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="Sparkles" size={14} className="text-emerald-600" />
              <div className="text-xs font-bold text-gray-700">Сигнал результата</div>
            </div>
            {p.outcomeSignal !== null ? (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-extrabold text-emerald-700">
                  {p.outcomeSignal > 0 ? '+' : ''}
                  {p.outcomeSignal}
                </div>
                <div className="text-[11px] text-gray-500 mb-0.5">изменение сферы</div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">
                Появится, когда сфера будет переоценена в Портфолио.
              </div>
            )}
          </div>

          {deadlineBadge && (
            <div>
              <div className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                <Icon name="Clock" size={14} className="text-gray-500" />
                Срок
              </div>
              <Badge variant="outline" className={`text-[11px] ${deadlineBadge.className}`}>
                <Icon name={deadlineBadge.icon} size={11} className="mr-1" />
                {deadlineBadge.label}
                {p.daysToDeadline !== null && (
                  <span className="ml-1 opacity-70">
                    ({p.daysToDeadline >= 0 ? `${p.daysToDeadline} дн` : `−${Math.abs(p.daysToDeadline)} дн`})
                  </span>
                )}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
