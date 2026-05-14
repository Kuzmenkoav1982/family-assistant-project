// Smoke-tests для Weekly Review V1.

import type { GoalCheckin, LifeGoal } from '@/components/life-road/types';
import {
  buildWeeklySummary,
  buildWeeklyView,
  getWeeklyContext,
  recentWeeklyCheckins,
  viewsBySegment,
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

const NOW = new Date('2026-05-14T12:00:00Z');

function daysAgo(d: number): string {
  return new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
}

function goal(p: Partial<LifeGoal> & { id: string }): LifeGoal {
  return {
    title: 'Goal ' + p.id,
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

function checkin(
  goalId: string,
  daysAgoVal: number,
  prev?: number | null,
  cur?: number | null,
): GoalCheckin {
  return {
    id: `c-${goalId}-${daysAgoVal}`,
    goalId,
    createdAt: daysAgo(daysAgoVal),
    data:
      typeof prev === 'number' && typeof cur === 'number'
        ? { kind: 'smart-metric-checkin', previousValue: prev, currentValue: cur }
        : null,
  } as GoalCheckin;
}

// 1. Окно ровно 7 дней
export function testWindow(): TestResult[] {
  const ctx = getWeeklyContext(NOW);
  const widthMs = ctx.to.getTime() - ctx.from.getTime();
  return [assertEq(widthMs, 7 * 24 * 60 * 60 * 1000, 'window: ровно 7 дней')];
}

// 2. Check-in старше 7 дней не попадает
export function testCheckinOutsideWindow(): TestResult[] {
  const g = goal({ id: 'a', updatedAt: daysAgo(1) });
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [checkin('a', 8, 0, 5)] },
    now: NOW,
  });
  return [
    assertEq(views[0].weeklyCount, 0, 'check-in старше 7д не учитывается'),
    assertEq(views[0].weeklyDeltaSum, null, 'нет дельты вне окна'),
  ];
}

// 3. Прогресс — положительная дельта в окне
export function testProgressedSegment(): TestResult[] {
  const g = goal({ id: 'a', updatedAt: daysAgo(1) });
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [checkin('a', 2, 10, 15), checkin('a', 1, 15, 20)] },
    now: NOW,
  });
  return [
    assertEq(views[0].segment, 'progressed', 'segment=progressed для положительной суммы дельт'),
    assertEq(views[0].weeklyDeltaSum, 10, 'дельта 5+5=10'),
    assertEq(views[0].weeklyCount, 2, 'два check-in в окне'),
  ];
}

// 4. Откат — отрицательная дельта
export function testRegressedSegment(): TestResult[] {
  const g = goal({ id: 'a', updatedAt: daysAgo(1) });
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [checkin('a', 1, 20, 12)] },
    now: NOW,
  });
  return [
    assertEq(views[0].segment, 'regressed', 'segment=regressed для отрицательной дельты'),
    assertEq(views[0].weeklyDeltaSum, -8, 'дельта -8'),
  ];
}

// 5. Updated — check-in без числовых previousValue/currentValue
export function testUpdatedNoDelta(): TestResult[] {
  const g = goal({ id: 'a', updatedAt: daysAgo(1) });
  const c: GoalCheckin = {
    id: 'c1',
    goalId: 'a',
    createdAt: daysAgo(2),
    data: { kind: 'something-else' },
  } as GoalCheckin;
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [c] },
    now: NOW,
  });
  return [
    assertEq(views[0].segment, 'updated', 'segment=updated если знак не извлекается'),
    assertEq(views[0].weeklyDeltaSum, null, 'дельта null если данных нет'),
    assertEq(views[0].weeklyCount, 1, 'но count=1'),
  ];
}

// 6. NeedsReview — active без check-in'ов за неделю
export function testNeedsReviewNoActivity(): TestResult[] {
  const g = goal({ id: 'a', updatedAt: daysAgo(2) });
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [] },
    now: NOW,
  });
  return [
    assertEq(
      views[0].segment,
      'needsReview',
      'active без weekly check-ins → needsReview',
    ),
  ];
}

// 7. NeedsReview — overdue побеждает progress
export function testOverdueBeatsProgress(): TestResult[] {
  const pastDeadline = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const g = goal({ id: 'a', updatedAt: daysAgo(1), deadline: pastDeadline });
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [checkin('a', 1, 5, 9)] },
    now: NOW,
  });
  return [
    assertEq(views[0].segment, 'needsReview', 'overdue → needsReview даже при +4'),
  ];
}

// 8. Done-цель не попадает в needsReview без активности
export function testDoneDoesNotNeedReview(): TestResult[] {
  const g = goal({ id: 'a', status: 'done', updatedAt: daysAgo(40) });
  const views = buildWeeklyView({
    goals: [g],
    checkinsByGoalId: { a: [] },
    now: NOW,
  });
  return [
    {
      name: 'done-цель не уходит в needsReview',
      ok: views[0].segment !== 'needsReview',
    },
  ];
}

// 9. Summary
export function testSummary(): TestResult[] {
  const views = buildWeeklyView({
    goals: [
      goal({ id: 'p', updatedAt: daysAgo(1) }),
      goal({ id: 'r', updatedAt: daysAgo(1) }),
      goal({ id: 'u', updatedAt: daysAgo(1) }),
      goal({ id: 'n', updatedAt: daysAgo(1) }),
    ],
    checkinsByGoalId: {
      p: [checkin('p', 1, 0, 5)],
      r: [checkin('r', 1, 5, 1)],
      u: [
        {
          id: 'cu',
          goalId: 'u',
          createdAt: daysAgo(2),
          data: { kind: 'free-text' },
        } as GoalCheckin,
      ],
      n: [],
    },
    now: NOW,
  });
  const s = buildWeeklySummary(views);
  return [
    assertEq(s.checkinsThisWeek, 3, 'checkinsThisWeek=3'),
    assertEq(s.goalsUpdatedThisWeek, 3, 'goalsUpdatedThisWeek=3'),
    assertEq(s.goalsProgressed, 1, 'goalsProgressed=1'),
    assertEq(s.goalsRegressed, 1, 'goalsRegressed=1'),
    assertEq(s.goalsNeedingReview, 1, 'goalsNeedingReview=1'),
  ];
}

// 10. Сортировка регрессий: самые большие просадки сверху
export function testRegressedOrder(): TestResult[] {
  const views = buildWeeklyView({
    goals: [
      goal({ id: 'a', updatedAt: daysAgo(1) }),
      goal({ id: 'b', updatedAt: daysAgo(1) }),
    ],
    checkinsByGoalId: {
      a: [checkin('a', 1, 10, 7)], // -3
      b: [checkin('b', 1, 10, 2)], // -8
    },
    now: NOW,
  });
  const { regressed } = viewsBySegment(views);
  return [
    { name: 'regressed: b (-8) выше a (-3)', ok: regressed[0]?.goal.id === 'b' },
  ];
}

// 11. Recent: сортировка по убыванию даты + лимит
export function testRecent(): TestResult[] {
  const views = buildWeeklyView({
    goals: [goal({ id: 'a' })],
    checkinsByGoalId: {
      a: [
        checkin('a', 5, 0, 1),
        checkin('a', 2, 1, 2),
        checkin('a', 4, 2, 3),
        checkin('a', 1, 3, 4),
        checkin('a', 6, 4, 5),
      ],
    },
    now: NOW,
  });
  const recent = recentWeeklyCheckins(views, 3);
  return [
    assertEq(recent.length, 3, 'recent: лимит 3 соблюдён'),
    {
      name: 'recent: первый — самый свежий (1 день)',
      ok:
        new Date(recent[0]?.checkin.createdAt || 0).getTime() >
        new Date(recent[1]?.checkin.createdAt || 0).getTime(),
    },
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'window 7d', results: testWindow() },
    { title: 'check-in outside window', results: testCheckinOutsideWindow() },
    { title: 'segment: progressed', results: testProgressedSegment() },
    { title: 'segment: regressed', results: testRegressedSegment() },
    { title: 'segment: updated (no delta)', results: testUpdatedNoDelta() },
    { title: 'segment: needsReview (no activity)', results: testNeedsReviewNoActivity() },
    { title: 'segment: overdue beats progress', results: testOverdueBeatsProgress() },
    { title: 'done not in needsReview', results: testDoneDoesNotNeedReview() },
    { title: 'summary counts', results: testSummary() },
    { title: 'regressed order', results: testRegressedOrder() },
    { title: 'recent: sort & limit', results: testRecent() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Weekly Review V1 smoke tests');
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
