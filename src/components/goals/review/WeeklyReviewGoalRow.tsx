import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { WeeklyGoalView } from '@/lib/goals/weeklyReviewHelpers';
import { formatLastActivity } from '@/lib/goals/hubHelpers';
import { GOAL_SPHERES, FRAMEWORKS } from '@/components/life-road/frameworks';

interface Props {
  view: WeeklyGoalView;
  /** Какой стиль строки: позитивный (зелёный delta), негативный (розовый), нейтральный. */
  variant: 'progress' | 'regress' | 'review' | 'updated';
  onOpen: () => void;
}

const FRAMEWORK_BADGE: Record<string, { gradient: string; icon: string }> = {
  smart: { gradient: 'from-blue-500 to-cyan-500', icon: 'Gauge' },
  okr: { gradient: 'from-violet-500 to-fuchsia-500', icon: 'Rocket' },
  wheel: { gradient: 'from-emerald-500 to-teal-500', icon: 'PieChart' },
  generic: { gradient: 'from-slate-400 to-slate-500', icon: 'Target' },
};

export default function WeeklyReviewGoalRow({ view, variant, onOpen }: Props) {
  const { goal, weeklyDeltaSum, weeklyCount, execution, attention } = view;
  const sphere = GOAL_SPHERES.find((s) => s.id === goal.sphere);
  const framework = FRAMEWORKS.find((f) => f.id === goal.frameworkType);
  const fwType = goal.frameworkType || 'generic';
  const fw = FRAMEWORK_BADGE[fwType] ?? FRAMEWORK_BADGE.generic;

  const deltaText =
    weeklyDeltaSum !== null
      ? `${weeklyDeltaSum > 0 ? '+' : ''}${Math.round(weeklyDeltaSum * 100) / 100}`
      : null;

  const deltaTone =
    variant === 'progress'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
      : variant === 'regress'
        ? 'bg-rose-100 text-rose-700 border-rose-300'
        : 'bg-gray-100 text-gray-700 border-gray-300';

  // Универсальный aria-label, чтобы строка читалась screen reader-ом без визуала
  const reviewReason = attention.overdue
    ? 'просрочено'
    : attention.stale
      ? 'давно нет обновлений'
      : weeklyCount === 0
        ? 'нет активности за неделю'
        : '';
  const ariaLabel = `Открыть цель ${goal.title}. ${framework?.title ?? 'Цель'}. Прогресс ${execution} процентов.${
    deltaText ? ' Дельта за неделю: ' + deltaText : ''
  }${reviewReason ? '. Причина пересмотра: ' + reviewReason : ''}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={ariaLabel}
      className={
        'group text-left w-full bg-white rounded-xl border p-3 hover:shadow-md transition-all flex flex-col gap-1.5 ' +
        (variant === 'review'
          ? 'border-amber-200 hover:border-amber-300'
          : 'border-gray-100 hover:border-purple-200')
      }
    >
      <div className="flex items-center gap-2 flex-wrap">
        {sphere && (
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: sphere.color }}
            aria-hidden
          >
            <Icon name={sphere.icon} fallback="Circle" size={12} />
          </span>
        )}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r ${fw.gradient} flex items-center gap-1 shrink-0`}
        >
          <Icon name={fw.icon} size={9} />
          {framework?.title ?? 'Цель'}
        </span>
        <span className="ml-auto flex items-center gap-1">
          {deltaText && (
            <span
              className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${deltaTone}`}
            >
              <Icon
                name={variant === 'regress' ? 'TrendingDown' : 'TrendingUp'}
                size={9}
                className="mr-0.5"
              />
              {deltaText}
            </span>
          )}
          {variant === 'review' && attention.overdue && (
            <Badge className="text-[9px] bg-rose-100 text-rose-700 border-rose-200">
              просрочено
            </Badge>
          )}
          {variant === 'review' && !attention.overdue && attention.stale && (
            <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200">
              заброшено
            </Badge>
          )}
          {variant === 'review' && !attention.overdue && !attention.stale && weeklyCount === 0 && (
            <Badge className="text-[9px] bg-slate-100 text-slate-700 border-slate-200">
              без активности
            </Badge>
          )}
        </span>
      </div>

      <div className="text-sm font-semibold text-gray-900 line-clamp-1">
        {goal.title || 'Без названия'}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <Icon name="Gauge" size={10} />
          <span className="tabular-nums">{execution}%</span>
          {weeklyCount > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <Icon name="MessageCircle" size={10} />
              {weeklyCount} {weeklyCount === 1 ? 'замер' : 'замеров'}
            </>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="Clock" size={10} />
          {formatLastActivity(attention.daysSinceUpdate)}
        </span>
      </div>
    </button>
  );
}
