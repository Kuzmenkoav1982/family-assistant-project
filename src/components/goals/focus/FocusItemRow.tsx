import Icon from '@/components/ui/icon';
import {
  reasonIcon,
  reasonLabel,
  type FocusItem,
} from '@/lib/goals/focusHelpers';
import { pluralRu } from '@/lib/goals/weeklyReviewNarrative';

// Goals Focus V1 — одна строка очереди.
// Простая, плоская, без анимаций. Один CTA — переход в detail.

interface Props {
  item: FocusItem;
  onOpen: () => void;
}

const REASON_TONE: Record<
  FocusItem['reason'],
  { wrap: string; badgeBg: string; badgeText: string; ctaLabel: string }
> = {
  overdue: {
    wrap: 'border-rose-200 hover:border-rose-300 bg-gradient-to-br from-rose-50/60 to-white',
    badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    ctaLabel: 'Открыть цель',
  },
  regressed: {
    wrap: 'border-amber-200 hover:border-amber-300 bg-gradient-to-br from-amber-50/60 to-white',
    badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    ctaLabel: 'Открыть цель',
  },
  stale: {
    wrap: 'border-slate-200 hover:border-slate-300 bg-gradient-to-br from-slate-50/60 to-white',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    ctaLabel: 'Обновить цель',
  },
};

function contextText(item: FocusItem): string | null {
  switch (item.reason) {
    case 'overdue': {
      const d = item.context.overdueDays;
      if (d == null) return 'просрочено';
      if (d === 0) return 'дедлайн сегодня';
      return `просрочено на ${d} ${pluralRu(d, 'день', 'дня', 'дней')}`;
    }
    case 'regressed': {
      const v = item.context.deltaSum;
      if (typeof v !== 'number') return 'откат за неделю';
      // Округляем до 1 знака для аккуратности, без лишних нулей.
      const rounded = Math.round(v * 10) / 10;
      return `за неделю ${rounded > 0 ? '+' : ''}${rounded}`;
    }
    case 'stale': {
      const d = item.context.daysSinceUpdate;
      if (d == null) return 'давно без активности';
      return `без активности ${d} ${pluralRu(d, 'день', 'дня', 'дней')}`;
    }
  }
}

export default function FocusItemRow({ item, onOpen }: Props) {
  const tone = REASON_TONE[item.reason];
  const ctx = contextText(item);
  const title = item.view.goal.title || 'Без названия';

  return (
    <li
      className={`group rounded-xl border ${tone.wrap} transition-colors`}
      data-reason={item.reason}
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left p-3 flex items-start gap-2.5"
        aria-label={`${tone.ctaLabel}: ${title}. Причина: ${reasonLabel(item.reason)}.`}
      >
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tone.badgeBg} shrink-0`}
        >
          <Icon name={reasonIcon(item.reason)} fallback="AlertCircle" size={11} />
          {reasonLabel(item.reason)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
          {ctx && (
            <div className={`text-[11px] mt-0.5 ${tone.badgeText}`}>{ctx}</div>
          )}
        </div>

        <span
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 group-hover:text-purple-700 shrink-0"
          aria-hidden
        >
          {tone.ctaLabel}
          <Icon name="ArrowRight" size={12} />
        </span>
        <span
          className="sm:hidden inline-flex items-center text-gray-400 shrink-0"
          aria-hidden
        >
          <Icon name="ChevronRight" size={16} />
        </span>
      </button>
    </li>
  );
}
