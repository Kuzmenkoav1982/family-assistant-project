import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import type { CalendarEvent, Task, FamilyGoal } from '@/types/family.types';

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: (CalendarEvent | Task | FamilyGoal)[];
}

interface CalendarGridProps {
  days: CalendarDay[];
  viewMode: ViewMode;
  onDayClick: (date: Date, events: (CalendarEvent | Task | FamilyGoal)[]) => void;
  onEventClick: (event: CalendarEvent | Task | FamilyGoal) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onCreateEvent?: (date: Date) => void;
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function CalendarGrid({
  days,
  viewMode,
  onDayClick,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onCreateEvent
}: CalendarGridProps) {
  const today = new Date().toISOString().split('T')[0];

  const isEvent = (item: CalendarEvent | Task | FamilyGoal): item is CalendarEvent => {
    return 'category' in item && 'color' in item;
  };

  const isTask = (item: CalendarEvent | Task | FamilyGoal): item is Task => {
    return 'status' in item && !('members' in item);
  };

  const isGoal = (item: CalendarEvent | Task | FamilyGoal): item is FamilyGoal => {
    return 'progress' in item;
  };

  const getEventColor = (event: CalendarEvent | Task | FamilyGoal): string => {
    if (isEvent(event)) return event.color;
    if (isTask(event)) return '#f59e0b';
    if (isGoal(event)) return '#8b5cf6';
    return '#3b82f6';
  };

  const getEventIcon = (event: CalendarEvent | Task | FamilyGoal) => {
    if (isTask(event)) return <Icon name="ListChecks" size={12} />;
    if (isGoal(event)) return <Icon name="Target" size={12} />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-2`}>
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-2`}>
        {days.map((day, idx) => {
          const dateStr = day.date.toISOString().split('T')[0];
          const isToday = dateStr === today;
          
          return (
            <Card
              key={idx}
              className={`min-h-[120px] p-2 cursor-pointer transition-all hover:shadow-md ${
                !day.isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onClick={(e) => {
                if (day.events.length === 0 && onCreateEvent) {
                  onCreateEvent(day.date);
                } else {
                  onDayClick(day.date, day.events);
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </span>
                {day.events.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {day.events.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                {day.events.slice(0, 3).map((event, eventIdx) => (
                  <DropdownMenu key={eventIdx}>
                    <DropdownMenuTrigger asChild>
                      <div
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 flex items-center gap-1"
                        style={{ 
                          backgroundColor: getEventColor(event) + '20',
                          color: getEventColor(event),
                          border: `1px solid ${getEventColor(event)}40`
                        }}
                      >
                        {getEventIcon(event)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}>
                        <Icon name="Eye" size={14} className="mr-2" />
                        Просмотр
                      </DropdownMenuItem>
                      {isEvent(event) && (
                        <>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEventEdit(event);
                          }}>
                            <Icon name="Pencil" size={14} className="mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventDelete(event.id);
                            }}
                            className="text-red-600"
                          >
                            <Icon name="Trash2" size={14} className="mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
                {day.events.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.events.length - 3} еще
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}