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
