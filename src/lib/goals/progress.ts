import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';
import { getFramework } from './frameworkRegistry';

// Источник истины по прогрессу = вычисляемое значение.
// goal.executionProgress в БД — это кэш, а не основа.
//
// Правила (зафиксированы в Этапе 2.2):
//  1. Прогресс и дедлайн — РАЗНЫЕ каналы. Срок не «портит» execution.
//  2. UI clamp 0..100 даже при перевыполнении (флаг overshoot отдельно).
//  3. Защита от деления на ноль (start === target → insufficientData).
//  4. OKR веса нормализуем при расчёте (0/null → 1, далее /total).
//  5. Wheel baseline — точка отсчёта, не меняется случайно (правило для UI).
//  6. Generic — fallback на registry, без зашитой математики.

export type DeadlineStatus = 'none' | 'on_track' | 'due_soon' | 'overdue';

export interface ProgressBreakdown {
  /** 0..100, clamp. */
  execution: number;
  /** true если фактическое значение превысило цель (overshoot). UI показывает бейджем. */
  overshoot: boolean;
  /** Источник прогресса (для UX-подсказок). */
  source: 'milestones' | 'keyResults' | 'wheel' | 'smart' | 'steps' | 'manual';
  /** Outcome signal: изменение скоров сфер, achievements. Null если нет данных. */
  outcomeSignal: number | null;
  /** Состояние срока — НЕ смешивается с execution. */
  deadlineStatus: DeadlineStatus;
  /** Дни до дедлайна (отрицательное = просрочка). */
  daysToDeadline: number | null;
  /** Сообщение «недостаточно данных» — null если данных достаточно. */
  insufficientData: string | null;
}

const DUE_SOON_DAYS = 14;

export function computeProgress(
  goal: LifeGoal,
  milestones: GoalMilestone[] = [],
  keyResults: GoalKeyResult[] = [],
): ProgressBreakdown {
  const ft = goal.frameworkType || 'generic';

  let executionRaw: number;
  let overshoot = false;
  let source: ProgressBreakdown['source'] = 'manual';
  let insufficientData: string | null = null;

  if (ft === 'smart') {
    const r = computeSmart(goal);
    executionRaw = r.value;
    overshoot = r.overshoot;
    insufficientData = r.insufficientData;
    source = 'smart';
  } else if (ft === 'okr') {
    const r = computeOkr(keyResults);
    executionRaw = r.value;
    overshoot = r.overshoot;
    insufficientData = r.insufficientData;
    source = 'keyResults';
  } else if (ft === 'wheel') {
    const r = computeWheel(goal);
    executionRaw = r.value;
    overshoot = r.overshoot;
    insufficientData = r.insufficientData;
    source = 'wheel';
  } else if (milestones.length > 0) {
    executionRaw = computeFromMilestones(milestones);
    source = 'milestones';
  } else if (goal.steps?.length > 0) {
    executionRaw = computeFromSteps(goal);
    source = 'steps';
  } else {
    const fw = getFramework(ft);
    executionRaw = fw.computeExecutionProgress({ goal, milestones, keyResults });
    source = 'manual';
  }

  const { status: deadlineStatus, days: daysToDeadline } = computeDeadlineStatus(goal);

  return {
    execution: clamp01(executionRaw),
    overshoot,
    source,
    outcomeSignal: extractOutcomeSignal(goal),
    deadlineStatus,
    daysToDeadline,
    insufficientData,
  };
}

// ====================== SMART ======================
function computeSmart(goal: LifeGoal): { value: number; overshoot: boolean; insufficientData: string | null } {
  const s = goal.frameworkState as {
    startValue?: number | null;
    currentValue?: number | null;
    targetValue?: number | null;
  };
  const start = numOrNull(s?.startValue);
  const current = numOrNull(s?.currentValue);
  const target = numOrNull(s?.targetValue);

  if (target === null) {
    return { value: 0, overshoot: false, insufficientData: 'Не задано целевое значение метрики' };
  }
  const startSafe = start ?? 0;
  if (startSafe === target) {
    return { value: 0, overshoot: false, insufficientData: 'Старт равен цели — нечего измерять' };
  }
  const base = current ?? startSafe;
  const span = target - startSafe;
  const ratio = (base - startSafe) / span;
  return { value: ratio * 100, overshoot: ratio > 1, insufficientData: null };
}

// ====================== OKR ======================
function computeOkr(krs: GoalKeyResult[]): { value: number; overshoot: boolean; insufficientData: string | null } {
  if (!krs || krs.length === 0) {
    return { value: 0, overshoot: false, insufficientData: 'Нет ключевых результатов' };
  }
  // Нормализация весов: 0/null → 1, далее доля от total.
  const weights = krs.map((kr) => (kr.weight && kr.weight > 0 ? kr.weight : 1));
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) {
    return { value: 0, overshoot: false, insufficientData: 'Все веса равны нулю' };
  }
  let overshoot = false;
  let acc = 0;
  for (let i = 0; i < krs.length; i++) {
    const kr = krs[i];
    const w = weights[i] / totalWeight;
    const span = kr.targetValue - kr.startValue;
    let krRatio = 0;
    if (span === 0) {
      // boolean / нет span: done = 1, иначе 0
      krRatio = kr.status === 'done' ? 1 : 0;
    } else {
      krRatio = (kr.currentValue - kr.startValue) / span;
    }
    if (krRatio > 1) overshoot = true;
    // На сумму берём clamp 0..1, чтобы общий прогресс не выпрыгивал >100% случайно
    acc += w * Math.max(0, Math.min(1, krRatio));
  }
  return { value: acc * 100, overshoot, insufficientData: null };
}

// ====================== WHEEL ======================
function computeWheel(goal: LifeGoal): { value: number; overshoot: boolean; insufficientData: string | null } {
  const s = goal.frameworkState as {
    baselineScores?: Record<string, number | null>;
    currentScores?: Record<string, number | null>;
    targetScores?: Record<string, number | null>;
  };
  const linked = goal.linkedSphereIds || [];
  if (linked.length === 0) {
    return { value: 0, overshoot: false, insufficientData: 'Нет связанных сфер' };
  }

  let totalDelta = 0;
  let achievedDelta = 0;
  let overshoot = false;
  let measured = 0;

  for (const sid of linked) {
    const baseline = numOrNull(s?.baselineScores?.[sid]);
    const target = numOrNull(s?.targetScores?.[sid]);
    const current = numOrNull(s?.currentScores?.[sid]);
    if (baseline === null || target === null) continue;
    measured += 1;
    const span = target - baseline;
    if (span <= 0) continue;
    const cur = current ?? baseline;
    const delta = cur - baseline;
    totalDelta += span;
    achievedDelta += Math.max(0, delta);
    if (delta > span) overshoot = true;
  }

  if (measured === 0) {
    return { value: 0, overshoot: false, insufficientData: 'Нет замеров по сферам — укажи baseline и target' };
  }
  if (totalDelta === 0) {
    return { value: 0, overshoot: false, insufficientData: 'target = baseline — нечего измерять' };
  }
  return { value: (achievedDelta / totalDelta) * 100, overshoot, insufficientData: null };
}

// ====================== Generic helpers ======================
function computeFromMilestones(milestones: GoalMilestone[]): number {
  const weights = milestones.map((m) => (m.weight && m.weight > 0 ? m.weight : 1));
  const total = weights.reduce((s, w) => s + w, 0);
  if (total === 0) return 0;
  let done = 0;
  for (let i = 0; i < milestones.length; i++) {
    if (milestones[i].status === 'done') done += weights[i];
  }
  return (done / total) * 100;
}

function computeFromSteps(goal: LifeGoal): number {
  if (!goal.steps || goal.steps.length === 0) return 0;
  const done = goal.steps.filter((s) => s.done).length;
  return (done / goal.steps.length) * 100;
}

// ====================== Deadline ======================
function computeDeadlineStatus(goal: LifeGoal): { status: DeadlineStatus; days: number | null } {
  // SMART → targetDate; остальные → deadline. Один источник на цель.
  const dateStr =
    goal.frameworkType === 'smart'
      ? ((goal.frameworkState as { targetDate?: string } | null | undefined)?.targetDate ?? goal.deadline)
      : goal.deadline;
  if (!dateStr) return { status: 'none', days: null };
  const due = new Date(dateStr).getTime();
  if (Number.isNaN(due)) return { status: 'none', days: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due - today.getTime()) / 86400000);
  if (days < 0) return { status: 'overdue', days };
  if (days <= DUE_SOON_DAYS) return { status: 'due_soon', days };
  return { status: 'on_track', days };
}

// ====================== Utils ======================
function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function extractOutcomeSignal(goal: LifeGoal): number | null {
  const sig = goal.outcomeSignal as { sphereDelta?: number } | null | undefined;
  if (!sig || typeof sig.sphereDelta !== 'number') return null;
  return sig.sphereDelta;
}
