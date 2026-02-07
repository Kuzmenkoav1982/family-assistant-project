import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedMemberId?: string;
}

export function CreateTaskDialog({ open, onOpenChange, preselectedMemberId }: CreateTaskDialogProps) {
  const { createTask } = useTasks();
  const { members } = useFamilyMembersContext();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee_id: preselectedMemberId || 'unassigned',
    points: 10,
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'Дом'
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    const result = await createTask({
      title: newTask.title,
      description: newTask.description,
      assignee_id: newTask.assignee_id === 'unassigned' ? null : newTask.assignee_id,
      points: newTask.points,
      priority: newTask.priority,
      category: newTask.category,
      completed: false
    });

    if (result?.success) {
      setNewTask({
        title: '',
        description: '',
        assignee_id: preselectedMemberId || 'unassigned',
        points: 10,
        priority: 'medium',
        category: 'Дом'
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
