import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import WalletServiceCosts from './WalletServiceCosts';
import WalletStatsCard from './WalletStatsCard';
import WalletTransactionRow from './WalletTransactionRow';
import type { Transaction, WalletStats } from './walletConstants';

interface Props {
  stats: WalletStats | null;
  transactions: Transaction[];
  onShowHistory: () => void;
  onShowTopup: () => void;
}

export default function WalletOverview({ stats, transactions, onShowHistory, onShowTopup }: Props) {
  return (
    <>
      <WalletServiceCosts />

      {stats && <WalletStatsCard stats={stats} />}

      {transactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Последние операции</h3>
            <Button size="sm" variant="ghost" className="text-xs" onClick={onShowHistory}>
              Все
              <Icon name="ChevronRight" size={14} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {transactions.slice(0, 5).map(tx => (
              <WalletTransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <Card className="border-2 border-dashed border-emerald-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <Icon name="Wallet" size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold mb-2">Кошелёк пуст</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Пополните баланс, чтобы пользоваться ИИ-генерацией диет, рецептов и фотографий.
            </p>
            <Button className="bg-emerald-600" onClick={onShowTopup}>
              <Icon name="Plus" size={16} className="mr-2" />
              Пополнить баланс
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
