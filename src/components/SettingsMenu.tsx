import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import FamilyInviteManager from './FamilyInviteManager';
import EffectsSettings from './settings/EffectsSettings';
import ExportSettings from './settings/ExportSettings';
import SubscriptionSettings from './settings/SubscriptionSettings';
import AccountSettings from './settings/AccountSettings';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EXPORT_API = 'https://functions.poehali.dev/6db20156-2ce6-4ba2-923b-b3e8faf8a58b';
const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';
const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export default function SettingsMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [chamomileEnabled, setChamomileEnabled] = useState(() => {
    return localStorage.getItem('chamomileEnabled') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const response = await fetch(`${EXPORT_API}?format=${format}`, {
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'html'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('✅ Данные экспортированы!');
      } else {
        alert('❌ Ошибка экспорта данных');
      }
    } catch (error) {
      alert('❌ Ошибка сети');
    } finally {
      setIsExporting(false);
    }
  };

  const checkSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const response = await fetch(PAYMENTS_API, {
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const createSubscription = async (planType: string) => {
    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'create',
          plan_type: planType,
          return_url: window.location.href
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.payment_url;
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка создания подписки');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${AUTH_API}?action=delete_account`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Аккаунт успешно удалён');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка удаления аккаунта');
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        title="Настройки"
      >
        <Icon name="Settings" size={18} />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Icon name="Settings" size={24} />
              Настройки
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="invites" className="w-full flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-7 mx-6 my-2">
              <TabsTrigger value="invites" className="text-xs md:text-sm">
                <Icon name="Users" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Приглашения</span>
                <span className="sm:hidden">Семья</span>
              </TabsTrigger>
              <TabsTrigger value="launch" className="text-xs md:text-sm">
                <Icon name="Rocket" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">План запуска</span>
                <span className="sm:hidden">План</span>
              </TabsTrigger>
              <TabsTrigger value="effects" className="text-xs md:text-sm">
                <Icon name="Sparkles" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Эффекты</span>
                <span className="sm:hidden">FX</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="text-xs md:text-sm">
                <Icon name="Download" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Экспорт</span>
                <span className="sm:hidden">Файл</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm">
                <Icon name="Mail" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Уведомления</span>
                <span className="sm:hidden">Уведом.</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="text-xs md:text-sm">
                <Icon name="CreditCard" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Подписка</span>
                <span className="sm:hidden">Подписка</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs md:text-sm">
                <Icon name="UserCog" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Аккаунт</span>
                <span className="sm:hidden">Аккаунт</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invites" className="flex-1 overflow-y-auto px-6 pb-6">
              <FamilyInviteManager />
            </TabsContent>

            <TabsContent value="launch" className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Rocket" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        План запуска Семейного Органайзера
                      </h3>
                      <p className="text-gray-700 text-sm mb-4">
                        Полный план для запуска проекта с 100 тестовыми пользователями. 
                        Включает бюджет, сроки, технологии и пошаговый план действий.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="DollarSign" className="text-green-600" size={20} />
                        <span className="text-sm font-semibold text-gray-600">Бюджет</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">1.35М ₽</div>
                      <div className="text-xs text-gray-500 mt-1">Полная версия</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Calendar" className="text-blue-600" size={20} />
                        <span className="text-sm font-semibold text-gray-600">Срок</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">7 месяцев</div>
                      <div className="text-xs text-gray-500 mt-1">До запуска</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Users" className="text-purple-600" size={20} />
                        <span className="text-sm font-semibold text-gray-600">Пользователи</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">100</div>
                      <div className="text-xs text-gray-500 mt-1">Тестовых</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/launch-plan');
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Icon name="FileText" className="mr-2" size={18} />
                      Открыть полный план
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon name="Lightbulb" className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-gray-700">
                      <strong>Оптимизированная версия:</strong> ~700,000₽ за 3-4 месяца (MVP с базовым функционалом)
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="flex-1 overflow-y-auto px-6 pb-6">
              <EffectsSettings
                chamomileEnabled={chamomileEnabled}
                soundEnabled={soundEnabled}
                onChamomileChange={setChamomileEnabled}
                onSoundChange={setSoundEnabled}
              />
            </TabsContent>

            <TabsContent value="export" className="flex-1 overflow-y-auto px-6 pb-6">
              <ExportSettings
                isExporting={isExporting}
                onExport={handleExport}
              />
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 overflow-y-auto px-6 pb-6">
              <NotificationTest />
            </TabsContent>

            <TabsContent value="subscription" className="flex-1 overflow-y-auto px-6 pb-6">
              <SubscriptionSettings
                subscription={subscription}
                loadingSubscription={loadingSubscription}
                onCheckSubscription={checkSubscription}
                onCreateSubscription={createSubscription}
              />
            </TabsContent>

            <TabsContent value="account" className="flex-1 overflow-y-auto px-6 pb-6">
              <AccountSettings
                onDeleteAccount={handleDeleteAccount}
                onLogout={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

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

function NotificationTest() {
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

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Примечание:</strong> Для работы email требуются секреты YANDEX_SMTP_LOGIN и YANDEX_SMTP_PASSWORD. 
          Для SMS требуются YANDEX_CLOUD_API_KEY и YANDEX_FOLDER_ID.
        </p>
      </div>
    </div>
  );
}