import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const weekDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const emptyTask = {
  title: '',
  description: '',
  assignee_id: 'unassigned',
  points: 10,
  priority: 'medium' as 'low' | 'medium' | 'high',
  category: 'Дом',
  deadline: '',
  taskTime: '',
  isRecurring: false,
  recurringFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  recurringInterval: 1,
  recurringEndDate: '',
  recurringDaysOfWeek: [] as number[]
};

interface FamilyMember {
  id: string;
  name: string;
}

function TaskForm({ task, setTask, members }: {
  task: typeof emptyTask;
  setTask: (t: typeof emptyTask) => void;
  members: FamilyMember[] | undefined;
}) {
  const toggleDayOfWeek = (dayIdx: number) => {
    const days = task.recurringDaysOfWeek.includes(dayIdx)
      ? task.recurringDaysOfWeek.filter(d => d !== dayIdx)
      : [...task.recurringDaysOfWeek, dayIdx];
    setTask({ ...task, recurringDaysOfWeek: days });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Название</label>
        <Input
          placeholder="Например: Вынести мусор"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Описание</label>
        <Textarea
          placeholder="Дополнительные детали..."
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Исполнитель</label>
          <Select value={task.assignee_id} onValueChange={(value) => setTask({ ...task, assignee_id: value })}>
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
          <Select value={task.priority} onValueChange={(value: string) => setTask({ ...task, priority: value as typeof emptyTask['priority'] })}>
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
          <label className="text-sm font-medium mb-1 block">Дата</label>
          <Input
            type="date"
            value={task.deadline}
            onChange={(e) => setTask({ ...task, deadline: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Время</label>
          <Input
            type="time"
            value={task.taskTime}
            onChange={(e) => setTask({ ...task, taskTime: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Баллы</label>
          <Input
            type="number"
            min="1"
            max="100"
            value={task.points}
            onChange={(e) => setTask({ ...task, points: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Категория</label>
          <Input
            placeholder="Дом"
            value={task.category}
            onChange={(e) => setTask({ ...task, category: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-3">
          <Switch
            id="recurring-task-form"
            checked={task.isRecurring}
            onCheckedChange={(checked) => setTask({ ...task, isRecurring: checked })}
          />
          <Label htmlFor="recurring-task-form" className="cursor-pointer font-medium">
            Повторяющаяся задача
          </Label>
        </div>

        {task.isRecurring && (
          <div className="space-y-4 mt-4 pl-4 border-l-2 border-orange-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Частота</Label>
                <Select
                  value={task.recurringFrequency}
                  onValueChange={(val: string) => setTask({ ...task, recurringFrequency: val as typeof emptyTask['recurringFrequency'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Ежедневно</SelectItem>
                    <SelectItem value="weekly">Еженедельно</SelectItem>
                    <SelectItem value="monthly">Ежемесячно</SelectItem>
                    <SelectItem value="yearly">Ежегодно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Интервал</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={task.recurringInterval}
                  onChange={(e) => setTask({ ...task, recurringInterval: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {task.recurringFrequency === 'weekly' && (
              <div>
                <Label>Дни недели</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {weekDayNames.map((day, idx) => (
                    <Badge
                      key={idx}
                      variant={task.recurringDaysOfWeek.includes(idx) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDayOfWeek(idx)}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Дата окончания (необязательно)</Label>
              <Input
                type="date"
                value={task.recurringEndDate}
                onChange={(e) => setTask({ ...task, recurringEndDate: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDeadline(deadline: string | undefined | null): string | null {
  if (!deadline) return null;
  try {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const timeStr = d.getHours() > 0 || d.getMinutes() > 0
      ? ` ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      : '';

    if (diffDays === 0) return `Сегодня${timeStr}`;
    if (diffDays === 1) return `Завтра${timeStr}`;
    if (diffDays === -1) return `Вчера${timeStr}`;
    if (diffDays < -1) return `Просрочена${timeStr}`;

    return `${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}${timeStr}`;
  } catch {
    return null;
  }
}

function getFrequencyLabel(freq?: string): string {
  switch (freq) {
    case 'daily': return 'Ежедневно';
    case 'weekly': return 'Еженедельно';
    case 'monthly': return 'Ежемесячно';
    case 'yearly': return 'Ежегодно';
    default: return 'Повтор';
  }
}

export function TasksWidget() {
  const { tasks, loading, toggleTask, createTask, updateTask } = useTasks();
  const { members } = useFamilyMembersContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<(typeof emptyTask & { id: string }) | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ ...emptyTask });

  const activeTasks = tasks?.filter(t => !t.completed).slice(0, 5) || [];
  const completedCount = tasks?.filter(t => t.completed).length || 0;

  const buildTaskPayload = (formData: typeof emptyTask) => {
    const payload: Record<string, unknown> = {
      title: formData.title,
      description: formData.description,
      assignee_id: formData.assignee_id === 'unassigned' ? null : formData.assignee_id,
      points: formData.points,
      priority: formData.priority,
      category: formData.category,
      completed: false,
      isRecurring: formData.isRecurring,
    };

    if (formData.deadline || formData.taskTime) {
      const date = formData.deadline || new Date().toISOString().split('T')[0];
      const time = formData.taskTime || '00:00';
      payload.deadline = `${date}T${time}:00`;
    }

    if (formData.isRecurring) {
      payload.recurringFrequency = formData.recurringFrequency;
      payload.recurringInterval = formData.recurringInterval;
      if (formData.recurringEndDate) payload.recurringEndDate = formData.recurringEndDate;
      if (formData.recurringFrequency === 'weekly' && formData.recurringDaysOfWeek.length > 0) {
        payload.recurringDaysOfWeek = formData.recurringDaysOfWeek;
      }
    }

    return payload;
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    await createTask(buildTaskPayload(newTask));
    setNewTask({ ...emptyTask });
    setIsDialogOpen(false);
  };

  const handleEditTask = (task: Record<string, unknown>) => {
    const deadlineDate = task.deadline ? new Date(task.deadline as string) : null;
    const daysOfWeek = task.recurring_days_of_week
      ? (typeof task.recurring_days_of_week === 'string'
        ? task.recurring_days_of_week.split(',').map(Number)
        : Array.isArray(task.recurring_days_of_week) ? task.recurring_days_of_week : [])
      : [];

    setEditingTask({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      assignee_id: task.assignee_id || 'unassigned',
      points: task.points || 10,
      priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
      category: task.category || 'Дом',
      deadline: deadlineDate ? deadlineDate.toISOString().split('T')[0] : '',
      taskTime: deadlineDate && (deadlineDate.getHours() > 0 || deadlineDate.getMinutes() > 0)
        ? `${deadlineDate.getHours().toString().padStart(2, '0')}:${deadlineDate.getMinutes().toString().padStart(2, '0')}`
        : '',
      isRecurring: task.is_recurring || false,
      recurringFrequency: (task.recurring_frequency || 'weekly') as 'daily' | 'weekly' | 'monthly' | 'yearly',
      recurringInterval: task.recurring_interval || 1,
      recurringEndDate: task.recurring_end_date || '',
      recurringDaysOfWeek: daysOfWeek,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editingTask.title.trim()) return;
    const payload = buildTaskPayload(editingTask);
    payload.id = editingTask.id;
    delete payload.completed;
    await updateTask(payload as Parameters<typeof updateTask>[0]);
    setIsEditDialogOpen(false);
    setEditingTask(null);
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="CheckSquare" size={20} />
          Задачи
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] flex items-center justify-center px-2 py-0.5">
            <span className="leading-none">{completedCount} выполнено</span>
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Icon name="Plus" size={16} className="mr-1" />
                <span className="leading-none">Добавить</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <TaskForm task={newTask} setTask={setNewTask} members={members} />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button className="flex-1" onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Icon name="Info" size={18} className="text-blue-600 shrink-0" />
                <span className="font-semibold text-blue-800 text-sm">Как работать с задачами</span>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Icon name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} size={18} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <AlertDescription className="mt-3 text-blue-700 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1 text-sm">📋 Создание задач</p>
                    <ol className="text-xs space-y-0.5 list-decimal list-inside">
                      <li>Нажмите «Добавить»</li>
                      <li>Укажите название, описание, дату и время</li>
                      <li>Выберите исполнителя</li>
                      <li>Укажите баллы за выполнение</li>
                      <li>Для регулярных дел включите «Повтор»</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-sm">✏️ Редактирование</p>
                    <p className="text-xs">Нажмите на иконку карандаша справа от задачи, чтобы изменить любое поле.</p>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs italic">
                      💡 <strong>Совет:</strong> Задачи помогают выработать ответственность у детей. Начните с простых дел, постепенно увеличивая сложность.
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </CollapsibleContent>
          </Alert>
        </Collapsible>

        {activeTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="CheckSquare" size={48} className="mx-auto mb-2 text-blue-500" />
            <p>Все задачи выполнены! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => {
              const assignee = members?.find(m => m.id === task.assignee_id);
              const deadlineLabel = formatDeadline(task.deadline);
              const isOverdue = deadlineLabel?.startsWith('Просрочена');
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors shrink-0"
                  >
                    {task.completed && (
                      <Icon name="Check" size={14} className="text-blue-500" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={`text-[10px] px-1.5 py-0 ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      {task.points && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {task.points} 🏆
                        </Badge>
                      )}
                      {task.is_recurring && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-600 whitespace-nowrap">
                          <Icon name="Repeat" size={10} className="mr-0.5" />
                          {getFrequencyLabel(task.recurring_frequency)}
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-1.5 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
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
                      {deadlineLabel && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                          <Icon name="Clock" size={12} />
                          {deadlineLabel}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="mt-1 p-1 rounded hover:bg-gray-100 transition-colors shrink-0"
                    title="Редактировать"
                  >
                    <Icon name="Pencil" size={14} className="text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingTask(null);
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <>
              <TaskForm task={editingTask} setTask={setEditingTask} members={members} />
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                  Отмена
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit} disabled={!editingTask.title.trim()}>
                  Сохранить
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}