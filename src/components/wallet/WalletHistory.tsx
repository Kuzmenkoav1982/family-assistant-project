import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import WalletTransactionRow from './WalletTransactionRow';
import type { Transaction } from './walletConstants';

interface Props {
  transactions: Transaction[];
  onBack: () => void;
}

export default function WalletHistory({ transactions, onBack }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">История операций</h3>
        <Button size="sm" variant="ghost" onClick={onBack}>
          <Icon name="ArrowLeft" size={14} className="mr-1" />
          Обзор
        </Button>
      </div>
      {transactions.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Нет операций</p>
      ) : (
        <div className="space-y-1.5">
          {transactions.map(tx => (
            <WalletTransactionRow key={tx.id} tx={tx} showDescription />
          ))}
        </div>
      )}
    </div>
  );
}
