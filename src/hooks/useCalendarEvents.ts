import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/types/family.types';

const CALENDAR_API = 'https://functions.poehali.dev/5e14781d-52a6-416c-856b-87061cf5decf';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchEvents = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(CALENDAR_API, {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      const data = await response.json();
      
      if (data.success && data.events) {
        setEvents(data.events);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки событий');
      }
    } catch (err) {
      console.error('[useCalendarEvents] Error:', err);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData: Partial<CalendarEvent>) => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(CALENDAR_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'create',
          ...eventData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEvents();
        return { success: true, event: data.event };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[useCalendarEvents] Create error:', err);
      return { success: false, error: 'Ошибка создания события' };
    }
  };

  const updateEvent = async (eventId: number | string, eventData: Partial<CalendarEvent>) => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(CALENDAR_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'update',
          id: eventId,
          ...eventData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEvents();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[useCalendarEvents] Update error:', err);
      return { success: false, error: 'Ошибка обновления события' };
    }
  };

  const deleteEvent = async (eventId: number | string) => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(CALENDAR_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'delete',
          id: eventId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchEvents();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[useCalendarEvents] Delete error:', err);
      return { success: false, error: 'Ошибка удаления события' };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
}