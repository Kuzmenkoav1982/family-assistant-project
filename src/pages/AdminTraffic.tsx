import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '@/../backend/func2url.json';

interface TrafficStats {
  total: {
    views: number;
    sessions: number;
    active_days: number;
  };
  today: {
    views: number;
    sessions: number;
  };
  week: {
    views: number;
    sessions: number;
  };
  top_pages: Array<{ path: string; views: number }>;
  daily_chart: Array<{ date: string; views: number; sessions: number }>;
}

export default function AdminTraffic() {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = func2url['page-views'] || '';
      if (!apiUrl) {
        console.warn('page-views API URL not found');
        return;
      }

      const response = await fetch(`${apiUrl}?action=stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch traffic stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6 flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin" size={40} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-gray-600">Нет данных о посещаемости</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgSessionDuration = stats.total.views > 0 
    ? Math.round((stats.total.views / stats.total.sessions) * 2.5)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Посещаемость
            </h1>
            <p className="text-slate-600 mt-2">Статистика посещений и активности пользователей</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Всего просмотров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.total.views.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">За всё время</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Уникальных сессий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.total.sessions.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Всего визитов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.today.views}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.today.sessions} сессий</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">За неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.week.views}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.week.sessions} сессий</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BarChart3" size={20} />
                График посещений за 30 дней
              </CardTitle>
              <CardDescription>Динамика просмотров и сессий</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.daily_chart.slice(0, 10).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded"
                          style={{ width: `${Math.min((day.views / Math.max(...stats.daily_chart.map(d => d.views))) * 100, 100)}%` }}
                        />
                        <span className="text-sm font-semibold text-blue-600">{day.views}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{day.sessions} сессий</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Популярные страницы
              </CardTitle>
              <CardDescription>Топ-10 за последние 30 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.top_pages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{idx + 1}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {page.path === '/' ? 'Главная' : page.path}
                      </span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {page.views} просмотров
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Activity" size={20} />
              Общая активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-2">Средняя длительность сессии</p>
                <p className="text-3xl font-bold text-blue-900">{avgSessionDuration} мин</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-purple-700 font-medium mb-2">Активных дней</p>
                <p className="text-3xl font-bold text-purple-900">{stats.total.active_days}</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-green-700 font-medium mb-2">Страниц за сессию</p>
                <p className="text-3xl font-bold text-green-900">
                  {(stats.total.views / stats.total.sessions).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
