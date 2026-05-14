// Smoke-tests для Goals Focus V2.1 — success toast полишинг.
// Проверяем чистый форматтер (без рендера sonner): kind + ctx → текст.

import {
  buildFocusToast,
  formatRescheduleDate,
} from '@/components/goals/focus/focusToasts';
import type {
  FocusActionContext,
  FocusActionKind,
} from '@/components/goals/focus/useFocusActions';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

const ctxPlain: FocusActionContext = { goalTitle: 'Подтянуть английский' };

// ---------- formatRescheduleDate ----------

export function testFormatValidDate(): TestResult[] {
  return [
    assert(formatRescheduleDate('2026-05-14') === '14 мая 2026', '14 мая 2026'),
    assert(formatRescheduleDate('2026-01-01') === '1 января 2026', '1 января 2026'),
    assert(formatRescheduleDate('2026-12-31') === '31 декабря 2026', '31 декабря 2026'),
    assert(formatRescheduleDate('2027-08-09') === '9 августа 2027', '9 августа 2027'),
  ];
}

export function testFormatBadInput(): TestResult[] {
  return [
    assert(formatRescheduleDate(undefined) === null, 'undefined → null'),
    assert(formatRescheduleDate(null) === null, 'null → null'),
    assert(formatRescheduleDate('') === null, 'empty → null'),
    assert(formatRescheduleDate('14.05.2026') === null, 'wrong separator → null'),
    assert(formatRescheduleDate('2026-5-1') === null, 'no zero-pad → null'),
    assert(formatRescheduleDate('2026-13-01') === null, 'invalid month → null'),
    assert(formatRescheduleDate('2026-00-15') === null, 'month=0 → null'),
    assert(formatRescheduleDate('2026-05-32') === null, 'day=32 → null'),
  ];
}

// ---------- buildFocusToast ----------

export function testCheckinToast(): TestResult[] {
  const t = buildFocusToast('checkin', ctxPlain);
  return [
    assert(t.title === 'Замер сохранён', 'checkin: правильный title'),
    assert(
      t.description === 'Цель «Подтянуть английский»',
      'checkin: description с названием цели',
    ),
  ];
}

export function testCheckinToastNoTitle(): TestResult[] {
  const t = buildFocusToast('checkin', { goalTitle: '' });
  return [
    assert(t.title === 'Замер сохранён', 'checkin: title всегда есть'),
    assert(t.description === undefined, 'checkin: пустой title → нет description'),
  ];
}

export function testRescheduleToastWithDate(): TestResult[] {
  const t = buildFocusToast('reschedule', {
    goalTitle: 'Книга',
    newDeadline: '2026-09-01',
  });
  return [
    assert(
      t.title === 'Срок перенесён на 1 сентября 2026',
      'reschedule: дата в человеческом формате',
    ),
    assert(t.description === 'Цель «Книга»', 'reschedule: description с названием'),
  ];
}

export function testRescheduleToastBadDate(): TestResult[] {
  const t = buildFocusToast('reschedule', {
    goalTitle: 'Книга',
    newDeadline: 'not-a-date',
  });
  return [
    assert(
      t.title === 'Срок перенесён',
      'reschedule: невалидная дата → fallback "Срок перенесён"',
    ),
  ];
}

export function testRescheduleToastNoDate(): TestResult[] {
  const t = buildFocusToast('reschedule', { goalTitle: 'Книга' });
  return [
    assert(
      t.title === 'Срок перенесён',
      'reschedule: без даты → fallback',
    ),
  ];
}

export function testCompleteToast(): TestResult[] {
  const t = buildFocusToast('complete', ctxPlain);
  return [
    assert(t.title === 'Цель завершена ✨', 'complete: title с эмодзи'),
    assert(
      t.description === '«Подтянуть английский» — больше не в Focus',
      'complete: description объясняет последствие',
    ),
  ];
}

export function testCompleteToastNoTitle(): TestResult[] {
  const t = buildFocusToast('complete', { goalTitle: '' });
  return [
    assert(t.title === 'Цель завершена ✨', 'complete: title всегда есть'),
    assert(t.description === undefined, 'complete: без названия — нет description'),
  ];
}

export function testEachKindHasNonEmptyTitle(): TestResult[] {
  const kinds: FocusActionKind[] = ['checkin', 'reschedule', 'complete'];
  return kinds.map((k) => {
    const t = buildFocusToast(k, ctxPlain);
    return assert(
      typeof t.title === 'string' && t.title.length > 0,
      `${k}: title не пустой`,
    );
  });
}

// ---------- runner ----------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'focus-toast: формат валидной даты', results: testFormatValidDate() },
    { title: 'focus-toast: невалидная дата → null', results: testFormatBadInput() },
    { title: 'focus-toast: checkin', results: testCheckinToast() },
    { title: 'focus-toast: checkin без названия', results: testCheckinToastNoTitle() },
    { title: 'focus-toast: reschedule с датой', results: testRescheduleToastWithDate() },
    { title: 'focus-toast: reschedule с битой датой', results: testRescheduleToastBadDate() },
    { title: 'focus-toast: reschedule без даты', results: testRescheduleToastNoDate() },
    { title: 'focus-toast: complete', results: testCompleteToast() },
    { title: 'focus-toast: complete без названия', results: testCompleteToastNoTitle() },
    { title: 'focus-toast: title не пустой ни в одном kind', results: testEachKindHasNonEmptyTitle() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Goals Focus V2.1 toast smoke tests');
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
