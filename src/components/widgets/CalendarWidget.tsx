import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { getWeekDays } from '@/data/mockData';
import type { CalendarEvent } from '@/types/family.types';

interface CalendarWidgetProps {
  calendarEvents: CalendarEvent[];
}

export function CalendarWidget({ calendarEvents }: CalendarWidgetProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'today' | 'week'>('week');
  
  // Получаем события на текущий месяц
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const monthEvents = calendarEvents.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= monthStart && eventDate <= monthEnd;
  });
  
  // Получаем сегодняшние события
  const today = new Date();
  const todayEvents = calendarEvents.filter(e => 
    new Date(e.date).toDateString() === today.toDateString()
  );
  
  return (
    <Card
      className="animate-fade-in border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 cursor-pointer hover:shadow-lg transition-all"
      style={{ animationDelay: '0.5s' }}
      onClick={() => navigate('/calendar')}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            Календарь
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            {monthEvents.length} событий в месяце
          </Badge>
        </div>
        
        {/* Переключатель режимов */}
        <div className="flex gap-2 mt-3">
          <Button
            variant={viewMode === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('today');
            }}
            className={viewMode === 'today' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <Icon name="Calendar" size={16} className="mr-1" />
            Сегодня
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('week');
            }}
            className={viewMode === 'week' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <Icon name="CalendarDays" size={16} className="mr-1" />
            Неделя
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'today' ? (
          // Режим "Сегодня"
          <div className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Calendar" size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Нет событий на сегодня</p>
                <p className="text-xs mt-1">Наслаждайтесь свободным днём! 🌟</p>
              </div>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg ${event.color} border-2 hover:shadow-md transition-all`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="Clock" size={14} />
                        <span className="font-bold text-sm">{event.time}</span>
                      </div>
                      <p className="font-semibold">{event.title}</p>
                      {event.description && (
                        <p className="text-xs mt-1 opacity-80">{event.description}</p>
                      )}
                    </div>
                    {event.participants && event.participants.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Icon name="Users" size={12} className="mr-1" />
                        {event.participants.length}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Режим "Неделя"
          <div className="grid grid-cols-7 gap-1">
            {getWeekDays().map((day, index) => {
              const dayEvents = calendarEvents.filter(e =>
                new Date(e.date).toDateString() === day.toDateString()
              );
              const isToday = day.toDateString() === new Date().toDateString();
              const dayOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][day.getDay()];
              const dayOfMonth = day.getDate();

              return (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg transition-all ${
                    isToday
                      ? 'bg-purple-600 text-white shadow-lg scale-110'
                      : 'bg-white hover:bg-purple-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-medium mb-1">
                    {dayOfWeek}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                    {dayOfMonth}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${isToday ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-700'}`}
                      >
                        {dayEvents.length}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/calendar');
          }}
        >
          Открыть полный календарь →
        </Button>
      </CardContent>
    </Card>
  );
}