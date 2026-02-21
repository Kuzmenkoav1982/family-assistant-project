import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState, useEffect } from 'react';
import func2url from '../../backend/func2url.json';
import { NotificationTypeSettings } from './NotificationTypeSettings';
import { useAuth } from '@/lib/auth-context';

export function NotificationsSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    isIOSDevice,
    isIOSPWA
  } = usePushNotifications();

  const { currentUser } = useAuth();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isCheckingReminders, setIsCheckingReminders] = useState(false);
  const [maxConnected, setMaxConnected] = useState<boolean | null>(null);
  const [maxLoading, setMaxLoading] = useState(false);

  useEffect(() => {
    checkMaxStatus();
  }, []);

  const checkMaxStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const resp = await fetch(func2url['user-management'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'get_max_status' })
      });
      const data = await resp.json();
      if (data.success) setMaxConnected(data.connected);
    } catch { /* ignore */ }
  };

  const handleDisconnectMax = async () => {
    setMaxLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      const resp = await fetch(func2url['user-management'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ action: 'disconnect_max' })
      });
      const data = await resp.json();
      if (data.success) {
        setMaxConnected(false);
        alert('MAX отключён. Уведомления больше не будут приходить в мессенджер.');
      }
    } catch {
      alert('Ошибка при отключении MAX');
    } finally {
      setMaxLoading(false);
    }
  };

  const maxBotLink = currentUser?.id
    ? `https://max.ru/id231805288780_bot?start=${currentUser.id}`
    : 'https://max.ru/id231805288780_bot';

  const handleCheckReminders = async () => {
    setIsCheckingReminders(true);
    try {
      const response = await fetch(func2url['scheduled-reminders']);
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Проверка завершена!\nОтправлено: ${result.sent} уведомлений\nОшибок: ${result.failed}`);
      } else {
        alert(`❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Не удалось выполнить проверку напоминаний');
    } finally {
      setIsCheckingReminders(false);
    }
  };

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        alert('✅ Push-уведомления отключены. Вы можете включить их заново в любое время.');
      }
    } else {
      const success = await subscribe();
      if (success) {
        alert('✅ Push-уведомления включены! Попробуйте отправить тестовое уведомление.');
      }
    }
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    const success = await sendTestNotification();
    setIsSendingTest(false);
    
    if (success) {
      alert('Тестовое уведомление отправлено! Проверьте устройство.');
    } else {
      alert('Ошибка отправки тестового уведомления');
    }
  };

  if (!isSupported && isIOSDevice && !isIOSPWA) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Smartphone" size={24} className="text-blue-600" />
            iPhone/iPad: Установите PWA для уведомлений
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Safari не поддерживает Web Push API. Установите приложение на домашний экран для получения уведомлений:
          </p>

          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Откройте меню "Поделиться"</p>
                <p className="text-sm text-gray-600">Нажмите кнопку <Icon name="Share" size={14} className="inline" /> внизу Safari</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Добавьте на домашний экран</p>
                <p className="text-sm text-gray-600">Выберите "На экран «Домой»" и нажмите "Добавить"</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Откройте с домашнего экрана</p>
                <p className="text-sm text-gray-600">Push-уведомления работают только в установленном приложении</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="Lightbulb" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <strong>Альтернатива:</strong> Перейдите в Настройки → Уведомления и настройте Email/SMS уведомления — они работают без установки!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Icon name="AlertCircle" size={24} className="text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-orange-900 mb-1">
                Push-уведомления не поддерживаются
              </p>
              <p className="text-sm text-orange-700 mb-2">
                Ваш браузер не поддерживает push-уведомления. Попробуйте использовать современный браузер (Chrome, Firefox, Edge).
              </p>
              <p className="text-xs text-orange-600">
                💡 Используйте Email или SMS уведомления как альтернативу
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={24} className="text-blue-600" />
          Настройки уведомлений
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-gray-900">Push-уведомления</h4>
              {permission === 'granted' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Icon name="CheckCircle2" size={12} className="mr-1" />
                  Разрешены
                </Badge>
              )}
              {permission === 'denied' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Icon name="XCircle" size={12} className="mr-1" />
                  Заблокированы
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Получайте уведомления о задачах, событиях и важных датах
            </p>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
            className="flex-shrink-0 ml-4"
          />
        </div>

        {isSubscribed && (
          <>
            <NotificationTypeSettings />
            <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleTestNotification}
                disabled={isSendingTest || isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                {isSendingTest ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={18} />
                    Тестовое уведомление
                  </>
                )}
              </Button>
              
              <Button
                onClick={async () => {
                  const success = await unsubscribe();
                  if (success) {
                    alert('✅ Push-уведомления отключены. Включите их заново, чтобы пересоздать подписку с актуальными ключами.');
                  } else {
                    alert('❌ Не удалось отключить уведомления. Попробуйте ещё раз.');
                  }
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Отключение...
                  </>
                ) : (
                  <>
                    <Icon name="BellOff" size={18} />
                    Отключить уведомления
                  </>
                )}
              </Button>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700">
                  <strong>Если уведомления не приходят:</strong> Отключите Push-уведомления и включите заново — это пересоздаст подписку с актуальными ключами.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-purple-600" />
                Автоматические напоминания
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Icon name="Clock" size={16} className="mt-0.5 flex-shrink-0 text-blue-600" />
                  <span><strong>Задачи:</strong> уведомления за день до срока выполнения</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Calendar" size={16} className="mt-0.5 flex-shrink-0 text-purple-600" />
                  <span><strong>События:</strong> напоминания о предстоящих мероприятиях</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Pill" size={16} className="mt-0.5 flex-shrink-0 text-pink-600" />
                  <span><strong>Лекарства:</strong> напоминания о приёме медикаментов детям</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Gift" size={16} className="mt-0.5 flex-shrink-0 text-orange-600" />
                  <span><strong>Важные даты:</strong> дни рождения и годовщины членов семьи</span>
                </li>
              </ul>
              
              <Button
                onClick={handleCheckReminders}
                disabled={isCheckingReminders}
                variant="outline"
                className="w-full gap-2 mt-4 bg-white hover:bg-blue-50"
              >
                {isCheckingReminders ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Проверка напоминаний...
                  </>
                ) : (
                  <>
                    <Icon name="RefreshCw" size={18} />
                    Проверить напоминания сейчас
                  </>
                )}
              </Button>
              
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Автоматическая проверка:</strong> Напоминания проверяются каждый день в 9:00, 14:00 и 19:00. 
                    Или нажмите кнопку выше для ручной проверки прямо сейчас.
                  </span>
                </p>
              </div>
            </div>
          </div>
          </>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">
                  Уведомления заблокированы
                </p>
                <p className="text-sm text-red-700">
                  Чтобы включить уведомления, разрешите их в настройках браузера для этого сайта.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <Icon name="MessageCircle" size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900">Уведомления в MAX</h4>
                {maxConnected === true && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Icon name="CheckCircle2" size={12} className="mr-1" />
                    Подключён
                  </Badge>
                )}
                {maxConnected === false && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                    Не подключён
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Получайте все уведомления в мессенджере MAX
              </p>
            </div>
          </div>

          {maxConnected ? (
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-sky-100">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <Icon name="CheckCircle2" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  Бот подключён. Уведомления приходят в MAX автоматически.
                </p>
              </div>
              <Button
                onClick={handleDisconnectMax}
                disabled={maxLoading}
                variant="outline"
                size="sm"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                {maxLoading ? (
                  <Icon name="Loader2" size={14} className="animate-spin" />
                ) : (
                  <Icon name="Unlink" size={14} />
                )}
                Отключить MAX
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p className="text-sm text-gray-700">Нажмите кнопку ниже — откроется бот в MAX</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p className="text-sm text-gray-700">Нажмите «Начать» в боте</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p className="text-sm text-gray-700">Готово — уведомления будут приходить в MAX</p>
                </div>
              </div>
              <Button
                asChild
                className="w-full gap-2 bg-sky-500 hover:bg-sky-600 text-white"
              >
                <a href={maxBotLink} target="_blank" rel="noopener noreferrer">
                  <Icon name="MessageCircle" size={18} />
                  Подключить MAX
                  <Icon name="ExternalLink" size={14} />
                </a>
              </Button>
              <Button
                onClick={checkMaxStatus}
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-sky-600"
              >
                <Icon name="RefreshCw" size={14} />
                Проверить подключение
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}