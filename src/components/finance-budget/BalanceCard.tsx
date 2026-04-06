import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { formatMoney } from '@/data/financeBudgetTypes';

interface BalanceCardProps {
  accountBalance: number;
  accountCount: number;
  planIncome: number;
  planExpense: number;
  sumIncome: number;
  sumExpense: number;
}

export default function BalanceCard({ accountBalance, accountCount, planIncome, planExpense, sumIncome, sumExpense }: BalanceCardProps) {
  if (accountCount <= 0) return null;

  const currentBalance = accountBalance + sumIncome - sumExpense;
  const forecastBalance = currentBalance + planIncome - planExpense;
  const pendingChange = planIncome - planExpense;

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-shrink">
            <p className="text-blue-200 text-xs">На счетах сейчас</p>
            <Popover>
              <PopoverTrigger className="cursor-pointer group">
                <div className="flex items-center gap-1">
                  <p className="text-xl font-bold underline decoration-dashed decoration-blue-300/50 underline-offset-4 truncate">{formatMoney(currentBalance)} &#8381;</p>
                  <Icon name="Info" size={12} className="text-blue-200 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" side="bottom">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Текущий баланс</p>
                  <p className="text-xs text-muted-foreground">Начальный баланс на счетах + совершённые доходы − совершённые расходы за этот месяц.</p>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Начальный баланс</span>
                      <span className="font-medium">{formatMoney(accountBalance)} &#8381;</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">+ Доходы</span>
                      <span className="font-medium text-green-600">+{formatMoney(sumIncome)} &#8381;</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">− Расходы</span>
                      <span className="font-medium text-red-600">−{formatMoney(sumExpense)} &#8381;</span>
                    </div>
                  </div>
                  <div className="border-t pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Итого на счетах</span>
                      <span>{formatMoney(currentBalance)} &#8381;</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-blue-200 text-[10px]">{accountCount} {accountCount === 1 ? 'счёт' : accountCount < 5 ? 'счёта' : 'счетов'}</p>
          </div>
          <div className="text-right min-w-0 flex-shrink">
            <p className="text-blue-200 text-xs">Прогноз на конец мес.</p>
            <Popover>
              <PopoverTrigger className="cursor-pointer group">
                <div className="flex items-center gap-1 justify-end">
                  <p className={`text-base font-bold underline decoration-dashed decoration-blue-300/50 underline-offset-4 truncate ${forecastBalance >= 0 ? 'text-white' : 'text-orange-300'}`}>
                    {formatMoney(forecastBalance)} &#8381;
                  </p>
                  <Icon name="Info" size={12} className="text-blue-200 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" side="bottom">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Прогноз на конец месяца</p>
                  <p className="text-xs text-muted-foreground">Текущий баланс + ожидаемые доходы − ожидаемые расходы (запланированные, но ещё не подтверждённые).</p>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Текущий баланс</span>
                      <span className="font-medium">{formatMoney(currentBalance)} &#8381;</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">+ Ожидаемые доходы</span>
                      <span className="font-medium text-green-600">+{formatMoney(planIncome)} &#8381;</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">− Ожидаемые расходы</span>
                      <span className="font-medium text-red-600">−{formatMoney(planExpense)} &#8381;</span>
                    </div>
                  </div>
                  <div className="border-t pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Прогноз</span>
                      <span>{formatMoney(forecastBalance)} &#8381;</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {(planIncome > 0 || planExpense > 0) && (
              <Popover>
                <PopoverTrigger className="cursor-pointer group">
                  <p className="text-blue-200 text-[10px] underline decoration-dashed decoration-blue-300/40 underline-offset-2 flex items-center gap-0.5 justify-end">
                    {pendingChange >= 0 ? '+' : ''}{formatMoney(pendingChange)} ожид.
                    <Icon name="Info" size={10} className="text-blue-200 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </p>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" side="bottom">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Ожидаемое изменение</p>
                    <p className="text-xs text-muted-foreground">Чистое изменение баланса от запланированных операций (регулярные платежи, долги).</p>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Ожидаемые доходы</span>
                        <span className="font-medium text-green-600">+{formatMoney(planIncome)} &#8381;</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Ожидаемые расходы</span>
                        <span className="font-medium text-red-600">−{formatMoney(planExpense)} &#8381;</span>
                      </div>
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Итого изменение</span>
                        <span>{pendingChange >= 0 ? '+' : ''}{formatMoney(pendingChange)} &#8381;</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
