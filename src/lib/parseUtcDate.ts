/**
 * Backend отдаёт временные метки (created_at и т.п.) в UTC, но БЕЗ суффикса
 * 'Z' — например "2026-09-01T06:41:18.286070". Если передать такую строку
 * напрямую в `new Date()`, браузер интерпретирует её как ЛОКАЛЬНОЕ время,
 * а не UTC — из-за этого на экране показывается время на несколько часов
 * раньше реального (для MSK — на 3 часа).
 *
 * parseUtcDate дописывает 'Z', если суффикс зоны отсутствует, — тогда Date
 * корректно конвертирует UTC в локальное время пользователя.
 */
export function parseUtcDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const normalized = hasTimezone ? value : `${value}Z`;
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}
