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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all">
                <div className="text-center mb-4">
                  <Badge variant="outline" className="mb-3">МЕСЯЧНАЯ</Badge>
                  <div className="text-4xl font-bold text-blue-900 mb-2">399₽</div>
                  <p className="text-sm text-gray-600">в месяц</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">Безлимитные задачи</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">Неограниченное число членов семьи</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">Экспорт в CSV и PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">Приоритетная поддержка</span>
                  </li>
                </ul>
                <Button
                  onClick={() => onCreateSubscription('monthly')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Icon name="CreditCard" className="mr-2" size={16} />
                  Оформить
                </Button>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 hover:border-purple-500 transition-all relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                  ВЫГОДНО -33%
                </Badge>
                <div className="text-center mb-4 mt-2">
                  <Badge variant="outline" className="mb-3">ГОДОВАЯ</Badge>
                  <div className="text-4xl font-bold text-purple-900 mb-2">3190₽</div>
                  <p className="text-sm text-gray-600">в год (266₽/мес)</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">Всё из месячной подписки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm font-semibold text-purple-900">Скидка 33%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">Ранний доступ к новым функциям</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="text-green-500 mt-0.5" size={18} />
                    <span className="text-sm">VIP поддержка 24/7</span>
                  </li>
                </ul>
                <Button
                  onClick={() => onCreateSubscription('yearly')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Icon name="Sparkles" className="mr-2" size={16} />
                  Оформить со скидкой
                </Button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <Icon name="Info" className="inline mr-2" size={16} />
                Первые 14 дней — бесплатно! Отмените в любой момент без объяснений.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
