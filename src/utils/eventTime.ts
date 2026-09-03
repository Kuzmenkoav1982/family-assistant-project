import type { CalendarEvent } from '@/types/family.types';

/**
 * Проверяет, прошло ли уже событие сегодня по времени окончания (или начала, если конца нет).
 * Используется только для событий с датой === сегодня; для других дней это не имеет смысла.
 */
export function isEventPastToday(time?: string, endTime?: string): boolean {
  const referenceTime = endTime || time;
  if (!referenceTime) return false;

  const [hours, minutes] = referenceTime.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;

  const now = new Date();
  const eventMoment = new Date();
  eventMoment.setHours(hours, minutes, 0, 0);

  return eventMoment.getTime() < now.getTime();
}

/** Проверяет, попадает ли повторяющееся событие на конкретную дату */
export function isRecurringOnDate(event: CalendarEvent, targetDate: Date): boolean {
  if (!event.isRecurring || !event.recurringPattern) return false;
  const eventDate = new Date(event.date + 'T00:00:00');
  if (targetDate < eventDate) return false;
  if (event.recurringPattern.endDate) {
    const end = new Date(event.recurringPattern.endDate + 'T00:00:00');
    if (targetDate > end) return false;
  }
  const { frequency, daysOfWeek } = event.recurringPattern;
  if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
    return daysOfWeek.includes(targetDate.getDay());
  }
  return false;
}

export interface EventOccurrence {
  event: CalendarEvent;
  occursOn: Date;
}

/**
 * Из списка событий строит хронологический список ближайших вхождений:
 * сортирует по дате+времени, разворачивает повторяющиеся события на ближайшую дату
 * в горизонте (по умолчанию 90 дней), скрывает прошедшие и откладывает
 * события сегодня, время которых уже прошло, в отдельную группу.
 */
export function getUpcomingOccurrences(
  events: CalendarEvent[],
  options: { horizonDays?: number; limit?: number } = {}
): { upcoming: EventOccurrence[]; pastToday: EventOccurrence[] } {
  const { horizonDays = 90, limit = 10 } = options;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + horizonDays);

  const occurrences: EventOccurrence[] = [];

  events.forEach(e => {
    if (e.isRecurring) {
      for (let d = new Date(today); d <= horizon; d.setDate(d.getDate() + 1)) {
        if (isRecurringOnDate(e, new Date(d))) {
          occurrences.push({ event: e, occursOn: new Date(d) });
          break;
        }
      }
    } else {
      const eventDate = new Date(e.date + 'T00:00:00');
      if (eventDate >= today) {
        occurrences.push({ event: e, occursOn: eventDate });
      }
    }
  });

  const sorted = occurrences.sort((a, b) => {
    const dateDiff = a.occursOn.getTime() - b.occursOn.getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.event.time || '').localeCompare(b.event.time || '');
  });

  const isTodayOccurrence = (occursOn: Date) => occursOn.getTime() === today.getTime();
  const upcoming = sorted.filter(
    ({ event, occursOn }) => !isTodayOccurrence(occursOn) || !isEventPastToday(event.time, event.endTime)
  );
  const pastToday = sorted.filter(
    ({ event, occursOn }) => isTodayOccurrence(occursOn) && isEventPastToday(event.time, event.endTime)
  );

  return { upcoming: upcoming.slice(0, limit), pastToday };
}