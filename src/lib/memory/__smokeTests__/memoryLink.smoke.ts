// Smoke-тесты для привязки существующих памятей (G2 memory guardrails).
// Тестируем pure-логику из useLinkExistingMemories:
//   - candidates filter (person mode: убираем уже привязанные)
//   - candidates filter (event mode: убираем уже привязанные к тому же event)
//   - поиск по тексту (title/caption/location)
//   - relinkCount (памяти с другим event_id в выборке)
//   - toggleAll (выбрать всё / снять всё)
// Без DOM и HTTP.

import type { MemoryEntry } from '@/components/memory/types';

type TestResult = { name: string; ok: boolean; details?: string };
type LinkMode = 'person' | 'event';

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── helpers — фабрика записей ────────────────────────────────────────────────

function makeEntry(p: Partial<MemoryEntry> & { id: string; title: string }): MemoryEntry {
  return {
    caption: null,
    story: null,
    memory_date: null,
    memory_period_label: null,
    location_label: null,
    event_id: null,
    cover_asset_id: null,
    status: 'published',
    created_at: null,
    updated_at: null,
    assets: [],
    member_ids: [],
    album_ids: [],
    ...p,
  };
}

// ─── candidates filter ────────────────────────────────────────────────────────
// Воспроизводим useMemo candidates из useLinkExistingMemories

function buildCandidates(
  allEntries: MemoryEntry[],
  mode: LinkMode,
  targetId: number | string,
  alreadyLinkedEntryIds: Set<string>,
  search: string,
): MemoryEntry[] {
  const q = search.trim().toLowerCase();
  return allEntries
    .filter(e => {
      if (mode === 'person') {
        if (alreadyLinkedEntryIds.has(e.id)) return false;
        return true;
      }
      if (e.event_id && String(e.event_id) === String(targetId)) return false;
      return true;
    })
    .filter(e => {
      if (!q) return true;
      const hay = [e.title, e.caption, e.location_label, e.memory_period_label]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
}

const ENTRIES: MemoryEntry[] = [
  makeEntry({ id: 'e1', title: 'Летние каникулы', location_label: 'Сочи', member_ids: [1] }),
  makeEntry({ id: 'e2', title: 'День рождения', caption: 'Праздник у моря', event_id: 'evt-1' }),
  makeEntry({ id: 'e3', title: 'Новый год', memory_period_label: 'Зима 2023', event_id: 'evt-2' }),
  makeEntry({ id: 'e4', title: 'Поездка в Питер', member_ids: [1, 2] }),
];

export function testCandidatesPersonMode(): TestResult[] {
  const alreadyLinked = new Set(['e1', 'e2']);
  const candidates = buildCandidates(ENTRIES, 'person', 1, alreadyLinked, '');
  return [
    assert(!candidates.find(e => e.id === 'e1'), 'e1 уже привязана → исключена'),
    assert(!candidates.find(e => e.id === 'e2'), 'e2 уже привязана → исключена'),
    assert(!!candidates.find(e => e.id === 'e3'), 'e3 не привязана → включена'),
    assert(!!candidates.find(e => e.id === 'e4'), 'e4 не привязана → включена'),
    assert(candidates.length === 2, 'ровно 2 кандидата'),
  ];
}

export function testCandidatesEventMode(): TestResult[] {
  const candidates = buildCandidates(ENTRIES, 'event', 'evt-1', new Set(), '');
  return [
    assert(!candidates.find(e => e.id === 'e2'), 'e2 уже в evt-1 → исключена'),
    assert(!!candidates.find(e => e.id === 'e1'), 'e1 без event → включена'),
    assert(!!candidates.find(e => e.id === 'e3'), 'e3 с другим event → включена (можно перепривязать)'),
    assert(!!candidates.find(e => e.id === 'e4'), 'e4 без event → включена'),
    assert(candidates.length === 3, 'ровно 3 кандидата'),
  ];
}

export function testCandidatesSearch(): TestResult[] {
  const r1 = buildCandidates(ENTRIES, 'person', 0, new Set(), 'каникулы');
  const r2 = buildCandidates(ENTRIES, 'person', 0, new Set(), 'МорЕ');
  const r3 = buildCandidates(ENTRIES, 'person', 0, new Set(), 'питер');
  const r4 = buildCandidates(ENTRIES, 'person', 0, new Set(), 'ничего такого');
  return [
    assert(r1.length === 1 && r1[0].id === 'e1', 'поиск по title работает'),
    assert(r2.length === 1 && r2[0].id === 'e2', 'поиск по caption (case-insensitive)'),
    assert(r3.length === 1 && r3[0].id === 'e4', 'поиск по title'),
    assert(r4.length === 0, 'нет совпадений → пустой результат'),
  ];
}

// ─── relinkCount ──────────────────────────────────────────────────────────────
// Воспроизводим useMemo relinkCount из useLinkExistingMemories

function calcRelinkCount(
  mode: LinkMode,
  selected: Set<string>,
  allEntries: MemoryEntry[],
  targetId: string,
): number {
  if (mode !== 'event') return 0;
  let n = 0;
  for (const id of selected) {
    const e = allEntries.find(x => x.id === id);
    if (e?.event_id && String(e.event_id) !== String(targetId)) n++;
  }
  return n;
}

export function testRelinkCount(): TestResult[] {
  // e3 имеет event_id = 'evt-2', привязываем к 'evt-1' — должна считаться как relink
  const selected = new Set(['e1', 'e3', 'e4']);
  const count = calcRelinkCount('event', selected, ENTRIES, 'evt-1');
  return [
    assert(count === 1, 'e3 перейдёт из evt-2 в evt-1 → relinkCount=1'),
    assert(
      calcRelinkCount('event', new Set(['e1', 'e4']), ENTRIES, 'evt-1') === 0,
      'нет перепривязок → relinkCount=0',
    ),
    assert(
      calcRelinkCount('person', selected, ENTRIES, 'evt-1') === 0,
      'режим person → relinkCount всегда 0',
    ),
  ];
}

// ─── toggleAll ────────────────────────────────────────────────────────────────

function applyToggleAll(
  allSelected: boolean,
  allCandidateIds: string[],
): Set<string> {
  if (allSelected) return new Set();
  return new Set(allCandidateIds);
}

export function testToggleAll(): TestResult[] {
  const ids = ['e1', 'e3', 'e4'];
  const whenAllSelected = applyToggleAll(true, ids);
  const whenNoneSelected = applyToggleAll(false, ids);
  return [
    assert(whenAllSelected.size === 0, 'toggleAll когда всё выбрано → снимает всё'),
    assert(whenNoneSelected.size === 3, 'toggleAll когда ничего → выбирает всё'),
    assert(ids.every(id => whenNoneSelected.has(id)), 'все id присутствуют в выборке'),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

export async function runAll(): Promise<void> {
  const groups = [
    { title: 'memory-link: candidates person mode', results: testCandidatesPersonMode() },
    { title: 'memory-link: candidates event mode', results: testCandidatesEventMode() },
    { title: 'memory-link: search filter', results: testCandidatesSearch() },
    { title: 'memory-link: relinkCount', results: testRelinkCount() },
    { title: 'memory-link: toggleAll', results: testToggleAll() },
  ];

  let passed = 0;
  let failed = 0;

  console.group('🔗 Memory — link existing memories smoke');
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
