import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { DebtDetail, SimResult } from '@/data/financeStrategyTypes';
import { fm } from '@/data/financeStrategyTypes';

interface SimulatorSectionProps {
  debts: DebtDetail[];
  simDebtId: string;
  setSimDebtId: (id: string) => void;
  simExtra: number;
  setSimExtra: (v: number) => void;
  simDebt: DebtDetail | null;
  simMaxExtra: number;
  simWithout: SimResult | null;
  simWith: SimResult | null;
  simChartData: { month: number; without: number; withExtra: number | null }[];
  incomeScenarios: { label: string; amount: number }[];
}

export default function SimulatorSection({
  debts, simDebtId, setSimDebtId, simExtra, setSimExtra,
  simDebt, simMaxExtra, simWithout, simWith, simChartData, incomeScenarios,
}: SimulatorSectionProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/5">
      <CardContent className="p-4 space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Выберите кредит для досрочного погашения</p>
          <div className="flex flex-wrap gap-2">
            {debts.filter(d => d.remaining > 0 && d.payment > 0).map(d => (
              <Button key={d.id} size="sm" variant={simDebtId === d.id ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setSimDebtId(d.id)}>
                {d.name} ({d.rate}%)
              </Button>
            ))}
          </div>
        </div>

        {simDebt && (() => {
          const sliderMax = Math.max(simMaxExtra, Math.round(simDebt.payment * 2), 10000);
          const sliderStep = Math.max(100, Math.round(sliderMax / 50 / 100) * 100) || 100;
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">Дополнительный платёж</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    value={simExtra || ''}
                    onChange={e => setSimExtra(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 h-8 px-2 rounded-md border text-sm text-right font-bold text-amber-600 bg-background"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground">{'\u20BD'}/мес</span>
                </div>
              </div>
              <Slider value={[Math.min(simExtra, sliderMax)]} onValueChange={([v]) => setSimExtra(v)} min={0} max={sliderMax} step={sliderStep} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 {'\u20BD'}</span>
                <span>{fm(sliderMax)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {incomeScenarios.map((sc, i) => (
                  <Button key={i} size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setSimExtra(sc.amount)}>
                    +{sc.label} ({fm(sc.amount)})
                  </Button>
                ))}
                {simExtra > 0 && (
                  <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground" onClick={() => setSimExtra(0)}>Сбросить</Button>
                )}
              </div>
            </div>
          );
        })()}

        {simDebt && simWithout && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background/70 p-3 space-y-1 border">
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Без досрочных</p>
                <p className="text-lg font-bold">{simWithout.months} <span className="text-xs font-normal text-muted-foreground">мес</span></p>
                <p className="text-xs text-muted-foreground">Проценты: {fm(simWithout.totalInterest)}</p>
              </div>
              <div className={`rounded-xl p-3 space-y-1 border ${simWith ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-background/70'}`}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase">С досрочными</p>
                {simWith ? (
                  <>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">{simWith.months} <span className="text-xs font-normal text-muted-foreground">мес</span></p>
                    <p className="text-xs text-muted-foreground">Проценты: {fm(simWith.totalInterest)}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground pt-1">Передвиньте ползунок</p>
                )}
              </div>
            </div>

            {simWith && simWithout.months > simWith.months && (
              <div className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <Icon name="Sparkles" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">Экономия: {fm(simWithout.totalInterest - simWith.totalInterest)}</p>
                  <p className="text-xs text-muted-foreground">Закроете на {simWithout.months - simWith.months} мес. раньше</p>
                </div>
              </div>
            )}

            {simChartData.length > 1 && (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simChartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <defs>
                      <linearGradient id="gSimW" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSimE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                    <Tooltip formatter={(v: number) => fm(v)} labelFormatter={l => `${l} мес`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="without" stroke="#ef4444" fill="url(#gSimW)" strokeWidth={2} name="Без досрочных" strokeDasharray="5 5" />
                    {simExtra > 0 && <Area type="monotone" dataKey="withExtra" stroke="#22c55e" fill="url(#gSimE)" strokeWidth={2} name="С досрочными" />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {simWith && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Сравнение сроков</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-muted-foreground shrink-0">Без досрочных</span>
                    <div className="flex-1 h-5 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full flex items-center justify-end px-2 text-[10px] text-white font-medium" style={{ width: '100%' }}>{simWithout.months} мес</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-muted-foreground shrink-0">С досрочными</span>
                    <div className="flex-1 h-5 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full flex items-center justify-end px-2 text-[10px] text-white font-medium transition-all duration-500" style={{ width: `${Math.max(5, (simWith.months / simWithout.months) * 100)}%` }}>{simWith.months} мес</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}