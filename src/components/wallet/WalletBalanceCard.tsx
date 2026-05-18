import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  balance: number;
  onTopup: () => void;
  onToggleHistory: () => void;
}

export default function WalletBalanceCard({ balance, onTopup, onToggleHistory }: Props) {
  return (
    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white overflow-hidden relative">
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
      <CardContent className="p-6 relative z-10">
        <div className="text-sm opacity-80 mb-1">Текущий баланс</div>
        <div className="text-4xl font-bold mb-4">
          {balance.toFixed(2)} <span className="text-xl opacity-80">руб</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-white text-emerald-700 hover:bg-white/90" onClick={onTopup}>
            <Icon name="Plus" size={14} className="mr-1" />
            Пополнить
          </Button>
          <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={onToggleHistory}>
            <Icon name="History" size={14} className="mr-1" />
            История
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
