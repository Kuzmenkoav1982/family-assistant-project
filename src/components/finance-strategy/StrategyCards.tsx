import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { StrategyResult, DebtDetail } from '@/data/financeStrategyTypes';
import { fm, getDebtMeta } from '@/data/financeStrategyTypes';

interface StrategyCardProps {
  strategy: StrategyResult | null;
  label: string;
  description: string;
  icon: string;
  theme: 'blue' | 'purple';
  isRecommended: boolean;
  isWinner: boolean;
}

export function StrategyCard({ strategy, label, description, icon, theme, isRecommended, isWinner }: StrategyCardProps) {
  if (!strategy) {
    return (
      <Card className="border-0 shadow-md opacity-50">
        <CardContent className="p-4 text-center text-sm text-muted-foreground py-8">Недостаточно данных</CardContent>
      </Card>
    );
  }
  const colors = theme === 'blue'
    ? { bg: 'from-blue-500/10 to-indigo-500/5', accent: '#3b82f6' }
    : { bg: 'from-purple-500/10 to-violet-500/5', accent: '#8b5cf6' };

  return (
    <Card className={`border-0 shadow-md bg-gradient-to-br ${colors.bg} relative overflow-hidden ${isWinner ? 'ring-2 ring-amber-400' : ''}`}>
      {isRecommended && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 gap-1"><Icon name="Star" size={10} /> Лучшая</Badge>
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.accent + '20' }}>
            <Icon name={icon} size={16} style={{ color: colors.accent }} />
          </div>
          <div><h3 className="text-sm font-bold">{label}</h3><p className="text-[10px] text-muted-foreground">{description}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-background/60 p-2"><p className="text-xl font-bold leading-tight" style={{ color: colors.accent }}>{strategy.total_months}</p><p className="text-[10px] text-muted-foreground">месяцев</p></div>
          <div className="rounded-lg bg-background/60 p-2 min-w-0"><p className="text-base font-bold text-green-600 break-all leading-tight">{fm(strategy.interest_saved)}</p><p className="text-[10px] text-muted-foreground">экономия</p></div>
          <div className="rounded-lg bg-background/60 p-2 min-w-0"><p className="text-sm font-semibold break-all leading-tight">{fm(strategy.total_interest)}</p><p className="text-[10px] text-muted-foreground">проценты</p></div>
          <div className="rounded-lg bg-background/60 p-2"><p className="text-sm font-semibold text-amber-600 leading-tight">{strategy.months_saved} мес</p><p className="text-[10px] text-muted-foreground">сэкономлено</p></div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DebtRowProps {
  debt: DebtDetail;
  priority: number;
  isTarget: boolean;
}

export function DebtRow({ debt, priority, isTarget }: DebtRowProps) {
  const meta = getDebtMeta(debt.debt_type);
  const paidPct = debt.original_amount > 0 ? ((debt.original_amount - debt.remaining) / debt.original_amount) * 100 : 0;
  return (
    <div className={`rounded-xl p-3 space-y-2 transition-colors ${isTarget ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800' : 'bg-background border'}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: meta.color + '20', color: meta.color }}>{priority}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon name={meta.icon} size={14} style={{ color: meta.color }} />
            <span className="text-sm font-semibold truncate">{debt.name}</span>
            {isTarget && <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 shrink-0">Цель</Badge>}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
            <span>{debt.rate}%</span>
            <span>{fm(debt.remaining)} ост.</span>
            <span>{fm(debt.payment)}/мес</span>
          </div>
        </div>
      </div>
      <Progress value={paidPct} className="h-1.5" />
      <p className="text-[10px] text-muted-foreground text-right">Погашено {paidPct.toFixed(0)}%</p>
    </div>
  );
}

interface ClosedOrderTimelineProps {
  items: { name: string; month: number; id: string }[];
}

export function ClosedOrderTimeline({ items }: ClosedOrderTimelineProps) {
  return (
    <div className="relative pl-4">
      <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
      {items.map((c, i) => (
        <div key={i} className="relative flex items-center gap-3 py-2.5">
          <div className="absolute left-[-12px] w-4 h-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
            <Icon name="Check" size={10} className="text-white" />
          </div>
          <div className="flex-1 flex items-center justify-between ml-2">
            <span className="text-sm font-medium">{c.name}</span>
            <Badge variant="outline" className="text-[10px]">{c.month} мес</Badge>
          </div>
        </div>
      ))}
      <div className="relative flex items-center gap-3 py-2.5">
        <div className="absolute left-[-12px] w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 border-2 border-background flex items-center justify-center">
          <Icon name="Star" size={10} className="text-white" />
        </div>
        <span className="text-sm font-bold text-green-600 ml-2">Финансовая свобода!</span>
      </div>
    </div>
  );
}

interface AchievementCardProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export function AchievementCard({ icon, title, description, unlocked }: AchievementCardProps) {
  return (
    <Card className={`border-0 shadow-sm transition-all ${unlocked ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20' : 'opacity-50 grayscale'}`}>
      <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${unlocked ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted'}`}>
          {unlocked ? <Icon name={icon} size={20} className="text-amber-600" /> : <Icon name="Lock" size={16} className="text-muted-foreground" />}
        </div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
      </CardContent>
    </Card>
  );
}