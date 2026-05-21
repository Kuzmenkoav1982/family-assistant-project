import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { formatMoney, monthlyAmount, monthlyExplanation, FREQ_LABELS, type RecurringItem } from './recurringUtils';

interface Props {
  incomeItems: RecurringItem[];
  expenseItems: RecurringItem[];
  totalIncome: number;
  totalExpense: number;
}

export default function RecurringSummaryCards({ incomeItems, expenseItems, totalIncome, totalExpense }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-green-600">Доходы/мес</p>
          <Popover>
            <PopoverTrigger className="cursor-pointer group">
              <div className="flex items-center gap-1 justify-center">
                <p className="text-lg font-bold text-green-700 underline decoration-dashed decoration-green-300/50 underline-offset-4">
                  +{formatMoney(Math.round(totalIncome))} ₽
                </p>
                <Icon name="Info" size={12} className="text-green-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="bottom">
              <div className="space-y-2">
                <p className="font-semibold text-sm">Доходы в месяц</p>
                <p className="text-xs text-muted-foreground">Сумма всех активных регулярных доходов, приведённых к месячному эквиваленту.</p>
                {incomeItems.length > 0 ? (
                  <>
                    <div className="border-t pt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {incomeItems.map(item => {
                        const explanation = monthlyExplanation(item);
                        return (
                          <div key={item.id} className="flex justify-between text-xs gap-2">
                            <div className="min-w-0">
                              <span className="font-medium truncate block">{item.description || 'Без описания'}</span>
                              <span className="text-muted-foreground">{FREQ_LABELS[item.frequency] || item.frequency}</span>
                              {explanation && <span className="text-muted-foreground"> ({explanation})</span>}
                            </div>
                            <span className="font-medium whitespace-nowrap text-green-600">+{formatMoney(Math.round(monthlyAmount(item)))} ₽</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Итого в месяц</span>
                        <span className="text-green-600">+{formatMoney(Math.round(totalIncome))} ₽</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground border-t pt-2">Нет активных регулярных доходов</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-red-600">Расходы/мес</p>
          <Popover>
            <PopoverTrigger className="cursor-pointer group">
              <div className="flex items-center gap-1 justify-center">
                <p className="text-lg font-bold text-red-700 underline decoration-dashed decoration-red-300/50 underline-offset-4">
                  -{formatMoney(Math.round(totalExpense))} ₽
                </p>
                <Icon name="Info" size={12} className="text-red-400 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="bottom">
              <div className="space-y-2">
                <p className="font-semibold text-sm">Расходы в месяц</p>
                <p className="text-xs text-muted-foreground">Сумма всех активных регулярных расходов, приведённых к месячному эквиваленту.</p>
                {expenseItems.length > 0 ? (
                  <>
                    <div className="border-t pt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {expenseItems.map(item => {
                        const explanation = monthlyExplanation(item);
                        return (
                          <div key={item.id} className="flex justify-between text-xs gap-2">
                            <div className="min-w-0">
                              <span className="font-medium truncate block">{item.description || 'Без описания'}</span>
                              <span className="text-muted-foreground">{FREQ_LABELS[item.frequency] || item.frequency}</span>
                              {explanation && <span className="text-muted-foreground"> ({explanation})</span>}
                            </div>
                            <span className="font-medium whitespace-nowrap text-red-600">-{formatMoney(Math.round(monthlyAmount(item)))} ₽</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Итого в месяц</span>
                        <span className="text-red-600">-{formatMoney(Math.round(totalExpense))} ₽</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground border-t pt-2">Нет активных регулярных расходов</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
}
