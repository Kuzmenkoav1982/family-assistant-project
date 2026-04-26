import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import type { DebtDetail } from '@/data/financeStrategyTypes';
import { fm, calcNewMonthlyPayment, API, getHeaders } from '@/data/financeStrategyTypes';

interface Props {
  debts: DebtDetail[];
}

type PriorityMode = 'rate' | 'relief' | 'size';

const PRIORITY_MODES: { key: PriorityMode; label: string; short: string; icon: string; hint: string }[] = [
  { key: 'rate', label: 'Меньше переплата', short: 'По ставке', icon: 'Percent', hint: 'Сначала кредиты с самой высокой ставкой — максимум экономии на процентах' },
  { key: 'relief', label: 'Легче платить', short: 'Макс. снижение платежа', icon: 'HeartPulse', hint: 'Сначала кредиты, где закрытие больше всего уменьшит ежемесячный платёж' },
  { key: 'size', label: 'Быстрый результат', short: 'Снежный ком', icon: 'Snowflake', hint: 'Сначала самые маленькие долги — быстрее закрывать, освобождая средства' },
];

export default function BonusPayoffPlanner({ debts }: Props) {
  const activeDebts = useMemo(
    () => debts.filter(d => d.remaining > 0 && d.payment > 0),
    [debts]
  );

  const [budget, setBudget] = useState<number>(0);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [priorityMode, setPriorityMode] = useState<PriorityMode>('rate');
  const [applying, setApplying] = useState(false);

  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((sum, v) => sum + (v || 0), 0),
    [allocations]
  );
  const remainingBudget = Math.max(0, budget - totalAllocated);
  const overBudget = totalAllocated > budget && budget > 0;

  const setAlloc = (id: string, value: number, maxForThis: number) => {
    const v = Math.max(0, Math.min(value, maxForThis));
    setAllocations(prev => ({ ...prev, [id]: v }));
  };

  const fillFull = (id: string, remaining: number) => {
    const otherAllocated = totalAllocated - (allocations[id] || 0);
    const available = Math.max(0, budget - otherAllocated);
    setAlloc(id, Math.min(remaining, available), remaining);
  };

  const reset = () => {
    setAllocations({});
  };

  // Кредиты которые будут полностью закрыты (выделено >= остатка)
  const fullyPaidIds = useMemo(
    () => activeDebts.filter(d => (allocations[d.id] || 0) >= d.remaining && d.remaining > 0).map(d => d.id),
    [activeDebts, allocations]
  );

  const applyPaidDebts = async () => {
    if (fullyPaidIds.length === 0) return;
    setApplying(true);
    try {
      await Promise.all(
        fullyPaidIds.map(id =>
          fetch(API, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ action: 'mark_debt_paid', id }),
          })
        )
      );
      toast.success(`Закрыто кредитов: ${fullyPaidIds.length}. Данные обновятся при следующей загрузке.`);
      reset();
    } catch {
      toast.error('Ошибка при закрытии кредитов');
    } finally {
      setApplying(false);
    }
  };

  // Сортировка по выбранному приоритету
  const sortedDebts = useMemo(() => {
    const arr = [...activeDebts];
    if (priorityMode === 'rate') {
      return arr.sort((a, b) => b.rate - a.rate);
    }
    if (priorityMode === 'size') {
      return arr.sort((a, b) => a.remaining - b.remaining);
    }
    // 'relief' — эффективность снижения платежа: платёж / остаток долга
    // чем выше, тем больше снижение/рубль вложений при полном закрытии
    return arr.sort((a, b) => (b.payment / b.remaining) - (a.payment / a.remaining));
  }, [activeDebts, priorityMode]);

  const autoDistribute = () => {
    if (budget <= 0 || sortedDebts.length === 0) return;
    const next: Record<string, number> = {};
    let left = budget;
    for (const d of sortedDebts) {
      if (left <= 0) break;
      const take = Math.min(d.remaining, left);
      next[d.id] = take;
      left -= take;
    }
    setAllocations(next);
  };

  const rows = sortedDebts.map(d => {
    const lump = allocations[d.id] || 0;
    const calc = calcNewMonthlyPayment(d.remaining, d.rate, d.payment, lump);
    const saved = Math.max(0, d.payment - calc.newPayment);
    return { debt: d, lump, calc, saved };
  });

  const totalCurrentPayment = sortedDebts.reduce((s, d) => s + d.payment, 0);
  const totalNewPayment = rows.reduce((s, r) => s + r.calc.newPayment, 0);
  const totalMonthlySaved = totalCurrentPayment - totalNewPayment;

  const quickBudgets = [50000, 100000, 200000, 500000];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <Icon name="Gift" size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base">Распределить премию на погашение</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Введите сумму, которую готовы потратить на досрочное погашение. Распределите её по кредитам — система пересчитает ежемесячные платежи.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Бюджет на досрочное погашение</label>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={budget || ''}
              onChange={e => setBudget(Math.max(0, Number(e.target.value) || 0))}
              placeholder="Например, 100 000"
              className="text-base font-semibold"
            />
            {budget > 0 && (
              <Button variant="outline" size="sm" onClick={() => { setBudget(0); reset(); }}>
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickBudgets.map(v => (
              <Button
                key={v}
                size="sm"
                variant={budget === v ? 'default' : 'outline'}
                className="h-7 text-[11px]"
                onClick={() => setBudget(v)}
              >
                {fm(v)}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">Распределено: <b className={overBudget ? 'text-rose-600' : 'text-foreground'}>{fm(totalAllocated)}</b></span>
            <span className="text-muted-foreground">Остаток: <b className={remainingBudget > 0 ? 'text-emerald-600' : 'text-foreground'}>{fm(remainingBudget)}</b></span>
          </div>
          {overBudget && (
            <div className="text-[11px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <Icon name="AlertTriangle" size={12} />
              Распределено больше, чем есть в бюджете
            </div>
          )}
        </div>

        {activeDebts.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Нет активных кредитов для погашения
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Приоритет погашения</p>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_MODES.map(m => (
                  <Button
                    key={m.key}
                    size="sm"
                    variant={priorityMode === m.key ? 'default' : 'outline'}
                    className="h-8 text-[11px] gap-1"
                    onClick={() => setPriorityMode(m.key)}
                  >
                    <Icon name={m.icon} size={12} />
                    {m.label}
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                {PRIORITY_MODES.find(m => m.key === priorityMode)?.hint}
              </p>
              {budget > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[11px] gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={autoDistribute}
                >
                  <Icon name="Wand2" size={12} />
                  Распределить автоматически по этому приоритету
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Ваши кредиты ({PRIORITY_MODES.find(m => m.key === priorityMode)?.short})
              </p>
              {totalAllocated > 0 && (
                <Button size="sm" variant="ghost" className="h-6 text-[11px] text-muted-foreground" onClick={reset}>
                  Сбросить
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {rows.map(({ debt, lump, calc, saved }) => {
                const otherAllocated = totalAllocated - lump;
                const availableForThis = Math.max(0, budget - otherAllocated);
                const maxForThis = Math.min(debt.remaining, availableForThis);
                return (
                  <div key={debt.id} className="rounded-xl bg-background/80 border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-sm truncate">{debt.name}</p>
                          <Badge variant="secondary" className={`text-[10px] ${debt.rate >= 20 ? 'bg-rose-100 text-rose-700' : debt.rate >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {debt.rate}%
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Долг {fm(debt.remaining)} · платёж {fm(debt.payment)}/мес
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={maxForThis}
                        step={1000}
                        value={lump || ''}
                        onChange={e => setAlloc(debt.id, Number(e.target.value) || 0, maxForThis)}
                        placeholder="Сумма к погашению"
                        className="h-9 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-[11px] whitespace-nowrap"
                        onClick={() => fillFull(debt.id, debt.remaining)}
                        disabled={budget <= 0}
                      >
                        Закрыть
                      </Button>
                    </div>

                    {lump > 0 && (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-2 space-y-1">
                        {calc.fullyPaid ? (
                          <div className="flex items-center gap-2 text-xs">
                            <Icon name="CheckCircle2" size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              Кредит будет полностью закрыт · экономия {fm(debt.payment)}/мес
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Новый платёж:</span>
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                {fm(calc.newPayment)}/мес
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Было: <s>{fm(debt.payment)}</s></span>
                              <span className="font-semibold text-emerald-600">−{fm(saved)}/мес</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalAllocated > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-200 dark:border-emerald-800 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="TrendingDown" size={18} className="text-emerald-600" />
              <p className="font-bold text-sm">Итог по всем кредитам</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-background/60 p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Сейчас платите</p>
                <p className="text-base font-bold">{fm(totalCurrentPayment)}<span className="text-[10px] font-normal text-muted-foreground">/мес</span></p>
              </div>
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Станете платить</p>
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">{fm(totalNewPayment)}<span className="text-[10px] font-normal text-muted-foreground">/мес</span></p>
              </div>
            </div>
            {totalMonthlySaved > 0 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Экономия каждый месяц:</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">−{fm(totalMonthlySaved)}</span>
              </div>
            )}
          </div>
        )}

        {fullyPaidIds.length > 0 && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={applyPaidDebts}
            disabled={applying}
          >
            <Icon name={applying ? 'Loader2' : 'CheckCircle2'} size={16} className={applying ? 'mr-2 animate-spin' : 'mr-2'} />
            {applying
              ? 'Закрываем кредиты...'
              : `Подтвердить — закрыть ${fullyPaidIds.length} кредит${fullyPaidIds.length > 1 ? 'а' : ''}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}