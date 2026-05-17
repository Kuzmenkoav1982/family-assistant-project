import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface PricingDialogsProps {
  showPaymentMethodDialog: boolean;
  setShowPaymentMethodDialog: (open: boolean) => void;
  proceedWithPayment: (paymentMethod: 'card' | 'sbp') => void;
  paymentDialog: boolean;
  setPaymentDialog: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: (opts: any) => void;
}

export default function PricingDialogs({
  showPaymentMethodDialog,
  setShowPaymentMethodDialog,
  proceedWithPayment,
  paymentDialog,
  setPaymentDialog,
  paymentData,
  toast,
}: PricingDialogsProps) {
  return (
    <>
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
    </>
  );
}
