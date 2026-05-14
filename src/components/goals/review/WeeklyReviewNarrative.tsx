import Icon from '@/components/ui/icon';
import {
  pluralRu,
  type NarrativeNudge,
  type NarrativeTone,
  type WeeklyNarrative,
} from '@/lib/goals/weeklyReviewNarrative';

// V1.1 — мягкая полоса итога недели + 1–2 actionable nudges.
// Никакого AI, никакой эмоциональной нагрузки.

interface Props {
  narrative: WeeklyNarrative;
  /** Сколько обновлений было за неделю — кладём в маленький period-label. */
  goalsUpdatedThisWeek: number;
  /** Куда вести по nudge. Решает родитель (Section), а не сам компонент. */
  onNudgeClick: (nudge: NarrativeNudge) => void;
}

const TONE_STYLES: Record<
  NarrativeTone,
  { wrap: string; iconBg: string; iconColor: string; label: string; icon: string }
> = {
  positive: {
    wrap: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    label: 'text-emerald-700',
    icon: 'TrendingUp',
  },
  mixed: {
    wrap: 'bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    label: 'text-blue-700',
    icon: 'BarChart3',
  },
  attention: {
    wrap: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    label: 'text-amber-700',
    icon: 'AlertCircle',
  },
  empty: {
    wrap: 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    label: 'text-slate-600',
    icon: 'Compass',
  },
};

export default function WeeklyReviewNarrative({
  narrative,
  goalsUpdatedThisWeek,
  onNudgeClick,
}: Props) {
  const tone = TONE_STYLES[narrative.tone];
  return (
    <div
      className={`rounded-xl border ${tone.wrap} p-3`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`w-8 h-8 rounded-lg ${tone.iconBg} flex items-center justify-center shrink-0`}
          aria-hidden
        >
          <Icon name={tone.icon} size={16} className={tone.iconColor} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`text-[10px] uppercase tracking-wide font-semibold ${tone.label}`}
            >
              Итог недели
            </span>
            <span className="text-[10px] text-gray-400">
              Последние 7 дней
              {goalsUpdatedThisWeek > 0 &&
                ` · ${goalsUpdatedThisWeek} ${pluralRu(
                  goalsUpdatedThisWeek,
                  'обновление',
                  'обновления',
                  'обновлений',
                )}`}
            </span>
          </div>
          <p className="text-sm text-gray-800 leading-snug mt-0.5">
            {narrative.headline}
          </p>
          {narrative.nudges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {narrative.nudges.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onNudgeClick(n)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-800 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  aria-label={n.label}
                >
                  <Icon name={n.icon} fallback="ArrowRight" size={11} />
                  <span className="truncate max-w-[220px]">{n.label}</span>
                  <Icon name="ArrowRight" size={10} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}