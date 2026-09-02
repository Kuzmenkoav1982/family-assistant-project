import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { CalendarEvent, Task, FamilyGoal } from '@/types/family.types';
import { isEventPastToday } from '@/utils/eventTime';

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  events: (CalendarEvent | Task | FamilyGoal)[];
  onEventClick: (event: CalendarEvent | Task | FamilyGoal) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
}

export function DayEventsDialog({
  open,
  onOpenChange,
  selectedDate,
  events,
  onEventClick,
  onEventEdit,
  onEventDelete
}: DayEventsDialogProps) {
  const [showPast, setShowPast] = useState(false);

  if (!selectedDate) return null;

  const isEvent = (item: CalendarEvent | Task | FamilyGoal): item is CalendarEvent => {
    return 'category' in item && 'color' in item;
  };

  const isTask = (item: CalendarEvent | Task | FamilyGoal): item is Task => {
    return 'status' in item && !('members' in item);
  };

  const isGoal = (item: CalendarEvent | Task | FamilyGoal): item is FamilyGoal => {
    return 'progress' in item;
  };

  const getEventTypeLabel = (event: CalendarEvent | Task | FamilyGoal): string => {
    if (isTask(event)) return 'Задача';
    if (isGoal(event)) return 'Цель';
    return 'Событие';
  };

  const getEventTypeIcon = (event: CalendarEvent | Task | FamilyGoal) => {
    if (isTask(event)) return 'ListChecks';
    if (isGoal(event)) return 'Target';
    return 'Calendar';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      personal: 'Личное',
      family: 'Семья',
      work: 'Работа',
      health: 'Здоровье',
      education: 'Образование',
      leisure: 'Досуг'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-100 text-blue-700',
      family: 'bg-green-100 text-green-700',
      work: 'bg-purple-100 text-purple-700',
      health: 'bg-red-100 text-red-700',
      education: 'bg-yellow-100 text-yellow-700',
      leisure: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const isPast = (item: CalendarEvent | Task | FamilyGoal): boolean =>
    isToday && isEvent(item) && isEventPastToday(item.time, item.endTime);

  const upcomingItems = events.filter(item => !isPast(item));
  const pastItems = events.filter(isPast);

  const renderEventItem = (event: CalendarEvent | Task | FamilyGoal, idx: number) => (
    <div
      key={idx}
      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon name={getEventTypeIcon(event) as any} size={16} />
            <h4 className="font-semibold">{event.title}</h4>
          </div>
          {isEvent(event) && event.description && (
            <p className="text-sm text-gray-600">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{getEventTypeLabel(event)}</Badge>
          {isEvent(event) && (
            <Badge className={getCategoryColor(event.category)}>
              {getCategoryLabel(event.category)}
            </Badge>
          )}
        </div>
      </div>

      {isEvent(event) && event.time && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Icon name="Clock" size={14} />
          <span>{event.time}{event.endTime ? `–${event.endTime}` : ''}</span>
        </div>
      )}

      {isEvent(event) && event.isRecurring && (
        <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
          <Icon name="Repeat" size={14} />
          <span>Повторяющееся событие</span>
        </div>
      )}

      {isTask(event) && (
        <Badge variant={event.completed ? 'default' : 'secondary'}>
          {event.completed ? 'Выполнено' : 'В процессе'}
        </Badge>
      )}

      {isGoal(event) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Прогресс:</span>
          <Badge variant="secondary">{event.progress}%</Badge>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEventClick(event)}
        >
          <Icon name="Eye" size={14} className="mr-1" />
          Просмотр
        </Button>
        {isEvent(event) && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEventEdit(event)}
            >
              <Icon name="Pencil" size={14} className="mr-1" />
              Изменить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEventDelete(event.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Удалить
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            {formatDate(selectedDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="CalendarOff" size={48} className="mx-auto mb-2" />
              <p>Нет событий на этот день</p>
            </div>
          ) : (
            <>
              {upcomingItems.length > 0
                ? upcomingItems.map((event, idx) => renderEventItem(event, idx))
                : (
                  <p className="text-sm text-center text-gray-400 py-4">На сегодня больше ничего не запланировано</p>
                )}

              {pastItems.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowPast(v => !v)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon name={showPast ? 'ChevronUp' : 'ChevronDown'} size={14} />
                    {showPast ? 'Скрыть прошедшие' : `Показать прошедшие (${pastItems.length})`}
                  </button>
                  {showPast && (
                    <div className="space-y-3 mt-3 opacity-60">
                      {pastItems.map((event, idx) => renderEventItem(event, idx))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}