import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import PushNotificationCard from './PushNotificationCard';

interface NotificationHistoryItem {
  id: number;
  notification_type: string;
  recipient: string;
  subject?: string;
  message: string;
  status: string;
  error_message?: string;
  sent_at: string;
}

export default function NotificationTest() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const NOTIFICATIONS_API = 'https://functions.poehali.dev/82852794-3586-44b2-8796-f0de94642774';
  const DB_API = 'https://db-proxy.poehali.workers.dev/';

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${DB_API}?query=${encodeURIComponent(
        'SELECT * FROM notification_history ORDER BY sent_at DESC LIMIT 20'
      )}`);
      const data = await response.json();
      if (data.rows) {
        setHistory(data.rows);
      }
    } catch (error) {
      console.error('Failed to load notification history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: '⚠️ Ошибка',
        description: 'Введите email адрес получателя',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(`${NOTIFICATIONS_API}?action=email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Тестовое письмо из Family Organizer',
          body: 'Это тестовое письмо для проверки отправки email через Яндекс.Почту SMTP. Если вы получили это письмо, значит всё работает! 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="color: white; margin: 0;">📧 Тестовое письмо</h1>
              </div>
              <div style="background: #f8f9fa; padding: 40px; border-radius: 10px; margin-top: 20px; text-align: center;">
                <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
                  Поздравляем! Система отправки email работает корректно! 🎉
                </p>
                <p style="font-size: 14px; color: #666;">
                  Это тестовое письмо из Family Organizer через Яндекс.Почту SMTP
                </p>
              </div>
            </div>
          `
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '✅ Успешно!',
          description: `Email отправлен на ${email}`,
          variant: 'default'
        });
        setEmail('');
        loadHistory();
      } else {
        toast({
          title: '❌ Ошибка отправки',
          description: data.error || 'Не удалось отправить email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка сети',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!phone) {
      toast({
        title: '⚠️ Ошибка',
        description: 'Введите номер телефона в формате +79001234567',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(`${NOTIFICATIONS_API}?action=sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: '✅ Тест SMS из Family Organizer. Система уведомлений работает!'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '✅ Успешно!',
          description: `SMS отправлено на ${phone}`,
          variant: 'default'
        });
        setPhone('');
        loadHistory();
      } else {
        toast({
          title: '❌ Ошибка отправки',
          description: data.error || 'Не удалось отправить SMS',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка сети',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Тестирование уведомлений</p>
            <p>Отправьте тестовый email или SMS, чтобы проверить работу системы уведомлений.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Mail" className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold">Email уведомления</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email получателя
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <Button
              onClick={handleSendEmail}
              disabled={sending}
              className="w-full"
            >
              <Icon name="Send" size={18} className="mr-2" />
              {sending ? 'Отправка...' : 'Отправить тестовый email'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="MessageSquare" className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold">SMS уведомления</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+79001234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <Button
              onClick={handleSendSMS}
              disabled={sending}
              className="w-full"
            >
              <Icon name="Send" size={18} className="mr-2" />
              {sending ? 'Отправка...' : 'Отправить тестовое SMS'}
            </Button>
          </div>
        </div>

        <PushNotificationCard />
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="History" className="text-gray-600" size={24} />
              <h3 className="text-lg font-semibold">История уведомлений</h3>
            </div>
            <Button 
              onClick={loadHistory} 
              variant="outline" 
              size="sm"
              disabled={loadingHistory}
            >
              <Icon name="RotateCw" size={16} className={loadingHistory ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        <div className="divide-y max-h-96 overflow-y-auto">
          {loadingHistory ? (
            <div className="p-8 text-center text-gray-500">
              <Icon name="Loader2" className="mx-auto mb-2 animate-spin" size={32} />
              <p>Загрузка истории...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Icon name="Inbox" className="mx-auto mb-2 text-gray-400" size={48} />
              <p>История уведомлений пуста</p>
              <p className="text-sm mt-1">Отправьте тестовое уведомление</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {item.notification_type === 'email' ? (
                      <Icon name="Mail" className="text-purple-600" size={20} />
                    ) : (
                      <Icon name="MessageSquare" className="text-green-600" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{item.recipient}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : item.status === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status === 'success' ? '✅' : item.status === 'error' ? '❌' : '⏳'} {item.status}
                      </span>
                    </div>
                    
                    {item.subject && (
                      <p className="text-sm text-gray-700 mb-1">{item.subject}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 truncate">{item.message}</p>
                    
                    {item.error_message && (
                      <p className="text-xs text-red-600 mt-1">⚠️ {item.error_message}</p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.sent_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <Icon name="Info" size={22} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Настройка секретов для уведомлений</h4>
            <p className="text-sm text-gray-700 mb-3">
              Для работы системы уведомлений нужно добавить секреты в настройках проекта
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-2 mb-2">
              <Icon name="Mail" size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <h5 className="font-semibold text-gray-900">Email уведомления (Яндекс.Почта)</h5>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 mb-3 ml-6">
              <li><strong>YANDEX_SMTP_LOGIN</strong> — ваш email (например: user@yandex.ru)</li>
              <li><strong>YANDEX_SMTP_PASSWORD</strong> — пароль приложения из Яндекс ID</li>
            </ul>
            <a
              href="https://id.yandex.ru/security/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Icon name="ExternalLink" size={16} />
              Создать пароль приложения
            </a>
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-start gap-2 mb-2">
              <Icon name="MessageSquare" size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <h5 className="font-semibold text-gray-900">SMS уведомления (SMS.ru)</h5>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 mb-3 ml-6">
              <li><strong>SMS_RU_API_KEY</strong> — API ключ из личного кабинета SMS.ru</li>
            </ul>
            <a
              href="https://sms.ru/panel/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Icon name="ExternalLink" size={16} />
              Получить API ключ SMS.ru
            </a>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="Lightbulb" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">
                <strong>Как добавить секреты:</strong> Перейдите в настройки проекта → вкладка "Ядро" → раздел "Секреты" → добавьте нужные ключи и их значения
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
