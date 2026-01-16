import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface LeisureActivity {
  id: number;
  title: string;
  category: string;
  date?: string;
  time?: string;
  status: string;
}

interface LeisureCalendarProps {
  activities: LeisureActivity[];
  onDateChange: (activityId: number, newDate: string) => void;
  onDateClick?: (date: string) => void;
}

export function LeisureCalendar({ activities, onDateChange, onDateClick }: LeisureCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedActivity, setDraggedActivity] = useState<number | null>(null);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      event: 'CalendarDays',
      restaurant: 'UtensilsCrossed',
      attraction: 'Landmark',
      entertainment: 'Gamepad2',
      sport: 'Dumbbell',
      culture: 'Theater',
      other: 'MapPin'
    };
    return icons[category] || 'MapPin';
  };

  const getActivitiesForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activities.filter(a => a.date === dateStr && a.status !== 'visited');
  };

  const handleDragStart = (activityId: number) => {
    setDraggedActivity(activityId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: number) => {
    if (draggedActivity) {
      const newDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onDateChange(draggedActivity, newDate);
      setDraggedActivity(null);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const unplannedActivities = activities.filter(a => !a.date && a.status === 'want_to_go');

  return (
    <div className="space-y-4">
      {unplannedActivities.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="Inbox" size={18} />
            Не запланировано ({unplannedActivities.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unplannedActivities.map(activity => (
              <Badge
                key={activity.id}
                variant="outline"
                draggable
                onDragStart={() => handleDragStart(activity.id)}
                className="cursor-move hover:bg-gray-50 px-3 py-2"
              >
                <Icon name={getCategoryIcon(activity.category)} size={12} className="mr-1" />
                {activity.title}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={previousMonth}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <h2 className="text-xl font-bold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayActivities = getActivitiesForDate(day);
            const isToday = new Date().getDate() === day &&
              new Date().getMonth() === currentMonth.getMonth() &&
              new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div
                key={day}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(day)}
                onClick={() => {
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  onDateClick?.(dateStr);
                }}
                className={`min-h-[100px] border rounded-lg p-2 ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                } hover:bg-gray-50 transition-colors cursor-pointer`}
              >
                <div className="text-sm font-semibold mb-1">{day}</div>
                <div className="space-y-1">
                  {dayActivities.map(activity => (
                    <div
                      key={activity.id}
                      draggable
                      onDragStart={() => handleDragStart(activity.id)}
                      className="text-xs bg-primary/10 text-primary rounded px-2 py-1 cursor-move hover:bg-primary/20 flex items-center gap-1"
                      title={activity.title}
                    >
                      <Icon name={getCategoryIcon(activity.category)} size={10} />
                      <span className="truncate flex-1">{activity.title}</span>
                      {activity.time && <span className="text-[10px]">{activity.time}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}