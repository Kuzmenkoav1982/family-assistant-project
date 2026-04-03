import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Row } from '@/components/finance-analytics/AnalyticsWidgets';
import type { Summary, GoalItem, HistoryItem } from '@/data/financeAnalyticsTypes';
import { fm, fmCompact, formatMoney, formatFreedomDate } from '@/data/financeAnalyticsTypes';

interface OverviewTabProps {
  s: Summary;
  incomeBreakdown: { name: string; value: number; fill: string }[];
  historyChart: { name: string; income: number; expense: number }[];
  goals: GoalItem[];
  navigate: (path: string) => void;
}

export default function OverviewTab({ s, incomeBreakdown, historyChart, goals, navigate }: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="space-y-4">
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold">Структура дохода</h3>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3}>
                    {incomeBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fm(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <Row label="Расходы на жизнь" value={fmCompact(s.month_expenses)} color="#f59e0b" />
              <Row label="Платежи по долгам" value={fmCompact(s.debt_payments)} color="#ef4444" />
              <Row label="Свободные" value={fmCompact(Math.max(0, s.free_money))} color="#22c55e" />
            </div>
          </div>
        </CardContent>
      </Card>

      {historyChart.length > 1 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold">Доходы и расходы</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyChart} barGap={2} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip formatter={(v: number) => fm(v)} />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Доход" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Расходы" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Цели</h3>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate('/finance/goals')}>Все <Icon name="ChevronRight" size={14} /></Button>
            </div>
            {goals.slice(0, 3).map((g, i) => {
              const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-muted-foreground">{fm(g.current)} / {fm(g.target)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {s.freedom_date && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="CalendarCheck" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Дата финансовой свободы</p>
              <p className="font-bold text-green-700 dark:text-green-400">{formatFreedomDate(s.freedom_date)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}
