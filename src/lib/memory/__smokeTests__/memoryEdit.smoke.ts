// Smoke-тесты для редактирования памяти (G2 memory guardrails).
// Тестируем pure-логику:
//   - toggleMember (добавить / удалить из набора)
//   - buildUpdatePayload (формирование patch для updateEntry)
//   - граничные случаи: пустой набор, дублирование, очистка полей
// Без DOM и HTTP.

import type { UpdateMemoryEntryInput } from '@/components/memory/types';
import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── toggleMember ─────────────────────────────────────────────────────────────
// Воспроизводим логику из useMemoryEntryForm.toggleMember

function toggleMember(prev: number[], id: number): number[] {
  return prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id];
}

export function testToggleMemberAdd(): TestResult[] {
  const initial: number[] = [1, 2];
  const result = toggleMember(initial, 3);
  return [
    assert(result.includes(3), 'toggle нового id → добавляется'),
    assert(result.length === 3, 'список вырос на 1'),
    assert(!result.includes(0), 'лишних id нет'),
  ];
}

export function testToggleMemberRemove(): TestResult[] {
  const initial: number[] = [1, 2, 3];
  const result = toggleMember(initial, 2);
  return [
    assert(!result.includes(2), 'toggle существующего id → удаляется'),
    assert(result.length === 2, 'список уменьшился на 1'),
    assert(result.includes(1) && result.includes(3), 'остальные остались'),
  ];
}

export function testToggleMemberIdempotent(): TestResult[] {
  const initial: number[] = [];
  const after1 = toggleMember(initial, 5);
  const after2 = toggleMember(after1, 5);
  return [
    assert(after1.includes(5), 'первый toggle → добавлен'),
    assert(after2.length === 0, 'второй toggle → удалён (идемпотентность)'),
  ];
}

// ─── buildUpdatePayload ───────────────────────────────────────────────────────
// Воспроизводим логику построения basePayload из handleSave

function buildUpdatePayload(fields: {
  title: string;
  caption: string;
  story: string;
  memoryDate: string;
  periodLabel: string;
  location: string;
  eventId: string | null;
  memberIds: number[];
}): UpdateMemoryEntryInput {
  return {
    title: fields.title.trim(),
    caption: fields.caption || null,
    story: fields.story || null,
    memory_date: fields.memoryDate || null,
    memory_period_label: fields.periodLabel || null,
    location_label: fields.location || null,
    event_id: fields.eventId,
    member_ids: fields.memberIds,
  };
}

export function testPayloadTrimTitle(): TestResult[] {
  const p = buildUpdatePayload({
    title: '  Поездка в горы  ',
    caption: '',
    story: '',
    memoryDate: '',
    periodLabel: '',
    location: '',
    eventId: null,
    memberIds: [1],
  });
  return [
    assert(p.title === 'Поездка в горы', 'title обрезается (trim)'),
  ];
}

export function testPayloadNullableFields(): TestResult[] {
  const p = buildUpdatePayload({
    title: 'Тест',
    caption: '',
    story: '',
    memoryDate: '',
    periodLabel: '',
    location: '',
    eventId: null,
    memberIds: [],
  });
  return [
    assert(p.caption === null, 'пустой caption → null'),
    assert(p.story === null, 'пустой story → null'),
    assert(p.memory_date === null, 'пустая дата → null'),
    assert(p.memory_period_label === null, 'пустой period_label → null'),
    assert(p.location_label === null, 'пустой location → null'),
    assert(p.event_id === null, 'null eventId → null'),
  ];
}

export function testPayloadWithValues(): TestResult[] {
  const p = buildUpdatePayload({
    title: 'День рождения',
    caption: 'Праздник',
    story: 'Длинная история',
    memoryDate: '2024-06-15',
    periodLabel: '',
    location: 'Москва',
    eventId: 'evt-123',
    memberIds: [1, 2, 3],
  });
  return [
    assert(p.caption === 'Праздник', 'caption заполнен'),
    assert(p.story === 'Длинная история', 'story заполнен'),
    assert(p.memory_date === '2024-06-15', 'дата сохранена'),
    assert(p.location_label === 'Москва', 'location заполнен'),
    assert(p.event_id === 'evt-123', 'eventId заполнен'),
    assert(p.member_ids?.length === 3, 'все member_ids сохранены'),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'memory-edit: toggleMember add', results: testToggleMemberAdd() },
    { title: 'memory-edit: toggleMember remove', results: testToggleMemberRemove() },
    { title: 'memory-edit: toggleMember idempotent', results: testToggleMemberIdempotent() },
    { title: 'memory-edit: payload trim title', results: testPayloadTrimTitle() },
    { title: 'memory-edit: payload nullable fields', results: testPayloadNullableFields() },
    { title: 'memory-edit: payload with values', results: testPayloadWithValues() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('memory-edit', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();

  let passed = 0;
  let failed = 0;

  console.group('✏️ Memory — edit entry smoke');
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