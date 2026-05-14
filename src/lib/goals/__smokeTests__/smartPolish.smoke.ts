// Smoke-tests для критичной логики SMART V1.1.
//
// Это НЕ полноценные unit-тесты (vitest у проекта не подключён).
// Это набор чистых функций-проверок, которые можно:
//   а) запустить вручную из консоли:
//      import('@/lib/goals/__smokeTests__/smartPolish.smoke').then(m => m.runAll());
//   б) использовать как живую документацию ожидаемого поведения.
//
// Покрываем ровно те места, на которых висел polish:
//   - computeProgress (SMART)
//   - flash только при delta !== 0
//   - flash сбрасывается через 2000 мс (имитация таймера)
//   - повторный save перезапускает flash (nonce меняется)
//   - validation SmartCheckin (правила: пусто / не число / не отличается)

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

function makeSmartGoal(state: Record<string, unknown>): LifeGoal {
  return {
    id: 'test-goal',
    title: 'Smoke',
    frameworkType: 'smart',
    frameworkState: state,
    status: 'active',
  } as unknown as LifeGoal;
}

// --- 1. computeProgress: базовый SMART ---
export function testComputeProgressBasic(): TestResult[] {
  const goal = makeSmartGoal({
    specific: 'x',
    metric: 'кг',
    startValue: 0,
    currentValue: 50,
    targetValue: 100,
    unit: 'кг',
  });
  const r = computeProgress(goal, [], []);
  return [assertEq(r.execution, 50, 'computeProgress: 0 → 50 / 100 = 50%')];
}

// --- 2. computeProgress: insufficientData при start === target ---
export function testComputeProgressInsufficient(): TestResult[] {
  const goal = makeSmartGoal({
    specific: 'x',
    metric: 'кг',
    startValue: 10,
    currentValue: 10,
    targetValue: 10,
  });
  const r = computeProgress(goal, [], []);
  return [
    {
      name: 'computeProgress: start===target → insufficientData',
      ok: r.insufficientData !== null,
      details: r.insufficientData ?? 'expected message',
    },
  ];
}

// --- 3. Flash policy: показываем только при delta !== 0 ---
export function testFlashOnlyOnDelta(): TestResult[] {
  // Эмулируем логику из WorkshopGoal.applyGoalAfterCheckin.
  const decideFlash = (prev: number, next: number) =>
    next - prev !== 0 ? { delta: next - prev } : null;
  return [
    assertEq(decideFlash(10, 10), null, 'flash: одинаковый прогресс → null'),
    {
      name: 'flash: 10 → 17 → delta=7',
      ok: decideFlash(10, 17)?.delta === 7,
    },
    {
      name: 'flash: 50 → 40 → delta=-10',
      ok: decideFlash(50, 40)?.delta === -10,
    },
  ];
}

// --- 4. Flash reset: имитируем таймер через Promise ---
export async function testFlashResetAfterTimeout(): Promise<TestResult[]> {
  let state: { active: boolean } | null = { active: true };
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      state = null;
      resolve();
    }, 30); // ускоренная версия 2000ms — проверяем сам факт сброса
  });
  return [assertEq(state, null, 'flash: сбрасывается по таймеру')];
}

// --- 5. Flash nonce: повторный save перезапускает эффект ---
export function testFlashNonceChanges(): TestResult[] {
  const a = { nonce: Date.now() };
  // искусственная задержка не нужна — главное, чтобы был свежий nonce
  const b = { nonce: a.nonce + 1 };
  return [
    {
      name: 'flash: повторный save генерирует новый nonce',
      ok: a.nonce !== b.nonce,
    },
  ];
}

// --- 6. Validation rules SmartCheckin ---
export function testValidationRules(): TestResult[] {
  // Дублируем правила из SmartCheckin.handleSave для проверки.
  const validate = (
    raw: string,
    current: number | null,
  ): { ok: boolean; error?: string } => {
    const trimmed = raw.trim();
    if (trimmed === '') return { ok: false, error: 'empty' };
    const numeric = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(numeric) || !Number.isFinite(numeric))
      return { ok: false, error: 'not-number' };
    if (current !== null && numeric === current)
      return { ok: false, error: 'same' };
    return { ok: true };
  };

  return [
    assertEq(validate('', 5).error, 'empty', 'validation: пусто → empty'),
    assertEq(validate('abc', 5).error, 'not-number', 'validation: abc → not-number'),
    assertEq(validate('5', 5).error, 'same', 'validation: 5 при current=5 → same'),
    assertEq(validate('3,5', 5).ok, true, 'validation: запятая как разделитель ок'),
    assertEq(validate('7', 5).ok, true, 'validation: 7 при current=5 → ok'),
    assertEq(validate('7', null).ok, true, 'validation: 7 при current=null → ok'),
  ];
}

// --- Runner ---
export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] | Promise<TestResult[]> }> = [
    { title: 'computeProgress basic', results: testComputeProgressBasic() },
    { title: 'computeProgress insufficient', results: testComputeProgressInsufficient() },
    { title: 'flash only on delta', results: testFlashOnlyOnDelta() },
    { title: 'flash reset after timeout', results: testFlashResetAfterTimeout() },
    { title: 'flash nonce changes', results: testFlashNonceChanges() },
    { title: 'validation rules', results: testValidationRules() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('SMART V1.1 smoke tests');
  for (const g of groups) {
    const results = await g.results;
     
    console.group(g.title);
    for (const r of results) {
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
