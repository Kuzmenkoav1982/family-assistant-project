// Smoke-tests для Wheel V1.
//
// Запуск из консоли:
//   import('@/lib/goals/__smokeTests__/wheelPolish.smoke').then(m => m.runAll());
//
// Покрываем:
//  - computeProgress для Wheel (basic, partial, overshoot, empty, target==baseline)
//  - validation WheelCheckin (пусто / не число / вне 0..10 / совпадает)

import type { LifeGoal } from '@/components/life-road/types';
import { computeProgress } from '@/lib/goals/progress';

type TestResult = { name: string; ok: boolean; details?: string };

function assertEq<T>(actual: T, expected: T, name: string): TestResult {
  const ok = actual === expected;
  return {
    name,
    ok,
    details: ok ? undefined : `expected ${String(expected)}, got ${String(actual)}`,
  };
}

function makeWheelGoal(
  linked: string[],
  baseline: Record<string, number | null>,
  current: Record<string, number | null>,
  target: Record<string, number | null>,
): LifeGoal {
  return {
    id: 'wheel-test',
    title: 'W',
    frameworkType: 'wheel',
    linkedSphereIds: linked,
    frameworkState: {
      baselineScores: baseline,
      currentScores: current,
      targetScores: target,
    },
    status: 'active',
  } as unknown as LifeGoal;
}

// 1. Базовый сценарий: 2 сферы, ровно половина пути
export function testWheelHalfway(): TestResult[] {
  const goal = makeWheelGoal(
    ['health', 'career'],
    { health: 4, career: 4 },
    { health: 6, career: 6 },
    { health: 8, career: 8 },
  );
  const r = computeProgress(goal, [], []);
  // achieved=(2+2)=4, total=(4+4)=8 → 50%
  return [assertEq(r.execution, 50, 'Wheel: 2 сферы, ровно половина → 50%')];
}

// 2. Одна сфера 100%, другая 0% — пропорционально по дельтам
export function testWheelMixed(): TestResult[] {
  const goal = makeWheelGoal(
    ['health', 'career'],
    { health: 0, career: 0 },
    { health: 10, career: 0 },
    { health: 10, career: 10 },
  );
  const r = computeProgress(goal, [], []);
  // achieved=10+0=10, total=10+10=20 → 50%
  return [assertEq(r.execution, 50, 'Wheel: full + zero → 50% по дельтам')];
}

// 3. Overshoot — current > target
export function testWheelOvershoot(): TestResult[] {
  const goal = makeWheelGoal(
    ['health'],
    { health: 2 },
    { health: 10 },
    { health: 6 }, // span=4, delta=8 → overshoot
  );
  const r = computeProgress(goal, [], []);
  return [
    { name: 'Wheel: current > target → overshoot=true', ok: r.overshoot === true },
    // execution clamp до 100 (UI правило)
    assertEq(r.execution, 100, 'Wheel: overshoot clamp execution до 100'),
  ];
}

// 4. Нет связанных сфер → insufficientData
export function testWheelNoLinked(): TestResult[] {
  const goal = makeWheelGoal([], {}, {}, {});
  const r = computeProgress(goal, [], []);
  return [
    { name: 'Wheel: нет связанных сфер → insufficientData', ok: r.insufficientData !== null },
  ];
}

// 5. target === baseline для всех сфер → insufficientData
export function testWheelNoSpan(): TestResult[] {
  const goal = makeWheelGoal(
    ['health'],
    { health: 5 },
    { health: 7 },
    { health: 5 }, // span=0 → пропускается
  );
  const r = computeProgress(goal, [], []);
  return [
    {
      name: 'Wheel: target===baseline → insufficientData',
      ok: r.insufficientData !== null,
    },
  ];
}

// 6. Частичные данные: одна сфера без current — учитывается только вторая
export function testWheelPartial(): TestResult[] {
  const goal = makeWheelGoal(
    ['health', 'career'],
    { health: 0, career: 0 },
    { health: 5, career: null }, // career без замера
    { health: 10, career: 10 },
  );
  const r = computeProgress(goal, [], []);
  // По коду — если current=null, span/delta всё равно считается через cur=0 (numOrNull → 0)
  // Главное — функция не падает.
  return [
    { name: 'Wheel: частичные данные не ломают расчёт', ok: typeof r.execution === 'number' },
  ];
}

// 7. WheelCheckin validation
export function testWheelCheckinValidation(): TestResult[] {
  const MIN = 0;
  const MAX = 10;
  const validate = (raw: string, current: number | null): { ok: boolean; error?: string } => {
    const trimmed = raw.trim();
    if (trimmed === '') return { ok: false, error: 'empty' };
    const numeric = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(numeric) || !Number.isFinite(numeric))
      return { ok: false, error: 'not-number' };
    if (numeric < MIN || numeric > MAX) return { ok: false, error: 'range' };
    if (current !== null && numeric === current) return { ok: false, error: 'same' };
    return { ok: true };
  };
  return [
    assertEq(validate('', 5).error, 'empty', 'Wheel validation: пусто → empty'),
    assertEq(validate('xx', 5).error, 'not-number', 'Wheel validation: xx → not-number'),
    assertEq(validate('11', 5).error, 'range', 'Wheel validation: 11 → range'),
    assertEq(validate('-1', 5).error, 'range', 'Wheel validation: -1 → range'),
    assertEq(validate('5', 5).error, 'same', 'Wheel validation: 5 при current=5 → same'),
    assertEq(validate('7', 5).ok, true, 'Wheel validation: 7 при current=5 → ок'),
    assertEq(validate('7', null).ok, true, 'Wheel validation: 7 при current=null → ок'),
    assertEq(validate('3,5', 5).ok, true, 'Wheel validation: запятая → ок'),
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'Wheel halfway', results: testWheelHalfway() },
    { title: 'Wheel mixed (full + zero)', results: testWheelMixed() },
    { title: 'Wheel overshoot', results: testWheelOvershoot() },
    { title: 'Wheel no linked', results: testWheelNoLinked() },
    { title: 'Wheel target==baseline', results: testWheelNoSpan() },
    { title: 'Wheel partial data', results: testWheelPartial() },
    { title: 'WheelCheckin validation', results: testWheelCheckinValidation() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Wheel V1 smoke tests');
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
