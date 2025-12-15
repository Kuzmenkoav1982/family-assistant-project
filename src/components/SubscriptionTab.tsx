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

const plans = [
  {
    id: 'basic',
    name: 'Базовый',
    price: '₽299',
    period: '/ 1 месяц',
    pricePerMonth: '₽299/мес',
    description: 'Гибкая оплата',
    features: [
      'До 5 членов семьи',
      'Основные функции',
      'Календарь событий',
      'Списки покупок',
      'Финансовый учет',
      'Техподдержка'
    ]
  },
  {
    id: 'standard',
    name: 'Семейный',
    price: '₽799',
    period: '/ 3 месяца',
    pricePerMonth: '₽266/мес',
    popular: true,
    description: 'Все функции Базового',
    features: [
      'До 10 членов семьи',
      'Все функции Базового',
      'Рецепты и меню',
      'Голосования',
      'Здоровье детей',
      'Медицинские записи',
      'Приоритетная поддержка',
      'Экономия 20%'
    ]
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: '₽2499',
    period: '/ 12 месяцев',
    pricePerMonth: '₽208/мес',
    description: 'Все функции Семейного',
    features: [
      'Неограниченное число членов',
      'Все функции Семейного',
      'ИИ-помощник',
      'Путешествия и поездки',
      'Аналитика и отчеты',
      'Экспорт данных',
      'Семейное древо',
      'VIP поддержка 24/7',
      'Экономия 50%'
    ]
  }
];

export default function SubscriptionTab() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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

  const handleSubscribe = async (planId: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт для оформления подписки',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'create',
          plan_type: planId,
          return_url: window.location.origin + '/settings'
        })
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast({
          title: 'Ошибка создания платежа',
          description: data.error || 'Попробуйте позже',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка оформления платежа: HTTP Error 401',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CreditCard" size={24} className="text-purple-600" />
            Подписка на "Наша семья"
          </CardTitle>
          <CardDescription>
            Выберите подходящий тариф и начните организовывать жизнь вашей семьи
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all ${
              plan.popular
                ? 'border-purple-500 border-2 shadow-xl'
                : 'hover:shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  🔥 Популярный
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-purple-600">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.pricePerMonth}</p>
              </div>
              <CardDescription className="pt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading && selectedPlan === plan.id}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : ''
                }`}
              >
                {loading && selectedPlan === plan.id ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    Загрузка...
                  </>
                ) : (
                  <>
                    Выбрать тариф
                    <Icon name="ArrowRight" className="ml-2" size={16} />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="HelpCircle" size={20} />
            Часто задаваемые вопросы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Можно ли отменить подписку?</h4>
            <p className="text-sm text-gray-600">
              Да, вы можете отменить подписку в любой момент. Доступ сохранится до конца оплаченного периода.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Как изменить тариф?</h4>
            <p className="text-sm text-gray-600">
              Вы можете перейти на другой тариф в любое время. Разница будет пересчитана пропорционально.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Какие способы оплаты доступны?</h4>
            <p className="text-sm text-gray-600">
              Мы принимаем банковские карты (Visa, MasterCard, МИР) через ЮKassa.
            </p>
          </div>
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => window.open('https://t.me/your_support', '_blank')}
          >
            <Icon name="MessageCircle" className="mr-2" size={16} />
            Остались вопросы? Напишите в поддержку
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
