import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  subscription_stats: {
    total_subscriptions: number;
    active_subscriptions: number;
    pending_subscriptions: number;
    cancelled_subscriptions: number;
    mrr: number;
  };
  plans_breakdown: Array<{
    plan_type: string;
    count: number;
    revenue: number;
  }>;
  expiring_soon: Array<{
    id: string;
    plan_type: string;
    end_date: string;
    family_name: string;
    owner_email: string;
  }>;
  revenue_chart: Array<{
    date: string;
    daily_revenue: number;
  }>;
  conversion_rate: number;
  promo_stats: {
    total_promos: number;
    active_promos: number;
    total_uses: number;
  };
}

interface Props {
  apiUrl: string;
}

const PLAN_NAMES: Record<string, string> = {
  basic: 'Базовый',
  standard: 'Семейный',
  premium: 'Премиум'
};

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

export default function SubscriptionsDashboard({ apiUrl }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Обновление каждые 30 сек
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}?action=dashboard`, {
        headers: {
          'X-Admin-Token': 'admin_authenticated'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="Loader2" className="animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const mrr = stats.subscription_stats.mrr || 0;
  const arr = mrr * 12;
  const avgRevenuePerSub = stats.subscription_stats.active_subscriptions > 0
    ? mrr / stats.subscription_stats.active_subscriptions
    : 0;

  // Данные для графика распределения по тарифам
  const pieData = stats.plans_breakdown.map(plan => ({
    name: PLAN_NAMES[plan.plan_type] || plan.plan_type,
    value: plan.count
  }));

  // Данные для графика выручки
  const revenueData = stats.revenue_chart
    .slice(0, 30)
    .reverse()
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      revenue: parseFloat(item.daily_revenue.toString())
    }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100">MRR (месячная выручка)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₽{mrr.toLocaleString()}</div>
            <p className="text-xs text-purple-200 mt-2">ARR: ₽{arr.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100">Активные подписки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.subscription_stats.active_subscriptions}</div>
            <p className="text-xs text-blue-200 mt-2">
              Ожидают: {stats.subscription_stats.pending_subscriptions}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-100">Конверсия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.conversion_rate.toFixed(1)}%</div>
            <p className="text-xs text-green-200 mt-2">Средний чек: ₽{avgRevenuePerSub.toFixed(0)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-pink-100">Промокоды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.promo_stats.active_promos}</div>
            <p className="text-xs text-pink-200 mt-2">
              Использований: {stats.promo_stats.total_uses || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Динамика выручки (30 дней)
            </CardTitle>
            <CardDescription>Ежедневная выручка в рублях</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip 
                  formatter={(value: number) => `₽${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Выручка"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plans Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PieChart" size={20} />
              Распределение по тарифам
            </CardTitle>
            <CardDescription>Количество активных подписок</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p>Нет данных о подписках</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plans Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} />
            Детализация по тарифам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.plans_breakdown.length > 0 ? (
              stats.plans_breakdown.map(plan => (
                <div key={plan.plan_type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {PLAN_NAMES[plan.plan_type] || plan.plan_type}
                    </h4>
                    <p className="text-sm text-gray-600">{plan.count} активных подписок</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">₽{parseFloat(plan.revenue.toString()).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">MRR</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">Нет активных подписок</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon */}
      {stats.expiring_soon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Icon name="AlertTriangle" size={20} />
              Истекают в ближайшие 3 дня ({stats.expiring_soon.length})
            </CardTitle>
            <CardDescription>Свяжитесь с клиентами для продления</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.expiring_soon.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-semibold">{sub.family_name}</p>
                    <p className="text-sm text-gray-600">{sub.owner_email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {PLAN_NAMES[sub.plan_type]}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.end_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="gap-2">
            <Icon name="Tag" size={16} />
            Создать промокод
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open('https://t.me/your_channel', '_blank')}>
            <Icon name="Send" size={16} />
            Отправить рассылку
          </Button>
          <Button variant="outline" className="gap-2" onClick={fetchStats}>
            <Icon name="RefreshCw" size={16} />
            Обновить данные
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
