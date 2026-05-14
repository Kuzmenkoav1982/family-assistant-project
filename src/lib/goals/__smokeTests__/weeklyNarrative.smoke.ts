// Smoke-tests для Weekly Review V1.1 narrative + nudges.
// Проверяем шаблоны и приоритет nudge.

import type { LifeGoal } from '@/components/life-road/types';
import {
  buildWeeklyNarrative,
  type WeeklyNarrative,
} from '@/lib/goals/weeklyReviewNarrative';
import type {
  WeeklyGoalView,
  WeeklySummary,
} from '@/lib/goals/weeklyReviewHelpers';

type TestResult = { name: string; ok: boolean; details?: string };

function assertEq<T>(actual: T, expected: T, name: string): TestResult {
  const ok = actual === expected;
  return {
    name,
    ok,
    details: ok ? undefined : `expected ${String(expected)}, got ${String(actual)}`,
  };
}

function emptySummary(): WeeklySummary {
  return {
    checkinsThisWeek: 0,
    goalsUpdatedThisWeek: 0,
    goalsProgressed: 0,
    goalsRegressed: 0,
    goalsNeedingReview: 0,
  };
}

function makeGoal(p: Partial<LifeGoal> & { id: string; title?: string }): LifeGoal {
  return {
    title: p.title ?? 'Goal ' + p.id,
    sphere: 'health',
    status: 'active',
    progress: 0,
    steps: [],
    frameworkType: 'smart',
    frameworkState: {},
    scope: 'personal',
    linkedSphereIds: [],
    ...p,
  } as unknown as LifeGoal;
}

function view(opts: {
  id: string;
  title?: string;
  weeklyCount?: number;
  weeklyDeltaSum?: number | null;
  overdue?: boolean;
  stale?: boolean;
}): WeeklyGoalView {
  return {
    goal: makeGoal({ id: opts.id, title: opts.title }),
    weeklyCheckins: [],
    weeklyDeltaSum: opts.weeklyDeltaSum ?? null,
    weeklyCount: opts.weeklyCount ?? 0,
    execution: 0,
    attention: {
      stale: !!opts.stale,
      lowProgress: false,
      overdue: !!opts.overdue,
      needsAttention: !!(opts.stale || opts.overdue),
      daysSinceUpdate: null,
    },
    segment:
      opts.overdue || opts.stale
        ? 'needsReview'
        : (opts.weeklyDeltaSum ?? 0) > 0
          ? 'progressed'
          : (opts.weeklyDeltaSum ?? 0) < 0
            ? 'regressed'
            : 'updated',
    lastCheckinAt: null,
  };
}

// 1. Нет целей — empty fallback nudge «Создать цель»
export function testNoGoals(): TestResult[] {
  const n = buildWeeklyNarrative({
    summary: emptySummary(),
    segments: { progressed: [], regressed: [], needsReview: [] },
    totalGoals: 0,
  });
  return [
    assertEq(n.tone, 'empty', 'no goals: tone=empty'),
    { name: 'no goals: nudge ведёт на создание', ok: n.nudges[0]?.id === 'nudge-create' },
    { name: 'no goals: одна фраза', ok: n.headline.length > 0 },
  ];
}

// 2. Нет check-in'ов, нет attention — empty
export function testEmptyWeek(): TestResult[] {
  const n = buildWeeklyNarrative({
    summary: emptySummary(),
    segments: { progressed: [], regressed: [], needsReview: [] },
    totalGoals: 3,
  });
  return [
    assertEq(n.tone, 'empty', 'empty week: tone=empty'),
    {
      name: 'empty week: nudge — open goals',
      ok: n.nudges[0]?.id === 'nudge-open-goals',
    },
  ];
}

// 3. Только прогресс — positive
export function testOnlyProgress(): TestResult[] {
  const v1 = view({ id: 'a', weeklyCount: 1, weeklyDeltaSum: 5 });
  const v2 = view({ id: 'b', weeklyCount: 1, weeklyDeltaSum: 3 });
  const n: WeeklyNarrative = buildWeeklyNarrative({
    summary: { ...emptySummary(), checkinsThisWeek: 2, goalsUpdatedThisWeek: 2, goalsProgressed: 2 },
    segments: { progressed: [v1, v2], regressed: [], needsReview: [] },
    totalGoals: 2,
  });
  return [
    assertEq(n.tone, 'positive', 'only progress: tone=positive'),
    {
      name: 'only progress: nudge — продолжить по растущей',
      ok: n.nudges[0]?.id.startsWith('nudge-progress-'),
    },
    {
      name: 'only progress: headline содержит "вверх"',
      ok: n.headline.toLowerCase().includes('вверх'),
    },
  ];
}

// 4. Прогресс + откат — mixed
export function testProgressPlusRegress(): TestResult[] {
  const p = view({ id: 'p', weeklyDeltaSum: 5 });
  const r = view({ id: 'r', weeklyDeltaSum: -7 });
  const n = buildWeeklyNarrative({
    summary: { ...emptySummary(), checkinsThisWeek: 2, goalsUpdatedThisWeek: 2, goalsProgressed: 1, goalsRegressed: 1 },
    segments: { progressed: [p], regressed: [r], needsReview: [] },
    totalGoals: 2,
  });
  return [
    assertEq(n.tone, 'mixed', 'mixed: tone=mixed'),
    {
      name: 'mixed: первый nudge — проверить откат',
      ok: n.nudges[0]?.id.startsWith('nudge-regress-'),
    },
    {
      name: 'mixed: всего 1-2 nudge',
      ok: n.nudges.length >= 1 && n.nudges.length <= 2,
    },
  ];
}

// 5. Attention + progress — attention tone и nudge ведёт на просрочку
export function testOverdueBeatsProgress(): TestResult[] {
  const overdue = view({ id: 'o', overdue: true });
  const progressed = view({ id: 'p', weeklyDeltaSum: 4 });
  const n = buildWeeklyNarrative({
    summary: { ...emptySummary(), checkinsThisWeek: 1, goalsProgressed: 1, goalsNeedingReview: 1, goalsUpdatedThisWeek: 1 },
    segments: { progressed: [progressed], regressed: [], needsReview: [overdue] },
    totalGoals: 2,
  });
  return [
    assertEq(n.tone, 'attention', 'overdue+progress: tone=attention'),
    {
      name: 'overdue побеждает в nudge priority',
      ok: n.nudges[0]?.id.startsWith('nudge-overdue-'),
    },
  ];
}

// 6. Приоритет nudge: overdue > regress > stale > progress
export function testNudgePriority(): TestResult[] {
  const overdue = view({ id: 'o', overdue: true });
  const stale = view({ id: 's', stale: true });
  const regress = view({ id: 'r', weeklyDeltaSum: -5 });
  const progress = view({ id: 'p', weeklyDeltaSum: 5 });
  const n = buildWeeklyNarrative({
    summary: {
      ...emptySummary(),
      checkinsThisWeek: 2,
      goalsUpdatedThisWeek: 2,
      goalsProgressed: 1,
      goalsRegressed: 1,
      goalsNeedingReview: 2,
    },
    segments: {
      progressed: [progress],
      regressed: [regress],
      needsReview: [overdue, stale],
    },
    totalGoals: 4,
  });
  return [
    {
      name: 'priority: 1-й nudge = overdue',
      ok: n.nudges[0]?.id.startsWith('nudge-overdue-'),
    },
    {
      name: 'priority: 2-й nudge = regress (не stale, не progress)',
      ok: n.nudges[1]?.id.startsWith('nudge-regress-'),
    },
    { name: 'priority: ровно 2 nudges max', ok: n.nudges.length === 2 },
  ];
}

// 7. Только review без активности
export function testOnlyReviewNoActivity(): TestResult[] {
  const a = view({ id: 'a', stale: true });
  const b = view({ id: 'b', stale: true });
  const n = buildWeeklyNarrative({
    summary: {
      ...emptySummary(),
      goalsNeedingReview: 2,
    },
    segments: { progressed: [], regressed: [], needsReview: [a, b] },
    totalGoals: 2,
  });
  return [
    assertEq(n.tone, 'attention', 'review only: tone=attention'),
    {
      name: 'review only: nudge ведёт на заброшенную',
      ok: n.nudges[0]?.id.startsWith('nudge-stale-'),
    },
    {
      name: 'review only: headline упоминает "пересмотр"',
      ok: n.headline.toLowerCase().includes('пересмотр'),
    },
  ];
}

// 8. Только updated (check-in'ы без знака)
export function testOnlyUpdated(): TestResult[] {
  const n = buildWeeklyNarrative({
    summary: {
      ...emptySummary(),
      checkinsThisWeek: 3,
      goalsUpdatedThisWeek: 2,
    },
    segments: { progressed: [], regressed: [], needsReview: [] },
    totalGoals: 2,
  });
  return [
    assertEq(n.tone, 'mixed', 'updated only: tone=mixed (нет roe прогресса)'),
    {
      name: 'updated only: упомянуты замеры',
      ok: n.headline.toLowerCase().includes('замер'),
    },
    { name: 'updated only: есть fallback nudge', ok: n.nudges.length >= 1 },
  ];
}

// 9. Длинный title обрезается
export function testTitleTruncation(): TestResult[] {
  const longTitle = 'Очень-очень длинное название цели для проверки обрезки';
  const v = view({ id: 'x', overdue: true, title: longTitle });
  const n = buildWeeklyNarrative({
    summary: { ...emptySummary(), goalsNeedingReview: 1 },
    segments: { progressed: [], regressed: [], needsReview: [v] },
    totalGoals: 1,
  });
  return [
    { name: 'title: nudge label обрезан с …', ok: n.nudges[0]?.label.includes('…') },
  ];
}

// 10. Plural correctness
export function testPlural(): TestResult[] {
  const v = view({ id: 'a', weeklyDeltaSum: 5 });
  const n = buildWeeklyNarrative({
    summary: { ...emptySummary(), checkinsThisWeek: 1, goalsProgressed: 1, goalsUpdatedThisWeek: 1 },
    segments: { progressed: [v], regressed: [], needsReview: [] },
    totalGoals: 1,
  });
  return [
    {
      name: 'plural: 1 цель → "цель идёт"',
      ok:
        n.headline.includes('1 цель') &&
        n.headline.includes('идёт'),
    },
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'narrative: no goals', results: testNoGoals() },
    { title: 'narrative: empty week', results: testEmptyWeek() },
    { title: 'narrative: only progress', results: testOnlyProgress() },
    { title: 'narrative: progress + regress', results: testProgressPlusRegress() },
    { title: 'narrative: overdue beats progress', results: testOverdueBeatsProgress() },
    { title: 'nudge priority order', results: testNudgePriority() },
    { title: 'narrative: only review', results: testOnlyReviewNoActivity() },
    { title: 'narrative: only updated', results: testOnlyUpdated() },
    { title: 'narrative: title truncation', results: testTitleTruncation() },
    { title: 'narrative: plural', results: testPlural() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Weekly Review V1.1 narrative smoke tests');
  for (const g of groups) {
     
    console.group(g.title);
    for (const r of g.results) {
      if (r.ok) {
        passed++;
         
        console.log(`  ✓ ${r.name}`);
      } else {
        failed++;
         
        console.error(`  ✗ ${r.name}${r.details ? ' — ' + r.details : ''}`);
      }
    }
     
    console.groupEnd();
  }
   
  console.log(`Итого: ${passed} прошло, ${failed} упало`);
   
  console.groupEnd();
}
