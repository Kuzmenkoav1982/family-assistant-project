import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Props {
  onClose: () => void;
  onSubmit: (amount: number, paymentMethod: 'card' | 'sbp') => Promise<{ ok: boolean }>;
}

export default function WalletTopupForm({ onClose, onSubmit }: Props) {
  const [topupAmount, setTopupAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card');
  const [submitting, setSubmitting] = useState(false);

  const handle = async () => {
    const amount = parseFloat(topupAmount);
    setSubmitting(true);
    await onSubmit(amount, paymentMethod);
    setSubmitting(false);
  };

  return (
    <Card className="border-emerald-300 bg-emerald-50/50">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold flex items-center gap-2">
          <Icon name="ArrowUpCircle" size={18} className="text-emerald-600" />
          Пополнить баланс
        </h3>
        <div>
          <Label>Сумма (руб), минимум 50</Label>
          <Input
            type="number"
            step="1"
            min="50"
            placeholder="500"
            value={topupAmount}
            onChange={e => setTopupAmount(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[100, 300, 500, 1000, 3000].map(v => (
            <Button
              key={v}
              size="sm"
              variant={topupAmount === String(v) ? 'default' : 'outline'}
              className={topupAmount === String(v) ? 'bg-emerald-600' : ''}
              onClick={() => setTopupAmount(String(v))}
            >
              {v} руб
            </Button>
          ))}
        </div>

        <div>
          <Label className="text-sm mb-2 block">Способ оплаты</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className={paymentMethod === 'card' ? 'bg-emerald-600' : ''}
              onClick={() => setPaymentMethod('card')}
            >
              <Icon name="CreditCard" size={14} className="mr-1" />
              Картой
            </Button>
            <Button
              size="sm"
              variant={paymentMethod === 'sbp' ? 'default' : 'outline'}
              className={paymentMethod === 'sbp' ? 'bg-emerald-600' : ''}
              onClick={() => setPaymentMethod('sbp')}
            >
              <Icon name="Smartphone" size={14} className="mr-1" />
              СБП
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handle}
            disabled={!topupAmount || parseFloat(topupAmount) < 50 || submitting}
            className="bg-emerald-600 flex-1"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Переход к оплате...
              </div>
            ) : (
              <>
                <Icon name="Lock" size={14} className="mr-1" />
                Оплатить {topupAmount ? `${topupAmount} руб` : ''}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Безопасная оплата через ЮKassa. После оплаты средства поступят автоматически.
        </p>
      </CardContent>
    </Card>
  );
}
