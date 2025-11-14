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
const AUTH_API = 'https://functions.poehali.dev/b9b956c8-e2a6-4c20-aef8-b8422e8cb3b0';

export default function SettingsMenu() {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
            <TabsList className="grid w-full grid-cols-5 mx-6 my-2">
              <TabsTrigger value="invites" className="text-xs md:text-sm">
                <Icon name="Users" className="mr-1 md:mr-2" size={14} />
                <span className="hidden sm:inline">Приглашения</span>
                <span className="sm:hidden">Семья</span>
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

            <TabsContent value="effects" className="flex-1 overflow-y-auto px-6 pb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Sparkles" size={24} />
                    Интерактивные эффекты
                  </CardTitle>
                  <CardDescription>
                    Настройте визуальные эффекты и звуки
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🌼</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Ромашки при клике</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Красивая анимация ромашек при каждом клике по экрану
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">🌼 8 цветов</Badge>
                          <Badge variant="outline" className="text-xs">✨ Искорки</Badge>
                          <Badge variant="outline" className="text-xs">🎯 Комбо эффект</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const newValue = !chamomileEnabled;
                        setChamomileEnabled(newValue);
                        localStorage.setItem('chamomileEnabled', String(newValue));
                        window.dispatchEvent(new CustomEvent('chamomileToggle', { detail: newValue }));
                      }}
                      variant={chamomileEnabled ? 'default' : 'outline'}
                      size="lg"
                    >
                      {chamomileEnabled ? '✅ Включено' : '❌ Выключено'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🔊</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Звуковые эффекты</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Мелодичные звуки при появлении ромашек
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">🎵 Уникальные ноты</Badge>
                          <Badge variant="outline" className="text-xs">🎶 Комбо мелодии</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const newValue = !soundEnabled;
                        setSoundEnabled(newValue);
                        localStorage.setItem('soundEnabled', String(newValue));
                        window.dispatchEvent(new CustomEvent('soundToggle', { detail: newValue }));
                      }}
                      variant={soundEnabled ? 'default' : 'outline'}
                      size="lg"
                    >
                      {soundEnabled ? '🔊 Включено' : '🔇 Выключено'}
                    </Button>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Zap" size={18} className="text-yellow-600" />
                      Как работает комбо:
                    </h4>
                    <ul className="text-sm space-y-1 ml-6">
                      <li>• Кликайте быстро (менее 0.5 сек между кликами)</li>
                      <li>• Ромашки становятся больше с каждым кликом</li>
                      <li>• Звуки становятся выше и интереснее</li>
                      <li>• Максимум x10 комбо!</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Palette" size={18} className="text-purple-600" />
                      Цвета ромашек:
                    </h4>
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white border-4 border-yellow-400"></div>
                        <span className="text-xs">Классика</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-pink-200 border-4 border-pink-500"></div>
                        <span className="text-xs">Розовая</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-purple-200 border-4 border-purple-600"></div>
                        <span className="text-xs">Фиолетовая</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-blue-200 border-4 border-blue-500"></div>
                        <span className="text-xs">Голубая</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-orange-200 border-4 border-orange-500"></div>
                        <span className="text-xs">Персиковая</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-yellow-200 border-4 border-yellow-500"></div>
                        <span className="text-xs">Золотая</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-green-200 border-4 border-green-500"></div>
                        <span className="text-xs">Мятная</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-pink-100 border-4 border-pink-300"></div>
                        <span className="text-xs">Нежная</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="flex-1 overflow-y-auto px-6 pb-6">
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

            <TabsContent value="subscription" className="flex-1 overflow-y-auto px-6 pb-6">
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
                            <div className="text-2xl font-bold text-blue-600">В разработке</div>
                            <p className="text-sm text-gray-600">1 месяц</p>
                          </CardHeader>
                          <CardContent>
                            <Button
                              disabled
                              className="w-full"
                            >
                              Скоро
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-purple-300 bg-purple-50">
                          <CardHeader>
                            <CardTitle>Стандарт</CardTitle>
                            <div className="text-2xl font-bold text-purple-600">В разработке</div>
                            <p className="text-sm text-gray-600">3 месяца</p>
                          </CardHeader>
                          <CardContent>
                            <Button
                              disabled
                              className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                              Скоро
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-yellow-300 bg-yellow-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              Премиум <Icon name="Crown" size={18} className="text-yellow-600" />
                            </CardTitle>
                            <div className="text-2xl font-bold text-yellow-600">В разработке</div>
                            <p className="text-sm text-gray-600">12 месяцев</p>
                          </CardHeader>
                          <CardContent>
                            <Button
                              disabled
                              className="w-full bg-yellow-600 hover:bg-yellow-700"
                            >
                              Скоро
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

            <TabsContent value="account" className="flex-1 overflow-y-auto px-6 pb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="UserCog" size={24} />
                    Управление аккаунтом
                  </CardTitle>
                  <CardDescription>
                    Настройки вашего профиля и удаление данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">⚠️</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-700 mb-2">Удаление аккаунта</h3>
                        <p className="text-sm text-gray-700 mb-4">
                          После удаления аккаунта:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4">
                          <li>• Ваш телефон станет доступен для регистрации</li>
                          <li>• Все ваши данные будут безвозвратно удалены</li>
                          <li>• Если вы единственный в семье - семья будет удалена</li>
                          <li>• Если в семье есть другие члены - вы будете исключены</li>
                          <li>• Действие нельзя отменить</li>
                        </ul>
                        
                        {!showDeleteConfirm ? (
                          <Button
                            onClick={() => setShowDeleteConfirm(true)}
                            variant="destructive"
                            className="w-full"
                          >
                            <Icon name="Trash2" className="mr-2" size={16} />
                            Удалить аккаунт
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-white border-2 border-red-500 rounded-lg p-4">
                              <p className="text-sm font-bold text-red-700 mb-2">
                                ⚠️ Вы уверены? Это действие необратимо!
                              </p>
                              <p className="text-xs text-gray-600">
                                Все ваши данные, задачи, фото и записи будут удалены навсегда.
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                variant="outline"
                                className="flex-1"
                              >
                                Отмена
                              </Button>
                              <Button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                variant="destructive"
                                className="flex-1"
                              >
                                {isDeleting ? (
                                  <>
                                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" size={16} />
                                    Удаление...
                                  </>
                                ) : (
                                  <>
                                    <Icon name="Trash2" className="mr-2" size={16} />
                                    Да, удалить навсегда
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}