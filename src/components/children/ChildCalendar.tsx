import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface ChildEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'health' | 'school' | 'hobby' | 'sport' | 'other';
  color: string;
  reminderEnabled: boolean;
}

interface ChildCalendarProps {
  child: FamilyMember;
}

const CATEGORY_CONFIG = {
  health: { label: 'Здоровье', icon: 'Heart', color: '#ef4444' },
  school: { label: 'Школа', icon: 'GraduationCap', color: '#8b5cf6' },
  hobby: { label: 'Кружки', icon: 'Palette', color: '#f59e0b' },
  sport: { label: 'Спорт', icon: 'Trophy', color: '#10b981' },
  other: { label: 'Другое', icon: 'Calendar', color: '#3b82f6' }
};

export function ChildCalendar({ child }: ChildCalendarProps) {
  const [events, setEvents] = useState<ChildEvent[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChildEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'upcoming' | 'month'>('upcoming');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'other' as ChildEvent['category'],
    reminderEnabled: true
  });

  // Загрузка событий из localStorage
  useEffect(() => {
    const storageKey = `child_calendar_${child.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, [child.id]);

  // Сохранение событий в localStorage
  const saveEvents = (updatedEvents: ChildEvent[]) => {
    const storageKey = `child_calendar_${child.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const event: ChildEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      category: newEvent.category,
      color: CATEGORY_CONFIG[newEvent.category].color,
      reminderEnabled: newEvent.reminderEnabled
    };

    saveEvents([...events, event]);
    setShowAddDialog(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'other',
      reminderEnabled: true
    });
  };

  const deleteEvent = (eventId: string) => {
    if (confirm('Удалить событие?')) {
      saveEvents(events.filter(e => e.id !== eventId));
      setSelectedEvent(null);
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .filter(e => filterCategory === 'all' || e.category === filterCategory)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  };

  const getEventsForMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return events
      .filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      })
      .filter(e => filterCategory === 'all' || e.category === filterCategory)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const displayedEvents = viewMode === 'upcoming' ? getUpcomingEvents() : getEventsForMonth();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={20} />
            Личный календарь {child.name}
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Icon name="Plus" size={16} />
            Добавить событие
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Фильтры */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('upcoming')}
            >
              Предстоящие
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Этот месяц
            </Button>
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const count = events.filter(e => e.category === key).length;
            return (
              <div
                key={key}
                className="text-center p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setFilterCategory(filterCategory === key ? 'all' : key)}
              >
                <Icon name={config.icon as any} size={20} className="mx-auto mb-1" style={{ color: config.color }} />
                <div className="text-xs font-medium text-gray-600">{config.label}</div>
                <div className="text-lg font-bold" style={{ color: config.color }}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Список событий */}
        {displayedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Icon name="Calendar" size={48} className="mx-auto mb-3 opacity-30" />
            <p>Нет событий</p>
            <p className="text-sm mt-1">Добавьте первое событие для {child.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedEvents.map(event => {
              const config = CATEGORY_CONFIG[event.category];
              return (
                <div
                  key={event.id}
                  className="p-4 border-l-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ borderLeftColor: event.color }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          <Icon name={config.icon as any} size={12} className="mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          {formatDate(event.date)}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {event.time}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                    {event.reminderEnabled && (
                      <Icon name="Bell" size={16} className="text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Диалог добавления события */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Добавить событие для {child.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название события</label>
              <Input
                placeholder="Визит к врачу, Занятие в секции..."
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Категория</label>
              <Select value={newEvent.category} onValueChange={(v) => setNewEvent({ ...newEvent, category: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon name={config.icon as any} size={16} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Дата</label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Время</label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Описание (необязательно)</label>
              <Textarea
                placeholder="Дополнительная информация..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={newEvent.reminderEnabled}
                onChange={(e) => setNewEvent({ ...newEvent, reminderEnabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="reminder" className="text-sm">
                Напомнить за день до события
              </label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={addEvent} disabled={!newEvent.title || !newEvent.date}>
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра события */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name={CATEGORY_CONFIG[selectedEvent.category].icon as any} size={20} />
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge style={{ backgroundColor: selectedEvent.color, color: 'white' }}>
                  {CATEGORY_CONFIG[selectedEvent.category].label}
                </Badge>
                {selectedEvent.reminderEnabled && (
                  <Badge variant="outline" className="gap-1">
                    <Icon name="Bell" size={12} />
                    Напоминание включено
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Icon name="Calendar" size={16} />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="Clock" size={16} />
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold mb-2">Описание</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Закрыть
              </Button>
              <Button variant="destructive" onClick={() => deleteEvent(selectedEvent.id)}>
                Удалить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
