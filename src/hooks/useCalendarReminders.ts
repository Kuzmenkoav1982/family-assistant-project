import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { useCalendarEvents } from './useCalendarEvents';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  reminderEnabled?: boolean;
  reminderDate?: string;
  reminderTime?: string;
  reminderDays?: number;
}

const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useCalendarReminders() {
  const { notifyCalendarEvent } = useNotifications();
  const { events: apiEvents } = useCalendarEvents();

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = formatDateToLocal(now);
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (!apiEvents || apiEvents.length === 0) return;

      const events = apiEvents as CalendarEvent[];

      events.forEach(event => {
        if (!event.reminderEnabled) return;

        const notificationKey = `calendar_notif_${event.id}_${todayStr}_${currentTime}`;
        const alreadyNotified = localStorage.getItem(notificationKey);

        if (alreadyNotified) return;

        // Check exact reminder date and time
        if (event.reminderDate && event.reminderTime) {
          if (event.reminderDate === todayStr && event.reminderTime === currentTime) {
            const eventDate = new Date(event.date);
            notifyCalendarEvent(event.title, eventDate.toLocaleDateString('ru-RU'), false);
            localStorage.setItem(notificationKey, 'true');
            console.log(`[CalendarReminder] Sent notification for "${event.title}" at ${currentTime}`);
          }
          return;
        }

        // Check reminder based on days before event
        if (event.reminderDate && !event.reminderTime) {
          if (event.reminderDate === todayStr && !alreadyNotified) {
            const eventDate = new Date(event.date);
            notifyCalendarEvent(event.title, eventDate.toLocaleDateString('ru-RU'), false);
            localStorage.setItem(notificationKey, 'true');
            console.log(`[CalendarReminder] Sent notification for "${event.title}" (no time)`);
          }
          return;
        }

        // Fallback: calculate reminder date from reminderDays
        const eventDate = new Date(event.date + 'T00:00:00');
        const reminderDate = new Date(eventDate);
        reminderDate.setDate(eventDate.getDate() - (event.reminderDays || 1));
        const reminderStr = formatDateToLocal(reminderDate);

        if (reminderStr === todayStr && !alreadyNotified) {
          notifyCalendarEvent(event.title, eventDate.toLocaleDateString('ru-RU'), false);
          localStorage.setItem(notificationKey, 'true');
          console.log(`[CalendarReminder] Sent notification for "${event.title}" (${event.reminderDays} days before)`);
        }
      });

      // Clean up old notification keys (older than 2 days)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = formatDateToLocal(twoDaysAgo);

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('calendar_notif_')) {
          const parts = key.split('_');
          if (parts.length >= 4) {
            const keyDate = `${parts[3]}-${parts[4]}-${parts[5]}`;
            if (keyDate < twoDaysAgoStr) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [notifyCalendarEvent, apiEvents]);
}