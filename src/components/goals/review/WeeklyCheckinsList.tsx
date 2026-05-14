import Icon from '@/components/ui/icon';
import type { WeeklyCheckinEntry } from '@/lib/goals/weeklyReviewHelpers';
import { FRAMEWORKS } from '@/components/life-road/frameworks';

interface Props {
  entries: WeeklyCheckinEntry[];
  onOpenGoal: (goalId: string) => void;
}

const FRAMEWORK_DOT: Record<string, string> = {
  smart: 'bg-blue-500',
  okr: 'bg-violet-500',
  wheel: 'bg-emerald-500',
  generic: 'bg-slate-400',
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'только что';
  if (diffH < 24) return `${diffH} ч. назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'вчера';
  return `${diffD} дн. назад`;
}

export default function WeeklyCheckinsList({ entries, onOpenGoal }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
        За последние 7 дней не было замеров.
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {entries.map(({ checkin, goal }) => {
        const fwType = goal.frameworkType || 'generic';
        const dot = FRAMEWORK_DOT[fwType] ?? FRAMEWORK_DOT.generic;
        const framework = FRAMEWORKS.find((f) => f.id === fwType);
        const ariaLabel = `Открыть цель ${goal.title}. Замер: ${checkin.summary ?? 'без описания'}. ${formatWhen(
          checkin.createdAt,
        )}`;
        return (
          <li key={checkin.id}>
            <button
              type="button"
              onClick={() => onOpenGoal(goal.id)}
              aria-label={ariaLabel}
              className="w-full text-left flex items-start gap-2 bg-white rounded-lg border border-gray-100 p-2 hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-800 truncate">
                  {goal.title || 'Без названия'}
                </div>
                <div className="text-[11px] text-gray-600 line-clamp-1">
                  {checkin.summary || '—'}
                </div>
              </div>
              <div className="text-[10px] text-gray-400 whitespace-nowrap flex flex-col items-end shrink-0">
                <span>{formatWhen(checkin.createdAt)}</span>
                {framework && (
                  <span className="text-[9px] text-gray-400 mt-0.5">
                    {framework.title}
                  </span>
                )}
              </div>
              <Icon
                name="ChevronRight"
                size={12}
                className="text-gray-300 mt-1 shrink-0 group-hover:text-purple-400"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
