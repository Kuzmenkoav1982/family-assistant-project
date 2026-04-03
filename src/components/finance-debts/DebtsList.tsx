import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { Debt } from '@/data/financeDebtsTypes';
import { formatMoney, formatMonths, getDebtMeta, isCC, getEffectiveRate, getDebtPayoff } from '@/data/financeDebtsTypes';

interface DebtsListProps {
  debts: Debt[];
  totalRemaining: number;
  totalMonthly: number;
  onSelect: (debt: Debt) => void;
}

export default function DebtsList({ debts, totalRemaining, totalMonthly, onSelect }: DebtsListProps) {
  const active = debts.filter(d => d.status === 'active' && d.remaining_amount > 0);
  const totalOverpayment = active.reduce((sum, d) => {
    const p = getDebtPayoff(d);
    return sum + (p && p.overpayment !== Infinity ? p.overpayment : 0);
  }, 0);
  const highestRate = active.reduce((max, d) => Math.max(max, getEffectiveRate(d).rate), 0);
  const highestRateDebt = active.reduce((best: Debt | null, d) => {
    const r = getEffectiveRate(d).rate;
    return !best || r > getEffectiveRate(best).rate ? d : best;
  }, null as Debt | null);
  const ccDebts = active.filter(d => isCC(d.debt_type));
  const ccTotal = ccDebts.reduce((s, d) => s + d.remaining_amount, 0);

  return (
    <>
      {debts.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-red-600">Общий долг</p>
                <p className="text-lg font-bold text-red-700">{formatMoney(totalRemaining)} &#8381;</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-orange-600">Платежи/мес</p>
                <p className="text-lg font-bold text-orange-700">{formatMoney(totalMonthly)} &#8381;</p>
              </CardContent>
            </Card>
          </div>

          {(totalOverpayment > 0 || ccTotal > 0 || active.length > 1) && (
            <details className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 group/analytics">
              <summary className="flex items-center gap-2 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Icon name="TrendingUp" size={14} className="text-purple-600" />
                <p className="text-xs font-semibold text-purple-700 flex-1">Аналитика долгов</p>
                <Icon name="ChevronDown" size={14} className="text-purple-400 transition-transform group-open/analytics:rotate-180" />
              </summary>
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {totalOverpayment > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Общая переплата</p>
                      <p className="font-bold text-sm text-red-600">{formatMoney(Math.round(totalOverpayment))} &#8381;</p>
                    </div>
                  )}
                  {ccTotal > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Долг по карт{ccDebts.length > 1 ? 'ам' : 'е'}</p>
                      <p className="font-bold text-sm text-orange-600">{formatMoney(ccTotal)} &#8381;</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Активных долгов</p>
                    <p className="font-bold text-sm">{active.length}</p>
                  </div>
                  {highestRate > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Макс. ставка</p>
                      <p className="font-bold text-sm">{highestRate}%</p>
                    </div>
                  )}
                </div>
                {highestRateDebt && active.length > 1 && highestRate > 0 && (
                  <div className="bg-white/70 rounded-lg p-2.5 flex items-start gap-2">
                    <Icon name="Lightbulb" size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-foreground">
                      <b>Совет:</b> Гасите «{highestRateDebt.name}» ({highestRate}%) в первую очередь — это сэкономит больше всего на переплате (метод лавины)
                    </p>
                  </div>
                )}
              </div>
            </details>
          )}
        </>
      )}

      {debts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Icon name="PartyPopper" size={48} className="mx-auto mb-3 text-green-400" />
          <p className="font-medium text-foreground">У вас нет долгов!</p>
          <p className="text-sm mt-1">Добавьте кредиты, ипотеку или займы для отслеживания</p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map(debt => {
            const meta = getDebtMeta(debt.debt_type);
            const paidPct = debt.original_amount > 0
              ? ((debt.original_amount - debt.remaining_amount) / debt.original_amount) * 100 : 0;
            const isPaid = debt.status === 'paid';
            return (
              <Card key={debt.id}
                className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all ${isPaid ? 'opacity-60' : ''} ${debt.is_priority ? 'ring-2 ring-amber-400 border-amber-300' : ''}`}
                onClick={() => onSelect(debt)}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="w-14 flex items-center justify-center flex-shrink-0 relative"
                      style={{ backgroundColor: debt.is_priority ? '#FEF3C7' : meta.color + '15' }}>
                      <Icon name={meta.icon} size={24} style={{ color: meta.color }} />
                      {debt.is_priority && (
                        <div className="absolute -top-0.5 -right-0.5">
                          <Icon name="Star" size={12} className="text-amber-500 fill-amber-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm truncate">{debt.name}</span>
                        {debt.is_priority && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-300">Приоритет</Badge>}
                        {isPaid && <Badge className="text-[10px] bg-green-100 text-green-700">Погашен</Badge>}
                        <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                      </div>
                      {debt.creditor && <p className="text-xs text-muted-foreground mb-1">{debt.creditor}</p>}
                      <div className="flex items-center gap-4 text-xs flex-wrap">
                        <span className="text-red-600 font-medium">{formatMoney(debt.remaining_amount)} &#8381;</span>
                        {isCC(debt.debt_type) && debt.credit_limit ? (
                          <span className="text-muted-foreground">лимит {formatMoney(debt.credit_limit)}</span>
                        ) : debt.monthly_payment > 0 ? (
                          <span className="text-muted-foreground">{formatMoney(debt.monthly_payment)} &#8381;/мес</span>
                        ) : null}
                        {isCC(debt.debt_type) && debt.min_payment_pct && debt.remaining_amount > 0 && (
                          <span className="text-orange-600 font-medium">мин. {formatMoney(Math.ceil(debt.remaining_amount * (debt.min_payment_pct / 100)))} &#8381;</span>
                        )}
                        {(() => {
                          const { rate, estimated } = getEffectiveRate(debt);
                          if (rate <= 0) return null;
                          return estimated
                            ? <span className="text-orange-500">\u2248{rate}%</span>
                            : <span className="text-muted-foreground">{rate}%</span>;
                        })()}
                        {isCC(debt.debt_type) && debt.bank_name && (
                          <span className="text-muted-foreground">{debt.bank_name}</span>
                        )}
                      </div>
                      {(() => {
                        const po = getDebtPayoff(debt);
                        if (!po || isPaid) return null;
                        return (
                          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                            {po.months !== Infinity && (
                              <span className="text-purple-600 flex items-center gap-0.5">
                                <Icon name="Clock" size={11} /> {formatMonths(po.months)}
                              </span>
                            )}
                            {po.overpayment !== Infinity && po.overpayment > 0 && (
                              <span className="text-red-500">переплата {formatMoney(Math.round(po.overpayment))} &#8381;</span>
                            )}
                            {po.months === Infinity && (
                              <span className="text-red-600 font-medium">Платёж не покрывает %</span>
                            )}
                          </div>
                        );
                      })()}
                      <div className="mt-1.5">
                        <Progress value={isCC(debt.debt_type) && debt.credit_limit ? (debt.remaining_amount / debt.credit_limit) * 100 : paidPct} className="h-1.5" />
                      </div>
                    </div>
                    <div className="flex items-center pr-3">
                      <Icon name="ChevronRight" size={18} className="text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}