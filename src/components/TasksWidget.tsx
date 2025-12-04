import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TasksWidget() {
  const { tasks, loading, toggleTask, createTask } = useTasks();
  const { members } = useFamilyMembers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee_id: 'unassigned',
    points: 10,
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'Дом'
  });

  const activeTasks = tasks?.filter(t => !t.completed).slice(0, 5) || [];
  const completedCount = tasks?.filter(t => t.completed).length || 0;

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    await createTask({
      title: newTask.title,
      description: newTask.description,
      assignee_id: newTask.assignee_id === 'unassigned' ? null : newTask.assignee_id,
      points: newTask.points,
      priority: newTask.priority,
      category: newTask.category,
      completed: false
    });

    setNewTask({
      title: '',
      description: '',
      assignee_id: 'unassigned',
      points: 10,
      priority: 'medium',
      category: 'Дом'
    });
    setIsDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="CheckSquare" size={20} />
            Задачи семьи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Загрузка задач...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Icon name="CheckSquare" size={20} />
          Задачи семьи
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {completedCount} выполнено
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Название</label>
                  <Input
                    placeholder="Например: Вынести мусор"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Описание</label>
                  <Textarea
                    placeholder="Дополнительные детали..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Исполнитель</label>
                    <Select value={newTask.assignee_id} onValueChange={(value) => setNewTask({ ...newTask, assignee_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Не назначено" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Не назначено</SelectItem>
                        {members?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Приоритет</label>
                    <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Баллы</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newTask.points}
                      onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Категория</label>
                    <Input
                      placeholder="Дом"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTask} className="flex-1">
                    Создать задачу
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen} className="mb-4">
          <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-blue-900 text-base">
                    Как работать с задачами
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium mb-1 text-sm">✅ Для чего нужны задачи?</p>
                        <p className="text-xs">
                          Задачи помогают организовать семейные дела и распределить обязанности между всеми. 
                          Каждый видит что нужно сделать и получает баллы за выполнение.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-1 text-sm">✨ Возможности</p>
                        <ul className="text-xs space-y-0.5 list-disc list-inside">
                          <li><strong>Создание задач:</strong> Добавляйте любые домашние дела</li>
                          <li><strong>Приоритеты:</strong> Низкий, средний, высокий</li>
                          <li><strong>Назначение:</strong> Укажите кто ответственен</li>
                          <li><strong>Баллы:</strong> Мотивация за выполнение</li>
                          <li><strong>Категории:</strong> Группируйте по типам</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-1 text-sm">📝 Как добавить задачу?</p>
                        <ol className="text-xs space-y-0.5 list-decimal list-inside">
                          <li>Нажмите <strong>"Добавить"</strong></li>
                          <li>Введите название задачи</li>
                          <li>Добавьте описание (опционально)</li>
                          <li>Выберите исполнителя</li>
                          <li>Установите приоритет</li>
                          <li>Укажите баллы за выполнение</li>
                          <li>Добавьте категорию</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-1 text-sm">🎯 Примеры задач</p>
                        <ul className="text-xs space-y-0.5 list-disc list-inside">
                          <li><strong>Дом:</strong> Вынести мусор, пылесосить, помыть посуду</li>
                          <li><strong>Покупки:</strong> Купить продукты, заказать доставку</li>
                          <li><strong>Дети:</strong> Помочь с уроками, отвести на тренировку</li>
                          <li><strong>Другое:</strong> Оплатить счета, записаться к врачу</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-1 text-sm">💪 Полезные советы</p>
                        <ul className="text-xs space-y-0.5 list-disc list-inside">
                          <li><strong>Регулярность:</strong> Проверяйте задачи каждый день</li>
                          <li><strong>Справедливость:</strong> Распределяйте задачи равномерно</li>
                          <li><strong>Похвала:</strong> Отмечайте успехи членов семьи</li>
                          <li><strong>Гибкость:</strong> Можно переназначить задачи</li>
                          <li><strong>Баллы:</strong> Используйте для мотивации детей</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs italic">
                          💡 <strong>Совет:</strong> Задачи помогают выработать ответственность у детей. Начните с простых дел, постепенно увеличивая сложность.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        {activeTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="CheckCircle" size={48} className="mx-auto mb-2 text-green-500" />
            <p>Все задачи выполнены! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => {
              const assignee = members?.find(m => m.id === task.assignee_id);
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                  >
                    {task.completed && (
                      <Icon name="Check" size={14} className="text-blue-500" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      {task.points && (
                        <Badge variant="secondary" className="text-xs">
                          {task.points} 🏆
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {assignee && (
                        <div className="flex items-center gap-1">
                          <Icon name="User" size={12} />
                          {assignee.name}
                        </div>
                      )}
                      {task.category && (
                        <div className="flex items-center gap-1">
                          <Icon name="Tag" size={12} />
                          {task.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}