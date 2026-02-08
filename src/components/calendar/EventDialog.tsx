import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useEffect } from 'react';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newEvent: {
    title: string;
    description: string;
    date: string;
    time: string;
    category: string;
    color: string;
    visibility: 'family' | 'private';
    assignedTo: string;
    attendees: string[];
    reminderEnabled: boolean;
    reminderDays: number;
    reminderDate: string;
    reminderTime: string;
    isRecurring: boolean;
    recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurringInterval: number;
    recurringEndDate: string;
    recurringDaysOfWeek: number[];
  };
  onEventChange: (field: string, value: any) => void;
  onSaveEvent: () => void;
  editingEventId: string | null;
}

const categoryColors: Record<string, string> = {
  personal: '#3b82f6',
  family: '#10b981',
  work: '#8b5cf6',
  health: '#ef4444',
  education: '#f59e0b',
  leisure: '#ec4899'
};

const weekDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function EventDialog({
  open,
  onOpenChange,
  newEvent,
  onEventChange,
  onSaveEvent,
  editingEventId
}: EventDialogProps) {
  const { members } = useFamilyMembersContext();

  // КРИТИЧНО: Синхронизация assignedTo при открытии диалога
  useEffect(() => {
    if (open && !newEvent.assignedTo) {
      // Если assignedTo пустой/null - устанавливаем 'all'
      onEventChange('assignedTo', 'all');
    }
  }, [open, newEvent.assignedTo, onEventChange]);

  const handleSave = () => {
    if (!newEvent.title || !newEvent.date) {
      alert('Пожалуйста, заполните название и дату события');
      return;
    }
    
    // КРИТИЧНО: Проверяем assignedTo перед сохранением
    if (!newEvent.assignedTo) {
      onEventChange('assignedTo', 'all');
    }
    
    onSaveEvent();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            {editingEventId ? 'Редактировать событие' : 'Новое событие'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Название события *</Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) => onEventChange('title', e.target.value)}
              placeholder="Введите название"
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => onEventChange('description', e.target.value)}
              placeholder="Добавьте описание"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => onEventChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => onEventChange('time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Категория</Label>
            <Select value={newEvent.category} onValueChange={(val) => onEventChange('category', val)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Личное</SelectItem>
                <SelectItem value="family">Семья</SelectItem>
                <SelectItem value="work">Работа</SelectItem>
                <SelectItem value="health">Здоровье</SelectItem>
                <SelectItem value="education">Образование</SelectItem>
                <SelectItem value="leisure">Досуг</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Цвет</Label>
            <div className="flex gap-2 mt-2">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <button
                  key={cat}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    newEvent.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onEventChange('color', color)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Для кого событие</Label>
            <Select 
              key={`assignedTo-${newEvent.assignedTo || 'all'}`}
              value={newEvent.assignedTo || 'all'} 
              onValueChange={(val) => onEventChange('assignedTo', val)}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Выберите члена семьи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Вся семья</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visibility">Видимость</Label>
            <Select value={newEvent.visibility} onValueChange={(val) => onEventChange('visibility', val)}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Вся семья</SelectItem>
                <SelectItem value="private">Только я</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Switch
                id="reminder"
                checked={newEvent.reminderEnabled}
                onCheckedChange={(checked) => onEventChange('reminderEnabled', checked)}
              />
              <Label htmlFor="reminder" className="cursor-pointer">
                Напоминание
              </Label>
            </div>
            {newEvent.reminderEnabled && (
              <div className="space-y-3 pl-8 border-l-2 border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminderDate">Дата напоминания</Label>
                    <Input
                      id="reminderDate"
                      type="date"
                      value={newEvent.reminderDate}
                      onChange={(e) => onEventChange('reminderDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reminderTime">Время напоминания</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={newEvent.reminderTime}
                      onChange={(e) => onEventChange('reminderTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="recurring"
                  checked={newEvent.isRecurring}
                  onCheckedChange={(checked) => onEventChange('isRecurring', checked)}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Повторяющееся событие
                </Label>
              </div>
            </div>

            {newEvent.isRecurring && (
              <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Частота</Label>
                    <Select 
                      value={newEvent.recurringFrequency} 
                      onValueChange={(val) => onEventChange('recurringFrequency', val)}
                    >
                      <SelectTrigger id="frequency">
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
                    <Label htmlFor="interval">Интервал</Label>
                    <Input
                      id="interval"
                      type="number"
                      min={1}
                      max={30}
                      value={newEvent.recurringInterval}
                      onChange={(e) => onEventChange('recurringInterval', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {newEvent.recurringFrequency === 'weekly' && (
                  <div>
                    <Label>Дни недели</Label>
                    <div className="flex gap-2 mt-2">
                      {weekDayNames.map((day, idx) => (
                        <Badge
                          key={idx}
                          variant={newEvent.recurringDaysOfWeek.includes(idx) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const days = newEvent.recurringDaysOfWeek.includes(idx)
                              ? newEvent.recurringDaysOfWeek.filter(d => d !== idx)
                              : [...newEvent.recurringDaysOfWeek, idx];
                            onEventChange('recurringDaysOfWeek', days);
                          }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="endDate">Дата окончания (необязательно)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.recurringEndDate}
                    onChange={(e) => onEventChange('recurringEndDate', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
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