import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type CalendarView = 'week' | 'month';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'event' | 'birthday';
  completed?: boolean;
}

interface MemberCalendarProps {
  memberId: string;
  memberName: string;
}

export function MemberCalendar({ memberId, memberName }: MemberCalendarProps) {
  const [view, setView] = useState<CalendarView>(() => {
    const saved = localStorage.getItem(`calendarView_${memberId}`);
    return (saved as CalendarView) || 'week';
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const [events] = useState<CalendarEvent[]>([
    { id: '1', title: 'Убрать комнату', date: '2025-11-26', type: 'task', completed: false },
    { id: '2', title: 'Семейный ужин', date: '2025-11-27', type: 'event' },
    { id: '3', title: 'День рождения', date: '2025-11-30', type: 'birthday' },
  ]);

  useEffect(() => {
    localStorage.setItem(`calendarView_${memberId}`, view);
  }, [view, memberId]);

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < startDay; i++) {
      const prevDate = new Date(year, month, -startDay + i + 1);
      days.push({ date: prevDate, currentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (view === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const prevPeriod = () => {
    const prev = new Date(currentDate);
    if (view === 'week') {
      prev.setDate(prev.getDate() - 7);
    } else {
      prev.setMonth(prev.getMonth() - 1);
    }
    setCurrentDate(prev);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task': return 'CheckSquare';
      case 'event': return 'Calendar';
      case 'birthday': return 'Cake';
      default: return 'Circle';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'event': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'birthday': return 'bg-pink-100 text-pink-700 border-pink-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            Календарь {memberName}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              <Icon name="CalendarDays" size={16} className="mr-1" />
              Неделя
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              <Icon name="Calendar" size={16} className="mr-1" />
              Месяц
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={prevPeriod}>
            <Icon name="ChevronLeft" size={18} />
          </Button>
          <h3 className="text-lg font-semibold">
            {view === 'month' 
              ? currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
              : `Неделя ${Math.ceil(currentDate.getDate() / 7)}, ${currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`
            }
          </h3>
          <Button variant="ghost" size="sm" onClick={nextPeriod}>
            <Icon name="ChevronRight" size={18} />
          </Button>
        </div>

        {view === 'week' ? (
          <div className="space-y-2">
            {getWeekDays().map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 ${
                    isToday 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isToday ? 'text-purple-700' : 'text-gray-700'}`}>
                        {day.toLocaleDateString('ru-RU', { weekday: 'long' })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <Badge variant="outline" className={isToday ? 'bg-purple-200' : ''}>
                      {dayEvents.length} событий
                    </Badge>
                  </div>
                  
                  {dayEvents.length > 0 ? (
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`flex items-center gap-2 p-2 rounded border ${getEventColor(event.type)}`}
                        >
                          <Icon name={getEventIcon(event.type)} size={14} />
                          <span className="text-xs font-medium">{event.title}</span>
                          {event.type === 'task' && event.completed && (
                            <Icon name="Check" size={12} className="ml-auto text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">Нет событий</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getMonthDays().map((dayObj, idx) => {
                const dayEvents = getEventsForDate(dayObj.date);
                const isToday = dayObj.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={idx}
                    className={`aspect-square p-1 rounded border ${
                      !dayObj.currentMonth
                        ? 'bg-gray-50 border-gray-100'
                        : isToday
                        ? 'border-2 border-purple-400 bg-purple-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-xs font-semibold ${
                      !dayObj.currentMonth 
                        ? 'text-gray-400' 
                        : isToday 
                        ? 'text-purple-700' 
                        : 'text-gray-700'
                    }`}>
                      {dayObj.date.getDate()}
                    </div>
                    {dayEvents.length > 0 && dayObj.currentMonth && (
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-[8px] px-1 py-0.5 rounded ${getEventColor(event.type)}`}
                            title={event.title}
                          >
                            {event.title.slice(0, 8)}...
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[8px] text-gray-500 font-medium">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <Icon name="Info" size={14} />
            Настройки вида календаря сохраняются автоматически
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
