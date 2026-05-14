// Smoke-tests для Portfolio Member detail (Sprint B).
// Проверяем форматтер refresh-toast и trimOneLine. Никаких side-effects.

import {
  buildRefreshToast,
  trimOneLine,
} from '@/lib/portfolio/portfolioMemberHelpers';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ---------- trimOneLine ----------

export function testTrimNoChange(): TestResult[] {
  return [
    assert(trimOneLine('коротко') === 'коротко', 'короткая — без изменений'),
    assert(trimOneLine('') === '', 'пустая → пустая'),
  ];
}

export function testTrimMultiline(): TestResult[] {
  return [
    assert(trimOneLine('a\nb\n c\t') === 'a b c', 'переносы и табы → пробелы и trim'),
    assert(
      trimOneLine('  много   пробелов  внутри ') === 'много пробелов внутри',
      'множественные пробелы схлопываются',
    ),
  ];
}

export function testTrimLongCut(): TestResult[] {
  const long = 'я'.repeat(200);
  const out = trimOneLine(long, 20);
  return [
    assert(out.length === 20, '20 символов включая многоточие'),
    assert(out.endsWith('…'), 'оканчивается многоточием'),
  ];
}

// ---------- buildRefreshToast: success ----------

export function testSuccessWithName(): TestResult[] {
  const t = buildRefreshToast({ kind: 'success', memberName: 'Илья' });
  return [
    assert(t.title === 'Портфолио обновлено', 'success title'),
    assert(
      t.description === 'Свежий снимок данных для Илья',
      'success description с именем',
    ),
    assert(t.variant === 'default', 'success variant default'),
  ];
}

export function testSuccessWithoutName(): TestResult[] {
  const t = buildRefreshToast({ kind: 'success', memberName: null });
  return [
    assert(t.title === 'Портфолио обновлено', 'success title без имени'),
    assert(
      t.description === 'Свежий снимок данных собран',
      'success fallback description',
    ),
  ];
}

export function testSuccessEmptyName(): TestResult[] {
  const t = buildRefreshToast({ kind: 'success', memberName: '' });
  return [
    assert(
      t.description === 'Свежий снимок данных собран',
      'пустое имя → fallback (а не «для »)',
    ),
  ];
}

// ---------- buildRefreshToast: error ----------

export function testErrorWithMessage(): TestResult[] {
  const t = buildRefreshToast({ kind: 'error', errorMessage: 'Network timeout' });
  return [
    assert(t.title === 'Не удалось обновить', 'error title'),
    assert(t.description === 'Network timeout', 'error description = message'),
    assert(t.variant === 'destructive', 'error variant destructive'),
  ];
}

export function testErrorWithoutMessage(): TestResult[] {
  const cases = [
    buildRefreshToast({ kind: 'error' }),
    buildRefreshToast({ kind: 'error', errorMessage: null }),
    buildRefreshToast({ kind: 'error', errorMessage: '' }),
    buildRefreshToast({ kind: 'error', errorMessage: '   ' }),
  ];
  return cases.map((t, i) =>
    assert(
      t.description === 'Попробуйте ещё раз через минуту',
      `error без message (case ${i}) → friendly fallback`,
    ),
  );
}

export function testErrorLongMessageTruncated(): TestResult[] {
  const long = 'Очень '.repeat(50) + 'длинное сообщение об ошибке от бэкенда';
  const t = buildRefreshToast({ kind: 'error', errorMessage: long });
  return [
    assert(t.title === 'Не удалось обновить', 'error title всё ещё корректный'),
    assert(
      typeof t.description === 'string' && t.description.length <= 140,
      'error description обрезан до 140',
    ),
    assert(
      typeof t.description === 'string' && t.description.endsWith('…'),
      'обрезанное оканчивается многоточием',
    ),
  ];
}

export function testErrorMultilineMessageFlattened(): TestResult[] {
  const t = buildRefreshToast({
    kind: 'error',
    errorMessage: 'Backend error\n  stack trace line 1\n  stack trace line 2',
  });
  return [
    assert(
      t.description === 'Backend error stack trace line 1 stack trace line 2',
      'переносы строк → пробелы (одна строка в toast)',
    ),
  ];
}

// ---------- runner ----------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'member: trim no change', results: testTrimNoChange() },
    { title: 'member: trim multiline', results: testTrimMultiline() },
    { title: 'member: trim long', results: testTrimLongCut() },
    { title: 'member: success toast с именем', results: testSuccessWithName() },
    { title: 'member: success toast без имени', results: testSuccessWithoutName() },
    { title: 'member: success toast пустое имя', results: testSuccessEmptyName() },
    { title: 'member: error toast с сообщением', results: testErrorWithMessage() },
    { title: 'member: error toast без сообщения', results: testErrorWithoutMessage() },
    { title: 'member: error toast длинное сообщение', results: testErrorLongMessageTruncated() },
    {
      title: 'member: error toast многострочное сообщение',
      results: testErrorMultilineMessageFlattened(),
    },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Portfolio Member V1 smoke tests (Sprint B)');
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
