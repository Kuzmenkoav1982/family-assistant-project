// Smoke-тесты для section/cover helpers (G2 memory guardrails).
// Тестируем pure-функции:
//   - formatMemoryShortDate: memory_date, memory_period_label, оба пусты
//   - resolveAlbumCover: ручная обложка, auto-cover, нет фото, cover не найден
// Без DOM и HTTP.

import { formatMemoryShortDate } from '@/components/memory/formatMemoryDate';
import { resolveAlbumCover } from '@/components/memory/coverResolver';
import type { MemoryEntry, MemoryAlbum, MemoryAsset } from '@/components/memory/types';
import { runSuite, type SmokeSuiteResult } from '@/lib/__smoke/smokeReport';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeAsset(id: string, url: string, sortOrder = 0): MemoryAsset {
  return { id, file_url: url, sort_order: sortOrder, width: null, height: null, mime_type: null };
}

function makeEntry(p: Partial<MemoryEntry> & { id: string; title: string }): MemoryEntry {
  return {
    caption: null, story: null, memory_date: null, memory_period_label: null,
    location_label: null, event_id: null, cover_asset_id: null,
    status: 'published', created_at: null, updated_at: null,
    assets: [], member_ids: [], album_ids: [],
    ...p,
  };
}

function makeAlbum(p: Partial<MemoryAlbum> & { id: string; title: string }): MemoryAlbum {
  return {
    description: null, cover_asset_id: null, created_at: null, updated_at: null,
    entries_count: 0, entries: [], preview_asset: null,
    ...p,
  };
}

// ─── formatMemoryShortDate ────────────────────────────────────────────────────

export function testFormatWithDate(): TestResult[] {
  const entry = makeEntry({ id: 'e1', title: 'Тест', memory_date: '2024-06-15' });
  const result = formatMemoryShortDate(entry);
  return [
    assert(result !== null, 'memory_date задана → не null'),
    assert(typeof result === 'string' && result.length > 0, 'возвращает непустую строку'),
    assert(result?.includes('2024') ?? false, 'год присутствует в выводе'),
  ];
}

export function testFormatWithPeriodLabel(): TestResult[] {
  const entry = makeEntry({ id: 'e2', title: 'Тест', memory_period_label: 'Лето 2022' });
  const result = formatMemoryShortDate(entry);
  return [
    assert(result === 'Лето 2022', 'нет memory_date → используется period_label'),
  ];
}

export function testFormatEmpty(): TestResult[] {
  const entry = makeEntry({ id: 'e3', title: 'Без даты' });
  const result = formatMemoryShortDate(entry);
  return [
    assert(result === null, 'нет ни memory_date, ни period_label → null'),
  ];
}

export function testFormatDateTakesPriority(): TestResult[] {
  const entry = makeEntry({
    id: 'e4', title: 'Тест',
    memory_date: '2023-12-31',
    memory_period_label: 'Не должно появиться',
  });
  const result = formatMemoryShortDate(entry);
  return [
    assert(result !== 'Не должно появиться', 'memory_date приоритетнее period_label'),
    assert(result !== null && result.includes('2023'), 'дата используется'),
  ];
}

// ─── resolveAlbumCover ────────────────────────────────────────────────────────

export function testCoverManual(): TestResult[] {
  const asset = makeAsset('asset-cover', 'https://cdn.example.com/cover.jpg', 0);
  const entry = makeEntry({ id: 'e1', title: 'Тест', assets: [asset], cover_asset_id: null });
  const album = makeAlbum({ id: 'a1', title: 'Альбом', cover_asset_id: 'asset-cover' });
  const result = resolveAlbumCover(album, [entry]);
  return [
    assert(result === 'https://cdn.example.com/cover.jpg', 'ручная обложка → возвращает её URL'),
  ];
}

export function testCoverAutoFallback(): TestResult[] {
  const a1 = makeAsset('a1', 'https://cdn.example.com/photo1.jpg', 1);
  const a2 = makeAsset('a2', 'https://cdn.example.com/photo2.jpg', 0);
  const entry = makeEntry({ id: 'e1', title: 'Тест', assets: [a1, a2] });
  const album = makeAlbum({ id: 'alb', title: 'Без обложки', cover_asset_id: null });
  const result = resolveAlbumCover(album, [entry]);
  return [
    assert(result !== null, 'нет ручной обложки, но есть фото → auto-cover'),
    assert(result === 'https://cdn.example.com/photo2.jpg', 'auto-cover = первое по sort_order'),
  ];
}

export function testCoverNoneWhenNoAssets(): TestResult[] {
  const entry = makeEntry({ id: 'e1', title: 'Пустая памать' });
  const album = makeAlbum({ id: 'alb', title: 'Пустой альбом' });
  const result = resolveAlbumCover(album, [entry]);
  return [
    assert(result === null, 'нет ни ручной обложки, ни фото → null'),
  ];
}

export function testCoverManualNotFound(): TestResult[] {
  // cover_asset_id указан, но asset отсутствует в entries — должен взять auto
  const asset = makeAsset('other-asset', 'https://cdn.example.com/auto.jpg', 0);
  const entry = makeEntry({ id: 'e1', title: 'Тест', assets: [asset] });
  const album = makeAlbum({ id: 'alb', title: 'Несуществующая обложка', cover_asset_id: 'ghost-id' });
  const result = resolveAlbumCover(album, [entry]);
  return [
    assert(result === 'https://cdn.example.com/auto.jpg', 'cover_asset_id не найден → fallback auto-cover'),
  ];
}

export function testCoverEmptyEntries(): TestResult[] {
  const album = makeAlbum({ id: 'alb', title: 'Пустой альбом' });
  const result = resolveAlbumCover(album, []);
  return [
    assert(result === null, 'пустой список entries → null'),
  ];
}

// ─── runner ───────────────────────────────────────────────────────────────────

function buildGroups() {
  return [
    { title: 'memory-section: formatDate with date', results: testFormatWithDate() },
    { title: 'memory-section: formatDate period_label', results: testFormatWithPeriodLabel() },
    { title: 'memory-section: formatDate empty', results: testFormatEmpty() },
    { title: 'memory-section: formatDate priority', results: testFormatDateTakesPriority() },
    { title: 'memory-section: cover manual', results: testCoverManual() },
    { title: 'memory-section: cover auto fallback', results: testCoverAutoFallback() },
    { title: 'memory-section: cover none', results: testCoverNoneWhenNoAssets() },
    { title: 'memory-section: cover not found → auto', results: testCoverManualNotFound() },
    { title: 'memory-section: cover empty entries', results: testCoverEmptyEntries() },
  ];
}

export async function runAllCollect(): Promise<SmokeSuiteResult> {
  return runSuite('memory-section', buildGroups());
}

export async function runAll(): Promise<void> {
  const groups = buildGroups();

  let passed = 0;
  let failed = 0;

  console.group('📚 Memory — section/cover helpers smoke');
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