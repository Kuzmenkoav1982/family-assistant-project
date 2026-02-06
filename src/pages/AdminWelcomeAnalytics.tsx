import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface SectionStats {
  section_index: number;
  section_title: string;
  total_clicks?: number;
  unique_sessions?: number;
  clicks?: number;
  sessions?: number;
}

interface AnalyticsData {
  total: SectionStats[];
  today: SectionStats[];
  week: SectionStats[];
  month: SectionStats[];
}

const WELCOME_API = 'https://functions.poehali.dev/fe19c08e-4cc1-4aa8-a1af-b03678b7ba22';

export default function AdminWelcomeAnalytics() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${WELCOME_API}?action=stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch welcome analytics:', error);
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
            <p className="text-gray-600">Нет данных по велком-странице</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSectionColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-violet-500 to-purple-600',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-green-500',
      'from-green-500 to-emerald-500',
      'from-sky-500 to-blue-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-purple-500',
      'from-indigo-500 to-blue-500'
    ];
    return colors[index % colors.length];
  };

  const renderStatsTable = (data: SectionStats[], type: 'total' | 'period') => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-30" />
          <p>Нет данных за выбранный период</p>
        </div>
      );
    }

    const maxClicks = Math.max(...data.map(s => type === 'total' ? (s.total_clicks || 0) : (s.clicks || 0)));

    return (
      <div className="space-y-4">
        {data.map((section) => {
          const clicks = type === 'total' ? section.total_clicks || 0 : section.clicks || 0;
          const sessions = type === 'total' ? section.unique_sessions || 0 : section.sessions || 0;
          const percentage = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;

          return (
            <div key={section.section_index} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <Badge
                    className={`bg-gradient-to-r ${getSectionColor(section.section_index)} text-white px-3 py-1.5`}
                  >
                    #{section.section_index + 1}
                  </Badge>
                  <span className="font-medium text-gray-800">{section.section_title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-bold text-lg text-blue-600">{clicks}</div>
                    <div className="text-xs text-gray-500">кликов</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-purple-600">{sessions}</div>
                    <div className="text-xs text-gray-500">сессий</div>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSectionColor(section.section_index)} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalClicks = stats.total.reduce((sum, s) => sum + (s.total_clicks || 0), 0);
  const totalSessions = stats.total.reduce((sum, s) => sum + (s.unique_sessions || 0), 0);
  const todayClicks = stats.today.reduce((sum, s) => sum + (s.clicks || 0), 0);
  const weekClicks = stats.week.reduce((sum, s) => sum + (s.clicks || 0), 0);
  const monthClicks = stats.month.reduce((sum, s) => sum + (s.clicks || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Аналитика велком-страницы
            </h1>
            <p className="text-slate-600 mt-2">Статистика интереса к разделам платформы</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Всего кликов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalClicks}</div>
              <p className="text-xs text-gray-500 mt-1">{totalSessions} уникальных сессий</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{todayClicks}</div>
              <p className="text-xs text-gray-500 mt-1">За последние 24 часа</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">За неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{weekClicks}</div>
              <p className="text-xs text-gray-500 mt-1">Последние 7 дней</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">За месяц</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{monthClicks}</div>
              <p className="text-xs text-gray-500 mt-1">Последние 30 дней</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Интерес к разделам
            </CardTitle>
            <CardDescription>
              Статистика кликов по всем 13 разделам велком-страницы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="today">Сегодня</TabsTrigger>
                <TabsTrigger value="week">Неделя</TabsTrigger>
                <TabsTrigger value="month">Месяц</TabsTrigger>
                <TabsTrigger value="total">Всё время</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-6">
                {renderStatsTable(stats.today, 'period')}
              </TabsContent>

              <TabsContent value="week" className="mt-6">
                {renderStatsTable(stats.week, 'period')}
              </TabsContent>

              <TabsContent value="month" className="mt-6">
                {renderStatsTable(stats.month, 'period')}
              </TabsContent>

              <TabsContent value="total" className="mt-6">
                {renderStatsTable(stats.total, 'total')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Lightbulb" size={20} />
              Инсайты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.total.length > 0 && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <Icon name="TrendingUp" size={20} className="text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Самый популярный раздел</p>
                        <p className="text-sm text-green-700 mt-1">
                          <strong>{stats.total.sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))[0].section_title}</strong>
                          {' '}— {stats.total.sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))[0].total_clicks} кликов
                        </p>
                      </div>
                    </div>
                  </div>

                  {stats.total.length > 1 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Требует внимания</p>
                          <p className="text-sm text-blue-700 mt-1">
                            <strong>{stats.total.sort((a, b) => (a.total_clicks || 0) - (b.total_clicks || 0))[0].section_title}</strong>
                            {' '}— всего {stats.total.sort((a, b) => (a.total_clicks || 0) - (b.total_clicks || 0))[0].total_clicks} кликов
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
