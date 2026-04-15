import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { Debt, Payment } from '@/data/financeDebtsTypes';
import {
  formatMoney, formatMonths, getDebtMeta, isCC, getEffectiveRate,
  getDebtPayoff, calcLoanPayoff,
} from '@/data/financeDebtsTypes';

interface DebtDetailViewProps {
  debt: Debt;
  payments: Payment[];
  simPayment: string;
  setSimPayment: (v: string) => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
  onAddPayment: () => void;
}

export default function DebtDetailView({
  debt, payments, simPayment, setSimPayment,
  onBack, onEdit, onDelete, onMarkPaid, onAddPayment,
}: DebtDetailViewProps) {
  const meta = getDebtMeta(debt.debt_type);
  const paidPct = debt.original_amount > 0
    ? ((debt.original_amount - debt.remaining_amount) / debt.original_amount) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="ArrowLeft" size={16} className="mr-1" /> Назад
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Icon name="Pencil" size={14} />
          </Button>
          {debt.status !== 'paid' && (
            <Button variant="ghost" size="sm" className="text-green-600" onClick={onMarkPaid}>
              <Icon name="CheckSquare" size={14} />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-red-500" onClick={onDelete}>
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 text-white" style={{ backgroundColor: meta.color }}>
          <div className="flex items-center gap-3">
            <Icon name={meta.icon} size={28} />
            <div>
              <h1 className="font-bold text-lg">{debt.name}</h1>
              <p className="text-sm opacity-80">{meta.label}{debt.creditor ? ` \u00B7 ${debt.creditor}` : ''}</p>
            </div>
            {debt.is_priority && <Badge className="ml-auto bg-white/20 text-white border-white/30">Приоритет</Badge>}
          </div>
        </div>
        <CardContent className="p-4 space-y-4">
          {isCC(debt.debt_type) ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Кредитный лимит</p>
                  <p className="font-bold">{formatMoney(debt.credit_limit || 0)} &#8381;</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Задолженность</p>
                  <p className="font-bold text-red-600">{formatMoney(debt.remaining_amount)} &#8381;</p>
                </div>
              </div>

              {(debt.grace_amount != null || debt.grace_period_end) && (
                <details className="rounded-xl bg-blue-50 border border-blue-200 group/grace" open={debt.grace_period_end ? new Date(debt.grace_period_end) >= new Date() : false}>
                  <summary className="flex items-center gap-2 p-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <Icon name="Shield" size={14} className="text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 flex-1">Льготный период</p>
                    {debt.grace_period_end && new Date(debt.grace_period_end) >= new Date() && (
                      <Badge className="text-[10px] bg-green-100 text-green-700 border-green-300">Активен</Badge>
                    )}
                    {debt.grace_period_end && new Date(debt.grace_period_end) < new Date() && (
                      <Badge className="text-[10px] bg-red-100 text-red-700 border-red-300">Истёк</Badge>
                    )}
                    <Icon name="ChevronDown" size={14} className="text-blue-400 transition-transform group-open/grace:rotate-180" />
                  </summary>
                  <div className="px-3 pb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {debt.grace_amount != null && (
                        <div>
                          <p className="text-xs text-blue-600">Льготная задолженность</p>
                          <p className="font-bold text-blue-800">{formatMoney(debt.grace_amount)} &#8381;</p>
                        </div>
                      )}
                      {debt.grace_period_end && (
                        <div>
                          <p className="text-xs text-blue-600">Действует до</p>
                          <p className="font-bold text-blue-800">{new Date(debt.grace_period_end).toLocaleDateString('ru-RU')}</p>
                        </div>
                      )}
                      {debt.grace_period_days && (
                        <div>
                          <p className="text-xs text-blue-600">Период</p>
                          <p className="font-medium text-blue-800">до {debt.grace_period_days} дней</p>
                        </div>
                      )}
                    </div>
                    {debt.grace_period_end && new Date(debt.grace_period_end) >= new Date() && (
                      <p className="text-[11px] text-green-700 bg-green-50 rounded px-2 py-1 flex items-center gap-1">
                        <Icon name="Clock" size={12} /> Погасите до {new Date(debt.grace_period_end).toLocaleDateString('ru-RU')} — проценты не начислятся
                      </p>
                    )}
                    {debt.grace_period_end && new Date(debt.grace_period_end) < new Date() && (
                      <p className="text-[11px] text-red-700 bg-red-50 rounded px-2 py-1 flex items-center gap-1">
                        <Icon name="AlertTriangle" size={12} /> Льготный период истёк — начисляются {getEffectiveRate(debt).rate}% годовых
                      </p>
                    )}
                  </div>
                </details>
              )}

              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const { rate, estimated } = getEffectiveRate(debt);
                  if (rate <= 0) return null;
                  return (
                    <div>
                      <p className="text-xs text-muted-foreground">Ставка</p>
                      {estimated ? (
                        <p className="font-medium text-orange-600">≈{rate}% <span className="text-[10px] text-muted-foreground">(средняя)</span></p>
                      ) : (
                        <p className="font-medium">{rate}% годовых</p>
                      )}
                    </div>
                  );
                })()}
                {debt.min_payment_pct && (
                  <div>
                    <p className="text-xs text-muted-foreground">Мин. платёж</p>
                    <p className="font-medium">{debt.min_payment_pct}% от долга</p>
                  </div>
                )}
                {debt.min_payment_pct && debt.remaining_amount > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Мин. платёж (расчёт)</p>
                    <p className="font-bold text-orange-600">{formatMoney(Math.ceil(debt.remaining_amount * (debt.min_payment_pct / 100)))} &#8381;</p>
                  </div>
                )}
                {!debt.min_payment_pct && debt.monthly_payment > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Мин. платёж/мес</p>
                    <p className="font-medium">{formatMoney(debt.monthly_payment)} &#8381;</p>
                  </div>
                )}
                {debt.bank_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Банк</p>
                    <p className="font-medium">{debt.bank_name}</p>
                  </div>
                )}
                {debt.next_payment_date && (
                  <div>
                    <p className="text-xs text-muted-foreground">Следующий платёж</p>
                    <p className="font-medium">{new Date(debt.next_payment_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                )}
                {debt.credit_limit && (
                  <div>
                    <p className="text-xs text-muted-foreground">Доступно</p>
                    <p className="font-medium text-green-600">{formatMoney((debt.credit_limit || 0) - debt.remaining_amount)} &#8381;</p>
                  </div>
                )}
              </div>

              {(debt.credit_limit || 0) > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Использовано лимита</span>
                    <span className="font-medium">{Math.round((debt.remaining_amount / (debt.credit_limit || 1)) * 100)}%</span>
                  </div>
                  <Progress value={(debt.remaining_amount / (debt.credit_limit || 1)) * 100} className="h-2" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Сумма кредита</p>
                  <p className="font-bold">{formatMoney(debt.original_amount)} &#8381;</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Остаток</p>
                  <p className="font-bold text-red-600">{formatMoney(debt.remaining_amount)} &#8381;</p>
                </div>
                {(() => {
                  const { rate, estimated } = getEffectiveRate(debt);
                  if (rate <= 0) return null;
                  return (
                    <div>
                      <p className="text-xs text-muted-foreground">Ставка</p>
                      {estimated ? (
                        <p className="font-medium text-orange-600">≈{rate}% <span className="text-[10px] text-muted-foreground">(средняя)</span></p>
                      ) : (
                        <p className="font-medium">{rate}%</p>
                      )}
                    </div>
                  );
                })()}
                {debt.monthly_payment > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Ежемесячный платёж</p>
                    <p className="font-medium">{formatMoney(debt.monthly_payment)} &#8381;</p>
                  </div>
                )}
                {debt.next_payment_date && (
                  <div>
                    <p className="text-xs text-muted-foreground">Следующий платёж</p>
                    <p className="font-medium">{new Date(debt.next_payment_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                )}
                {debt.end_date && (
                  <div>
                    <p className="text-xs text-muted-foreground">Дата окончания</p>
                    <p className="font-medium">{new Date(debt.end_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Погашено</span>
                  <span className="font-medium">{Math.round(paidPct)}%</span>
                </div>
                <Progress value={paidPct} className="h-2" />
              </div>
            </>
          )}

          {debt.notes && (
            <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3">{debt.notes}</p>
          )}
        </CardContent>
      </Card>

      <PayoffForecast debt={debt} simPayment={simPayment} setSimPayment={setSimPayment} />

      <div className="flex items-center justify-between">
        <h2 className="font-bold">История платежей</h2>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={onAddPayment}>
          <Icon name="Plus" size={14} className="mr-1" /> Платёж
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Icon name="Clock" size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Платежей пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map(p => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.is_extra ? 'bg-amber-100' : 'bg-green-100'}`}>
                  <Icon name={p.is_extra ? 'Zap' : 'Check'} size={16} className={p.is_extra ? 'text-amber-600' : 'text-green-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{formatMoney(p.amount)} &#8381;</span>
                    {p.is_extra && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">Досрочный</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.date).toLocaleDateString('ru-RU')}
                    {p.notes && ` \u00B7 ${p.notes}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PayoffForecast({ debt, simPayment, setSimPayment }: { debt: Debt; simPayment: string; setSimPayment: (v: string) => void }) {
  if (debt.status === 'paid' || debt.remaining_amount <= 0) return null;
  const payoff = getDebtPayoff(debt);
  const isInf = payoff ? payoff.months === Infinity : false;
  const { rate: effRate, estimated: rateEstimated } = getEffectiveRate(debt);
  const isZeroRate = debt.interest_rate === 0 && !rateEstimated;
  const noPaymentData = !payoff && debt.remaining_amount > 0;

  const simAmt = simPayment ? parseFloat(simPayment) : 0;
  const simResult = simAmt > 0 ? calcLoanPayoff(debt.remaining_amount, isZeroRate ? 0 : effRate, simAmt) : null;
  const simValid = simResult && simResult.months !== Infinity;
  const savedMonths = simValid && payoff && !isInf ? payoff.months - simResult!.months : 0;
  const savedMoney = simValid && payoff && !isInf ? payoff.overpayment - simResult!.overpayment : 0;

  return (
    <>
      {noPaymentData ? (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Icon name="Info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Прогноз недоступен</p>
              <p className="text-[11px] text-amber-700 mt-1">Укажите ежемесячный платёж или минимальный % в настройках карты — тогда рассчитаем, когда закроете долг.</p>
            </div>
          </CardContent>
        </Card>
      ) : payoff && (
        <Card className={isInf ? 'border-red-200 bg-red-50/50' : 'border-purple-200 bg-purple-50/50'}>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-purple-700 flex items-center gap-1">
              <Icon name="Calculator" size={14} />
              {isCC(debt.debt_type) ? 'Прогноз при минимальных платежах' : 'Прогноз погашения'}
              {isZeroRate && <span className="ml-1 text-[10px] font-normal text-emerald-600 bg-emerald-100 rounded px-1.5 py-0.5">беспроцентный</span>}
            </p>
            {isInf ? (
              <div className="text-center py-2">
                <p className="font-bold text-red-600">Платёж не покрывает проценты</p>
                <p className="text-xs text-red-500 mt-1">Увеличьте ежемесячный платёж, чтобы начать гасить долг</p>
              </div>
            ) : (
              <div className={`grid gap-3 text-center ${isZeroRate ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <div>
                  <p className="text-xs text-muted-foreground">До погашения</p>
                  <p className="font-bold text-sm">{formatMonths(payoff.months)}</p>
                </div>
                {!isZeroRate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Переплата</p>
                    <p className="font-bold text-sm text-red-600">{formatMoney(Math.round(payoff.overpayment))} &#8381;</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Всего выплатите</p>
                  <p className="font-bold text-sm">{formatMoney(Math.round(payoff.totalPaid))} &#8381;</p>
                </div>
              </div>
            )}
            {isZeroRate && (
              <div className="bg-emerald-50 rounded-lg p-2.5 flex items-start gap-2">
                <Icon name="CheckCircle" size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-emerald-700">Беспроцентный долг — переплаты нет. Продолжайте платить по графику.</p>
              </div>
            )}
            {!isInf && !isZeroRate && isCC(debt.debt_type) && payoff.overpayment > 0 && (
              <div className="bg-amber-50 rounded-lg p-2.5 flex items-start gap-2">
                <Icon name="AlertTriangle" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-700">При минимальных платежах переплата составит <b>{formatMoney(Math.round(payoff.overpayment))} &#8381;</b>. Платите больше минимума, чтобы сэкономить.</p>
              </div>
            )}
            {rateEstimated && (
              <div className="bg-blue-50 rounded-lg p-2.5 flex items-start gap-2">
                <Icon name="Info" size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-blue-700">Расчёт по средней ставке ≈{effRate}%. Укажите реальную ставку вашей карты для точного прогноза (кнопка редактирования сверху).</p>
              </div>
            )}
            {!isInf && (
              <p className="text-[11px] text-muted-foreground text-center">
                Ожидаемый конец: {new Date(new Date().setMonth(new Date().getMonth() + payoff.months)).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <Icon name="Sparkles" size={14} /> А если платить больше?
          </p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ваш платёж в месяц, &#8381;</label>
            <Input type="number" inputMode="decimal"
              placeholder={debt.monthly_payment > 0 ? `Сейчас ${formatMoney(debt.monthly_payment)}` : 'Введите сумму'}
              value={simPayment} onChange={e => setSimPayment(e.target.value)} className="bg-white" />
          </div>
          {simResult && simResult.months === Infinity && (
            <p className="text-xs text-red-600 text-center font-medium">Эта сумма не покрывает проценты — увеличьте платёж</p>
          )}
          {simValid && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Срок</p>
                <p className="font-bold text-sm text-emerald-700">{formatMonths(simResult!.months)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Переплата</p>
                <p className="font-bold text-sm text-emerald-700">{formatMoney(Math.round(simResult!.overpayment))} &#8381;</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Всего</p>
                <p className="font-bold text-sm">{formatMoney(Math.round(simResult!.totalPaid))} &#8381;</p>
              </div>
            </div>
          )}
          {simValid && (savedMonths > 0 || savedMoney > 0) && (
            <div className="bg-emerald-100 rounded-lg p-2.5 text-center">
              <p className="text-xs font-bold text-emerald-800">
                Экономия:
                {savedMonths > 0 && <> {formatMonths(savedMonths)} быстрее</>}
                {savedMonths > 0 && savedMoney > 0 && ' и '}
                {savedMoney > 0 && <> {formatMoney(Math.round(savedMoney))} &#8381; меньше переплата</>}
              </p>
            </div>
          )}
          {!simPayment && (() => {
            const base = debt.monthly_payment > 0
              ? debt.monthly_payment
              : isCC(debt.debt_type) && debt.min_payment_pct
                ? Math.ceil(debt.remaining_amount * (debt.min_payment_pct / 100))
                : debt.remaining_amount * 0.03;
            const suggestions = [Math.round(base * 1.5), Math.round(base * 2), Math.round(base * 3)].filter(a => a > 0);
            if (suggestions.length === 0) return null;
            return (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">Попробуйте:</p>
                <div className="grid grid-cols-3 gap-2">
                  {suggestions.map((amt, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-xs bg-white"
                      onClick={() => setSimPayment(String(amt))}>
                      {formatMoney(amt)} &#8381;
                    </Button>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </>
  );
}