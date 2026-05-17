import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface PricingHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSubscription: any;
}

export default function PricingHeader({ currentSubscription }: PricingHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
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
    </>
  );
}