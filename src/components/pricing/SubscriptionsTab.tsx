import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SubscriptionsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSubscription: any;
  loading: string | null;
  selectedPeriod: string;
  setSelectedPeriod: (id: string) => void;
  handleSubscribe: (planId: string, action?: 'create' | 'extend' | 'upgrade') => void;
}

export default function SubscriptionsTab({
  currentSubscription,
  loading,
  selectedPeriod,
  setSelectedPeriod,
  handleSubscribe,
}: SubscriptionsTabProps) {
  return (
    <>
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
    </>
  );
}
