import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import type { CalendarEvent, Task, FamilyGoal } from '@/types/family.types';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventDialog } from '@/components/calendar/EventDialog';
import { ReminderNotifications } from '@/components/calendar/ReminderNotifications';
import { DayEventsDialog } from '@/components/calendar/DayEventsDialog';
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
    assignedTo: 'all',
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

  const checkReminders = useCallback(() => {
    const today = new Date();
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
  }, [events]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [checkReminders]);

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

  const isRecurringEventOnDate = (event: CalendarEvent, targetDate: Date): boolean => {
    if (!event.isRecurring || !event.recurringPattern) return false;

    const eventDate = new Date(event.date);
    
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

    if (memberFilter !== 'all') {
      matchingEvents = matchingEvents.filter(e => {
        if (!e.assignedTo || e.assignedTo === 'all') return true;
        return e.assignedTo === memberFilter;
      });
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
      isRecurring: false,
      recurringFrequency: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringDaysOfWeek: []
    });
    setShowEventDialog(true);
  };

  const handleEventChange = (field: string, value: any) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = () => {
    const eventData: CalendarEvent = {
      id: editingEventId || Date.now().toString(),
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
      isRecurring: newEvent.isRecurring,
      recurringPattern: newEvent.isRecurring ? {
        frequency: newEvent.recurringFrequency,
        interval: newEvent.recurringInterval,
        endDate: newEvent.recurringEndDate || undefined,
        daysOfWeek: newEvent.recurringFrequency === 'weekly' ? newEvent.recurringDaysOfWeek : undefined
      } : undefined
    };

    if (editingEventId) {
      setEvents(prev => prev.map(e => e.id === editingEventId ? eventData : e));
    } else {
      setEvents(prev => [...prev, eventData]);
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
      assignedTo: event.assignedTo || 'all',
      attendees: event.attendees || [],
      reminderEnabled: event.reminderEnabled || false,
      reminderDays: event.reminderDays || 1,
      isRecurring: event.isRecurring || false,
      recurringFrequency: event.recurringPattern?.frequency || 'weekly',
      recurringInterval: event.recurringPattern?.interval || 1,
      recurringEndDate: event.recurringPattern?.endDate || '',
      recurringDaysOfWeek: event.recurringPattern?.daysOfWeek || []
    });
    setShowEventDialog(true);
  };

  const handleEventDelete = (eventId: string) => {
    if (confirm('Удалить это событие?')) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleDayClick = (date: Date, dayEvents: (CalendarEvent | Task | FamilyGoal)[]) => {
    setSelectedDate(date);
    setShowDayEventsDialog(true);
  };

  const handleEventClick = (event: CalendarEvent | Task | FamilyGoal) => {
    setSelectedEvent(event);
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <Card>
          <CardContent className="p-6">
            <CalendarGrid
              days={days}
              viewMode={viewMode}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
              onEventEdit={handleEventEdit}
              onEventDelete={handleEventDelete}
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon name="Info" size={24} />
                  Детали события
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  {'description' in selectedEvent && selectedEvent.description && (
                    <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                  )}
                </div>
                {'category' in selectedEvent && (
                  <Badge>{selectedEvent.category}</Badge>
                )}
                {'status' in selectedEvent && 'dueDate' in selectedEvent && (
                  <div className="text-sm text-gray-600">
                    Статус: {selectedEvent.status}
                  </div>
                )}
                {'progress' in selectedEvent && (
                  <div className="text-sm text-gray-600">
                    Прогресс: {selectedEvent.progress}%
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