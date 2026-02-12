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
                  <Icon name="CheckCircle" className="text-green-500" size={32} />
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Активная подписка</h3>
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
          <div className="text-center py-8">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => window.location.href = '/pricing'}
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Выбрать тариф
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}