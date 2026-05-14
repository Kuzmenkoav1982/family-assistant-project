// Weekly Review V1 — чистая логика обзора недели по целям.
//
// Принципы V1:
//  - Rolling 7 days (сейчас минус 7×24 ч) — без споров про начало недели.
//  - Событийная природа: источник истины — check-in'ы в окне.
//  - Delta берём только когда она надёжно реконструируется из data.previousValue/currentValue.
//    Иначе цель попадает в "updated" без знака. Никакой ложной аналитики.
//  - Никаких сравнений неделя-к-неделе, никаких графиков, никаких heatmap.

import type { GoalCheckin, GoalKeyResult, LifeGoal } from '@/components/life-road/types';
import { computeProgress } from './progress';
import { evaluateAttention, type AttentionResult } from './hubHelpers';

export const WEEK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export interface WeeklyContext {
  /** Граница окна "от" (включительно). */
  from: Date;
  /** Граница окна "до" (включительно). */
  to: Date;
}

export function getWeeklyContext(now: Date = new Date()): WeeklyContext {
  return { from: new Date(now.getTime() - WEEK_WINDOW_MS), to: now };
}

function inWindow(iso: string | null | undefined, ctx: WeeklyContext): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= ctx.from.getTime() && t <= ctx.to.getTime();
}

/** Достаём числовую дельту из data.previousValue / currentValue, если возможно. */
function extractCheckinNumericDelta(checkin: GoalCheckin): number | null {
  const d = checkin.data as
    | { previousValue?: number | null; currentValue?: number | null }
    | null
    | undefined;
  if (!d) return null;
  if (typeof d.previousValue !== 'number' || typeof d.currentValue !== 'number') return null;
  if (Number.isNaN(d.previousValue) || Number.isNaN(d.currentValue)) return null;
  return d.currentValue - d.previousValue;
}

export type WeeklyGoalSegment =
  | 'progressed' // есть положительный delta в окне
  | 'regressed' // есть отрицательный delta в окне
  | 'updated' // были check-in'ы, но знак не извлекается
  | 'needsReview'; // см. правила ниже

export interface WeeklyGoalView {
  goal: LifeGoal;
  /** Все check-in'ы цели за окно (отсортированы по убыванию даты). */
  weeklyCheckins: GoalCheckin[];
  /** Сумма надёжно извлечённых дельт. null, если ни одной не было. */
  weeklyDeltaSum: number | null;
  /** Кол-во check-in'ов в окне. */
  weeklyCount: number;
  /** Текущий execution % (после check-in'ов). */
  execution: number;
  /** Атрибуты "требует внимания" (общие с Hub). */
  attention: AttentionResult;
  /** К какому сегменту относится цель. */
  segment: WeeklyGoalSegment;
  /** Last check-in (для UI ленты). */
  lastCheckinAt: string | null;
}

function classifySegment(args: {
  weeklyCount: number;
  weeklyDeltaSum: number | null;
  attention: AttentionResult;
  goalStatus: LifeGoal['status'];
}): WeeklyGoalSegment {
  // Приоритет правил соответствует ТЗ:
  //   overdue → stale → regression → no weekly activity → progressed
  const { weeklyCount, weeklyDeltaSum, attention, goalStatus } = args;

  // не-active цели почти всегда уходят в нейтральный "updated", если были check-in'ы,
  // либо в "needsReview" — нет, done не должна болтаться там.
  if (goalStatus !== 'active') {
    if (weeklyCount > 0) {
      if (weeklyDeltaSum !== null && weeklyDeltaSum > 0) return 'progressed';
      if (weeklyDeltaSum !== null && weeklyDeltaSum < 0) return 'regressed';
      return 'updated';
    }
    // не-active цели не «требуют пересмотра» в V1 — это уже завершённые/паузные истории
    return 'updated';
  }

  if (attention.overdue) return 'needsReview';
  if (attention.stale) return 'needsReview';

  if (weeklyCount > 0 && weeklyDeltaSum !== null) {
    if (weeklyDeltaSum < 0) return 'regressed';
    if (weeklyDeltaSum > 0) return 'progressed';
  }

  if (weeklyCount === 0) return 'needsReview'; // active, но никакой активности за неделю

  // Были check-in'ы, но delta не извлекается надёжно.
  return 'updated';
}

export interface BuildWeeklyArgs {
  goals: LifeGoal[];
  /** checkinsByGoalId — id -> массив check-in'ов. KR не нужны на V1. */
  checkinsByGoalId: Record<string, GoalCheckin[]>;
  keyResultsByGoalId?: Record<string, GoalKeyResult[]>;
  now?: Date;
}

export function buildWeeklyView(args: BuildWeeklyArgs): WeeklyGoalView[] {
  const ctx = getWeeklyContext(args.now);
  const now = args.now ?? new Date();

  return args.goals.map((goal) => {
    const allCheckins = args.checkinsByGoalId[goal.id] ?? [];
    const weeklyCheckins = allCheckins
      .filter((c) => inWindow(c.createdAt, ctx))
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );

    let weeklyDeltaSum: number | null = null;
    for (const c of weeklyCheckins) {
      const d = extractCheckinNumericDelta(c);
      if (d === null) continue;
      weeklyDeltaSum = (weeklyDeltaSum ?? 0) + d;
    }

    const krs = args.keyResultsByGoalId?.[goal.id] ?? [];
    const execution =
      typeof goal.executionProgress === 'number'
        ? goal.executionProgress
        : computeProgress(goal, [], krs).execution;

    const attention = evaluateAttention(goal, now);
    const lastCheckinAt =
      allCheckins
        .map((c) => c.createdAt)
        .filter((v): v is string => !!v)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

    const segment = classifySegment({
      weeklyCount: weeklyCheckins.length,
      weeklyDeltaSum,
      attention,
      goalStatus: goal.status,
    });

    return {
      goal,
      weeklyCheckins,
      weeklyDeltaSum,
      weeklyCount: weeklyCheckins.length,
      execution,
      attention,
      segment,
      lastCheckinAt,
    };
  });
}

// ============================== Summary ==============================

export interface WeeklySummary {
  checkinsThisWeek: number;
  goalsUpdatedThisWeek: number;
  goalsProgressed: number;
  goalsRegressed: number;
  goalsNeedingReview: number;
}

export function buildWeeklySummary(views: WeeklyGoalView[]): WeeklySummary {
  let checkinsThisWeek = 0;
  let goalsUpdatedThisWeek = 0;
  let goalsProgressed = 0;
  let goalsRegressed = 0;
  let goalsNeedingReview = 0;

  for (const v of views) {
    checkinsThisWeek += v.weeklyCount;
    if (v.weeklyCount > 0) goalsUpdatedThisWeek++;
    switch (v.segment) {
      case 'progressed':
        goalsProgressed++;
        break;
      case 'regressed':
        goalsRegressed++;
        break;
      case 'needsReview':
        goalsNeedingReview++;
        break;
    }
  }

  return {
    checkinsThisWeek,
    goalsUpdatedThisWeek,
    goalsProgressed,
    goalsRegressed,
    goalsNeedingReview,
  };
}

// ===================== Сегментированные срезы =====================

/**
 * Цели по сегментам — отсортированные стабильно.
 * progressed: убывание дельты
 * regressed: возрастание дельты (самые большие просадки сверху)
 * needsReview: overdue → stale → нет активности (стабильный приоритет)
 */
export function viewsBySegment(
  views: WeeklyGoalView[],
): {
  progressed: WeeklyGoalView[];
  regressed: WeeklyGoalView[];
  needsReview: WeeklyGoalView[];
} {
  const progressed = views
    .filter((v) => v.segment === 'progressed')
    .sort((a, b) => (b.weeklyDeltaSum ?? 0) - (a.weeklyDeltaSum ?? 0));

  const regressed = views
    .filter((v) => v.segment === 'regressed')
    .sort((a, b) => (a.weeklyDeltaSum ?? 0) - (b.weeklyDeltaSum ?? 0));

  const reviewWeight = (v: WeeklyGoalView): number => {
    if (v.attention.overdue) return 3;
    if (v.attention.stale) return 2;
    if (v.weeklyCount === 0) return 1;
    return 0;
  };
  const needsReview = views
    .filter((v) => v.segment === 'needsReview')
    .sort((a, b) => reviewWeight(b) - reviewWeight(a));

  return { progressed, regressed, needsReview };
}

// =================== Recent weekly check-ins lane ===================

export interface WeeklyCheckinEntry {
  checkin: GoalCheckin;
  goal: LifeGoal;
}

/** Последние N check-in'ов за окно по всем целям. */
export function recentWeeklyCheckins(
  views: WeeklyGoalView[],
  limit = 7,
): WeeklyCheckinEntry[] {
  const flat: WeeklyCheckinEntry[] = [];
  for (const v of views) {
    for (const c of v.weeklyCheckins) flat.push({ checkin: c, goal: v.goal });
  }
  flat.sort(
    (a, b) =>
      new Date(b.checkin.createdAt || 0).getTime() -
      new Date(a.checkin.createdAt || 0).getTime(),
  );
  return flat.slice(0, limit);
}
