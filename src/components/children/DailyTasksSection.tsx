import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  reward: number;
  completed: boolean;
  date: string;
}

interface DailyTasksSectionProps {
  childId: string;
}

export function DailyTasksSection({ childId }: DailyTasksSectionProps) {
  const [tasks, setTasks] = useState<DailyTask[]>([
    {
      id: '1',
      title: 'Прочитать 10 страниц книги',
      description: 'Продолжай читать свою любимую книгу',
      reward: 10,
      completed: false,
      date: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Помочь по дому',
      description: 'Убрать свою комнату',
      reward: 15,
      completed: true,
      date: new Date().toISOString(),
    },
  ]);

  const [newTaskDialog, setNewTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    reward: 10,
  });

  const handleAddTask = () => {
    if (!newTask.title) return;

    const task: DailyTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      reward: newTask.reward,
      completed: false,
      date: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', reward: 10 });
    setNewTaskDialog(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Удалить задание?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="ListTodo" size={20} />
              Ежедневные задания
            </CardTitle>
            <Dialog open={newTaskDialog} onOpenChange={setNewTaskDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  <Icon name="Plus" size={16} />
                  Создать задание
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новое задание для ребёнка</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название задания *</label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Например: Прочитать 10 страниц"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Дополнительные детали (необязательно)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Награда (монеты)</label>
                    <Input
                      type="number"
                      value={newTask.reward}
                      onChange={(e) => setNewTask({ ...newTask, reward: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                    />
                  </div>
                  <Button onClick={handleAddTask} className="w-full">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить задание
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Активные задания */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon name="Clock" size={18} className="text-orange-600" />
                Активные задания ({activeTasks.length})
              </h3>
              {activeTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="CheckCircle2" size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Нет активных заданий</p>
                  <p className="text-sm">Создайте новое задание для ребёнка</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTasks.map((task) => (
                    <Card key={task.id} className="border-2 border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="w-8 h-8 rounded-full border-2 border-orange-400 flex items-center justify-center hover:bg-orange-200 transition-colors flex-shrink-0 mt-1"
                          >
                            {task.completed && <Icon name="Check" size={20} className="text-orange-600" />}
                          </button>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-yellow-500 text-white">
                                <Icon name="Coins" size={12} className="mr-1" />
                                +{task.reward} монет
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Выполненные задания */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Icon name="CheckCircle2" size={18} className="text-green-600" />
                  Выполнено сегодня ({completedTasks.length})
                </h3>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <Card key={task.id} className="border-2 border-green-200 bg-green-50 opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Icon name="Check" size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg line-through text-gray-600">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-green-600 text-white">
                                <Icon name="CheckCircle2" size={12} className="mr-1" />
                                Выполнено
                              </Badge>
                              <Badge className="bg-yellow-500 text-white">
                                +{task.reward} монет
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">{activeTasks.length}</div>
              <div className="text-sm text-gray-600">Активных</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Выполнено</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {completedTasks.reduce((sum, t) => sum + t.reward, 0)}
              </div>
              <div className="text-sm text-gray-600">Заработано</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
