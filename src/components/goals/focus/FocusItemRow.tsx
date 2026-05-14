import Icon from '@/components/ui/icon';
import {
  reasonIcon,
  reasonLabel,
  type FocusItem,
} from '@/lib/goals/focusHelpers';
import { pluralRu } from '@/lib/goals/weeklyReviewNarrative';
import FocusQuickCheckin from './FocusQuickCheckin';
import FocusOverdueActions from './FocusOverdueActions';
import type { FocusActionContext, FocusActionKind } from './useFocusActions';

// Goals Focus V2 — одна строка очереди + reason-aware quick action.
//
// Контракт V2:
//   - Главный CTA «Открыть цель» (переход в detail) сохранён всегда.
//   - Дополнительная кнопка-тогл (раскрывает inline-панель) зависит от причины:
//        stale/regressed → «Сделать замер» → FocusQuickCheckin
//        overdue        → «Действия по сроку» → FocusOverdueActions
//   - Раскрытие управляется снаружи (single-expand controller в FocusSection),
//     поэтому строка не держит свой open-state.
//   - После успешного действия родитель закрывает item и зовёт onChanged.
//   - Строка остаётся доступной с клавиатуры; основная навигация — через CTA.

interface Props {
  item: FocusItem;
  expanded: boolean;
  onOpen: () => void;
  onToggleExpand: () => void;
  onActionDone: () => void;
  onChanged: (kind: FocusActionKind, ctx: FocusActionContext) => void;
}

const REASON_TONE: Record<
  FocusItem['reason'],
  {
    wrap: string;
    badgeBg: string;
    badgeText: string;
    ctaLabel: string;
    quickActionLabel: string;
    quickActionIcon: string;
  }
> = {
  overdue: {
    wrap: 'border-rose-200 hover:border-rose-300 bg-gradient-to-br from-rose-50/60 to-white',
    badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    ctaLabel: 'Открыть цель',
    quickActionLabel: 'Действия по сроку',
    quickActionIcon: 'CalendarClock',
  },
  regressed: {
    wrap: 'border-amber-200 hover:border-amber-300 bg-gradient-to-br from-amber-50/60 to-white',
    badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    ctaLabel: 'Открыть цель',
    quickActionLabel: 'Сделать замер',
    quickActionIcon: 'MessageSquarePlus',
  },
  stale: {
    wrap: 'border-slate-200 hover:border-slate-300 bg-gradient-to-br from-slate-50/60 to-white',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    ctaLabel: 'Обновить цель',
    quickActionLabel: 'Сделать замер',
    quickActionIcon: 'MessageSquarePlus',
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

export default function FocusItemRow({
  item,
  expanded,
  onOpen,
  onToggleExpand,
  onActionDone,
  onChanged,
}: Props) {
  const tone = REASON_TONE[item.reason];
  const ctx = contextText(item);
  const title = item.view.goal.title || 'Без названия';

  return (
    <li
      className={`group rounded-xl border ${tone.wrap} transition-colors`}
      data-reason={item.reason}
      data-expanded={expanded ? 'true' : 'false'}
    >
      <div className="p-3 flex items-start gap-2.5">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tone.badgeBg} shrink-0`}
        >
          <Icon name={reasonIcon(item.reason)} fallback="AlertCircle" size={11} />
          {reasonLabel(item.reason)}
        </span>

        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
          aria-label={`${tone.ctaLabel}: ${title}. Причина: ${reasonLabel(item.reason)}.`}
        >
          <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-800">
            {title}
          </div>
          {ctx && (
            <div className={`text-[11px] mt-0.5 ${tone.badgeText}`}>{ctx}</div>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-controls={`focus-action-${item.view.goal.id}`}
          className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-1 border transition-colors ${
            expanded
              ? 'bg-white border-purple-300 text-purple-700'
              : 'border-transparent text-gray-600 hover:text-purple-700 hover:bg-white/70'
          }`}
        >
          <Icon name={tone.quickActionIcon} fallback="Zap" size={12} />
          <span className="hidden sm:inline">{tone.quickActionLabel}</span>
          <Icon
            name={expanded ? 'ChevronUp' : 'ChevronDown'}
            size={12}
            className="ml-0.5"
            aria-hidden
          />
        </button>
      </div>

      {expanded && (
        <div id={`focus-action-${item.view.goal.id}`} className="px-3 pb-3">
          {item.reason === 'overdue' ? (
            <FocusOverdueActions
              goal={item.view.goal}
              onDone={onActionDone}
              onCancel={onToggleExpand}
              onChanged={onChanged}
            />
          ) : (
            <FocusQuickCheckin
              goal={item.view.goal}
              placeholder={
                item.reason === 'regressed'
                  ? 'Что произошло за неделю? Что хочешь зафиксировать?'
                  : 'Что изменилось? Что сделал/а с прошлого раза? (минимум 3 символа)'
              }
              onSaved={onActionDone}
              onCancel={onToggleExpand}
              onChanged={onChanged}
            />
          )}
        </div>
      )}
    </li>
  );
}