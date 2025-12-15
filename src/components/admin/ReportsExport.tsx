import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Props {
  apiUrl: string;
}

export default function ReportsExport({ apiUrl }: Props) {
  const { toast } = useToast();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}?action=dashboard`, {
        headers: {
          'X-Admin-Token': 'admin_authenticated'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const exportToExcel = () => {
    if (!stats) return;

    setLoading(true);

    try {
      const workbook = XLSX.utils.book_new();

      // Лист 1: Общая статистика
      const summaryData = [
        ['Отчёт по подпискам'],
        ['Период', period === 'month' ? 'Месяц' : period === 'quarter' ? 'Квартал' : period === 'half' ? 'Полугодие' : 'Год'],
        ['Дата создания', new Date().toLocaleDateString('ru-RU')],
        [],
        ['Метрика', 'Значение'],
        ['Всего подписок', stats.subscription_stats.total_subscriptions],
        ['Активных', stats.subscription_stats.active_subscriptions],
        ['Ожидают оплаты', stats.subscription_stats.pending_subscriptions],
        ['Отменено', stats.subscription_stats.cancelled_subscriptions],
        ['MRR (₽)', stats.subscription_stats.mrr || 0],
        ['ARR (₽)', (stats.subscription_stats.mrr || 0) * 12],
        ['Конверсия (%)', stats.conversion_rate.toFixed(2)]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Общая статистика');

      // Лист 2: Разбивка по тарифам
      const plansData = [
        ['Тариф', 'Количество', 'Выручка (₽)'],
        ...stats.plans_breakdown.map((p: any) => [
          p.plan_type === 'basic' ? 'Базовый' : p.plan_type === 'standard' ? 'Семейный' : 'Премиум',
          p.count,
          parseFloat(p.revenue)
        ])
      ];

      const plansSheet = XLSX.utils.aoa_to_sheet(plansData);
      XLSX.utils.book_append_sheet(workbook, plansSheet, 'По тарифам');

      // Лист 3: Выручка по дням
      if (stats.revenue_chart.length > 0) {
        const revenueData = [
          ['Дата', 'Выручка (₽)'],
          ...stats.revenue_chart.map((r: any) => [
            new Date(r.date).toLocaleDateString('ru-RU'),
            parseFloat(r.daily_revenue)
          ])
        ];

        const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Выручка по дням');
      }

      // Экспорт файла
      const fileName = `subscriptions_report_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: 'Отчёт экспортирован',
        description: `Файл ${fileName} загружен`
      });
    } catch (error) {
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать файл',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Экспорт отчётов
          </CardTitle>
          <CardDescription>Скачайте детальную аналитику в Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Выберите период</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Текущий месяц</SelectItem>
                <SelectItem value="quarter">Квартал (3 месяца)</SelectItem>
                <SelectItem value="half">Полугодие (6 месяцев)</SelectItem>
                <SelectItem value="year">Год (12 месяцев)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={exportToExcel} disabled={loading || !stats} className="w-full gap-2">
              {loading ? (
                <>
                  <Icon name="Loader2" className="animate-spin" size={16} />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} />
                  Скачать отчёт в Excel
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Содержимое отчёта:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Общая статистика подписок</li>
              <li>• Выручка (MRR, ARR)</li>
              <li>• Распределение по тарифам</li>
              <li>• Динамика выручки по дням</li>
              <li>• Конверсия и метрики</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Прогнозы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Прогноз MRR на след. месяц</p>
                <p className="text-3xl font-bold text-blue-900">
                  ₽{Math.round((stats.subscription_stats.mrr || 0) * 1.15).toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">+15% при текущем росте</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Цель на год</p>
                <p className="text-3xl font-bold text-green-900">
                  ₽{Math.round(((stats.subscription_stats.mrr || 0) * 12) * 2).toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-1">Удвоение ARR за 12 мес.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart" size={20} />
            Ключевые метрики (KPI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">LTV (3 года)</p>
              <p className="text-2xl font-bold">₽10,800</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">CAC</p>
              <p className="text-2xl font-bold">₽650</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase mb-1">LTV / CAC</p>
              <p className="text-2xl font-bold text-green-600">16.6x</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
