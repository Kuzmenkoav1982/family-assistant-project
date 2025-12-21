import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AliceStats {
  totalUsers: number;
  activeUsers: number;
  totalCommands: number;
  todayCommands: number;
  errorRate: number;
  avgResponseTime: number;
}

interface AdminAliceMetricsProps {
  stats: AliceStats;
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string; 
  trend?: string;
}) {
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon name={icon as any} size={20} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {trend && <p className="text-xs text-gray-500">{trend}</p>}
      </CardContent>
    </Card>
  );
}

export function AdminAliceMetrics({ stats }: AdminAliceMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Всего пользователей"
        value={stats.totalUsers}
        icon="Users"
        color="purple"
        trend={stats.totalUsers === 0 ? 'Пока нет пользователей' : `${stats.activeUsers} активных`}
      />
      <MetricCard
        title="Активные сегодня"
        value={stats.activeUsers}
        icon="Activity"
        color="blue"
        trend={stats.totalUsers > 0 ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% от всех` : 'Нет данных'}
      />
      <MetricCard
        title="Команд за день"
        value={stats.todayCommands}
        icon="MessageSquare"
        color="green"
        trend={`${stats.totalCommands} всего`}
      />
      <MetricCard
        title="Ошибок"
        value={`${stats.errorRate}%`}
        icon="AlertTriangle"
        color={stats.errorRate > 5 ? 'red' : 'yellow'}
        trend="Норма до 5%"
      />
    </div>
  );
}
