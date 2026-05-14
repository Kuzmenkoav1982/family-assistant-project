// Утилиты для Goals Hub V1: фильтры, сортировки, attention-state, summary.
//
// Все функции чистые, без побочных эффектов. Это нужно, чтобы:
//  - просто покрыть smoke-тестами,
//  - переиспользовать на других экранах (Weekly Review V1 и т.п.),
//  - не размазывать продуктовую логику по UI.

import type { GoalCheckin, GoalKeyResult, LifeGoal } from '@/components/life-road/types';
import { computeProgress } from './progress';

export type GoalFilterPreset =
  | 'all'
  | 'active'
  | 'completed'
  | 'smart'
  | 'okr'
  | 'wheel'
  | 'attention';

export type GoalSortPreset = 'updated' | 'progress' | 'alphabet' | 'created';

export interface AttentionFlags {
  /** Давно не было обновлений / check-ins. */
  stale: boolean;
  /** Низкий прогресс относительно срока. На V1 — execution < 20%. */
  lowProgress: boolean;
  /** Просрочена по deadline. */
  overdue: boolean;
}

export interface AttentionResult extends AttentionFlags {
  /** Любой из флагов = требует внимания. */
  needsAttention: boolean;
  /** Дней с последней активности (если есть). */
  daysSinceUpdate: number | null;
}

export const ATTENTION_STALE_DAYS = 7;
export const ATTENTION_LOW_PROGRESS = 20;

function daysBetween(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function lastActivityDate(goal: LifeGoal): Date | null {
  const candidates: string[] = [];
  if (goal.updatedAt) candidates.push(goal.updatedAt);
  if (goal.createdAt) candidates.push(goal.createdAt);
  if (candidates.length === 0) return null;
  const latest = candidates
    .map((s) => new Date(s).getTime())
    .filter((n) => !Number.isNaN(n));
  if (latest.length === 0) return null;
  return new Date(Math.max(...latest));
}

/**
 * Вычисляет, требует ли цель внимания.
 *
 * Правила V1 (намеренно простые):
 *  - active + давно нет обновлений (>7д) → stale
 *  - active + прогресс < 20% → lowProgress
 *  - active + дедлайн прошёл → overdue
 * Цели в статусах done/archived/paused — никогда не «требуют внимания».
 */
export function evaluateAttention(
  goal: LifeGoal,
  now: Date = new Date(),
): AttentionResult {
  if (goal.status !== 'active') {
    return {
      stale: false,
      lowProgress: false,
      overdue: false,
      needsAttention: false,
      daysSinceUpdate: null,
    };
  }

  const last = lastActivityDate(goal);
  const daysSinceUpdate = last ? daysBetween(now, last) : null;
  const stale = daysSinceUpdate !== null && daysSinceUpdate >= ATTENTION_STALE_DAYS;

  const execution =
    typeof goal.executionProgress === 'number'
      ? goal.executionProgress
      : computeProgress(goal, [], []).execution;
  const lowProgress = execution < ATTENTION_LOW_PROGRESS;

  let overdue = false;
  if (goal.deadline) {
    const dl = new Date(goal.deadline);
    if (!Number.isNaN(dl.getTime())) overdue = dl.getTime() < now.getTime();
  }

  return {
    stale,
    lowProgress,
    overdue,
    needsAttention: stale || overdue, // lowProgress не «давит» сам по себе — это маркер
    daysSinceUpdate,
  };
}

/** Расширенный взгляд на цель для Hub: progress + attention. */
export interface HubGoalView {
  goal: LifeGoal;
  execution: number;
  attention: AttentionResult;
}

export function buildHubView(
  goal: LifeGoal,
  // Опционально — KR и checkins (для будущего расширения «дельты последнего check-in»).
  // На V1 не используются, но в API заранее оставим.
  _keyResults?: GoalKeyResult[],
  _checkins?: GoalCheckin[],
): HubGoalView {
  const execution =
    typeof goal.executionProgress === 'number'
      ? goal.executionProgress
      : computeProgress(goal, [], _keyResults ?? []).execution;
  return {
    goal,
    execution,
    attention: evaluateAttention(goal),
  };
}

// ============================ Фильтры ============================

export function applyFilter(views: HubGoalView[], preset: GoalFilterPreset): HubGoalView[] {
  switch (preset) {
    case 'all':
      return views;
    case 'active':
      return views.filter((v) => v.goal.status === 'active');
    case 'completed':
      return views.filter((v) => v.goal.status === 'done');
    case 'smart':
      return views.filter((v) => v.goal.frameworkType === 'smart');
    case 'okr':
      return views.filter((v) => v.goal.frameworkType === 'okr');
    case 'wheel':
      return views.filter((v) => v.goal.frameworkType === 'wheel');
    case 'attention':
      return views.filter((v) => v.attention.needsAttention);
    default:
      return views;
  }
}

// =========================== Сортировки ==========================

export function applySort(views: HubGoalView[], preset: GoalSortPreset): HubGoalView[] {
  const arr = [...views];
  switch (preset) {
    case 'progress':
      // По убыванию прогресса.
      arr.sort((a, b) => b.execution - a.execution);
      break;
    case 'alphabet':
      arr.sort((a, b) =>
        (a.goal.title || '').localeCompare(b.goal.title || '', 'ru'),
      );
      break;
    case 'created':
      arr.sort(
        (a, b) =>
          new Date(b.goal.createdAt || 0).getTime() -
          new Date(a.goal.createdAt || 0).getTime(),
      );
      break;
    case 'updated':
    default:
      arr.sort(
        (a, b) =>
          new Date(b.goal.updatedAt || b.goal.createdAt || 0).getTime() -
          new Date(a.goal.updatedAt || a.goal.createdAt || 0).getTime(),
      );
      break;
  }
  return arr;
}

// ============================ Summary ============================

export interface HubSummary {
  total: number;
  active: number;
  completed: number;
  paused: number;
  archived: number;
  attention: number;
  /** Средний execution среди активных целей. null если активных нет. */
  averageProgress: number | null;
}

export function buildHubSummary(views: HubGoalView[]): HubSummary {
  const total = views.length;
  let active = 0;
  let completed = 0;
  let paused = 0;
  let archived = 0;
  let attention = 0;
  const activeProgresses: number[] = [];

  for (const v of views) {
    switch (v.goal.status) {
      case 'active':
        active++;
        activeProgresses.push(v.execution);
        break;
      case 'done':
        completed++;
        break;
      case 'paused':
        paused++;
        break;
      case 'archived':
        archived++;
        break;
    }
    if (v.attention.needsAttention) attention++;
  }

  const averageProgress =
    activeProgresses.length === 0
      ? null
      : Math.round(
          activeProgresses.reduce((a, b) => a + b, 0) / activeProgresses.length,
        );

  return { total, active, completed, paused, archived, attention, averageProgress };
}

// ============================ Метки ==============================

export const FILTER_LABELS: Record<GoalFilterPreset, string> = {
  all: 'Все',
  active: 'Активные',
  completed: 'Завершённые',
  smart: 'SMART',
  okr: 'OKR',
  wheel: 'Колесо',
  attention: 'Внимание',
};

export const SORT_LABELS: Record<GoalSortPreset, string> = {
  updated: 'По обновлению',
  progress: 'По прогрессу',
  alphabet: 'По алфавиту',
  created: 'По созданию',
};

export function formatLastActivity(daysSinceUpdate: number | null): string {
  if (daysSinceUpdate === null) return 'без активности';
  if (daysSinceUpdate <= 0) return 'сегодня';
  if (daysSinceUpdate === 1) return 'вчера';
  if (daysSinceUpdate < 7) return `${daysSinceUpdate} дн. назад`;
  if (daysSinceUpdate < 30) return `${Math.floor(daysSinceUpdate / 7)} нед. назад`;
  if (daysSinceUpdate < 365) return `${Math.floor(daysSinceUpdate / 30)} мес. назад`;
  return `${Math.floor(daysSinceUpdate / 365)} г. назад`;
}
