import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import type { Task, FamilyMember } from '@/types/family.types';

interface TasksTabContentProps {
  tasks: Task[];
  toggleTask: (taskId: string) => void;
  getNextOccurrenceDate: (task: Task) => string | undefined;
  getMemberById: (id: string) => FamilyMember | undefined;
  deleteTask: (taskId: string) => void;
}

export default function TasksTabContent({
  tasks,
  toggleTask,
  getNextOccurrenceDate,
  getMemberById,
  deleteTask,
}: TasksTabContentProps) {
  return (
    <TabsContent value="tasks">
      <Card className="border-2 border-blue-200 bg-blue-50/50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Icon name="CheckSquare" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Как работают задачи?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Создавайте задачи</strong> для любых дел: уборка, покупки, домашние задания.</p>
                <p><strong>Назначайте исполнителей</strong> из членов семьи и следите за прогрессом.</p>
                <p><strong>Зарабатывайте баллы</strong> за выполнение — мотивация для всей семьи!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CheckSquare" />
            Задачи семьи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task, idx) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex-1">
                  <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <Badge>{getMemberById(task.assignee_id || task.assignee || '')?.name || 'Не назначено'}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Удалить эту задачу?')) {
                      deleteTask(task.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Задач пока нет. Создайте первую задачу!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
