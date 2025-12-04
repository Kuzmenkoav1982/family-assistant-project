import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useTasks } from '@/hooks/useTasks';
import type { CalendarEvent, Task, FamilyGoal } from '@/types/family.types';

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: (CalendarEvent | Task | FamilyGoal)[];
}

export default function Calendar() {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDayEventsDialog, setShowDayEventsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | Task | FamilyGoal | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showReminders, setShowReminders] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<FamilyGoal[]>(() => {
    const saved = localStorage.getItem('familyGoals');
    return saved ? JSON.parse(saved) : [];
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'personal',
    color: '#3b82f6',
    visibility: 'family' as 'family' | 'private',
    attendees: [] as string[],
    reminderEnabled: true,
    reminderDays: 1,
    isRecurring: false,
    recurringFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: 1,
    recurringEndDate: '',
    recurringDaysOfWeek: [] as number[]
  });

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [events]);

  const checkReminders = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const upcomingEvents = events.filter(e => {
      if (!e.reminderEnabled) return false;
      const eventDate = new Date(e.date);
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(eventDate.getDate() - (e.reminderDays || 1));
      const reminderStr = reminderDate.toISOString().split('T')[0];
      return reminderStr === today.toISOString().split('T')[0];
    });

    if (upcomingEvents.length > 0) {
      setShowReminders(true);
    }
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    return events.filter(e => {
      if (!e.reminderEnabled) return false;
      const eventDate = new Date(e.date);
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(eventDate.getDate() - (e.reminderDays || 1));
      const reminderStr = reminderDate.toISOString().split('T')[0];
      return reminderStr === today.toISOString().split('T')[0];
    });
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDayOfWeek = firstDay.getDay();
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < adjustedStartDay; i++) {
      const prevMonthDay = new Date(year, month, -adjustedStartDay + i + 1);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        events: getEventsForDate(prevMonthDay)
      });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({
        date: currentDay,
        isCurrentMonth: true,
        events: getEventsForDate(currentDay)
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        events: getEventsForDate(nextMonthDay)
      });
    }
    
    return days;
  };

  const getWeekDays = (date: Date): CalendarDay[] => {
    const currentDayOfWeek = date.getDay();
    const adjustedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - adjustedDay);
    
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        date: day,
        isCurrentMonth: day.getMonth() === date.getMonth(),
        events: getEventsForDate(day)
      });
    }
    
    return days;
  };

  const isRecurringEventOnDate = (event: CalendarEvent, targetDate: Date): boolean => {
    if (!event.isRecurring || !event.recurringPattern) return false;

    const eventDate = new Date(event.date);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    if (targetDate < eventDate) return false;
    
    if (event.recurringPattern.endDate) {
      const endDate = new Date(event.recurringPattern.endDate);
      if (targetDate > endDate) return false;
    }

    const { frequency, interval, daysOfWeek } = event.recurringPattern;
    const diffTime = targetDate.getTime() - eventDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (frequency === 'daily') {
      return diffDays % interval === 0;
    }

    if (frequency === 'weekly') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        const targetDayOfWeek = targetDate.getDay();
        const weeksDiff = Math.floor(diffDays / 7);
        return weeksDiff % interval === 0 && daysOfWeek.includes(targetDayOfWeek);
      }
      return diffDays % (interval * 7) === 0;
    }

    if (frequency === 'monthly') {
      const eventDay = eventDate.getDate();
      const targetDay = targetDate.getDate();
      const monthsDiff = (targetDate.getFullYear() - eventDate.getFullYear()) * 12 + 
                        (targetDate.getMonth() - eventDate.getMonth());
      return monthsDiff % interval === 0 && eventDay === targetDay;
    }

    if (frequency === 'yearly') {
      const yearsDiff = targetDate.getFullYear() - eventDate.getFullYear();
      const sameMonthDay = targetDate.getMonth() === eventDate.getMonth() && 
                          targetDate.getDate() === eventDate.getDate();
      return yearsDiff % interval === 0 && sameMonthDay;
    }

    return false;
  };

  const getEventsForDate = (date: Date): (CalendarEvent | Task | FamilyGoal)[] => {
    const dateStr = date.toISOString().split('T')[0];
    const allEvents: (CalendarEvent | Task | FamilyGoal)[] = [];
    
    let matchingEvents = events.filter(e => {
      if (e.date === dateStr) return true;
      return isRecurringEventOnDate(e, date);
    });
    
    if (categoryFilter !== 'all') {
      matchingEvents = matchingEvents.filter(e => e.category === categoryFilter);
    }
    allEvents.push(...matchingEvents);
    
    if (categoryFilter === 'all' || categoryFilter === 'task') {
      const matchingTasks = (tasks || []).filter(t => t.deadline === dateStr);
      allEvents.push(...matchingTasks);
    }
    
    if (categoryFilter === 'all' || categoryFilter === 'goal') {
      const matchingGoals = goals.filter(g => g.deadline === dateStr);
      allEvents.push(...matchingGoals);
    }
    
    return allEvents;
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    if (day.events.length > 0) {
      setShowDayEventsDialog(true);
    } else {
      setNewEvent({ ...newEvent, date: day.date.toISOString().split('T')[0] });
      setShowEventDialog(true);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    const currentUser = { id: '1', name: 'Пользователь', avatar: '👤' };
    
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      category: newEvent.category,
      color: newEvent.color,
      visibility: newEvent.visibility,
      attendees: newEvent.attendees,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdByAvatar: currentUser.avatar,
      reminderEnabled: newEvent.reminderEnabled,
      reminderDays: newEvent.reminderDays,
      isRecurring: newEvent.isRecurring,
      recurringPattern: newEvent.isRecurring ? {
        frequency: newEvent.recurringFrequency,
        interval: newEvent.recurringInterval,
        endDate: newEvent.recurringEndDate || undefined,
        daysOfWeek: newEvent.recurringFrequency === 'weekly' && newEvent.recurringDaysOfWeek.length > 0 
          ? newEvent.recurringDaysOfWeek 
          : undefined
      } : undefined
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'personal',
      color: '#3b82f6',
      visibility: 'family',
      attendees: [],
      reminderEnabled: true,
      reminderDays: 1,
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringDaysOfWeek: []
    });
    setShowEventDialog(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  const monthYear = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-500',
      family: 'bg-purple-500',
      work: 'bg-orange-500',
      health: 'bg-green-500',
      education: 'bg-yellow-500',
      birthday: 'bg-pink-500',
      holiday: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getEventTypeLabel = (event: CalendarEvent | Task | FamilyGoal): string => {
    if ('assignee' in event) return 'Задача';
    if ('progress' in event) return 'Цель';
    return 'Событие';
  };

  const getEventIcon = (event: CalendarEvent | Task | FamilyGoal): string => {
    if ('assignee' in event) return 'CheckSquare';
    if ('progress' in event) return 'Target';
    return 'Calendar';
  };

  const getEventStats = () => {
    const stats = {
      total: events.length + (tasks?.length || 0) + goals.length,
      byCategory: {} as Record<string, number>
    };

    events.forEach(e => {
      stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
    });

    return stats;
  };

  const stats = getEventStats();

  const exportToCSV = () => {
    const csvRows = [
      ['Дата', 'Время', 'Название', 'Категория', 'Описание', 'Видимость'].join(',')
    ];

    events.forEach(event => {
      const row = [
        event.date,
        event.time || '',
        `"${event.title}"`,
        event.category,
        `"${event.description || ''}"`,
        event.visibility
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `calendar_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={16} />
            Назад
          </Button>
          <Badge variant="outline" className="bg-white">
            <Icon name="Calendar" size={14} className="mr-1" />
            {monthYear}
          </Badge>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-blue-900 text-lg">
                    Как пользоваться календарём
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">🗓️ Для чего нужен календарь?</p>
                        <p className="text-sm">
                          Календарь — это центр планирования семейной жизни. Здесь вы можете создавать события, отслеживать задачи и цели, 
                          настраивать напоминания и делиться планами с членами семьи.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✨ Возможности календаря</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>События:</strong> Дни рождения, встречи, праздники, важные даты</li>
                          <li><strong>Категории:</strong> Личное, семейное, работа, здоровье, образование</li>
                          <li><strong>Повторения:</strong> Настройте регулярные события (ежедневно, еженедельно, ежемесячно)</li>
                          <li><strong>Напоминания:</strong> Получайте уведомления за 1-7 дней до события</li>
                          <li><strong>Видимость:</strong> Делитесь событиями с семьёй или держите приватными</li>
                          <li><strong>Интеграция:</strong> Видите задачи и цели из других разделов</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">📋 Как создать событие?</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Нажмите кнопку <strong>"+ Создать событие"</strong></li>
                          <li>Заполните название, дату и время</li>
                          <li>Выберите категорию (личное, семейное, работа и др.)</li>
                          <li>Настройте напоминание и видимость</li>
                          <li>При необходимости создайте повторяющееся событие</li>
                        </ol>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🔔 Как работают напоминания?</p>
                        <p className="text-sm">
                          Вы можете настроить напоминание за 1-7 дней до события. Напоминания отображаются в верхней части календаря 
                          и помогают не пропустить важные даты.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">👁️ Фильтры и просмотр</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Переключайтесь между месячным и недельным просмотром</li>
                          <li>Используйте фильтры для отображения только нужных категорий</li>
                          <li>Кликните на день для просмотра всех событий дня</li>
                          <li>Цветные метки помогают быстро различать категории</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-sm italic">
                          💡 <strong>Совет:</strong> Создавайте повторяющиеся события для регулярных дел (тренировки, уроки, встречи) — 
                          это сэкономит время и поможет сформировать привычки.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        {getUpcomingReminders().length > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Bell" className="text-orange-600 animate-bounce" size={24} />
                Напоминания о предстоящих событиях
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getUpcomingReminders().map((event, index) => {
                  const eventDate = new Date(event.date);
                  const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-orange-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: event.color + '20' }}
                        >
                          <Icon
                            name="Calendar"
                            style={{ color: event.color }}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {eventDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {event.time && ` в ${event.time}`}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        Через {daysUntil} {daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Всего событий</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                  </div>
                  <Icon name="Calendar" size={32} className="text-blue-400" />
                </div>
              </CardContent>
            </Card>

            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Card key={category} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 capitalize">{category === 'personal' ? 'Личные' : category === 'family' ? 'Семейные' : category === 'work' ? 'Работа' : category === 'birthday' ? 'Дни рождения' : category}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="Calendar" size={28} />
                Календарь событий
              </CardTitle>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="h-8"
                  >
                    <Icon name="Grid3x3" size={16} className="mr-1" />
                    Месяц
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="h-8"
                  >
                    <Icon name="List" size={16} className="mr-1" />
                    Неделя
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="h-8"
                >
                  Сегодня
                </Button>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-8 w-8 p-0"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    className="h-8 w-8 p-0"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setNewEvent({
                      ...newEvent,
                      date: new Date().toISOString().split('T')[0]
                    });
                    setShowEventDialog(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 h-8"
                >
                  <Icon name="Plus" size={16} className="mr-1" />
                  Добавить
                </Button>

                {events.length > 0 && (
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Icon name="Download" size={16} className="mr-1" />
                    Экспорт
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Icon name="Filter" size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Фильтр:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('all')}
                  className="h-8 text-xs"
                >
                  Все
                </Button>
                <Button
                  variant={categoryFilter === 'personal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('personal')}
                  className="h-8 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                  Личное
                </Button>
                <Button
                  variant={categoryFilter === 'family' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('family')}
                  className="h-8 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
                  Семейное
                </Button>
                <Button
                  variant={categoryFilter === 'work' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('work')}
                  className="h-8 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>
                  Работа
                </Button>
                <Button
                  variant={categoryFilter === 'birthday' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('birthday')}
                  className="h-8 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-500 mr-1"></span>
                  Дни рождения
                </Button>
                <Button
                  variant={categoryFilter === 'task' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('task')}
                  className="h-8 text-xs"
                >
                  <Icon name="CheckSquare" size={12} className="mr-1" />
                  Задачи
                </Button>
                <Button
                  variant={categoryFilter === 'goal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter('goal')}
                  className="h-8 text-xs"
                >
                  <Icon name="Target" size={12} className="mr-1" />
                  Цели
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const hasEvents = day.events.length > 0;
                const isTodayDate = isToday(day.date);
                const isSelectedDate = isSelected(day.date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      relative min-h-[80px] lg:min-h-[100px] p-2 rounded-lg border-2 transition-all
                      ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isTodayDate ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                      ${isSelectedDate ? 'ring-2 ring-purple-500' : ''}
                      ${hasEvents ? 'hover:shadow-lg' : 'hover:border-gray-300'}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`
                        text-sm font-semibold mb-1
                        ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                        ${isTodayDate ? 'text-blue-600' : ''}
                      `}>
                        {day.date.getDate()}
                      </div>

                      {hasEvents && (
                        <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                          <div className={`
                            w-full h-6 rounded flex items-center justify-center
                            ${hasEvents ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : ''}
                            text-xs font-bold
                          `}>
                            {day.events.length}
                          </div>
                          {viewMode === 'month' && day.events.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              className="text-[10px] truncate px-1 py-0.5 rounded"
                              style={{ 
                                backgroundColor: 'color' in event ? event.color + '20' : '#3b82f620',
                                color: 'color' in event ? event.color : '#3b82f6'
                              }}
                              title={'title' in event ? event.title : ''}
                            >
                              {'title' in event ? event.title : ''}
                            </div>
                          ))}
                          {viewMode === 'month' && day.events.length > 2 && (
                            <div className="text-[10px] text-gray-500 text-center">
                              +{day.events.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Icon name="Plus" className="text-blue-600" />
                Добавить событие
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название события *</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Например: День рождения"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Подробности события..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Дата *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Категория</label>
                  <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Личное</SelectItem>
                      <SelectItem value="family">Семейное</SelectItem>
                      <SelectItem value="work">Работа</SelectItem>
                      <SelectItem value="health">Здоровье</SelectItem>
                      <SelectItem value="education">Образование</SelectItem>
                      <SelectItem value="birthday">День рождения</SelectItem>
                      <SelectItem value="holiday">Праздник</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Цвет</label>
                  <Input
                    type="color"
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Видимость</label>
                <Select value={newEvent.visibility} onValueChange={(value: 'family' | 'private') => setNewEvent({ ...newEvent, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Для всей семьи</SelectItem>
                    <SelectItem value="private">Личное</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Bell" size={18} className="text-blue-600" />
                      <span className="text-sm font-semibold">Напоминание</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEvent.reminderEnabled}
                        onChange={(e) => setNewEvent({ ...newEvent, reminderEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">Включить</span>
                    </label>
                  </div>
                  
                  {newEvent.reminderEnabled && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Напомнить за:</label>
                      <Select 
                        value={newEvent.reminderDays.toString()} 
                        onValueChange={(value) => setNewEvent({ ...newEvent, reminderDays: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 день</SelectItem>
                          <SelectItem value="2">2 дня</SelectItem>
                          <SelectItem value="3">3 дня</SelectItem>
                          <SelectItem value="7">1 неделю</SelectItem>
                          <SelectItem value="14">2 недели</SelectItem>
                          <SelectItem value="30">1 месяц</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Repeat" size={18} className="text-green-600" />
                      <span className="text-sm font-semibold">Повторяющееся событие</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEvent.isRecurring}
                        onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">Включить</span>
                    </label>
                  </div>
                  
                  {newEvent.isRecurring && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Периодичность:</label>
                        <Select 
                          value={newEvent.recurringFrequency} 
                          onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                            setNewEvent({ ...newEvent, recurringFrequency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Каждый день</SelectItem>
                            <SelectItem value="weekly">Каждую неделю</SelectItem>
                            <SelectItem value="monthly">Каждый месяц</SelectItem>
                            <SelectItem value="yearly">Каждый год</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Интервал:</label>
                        <Input
                          type="number"
                          min="1"
                          value={newEvent.recurringInterval}
                          onChange={(e) => setNewEvent({ ...newEvent, recurringInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                          placeholder="Каждые N периодов"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {newEvent.recurringFrequency === 'daily' && `Каждые ${newEvent.recurringInterval} дн.`}
                          {newEvent.recurringFrequency === 'weekly' && `Каждые ${newEvent.recurringInterval} нед.`}
                          {newEvent.recurringFrequency === 'monthly' && `Каждые ${newEvent.recurringInterval} мес.`}
                          {newEvent.recurringFrequency === 'yearly' && `Каждые ${newEvent.recurringInterval} год(а)`}
                        </p>
                      </div>

                      {newEvent.recurringFrequency === 'weekly' && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Дни недели:</label>
                          <div className="flex flex-wrap gap-2">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                              const dayValue = index === 6 ? 0 : index + 1;
                              const isSelected = newEvent.recurringDaysOfWeek.includes(dayValue);
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    const newDays = isSelected
                                      ? newEvent.recurringDaysOfWeek.filter(d => d !== dayValue)
                                      : [...newEvent.recurringDaysOfWeek, dayValue].sort();
                                    setNewEvent({ ...newEvent, recurringDaysOfWeek: newDays });
                                  }}
                                  className={`w-10 h-10 rounded-full text-xs font-medium transition-all ${
                                    isSelected 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Оставьте пустым для повторения в день недели начальной даты</p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium mb-2 block">Дата окончания (необязательно):</label>
                        <Input
                          type="date"
                          value={newEvent.recurringEndDate}
                          onChange={(e) => setNewEvent({ ...newEvent, recurringEndDate: e.target.value })}
                          min={newEvent.date}
                        />
                        <p className="text-xs text-gray-500 mt-1">Оставьте пустым для бесконечного повторения</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEventDialog(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleAddEvent}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newEvent.title.trim() || !newEvent.date}
                >
                  Добавить событие
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDayEventsDialog} onOpenChange={setShowDayEventsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Icon name="Calendar" className="text-purple-600" />
                События на {selectedDate?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {selectedDate && getEventsForDate(selectedDate).map((event, index) => {
                const isTask = 'assignee' in event;
                const isGoal = 'progress' in event;
                const isEvent = !isTask && !isGoal;

                return (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: isEvent && 'color' in event ? event.color + '20' : '#3b82f620'
                            }}
                          >
                            <Icon
                              name={getEventIcon(event) as any}
                              className="text-lg"
                              style={{ color: isEvent && 'color' in event ? event.color : '#3b82f6' }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{'title' in event ? event.title : ''}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getEventTypeLabel(event)}
                              </Badge>
                            </div>
                            {'description' in event && event.description && (
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              {isEvent && 'time' in event && event.time && (
                                <span className="flex items-center gap-1">
                                  <Icon name="Clock" size={12} />
                                  {event.time}
                                </span>
                              )}
                              {isEvent && 'category' in event && (
                                <Badge variant="outline" className="text-xs">
                                  {event.category}
                                </Badge>
                              )}
                              {isTask && 'assignee' in event && (
                                <Badge variant="outline" className="text-xs">
                                  <Icon name="User" size={10} className="mr-1" />
                                  {event.assignee}
                                </Badge>
                              )}
                              {isGoal && 'progress' in event && (
                                <Badge variant="outline" className="text-xs">
                                  <Icon name="TrendingUp" size={10} className="mr-1" />
                                  {event.progress}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {isEvent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if ('id' in event) handleDeleteEvent(event.id);
                            }}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  if (selectedDate) {
                    setNewEvent({ ...newEvent, date: selectedDate.toISOString().split('T')[0] });
                    setShowDayEventsDialog(false);
                    setShowEventDialog(true);
                  }
                }}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить событие на этот день
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}