import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VideoViewsStats {
  total: number;
  unique_sessions: number;
  today: number;
  today_sessions: number;
  week: number;
  week_sessions: number;
  month: number;
  month_sessions: number;
}

interface PageViewsStats {
  total: number;
  unique_sessions: number;
  today: number;
  week: number;
  month: number;
}

interface AnalyticsData {
  page_views?: PageViewsStats;
  video_views?: VideoViewsStats;
}

const WELCOME_API = 'https://functions.poehali.dev/fe19c08e-4cc1-4aa8-a1af-b03678b7ba22';

export default function AdminWelcomeAnalytics() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const video = stats.video_views;
  const page = stats.page_views;

  const videoRate = page?.total && video?.total
    ? ((video.total / page.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Аналитика велком-страницы
            </h1>
            <p className="text-slate-600 mt-2">Активные счётчики</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/admin/dashboard'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
        </div>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Icon name="Eye" size={24} />
              Просмотры страницы
            </CardTitle>
            <CardDescription>
              Каждый заход на /welcome. Дедупликация: 1 просмотр на сессию за 30 минут.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">{page?.today || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Сегодня</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{page?.week || 0}</div>
                <p className="text-sm text-gray-600 mt-1">За неделю</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{page?.month || 0}</div>
                <p className="text-sm text-gray-600 mt-1">За месяц</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{page?.total || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Всего</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-blue-100">
              <div className="text-2xl font-bold text-indigo-600">{page?.unique_sessions || 0}</div>
              <p className="text-xs text-gray-500">Уникальных сессий за всё время</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Icon name="Play" size={24} />
              Просмотры видео
            </CardTitle>
            <CardDescription>
              Считается, когда пользователь доскроллил до видеоплеера (50% видимости). Дедупликация: 1 просмотр на сессию за 30 минут.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-red-600">{video?.today || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Сегодня</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{video?.week || 0}</div>
                <p className="text-sm text-gray-600 mt-1">За неделю</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{video?.month || 0}</div>
                <p className="text-sm text-gray-600 mt-1">За месяц</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{video?.total || 0}</div>
                <p className="text-sm text-gray-600 mt-1">Всего</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-red-100 flex items-center gap-8">
              <div>
                <div className="text-2xl font-bold text-orange-600">{video?.unique_sessions || 0}</div>
                <p className="text-xs text-gray-500">Уникальных сессий</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{videoRate}%</div>
                <p className="text-xs text-gray-500">Доскроллили до видео</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}