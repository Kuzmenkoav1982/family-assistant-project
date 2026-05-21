import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  AreaChart, Area, ComposedChart, Line, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts';
import { CfTooltip } from './CashflowWidgets';
import { formatMoney, fm, fmtAxis, getMonthShort, type CashflowItem, type CashflowInsights } from './cashflowUtils';

interface ChartItem extends CashflowItem {
  label: string;
  shortLabel: string;
  monthName: string;
  totalSpend: number;
}

interface BurndownItem {
  label: string;
  remaining: number;
  debts: number;
  isClosed: boolean;
}

export function CashFlowChart({ chartData }: { chartData: ChartItem[] }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-bold">Доходы, расходы и свободные средства</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gDebt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtAxis} />
              <Tooltip content={<CfTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
              <Bar dataKey="expenses" stackId="spend" fill="url(#gExp)" name="Расходы" radius={[0, 0, 0, 0]} />
              <Bar dataKey="debt_payments" stackId="spend" fill="url(#gDebt)" name="Кредиты" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} name="Доходы" />
              <Line type="monotone" dataKey="free_money" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Свободные" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function BurndownChart({ burndownData, closedEvents }: { burndownData: BurndownItem[]; closedEvents: CashflowInsights['closedEvents'] }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-bold">Остаток долга</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burndownData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="gBurn" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtAxis} />
              <Tooltip formatter={(v: number) => fm(v)} />
              <Area type="monotone" dataKey="remaining" stroke="#8b5cf6" fill="url(#gBurn)" strokeWidth={2} name="Остаток долга" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {closedEvents.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {closedEvents.map((e, i) => (
              <Badge key={i} variant="outline" className="text-[10px] text-green-600 border-green-300 gap-1">
                <Icon name="Check" size={10} /> {getMonthShort(e.month)}: {e.prevDebts}&rarr;{e.newDebts}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CashflowTable({ cashflow, insights }: { cashflow: CashflowItem[]; insights: CashflowInsights }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-2">
        <div className="max-h-[420px] overflow-auto rounded-lg">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold">Месяц</th>
                <th className="text-right py-2 px-1 font-semibold">Доходы</th>
                <th className="text-right py-2 px-1 font-semibold">Расходы</th>
                <th className="text-right py-2 px-1 font-semibold">Кредиты</th>
                <th className="text-right py-2 px-1 font-semibold">Свободные</th>
                <th className="text-right py-2 px-2 font-semibold">Долг</th>
              </tr>
            </thead>
            <tbody>
              {cashflow.map(c => {
                const isGap = c.free_money < 0;
                const closedEvt = insights.closedEvents.find(e => e.month === c.month);
                return (
                  <tr key={c.month} className={`border-b border-dashed last:border-0 ${isGap ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{getMonthShort(c.month)}</span>
                        {closedEvt && <Icon name="PartyPopper" size={11} className="text-green-500" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{c.active_debts} долг.</span>
                    </td>
                    <td className="text-right py-2 px-1 text-green-600">{formatMoney(c.income)}</td>
                    <td className="text-right py-2 px-1">{formatMoney(c.expenses)}</td>
                    <td className="text-right py-2 px-1 text-orange-600">{formatMoney(c.debt_payments)}</td>
                    <td className={`text-right py-2 px-1 font-semibold ${isGap ? 'text-red-600' : 'text-green-600'}`}>
                      {formatMoney(c.free_money)}
                    </td>
                    <td className="text-right py-2 px-2 text-muted-foreground">{formatMoney(c.total_remaining)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
