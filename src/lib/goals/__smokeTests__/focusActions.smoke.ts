// Smoke-tests для Goals Focus V2 — Reason-aware Quick Actions.
//
// Тестируем чисто-логические части (validation + reason→action mapping).
// React-компоненты не запускаем — ровно как договорились в Goals V1.

import {
  validateQuickCheckin,
  validateRescheduleDate,
  type QuickCheckinInput,
} from '@/components/goals/focus/useFocusActions';
import type { FocusReason } from '@/lib/goals/focusHelpers';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ---------- validateQuickCheckin ----------

export function testCheckinEmpty(): TestResult[] {
  const v = validateQuickCheckin({ summary: '   ' });
  return [assert(v === 'Опиши коротко, что изменилось', 'пустой summary → ошибка')];
}

export function testCheckinTooShort(): TestResult[] {
  const v = validateQuickCheckin({ summary: 'ок' });
  return [
    assert(
      v === 'Слишком коротко — добавь хотя бы 3 символа',
      'summary меньше 3 символов → ошибка',
    ),
  ];
}

export function testCheckinTooLong(): TestResult[] {
  const v = validateQuickCheckin({ summary: 'я'.repeat(501) });
  return [
    assert(
      v === 'Слишком длинно — сократи до 500 символов',
      'summary > 500 → ошибка',
    ),
  ];
}

export function testCheckinValid(): TestResult[] {
  const v = validateQuickCheckin({ summary: 'сделал шаг по плану' });
  return [assert(v === null, 'нормальный summary → ok')];
}

export function testCheckinScoreOutOfRange(): TestResult[] {
  const cases: Array<[QuickCheckinInput, boolean]> = [
    [{ summary: 'ok summary', selfAssessment: -1 }, false],
    [{ summary: 'ok summary', selfAssessment: 11 }, false],
    [{ summary: 'ok summary', selfAssessment: 0 }, true],
    [{ summary: 'ok summary', selfAssessment: 10 }, true],
    [{ summary: 'ok summary', selfAssessment: 5 }, true],
    [{ summary: 'ok summary', selfAssessment: null }, true],
  ];
  return cases.map(([input, shouldPass]) => {
    const v = validateQuickCheckin(input);
    const ok = shouldPass ? v === null : v !== null;
    return assert(
      ok,
      `selfAssessment=${String(input.selfAssessment)} → ${shouldPass ? 'ok' : 'reject'}`,
    );
  });
}

// ---------- validateRescheduleDate ----------

export function testRescheduleEmpty(): TestResult[] {
  return [assert(validateRescheduleDate('') === 'Укажи новый срок', 'пустая дата → ошибка')];
}

export function testRescheduleBadFormat(): TestResult[] {
  return [
    assert(validateRescheduleDate('2026/05/14') === 'Неверный формат даты', 'слэши → ошибка'),
    assert(validateRescheduleDate('14.05.2026') === 'Неверный формат даты', 'точки → ошибка'),
    assert(validateRescheduleDate('2026-5-1') === 'Неверный формат даты', 'без zero-pad → ошибка'),
  ];
}

export function testReschedulePast(): TestResult[] {
  return [
    assert(
      validateRescheduleDate('2000-01-01') === 'Новый срок не может быть в прошлом',
      'дата в прошлом → ошибка',
    ),
  ];
}

export function testRescheduleFuture(): TestResult[] {
  // +1 год — гарантированно в будущем независимо от системной даты.
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return [assert(validateRescheduleDate(iso) === null, 'дата +1 год → ok')];
}

// ---------- reason → action mapping (контрактный тест) ----------
// Это не runtime-логика, но мы фиксируем «договор», чтобы случайно не
// добавить mini-checkin для overdue или action-панель для stale.

const REASON_ACTION: Record<FocusReason, 'quickCheckin' | 'overdueActions'> = {
  stale: 'quickCheckin',
  regressed: 'quickCheckin',
  overdue: 'overdueActions',
};

export function testReasonActionMapping(): TestResult[] {
  return [
    assert(REASON_ACTION.stale === 'quickCheckin', 'stale → quickCheckin'),
    assert(REASON_ACTION.regressed === 'quickCheckin', 'regressed → quickCheckin'),
    assert(REASON_ACTION.overdue === 'overdueActions', 'overdue → overdueActions (НЕ check-in)'),
  ];
}

// ---------- runner ----------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'focus-v2: empty checkin', results: testCheckinEmpty() },
    { title: 'focus-v2: too short checkin', results: testCheckinTooShort() },
    { title: 'focus-v2: too long checkin', results: testCheckinTooLong() },
    { title: 'focus-v2: valid checkin', results: testCheckinValid() },
    { title: 'focus-v2: score range', results: testCheckinScoreOutOfRange() },
    { title: 'focus-v2: empty reschedule', results: testRescheduleEmpty() },
    { title: 'focus-v2: bad date format', results: testRescheduleBadFormat() },
    { title: 'focus-v2: past date rejected', results: testReschedulePast() },
    { title: 'focus-v2: future date ok', results: testRescheduleFuture() },
    { title: 'focus-v2: reason → action mapping', results: testReasonActionMapping() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Goals Focus V2 smoke tests');
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
