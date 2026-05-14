// Smoke-tests для Goals Hub V1: фильтры, сортировки, attention, summary.

import type { LifeGoal } from '@/components/life-road/types';
import {
  applyFilter,
  applySort,
  buildHubSummary,
  buildHubView,
  evaluateAttention,
  ATTENTION_STALE_DAYS,
  ATTENTION_LOW_PROGRESS,
} from '@/lib/goals/hubHelpers';

type TestResult = { name: string; ok: boolean; details?: string };

function assertEq<T>(actual: T, expected: T, name: string): TestResult {
  const ok = actual === expected;
  return {
    name,
    ok,
    details: ok ? undefined : `expected ${String(expected)}, got ${String(actual)}`,
  };
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeGoal(p: Partial<LifeGoal> & { id: string }): LifeGoal {
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

// 1. Attention: свежая активная цель не нуждается во внимании
export function testAttentionFresh(): TestResult[] {
  const g = makeGoal({
    id: 'g1',
    updatedAt: daysAgoIso(1),
    executionProgress: 50,
  });
  const r = evaluateAttention(g);
  return [
    { name: 'attention: свежая active → needsAttention=false', ok: r.needsAttention === false },
    { name: 'attention: свежая active → stale=false', ok: r.stale === false },
    { name: 'attention: свежая active → overdue=false', ok: r.overdue === false },
  ];
}

// 2. Attention: давно нет апдейтов → stale
export function testAttentionStale(): TestResult[] {
  const g = makeGoal({
    id: 'g2',
    updatedAt: daysAgoIso(ATTENTION_STALE_DAYS + 2),
    executionProgress: 50,
  });
  const r = evaluateAttention(g);
  return [
    { name: 'attention: >7 дней без обновлений → stale=true', ok: r.stale === true },
    { name: 'attention: stale → needsAttention=true', ok: r.needsAttention === true },
  ];
}

// 3. Attention: просроченный deadline
export function testAttentionOverdue(): TestResult[] {
  const past = new Date();
  past.setDate(past.getDate() - 3);
  const g = makeGoal({
    id: 'g3',
    updatedAt: daysAgoIso(1),
    deadline: past.toISOString(),
    executionProgress: 80,
  });
  const r = evaluateAttention(g);
  return [
    { name: 'attention: deadline в прошлом → overdue=true', ok: r.overdue === true },
    { name: 'attention: overdue → needsAttention=true', ok: r.needsAttention === true },
  ];
}

// 4. Attention: low progress сам по себе не «давит»
export function testAttentionLowProgressOnly(): TestResult[] {
  const g = makeGoal({
    id: 'g4',
    updatedAt: daysAgoIso(1),
    executionProgress: ATTENTION_LOW_PROGRESS - 1,
  });
  const r = evaluateAttention(g);
  return [
    { name: 'attention: low progress сам по себе → needsAttention=false', ok: r.needsAttention === false },
    { name: 'attention: low progress флаг выставлен', ok: r.lowProgress === true },
  ];
}

// 5. Attention: статус не active → никогда не needsAttention
export function testAttentionDoneStatus(): TestResult[] {
  const g = makeGoal({
    id: 'g5',
    status: 'done',
    updatedAt: daysAgoIso(60),
    executionProgress: 100,
  });
  const r = evaluateAttention(g);
  return [
    { name: 'attention: done-цель → needsAttention=false', ok: r.needsAttention === false },
  ];
}

// 6. Filter: 'active'
export function testFilterActive(): TestResult[] {
  const views = [
    buildHubView(makeGoal({ id: 'a', status: 'active' })),
    buildHubView(makeGoal({ id: 'b', status: 'done' })),
    buildHubView(makeGoal({ id: 'c', status: 'archived' })),
  ];
  const r = applyFilter(views, 'active');
  return [
    assertEq(r.length, 1, 'filter active: только 1 active'),
    assertEq(r[0]?.goal.id, 'a', 'filter active: правильный id'),
  ];
}

// 7. Filter: 'smart'
export function testFilterSmart(): TestResult[] {
  const views = [
    buildHubView(makeGoal({ id: 'a', frameworkType: 'smart' })),
    buildHubView(makeGoal({ id: 'b', frameworkType: 'okr' })),
    buildHubView(makeGoal({ id: 'c', frameworkType: 'wheel' })),
  ];
  const r = applyFilter(views, 'smart');
  return [assertEq(r.length, 1, 'filter smart: только smart')];
}

// 8. Filter: 'attention'
export function testFilterAttention(): TestResult[] {
  const views = [
    buildHubView(makeGoal({ id: 'a', updatedAt: daysAgoIso(1) })),
    buildHubView(makeGoal({ id: 'b', updatedAt: daysAgoIso(20) })),
  ];
  const r = applyFilter(views, 'attention');
  return [
    { name: 'filter attention: только заброшенные', ok: r.length === 1 && r[0].goal.id === 'b' },
  ];
}

// 9. Sort: 'alphabet'
export function testSortAlphabet(): TestResult[] {
  const views = [
    buildHubView(makeGoal({ id: '1', title: 'Бегемот' })),
    buildHubView(makeGoal({ id: '2', title: 'Ананас' })),
    buildHubView(makeGoal({ id: '3', title: 'Волк' })),
  ];
  const r = applySort(views, 'alphabet');
  return [
    {
      name: 'sort alphabet: А → Б → В',
      ok: r[0].goal.title === 'Ананас' && r[1].goal.title === 'Бегемот' && r[2].goal.title === 'Волк',
    },
  ];
}

// 10. Sort: 'progress'
export function testSortProgress(): TestResult[] {
  const views = [
    buildHubView(makeGoal({ id: '1', executionProgress: 30 })),
    buildHubView(makeGoal({ id: '2', executionProgress: 90 })),
    buildHubView(makeGoal({ id: '3', executionProgress: 60 })),
  ];
  const r = applySort(views, 'progress');
  return [
    {
      name: 'sort progress: убывание',
      ok: r[0].execution === 90 && r[1].execution === 60 && r[2].execution === 30,
    },
  ];
}

// 11. Summary
export function testSummary(): TestResult[] {
  const views = [
    buildHubView(
      makeGoal({ id: '1', status: 'active', executionProgress: 40, updatedAt: daysAgoIso(1) }),
    ),
    buildHubView(
      makeGoal({ id: '2', status: 'active', executionProgress: 80, updatedAt: daysAgoIso(20) }),
    ),
    buildHubView(makeGoal({ id: '3', status: 'done', executionProgress: 100 })),
  ];
  const s = buildHubSummary(views);
  return [
    assertEq(s.total, 3, 'summary: total=3'),
    assertEq(s.active, 2, 'summary: active=2'),
    assertEq(s.completed, 1, 'summary: completed=1'),
    assertEq(s.averageProgress, 60, 'summary: averageProgress=60 (только active)'),
    {
      name: 'summary: attention считает только stale/overdue',
      ok: s.attention === 1,
      details: `attention=${s.attention}`,
    },
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'attention: fresh', results: testAttentionFresh() },
    { title: 'attention: stale', results: testAttentionStale() },
    { title: 'attention: overdue', results: testAttentionOverdue() },
    { title: 'attention: low progress only', results: testAttentionLowProgressOnly() },
    { title: 'attention: done status', results: testAttentionDoneStatus() },
    { title: 'filter: active', results: testFilterActive() },
    { title: 'filter: smart', results: testFilterSmart() },
    { title: 'filter: attention', results: testFilterAttention() },
    { title: 'sort: alphabet', results: testSortAlphabet() },
    { title: 'sort: progress', results: testSortProgress() },
    { title: 'summary', results: testSummary() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Goals Hub V1 smoke tests');
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
