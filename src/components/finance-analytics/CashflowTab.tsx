import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { CashflowItem } from '@/data/financeAnalyticsTypes';
import { fm, formatMoney } from '@/data/financeAnalyticsTypes';

interface CashflowTabProps {
  cashflowChart: { name: string; free: number; debt: number; remaining: number }[];
  cashflow: CashflowItem[];
}

export default function CashflowTab({ cashflowChart, cashflow }: CashflowTabProps) {
  return (
    <TabsContent value="cashflow" className="space-y-4">
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold">Свободные средства (12 мес)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowChart} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip formatter={(v: number) => fm(v)} />
                <Bar dataKey="free" fill="#22c55e" radius={[4, 4, 0, 0]} name="Свободные" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold">Остаток долга (12 мес)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowChart} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                <defs>
                  <linearGradient id="gRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip formatter={(v: number) => fm(v)} />
                <Area type="monotone" dataKey="remaining" stroke="#8b5cf6" fill="url(#gRemaining)" strokeWidth={2} name="Остаток долга" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-bold">Помесячный прогноз</h3>
          <div className="max-h-60 overflow-y-auto text-xs">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-1 font-medium">Мес</th>
                  <th className="text-right py-1 font-medium">Кредиты</th>
                  <th className="text-right py-1 font-medium">Свободные</th>
                  <th className="text-right py-1 font-medium">Остаток</th>
                </tr>
              </thead>
              <tbody>
                {cashflow.filter((_, i) => i < 24).map(c => (
                  <tr key={c.month} className="border-b border-dashed last:border-0">
                    <td className="py-1.5">{c.month}</td>
                    <td className="text-right text-red-600">{formatMoney(c.debt_payments)}</td>
                    <td className="text-right text-green-600">{formatMoney(c.free_money)}</td>
                    <td className="text-right">{formatMoney(c.total_remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
