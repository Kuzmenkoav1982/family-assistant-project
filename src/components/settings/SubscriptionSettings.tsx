import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SubscriptionSettingsProps {
  subscription: any;
  loadingSubscription: boolean;
  onCheckSubscription: () => Promise<void>;
  onCreateSubscription: (planType: string) => Promise<void>;
}

export default function SubscriptionSettings({
  subscription,
  loadingSubscription,
  onCheckSubscription,
  onCreateSubscription
}: SubscriptionSettingsProps) {
  useEffect(() => {
    onCheckSubscription();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="CreditCard" size={24} />
          Управление подпиской
        </CardTitle>
        <CardDescription>
          Выберите подходящий тарифный план
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingSubscription ? (
          <div className="text-center py-8">
            <Icon name="Loader" className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Загрузка информации о подписке...</p>
          </div>
        ) : subscription?.active ? (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Icon name="Check" className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Подписка активна</h3>
                    <p className="text-sm text-green-700">План: {subscription.plan_type}</p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white text-lg px-4 py-2">PRO</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Действует до</p>
                  <p className="font-semibold text-green-900">
                    {new Date(subscription.end_date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Статус</p>
                  <p className="font-semibold text-green-900">
                    {subscription.auto_renewal ? 'Автопродление' : 'Разовая оплата'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-lg border-2 border-purple-200">
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-lg px-4 py-2">
                  PRO версия - ДЕМО
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Все функции доступны бесплатно</h3>
                <p className="text-gray-600">Это демонстрационная версия приложения</p>
              </div>
              
              <ul className="space-y-3 mb-6 max-w-2xl mx-auto">
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Безлимитные задачи</span>
                    <p className="text-sm text-gray-600">Создавайте неограниченное количество задач для семьи</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Неограниченное число членов семьи</span>
                    <p className="text-sm text-gray-600">Добавьте всех членов семьи без ограничений</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Семейный календарь и события</span>
                    <p className="text-sm text-gray-600">Планируйте события, дни рождения, праздники</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Голосование за меню</span>
                    <p className="text-sm text-gray-600">Семья решает вместе что готовить</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Рецепты и списки покупок</span>
                    <p className="text-sm text-gray-600">Храните рецепты и планируйте покупки</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Финансовый учет семьи</span>
                    <p className="text-sm text-gray-600">Отслеживайте доходы, расходы и бюджеты</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Здоровье семьи</span>
                    <p className="text-sm text-gray-600">Медицинские записи, лекарства, врачи</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name="Check" className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold">Экспорт данных</span>
                    <p className="text-sm text-gray-600">Экспорт в CSV и PDF форматы</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 text-center">
                <Icon name="Info" className="inline mr-2" size={16} />
                Это демо-версия. Все функции доступны для ознакомления с возможностями приложения.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}