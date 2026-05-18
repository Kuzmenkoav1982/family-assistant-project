import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { getCategoryColor } from './useFamilyTasks';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    category: string;
    points?: number;
    isRecurring?: boolean;
    shoppingList?: string[];
    reminderTime?: string;
    nextOccurrence?: string;
    assignee: string;
  };
  member?: {
    name: string;
    photoUrl?: string;
    avatar?: string;
  };
  onToggle: (id: string) => void;
}

export default function TaskCard({ task, member, onToggle }: TaskCardProps) {
  return (
    <Card className={`p-6 border-2 transition-all ${
      task.completed ? 'border-gray-200 bg-gray-50' : 'border-gray-100 hover:shadow-lg'
    }`}>
      <div className="flex items-start gap-4">
        <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} className="mt-1" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getCategoryColor(task.category)} border-0`}>{task.category}</Badge>
                {task.points && (
                  <Badge className="bg-purple-100 text-purple-700 border-0">
                    <Icon name="Star" className="w-3 h-3 mr-1" />
                    {task.points} баллов
                  </Badge>
                )}
                {task.isRecurring && (
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    <Icon name="Repeat" className="w-3 h-3 mr-1" />
                    Повторяется
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {task.shoppingList && task.shoppingList.length > 0 && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Список покупок:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {task.shoppingList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Icon name="Check" className="w-3 h-3 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {member && (
                <>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.photoUrl} />
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
                </>
              )}
            </div>
            {task.reminderTime && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Icon name="Bell" className="w-4 h-4" />
                <span>{task.reminderTime}</span>
              </div>
            )}
            {task.nextOccurrence && !task.completed && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Icon name="Calendar" className="w-4 h-4" />
                <span>Следующее: {new Date(task.nextOccurrence).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
