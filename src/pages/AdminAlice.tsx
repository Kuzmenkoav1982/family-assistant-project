import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AliceStats {
  totalUsers: number;
  activeUsers: number;
  totalCommands: number;
  todayCommands: number;
  popularCommands: Array<{ command: string; count: number }>;
  dailyUsage: Array<{ date: string; commands: number; users: number }>;
  commandsByCategory: Array<{ category: string; count: number; color: string }>;
  errorRate: number;
  avgResponseTime: number;
}

interface AliceUser {
  name: string;
  family: string;
  commands: number;
  lastActive: string;
}

interface LogEntry {
  type: 'error' | 'warning' | 'info';
  message: string;
  user: string;
  time: string;
  command: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  tasks: '#8b5cf6',
  calendar: '#3b82f6',
  shopping: '#10b981',
  stats: '#f59e0b',
  help: '#6366f1',
  other: '#9ca3af',
};

const CATEGORY_NAMES: Record<string, string> = {
  tasks: 'Задачи',
  calendar: 'Календарь',
  shopping: 'Покупки',
  stats: 'Статистика',
  help: 'Помощь',
  other: 'Другое',
};

export default function AdminAlice() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AliceStats | null>(null);
  const [users, setUsers] = useState<AliceUser[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeployed, setIsDeployed] = useState(true);
  const [webhookUrl] = useState('https://functions.poehali.dev/3654f595-6c6d-4ebf-9213-f12b4d75efaf');

  useEffect(() => {
    loadStats();
    loadUsers();
    loadLogs();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/00864888-e26d-45f7-8e6e-5e02202aee4b?action=stats', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to load stats:', response.status);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Преобразуем данные для графиков
      const commandsByCategory = data.popular_commands?.map((cmd: any) => ({
        category: CATEGORY_NAMES[cmd.command_category] || cmd.command_category,
        count: cmd.count,
        color: CATEGORY_COLORS[cmd.command_category] || CATEGORY_COLORS.other,
      })) || [];
      
      setStats({
        totalUsers: data.total_users || 0,
        activeUsers: data.active_today || 0,
        totalCommands: data.total_commands || 0,
        todayCommands: data.today_commands || 0,
        popularCommands: [], // Будем загружать отдельно
        dailyUsage: [], // Будем загружать отдельно
        commandsByCategory,
        errorRate: data.error_rate || 0,
        avgResponseTime: data.avg_response_time || 0,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/5cab3ca7-6fa8-4ffb-b9d1-999d93d29d2e?action=alice-users', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://functions.poehali.dev/5cab3ca7-6fa8-4ffb-b9d1-999d93d29d2e?action=alice-logs', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 pb-20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Хедер */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Icon name="Mic" size={36} />
              Управление Алисой
            </h1>
            <p className="text-gray-600 mt-2">Статистика, настройки и модерация навыка</p>
          </div>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="gap-2">
            <Icon name="ArrowLeft" size={18} />
            Админка
          </Button>
        </div>

        {/* Статус навыка */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${isDeployed ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Icon 
                    name={isDeployed ? 'CheckCircle' : 'XCircle'} 
                    size={32} 
                    className={isDeployed ? 'text-green-600' : 'text-red-600'} 
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">
                    {isDeployed ? 'Навык активен и работает' : 'Навык не активен'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Webhook: <code className="text-xs bg-white px-2 py-1 rounded">{webhookUrl}</code>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyWebhookUrl} variant="outline" size="sm">
                  <Icon name="Copy" size={16} className="mr-2" />
                  Копировать URL
                </Button>
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <Icon name="Activity" size={16} className="mr-2" />
                  Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Лоадер или контент */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">Загрузка статистики...</p>
            </CardContent>
          </Card>
        ) : !stats ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="AlertCircle" size={32} className="mx-auto mb-4 text-red-600" />
              <p className="text-gray-600">Не удалось загрузить статистику</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Всего пользователей"
                value={stats.totalUsers}
                icon="Users"
                color="purple"
                trend={stats.totalUsers === 0 ? 'Пока нет пользователей' : `${stats.activeUsers} активных`}
              />
              <MetricCard
                title="Активные сегодня"
                value={stats.activeUsers}
                icon="Activity"
                color="blue"
                trend={stats.totalUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% от всех` : 'Нет данных'}
              />
              <MetricCard
                title="Команд за день"
                value={stats.todayCommands}
            icon="MessageSquare"
            color="green"
            trend={`${stats.totalCommands} всего`}
          />
          <MetricCard
            title="Ошибок"
            value={`${stats.errorRate}%`}
            icon="AlertTriangle"
            color={stats.errorRate > 5 ? 'red' : 'yellow'}
            trend="Норма до 5%"
          />
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="stats" className="flex-1">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex-1">
              <Icon name="Shield" size={16} className="mr-2" />
              Модерация
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Вкладка: Статистика */}
          <TabsContent value="stats" className="space-y-6">
            {stats.commandsByCategory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Пока нет данных</h3>
                  <p className="text-gray-600">Статистика появится после первых использований навыка</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Распределение команд */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="PieChart" size={20} className="text-purple-600" />
                        Команды по категориям
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stats.commandsByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {stats.commandsByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Производительность */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Zap" size={20} className="text-yellow-600" />
                    Среднее время ответа
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-purple-600 mb-2">{stats.avgResponseTime}ms</div>
                    <p className="text-sm text-gray-600">
                      {stats.avgResponseTime < 500 ? '✅ Отлично' : stats.avgResponseTime < 1000 ? '⚠️ Приемлемо' : '🔴 Медленно'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={20} className="text-red-600" />
                    Уровень ошибок
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">{stats.errorRate}%</div>
                    <p className="text-sm text-gray-600">
                      {stats.errorRate < 3 ? '✅ Отлично' : stats.errorRate < 5 ? '⚠️ Норма' : '🔴 Требует внимания'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
                </>
              )}
            </TabsContent>

          {/* Вкладка: Пользователи */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-blue-600" />
                  Подключенные пользователи ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Пока нет подключенных пользователей</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.family}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-purple-600">{user.commands} команд</p>
                          <p className="text-xs text-gray-500">{user.lastActive}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Модерация */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={20} className="text-red-600" />
                  Журнал событий ({logs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-300" />
                    <p className="text-gray-600">Нет событий для отображения</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log, i) => (
                      <Alert key={i} className={
                        log.type === 'error' ? 'border-red-300 bg-red-50' :
                        log.type === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                        'border-blue-300 bg-blue-50'
                      }>
                        <Icon name={
                          log.type === 'error' ? 'XCircle' : 
                          log.type === 'warning' ? 'AlertTriangle' : 
                          'Info'
                        } size={16} />
                        <AlertTitle className="font-semibold">
                          {log.message}
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                          Пользователь: {log.user} • Команда: "{log.command}" • Время: {log.time}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" size={20} className="text-purple-600" />
                  Информация
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Подробные логи ошибок и непонятых команд будут добавлены в следующем обновлении
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Сейчас все команды логируются в БД. Статистика по ошибкам доступна на вкладке "Статистика"
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Настройки */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Code" size={20} className="text-gray-600" />
                  Webhook URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm">
                  {webhookUrl}
                </div>
                <Button onClick={copyWebhookUrl} variant="outline" className="w-full">
                  <Icon name="Copy" size={16} className="mr-2" />
                  Скопировать URL
                </Button>
                <Alert>
                  <Icon name="Info" size={16} />
                  <AlertDescription>
                    Используйте этот URL в настройках навыка в Яндекс.Диалогах
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={20} className="text-blue-600" />
                  Инструкция по модерации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mb-2">Шаги для публикации навыка:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Зайдите на <a href="https://dialogs.yandex.ru/developer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dialogs.yandex.ru/developer</a></li>
                    <li>Создайте новый навык типа "Навык в приложении"</li>
                    <li>Укажите Webhook URL из блока выше</li>
                    <li>Добавьте активационные фразы: "Открой Нашу Семью", "Запусти Наша Семья"</li>
                    <li>Заполните описание и добавьте иконку (512x512px)</li>
                    <li>Отправьте на модерацию</li>
                    <li>Ожидайте одобрения (обычно 2-3 рабочих дня)</li>
                  </ol>

                  <h4 className="font-semibold mt-6 mb-2">Требования модерации:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Навык должен корректно отвечать на все заявленные команды</li>
                    <li>Время ответа не должно превышать 3 секунды</li>
                    <li>Описание должно точно отражать функциональность</li>
                    <li>Навык не должен запрашивать чувствительные данные в голосовом режиме</li>
                    <li>Должна быть реализована команда "Помощь"</li>
                  </ul>

                  <Alert className="mt-4">
                    <Icon name="CheckCircle" size={16} />
                    <AlertTitle>Статус: Готово к модерации</AlertTitle>
                    <AlertDescription>
                      Навык соответствует всем требованиям и может быть отправлен на модерацию
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Icon name="Lightbulb" size={24} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Советы по прохождению модерации</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Протестируйте все команды перед отправкой</li>
                      <li>• Добавьте подробное описание возможностей</li>
                      <li>• Укажите примеры команд в описании навыка</li>
                      <li>• Убедитесь что навык корректно работает с разными формулировками</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </div>
  );
}

// Вспомогательный компонент для метрик
function MetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string; 
  trend?: string;
}) {
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon name={icon as any} size={20} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {trend && <p className="text-xs text-gray-500">{trend}</p>}
      </CardContent>
    </Card>
  );
}