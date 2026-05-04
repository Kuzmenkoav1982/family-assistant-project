import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '@/config/func2url';

interface NamedCount {
  name: string;
  count: number;
}

interface TrafficStats {
  total: { views: number; sessions: number; active_days: number; unique_ips: number };
  today: { views: number; sessions: number };
  week: { views: number; sessions: number };
  month: { views: number; sessions: number };
  top_pages: Array<{ path: string; views: number }>;
  daily_chart: Array<{ date: string; views: number; sessions: number }>;
  hourly_chart: Array<{ hour: number; views: number }>;
  devices: NamedCount[];
  os: NamedCount[];
  browsers: NamedCount[];
  sources: NamedCount[];
}

interface UserStats {
  total: number;
  verified: number;
  oauth: number;
  today: number;
}

const deviceIcons: Record<string, string> = {
  mobile: 'Smartphone',
  desktop: 'Monitor',
  tablet: 'Tablet',
  unknown: 'HelpCircle',
};

const deviceLabels: Record<string, string> = {
  mobile: 'Мобильные',
  desktop: 'Компьютеры',
  tablet: 'Планшеты',
  unknown: 'Неизвестно',
};

export default function AdminTraffic() {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUserStats();
    const interval = setInterval(() => {
      fetchStats();
      fetchUserStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = (func2url as Record<string, string>)['page-views'] || '';
      if (!apiUrl) return;
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

  const fetchUserStats = async () => {
    try {
      const apiUrl = (func2url as Record<string, string>)['admin-users'] || '';
      if (!apiUrl) return;
      const response = await fetch(apiUrl, {
        headers: { 'X-Admin-Token': 'admin_authenticated' },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const users = data.users || [];
          const today = new Date();
          interface UserFromAPI {
            is_verified: boolean;
            oauth_provider: string | null;
            created_at: string | null;
          }
          setUserStats({
            total: data.total || 0,
            verified: users.filter((u: UserFromAPI) => u.is_verified).length,
            oauth: users.filter((u: UserFromAPI) => u.oauth_provider).length,
            today: users.filter((u: UserFromAPI) => {
              if (!u.created_at) return false;
              return new Date(u.created_at).toDateString() === today.toDateString();
            }).length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-6">
        <Icon name="Loader2" className="animate-spin" size={40} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-3 md:p-6 pb-20">
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-gray-600">Нет данных о посещаемости</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgPagesPerSession = stats.total.sessions > 0
    ? (stats.total.views / stats.total.sessions).toFixed(1)
    : '0';

  const maxDaily = Math.max(...stats.daily_chart.map((d) => d.views), 1);
  const maxHourly = Math.max(...stats.hourly_chart.map((h) => h.views), 1);
  const totalDeviceCount = stats.devices.reduce((s, d) => s + d.count, 0) || 1;
  const totalSourceCount = stats.sources.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-3 sm:p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Заголовок */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Посещаемость
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Статистика посещений, устройств и источников
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 h-9 text-xs md:text-sm md:h-10"
              onClick={() => (window.location.href = '/admin/welcome')}
            >
              <Icon name="Sparkles" size={14} className="mr-1.5" />
              Велком-страница
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 h-9 text-xs md:text-sm md:h-10"
              onClick={() => (window.location.href = '/admin/dashboard')}
            >
              <Icon name="ArrowLeft" size={14} className="mr-1.5" />
              Назад
            </Button>
          </div>
        </div>

        {/* KPI карточки визитов */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Всего просмотров</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.total.views.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">За всё время</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Уник. сессий</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.total.sessions.toLocaleString()}</div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">Визитов всего</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Сегодня</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.today.views}</div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">{stats.today.sessions} сессий</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">За неделю</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-2xl md:text-3xl font-bold text-orange-600">{stats.week.views}</div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">{stats.week.sessions} сессий</p>
            </CardContent>
          </Card>
        </div>

        {/* Пользователи */}
        {userStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5">
                  <Icon name="Users" size={14} className="text-blue-600" />
                  Всего
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">{userStats.total}</div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Зарегистрировано</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5">
                  <Icon name="CheckCircle" size={14} className="text-green-600" />
                  Подтв.
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-bold text-green-700">{userStats.verified}</div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Верифиц.</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200">
              <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5">
                  <Icon name="Globe" size={14} className="text-purple-600" />
                  OAuth
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-bold text-purple-700">{userStats.oauth}</div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Через соцсети</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardHeader className="pb-2 p-3 md:p-6 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5">
                  <Icon name="TrendingUp" size={14} className="text-orange-600" />
                  Сегодня
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-bold text-orange-700">{userStats.today}</div>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">Новых</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* График 30 дней + Топ страниц */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="BarChart3" size={18} />
                Посещения за 30 дней
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Динамика просмотров и сессий</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {stats.daily_chart.slice(0, 14).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-2 md:gap-3">
                    <div className="w-16 md:w-20 text-[11px] md:text-xs text-gray-600 flex-shrink-0">
                      {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 md:h-7 bg-gradient-to-r from-blue-400 to-blue-600 rounded"
                          style={{ width: `${Math.max((day.views / maxDaily) * 100, 4)}%` }}
                        />
                        <span className="text-xs md:text-sm font-semibold text-blue-600 flex-shrink-0">
                          {day.views}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{day.sessions} сессий</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="TrendingUp" size={18} />
                Популярные страницы
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Топ-15 за 30 дней</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {stats.top_pages.map((page, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="font-mono text-[10px] flex-shrink-0">
                        #{idx + 1}
                      </Badge>
                      <span className="text-xs md:text-sm font-medium text-gray-700 truncate">
                        {page.path === '/' ? 'Главная' : page.path}
                      </span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px] md:text-xs flex-shrink-0 ml-2">
                      {page.views}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Устройства + Источники */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="Smartphone" size={18} />
                Устройства
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">С каких устройств заходят</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-3">
                {stats.devices.map((d) => {
                  const pct = Math.round((d.count / totalDeviceCount) * 100);
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon name={deviceIcons[d.name] || 'HelpCircle'} size={16} className="text-slate-600" />
                          <span className="text-sm font-medium">{deviceLabels[d.name] || d.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold">{pct}%</span>
                          <span className="text-gray-500 ml-1.5 text-xs">({d.count})</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {stats.os.length > 0 && (
                <div className="mt-5 pt-4 border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Операционные системы</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.os.slice(0, 5).map((o) => (
                      <Badge key={o.name} variant="outline" className="text-[11px]">
                        {o.name}: {o.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {stats.browsers.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Браузеры</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stats.browsers.slice(0, 6).map((b) => (
                      <Badge key={b.name} variant="outline" className="text-[11px]">
                        {b.name}: {b.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="Link" size={18} />
                Откуда приходят
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Источники трафика за 30 дней</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-3">
                {stats.sources.slice(0, 8).map((s) => {
                  const pct = Math.round((s.count / totalSourceCount) * 100);
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate pr-2">{s.name}</span>
                        <div className="text-sm flex-shrink-0">
                          <span className="font-bold">{pct}%</span>
                          <span className="text-gray-500 ml-1.5 text-xs">({s.count})</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Активность по часам */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Icon name="Clock" size={18} />
              Активность по часам
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Когда люди заходят (за 7 дней)</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="flex items-end gap-0.5 md:gap-1 h-32">
              {stats.hourly_chart.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t"
                    style={{ height: `${(h.views / maxHourly) * 100}%`, minHeight: h.views > 0 ? '4px' : '0' }}
                    title={`${h.hour}:00 — ${h.views} просмотров`}
                  />
                  <span className="text-[9px] md:text-[10px] text-gray-500 mt-1">{h.hour}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 mt-2 text-center">Часы (0–23)</p>
          </CardContent>
        </Card>

        {/* Общая активность */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Icon name="Activity" size={18} />
              Итоги
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Страниц за сессию</p>
                <p className="text-xl md:text-2xl font-bold text-blue-900">{avgPagesPerSession}</p>
              </div>
              <div className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-xs text-purple-700 font-medium mb-1">Активных дней</p>
                <p className="text-xl md:text-2xl font-bold text-purple-900">{stats.total.active_days}</p>
              </div>
              <div className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-xs text-green-700 font-medium mb-1">Уник. IP</p>
                <p className="text-xl md:text-2xl font-bold text-green-900">{stats.total.unique_ips}</p>
              </div>
              <div className="p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <p className="text-xs text-orange-700 font-medium mb-1">За месяц</p>
                <p className="text-xl md:text-2xl font-bold text-orange-900">{stats.month.views}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}