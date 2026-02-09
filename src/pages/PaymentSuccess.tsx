import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Можно отправить аналитику об успешной оплате
    const paymentId = searchParams.get('payment_id');
    if (paymentId) {
      console.log('Payment completed:', paymentId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-600 text-2xl">
            <Icon name="CheckCircle2" size={32} />
            Оплата успешна!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-gray-700">
              Ваша подписка успешно активирована. Спасибо за поддержку проекта!
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
            >
              <Icon name="Home" className="mr-2" size={20} />
              Вернуться на главную
            </Button>

            <Button 
              onClick={() => navigate('/settings')}
              variant="outline"
              className="w-full"
            >
              Перейти в настройки
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
