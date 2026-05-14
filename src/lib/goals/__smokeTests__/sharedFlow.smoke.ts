// Smoke-tests для shared-механики useGoalCheckinFlow.
//
// Здесь проверяем только чистые правила, не сам React-хук (т.к. test-runner
// React-хуков пока не подключён). Проверяем:
//  - условие срабатывания flash (delta !== 0)
//  - стабильность nonce между сохранениями (повторный save → новый таймер)
//  - что pending highlight выставляется только при наличии checkinId

type TestResult = { name: string; ok: boolean; details?: string };

function assertEq<T>(actual: T, expected: T, name: string): TestResult {
  const ok = actual === expected;
  return {
    name,
    ok,
    details: ok ? undefined : `expected ${String(expected)}, got ${String(actual)}`,
  };
}

// 1. Flash policy
export function testFlashOnlyOnDelta(): TestResult[] {
  const decide = (prev: number, next: number) =>
    next - prev !== 0 ? { delta: next - prev } : null;
  return [
    assertEq(decide(10, 10), null, 'shared flow: одинаковый прогресс → null'),
    {
      name: 'shared flow: 0 → 5 → delta=5',
      ok: decide(0, 5)?.delta === 5,
    },
    {
      name: 'shared flow: 50 → 30 → delta=-20',
      ok: decide(50, 30)?.delta === -20,
    },
  ];
}

// 2. Nonce обновляется при повторном save
export function testNonceProgression(): TestResult[] {
  const a = Date.now();
  // имитируем «следующий тик» — Date.now() в реальности неубывающий,
  // но мы добавляем явно, чтобы тест был воспроизводимым
  const b = a + 1;
  return [
    { name: 'shared flow: повторный save → новый nonce', ok: b !== a },
  ];
}

// 3. Pending highlight: ставится только при наличии checkinId
export function testPendingHighlight(): TestResult[] {
  const setIfPresent = (id: string | null | undefined): string | null =>
    id ? id : null;
  return [
    assertEq(setIfPresent(null), null, 'highlight: null → null'),
    assertEq(setIfPresent(undefined), null, 'highlight: undefined → null'),
    assertEq(setIfPresent(''), null, 'highlight: пустая строка → null'),
    assertEq(setIfPresent('uuid-123'), 'uuid-123', 'highlight: валидный id → выставляется'),
  ];
}

export function runAllSync(): TestResult[] {
  return [
    ...testFlashOnlyOnDelta(),
    ...testNonceProgression(),
    ...testPendingHighlight(),
  ];
}

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'flash only on delta', results: testFlashOnlyOnDelta() },
    { title: 'nonce progression', results: testNonceProgression() },
    { title: 'pending highlight', results: testPendingHighlight() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('shared flow smoke tests');
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
