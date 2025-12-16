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

export default function AdminAlice() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AliceStats>({
    totalUsers: 12,
    activeUsers: 8,
    totalCommands: 347,
    todayCommands: 23,
    popularCommands: [
      { command: 'Задачи на сегодня', count: 89 },
      { command: 'Список покупок', count: 67 },
      { command: 'Что в календаре', count: 54 },
      { command: 'Добавь задачу', count: 41 },
      { command: 'Статистика семьи', count: 28 },
    ],
    dailyUsage: [
      { date: '10.12', commands: 45, users: 6 },
      { date: '11.12', commands: 52, users: 7 },
      { date: '12.12', commands: 61, users: 8 },
      { date: '13.12', commands: 48, users: 7 },
      { date: '14.12', commands: 58, users: 8 },
      { date: '15.12', commands: 60, users: 8 },
      { date: '16.12', commands: 23, users: 5 },
    ],
    commandsByCategory: [
      { category: 'Задачи', count: 178, color: '#8b5cf6' },
      { category: 'Календарь', count: 89, color: '#3b82f6' },
      { category: 'Покупки', count: 67, color: '#10b981' },
      { category: 'Статистика', count: 13, color: '#f59e0b' },
    ],
    errorRate: 2.3,
    avgResponseTime: 420,
  });

  const [isDeployed, setIsDeployed] = useState(true);
  const [webhookUrl] = useState('https://functions.poehali.dev/3654f595-6c6d-4ebf-9213-f12b4d75efaf');

  useEffect(() => {
    // Здесь можно загружать реальную статистику из БД
    loadStats();
  }, []);

  const loadStats = async () => {
    // TODO: Запрос к backend для получения статистики
    console.log('Loading Alice stats...');
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

        {/* Метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Всего пользователей"
            value={stats.totalUsers}
            icon="Users"
            color="purple"
            trend="+3 за неделю"
          />
          <MetricCard
            title="Активные сегодня"
            value={stats.activeUsers}
            icon="Activity"
            color="blue"
            trend={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% от всех`}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* График активности */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} className="text-blue-600" />
                    Активность по дням
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="commands" stroke="#8b5cf6" strokeWidth={2} name="Команды" />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Пользователи" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

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

            {/* Популярные команды */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Star" size={20} className="text-yellow-600" />
                  Топ-5 команд
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.popularCommands}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="command" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
          </TabsContent>

          {/* Вкладка: Пользователи */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-blue-600" />
                  Подключенные пользователи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Иван Петров', family: 'Семья Петровых', commands: 89, lastActive: '10 минут назад' },
                    { name: 'Мария Сидорова', family: 'Семья Сидоровых', commands: 67, lastActive: '1 час назад' },
                    { name: 'Алексей Иванов', family: 'Семья Ивановых', commands: 54, lastActive: '2 часа назад' },
                    { name: 'Елена Ковалева', family: 'Семья Ковалевых', commands: 41, lastActive: 'Сегодня' },
                    { name: 'Дмитрий Смирнов', family: 'Семья Смирновых', commands: 28, lastActive: 'Вчера' },
                  ].map((user, i) => (
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка: Модерация */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={20} className="text-red-600" />
                  Журнал ошибок
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      type: 'error', 
                      message: 'Ошибка подключения к БД', 
                      user: 'Иван П.', 
                      time: '10:23', 
                      command: 'Задачи на сегодня' 
                    },
                    { 
                      type: 'warning', 
                      message: 'Медленный ответ (1.2s)', 
                      user: 'Мария С.', 
                      time: '09:15', 
                      command: 'Список покупок' 
                    },
                    { 
                      type: 'info', 
                      message: 'Неизвестная команда', 
                      user: 'Алексей И.', 
                      time: '08:45', 
                      command: 'Расскажи анекдот' 
                    },
                  ].map((log, i) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageSquare" size={20} className="text-purple-600" />
                  Непонятые команды
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Команды, которые пользователи пытались использовать, но навык не распознал
                </p>
                <div className="space-y-2">
                  {[
                    'Расскажи анекдот',
                    'Сколько времени',
                    'Включи музыку',
                    'Что приготовить',
                  ].map((cmd, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm">{cmd}</code>
                      <Badge variant="outline" className="text-xs">
                        Не реализовано
                      </Badge>
                    </div>
                  ))}
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
