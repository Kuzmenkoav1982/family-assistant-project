import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { sendMetrikaGoal, METRIKA_GOALS } from '@/utils/metrika';
import PricingHeader from '@/components/pricing/PricingHeader';
import SubscriptionsTab from '@/components/pricing/SubscriptionsTab';
import StorageDonationsTabs from '@/components/pricing/StorageDonationsTabs';
import PricingDialogs from '@/components/pricing/PricingDialogs';

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';
// PLANS_API временно отключен (функция не задеплоена)
// const PLANS_API = func2url['subscription-plans'] || '';

const subscriptionPlans = [
  {
    id: 'free_2026',
    name: 'Free',
    price: 0,
    period: 'навсегда',
    popular: false,
    color: 'from-gray-500 to-gray-600',
    features: [
      '✅ 5 AI-запросов в день',
      '✅ До 10 фото',
      '✅ До 2 членов семьи',
      '✅ Календарь и задачи',
      '✅ Списки покупок',
      '🚫 Безлимитные AI-запросы',
      '🚫 Безлимитные фото',
      '🚫 Безлимитные члены семьи'
    ],
    condition: '🤝 Условие: помогайте нам развивать платформу своими идеями и предложениями!'
  },
  {
    id: 'premium_1m',
    name: 'Premium 1 месяц',
    price: 299,
    period: '1 месяц',
    popular: false,
    color: 'from-blue-500 to-cyan-600',
    features: [
      '✅ Безлимитные AI-запросы',
      '✅ Безлимитные фото',
      '✅ Безлимитные члены семьи',
      '✅ Семейный психолог',
      '✅ Путешествия и маршруты',
      '✅ Аналитика и статистика'
    ]
  },
  {
    id: 'premium_3m',
    name: 'Premium 3 месяца',
    price: 799,
    period: '3 месяца',
    popular: true,
    color: 'from-purple-500 to-indigo-600',
    savings: 'Экономия 11%!',
    features: [
      '✅ Безлимитные AI-запросы',
      '✅ Безлимитные фото',
      '✅ Безлимитные члены семьи',
      '✅ Семейный психолог',
      '✅ Путешествия и маршруты',
      '✅ Аналитика и статистика',
      '💎 Выгода 98₽ за 3 месяца'
    ]
  },
  {
    id: 'premium_6m',
    name: 'Premium 6 месяцев',
    price: 1499,
    period: '6 месяцев',
    popular: false,
    color: 'from-pink-500 to-rose-600',
    savings: 'Экономия 17%!',
    features: [
      '✅ Безлимитные AI-запросы',
      '✅ Безлимитные фото',
      '✅ Безлимитные члены семьи',
      '✅ Семейный психолог',
      '✅ Путешествия и маршруты',
      '✅ Аналитика и статистика',
      '💎 Выгода 295₽ за 6 месяцев'
    ]
  },
  {
    id: 'premium_12m',
    name: 'Premium 12 месяцев',
    price: 2699,
    period: '12 месяцев',
    popular: false,
    color: 'from-yellow-500 to-orange-600',
    savings: 'Экономия 25%!',
    features: [
      '✅ Безлимитные AI-запросы',
      '✅ Безлимитные фото',
      '✅ Безлимитные члены семьи',
      '✅ Семейный психолог',
      '✅ Путешествия и маршруты',
      '✅ Аналитика и статистика',
      '💎 Выгода 889₽ за 12 месяцев'
    ]
  }
];

const storageOptions = [
  { id: 'storage_5gb', name: '5 ГБ', price: 99, storage: '5 ГБ' },
  { id: 'storage_20gb', name: '20 ГБ', price: 249, storage: '20 ГБ', popular: true },
  { id: 'storage_50gb', name: '50 ГБ', price: 499, storage: '50 ГБ' },
  { id: 'storage_100gb', name: '100 ГБ', price: 899, storage: '100 ГБ' }
];

const donationPresets = [
  { id: 'espresso', name: '☕ Эспрессо', amount: 50, emoji: '☕' },
  { id: 'cappuccino', name: '☕ Капучино', amount: 150, emoji: '☕' },
  { id: 'latte', name: '☕ Большой латте', amount: 300, emoji: '☕' },
  { id: 'friend', name: '💚 Друг проекта', amount: 500, emoji: '💚' },
  { id: 'partner', name: '🤝 Партнёр развития', amount: 1000, emoji: '🤝' },
  { id: 'investor', name: '🏆 Инвестор', amount: 3000, emoji: '🏆' }
];

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [customDonation, setCustomDonation] = useState<string>('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentData, setPaymentData] = useState<any>(null);
   
  const [plans, setPlans] = useState(subscriptionPlans);
   
  const [plansLoading, setPlansLoading] = useState(true);
   
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'sbp'>('card');
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'create' | 'extend' | 'upgrade'>('create');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('premium_1m');

  useEffect(() => {
    loadPlansFromDB();
  }, []);

  const loadPlansFromDB = async () => {
    // ВРЕМЕННО: используем статичные данные, пока subscription-plans не задеплоена
    console.log('Using static subscription plans data');
    setPlansLoading(false);

    // TODO: Раскомментировать когда subscription-plans задеплоена
    /*
    try {
      const response = await fetch(`${PLANS_API}?action=all&public=true`);
      if (response.ok) {
        const data = await response.json();
        const mappedPlans = data.plans
          .filter((p: any) => p.visible)
          .map((p: any) => {
            const planFeatures = p.features.map((f: any) => {
              const emoji = f.enabled ? '✅' : '🚫';
              return `${emoji} ${f.name}`;
            });
            if (p.id === 'free' && p.description) {
              planFeatures.push(`🤝 Условие: ${p.description}`);
            }
            return {
              id: p.id,
              name: p.name,
              price: parseFloat(p.price),
              period: p.period,
              popular: p.popular,
              color: p.popular ? 'from-purple-500 to-indigo-600' : 'from-gray-500 to-gray-600',
              features: planFeatures,
              savings: p.discount ? `Экономия ${p.discount}%!` : undefined,
              condition: p.id === 'free' ? p.description : undefined
            };
          });
        if (mappedPlans.length > 0) {
          setPlans(mappedPlans);
        }
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setPlansLoading(false);
    }
    */
  };

  // Проверка статуса платежа при возврате
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      // Отправка события в Яндекс.Метрику
      sendMetrikaGoal(METRIKA_GOALS.PAYMENT_SUCCESS);

      toast({
        title: '🎉 Оплата успешна!',
        description: 'Ваша подписка активирована. Спасибо за поддержку!',
      });
      // Очищаем параметры из URL
      window.history.replaceState({}, '', '/pricing');
    }
  }, [searchParams, toast]);

  // Отправка события просмотра страницы тарифов
  useEffect(() => {
    sendMetrikaGoal(METRIKA_GOALS.VIEW_PRICING);
  }, []);

  // Загрузка текущей подписки
  useEffect(() => {
    const loadSubscription = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch(PAYMENTS_API, {
          method: 'GET',
          headers: {
            'X-Auth-Token': token
          }
        });

        const data = await response.json();
        if (data.has_subscription) {
          setCurrentSubscription(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки подписки:', error);
      }
    };

    loadSubscription();
  }, []);

  const showPaymentDialog = (planId: string, action: 'create' | 'extend' | 'upgrade' = 'create') => {
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

    if (planId === 'free' || planId === 'free_2026') {
      toast({
        title: 'Бесплатный план',
        description: 'Вы уже используете бесплатный тариф! Помогайте нам развиваться — предлагайте новые идеи в разделе "Предложения".',
      });
      return;
    }

    setPendingPlanId(planId);
    setPendingAction(action);
    setShowPaymentMethodDialog(true);
  };

  const handleSubscribe = showPaymentDialog;

  const proceedWithPayment = async (paymentMethod: 'card' | 'sbp') => {
    if (!pendingPlanId) return;

    const token = localStorage.getItem('authToken');
    setLoading(pendingPlanId);
    setShowPaymentMethodDialog(false);

    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: pendingAction,
          plan_type: pendingPlanId,
          payment_method: paymentMethod === 'sbp' ? 'sbp' : undefined,
          return_url: window.location.origin + '/pricing?status=success'
        })
      });

      const data = await response.json();

      // Проверка активной подписки
      if (response.status === 409 && data.error === 'active_subscription_exists') {
        const upgradeAvailable = data.upgrade_available;
        const extendAvailable = data.extend_available;

        toast({
          title: '⚠️ У семьи уже есть активная подписка',
          description: (
            <div className="space-y-2 mt-2">
              <p>📦 Тариф: <strong>{data.current_subscription.plan_name}</strong></p>
              <p>📅 Действует до: <strong>{new Date(data.current_subscription.end_date).toLocaleDateString()}</strong></p>
              <p>👤 Купил: <strong>{data.current_subscription.buyer_name || 'Член семьи'}</strong></p>
              {extendAvailable && (
                <Button
                  size="sm"
                  onClick={() => showPaymentDialog(pendingPlanId || '', 'extend')}
                  className="w-full mt-2"
                >
                  Продлить на месяц
                </Button>
              )}
              {upgradeAvailable && (
                <Button
                  size="sm"
                  onClick={() => showPaymentDialog('full', 'upgrade')}
                  className="w-full mt-2"
                >
                  Перейти на "Полный пакет"
                </Button>
              )}
            </div>
          ),
        });
        setLoading(null);
        return;
      }

      if (data.success && data.payment_url) {
        // Отправка события в Яндекс.Метрику
        sendMetrikaGoal(METRIKA_GOALS.CLICK_PREMIUM, { plan: pendingPlanId, action: pendingAction });
        window.location.href = data.payment_url;
      } else if (data.error) {
        toast({
          title: 'Ошибка оформления',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDonation = async (presetId: string, amount: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт для поддержки проекта',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setLoading(presetId);

    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'create_donation',
          amount: amount,
          return_url: window.location.origin + '/pricing?status=success'
        })
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else if (data.error) {
        toast({
          title: 'Ошибка оформления',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <SEOHead
        title="Тарифы"
        description="Тарифы платформы «Наша Семья». Бесплатный план и подписка с расширенными возможностями для всей семьи."
        path="/pricing"
      />
      <div className="container mx-auto px-4 py-12">
        <PricingHeader currentSubscription={currentSubscription} />

        <Tabs defaultValue="subscriptions" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 gap-1">
            <TabsTrigger value="subscriptions" className="text-[11px] sm:text-sm px-1 sm:px-3">📦 Подписки</TabsTrigger>
            <TabsTrigger value="storage" className="text-[11px] sm:text-sm px-1 sm:px-3">💾 Хранилище</TabsTrigger>
            <TabsTrigger value="donations" className="text-[11px] sm:text-sm px-1 sm:px-3">💚 Поддержка</TabsTrigger>
          </TabsList>

          {/* Подписки */}
          <TabsContent value="subscriptions">
            <SubscriptionsTab
              currentSubscription={currentSubscription}
              loading={loading}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              handleSubscribe={handleSubscribe}
            />
          </TabsContent>

          <StorageDonationsTabs
            storageOptions={storageOptions}
            donationPresets={donationPresets}
            loading={loading}
            customDonation={customDonation}
            setCustomDonation={setCustomDonation}
            handleSubscribe={handleSubscribe}
            handleDonation={handleDonation}
            toast={toast}
          />
        </Tabs>

        {/* Footer Info */}
        <Card className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">💡 Хочешь предложить идею?</h3>
            <p className="text-gray-600 mb-6">
              Твои предложения помогают нам развиваться! Добавь свою идею в "Доску предложений".
            </p>
            <Button
              onClick={() => navigate('/suggestions')}
              className="gap-2"
            >
              <Icon name="Lightbulb" size={18} />
              Предложить идею
            </Button>
          </CardContent>
        </Card>
      </div>

      <PricingDialogs
        showPaymentMethodDialog={showPaymentMethodDialog}
        setShowPaymentMethodDialog={setShowPaymentMethodDialog}
        proceedWithPayment={proceedWithPayment}
        paymentDialog={paymentDialog}
        setPaymentDialog={setPaymentDialog}
        paymentData={paymentData}
        toast={toast}
      />
    </div>
  );
}
