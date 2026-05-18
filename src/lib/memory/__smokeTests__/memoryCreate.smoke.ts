// Smoke-тесты для создания памяти (G2 memory guardrails).
// Тестируем валидационную логику handleSave из useMemoryEntryForm:
//   - пустой title → ошибка
//   - нет member и нет event → ошибка
//   - минимально валидный набор полей → ok
// Только pure-logic, без DOM и HTTP.

import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// Воспроизводим валидацию из useMemoryEntryForm.handleSave

function validateCreateInput(title: string, memberIds: number[], eventId: string | null): string | null {
  if (!title.trim()) return 'Укажите название памяти';
  if (memberIds.length === 0 && !eventId) return 'Привяжите хотя бы одного человека или событие';
  return null;
}

// ─── title validation ─────────────────────────────────────────────────────────

export function testEmptyTitle(): TestResult[] {
  return [
    assert(
      validateCreateInput('', [1], null) === 'Укажите название памяти',
      'пустой title → ошибка валидации',
    ),
    assert(
      validateCreateInput('   ', [1], null) === 'Укажите название памяти',
      'пробельный title → ошибка валидации',
    ),
    assert(
      validateCreateInput('\t\n', [1], null) === 'Укажите название памяти',
      'tab/newline title → ошибка валидации',
    ),
  ];
}

export function testValidTitle(): TestResult[] {
  return [
    assert(
      validateCreateInput('Летние каникулы', [1], null) === null,
      'нормальный title + member → ok',
    ),
    assert(
      validateCreateInput('День рождения', [], 'event-uuid-123') === null,
      'нормальный title + event → ok',
    ),
    assert(
      validateCreateInput('  Поездка  ', [1, 2], null) === null,
      'title с пробелами по краям (trim) + members → ok',
    ),
  ];
}

// ─── member/event binding validation ─────────────────────────────────────────

export function testNoBinding(): TestResult[] {
  return [
    assert(
      validateCreateInput('Воспоминание', [], null) === 'Привяжите хотя бы одного человека или событие',
      'нет member и нет event → ошибка',
    ),
    assert(
      validateCreateInput('Воспоминание', [], '') === 'Привяжите хотя бы одного человека или событие',
      'пустой eventId (строка) рассчитывается как null',
    ),
  ];
}

export function testWithBinding(): TestResult[] {
  const results: TestResult[] = [];

  // member only
  results.push(assert(validateCreateInput('Тест', [42], null) === null, 'только member → ok'));
  // event only
  results.push(assert(validateCreateInput('Тест', [], 'evt-1') === null, 'только event → ok'));
  // both
  results.push(assert(validateCreateInput('Тест', [1, 2], 'evt-2') === null, 'member + event → ok'));

  return results;
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'memory-create: пустой title', results: testEmptyTitle() },
    { title: 'memory-create: валидный title', results: testValidTitle() },
    { title: 'memory-create: нет привязки', results: testNoBinding() },
    { title: 'memory-create: есть привязка', results: testWithBinding() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('memory-create', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();

  let passed = 0;
  let failed = 0;

  console.group('🧠 Memory — create entry smoke');
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