import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import type { CalendarEvent, Task, FamilyGoal } from '@/types/family.types';

const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventDialog } from '@/components/calendar/EventDialog';
import { ReminderNotifications } from '@/components/calendar/ReminderNotifications';
import { DayEventsDialog } from '@/components/calendar/DayEventsDialog';
import { CalendarAI } from '@/components/calendar/CalendarAI';
import Icon from '@/components/ui/icon';

type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: (CalendarEvent | Task | FamilyGoal)[];
}

export default function Calendar() {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { notifyCalendarEvent } = useNotifications();
  const { events: apiEvents, loading: eventsLoading, createEvent, updateEvent, deleteEvent, fetchEvents } = useCalendarEvents();
  const { members } = useFamilyMembersContext();
  const [searchParams] = useSearchParams();
  const memberFilterFromUrl = searchParams.get('member');
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDayEventsDialog, setShowDayEventsDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | Task | FamilyGoal | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>(memberFilterFromUrl || 'all');
  const [showReminders, setShowReminders] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  const events = apiEvents;

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
    assignedTo: 'all',
    attendees: [] as string[],
    reminderEnabled: true,
    reminderDays: 1,
    reminderDate: '',
    reminderTime: '',
    isRecurring: false,
    recurringFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringInterval: 1,
    recurringEndDate: '',
    recurringDaysOfWeek: [] as number[]
  });



  const checkReminders = useCallback(() => {
    const now = new Date();
    const todayStr = formatDateToLocal(now);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const upcomingEvents = events.filter(e => {
      if (!e.reminderEnabled) return false;

      const notificationKey = `calendar_notif_${e.id}_${todayStr}`;
      const alreadyNotified = localStorage.getItem(notificationKey);

      if (alreadyNotified) return false;

      if (e.reminderDate && e.reminderTime) {
        if (e.reminderDate === todayStr && e.reminderTime === currentTime) {
          notifyCalendarEvent(e.title, new Date(e.date).toLocaleDateString('ru-RU'), false);
          localStorage.setItem(notificationKey, 'true');
          return true;
        }
        return false;
      }

      if (e.reminderDate && !e.reminderTime) {
        return e.reminderDate === todayStr;
      }

      const eventDate = new Date(e.date + 'T00:00:00');
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(eventDate.getDate() - (e.reminderDays || 1));
      const reminderStr = formatDateToLocal(reminderDate);
      return reminderStr === todayStr;
    });

    if (upcomingEvents.length > 0) {
      setShowReminders(true);
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('calendar_notif_') && !key.includes(now.toDateString())) {
        localStorage.removeItem(key);
      }
    });
  }, [events, notifyCalendarEvent]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const getUpcomingReminders = () => {
    const now = new Date();
    const todayStr = formatDateToLocal(now);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return events.filter(e => {
      if (!e.reminderEnabled) return false;

      const notificationKey = `calendar_notif_${e.id}_${todayStr}`;
      const alreadyNotified = localStorage.getItem(notificationKey);

      if (e.reminderDate && e.reminderTime) {
        if (e.reminderDate === todayStr) {
          const [reminderHour, reminderMinute] = e.reminderTime.split(':').map(Number);
          const [currentHour, currentMinute] = currentTime.split(':').map(Number);
          const reminderTotalMinutes = reminderHour * 60 + reminderMinute;
          const currentTotalMinutes = currentHour * 60 + currentMinute;
          return reminderTotalMinutes <= currentTotalMinutes && !alreadyNotified;
        }
        return false;
      }

      if (e.reminderDate && !e.reminderTime) {
        return e.reminderDate === todayStr;
      }

      const eventDate = new Date(e.date + 'T00:00:00');
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(eventDate.getDate() - (e.reminderDays || 1));
      const reminderStr = formatDateToLocal(reminderDate);
      return reminderStr === todayStr;
    });
  };

  const isRecurringEventOnDate = (event: CalendarEvent, targetDate: Date): boolean => {
    if (!event.isRecurring || !event.recurringPattern) return false;

    const eventDate = new Date(event.date + 'T00:00:00');
    
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
    const dateStr = formatDateToLocal(date);
    const allEvents: (CalendarEvent | Task | FamilyGoal)[] = [];
    
    console.log('[getEventsForDate] Called for date:', dateStr);
    console.log('[getEventsForDate] Current memberFilter:', memberFilter);
    console.log('[getEventsForDate] Total events from API:', events.length);
    
    let matchingEvents = events.filter(e => {
      if (e.date === dateStr) return true;
      return isRecurringEventOnDate(e, date);
    });
    
    console.log('[getEventsForDate] Events matching date:', matchingEvents.length, matchingEvents.map(e => ({
      title: e.title,
      assignedTo: e.assignedTo,
      attendees: e.attendees
    })));
    
    if (categoryFilter !== 'all') {
      matchingEvents = matchingEvents.filter(e => e.category === categoryFilter);
    }

    if (memberFilter !== 'all') {
      console.log('[Calendar Filter] Filtering for member:', memberFilter);
      console.log('[Calendar Filter] All members:', members.map(m => ({ id: m.id, name: m.name })));
      console.log('[Calendar Filter] Events before filter:', matchingEvents.map(e => ({ 
        title: e.title, 
        assignedTo: e.assignedTo, 
        attendees: e.attendees 
      })));
      
      matchingEvents = matchingEvents.filter(e => {
        // Если событие для всех - показываем
        if (!e.assignedTo || e.assignedTo === 'all') {
          console.log('[Calendar Filter] Event', e.title, '- FOR ALL');
          return true;
        }
        // Если человек в списке участников
        if (Array.isArray(e.attendees) && e.attendees.includes(memberFilter)) {
          console.log('[Calendar Filter] Event', e.title, '- IN ATTENDEES');
          return true;
        }
        // Если событие назначено конкретно на этого человека (по ID или имени)
        if (e.assignedTo === memberFilter) {
          console.log('[Calendar Filter] Event', e.title, '- ASSIGNED BY ID:', e.assignedTo);
          return true;
        }
        // Дополнительная проверка: ищем по имени если memberFilter это ID
        const member = members.find(m => m.id === memberFilter);
        if (member && e.assignedTo === member.name) {
          console.log('[Calendar Filter] Event', e.title, '- ASSIGNED BY NAME:', e.assignedTo, 'matches', member.name);
          return true;
        }
        console.log('[Calendar Filter] Event', e.title, '- FILTERED OUT');
        return false;
      });
      
      console.log('[Calendar Filter] Events after filter:', matchingEvents.length);
    }

    allEvents.push(...matchingEvents);

    const tasksForDate = tasks.filter(t => t.dueDate === dateStr);
    allEvents.push(...tasksForDate);

    const goalsForDate = goals.filter(g => g.deadline === dateStr);
    allEvents.push(...goalsForDate);

    return allEvents;
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

  const handlePreviousPeriod = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setDate(prev.getDate() - 7);
      }
      return newDate;
    });
  };

  const handleNextPeriod = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + 1);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    setEditingEventId(null);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'personal',
      color: '#3b82f6',
      visibility: 'family',
      assignedTo: memberFilter !== 'all' ? memberFilter : 'all',
      attendees: [],
      reminderEnabled: true,
      reminderDays: 1,
      reminderDate: '',
      reminderTime: '',
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringDaysOfWeek: []
    });
    setShowEventDialog(true);
  };

  const handleAIRecommendation = (recommendation: { title: string; category: string; description: string; date?: string; time?: string }) => {
    const categoryMap: { [key: string]: string } = {
      'leisure': 'leisure',
      'family': 'family',
      'health': 'health',
      'education': 'education',
      'work': 'work',
      'personal': 'personal'
    };

    setNewEvent({
      title: recommendation.title,
      description: recommendation.description || '',
      date: recommendation.date || '',
      time: recommendation.time || '',
      category: categoryMap[recommendation.category] || 'personal',
      color: '#8b5cf6',
      visibility: 'family',
      assignedTo: 'all',
      attendees: [],
      reminderEnabled: true,
      reminderDays: 1,
      reminderDate: '',
      reminderTime: '',
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringDaysOfWeek: []
    });
    setShowEventDialog(true);
  };

  const handleEventChange = (field: string, value: string | boolean | number | string[]) => {
    console.log(`[Calendar] handleEventChange: ${field} =`, value);
    setNewEvent(prev => {
      const updated = { ...prev, [field]: value };
      console.log('[Calendar] newEvent after change:', updated);
      return updated;
    });
  };

  const handleSaveEvent = async () => {
    console.log('[Calendar] Saving event. newEvent.assignedTo:', newEvent.assignedTo);
    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      category: newEvent.category,
      color: newEvent.color,
      visibility: newEvent.visibility,
      assignedTo: newEvent.assignedTo,
      attendees: newEvent.attendees,
      reminderEnabled: newEvent.reminderEnabled,
      reminderDays: newEvent.reminderDays,
      reminderDate: newEvent.reminderDate,
      reminderTime: newEvent.reminderTime,
      isRecurring: newEvent.isRecurring,
      recurringFrequency: newEvent.recurringFrequency,
      recurringInterval: newEvent.recurringInterval,
      recurringEndDate: newEvent.recurringEndDate,
      recurringDaysOfWeek: newEvent.recurringDaysOfWeek
    };

    if (editingEventId) {
      const result = await updateEvent(editingEventId, eventData);
      if (result.success) {
        notifyCalendarEvent(eventData.title, new Date(eventData.date).toLocaleDateString('ru-RU'), true);
      }
    } else {
      const result = await createEvent(eventData);
      if (result.success) {
        notifyCalendarEvent(eventData.title, new Date(eventData.date).toLocaleDateString('ru-RU'), false);
      }
    }

    setShowEventDialog(false);
    setEditingEventId(null);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      category: event.category,
      color: event.color,
      visibility: event.visibility,
      assignedTo: event.assignedTo || 'all', // Если assignedTo пустой/null - значит для всех
      attendees: event.attendees || [],
      reminderEnabled: event.reminderEnabled || false,
      reminderDays: event.reminderDays || 1,
      reminderDate: event.reminderDate || '',
      reminderTime: event.reminderTime || '',
      isRecurring: event.isRecurring || false,
      recurringFrequency: event.recurringPattern?.frequency || 'weekly',
      recurringInterval: event.recurringPattern?.interval || 1,
      recurringEndDate: event.recurringPattern?.endDate || '',
      recurringDaysOfWeek: event.recurringPattern?.daysOfWeek || []
    });
    setShowEventDialog(true);
  };

  const handleEventDelete = async (eventId: string) => {
    if (confirm('Удалить это событие?')) {
      await deleteEvent(eventId);
    }
  };

  const handleDayClick = (date: Date, dayEvents: (CalendarEvent | Task | FamilyGoal)[]) => {
    setSelectedDate(date);
    setShowDayEventsDialog(true);
  };

  const handleCreateEventForDate = (date: Date) => {
    setEditingEventId(null);
    const dateStr = formatDateToLocal(date);
    setNewEvent({
      title: '',
      description: '',
      date: dateStr,
      time: '',
      category: 'personal',
      color: '#3b82f6',
      visibility: 'family',
      assignedTo: memberFilter !== 'all' ? memberFilter : 'all',
      attendees: [],
      reminderEnabled: true,
      reminderDays: 1,
      reminderDate: '',
      reminderTime: '',
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringDaysOfWeek: []
    });
    setShowEventDialog(true);
  };

  const handleEventClick = (event: CalendarEvent | Task | FamilyGoal) => {
    setSelectedEvent(event);
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            categoryFilter={categoryFilter}
            memberFilter={memberFilter}
            isInstructionOpen={isInstructionOpen}
            onNavigateBack={() => navigate('/')}
            onViewModeChange={setViewMode}
            onPreviousPeriod={handlePreviousPeriod}
            onNextPeriod={handleNextPeriod}
            onToday={handleToday}
            onCategoryFilterChange={setCategoryFilter}
            onMemberFilterChange={setMemberFilter}
            onInstructionToggle={setIsInstructionOpen}
            onAddEvent={handleAddEvent}
          />
          <div className="flex justify-end">
            <CalendarAI onAddEvent={handleAIRecommendation} />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <CalendarGrid
              days={days}
              viewMode={viewMode}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
              onEventEdit={handleEventEdit}
              onEventDelete={handleEventDelete}
              onCreateEvent={handleCreateEventForDate}
            />
          </CardContent>
        </Card>

        <EventDialog
          open={showEventDialog}
          onOpenChange={setShowEventDialog}
          newEvent={newEvent}
          onEventChange={handleEventChange}
          onSaveEvent={handleSaveEvent}
          editingEventId={editingEventId}
        />

        <ReminderNotifications
          open={showReminders}
          onOpenChange={setShowReminders}
          reminders={upcomingReminders}
          onEventClick={handleEventClick}
        />

        <DayEventsDialog
          open={showDayEventsDialog}
          onOpenChange={setShowDayEventsDialog}
          selectedDate={selectedDate}
          events={selectedDate ? getEventsForDate(selectedDate) : []}
          onEventClick={handleEventClick}
          onEventEdit={handleEventEdit}
          onEventDelete={handleEventDelete}
        />

        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon name="Info" size={24} />
                  Детали события
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedEvent.title}</h3>
                  {'description' in selectedEvent && selectedEvent.description && (
                    <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                  )}
                </div>
                
                {'date' in selectedEvent && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calendar" size={16} className="text-gray-500" />
                    <span>{new Date(selectedEvent.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                
                {'time' in selectedEvent && selectedEvent.time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Clock" size={16} className="text-gray-500" />
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
                
                {'category' in selectedEvent && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Категория:</span>
                    <Badge>{selectedEvent.category === 'personal' ? 'Личное' : selectedEvent.category === 'family' ? 'Семейное' : selectedEvent.category === 'work' ? 'Работа' : selectedEvent.category === 'health' ? 'Здоровье' : selectedEvent.category === 'education' ? 'Образование' : 'Досуг'}</Badge>
                  </div>
                )}
                
                {'category' in selectedEvent && 'assignedTo' in selectedEvent && (
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} className="text-gray-500" />
                    <span className="text-sm">
                      <span className="text-gray-500">Для кого:</span> {(selectedEvent as CalendarEvent).assignedTo === 'all' ? 'Вся семья' : (selectedEvent as CalendarEvent).assignedTo || 'Не указано'}
                    </span>
                  </div>
                )}
                
                {'category' in selectedEvent && 'attendees' in selectedEvent && Array.isArray((selectedEvent as CalendarEvent).attendees) && (selectedEvent as CalendarEvent).attendees && (selectedEvent as CalendarEvent).attendees!.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Icon name="Users" size={16} className="text-gray-500 mt-0.5" />
                    <div className="text-sm">
                      <span className="text-gray-500">Участники:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(selectedEvent as CalendarEvent).attendees!.map((attendee, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{attendee}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {'visibility' in selectedEvent && (
                  <div className="flex items-center gap-2">
                    <Icon name={(selectedEvent as CalendarEvent).visibility === 'private' ? 'Lock' : 'Globe'} size={16} className="text-gray-500" />
                    <span className="text-sm">
                      <span className="text-gray-500">Видимость:</span> {(selectedEvent as CalendarEvent).visibility === 'private' ? 'Приватное' : 'Семейное'}
                    </span>
                  </div>
                )}
                
                {'category' in selectedEvent && 'isRecurring' in selectedEvent && (selectedEvent as CalendarEvent).isRecurring && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Icon name="Repeat" size={16} />
                    <span className="text-sm font-medium">Повторяющееся событие</span>
                  </div>
                )}
                
                {'category' in selectedEvent && 'reminderEnabled' in selectedEvent && (selectedEvent as CalendarEvent).reminderEnabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Bell" size={16} className="text-gray-500" />
                    <span className="text-gray-600">Напоминание включено</span>
                  </div>
                )}
                
                {'status' in selectedEvent && 'dueDate' in selectedEvent && (
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-gray-500" />
                    <span className="text-sm">
                      <span className="text-gray-500">Статус:</span> {selectedEvent.status}
                    </span>
                  </div>
                )}
                
                {'progress' in selectedEvent && (
                  <div className="flex items-center gap-2">
                    <Icon name="Target" size={16} className="text-gray-500" />
                    <span className="text-sm">
                      <span className="text-gray-500">Прогресс:</span> {selectedEvent.progress}%
                    </span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}