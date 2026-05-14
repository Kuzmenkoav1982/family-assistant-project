import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { HubGoalView } from '@/lib/goals/hubHelpers';
import { formatLastActivity } from '@/lib/goals/hubHelpers';
import { GOAL_SPHERES, FRAMEWORKS } from '@/components/life-road/frameworks';

// Карточка цели для Goals Hub V1.
// Унифицированный вид независимо от методики (SMART/OKR/Wheel/generic).
// Показывает:
//  - иконку сферы + framework badge
//  - title (line-clamp-2) + смысл (опционально)
//  - mini progress bar + %
//  - последнюю активность
//  - attention-маркеры
//  - CTA «Открыть» (вся карточка кликабельна)

interface Props {
  view: HubGoalView;
  onOpen: () => void;
}

const FRAMEWORK_BADGE_GRADIENTS: Record<string, string> = {
  smart: 'from-blue-500 to-cyan-500',
  okr: 'from-violet-500 to-fuchsia-500',
  wheel: 'from-emerald-500 to-teal-500',
  generic: 'from-slate-400 to-slate-500',
};

const FRAMEWORK_ICON: Record<string, string> = {
  smart: 'Gauge',
  okr: 'Rocket',
  wheel: 'PieChart',
  generic: 'Target',
};

export default function GoalHubCard({ view, onOpen }: Props) {
  const { goal, execution, attention } = view;
  const sphere = GOAL_SPHERES.find((s) => s.id === goal.sphere);
  const framework = FRAMEWORKS.find((f) => f.id === goal.frameworkType);
  const fwType = goal.frameworkType || 'generic';
  const fwGradient = FRAMEWORK_BADGE_GRADIENTS[fwType] ?? FRAMEWORK_BADGE_GRADIENTS.generic;
  const fwIcon = FRAMEWORK_ICON[fwType] ?? FRAMEWORK_ICON.generic;

  const isDone = goal.status === 'done';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={
        'group text-left w-full bg-white/85 backdrop-blur-md rounded-2xl border p-3 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 ' +
        (attention.needsAttention
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-white/60 hover:border-purple-200')
      }
      aria-label={`Открыть цель ${goal.title}`}
    >
      {/* Верхняя строка: сфера + framework + статус */}
      <div className="flex items-center gap-2 flex-wrap">
        {sphere && (
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: sphere.color }}
            aria-hidden
          >
            <Icon name={sphere.icon} fallback="Circle" size={14} />
          </span>
        )}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r ${fwGradient} flex items-center gap-1 shrink-0`}
        >
          <Icon name={fwIcon} size={10} />
          {framework?.title ?? 'Цель'}
        </span>
        {sphere && (
          <Badge variant="outline" className="text-[10px] truncate max-w-[40%]">
            {sphere.label}
          </Badge>
        )}
        <span className="ml-auto flex items-center gap-1">
          {isDone && (
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Достигнуто</Badge>
          )}
          {goal.status === 'paused' && (
            <Badge variant="secondary" className="text-[10px]">Пауза</Badge>
          )}
          {goal.status === 'archived' && (
            <Badge variant="outline" className="text-[10px]">Архив</Badge>
          )}
        </span>
      </div>

      {/* Title */}
      <div>
        <div className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug">
          {goal.title || 'Без названия'}
        </div>
        {goal.whyText && (
          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
            <Icon name="Heart" size={10} className="inline-block mr-0.5 -mt-0.5 text-rose-400" />
            {goal.whyText}
          </div>
        )}
      </div>

      {/* Mini progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-500">прогресс</span>
          <span className="font-bold text-gray-800 tabular-nums">{execution}%</span>
        </div>
        <div
          className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={execution}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full bg-gradient-to-r ${fwGradient} transition-all`}
            style={{ width: `${Math.max(0, Math.min(100, execution))}%` }}
          />
        </div>
      </div>

      {/* Нижняя строка: последняя активность + attention chips + deadline */}
      <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <Icon name="Clock" size={10} />
          {formatLastActivity(attention.daysSinceUpdate)}
        </span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {attention.overdue && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              <Icon name="AlertTriangle" size={9} /> просрочено
            </span>
          )}
          {attention.stale && !attention.overdue && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              <Icon name="Hourglass" size={9} /> заброшено
            </span>
          )}
          {attention.lowProgress && goal.status === 'active' && !attention.overdue && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Icon name="TrendingDown" size={9} /> низкий прогресс
            </span>
          )}
          {goal.deadline && (
            <span className="flex items-center gap-0.5">
              <Icon name="Calendar" size={10} />
              {new Date(goal.deadline).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
