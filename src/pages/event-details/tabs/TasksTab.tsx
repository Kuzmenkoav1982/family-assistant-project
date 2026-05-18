import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { taskStatusLabels } from '../eventDetailsConstants';
import type { EventTask } from '@/types/events';

interface Props {
  tasks: EventTask[];
  tasksLoading: boolean;
  onShowAddTask: () => void;
  fetchTasks: () => void;
  handleTaskStatusChange: (taskId: string, currentStatus: string) => void;
}

export default function TasksTab({ tasks, tasksLoading, onShowAddTask, fetchTasks, handleTaskStatusChange }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Задачи по организации</CardTitle>
        <Button onClick={() => { onShowAddTask(); fetchTasks(); }}>
          <Icon name="Plus" size={16} />
          Добавить задачу
        </Button>
      </CardHeader>
      <CardContent>
        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" className="animate-spin" size={24} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="CheckSquare" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Задач пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => handleTaskStatusChange(task.id, task.status)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    {task.assignedTo && (
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={14} />
                        {task.assignedTo}
                      </span>
                    )}
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {new Date(task.deadline).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={taskStatusLabels[task.status]?.variant || 'default'}>
                  {taskStatusLabels[task.status]?.label || task.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
