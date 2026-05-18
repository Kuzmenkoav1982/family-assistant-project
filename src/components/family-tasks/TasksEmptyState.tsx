import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TasksEmptyStateProps {
  filter: 'all' | 'active' | 'completed';
}

export default function TasksEmptyState({ filter }: TasksEmptyStateProps) {
  return (
    <Card className="p-12 text-center border-2 border-dashed border-gray-200">
      <Icon name="CheckCircle2" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {filter === 'completed' ? 'Нет выполненных задач' : 'Все задачи выполнены!'}
      </h3>
      <p className="text-gray-600 mb-4">
        {filter === 'completed'
          ? 'Выполните задачи, чтобы они появились здесь'
          : 'Отличная работа! Добавьте новые задачи или отдохните'}
      </p>
    </Card>
  );
}
