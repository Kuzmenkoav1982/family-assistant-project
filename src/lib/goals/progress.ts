import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';
import { getFramework } from './frameworkRegistry';

// Источник истины по прогрессу = вычисляемое значение.
// goal.executionProgress в БД — это кэш, а не основа.
// Outcome signal (изменение скора сферы) считается отдельно — пока заглушка.

export interface ProgressBreakdown {
  /** 0..100, исполнение: milestones + KR + steps. */
  execution: number;
  /** Откуда взялся источник прогресса (для UX-подсказок). */
  source: 'milestones' | 'keyResults' | 'wheel' | 'steps' | 'manual';
  /** Outcome signal: изменение скоров сфер, achievements. */
  outcomeSignal: number | null;
}

export function computeProgress(
  goal: LifeGoal,
  milestones: GoalMilestone[] = [],
  keyResults: GoalKeyResult[] = [],
): ProgressBreakdown {
  const fw = getFramework(goal.frameworkType);
  const execution = fw.computeExecutionProgress({ goal, milestones, keyResults });

  let source: ProgressBreakdown['source'] = 'manual';
  if (goal.frameworkType === 'okr' && keyResults.length > 0) source = 'keyResults';
  else if (goal.frameworkType === 'wheel') source = 'wheel';
  else if (milestones.length > 0) source = 'milestones';
  else if (goal.steps?.length > 0) source = 'steps';

  return {
    execution: clamp01(execution),
    source,
    outcomeSignal: extractOutcomeSignal(goal),
  };
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function extractOutcomeSignal(goal: LifeGoal): number | null {
  const sig = goal.outcomeSignal as { sphereDelta?: number } | null | undefined;
  if (!sig || typeof sig.sphereDelta !== 'number') return null;
  return sig.sphereDelta;
}
