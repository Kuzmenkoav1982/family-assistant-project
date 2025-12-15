import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const PAYMENTS_API = 'https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d';

const plans = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 299,
    period: '1 месяц',
    popular: false,
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
    price: 799,
    period: '3 месяца',
    popular: true,
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
    price: 2499,
    period: '12 месяцев',
    popular: false,
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

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

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

    setLoading(planId);

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
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-6 py-2">
            💎 Выберите свой тариф
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Подписка на "Наша семья"
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Выберите подходящий тариф и начните организовывать жизнь вашей семьи
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? 'border-4 border-purple-500 shadow-2xl scale-105'
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-4 py-1">
                    🔥 Популярный
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">₽{plan.price}</span>
                  <span className="text-gray-600 ml-2">/ {plan.period}</span>
                </div>
                <CardDescription className="text-base">
                  {plan.period === '3 месяца' && '₽266/мес'}
                  {plan.period === '12 месяцев' && '₽208/мес'}
                  {plan.period === '1 месяц' && 'Гибкая оплата'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Icon name="CheckCircle2" className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : ''
                  }`}
                  size="lg"
                >
                  {loading === plan.id ? (
                    <>
                      <Icon name="Loader" className="animate-spin mr-2" size={20} />
                      Оформление...
                    </>
                  ) : (
                    <>
                      Выбрать тариф
                      <Icon name="ArrowRight" className="ml-2" size={20} />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Часто задаваемые вопросы</h2>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔒 Безопасность платежей</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Все платежи обрабатываются через ЮKassa — надежный и защищенный сервис онлайн-платежей.
                  Мы не храним данные ваших банковских карт.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔄 Можно ли изменить тариф?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Да, вы можете перейти на другой тариф в любое время. При переходе на более дорогой тариф
                  мы пересчитаем стоимость с учетом неиспользованного периода.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💳 Какие способы оплаты доступны?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Банковские карты (Visa, Mastercard, МИР), электронные кошельки, СБП, оплата через банк.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📱 Есть ли пробный период?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Сейчас приложение находится в демо-режиме с доступом ко всем функциям. 
                  После запуска платной версии новым пользователям будет доступен 7-дневный пробный период.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardHeader>
              <CardTitle className="text-3xl">Остались вопросы?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">
                Напишите нам в поддержку, и мы поможем выбрать подходящий тариф
              </p>
              <Button
                onClick={() => navigate('/support')}
                variant="secondary"
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Icon name="MessageCircle" className="mr-2" size={20} />
                Связаться с поддержкой
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
