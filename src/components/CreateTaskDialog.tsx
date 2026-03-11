import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedMemberId?: string;
}

const weekDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function CreateTaskDialog({ open, onOpenChange, preselectedMemberId }: CreateTaskDialogProps) {
  const { createTask } = useTasks();
  const { members } = useFamilyMembersContext();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee_id: preselectedMemberId || 'unassigned',
    points: 10,
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'Дом',
    isRecurring: false,
    recurringFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: 1,
    recurringEndDate: '',
    recurringDaysOfWeek: [] as number[]
  });

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      assignee_id: preselectedMemberId || 'unassigned',
      points: 10,
      priority: 'medium',
      category: 'Дом',
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringDaysOfWeek: []
    });
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    const taskData: any = {
      title: newTask.title,
      description: newTask.description,
      assignee_id: newTask.assignee_id === 'unassigned' ? null : newTask.assignee_id,
      points: newTask.points,
      priority: newTask.priority,
      category: newTask.category,
      completed: false,
      isRecurring: newTask.isRecurring,
    };

    if (newTask.isRecurring) {
      taskData.recurringFrequency = newTask.recurringFrequency;
      taskData.recurringInterval = newTask.recurringInterval;
      if (newTask.recurringEndDate) taskData.recurringEndDate = newTask.recurringEndDate;
      if (newTask.recurringFrequency === 'weekly' && newTask.recurringDaysOfWeek.length > 0) {
        taskData.recurringDaysOfWeek = newTask.recurringDaysOfWeek;
      }
    }

    const result = await createTask(taskData);

    if (result?.success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const toggleDayOfWeek = (dayIdx: number) => {
    const days = newTask.recurringDaysOfWeek.includes(dayIdx)
      ? newTask.recurringDaysOfWeek.filter(d => d !== dayIdx)
      : [...newTask.recurringDaysOfWeek, dayIdx];
    setNewTask({ ...newTask, recurringDaysOfWeek: days });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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

          <div className="border-t pt-4">
            <div className="flex items-center gap-3">
              <Switch
                id="recurring-task"
                checked={newTask.isRecurring}
                onCheckedChange={(checked) => setNewTask({ ...newTask, isRecurring: checked })}
              />
              <Label htmlFor="recurring-task" className="cursor-pointer font-medium">
                Повторяющаяся задача
              </Label>
            </div>

            {newTask.isRecurring && (
              <div className="space-y-4 mt-4 pl-4 border-l-2 border-orange-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Частота</Label>
                    <Select
                      value={newTask.recurringFrequency}
                      onValueChange={(val: any) => setNewTask({ ...newTask, recurringFrequency: val })}
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
                      value={newTask.recurringInterval}
                      onChange={(e) => setNewTask({ ...newTask, recurringInterval: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                {newTask.recurringFrequency === 'weekly' && (
                  <div>
                    <Label>Дни недели</Label>
                    <div className="flex gap-2 mt-2">
                      {weekDayNames.map((day, idx) => (
                        <Badge
                          key={idx}
                          variant={newTask.recurringDaysOfWeek.includes(idx) ? 'default' : 'outline'}
                          className={`cursor-pointer ${newTask.recurringDaysOfWeek.includes(idx) ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
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
                    value={newTask.recurringEndDate}
                    onChange={(e) => setNewTask({ ...newTask, recurringEndDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreateTask} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600">
              Создать задачу
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
