import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type FilterType = 'all' | 'active' | 'completed';

interface TasksFilterBarProps {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
}

export default function TasksFilterBar({ filter, onFilterChange }: TasksFilterBarProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все задачи' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Выполненные' },
  ];

  return (
    <Card className="p-6 mb-6 border-2 border-gray-100">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Icon name="Filter" className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Фильтры:</span>
        </div>
        <div className="flex gap-2">
          {filters.map(({ value, label }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              onClick={() => onFilterChange(value)}
              className={filter === value ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
