// Smoke-tests для Goals Focus / Execution V1.
// Проверяем: фильтр active, dedup причин, severity-порядок, сортировку
// внутри группы, empty-кейс и locale-хелперы.

import type { LifeGoal } from '@/components/life-road/types';
import type {
  WeeklyGoalView,
  WeeklyGoalSegment,
} from '@/lib/goals/weeklyReviewHelpers';
import {
  buildFocusQueue,
  groupFocusByReason,
  reasonIcon,
  reasonLabel,
} from '@/lib/goals/focusHelpers';

type TestResult = { name: string; ok: boolean; details?: string };

const NOW = new Date('2026-05-14T12:00:00.000Z');

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

function makeGoal(p: Partial<LifeGoal> & { id: string }): LifeGoal {
  return {
    title: p.title ?? `Goal ${p.id}`,
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

interface ViewOpts {
  id: string;
  status?: LifeGoal['status'];
  deadline?: string | null;
  overdue?: boolean;
  stale?: boolean;
  daysSinceUpdate?: number | null;
  weeklyDeltaSum?: number | null;
  lastCheckinAt?: string | null;
  weeklyCount?: number;
}

function view(opts: ViewOpts): WeeklyGoalView {
  const segment: WeeklyGoalSegment =
    opts.overdue || opts.stale
      ? 'needsReview'
      : (opts.weeklyDeltaSum ?? 0) > 0
        ? 'progressed'
        : (opts.weeklyDeltaSum ?? 0) < 0
          ? 'regressed'
          : 'updated';
  return {
    goal: makeGoal({
      id: opts.id,
      status: opts.status ?? 'active',
      deadline: opts.deadline ?? null,
    }),
    weeklyCheckins: [],
    weeklyDeltaSum: opts.weeklyDeltaSum ?? null,
    weeklyCount: opts.weeklyCount ?? 0,
    execution: 0,
    attention: {
      stale: !!opts.stale,
      lowProgress: false,
      overdue: !!opts.overdue,
      needsAttention: !!(opts.stale || opts.overdue),
      daysSinceUpdate: opts.daysSinceUpdate ?? null,
    },
    segment,
    lastCheckinAt: opts.lastCheckinAt ?? null,
  };
}

// ============================ Tests ============================

export function testExcludesNonActive(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'a', status: 'done', overdue: true }),
      view({ id: 'b', status: 'paused', stale: true }),
      view({ id: 'c', status: 'archived', weeklyDeltaSum: -5 }),
      view({ id: 'd', status: 'active', overdue: true, deadline: '2026-05-01' }),
    ],
  });
  return [
    assert(items.length === 1, 'non-active цели исключены'),
    assert(items[0]?.view.goal.id === 'd', 'остался только active'),
  ];
}

export function testEmptyWhenNoSignals(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'a' }), // нет deadline, нет stale, нет regress
      view({ id: 'b', weeklyDeltaSum: 5 }), // прогресс — не Focus
    ],
  });
  return [assert(items.length === 0, 'пустая очередь когда нет сигналов')];
}

export function testSeverityOrder(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'stale', stale: true, daysSinceUpdate: 10 }),
      view({ id: 'regressed', weeklyDeltaSum: -3 }),
      view({ id: 'overdue', overdue: true, deadline: '2026-05-01' }),
    ],
  });
  return [
    assert(items.length === 3, 'три категории попали в очередь'),
    assert(items[0]?.reason === 'overdue', '1-я строка — overdue'),
    assert(items[1]?.reason === 'regressed', '2-я строка — regressed'),
    assert(items[2]?.reason === 'stale', '3-я строка — stale'),
  ];
}

export function testDedupByPrimaryReason(): TestResult[] {
  // Цель overdue И stale И с регрессом — должна попасть один раз.
  const v = view({
    id: 'triple',
    overdue: true,
    deadline: '2026-05-01',
    stale: true,
    daysSinceUpdate: 14,
    weeklyDeltaSum: -7,
  });
  const items = buildFocusQueue({ now: NOW, views: [v] });
  return [
    assert(items.length === 1, 'цель с 3 причинами — один раз в очереди'),
    assert(items[0]?.reason === 'overdue', 'primary = overdue (severity 0)'),
    assert(
      items[0]?.reasons.includes('overdue') &&
        items[0]?.reasons.includes('regressed') &&
        items[0]?.reasons.includes('stale'),
      'все 3 причины зафиксированы в reasons[]',
    ),
  ];
}

export function testSortWithinOverdue(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'recent', overdue: true, deadline: '2026-05-10' }), // 4 дня
      view({ id: 'ancient', overdue: true, deadline: '2026-01-01' }), // ~133 дня
      view({ id: 'mid', overdue: true, deadline: '2026-04-01' }), // ~43 дня
    ],
  });
  return [
    assert(items[0]?.view.goal.id === 'ancient', 'самая просроченная сверху'),
    assert(items[1]?.view.goal.id === 'mid', 'следующая по давности'),
    assert(items[2]?.view.goal.id === 'recent', 'наименее просроченная внизу'),
    assert(
      (items[0]?.context.overdueDays ?? 0) > 100,
      'overdueDays посчитан корректно (>100 для 2026-01-01)',
    ),
  ];
}

export function testSortWithinRegressed(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'small', weeklyDeltaSum: -1 }),
      view({ id: 'big', weeklyDeltaSum: -20 }),
      view({ id: 'mid', weeklyDeltaSum: -7 }),
    ],
  });
  return [
    assert(items[0]?.view.goal.id === 'big', 'самое сильное падение сверху'),
    assert(items[1]?.view.goal.id === 'mid', 'среднее падение в середине'),
    assert(items[2]?.view.goal.id === 'small', 'слабое падение внизу'),
  ];
}

export function testSortWithinStale(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'short', stale: true, daysSinceUpdate: 8 }),
      view({ id: 'long', stale: true, daysSinceUpdate: 30 }),
      view({ id: 'mid', stale: true, daysSinceUpdate: 15 }),
    ],
  });
  return [
    assert(items[0]?.view.goal.id === 'long', 'самая заброшенная сверху'),
    assert(items[1]?.view.goal.id === 'mid', 'средняя в середине'),
    assert(items[2]?.view.goal.id === 'short', 'наименее заброшенная внизу'),
  ];
}

export function testPositiveDeltaNotRegressed(): TestResult[] {
  // Цель с положительной дельтой и без других причин — НЕ в Focus.
  const items = buildFocusQueue({
    now: NOW,
    views: [view({ id: 'good', weeklyDeltaSum: 5 })],
  });
  return [
    assert(items.length === 0, 'положительная дельта не делает цель Focus-кандидатом'),
  ];
}

export function testZeroDeltaNotRegressed(): TestResult[] {
  // Дельта = 0 — не регресс.
  const items = buildFocusQueue({
    now: NOW,
    views: [view({ id: 'flat', weeklyDeltaSum: 0 })],
  });
  return [assert(items.length === 0, 'дельта = 0 не считается регрессом')];
}

export function testNullDeltaNotRegressed(): TestResult[] {
  // weeklyDeltaSum = null (не было check-ins с числовыми данными) — не регресс.
  const items = buildFocusQueue({
    now: NOW,
    views: [view({ id: 'noinfo', weeklyDeltaSum: null })],
  });
  return [assert(items.length === 0, 'null delta — не регресс')];
}

export function testFullMixOrder(): TestResult[] {
  // Полный микс: 2 overdue, 2 regressed, 2 stale, 1 чисто прогрессирующая.
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'prog', weeklyDeltaSum: 9 }),
      view({ id: 'overdue-old', overdue: true, deadline: '2026-01-01' }),
      view({ id: 'overdue-new', overdue: true, deadline: '2026-05-10' }),
      view({ id: 'reg-small', weeklyDeltaSum: -2 }),
      view({ id: 'reg-big', weeklyDeltaSum: -15 }),
      view({ id: 'stale-mid', stale: true, daysSinceUpdate: 9 }),
      view({ id: 'stale-old', stale: true, daysSinceUpdate: 40 }),
    ],
  });
  const ids = items.map((i) => i.view.goal.id);
  return [
    assert(items.length === 6, 'в очереди ровно 6 строк, прогрессирующая отфильтрована'),
    assert(
      JSON.stringify(ids) ===
        JSON.stringify([
          'overdue-old',
          'overdue-new',
          'reg-big',
          'reg-small',
          'stale-old',
          'stale-mid',
        ]),
      'порядок корректен: overdue (old→new) → regressed (big→small) → stale (old→mid)',
    ),
  ];
}

export function testGroupByReason(): TestResult[] {
  const items = buildFocusQueue({
    now: NOW,
    views: [
      view({ id: 'a', overdue: true, deadline: '2026-04-01' }),
      view({ id: 'b', weeklyDeltaSum: -5 }),
      view({ id: 'c', stale: true, daysSinceUpdate: 10 }),
    ],
  });
  const groups = groupFocusByReason(items);
  return [
    assert(groups.overdue.length === 1, 'group: overdue = 1'),
    assert(groups.regressed.length === 1, 'group: regressed = 1'),
    assert(groups.stale.length === 1, 'group: stale = 1'),
  ];
}

export function testLocaleHelpers(): TestResult[] {
  return [
    assert(reasonLabel('overdue') === 'Просрочено', 'label: overdue'),
    assert(
      reasonLabel('regressed') === 'Откат за неделю',
      'label: regressed',
    ),
    assert(
      reasonLabel('stale') === 'Нет активности 7 дней',
      'label: stale',
    ),
    assert(reasonIcon('overdue') === 'AlertTriangle', 'icon: overdue'),
    assert(reasonIcon('regressed') === 'TrendingDown', 'icon: regressed'),
    assert(reasonIcon('stale') === 'Hourglass', 'icon: stale'),
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'focus: исключение non-active', results: testExcludesNonActive() },
    { title: 'focus: пустая очередь без сигналов', results: testEmptyWhenNoSignals() },
    { title: 'focus: severity order', results: testSeverityOrder() },
    { title: 'focus: dedup по primary', results: testDedupByPrimaryReason() },
    { title: 'focus: сортировка overdue', results: testSortWithinOverdue() },
    { title: 'focus: сортировка regressed', results: testSortWithinRegressed() },
    { title: 'focus: сортировка stale', results: testSortWithinStale() },
    { title: 'focus: positive delta не регресс', results: testPositiveDeltaNotRegressed() },
    { title: 'focus: zero delta не регресс', results: testZeroDeltaNotRegressed() },
    { title: 'focus: null delta не регресс', results: testNullDeltaNotRegressed() },
    { title: 'focus: полный микс', results: testFullMixOrder() },
    { title: 'focus: group by reason', results: testGroupByReason() },
    { title: 'focus: locale helpers', results: testLocaleHelpers() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Goals Focus V1 smoke tests');
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
