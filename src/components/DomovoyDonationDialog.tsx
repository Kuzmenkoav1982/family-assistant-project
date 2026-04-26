import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface DomovoyDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const donationOptions = [
  {
    amount: 100,
    title: 'Кружка молока',
    emoji: '🥛',
    description: '+1 уровень мудрости'
  },
  {
    amount: 500,
    title: 'Горшочек мёда',
    emoji: '🍯',
    description: '+2 уровня мудрости'
  },
  {
    amount: 1000,
    title: 'Сундук с угощениями',
    emoji: '🎁',
    description: '+3 уровня мудрости'
  }
];

export default function DomovoyDonationDialog({
  open,
  onOpenChange
}: DomovoyDonationDialogProps) {
  const { toast } = useToast();
  const { assistantLevel, setAssistantLevel } = useAIAssistant();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async (amount: number) => {
    if (!amount || amount < 100) {
      toast({
        title: 'Ошибка',
        description: 'Минимальная сумма - 100₽',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: 'Ошибка',
          description: 'Требуется авторизация',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      const response = await fetch('https://functions.poehali.dev/e7113c2a-154d-46b2-90b6-6752a3fd9085?action=donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          amount,
          payment_method: 'yookassa'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      // Сохраняем payment_id для проверки после возврата
      if (data.payment_id) {
        localStorage.setItem('pending_domovoy_payment', data.payment_id);
      }

      // Перенаправляем на страницу оплаты ЮКассы
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('Не получен URL оплаты');
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать платёж',
        variant: 'destructive'
      });
    }
  };

  const thankYouMessages = [
    "Благодарю, хозяин! Теперь я стал мудрее! 🏠✨",
    "Спасибо за угощение! Буду ещё усерднее помогать семье! 🧙‍♂️",
    "Добрые люди! Домовой не забудет вашу щедрость! 🎁",
    "Какое вкусное угощение! Буду беречь ваш дом! 💖"
  ];

  const randomThankYou = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">🏠</div>
            <h3 className="text-2xl font-bold mb-2">Домовой благодарит!</h3>
            <p className="text-gray-600 mb-4">{randomThankYou}</p>
            <div className="flex items-center justify-center gap-2 text-amber-600 font-semibold">
              <Icon name="Sparkles" size={24} />
              <span>+{Math.floor((selectedAmount || parseInt(customAmount)) / 500) + 1} уровень мудрости</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            🎁 Угостить Домового
          </DialogTitle>
          <DialogDescription>
            Помогите Домовому стать мудрее и давать ещё более точные советы.
            <span className="block mt-1 text-xs text-amber-700">
              💳 Оплата через ЮКассу. Это отдельный платёж и НЕ списывается с Семейного кошелька.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Sparkles" className="text-amber-600" />
              💡 Что даёт прокачка:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                <span>Более точные советы по воспитанию детей</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                <span>Умные подсказки по планированию</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                <span>Глубокий анализ семейного бюджета</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                <span>Персональные рекомендации</span>
              </li>
            </ul>
          </Card>

          {/* Donation Options */}
          <div>
            <Label className="text-base mb-3 block">Выберите сумму угощения:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {donationOptions.map((option) => (
                <Card
                  key={option.amount}
                  className="p-4 cursor-pointer transition-all hover:shadow-lg hover:border-amber-300"
                  onClick={() => handleDonate(option.amount)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <div className="font-bold text-lg mb-1">₽{option.amount}</div>
                    <div className="text-sm text-gray-600 mb-1">{option.title}</div>
                    <Badge variant="secondary" className="text-xs">
                      {option.description}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="custom-amount">Своя сумма (₽)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="100"
                  placeholder="Например: 300"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const amount = parseInt(customAmount);
                  if (amount) {
                    handleDonate(amount);
                  }
                }}
                disabled={!customAmount || isLoading}
              >
                Применить
              </Button>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 flex items-start gap-2">
              <Icon name="Info" className="mt-0.5 flex-shrink-0" size={16} />
              <span>
                <strong>Безопасная оплата через ЮКассу</strong><br/>
                Выберите сумму угощения выше, и вы будете перенаправлены на безопасную страницу оплаты. 
                Уровень мудрости Домового повысится автоматически после успешной оплаты.
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Закрыть
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          ❤️ Спасибо за поддержку! Домовой не забудет вашу щедрость.
        </p>
      </DialogContent>
    </Dialog>
  );
}