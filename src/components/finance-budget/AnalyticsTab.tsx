import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { formatMoney, formatShort } from '@/data/financeBudgetTypes';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface AnalyticsTabProps {
  transactions: { id: string }[];
  pieData: { name: string; value: number; color: string }[];
  historyData: { month: string; income: number; expense: number }[];
  budgetChartData: { name: string; planned: number; spent: number; color: string }[];
  analyticsRef: RefObject<HTMLDivElement>;
  exporting: boolean;
  exportPDF: () => void;
}

export default function AnalyticsTab({
  transactions, pieData, historyData, budgetChartData,
  analyticsRef, exporting, exportPDF,
}: AnalyticsTabProps) {
  return (
    <div className="space-y-4">
      {transactions.length > 0 && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={exportPDF} disabled={exporting}>
            <Icon name="FileDown" size={14} className="mr-1" />
            {exporting ? 'Экспорт...' : 'Скачать PDF'}
          </Button>
        </div>
      )}
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="BarChart3" size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Добавьте операции для аналитики</p>
        </div>
      ) : (
        <div ref={analyticsRef}>
          {pieData.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3">Расходы по категориям</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${formatMoney(v)} \u20BD`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {pieData.slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate flex-1">{item.name}</span>
                        <span className="font-medium">{formatShort(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {historyData.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3">Доходы и расходы за 6 месяцев</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={historyData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={formatShort} width={40} />
                    <Tooltip formatter={(v: number) => `${formatMoney(v)} \u20BD`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name="Доходы" fill="#22C55E" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expense" name="Расходы" fill="#EF4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {historyData.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3">Динамика баланса</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={historyData.map(h => ({ ...h, balance: h.income - h.expense }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={formatShort} width={40} />
                    <Tooltip formatter={(v: number) => `${formatMoney(v)} \u20BD`} />
                    <Line type="monotone" dataKey="balance" name="Баланс" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {budgetChartData.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3">План vs Факт</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={budgetChartData} layout="vertical" barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatShort} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(v: number) => `${formatMoney(v)} \u20BD`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="planned" name="План" fill="#93C5FD" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="spent" name="Факт" fill="#F87171" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
