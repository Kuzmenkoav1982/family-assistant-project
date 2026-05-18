import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TasksStatsBarProps {
  total: number;
  active: number;
  completed: number;
  totalPoints: number;
}

export default function TasksStatsBar({ total, active, completed, totalPoints }: TasksStatsBarProps) {
  const stats = [
    { label: 'Всего задач', value: total, icon: 'ListTodo', bg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Активные', value: active, icon: 'Clock', bg: 'bg-orange-100', iconColor: 'text-orange-600' },
    { label: 'Выполнено', value: completed, icon: 'CheckCircle2', bg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Баллы', value: totalPoints, icon: 'Star', bg: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon, bg, iconColor }) => (
        <Card key={label} className="p-6 border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
              <Icon name={icon as any} className={`w-6 h-6 ${iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
