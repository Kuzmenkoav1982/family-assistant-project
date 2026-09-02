import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import type { FamilyMember } from '@/types/family.types';
import type { CalendarEvent } from '@/types/family.types';
import { isEventPastToday } from '@/utils/eventTime';

interface ChildCalendarProps {
  child: FamilyMember;
}

type ChildEventCategory = 'health' | 'education' | 'leisure' | 'family' | 'personal';

const CATEGORY_CONFIG: Record<ChildEventCategory, { label: string; icon: string; color: string }> = {
  health: { label: 'Здоровье', icon: 'Heart', color: '#ef4444' },
  education: { label: 'Школа', icon: 'GraduationCap', color: '#8b5cf6' },
  leisure: { label: 'Кружки', icon: 'Palette', color: '#f59e0b' },
  family: { label: 'Спорт', icon: 'Trophy', color: '#10b981' },
  personal: { label: 'Другое', icon: 'Calendar', color: '#3b82f6' },
};

const WEEKDAYS = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 0, label: 'Вс' },
];

const emptyForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  category: 'personal' as ChildEventCategory,
  reminderEnabled: true,
  daysOfWeek: [] as number[],
};

/** Проверяет, попадает ли повторяющееся событие на конкретную дату (еженедельно по дням недели) */
function isRecurringOnDate(event: CalendarEvent, targetDate: Date): boolean {
  if (!event.isRecurring || !event.recurringPattern) return false;
  const eventDate = new Date(event.date + 'T00:00:00');
  if (targetDate < eventDate) return false;
  if (event.recurringPattern.endDate) {
    const end = new Date(event.recurringPattern.endDate + 'T00:00:00');
    if (targetDate > end) return false;
  }
  const { frequency, daysOfWeek } = event.recurringPattern;
  if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
    return daysOfWeek.includes(targetDate.getDay());
  }
  return false;
}

export function ChildCalendar({ child }: ChildCalendarProps) {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newEvent, setNewEvent] = useState(emptyForm);
  const [showPastToday, setShowPastToday] = useState(false);

  // Только события этого ребёнка
  const childEvents = useMemo(
    () => events.filter(e => e.childId === child.id),
    [events, child.id]
  );

  const resetForm = () => setNewEvent(emptyForm);

  const openEdit = (event: CalendarEvent) => {
    setEditEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      endTime: event.endTime || '',
      category: (event.category as ChildEventCategory) || 'personal',
      reminderEnabled: event.reminderEnabled ?? true,
      daysOfWeek: event.recurringPattern?.daysOfWeek || [],
    });
    setSelectedEvent(null);
    setShowAddDialog(true);
  };

  const handleSubmit = async () => {
    if (!newEvent.title || !newEvent.date) return;

    const payload = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      endTime: newEvent.endTime,
      category: newEvent.category,
      color: CATEGORY_CONFIG[newEvent.category].color,
      visibility: 'family' as const,
      assignedTo: child.id,
      childId: child.id,
      reminderEnabled: newEvent.reminderEnabled,
      isRecurring: newEvent.daysOfWeek.length > 0,
      recurringFrequency: 'weekly' as const,
      recurringInterval: 1,
      recurringDaysOfWeek: newEvent.daysOfWeek,
    };

    const result = editEvent
      ? await updateEvent(editEvent.id, payload)
      : await createEvent(payload);

    if (result.success) {
      setShowAddDialog(false);
      setEditEvent(null);
      resetForm();
    } else {
      alert(result.error || 'Не удалось сохранить событие');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Удалить событие? Оно пропадёт и из общего календаря семьи.')) return;
    const result = await deleteEvent(eventId);
    if (result.success) {
      setSelectedEvent(null);
    } else {
      alert(result.error || 'Не удалось удалить событие');
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + 90);

    const singleOccurrences: Array<{ event: CalendarEvent; occursOn: Date }> = [];

    childEvents.forEach(e => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return;

      if (e.isRecurring) {
        for (let d = new Date(today); d <= horizon; d.setDate(d.getDate() + 1)) {
          if (isRecurringOnDate(e, new Date(d))) {
            singleOccurrences.push({ event: e, occursOn: new Date(d) });
            break; // ближайшее вхождение достаточно для списка "предстоящие"
          }
        }
      } else {
        // 'T00:00:00' без указания зоны — Date парсит как локальное время (не UTC), иначе дата съезжает на день назад
        const eventDate = new Date(e.date + 'T00:00:00');
        if (eventDate >= today) {
          singleOccurrences.push({ event: e, occursOn: eventDate });
        }
      }
    });

    const sorted = singleOccurrences.sort((a, b) => {
      const dateDiff = a.occursOn.getTime() - b.occursOn.getTime();
      if (dateDiff !== 0) return dateDiff;
      // В один день события сортируем по времени начала, а не по порядку добавления в календарь
      return (a.event.time || '').localeCompare(b.event.time || '');
    });

    // Событие сегодня, которое уже прошло по времени — откладываем в отдельную группу,
    // чтобы не мешало актуальным делам, но не терялось совсем (можно развернуть по клику)
    const isTodayOccurrence = (occursOn: Date) => occursOn.getTime() === today.getTime();
    const upcoming = sorted.filter(
      ({ event, occursOn }) => !isTodayOccurrence(occursOn) || !isEventPastToday(event.time, event.endTime)
    );
    const pastToday = sorted.filter(
      ({ event, occursOn }) => isTodayOccurrence(occursOn) && isEventPastToday(event.time, event.endTime)
    );

    return { upcoming: upcoming.slice(0, 10), pastToday };
  };

  const formatDate = (dateStr: string) => {
    // dateStr — YYYY-MM-DD. Парсим как локальную полночь (без 'T00:00:00' Date трактует строку как UTC,
    // из-за чего в часовых поясах восточнее UTC дата "съезжает" на день назад).
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  /** Форматирует Date-объект в YYYY-MM-DD в локальном часовом поясе (не UTC!) */
  const toLocalDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatRecurring = (event: CalendarEvent) => {
    if (!event.recurringPattern?.daysOfWeek?.length) return null;
    const names = event.recurringPattern.daysOfWeek
      .map(d => WEEKDAYS.find(w => w.value === d)?.label)
      .filter(Boolean);
    return `Каждую неделю: ${names.join(', ')}`;
  };

  const { upcoming: displayedEvents, pastToday } = getUpcomingEvents();

  const renderEventCard = (event: CalendarEvent, occursOn: Date) => {
    const config = CATEGORY_CONFIG[event.category as ChildEventCategory] || CATEGORY_CONFIG.personal;
    const recurringLabel = formatRecurring(event);
    return (
      <div
        key={event.id}
        className="p-4 border-l-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        style={{ borderLeftColor: event.color }}
        onClick={() => setSelectedEvent(event)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-gray-900">{event.title}</h4>
              <Badge variant="outline" className="text-xs">
                <Icon name={config.icon as any} size={12} className="mr-1" />
                {config.label}
              </Badge>
              {event.isRecurring && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Icon name="Repeat" size={11} />
                  Повтор
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                {formatDate(toLocalDateStr(occursOn))}
              </span>
              {event.time && (
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  {event.time}{event.endTime ? `–${event.endTime}` : ''}
                </span>
              )}
            </div>
            {recurringLabel && (
              <p className="text-xs text-gray-400 mt-1">{recurringLabel}</p>
            )}
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
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={20} />
            Календарь {child.name}
          </CardTitle>
          <Button
            onClick={() => { setEditEvent(null); resetForm(); setShowAddDialog(true); }}
            className="gap-2 w-full sm:w-auto whitespace-nowrap"
          >
            <Icon name="Plus" size={16} />
            <span className="hidden sm:inline">Добавить событие</span>
            <span className="sm:hidden">Добавить</span>
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          События сохраняются в общем календаре семьи и видны всем
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Фильтр по категории */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-40">
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

        {/* Статистика */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const count = childEvents.filter(e => e.category === key).length;
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
          </div>
        ) : displayedEvents.length === 0 && pastToday.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Icon name="Calendar" size={48} className="mx-auto mb-3 opacity-30" />
            <p>Нет событий</p>
            <p className="text-sm mt-1">Добавьте первое событие для {child.name}</p>
          </div>
        ) : displayedEvents.length > 0 && (
          <div className="space-y-2">
            {displayedEvents.map(({ event, occursOn }) => renderEventCard(event, occursOn))}
          </div>
        )}

        {/* Прошедшие сегодня события — свёрнуты по умолчанию, чтобы не путать с актуальными */}
        {pastToday.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowPastToday(v => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name={showPastToday ? 'ChevronUp' : 'ChevronDown'} size={14} />
              {showPastToday ? 'Скрыть прошедшие' : `Показать прошедшие сегодня (${pastToday.length})`}
            </button>
            {showPastToday && (
              <div className="space-y-2 mt-2 opacity-60">
                {pastToday.map(({ event, occursOn }) => renderEventCard(event, occursOn))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Диалог добавления/редактирования события */}
      <Dialog open={showAddDialog} onOpenChange={(v) => { setShowAddDialog(v); if (!v) { setEditEvent(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editEvent ? `Изменить событие` : `Добавить событие для ${child.name}`}</DialogTitle>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Дата</label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Время начала</label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Время окончания (необязательно)</label>
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Повторять по дням недели (необязательно)</label>
              <div className="flex gap-1.5">
                {WEEKDAYS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      const days = newEvent.daysOfWeek.includes(d.value)
                        ? newEvent.daysOfWeek.filter(x => x !== d.value)
                        : [...newEvent.daysOfWeek, d.value];
                      setNewEvent({ ...newEvent, daysOfWeek: days });
                    }}
                    className={`flex-1 h-9 rounded-lg text-xs font-semibold border transition-colors ${
                      newEvent.daysOfWeek.includes(d.value)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {newEvent.daysOfWeek.length > 0 && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Событие будет повторяться каждую неделю и появится в общем календаре семьи
                </p>
              )}
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
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditEvent(null); resetForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={!newEvent.title || !newEvent.date}>
              {editEvent ? 'Сохранить' : 'Добавить'}
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
                <Icon name={(CATEGORY_CONFIG[selectedEvent.category as ChildEventCategory]?.icon || 'Calendar') as any} size={20} />
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge style={{ backgroundColor: selectedEvent.color, color: 'white' }}>
                  {CATEGORY_CONFIG[selectedEvent.category as ChildEventCategory]?.label || 'Другое'}
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
                    <span>{selectedEvent.time}{selectedEvent.endTime ? `–${selectedEvent.endTime}` : ''}</span>
                  </div>
                )}
                {formatRecurring(selectedEvent) && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Icon name="Repeat" size={16} />
                    <span>{formatRecurring(selectedEvent)}</span>
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
              <Button variant="outline" onClick={() => openEdit(selectedEvent)}>
                <Icon name="Pencil" size={14} className="mr-1.5" />
                Изменить
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(selectedEvent.id)}>
                Удалить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}