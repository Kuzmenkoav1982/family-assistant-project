import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { AdminAliceStatisticsTab } from './AdminAliceStatisticsTab';

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

interface CommandCategory {
  category: string;
  count: number;
  color: string;
}

interface AdminAliceTabsProps {
  commandsByCategory: CommandCategory[];
  avgResponseTime: number;
  errorRate: number;
  users: AliceUser[];
  logs: LogEntry[];
  webhookUrl: string;
  onCopyWebhook: () => void;
}

export function AdminAliceTabs({
  commandsByCategory,
  avgResponseTime,
  errorRate,
  users,
  logs,
  webhookUrl,
  onCopyWebhook
}: AdminAliceTabsProps) {
  return (
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

      <TabsContent value="stats" className="space-y-6">
        <AdminAliceStatisticsTab
          commandsByCategory={commandsByCategory}
          avgResponseTime={avgResponseTime}
          errorRate={errorRate}
        />
      </TabsContent>

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
            <Button onClick={onCopyWebhook} variant="outline" className="w-full">
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
  );
}
