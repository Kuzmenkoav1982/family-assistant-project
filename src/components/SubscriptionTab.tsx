import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

interface Subscription {
  has_subscription: boolean;
  plan?: string;
  status?: string;
  end_date?: string;
  auto_renew?: boolean;
}

export default function SubscriptionTab() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch(PAYMENTS_API, {
          method: 'GET',
          headers: {
            'X-Auth-Token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };

    fetchSubscription();
  }, []);

  if (subscription?.has_subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Crown" size={24} className="text-yellow-500" />
            Активная подписка
          </CardTitle>
          <CardDescription>Управление вашей подпиской</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{subscription.plan}</h3>
                <p className="text-sm text-gray-600">Активна</p>
              </div>
              <Badge className="bg-green-500">Активна</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Действует до:</span>
                <span className="font-medium">
                  {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ru-RU') : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Автопродление:</span>
                <span className="font-medium">{subscription.auto_renew ? 'Включено' : 'Выключено'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                toast({
                  title: 'В разработке',
                  description: 'Функция управления подпиской скоро будет доступна'
                });
              }}
            >
              <Icon name="Settings" className="mr-2" size={16} />
              Управление
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/pricing')}
            >
              <Icon name="ArrowUpCircle" className="mr-2" size={16} />
              Изменить план
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="CreditCard" size={24} className="text-purple-600" />
          Управление подпиской
        </CardTitle>
        <CardDescription>
          Выберите подходящий тарифный план
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 text-center mb-4">
            <Icon name="Info" className="inline mr-2" size={16} />
            Это демо-версия. Все функции доступны для ознакомления с возможностями приложения.
          </p>
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => navigate('/pricing')}
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Выбрать тариф
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
