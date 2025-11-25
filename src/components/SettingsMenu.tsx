import { useState } from 'react';
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
            <TabsList className="grid w-full grid-cols-6 mx-6 my-2">
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
              <TabsTrigger value="subscription" className="text-xs md:text-sm">
                <Icon name="CreditCard" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Подписка</span>
                <span className="sm:hidden">PRO</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs md:text-sm">
                <Icon name="UserCog" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Аккаунт</span>
                <span className="sm:hidden">Я</span>
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