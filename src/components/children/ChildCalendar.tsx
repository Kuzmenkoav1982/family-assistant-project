import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/types/family.types';

interface ChildEvent {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  category: 'health' | 'school' | 'hobby' | 'sport' | 'friend' | 'other';
  color?: string;
  reminder_enabled?: boolean;
  completed?: boolean;
}

interface ChildCalendarProps {
  child: FamilyMember;
}

const CATEGORIES = {
  health: { label: 'Здоровье', icon: 'Heart', color: 'bg-red-100 text-red-700' },
  school: { label: 'Школа', icon: 'GraduationCap', color: 'bg-blue-100 text-blue-700' },
  hobby: { label: 'Хобби', icon: 'Palette', color: 'bg-purple-100 text-purple-700' },
  sport: { label: 'Спорт', icon: 'Dumbbell', color: 'bg-green-100 text-green-700' },
  friend: { label: 'Друзья', icon: 'Users', color: 'bg-yellow-100 text-yellow-700' },
  other: { label: 'Другое', icon: 'Star', color: 'bg-gray-100 text-gray-700' }
};

export function ChildCalendar({ child }: ChildCalendarProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<ChildEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChildEvent | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all'>('upcoming');
  const [newEvent, setNewEvent] = useState<Partial<ChildEvent>>({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'other',
    reminder_enabled: true
  });

  useEffect(() => {
    loadEvents();
  }, [child.id]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const familyId = JSON.parse(localStorage.getItem('userData') || '{}').family_id;
      
      const response = await fetch('https://functions.poehali.dev/bc0c3710-e24a-4171-aa84-0311d97d14d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_child_events',
          familyId,
          childId: child.id
        })
      });

      if (!response.ok) throw new Error('Failed to load events');
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить события',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: 'Заполните поля',
        description: 'Укажите название и дату события',
        variant: 'destructive'
      });
      return;
    }

    try {
      const familyId = JSON.parse(localStorage.getItem('userData') || '{}').family_id;
      
      const response = await fetch('https://functions.poehali.dev/bc0c3710-e24a-4171-aa84-0311d97d14d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingEvent ? 'update_child_event' : 'add_child_event',
          familyId,
          childId: child.id,
          eventId: editingEvent?.id,
          event: {
            ...newEvent,
            child_id: child.id
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save event');

      toast({
        title: editingEvent ? 'Событие обновлено' : 'Событие добавлено',
        description: `"${newEvent.title}" успешно сохранено`
      });

      setShowAddDialog(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        category: 'other',
        reminder_enabled: true
      });
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить событие',
        variant: 'destructive'
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Удалить это событие?')) return;

    try {
      const familyId = JSON.parse(localStorage.getItem('userData') || '{}').family_id;
      
      const response = await fetch('https://functions.poehali.dev/bc0c3710-e24a-4171-aa84-0311d97d14d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_child_event',
          familyId,
          eventId
        })
      });

      if (!response.ok) throw new Error('Failed to delete event');

      toast({ title: 'Событие удалено' });
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Ошибка удаления',
        variant: 'destructive'
      });
    }
  };

  const toggleComplete = async (event: ChildEvent) => {
    try {
      const familyId = JSON.parse(localStorage.getItem('userData') || '{}').family_id;
      
      const response = await fetch('https://functions.poehali.dev/bc0c3710-e24a-4171-aa84-0311d97d14d9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_child_event',
          familyId,
          childId: child.id,
          eventId: event.id,
          event: { ...event, completed: !event.completed }
        })
      });

      if (!response.ok) throw new Error('Failed to update event');
      loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const filteredEvents = viewMode === 'upcoming' 
    ? events.filter(e => new Date(e.date) >= new Date() && !e.completed)
    : events;

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const groupEventsByMonth = (events: ChildEvent[]) => {
    const grouped: Record<string, ChildEvent[]> = {};
    events.forEach(event => {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByMonth(sortedEvents);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Calendar" size={24} className="text-purple-600" />
            Личный календарь {child.name}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('upcoming')}
            >
              Предстоящие
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('all')}
            >
              Все
            </Button>
            <Button 
              onClick={() => {
                setEditingEvent(null);
                setNewEvent({
                  title: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  time: '',
                  category: 'other',
                  reminder_enabled: true
                });
                setShowAddDialog(true);
              }}
              className="gap-2"
            >
              <Icon name="Plus" size={18} />
              Добавить
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Загрузка событий...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="CalendarOff" size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">
              {viewMode === 'upcoming' ? 'Нет предстоящих событий' : 'Календарь пуст'}
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-2">
              Добавить первое событие
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => {
              const [year, month] = monthKey.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('ru-RU', { 
                month: 'long', 
                year: 'numeric' 
              });

              return (
                <div key={monthKey}>
                  <h3 className="font-semibold text-lg text-gray-700 mb-3 capitalize">
                    {monthName}
                  </h3>
                  <div className="space-y-2">
                    {monthEvents.map(event => {
                      const category = CATEGORIES[event.category];
                      const eventDate = new Date(event.date);
                      const isPast = eventDate < new Date() && !event.completed;

                      return (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            event.completed 
                              ? 'bg-gray-50 border-gray-200 opacity-60' 
                              : isPast
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={event.completed || false}
                              onChange={() => toggleComplete(event)}
                              className="mt-1 w-5 h-5 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className={`font-semibold ${event.completed ? 'line-through text-gray-500' : ''}`}>
                                    {event.title}
                                  </h4>
                                  {event.description && (
                                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                  )}
                                </div>
                                <Badge className={category.color}>
                                  <Icon name={category.icon as any} size={14} className="mr-1" />
                                  {category.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Icon name="Calendar" size={14} />
                                  {eventDate.toLocaleDateString('ru-RU')}
                                </span>
                                {event.time && (
                                  <span className="flex items-center gap-1">
                                    <Icon name="Clock" size={14} />
                                    {event.time}
                                  </span>
                                )}
                                {event.reminder_enabled && (
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <Icon name="Bell" size={14} />
                                    Напоминание
                                  </span>
                                )}
                                {isPast && !event.completed && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                    Просрочено
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingEvent(event);
                                  setNewEvent(event);
                                  setShowAddDialog(true);
                                }}
                              >
                                <Icon name="Edit" size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEvent(event.id)}
                              >
                                <Icon name="Trash2" size={16} className="text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Редактировать событие' : 'Новое событие'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название *</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Например: Визит к стоматологу"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Дополнительная информация"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Дата *</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Время</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Категория</Label>
              <Select
                value={newEvent.category}
                onValueChange={(value: any) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon name={cat.icon as any} size={16} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={newEvent.reminder_enabled}
                onChange={(e) => setNewEvent({ ...newEvent, reminder_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="reminder" className="cursor-pointer">
                Включить напоминание за день до события
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={saveEvent}>
              {editingEvent ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}