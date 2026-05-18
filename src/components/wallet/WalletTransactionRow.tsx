import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { reasonIcons, localizeReason, localizeDescription, formatWalletDate, type Transaction } from './walletConstants';

interface Props {
  tx: Transaction;
  showDescription?: boolean;
}

export default function WalletTransactionRow({ tx, showDescription = false }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'topup' ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon
            name={reasonIcons[tx.reason] || (tx.type === 'topup' ? 'ArrowUpCircle' : 'ArrowDownCircle')}
            size={18}
            className={tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{localizeReason(tx.reason, tx.type)}</p>
          {showDescription && tx.description && (
            <p className="text-xs text-muted-foreground truncate">{localizeDescription(tx.description)}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {formatWalletDate(tx.created_at)}
            {tx.user_name && ` · ${tx.user_name}`}
          </p>
        </div>
        <span className={`text-sm font-bold ${tx.type === 'topup' ? 'text-green-600' : 'text-red-600'}`}>
          {tx.type === 'topup' ? '+' : '-'}{tx.amount.toFixed(0)} руб
        </span>
      </CardContent>
    </Card>
  );
}
