import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationCard() {
  const { toast } = useToast();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    sendTestNotification,
    isIOSDevice,
    isIOSPWA
  } = usePushNotifications();
  
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleTestNotification = async () => {
    if (!isSubscribed) {
      toast({
        title: '⚠️ Подпишитесь на уведомления',
        description: 'Сначала нужно включить Push-уведомления',
        variant: 'destructive'
      });
      return;
    }

    setIsSendingTest(true);
    const success = await sendTestNotification();
    setIsSendingTest(false);
    
    if (success) {
      toast({
        title: '✅ Успешно!',
        description: 'Тестовое Push-уведомление отправлено',
        variant: 'default'
      });
    } else {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось отправить Push-уведомление',
        variant: 'destructive'
      });
    }
  };

  if (!isSupported && isIOSDevice && !isIOSPWA) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <Icon name="Smartphone" size={28} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              iPhone/iPad: Push через PWA
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Safari не поддерживает Web Push. Но вы можете установить приложение для получения уведомлений!
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Установите приложение на домашний экран:
          </h4>
          <ol className="space-y-2 text-sm text-gray-700 ml-8 list-decimal">
            <li>Нажмите кнопку <strong>"Поделиться"</strong> <Icon name="Share" size={14} className="inline" /> внизу Safari</li>
            <li>Выберите <strong>"На экран «Домой»"</strong></li>
            <li>Нажмите <strong>"Добавить"</strong></li>
          </ol>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Откройте приложение с домашнего экрана
          </h4>
          <p className="text-sm text-gray-700 ml-8">
            Push-уведомления будут работать только в установленном приложении
          </p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start gap-2">
            <Icon name="Lightbulb" className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-800">
              <strong>Альтернатива:</strong> Используйте Email или SMS уведомления (карточки выше) — они работают без установки!
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
        <div className="flex items-start gap-3">
          <Icon name="AlertCircle" size={24} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-1">
              Push-уведомления не поддерживаются
            </h3>
            <p className="text-sm text-orange-700 mb-2">
              Ваш браузер не поддерживает push-уведомления. Попробуйте использовать Chrome, Firefox или Edge.
            </p>
            <p className="text-xs text-orange-600">
              💡 Используйте Email или SMS уведомления как альтернативу (карточки выше)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Bell" className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">Push-уведомления</h3>
        {permission === 'granted' && isSubscribed && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Включены
          </span>
        )}
        {permission === 'denied' && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
            Заблокированы
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {!isSubscribed ? (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-3">
            <p className="text-sm text-blue-800 mb-3">
              Получайте уведомления о задачах, событиях и важных датах прямо на устройство
            </p>
            <Button
              onClick={subscribe}
              disabled={isLoading || permission === 'denied'}
              className="w-full"
            >
              <Icon name="Bell" size={18} className="mr-2" />
              {isLoading ? 'Подписка...' : 'Включить Push-уведомления'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleTestNotification}
            disabled={isSendingTest}
            className="w-full"
          >
            <Icon name="Send" size={18} className="mr-2" />
            {isSendingTest ? 'Отправка...' : 'Отправить тестовое Push-уведомление'}
          </Button>
        )}

        {permission === 'denied' && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Уведомления заблокированы.</strong> Разрешите их в настройках браузера для этого сайта.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
