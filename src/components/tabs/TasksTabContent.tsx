import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import type { Task, FamilyMember } from '@/types/family.types';

interface TasksTabContentProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  createTask?: (taskData: Partial<Task>) => Promise<{success: boolean; task?: Task; error?: string}>;
  updateTask?: (taskData: Partial<Task> & {id: string}) => Promise<{success: boolean; task?: Task; error?: string}>;
  deleteTask?: (taskId: string) => Promise<{success: boolean; error?: string}>;
  familyMembers: FamilyMember[];
  toggleTask: (taskId: string) => void | Promise<any>;
  addPoints: (assignee: string, points: number) => void;
  getMemberById: (id: string) => FamilyMember | undefined;
}

function getNextOccurrence(task: Task): string | undefined {
  if (!task.isRecurring || !task.recurringPattern) return undefined;
  
  const now = new Date();
  const { frequency, interval, daysOfWeek = [], endDate } = task.recurringPattern;
  
  if (endDate && new Date(endDate) < now) return undefined;
  
  const next = new Date(now);
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      if (Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
        const daysToAdd = nextDay > currentDay 
          ? nextDay - currentDay 
          : 7 - currentDay + nextDay;
        next.setDate(next.getDate() + daysToAdd);
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  
  return next.toISOString().split('T')[0];
}

export function TasksTabContent({
  tasks,
  setTasks,
  createTask,
  updateTask,
  deleteTask,
  familyMembers,
  toggleTask,
  addPoints,
  getMemberById,
}: TasksTabContentProps) {
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'completed') return task.completed;
    if (taskFilter === 'active') return !task.completed;
    return task.assignee === taskFilter;
  });

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!createTask) return;

    setIsCreatingTask(true);

    const formData = new FormData(e.currentTarget);
    const taskData: Partial<Task> = {
      title: formData.get('title') as string,
      assignee: formData.get('assignee') as string,
      dueDate: formData.get('dueDate') as string,
      description: formData.get('description') as string || undefined,
      points: parseInt(formData.get('points') as string) || 10,
      completed: false,
      isRecurring: false,
    };

    const result = await createTask(taskData);

    if (result.success && result.task) {
      setTasks([...tasks, result.task]);
      setIsTaskDialogOpen(false);
    }

    setIsCreatingTask(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!deleteTask) return;
    
    const result = await deleteTask(taskId);
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  return (
    <TabsContent value="tasks" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">Задачи</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial">
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border-2 border-blue-300 rounded-md bg-white text-sm font-medium hover:border-blue-400 transition-colors"
            >
              <option value="all">Все задачи</option>
              <option value="active">Активные</option>
              <option value="completed">Завершённые</option>
              {familyMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {createTask && (
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Icon name="Plus" className="mr-2" size={18} />
                  Добавить задачу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая задача</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Название</label>
                    <Input name="title" required placeholder="Купить продукты" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Описание</label>
                    <Input name="description" placeholder="Молоко, хлеб, яйца" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Исполнитель</label>
                    <select name="assignee" required className="w-full px-3 py-2 border rounded-md">
                      <option value="">Выберите...</option>
                      {familyMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Срок</label>
                    <Input name="dueDate" type="date" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Баллы</label>
                    <Input name="points" type="number" defaultValue={10} min={1} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isCreatingTask} className="flex-1">
                      {isCreatingTask ? 'Создание...' : 'Создать'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredTasks.map((task) => {
          const assignee = getMemberById(task.assignee);
          return (
            <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => {
                      toggleTask(task.id);
                      if (!task.completed && assignee) {
                        addPoints(assignee.id, task.points || 10);
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h4>
                      {deleteTask && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {assignee && (
                        <Badge variant="outline" className="gap-1">
                          <Icon name="User" size={14} />
                          {assignee.name}
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="gap-1">
                        <Icon name="Calendar" size={14} />
                        {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                      </Badge>
                      
                      <Badge variant="outline" className="gap-1">
                        <Icon name="Award" size={14} />
                        {task.points || 10} баллов
                      </Badge>

                      {task.isRecurring && (
                        <Badge variant="secondary" className="gap-1">
                          <Icon name="Repeat" size={14} />
                          {task.recurringPattern?.frequency === 'daily' && 'Каждый день'}
                          {task.recurringPattern?.frequency === 'weekly' && 'Каждую неделю'}
                          {task.recurringPattern?.frequency === 'monthly' && 'Каждый месяц'}
                          {task.recurringPattern?.frequency === 'yearly' && 'Каждый год'}
                        </Badge>
                      )}
                    </div>

                    {task.isRecurring && !task.completed && (
                      <div className="mt-2 text-xs text-gray-500">
                        Следующее: {getNextOccurrence(task) ? new Date(getNextOccurrence(task)!).toLocaleDateString('ru-RU') : 'не запланировано'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Icon name="ListTodo" className="mx-auto mb-2 text-gray-400" size={48} />
            <p>Нет задач</p>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}