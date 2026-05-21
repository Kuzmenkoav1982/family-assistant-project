import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { fmt } from './constants';

interface Stats {
  vehicle_count: number;
  month_expenses: number;
  active_reminders: number;
  urgent_reminders: number;
}

function StatCard({ icon, label, value, urgent }: { icon: string; label: string; value: string; urgent?: boolean }) {
  return (
    <Card className={urgent ? 'border-red-300 bg-red-50' : ''}>
      <CardContent className="p-3 text-center">
        <Icon name={icon} size={20} className={`mx-auto mb-1 ${urgent ? 'text-red-500' : 'text-blue-500'}`} />
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function GarageStatCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard icon="Car" label="Автомобилей" value={String(stats.vehicle_count)} />
      <StatCard icon="Wallet" label="В этом месяце" value={fmt(stats.month_expenses)} />
      <StatCard icon="Bell" label="Напоминаний" value={String(stats.active_reminders)} urgent={stats.urgent_reminders > 0} />
    </div>
  );
}
