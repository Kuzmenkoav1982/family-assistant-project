import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { formatMoney } from '@/data/financeBudgetTypes';

interface SummaryCardsProps {
  sumIncome: number;
  sumExpense: number;
  planIncome: number;
  planExpense: number;
}

export default function SummaryCards({ sumIncome, sumExpense, planIncome, planExpense }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="border-green-200 bg-green-50/50 overflow-hidden">
        <CardContent className="p-2 text-center">
          <p className="text-xs text-green-600">Доходы</p>
          <Popover>
            <PopoverTrigger className="cursor-pointer group w-full">
              <div className="flex items-center gap-0.5 justify-center">
                <p className="text-sm font-bold text-green-700 underline decoration-dashed decoration-green-300/50 underline-offset-4 truncate">{formatMoney(sumIncome + planIncome)}</p>
                <Icon name="Info" size={10} className="text-green-400 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" side="bottom">
              <div className="space-y-2">
                <p className="font-semibold text-sm">Доходы за месяц</p>
                <p className="text-xs text-muted-foreground">Сумма фактически полученных доходов и запланированных поступлений (регулярные платежи).</p>
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Фактические доходы</span>
                    <span className="font-medium">{formatMoney(sumIncome)} &#8381;</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">+ Запланированные</span>
                    <span className="font-medium text-green-600">+{formatMoney(planIncome)} &#8381;</span>
                  </div>
                </div>
                <div className="border-t pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Всего доходы</span>
                    <span>{formatMoney(sumIncome + planIncome)} &#8381;</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50 overflow-hidden">
        <CardContent className="p-2 text-center">
          <p className="text-xs text-red-600">Расходы</p>
          <Popover>
            <PopoverTrigger className="cursor-pointer group w-full">
              <div className="flex items-center gap-0.5 justify-center">
                <p className="text-sm font-bold text-red-700 underline decoration-dashed decoration-red-300/50 underline-offset-4 truncate">{formatMoney(sumExpense + planExpense)}</p>
                <Icon name="Info" size={10} className="text-red-400 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" side="bottom">
              <div className="space-y-2">
                <p className="font-semibold text-sm">Расходы за месяц</p>
                <p className="text-xs text-muted-foreground">Сумма фактических расходов и запланированных списаний (регулярные платежи, долги).</p>
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Фактические расходы</span>
                    <span className="font-medium">{formatMoney(sumExpense)} &#8381;</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">+ Запланированные</span>
                    <span className="font-medium text-red-600">+{formatMoney(planExpense)} &#8381;</span>
                  </div>
                </div>
                <div className="border-t pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Всего расходы</span>
                    <span>{formatMoney(sumExpense + planExpense)} &#8381;</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card className={`overflow-hidden ${(sumIncome + planIncome - sumExpense - planExpense) >= 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
        <CardContent className="p-2 text-center">
          <p className="text-xs text-muted-foreground">Баланс</p>
          <p className={`text-sm font-bold truncate ${(sumIncome + planIncome - sumExpense - planExpense) >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
            {formatMoney(sumIncome + planIncome - sumExpense - planExpense)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
