import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WelcomeFooterProps {
  openTelegramSupport: () => void;
}

const subscriptionPlans = [
  {
    id: 'free_2026',
    name: 'Free',
    price: 0,
    period: 'навсегда',
    color: 'from-gray-500 to-gray-600',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-600',
    iconColor: 'text-green-500',
    features: [
      '5 AI-запросов в день',
      'До 10 фото',
      'До 2 членов семьи',
      'Календарь и задачи',
      'Списки покупок'
    ]
  },
  {
    id: 'premium_1m',
    name: 'Premium 1 месяц',
    price: 299,
    period: '1 месяц',
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    iconColor: 'text-blue-500',
    features: [
      'Безлимитные AI-запросы',
      'Безлимитные фото',
      'Безлимитные члены семьи',
      'Семейный психолог',
      'Путешествия и маршруты',
      'Аналитика и статистика'
    ]
  },
  {
    id: 'premium_3m',
    name: 'Premium 3 месяца',
    price: 799,
    period: '3 месяца',
    popular: true,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600',
    iconColor: 'text-purple-500',
    savings: 'Экономия 11%!',
    features: [
      'Безлимитные AI-запросы',
      'Безлимитные фото',
      'Безлимитные члены семьи',
      'Семейный психолог',
      'Путешествия и маршруты',
      'Аналитика и статистика',
      '💎 Выгода 98₽ за 3 месяца'
    ]
  },
  {
    id: 'premium_6m',
    name: 'Premium 6 месяцев',
    price: 1499,
    period: '6 месяцев',
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-600',
    iconColor: 'text-pink-500',
    savings: 'Экономия 17%!',
    features: [
      'Безлимитные AI-запросы',
      'Безлимитные фото',
      'Безлимитные члены семьи',
      'Семейный психолог',
      'Путешествия и маршруты',
      'Аналитика и статистика',
      '💎 Выгода 295₽ за 6 месяцев'
    ]
  },
  {
    id: 'premium_12m',
    name: 'Premium 12 месяцев',
    price: 2699,
    period: '12 месяцев',
    color: 'from-yellow-500 to-orange-600',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
    iconColor: 'text-orange-500',
    savings: 'Экономия 25%!',
    features: [
      'Безлимитные AI-запросы',
      'Безлимитные фото',
      'Безлимитные члены семьи',
      'Семейный психолог',
      'Путешествия и маршруты',
      'Аналитика и статистика',
      '💎 Выгода 889₽ за 12 месяцев'
    ]
  }
];

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

export default function WelcomeFooter({ openTelegramSupport }: WelcomeFooterProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'sbp'>('card');

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

    if (planId === 'free_2026') {
      toast({
        title: 'Бесплатный тариф',
        description: 'Этот тариф уже доступен всем пользователям',
      });
      return;
    }

    setPendingPlanId(planId);
    setShowPaymentMethodDialog(true);
  };

  const handlePaymentMethodSelected = async (method: 'card' | 'sbp') => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodDialog(false);

    if (!pendingPlanId) return;

    await processPayment(pendingPlanId, method);
  };

  const processPayment = async (planId: string, method: 'card' | 'sbp') => {
    setLoading(planId);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(PAYMENTS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          plan_id: planId,
          action: 'create',
          payment_method: method
        })
      });

      const data = await response.json();

      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error(data.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось создать платёж';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
      setPendingPlanId(null);
    }
  };

  const topPlans = subscriptionPlans.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Тарифы */}
      <div className="mt-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 lg:p-12">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 text-lg">
            Тарифы и цены
          </Badge>
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Выберите подходящий тариф
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {topPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-2 ${plan.popular ? 'border-4 ' + plan.borderColor : plan.borderColor} hover:shadow-xl transition-all relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    Популярно
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h4 className={`text-2xl font-bold mb-2 ${plan.textColor}`}>{plan.name}</h4>
                  <div className={`text-4xl font-bold ${plan.textColor}`}>{plan.price} ₽</div>
                  <p className="text-gray-500">{plan.period}</p>
                  {plan.savings && (
                    <Badge className="mt-2 bg-purple-100 text-purple-700">{plan.savings}</Badge>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Icon name="Check" className={`${plan.iconColor} flex-shrink-0 mt-0.5`} size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.id !== 'free_2026' && (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
                  >
                    {loading === plan.id ? 'Обработка...' : 'Подключить'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate('/pricing')}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-12 py-6 font-bold shadow-xl"
          >
            <Icon name="Zap" size={22} className="mr-3" />
            Все тарифы
          </Button>
        </div>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите способ оплаты</DialogTitle>
            <DialogDescription>
              Как вы хотите оплатить подписку?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-20 flex items-center justify-between px-6"
              onClick={() => handlePaymentMethodSelected('card')}
            >
              <div className="flex items-center gap-3">
                <Icon name="CreditCard" size={24} />
                <div className="text-left">
                  <div className="font-semibold">Банковская карта</div>
                  <div className="text-sm text-gray-500">Visa, MasterCard, МИР</div>
                </div>
              </div>
              <Icon name="ChevronRight" size={20} />
            </Button>
            <Button
              variant="outline"
              className="h-20 flex items-center justify-between px-6"
              onClick={() => handlePaymentMethodSelected('sbp')}
            >
              <div className="flex items-center gap-3">
                <Icon name="Smartphone" size={24} />
                <div className="text-left">
                  <div className="font-semibold">Система быстрых платежей</div>
                  <div className="text-sm text-gray-500">Оплата через СБП</div>
                </div>
              </div>
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PWA */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 text-lg">
            Мобильное приложение
          </Badge>
          <h3 className="text-3xl font-bold mb-4">Установите PWA-версию</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Работает как обычное мобильное приложение с офлайн-режимом и push-уведомлениями
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon name="Smartphone" className="text-blue-600" size={24} />
                </div>
                <h4 className="text-xl font-bold">iPhone / iPad</h4>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                  <span>Откройте сайт в Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                  <span>Нажмите кнопку "Поделиться" внизу экрана</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                  <span>Выберите "На экран Домой"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                  <span>Нажмите "Добавить"</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icon name="Monitor" className="text-green-600" size={24} />
                </div>
                <h4 className="text-xl font-bold">Android / Chrome</h4>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">1</span>
                  <span>Откройте сайт в Chrome или другом браузере</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">2</span>
                  <span>Нажмите на меню (три точки в правом верхнем углу)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">3</span>
                  <span>Выберите "Добавить на главный экран"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">4</span>
                  <span>Подтвердите добавление</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Поддержка */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
        <div className="text-center">
          <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 text-lg">
            Помощь и поддержка
          </Badge>
          <h3 className="text-3xl font-bold mb-4">Нужна помощь?</h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Наша команда всегда готова помочь вам. Свяжитесь с нами любым удобным способом
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={openTelegramSupport}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Icon name="MessageCircle" size={20} className="mr-2" />
              Написать в Telegram
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              size="lg"
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <Icon name="Mail" size={20} className="mr-2" />
              Форма обратной связи
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 py-8">
        <p className="text-sm">
          © {new Date().getFullYear()} Наша Семья. Все права защищены.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="/terms" className="text-sm hover:text-purple-600 transition-colors">
            Условия использования
          </a>
          <a href="/privacy" className="text-sm hover:text-purple-600 transition-colors">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </div>
  );
}