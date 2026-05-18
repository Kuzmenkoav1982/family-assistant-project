import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { localizeReason, type WalletStats } from './walletConstants';

interface Props {
  stats: WalletStats;
}

export default function WalletStatsCard({ stats }: Props) {
  if (stats.total_transactions === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Icon name="BarChart3" size={18} className="text-blue-500" />
          Статистика
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-green-50">
            <div className="text-lg font-bold text-green-700">+{stats.total_topup.toFixed(0)}</div>
            <div className="text-[10px] text-green-600">пополнено</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50">
            <div className="text-lg font-bold text-red-700">-{stats.total_spent.toFixed(0)}</div>
            <div className="text-[10px] text-red-600">потрачено</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50">
            <div className="text-lg font-bold text-blue-700">{stats.total_transactions}</div>
            <div className="text-[10px] text-blue-600">операций</div>
          </div>
        </div>

        {stats.spend_by_reason.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Расходы по категориям</h4>
            <div className="space-y-1.5">
              {stats.spend_by_reason.map(sr => {
                const pct = stats.total_spent > 0 ? (sr.total / stats.total_spent) * 100 : 0;
                return (
                  <div key={sr.reason} className="flex items-center gap-2">
                    <span className="text-xs flex-1">{localizeReason(sr.reason, 'spend')}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{sr.total.toFixed(0)} руб</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
