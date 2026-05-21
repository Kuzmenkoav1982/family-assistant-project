import Icon from '@/components/ui/icon';
import { fm, getMonthShort, type CashflowInsights } from './cashflowUtils';

export function CashflowAlerts({ insights }: { insights: CashflowInsights }) {
  const { gapMonths, closedEvents, freeDrop } = insights;

  return (
    <>
      {gapMonths.length > 0 && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
          <Icon name="AlertOctagon" size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">Кассовый разрыв прогнозируется!</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              В {gapMonths.length === 1 ? 'месяце' : 'месяцах'}{' '}
              {gapMonths.map(m => getMonthShort(m)).join(', ')}{' '}
              расходы превысят доходы. Накопите резерв заранее или сократите расходы.
            </p>
          </div>
        </div>
      )}

      {closedEvents.length > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4 flex items-start gap-3">
          <Icon name="PartyPopper" size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              {closedEvents.length === 1 ? 'Кредит закроется' : `${closedEvents.length} кредита закроются`} в прогнозном периоде!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {closedEvents.map(e => `${getMonthShort(e.month)}: ${e.prevDebts} → ${e.newDebts} долгов`).join(' | ')}
            </p>
          </div>
        </div>
      )}

      {freeDrop && !gapMonths.length && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 flex items-start gap-3">
          <Icon name="TrendingDown" size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Свободные средства заметно снижаются в {getMonthShort(freeDrop.month)} (на {fm(freeDrop.drop)}). Проверьте запланированные расходы.
          </p>
        </div>
      )}
    </>
  );
}
