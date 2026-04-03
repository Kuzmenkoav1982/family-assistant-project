import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { DebtDetail, StrategyResult } from '@/data/financeAnalyticsTypes';
import { fm } from '@/data/financeAnalyticsTypes';

interface DebtsTabProps {
  debts_detail: DebtDetail[];
  strategies: { avalanche: StrategyResult | null; snowball: StrategyResult | null; recommended: string | null };
}

export default function DebtsTab({ debts_detail, strategies }: DebtsTabProps) {
  return (
    <TabsContent value="debts" className="space-y-4">
      {debts_detail.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-10 text-center">
            <Icon name="PartyPopper" size={36} className="mx-auto text-green-500 mb-2" />
            <p className="font-medium">Нет активных долгов!</p>
            <p className="text-xs text-muted-foreground mt-1">Вы финансово свободны</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {strategies.recommended && (
            <details className="rounded-xl border-0 shadow-md bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 group/strategy">
              <summary className="flex items-center gap-2 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Icon name="Zap" size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold flex-1">Лучшая стратегия: {strategies.recommended === 'avalanche' ? 'Лавина' : 'Снежный ком'}</h3>
                <Icon name="ChevronDown" size={14} className="text-indigo-400 transition-transform group-open/strategy:rotate-180" />
              </summary>
              {(() => {
                const st = strategies.recommended === 'avalanche' ? strategies.avalanche : strategies.snowball;
                if (!st) return null;
                return (
                  <div className="grid grid-cols-3 gap-2 text-center px-4 pb-4">
                    <div><p className="text-lg font-bold text-indigo-600">{st.total_months}</p><p className="text-[10px] text-muted-foreground">мес. до свободы</p></div>
                    <div><p className="text-lg font-bold text-green-600">{fm(st.interest_saved)}</p><p className="text-[10px] text-muted-foreground">экономия</p></div>
                    <div><p className="text-lg font-bold text-amber-600">{st.months_saved}</p><p className="text-[10px] text-muted-foreground">мес. сэкономлено</p></div>
                  </div>
                );
              })()}
            </details>
          )}

          <div className="space-y-2">
            {debts_detail.map(d => {
              const paidPct = d.original_amount > 0 ? ((d.original_amount - d.remaining) / d.original_amount) * 100 : 0;
              return (
                <Card key={d.id} className="border-0 shadow-sm">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Icon name="Receipt" size={16} className="text-red-500" /><span className="font-semibold text-sm">{d.name}</span></div>
                      <Badge variant="outline" className="text-[10px]">{d.rate}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Остаток: {fm(d.remaining)}</span><span>Платёж: {fm(d.payment)}/мес</span>
                    </div>
                    <Progress value={paidPct} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground text-right">Погашено {paidPct.toFixed(0)}%</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {strategies.avalanche?.timeline && strategies.avalanche.timeline.length > 1 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-bold">График погашения (Лавина)</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={strategies.avalanche.timeline} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                      <defs>
                        <linearGradient id="gDebt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: 'мес', position: 'insideBottomRight', fontSize: 10, offset: -5 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                      <Tooltip formatter={(v: number) => fm(v)} />
                      <Area type="monotone" dataKey="total_remaining" stroke="#ef4444" fill="url(#gDebt)" strokeWidth={2} name="Остаток долга" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {strategies.avalanche?.closed_order && strategies.avalanche.closed_order.length > 0 && (
            <details className="rounded-xl border-0 shadow-md bg-card group/order">
              <summary className="flex items-center gap-2 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Icon name="ListOrdered" size={16} className="text-green-600" />
                <h3 className="text-sm font-bold flex-1">Порядок закрытия долгов</h3>
                <Icon name="ChevronDown" size={14} className="text-muted-foreground transition-transform group-open/order:rotate-180" />
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {strategies.avalanche.closed_order.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-[10px] font-bold text-green-700">{i + 1}</div>
                    <span className="flex-1 font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{c.month} мес</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </TabsContent>
  );
}