import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState } from 'react';

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

  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
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
          />
        </div>

        {isSubscribed && (
          <div className="space-y-3">
            <Button
              onClick={handleTestNotification}
              disabled={isSendingTest}
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
                  Отправить тестовое уведомление
                </>
              )}
            </Button>

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
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
                  <span>Уведомления отправляются автоматически каждый день в 9:00. Вы можете выключить их в любое время.</span>
                </p>
              </div>
            </div>
          </div>
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
      </CardContent>
    </Card>
  );
}