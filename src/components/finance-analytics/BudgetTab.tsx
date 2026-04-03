import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { BudgetItem } from '@/data/financeAnalyticsTypes';
import { fm, formatMoney } from '@/data/financeAnalyticsTypes';

interface BudgetTabProps {
  budgets: BudgetItem[];
  navigate: (path: string) => void;
}

export default function BudgetTab({ budgets, navigate }: BudgetTabProps) {
  return (
    <TabsContent value="budget" className="space-y-4">
      {budgets.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-10 text-center space-y-2">
            <Icon name="PieChart" size={36} className="mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Бюджеты не заданы</p>
            <Button size="sm" onClick={() => navigate('/finance/budget')}>Настроить бюджет</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-bold">Лимиты по категориям</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgets.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip formatter={(v: number) => fm(v)} />
                    <Bar dataKey="planned" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Лимит" opacity={0.3} />
                    <Bar dataKey="spent" fill="#ef4444" radius={[0, 4, 4, 0]} name="Потрачено" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {budgets.map((b, i) => {
            const pct = b.planned > 0 ? Math.min(100, (b.spent / b.planned) * 100) : 0;
            const over = b.spent > b.planned;
            return (
              <div key={i} className="space-y-1 px-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{b.category}</span>
                  <span className={over ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                    {formatMoney(b.spent)} / {formatMoney(b.planned)} {'\u20BD'}
                  </span>
                </div>
                <Progress value={pct} className={`h-2 ${over ? '[&>div]:bg-red-500' : ''}`} />
              </div>
            );
          })}
        </>
      )}
    </TabsContent>
  );
}
