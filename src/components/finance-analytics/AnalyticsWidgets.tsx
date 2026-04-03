import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Health, Recommendation } from '@/data/financeAnalyticsTypes';
import { fm } from '@/data/financeAnalyticsTypes';

export function HealthGauge({ score, label, status }: Health) {
  const clr = status === 'good' ? '#22c55e' : status === 'warning' ? '#eab308' : '#ef4444';
  const bg = status === 'good' ? 'from-green-500/20 to-emerald-500/10' : status === 'warning' ? 'from-yellow-500/20 to-amber-500/10' : 'from-red-500/20 to-rose-500/10';
  const pct = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference * 0.75;

  return (
    <Card className={`bg-gradient-to-br ${bg} border-0 shadow-lg`}>
      <CardContent className="flex flex-col items-center py-6 gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Финансовое здоровье</p>
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={clr} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: clr }}>{score}</span>
            <span className="text-[10px] text-muted-foreground">из 100</span>
          </div>
        </div>
        <Badge variant="outline" className="text-sm font-medium" style={{ borderColor: clr, color: clr }}>{label}</Badge>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export function MetricCard({ icon, label, value, sub, color }: MetricCardProps) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-3 flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: (color || '#6366f1') + '18' }}>
          <Icon name={icon} size={18} style={{ color: color || '#6366f1' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
          <p className="text-base font-bold leading-tight mt-0.5" style={{ color }}>{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecCardProps {
  r: Recommendation;
  onAction?: (r: Recommendation) => void;
}

export function RecCard({ r, onAction }: RecCardProps) {
  const cfg: Record<string, { bg: string; border: string; icon_clr: string }> = {
    critical: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900', icon_clr: '#ef4444' },
    high: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-900', icon_clr: '#f97316' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-900', icon_clr: '#eab308' },
    low: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', icon_clr: '#3b82f6' },
  };
  const c = cfg[r.priority] || cfg.low;

  return (
    <div className={`rounded-xl p-4 ${c.bg} border ${c.border} space-y-2`}>
      <div className="flex items-start gap-3">
        <Icon name={r.icon || 'Info'} size={20} style={{ color: c.icon_clr }} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{r.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{r.text}</p>
        </div>
      </div>
      {r.action === 'extra_payment' && r.interest_saved && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-green-600">Экономия: {fm(r.interest_saved)}</span>
          {onAction && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAction(r)}>Подробнее</Button>}
        </div>
      )}
    </div>
  );
}

export function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-muted-foreground flex-1">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}