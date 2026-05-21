import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { fm } from './cashflowUtils';

export function SummaryCard({ icon, label, value, color, sub }: {
  icon: string; label: string; value: string; color: string; sub: string;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-3 flex flex-col items-center text-center gap-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon name={icon} size={16} style={{ color }} />
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{value}</p>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function InsightRow({ icon, color, label, value }: {
  icon: string; color: string; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        <Icon name={icon} size={16} style={{ color }} />
      </div>
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export function CfTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 border rounded-lg shadow-lg p-3 text-xs space-y-1 max-w-48">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-medium">{fm(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
