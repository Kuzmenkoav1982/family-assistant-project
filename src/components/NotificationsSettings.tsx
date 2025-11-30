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
    sendTestNotification
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
              <p className="text-sm text-orange-700">
                Ваш браузер не поддерживает push-уведомления. Попробуйте использовать современный браузер (Chrome, Firefox, Edge).
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

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Icon name="Info" size={16} />
                Когда вы будете получать уведомления:
              </h5>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Напоминания о предстоящих задачах</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>События в семейном календаре</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Важные даты (дни рождения, годовщины)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Новые сообщения в семейном чате</span>
                </li>
              </ul>
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
