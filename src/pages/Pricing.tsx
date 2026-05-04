import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { sendMetrikaGoal, METRIKA_GOALS } from '@/utils/metrika';
import func2url from '@/config/func2url';

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
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [customDonation, setCustomDonation] = useState<string>('');
  const [paymentDialog, setPaymentDialog] = useState(false);
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
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="Home" size={18} />
            На главную
          </Button>
        </div>

        {/* Блок статуса активной подписки */}
        {currentSubscription && currentSubscription.has_subscription && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Icon name="Check" size={24} />
                Активная подписка
              </CardTitle>
              <CardDescription className="text-green-600">
                У вас есть активная подписка на семейный органайзер
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon name="Package" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Тариф</p>
                    <p className="font-semibold text-gray-900">{currentSubscription.plan_name || 'AI-Помощник'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon name="Calendar" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Действует до</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(currentSubscription.end_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Icon name="User" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Владелец</p>
                    <p className="font-semibold text-gray-900">{currentSubscription.buyer_name || 'Вы'}</p>
                  </div>
                </div>
              </div>
              {currentSubscription.auto_renew && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100/50 px-3 py-2 rounded-lg">
                  <Icon name="RefreshCw" size={16} />
                  Автоматическое продление включено
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-6 py-2">
            🏠 Наша семья — платформа для вас
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Тарифы и поддержка
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы развиваемся благодаря вашей поддержке и обратной связи!
            <br />
            <span className="text-sm text-purple-600 font-semibold mt-2 inline-block">
              Цель — развитие платформы, а не высокие цены 💚
            </span>
          </p>
        </div>

        <Tabs defaultValue="subscriptions" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 gap-1">
            <TabsTrigger value="subscriptions" className="text-[11px] sm:text-sm px-1 sm:px-3">📦 Подписки</TabsTrigger>
            <TabsTrigger value="storage" className="text-[11px] sm:text-sm px-1 sm:px-3">💾 Хранилище</TabsTrigger>
            <TabsTrigger value="donations" className="text-[11px] sm:text-sm px-1 sm:px-3">💚 Поддержка</TabsTrigger>
          </TabsList>

          {/* Подписки */}
          <TabsContent value="subscriptions">
            {/* Инструкция */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Info" size={20} className="text-blue-600" />
                  💡 Как работают подписки?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <Icon name="Users" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Подписка на всю семью:</strong> Любой член семьи может купить подписку, и она распространяется на всех участников семьи</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="ShieldCheck" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Защита от дублирования:</strong> Если у семьи уже есть активная подписка, вы увидите уведомление с деталями и вариантами продления/апгрейда</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="CalendarPlus" size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Продление:</strong> Можно продлить подписку на месяц в любой момент — новый срок добавится к текущему</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="Eye" size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Прозрачность:</strong> Видно кто купил подписку и когда она истекает</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Текущая подписка */}
            {currentSubscription && currentSubscription.has_subscription && (
              <Card className="mb-8 border-2 border-green-500 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Check" size={24} className="text-green-600" />
                    Активная подписка
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Тариф</p>
                      <p className="text-lg font-semibold">{currentSubscription.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Осталось дней</p>
                      <p className="text-lg font-semibold text-orange-600">{currentSubscription.days_left}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Действует до</p>
                      <p className="text-base font-medium">
                        {new Date(currentSubscription.end_date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {currentSubscription.buyer_name && (
                      <div>
                        <p className="text-sm text-gray-600">Оплатил</p>
                        <p className="text-base font-medium">{currentSubscription.buyer_name}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-3 border-t">
                    <Button 
                      onClick={() => handleSubscribe(currentSubscription.plan, 'extend')}
                      disabled={loading === currentSubscription.plan}
                      variant="outline"
                      className="flex-1"
                    >
                      {loading === currentSubscription.plan ? (
                        <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                      ) : (
                        <Icon name="CalendarPlus" size={16} className="mr-2" />
                      )}
                      Продлить на месяц
                    </Button>
                    {currentSubscription.plan === 'ai_assistant' && (
                      <Button 
                        onClick={() => handleSubscribe('full', 'upgrade')}
                        disabled={loading === 'full'}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600"
                      >
                        {loading === 'full' ? (
                          <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                        ) : (
                          <Icon name="TrendingUp" size={16} className="mr-2" />
                        )}
                        Апгрейд
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free план */}
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl mb-3">🆓</div>
                  <CardTitle>Free</CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">0₽</span>
                    <span className="text-gray-500"> / навсегда</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ 5 AI-запросов в день</li>
                    <li>✅ До 10 фото</li>
                    <li>✅ До 2 членов семьи</li>
                    <li>✅ Календарь и задачи</li>
                    <li>✅ Списки покупок</li>
                    <li className="text-gray-400">🚫 Безлимитные AI-запросы</li>
                    <li className="text-gray-400">🚫 Безлимитные фото</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" disabled>
                    {currentSubscription?.has_subscription ? 'Бесплатный' : 'Текущий план'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium план с переключателем периода */}
              <Card className="relative border-purple-500 border-2 shadow-xl">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  🔥 Premium
                </Badge>
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl mb-3">👑</div>
                  <CardTitle>Premium</CardTitle>

                  {/* Переключатель периода */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      { id: 'premium_1m', label: '1 мес', price: 299, perMonth: 299 },
                      { id: 'premium_3m', label: '3 мес', price: 799, perMonth: 266, save: '11%' },
                      { id: 'premium_6m', label: '6 мес', price: 1499, perMonth: 250, save: '17%' },
                      { id: 'premium_12m', label: '12 мес', price: 2699, perMonth: 225, save: '25%' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPeriod(p.id)}
                        className={`relative rounded-lg border-2 p-2 text-center transition-all ${
                          selectedPeriod === p.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        {p.save && (
                          <span className="absolute -top-2 right-1 text-[10px] bg-green-500 text-white px-1.5 rounded-full font-medium">
                            -{p.save}
                          </span>
                        )}
                        <div className="font-bold text-sm">{p.label}</div>
                        <div className="text-lg font-bold text-purple-600">{p.price}₽</div>
                        <div className="text-[10px] text-gray-500">{p.perMonth}₽/мес</div>
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Безлимитные AI-запросы</li>
                    <li>✅ Безлимитные фото</li>
                    <li>✅ Безлимитные члены семьи</li>
                    <li>✅ Семейный психолог</li>
                    <li>✅ Путешествия и маршруты</li>
                    <li>✅ Аналитика и статистика</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {(() => {
                    const hasSub = currentSubscription?.has_subscription;
                    const isPremium = hasSub && currentSubscription?.plan?.startsWith('premium_');
                    
                    if (hasSub && isPremium) {
                      return (
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                          onClick={() => handleSubscribe(selectedPeriod, 'extend')}
                          disabled={loading === selectedPeriod}
                        >
                          {loading === selectedPeriod ? (
                            <Icon name="Loader2" className="animate-spin" size={16} />
                          ) : (
                            <>
                              <Icon name="CalendarPlus" size={16} className="mr-1" />
                              Продлить подписку
                            </>
                          )}
                        </Button>
                      );
                    }
                    
                    return (
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                        onClick={() => handleSubscribe(selectedPeriod)}
                        disabled={loading === selectedPeriod}
                      >
                        {loading === selectedPeriod ? (
                          <Icon name="Loader2" className="animate-spin" size={16} />
                        ) : 'Подключить Premium'}
                      </Button>
                    );
                  })()}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Хранилище */}
          <TabsContent value="storage">
            <div className="grid md:grid-cols-4 gap-6">
              {storageOptions.map((option) => (
                <Card key={option.id} className={option.popular ? 'border-blue-500 border-2' : ''}>
                  {option.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                      👍 Выбор пользователей
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl mb-2">
                      💾
                    </div>
                    <CardTitle>{option.storage}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{option.price}₽</span>
                      <span className="text-gray-500">/мес</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li>📷 Фото и видео</li>
                      <li>📄 Документы</li>
                      <li>🔒 Резервное копирование</li>
                      <li>📱 Синхронизация устройств</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleSubscribe(option.id)}
                      disabled={loading === option.id}
                    >
                      {loading === option.id ? (
                        <Icon name="Loader2" className="animate-spin" size={16} />
                      ) : (
                        'Подключить'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Поддержка платформы */}
          <TabsContent value="donations">
            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">💚 Поддержи развитие платформы</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Все средства идут на добавление новых функций, улучшение скорости и оплату серверов.
                  <br />
                  <span className="text-purple-600 font-semibold">Твои идеи делают нашу платформу лучше!</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {donationPresets.map((preset) => (
                <Card key={preset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4">{preset.emoji}</div>
                    <CardTitle>{preset.name}</CardTitle>
                    <div className="text-3xl font-bold text-purple-600 mt-2">
                      {preset.amount}₽
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      onClick={() => handleDonation(preset.id, preset.amount)}
                      disabled={loading === preset.id}
                    >
                      {loading === preset.id ? (
                        <Icon name="Loader2" className="animate-spin" size={16} />
                      ) : (
                        'Угостить Домового'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>💰 Своя сумма</CardTitle>
                <CardDescription>Укажите любую сумму от 50₽</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input 
                    type="number"
                    min="50"
                    placeholder="Сумма (мин. 50₽)"
                    value={customDonation}
                    onChange={(e) => setCustomDonation(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      const amount = parseInt(customDonation);
                      if (amount >= 50) {
                        handleDonation('custom', amount);
                      } else {
                        toast({
                          title: 'Минимальная сумма — 50₽',
                          variant: 'destructive'
                        });
                      }
                    }}
                    disabled={!customDonation || parseInt(customDonation) < 50}
                  >
                    Отправить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Выберите способ оплаты</DialogTitle>
            <DialogDescription className="text-center">
              Как вам удобнее оплатить подписку?
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-3">
            <Button
              onClick={() => proceedWithPayment('sbp')}
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              variant="outline"
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="text-3xl shrink-0">📱</div>
                <div className="min-w-0 text-left">
                  <div className="font-bold text-base leading-tight">СБП</div>
                  <div className="text-sm text-muted-foreground">Выберите любой свой банк</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => proceedWithPayment('card')}
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
              variant="outline"
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="text-3xl shrink-0">💳</div>
                <div className="min-w-0 text-left">
                  <div className="font-bold text-base leading-tight">Банковская карта</div>
                  <div className="text-sm text-muted-foreground">Visa, MasterCard, МИР</div>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog with QR Code */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {paymentData?.type === 'donation' ? '💚 Оплата доната' : '💳 Оплата подписки'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {paymentData?.plan} • {paymentData?.amount}₽
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code - главный элемент */}
            {paymentData?.qr_image && (
              <div className="flex flex-col items-center">
                <a 
                  href={paymentData.qr_image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white p-4 rounded-xl shadow-lg border-4 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer"
                >
                  <img 
                    src="https://cdn.poehali.dev/files/Т-Банк код.JPG"
                    alt="QR код для оплаты"
                    className="w-64 h-64 object-contain"
                  />
                </a>
                <p className="text-sm text-gray-600 mt-3 text-center">
                  📱 Отсканируйте QR-код через приложение {paymentData?.bank === 'tbank' ? 'Т-Банк' : 'СберБанк'}
                </p>
              </div>
            )}

            {/* Простая инструкция */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
              <p className="font-semibold mb-2 text-center">✨ Как оплатить:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">1.</span>
                  <span>Откройте приложение {paymentData?.bank === 'tbank' ? 'Т-Банк' : 'СберБанк'} и отсканируйте QR-код</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">2.</span>
                  <span>Подтвердите платёж — подписка активируется автоматически в течение 1-2 часов</span>
                </li>
              </ol>
            </div>

            {/* Кнопка копирования реквизитов */}
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `
Получатель: ${paymentData?.instructions?.recipient}
Счёт: ${paymentData?.instructions?.recipient_account}
Банк: ${paymentData?.instructions?.bank_name}
БИК: ${paymentData?.instructions?.bik}
ИНН: ${paymentData?.instructions?.recipient_inn}
Назначение: ${paymentData?.purpose}
                  `.trim();
                  navigator.clipboard.writeText(text);
                  toast({
                    title: '✅ Скопировано!',
                    description: 'Реквизиты скопированы в буфер обмена'
                  });
                }}
              >
                <Icon name="Copy" size={16} className="mr-2" />
                Скопировать реквизиты
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Если не получается отсканировать QR-код
              </p>
            </div>

            {paymentData?.thank_you && (
              <p className="text-center text-green-600 font-medium">
                {paymentData.thank_you}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <Button onClick={() => setPaymentDialog(false)} className="w-full">
              Понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}