// Parity self-check для progress.ts.
// Это dev-only утилита: НИКОГДА НЕ ИМПОРТИРОВАТЬ в код приложения.
// Запускать только из консоли разработчика, например:
//   import('@/lib/goals/__fixtures__/progress.parity.test').then(m => console.table(m.runProgressParity()))
// Файл не должен попадать в production bundle через статические импорты.
// Backend (Python) использует те же фикстуры из общего JSON-файла.

/* eslint-disable */
// @ts-nocheck-import-side-effects

import { computeProgress } from '@/lib/goals/progress';
import fixtures from './progress.fixtures.json';
import type { GoalKeyResult, GoalMilestone, LifeGoal } from '@/components/life-road/types';

interface FixtureCase {
  id: string;
  description: string;
  goal: Partial<LifeGoal>;
  milestones: Partial<GoalMilestone>[];
  keyResults: Partial<GoalKeyResult>[];
  expected: {
    execution: number;
    overshoot: boolean;
    insufficientData?: string | null;
    insufficientDataNotNull?: boolean;
    source: string;
  };
}

export interface ParityResult {
  id: string;
  ok: boolean;
  description: string;
  expected: FixtureCase['expected'];
  actual: { execution: number; overshoot: boolean; insufficientData: string | null; source: string };
}

export function runProgressParity(): ParityResult[] {
  const results: ParityResult[] = [];
  for (const c of fixtures.cases as FixtureCase[]) {
    const goal: LifeGoal = {
      id: 'fixture',
      title: 'fixture',
      sphere: 'personal',
      status: 'active',
      progress: 0,
      steps: [],
      scope: 'personal',
      linkedSphereIds: (c.goal.linkedSphereIds as string[]) ?? [],
      frameworkType: c.goal.frameworkType ?? 'generic',
      frameworkState: (c.goal.frameworkState as Record<string, unknown>) ?? {},
    } as LifeGoal;

    const p = computeProgress(
      goal,
      (c.milestones as GoalMilestone[]) ?? [],
      (c.keyResults as GoalKeyResult[]) ?? [],
    );

    const expectExec = c.expected.execution;
    const expectOver = c.expected.overshoot;
    const expectSource = c.expected.source;
    const expectInsufficient = c.expected.insufficientDataNotNull
      ? p.insufficientData !== null
      : (c.expected.insufficientData ?? null) === p.insufficientData;

    const ok =
      p.execution === expectExec &&
      p.overshoot === expectOver &&
      p.source === expectSource &&
      expectInsufficient;

    results.push({
      id: c.id,
      ok,
      description: c.description,
      expected: c.expected,
      actual: {
        execution: p.execution,
        overshoot: p.overshoot,
        insufficientData: p.insufficientData,
        source: p.source,
      },
    });
  }
  return results;
}