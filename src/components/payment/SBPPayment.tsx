import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SBPPaymentProps {
  amount: number;
  description?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export function SBPPayment({ amount, description = 'Оплата подписки', onSuccess, onError }: SBPPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/c6530a3b-947b-4cca-976d-430c9b91ee4a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          return_url: window.location.origin + '/payment-success'
        })
      });

      const data = await response.json();

      if (response.ok && data.confirmation_url) {
        // Открываем страницу выбора банка СБП
        window.location.href = data.confirmation_url;
        
        if (onSuccess) {
          onSuccess(data.payment_id);
        }
      } else {
        throw new Error(data.error || 'Ошибка создания платежа');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка оплаты';
      if (onError) {
        onError(errorMessage);
      }
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CreditCard" size={24} />
            Оплата через СБП
          </CardTitle>
          <CardDescription>
            Выберите любой банк для оплаты
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Сумма к оплате:</span>
              <span className="text-2xl font-bold text-blue-600">{amount} ₽</span>
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Icon name="CheckCircle2" size={16} className="mt-0.5 text-green-600" />
              <span>Оплата в любом банке через приложение</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Icon name="CheckCircle2" size={16} className="mt-0.5 text-green-600" />
              <span>Мгновенное зачисление</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Icon name="CheckCircle2" size={16} className="mt-0.5 text-green-600" />
              <span>Без комиссии</span>
            </div>
          </div>

          <Button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                Создание платежа...
              </>
            ) : (
              <>
                <Icon name="Smartphone" className="mr-2" size={20} />
                Оплатить через СБП
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            После нажатия вы будете перенаправлены на страницу выбора банка
          </p>
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Icon name="CheckCircle2" size={24} />
              Оплата успешна!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Ваша подписка успешно активирована.</p>
            <Button onClick={() => setShowSuccess(false)} className="w-full">
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}