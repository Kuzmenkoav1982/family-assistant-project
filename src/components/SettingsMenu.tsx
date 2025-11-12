import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import FamilyInviteManager from './FamilyInviteManager';

const EXPORT_API = 'https://functions.poehali.dev/6db20156-2ce6-4ba2-923b-b3e8faf8a58b';
const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Settings" size={28} />
              Настройки и управление
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="invites" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invites">
                <Icon name="Users" className="mr-2" size={16} />
                Приглашения
              </TabsTrigger>
              <TabsTrigger value="export">
                <Icon name="Download" className="mr-2" size={16} />
                Экспорт
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <Icon name="CreditCard" className="mr-2" size={16} />
                Подписка
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invites" className="space-y-4 mt-4">
              <FamilyInviteManager />
            </TabsContent>

            <TabsContent value="export" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Download" size={24} />
                    Экспорт данных семьи
                  </CardTitle>
                  <CardDescription>
                    Скачайте резервную копию всех данных вашей семьи
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-2 border-green-300">
                      <CardHeader>
                        <CardTitle className="text-lg">📊 CSV / Excel</CardTitle>
                        <CardDescription>
                          Таблица для анализа и обработки
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleExport('csv')}
                          disabled={isExporting}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {isExporting ? 'Экспорт...' : 'Скачать CSV'}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-300">
                      <CardHeader>
                        <CardTitle className="text-lg">📄 PDF</CardTitle>
                        <CardDescription>
                          Красивый отчёт для печати
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleExport('pdf')}
                          disabled={isExporting}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isExporting ? 'Экспорт...' : 'Скачать HTML'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          * Откройте HTML → Ctrl+P → Сохранить как PDF
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Info" size={18} />
                      Что включено в экспорт:
                    </h4>
                    <ul className="text-sm space-y-1 ml-6">
                      <li>• Все члены семьи с баллами и статистикой</li>
                      <li>• Полный список задач (активных и выполненных)</li>
                      <li>• Общая статистика семьи</li>
                      <li>• История активности</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Crown" size={24} className="text-yellow-600" />
                    Премиум подписка
                  </CardTitle>
                  <CardDescription>
                    Получите доступ ко всем функциям семейного органайзера
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingSubscription ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : subscription?.has_subscription ? (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-green-700 mb-2">✅ Подписка активна</h3>
                      <p className="text-sm text-gray-600 mb-1">Тариф: {subscription.plan}</p>
                      <p className="text-sm text-gray-600">
                        Действует до: {new Date(subscription.end_date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="border-2 border-blue-300">
                          <CardHeader>
                            <CardTitle>Базовый</CardTitle>
                            <div className="text-3xl font-bold text-blue-600">299₽</div>
                            <p className="text-sm text-gray-600">1 месяц</p>
                          </CardHeader>
                          <CardContent>
                            <Button
                              onClick={() => createSubscription('basic')}
                              className="w-full"
                            >
                              Оформить
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-purple-300 bg-purple-50">
                          <CardHeader>
                            <CardTitle>Стандарт</CardTitle>
                            <div className="text-3xl font-bold text-purple-600">799₽</div>
                            <p className="text-sm text-gray-600">3 месяца</p>
                            <Badge className="bg-purple-600">-20%</Badge>
                          </CardHeader>
                          <CardContent>
                            <Button
                              onClick={() => createSubscription('standard')}
                              className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                              Оформить
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-yellow-300 bg-yellow-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              Премиум <Icon name="Crown" size={18} className="text-yellow-600" />
                            </CardTitle>
                            <div className="text-3xl font-bold text-yellow-600">2499₽</div>
                            <p className="text-sm text-gray-600">12 месяцев</p>
                            <Badge className="bg-yellow-600">-30%</Badge>
                          </CardHeader>
                          <CardContent>
                            <Button
                              onClick={() => createSubscription('premium')}
                              className="w-full bg-yellow-600 hover:bg-yellow-700"
                            >
                              Оформить
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">🎁 Что входит в подписку:</h4>
                        <ul className="text-sm space-y-1 ml-6">
                          <li>• Неограниченное количество задач</li>
                          <li>• Интеграция с Алисой</li>
                          <li>• Экспорт данных</li>
                          <li>• Приоритетная поддержка</li>
                          <li>• Все будущие функции</li>
                        </ul>
                      </div>
                    </>
                  )}

                  <Button
                    onClick={checkSubscription}
                    variant="outline"
                    className="w-full"
                  >
                    <Icon name="RefreshCw" className="mr-2" size={16} />
                    Обновить статус подписки
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}