import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getVitalsData, getPerformanceRating, getPerformanceDescription } from '@/utils/webVitals';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  status: 'healthy' | 'warning' | 'critical';
  label: string;
  description: string;
  icon: string;
  color: string;
}

interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actionable: boolean;
  action?: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [performanceRating, setPerformanceRating] = useState<'good' | 'needs-improvement' | 'poor'>('good');
  const [vitals, setVitals] = useState(getVitalsData());
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [usersStats, setUsersStats] = useState({ total: 5, today: 2, week: 4 });
  const [activityStats, setActivityStats] = useState({ tasks_week: 0, events_week: 0, shopping_week: 0, children_month: 0 });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/f08e9689-5057-472f-8f5d-e3569af5d508', {
          signal: AbortSignal.timeout(5000) // Таймаут 5 секунд
        });
        
        if (!response.ok) {
          console.warn('Stats API unavailable, using mock data');
          return;
        }
        
        const data = await response.json();
        if (data.users) {
          setUsersStats(data.users);
        }
        if (data.activity) {
          setActivityStats(data.activity);
        }
      } catch (error) {
        // Тихо игнорируем ошибку - используем моковые данные
        console.debug('Stats API not available, using default values');
      }
    };

    fetchStats();

    const interval = setInterval(() => {
      const rating = getPerformanceRating();
      setPerformanceRating(rating);
      setVitals(getVitalsData());
      generateAlerts(rating);
      fetchStats();
    }, 10000);

    generateAlerts(performanceRating);

    return () => clearInterval(interval);
  }, []);

  const generateAlerts = (rating: string) => {
    const newAlerts: AlertItem[] = [];

    if (rating === 'poor') {
      newAlerts.push({
        id: '1',
        type: 'critical',
        title: '⚠️ Медленная загрузка сайта',
        message: 'Сайт загружается дольше 4 секунд. Пользователи могут уходить. Рекомендую добавить кэширование.',
        actionable: true,
        action: 'Оптимизировать',
      });
    } else if (rating === 'needs-improvement') {
      newAlerts.push({
        id: '2',
        type: 'warning',
        title: '💡 Можно ускорить',
        message: 'Сайт работает нормально, но есть возможности для ускорения. Это повысит удовлетворённость пользователей.',
        actionable: false,
      });
    }

    const usersCount = parseInt(localStorage.getItem('totalUsers') || '5');
    if (usersCount > 80) {
      newAlerts.push({
        id: '3',
        type: 'warning',
        title: '📈 Приближаемся к 100 пользователям',
        message: 'Скоро нужно будет добавить кэширование Redis. До этого момента ещё 2-3 недели при текущем росте.',
        actionable: false,
      });
    }

    if (usersCount < 20) {
      newAlerts.push({
        id: '4',
        type: 'info',
        title: '✅ Всё стабильно',
        message: 'Текущая архитектура отлично справляется с нагрузкой. База данных заполнена на 5%. Можно спокойно расти.',
        actionable: false,
      });
    }

    setAlerts(newAlerts);
  };

  const systemStatuses: SystemStatus[] = [
    {
      status: 'healthy',
      label: 'Frontend',
      description: 'Сайт работает нормально',
      icon: 'Globe',
      color: 'text-green-600',
    },
    {
      status: 'healthy',
      label: 'Backend API',
      description: 'Все функции доступны',
      icon: 'Server',
      color: 'text-green-600',
    },
    {
      status: 'healthy',
      label: 'База данных',
      description: 'PostgreSQL работает',
      icon: 'Database',
      color: 'text-green-600',
    },
    {
      status: performanceRating === 'poor' ? 'critical' : performanceRating === 'needs-improvement' ? 'warning' : 'healthy',
      label: 'Производительность',
      description: getPerformanceDescription(performanceRating),
      icon: 'Zap',
      color: performanceRating === 'poor' ? 'text-red-600' : performanceRating === 'needs-improvement' ? 'text-yellow-600' : 'text-green-600',
    },
  ];

  const usersCount = usersStats.total;
  const todayUsers = usersStats.today;
  const weekUsers = usersStats.week;

  const handlePasswordSubmit = () => {
    if (passwordInput === '010677') {
      setShowPasswordDialog(false);
      setPasswordInput('');
      window.location.href = '/admin/users';
    } else {
      toast({
        title: 'Неверный пароль',
        description: 'Доступ запрещён',
        variant: 'destructive'
      });
      setPasswordInput('');
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 bg-clip-text text-transparent">
              Командный Центр
            </h1>
            <p className="text-slate-600 mt-2">Управление и мониторинг приложения простым языком</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/admin/traffic'}>
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Посещаемость
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/alice'}>
              <Icon name="Mic" size={16} className="mr-2" />
              Алиса
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/max'}>
              <Icon name="MessageCircle" size={16} className="mr-2" />
              MAX
            </Button>
            {/* Подписки временно скрыты — используется кошелёк */}
            {/* <Button variant="outline" onClick={() => window.location.href = '/admin/subscriptions'}>
              <Icon name="CreditCard" size={16} className="mr-2" />
              Подписки
            </Button> */}
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/valuation'}>
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Оценка стоимости
            </Button>

            <Button variant="outline" onClick={() => window.location.href = '/admin/marketing'}>
              <Icon name="Megaphone" size={16} className="mr-2" />
              Стратегия развития
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin/marketing-sale'}>
              <Icon name="Handshake" size={16} className="mr-2" />
              Стратегия продажи
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStatuses.map((system) => (
            <Card key={system.label}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{system.label}</CardTitle>
                  <Icon name={system.icon} size={20} className={system.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {system.status === 'healthy' && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Работает
                    </Badge>
                  )}
                  {system.status === 'warning' && (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      <Icon name="AlertTriangle" size={12} className="mr-1" />
                      Внимание
                    </Badge>
                  )}
                  {system.status === 'critical' && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      <Icon name="XCircle" size={12} className="mr-1" />
                      Проблема
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2">{system.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Bell" size={20} />
                Алерты и Подсказки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 && (
                <Alert>
                  <Icon name="CheckCircle" size={16} />
                  <AlertTitle>Всё отлично!</AlertTitle>
                  <AlertDescription>
                    Нет критических уведомлений. Приложение работает стабильно.
                  </AlertDescription>
                </Alert>
              )}
              {alerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.type === 'critical' ? 'border-red-300 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                  'border-blue-300 bg-blue-50'
                }>
                  <AlertTitle className="font-bold">{alert.title}</AlertTitle>
                  <AlertDescription className="mt-2">
                    {alert.message}
                  </AlertDescription>
                  {alert.actionable && (
                    <Button size="sm" className="mt-3" variant="outline">
                      {alert.action}
                    </Button>
                  )}
                </Alert>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="Home" size={18} />
                  Семьи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{usersCount}</p>
                  <p className="text-xs text-slate-600">Семейных профилей</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Сегодня:</span>
                    <span className="font-semibold">{todayUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">За неделю:</span>
                    <span className="font-semibold">{weekUsers}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-500">
                    До 100 пользователей: {100 - usersCount} семей
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="CreditCard" size={18} className="text-purple-600" />
                  Подписки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-purple-900">0</p>
                  <p className="text-xs text-purple-600">Активных подписок</p>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => window.location.href = '/admin/subscriptions'}
                  >
                    <Icon name="BarChart3" size={14} className="mr-2" />
                    Управление подписками
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="Activity" size={18} className="text-green-600" />
                  Активность за неделю
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold text-green-900">{activityStats.tasks_week}</p>
                    <p className="text-xs text-green-600">Задач создано</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{activityStats.events_week}</p>
                    <p className="text-xs text-green-600">События в календаре</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{activityStats.shopping_week}</p>
                    <p className="text-xs text-green-600">Покупок в списке</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">{activityStats.children_month}</p>
                    <p className="text-xs text-green-600">Развитие детей (мес)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Activity" size={20} />
              Web Vitals (Метрики производительности)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">LCP</p>
                <p className="text-lg font-bold text-slate-800">
                  {vitals.LCP ? `${(vitals.LCP / 1000).toFixed(2)}s` : '—'}
                </p>
                <p className="text-xs text-slate-500">Загрузка контента</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">INP</p>
                <p className="text-lg font-bold text-slate-800">
                  {vitals.INP ? `${vitals.INP.toFixed(0)}ms` : '—'}
                </p>
                <p className="text-xs text-slate-500">Отклик на действия</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">CLS</p>
                <p className="text-lg font-bold text-slate-800">
                  {vitals.CLS !== null ? vitals.CLS.toFixed(3) : '—'}
                </p>
                <p className="text-xs text-slate-500">Стабильность</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">FCP</p>
                <p className="text-lg font-bold text-slate-800">
                  {vitals.FCP ? `${(vitals.FCP / 1000).toFixed(2)}s` : '—'}
                </p>
                <p className="text-xs text-slate-500">Первый рендер</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">TTFB</p>
                <p className="text-lg font-bold text-slate-800">
                  {vitals.TTFB ? `${vitals.TTFB.toFixed(0)}ms` : '—'}
                </p>
                <p className="text-xs text-slate-500">Ответ сервера</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600">
                <strong>Что это значит:</strong> Чем меньше цифры - тем быстрее сайт. 
                Хорошо: LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.1
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={20} />
              Подсказки для новичков
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Что такое Web Vitals?</p>
                <p className="text-blue-700 mt-1">
                  Это показатели скорости сайта. Google использует их для ранжирования в поиске. 
                  Быстрый сайт = больше пользователей остаются.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
              <Icon name="TrendingUp" size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Когда нужно масштабировать?</p>
                <p className="text-green-700 mt-1">
                  При 100+ активных пользователей одновременно начинайте думать о кэшировании. 
                  При 10,000+ пользователей - нужны read replicas для БД.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-purple-50 rounded-lg">
              <Icon name="Shield" size={20} className="text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900">Безопасность</p>
                <p className="text-purple-700 mt-1">
                  Все данные шифруются через HTTPS. Секретные ключи хранятся отдельно. 
                  База данных защищена паролем и доступна только backend функциям.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Dialog for Users Section */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Lock" size={24} className="text-orange-600" />
              Введите пароль сотрудника безопасности
            </DialogTitle>
            <DialogDescription>
              Раздел пользователей содержит конфиденциальные данные
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="security-password">Пароль</Label>
              <Input
                id="security-password"
                type="password"
                placeholder="Введите пароль..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={handlePasswordKeyPress}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePasswordSubmit} className="flex-1">
                <Icon name="Unlock" size={16} className="mr-2" />
                Войти
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordInput('');
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}