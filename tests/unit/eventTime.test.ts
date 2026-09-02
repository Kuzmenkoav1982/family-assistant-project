import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isEventPastToday } from '../../src/utils/eventTime';

// Фиксируем "сейчас" на 12:30 сегодняшнего дня (любая дата, важно только время)
const NOW = new Date(2026, 8, 2, 12, 30, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('isEventPastToday', () => {
  it('считает событие прошедшим, если время окончания раньше текущего момента', () => {
    expect(isEventPastToday('09:00', '10:00')).toBe(true);
  });

  it('считает событие непрошедшим, если время окончания позже текущего момента', () => {
    expect(isEventPastToday('09:00', '14:00')).toBe(false);
  });

  it('без endTime использует время начала как ориентир', () => {
    expect(isEventPastToday('09:00')).toBe(true);
    expect(isEventPastToday('15:00')).toBe(false);
  });

  it('событие, которое идёт прямо сейчас (endTime ещё не наступил), не считается прошедшим', () => {
    // Началось в 12:00, закончится в 13:00, сейчас 12:30 — событие идёт сейчас
    expect(isEventPastToday('12:00', '13:00')).toBe(false);
  });

  it('момент, равный текущему времени, не считается прошедшим (строгое сравнение "<")', () => {
    expect(isEventPastToday('12:30')).toBe(false);
    expect(isEventPastToday('09:00', '12:30')).toBe(false);
  });

  it('событие без времени (весь день) никогда не считается прошедшим', () => {
    expect(isEventPastToday(undefined, undefined)).toBe(false);
    expect(isEventPastToday('')).toBe(false);
  });

  it('некорректная строка времени не ломает функцию и трактуется как не прошедшее', () => {
    expect(isEventPastToday('не время')).toBe(false);
    expect(isEventPastToday('12')).toBe(false); // нет минут после двоеточия
  });

  it('время ровно в полночь обрабатывается корректно', () => {
    expect(isEventPastToday('00:00')).toBe(true); // уже прошло с начала суток
  });
});