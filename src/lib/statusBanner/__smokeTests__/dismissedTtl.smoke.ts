// Smoke для dismiss TTL/cleanup и legacy migration (B5).
//
// Используем __test__ exports (isLiveEntry, readStored, writeStored) —
// без рендера React-хука, чтобы можно было гонять чисто в JS-окружении.

import { __test__ } from '../useDismissedBanners';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

const { STORAGE_KEY, DEFAULT_TTL_MS, isLiveEntry, readStored } = __test__;

function withStorage(value: unknown, fn: () => void) {
  // Подмена localStorage значения по ключу STORAGE_KEY на время теста.
  // Если localStorage недоступен — тест должен degrade-нуться.
  if (typeof localStorage === 'undefined') {
    fn();
    return;
  }
  const prev = localStorage.getItem(STORAGE_KEY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    fn();
  } finally {
    if (prev === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, prev);
  }
}

function testIsLiveEntry(): TestResult[] {
  const now = Date.parse('2026-05-20T12:00:00Z');
  return [
    assert(
      isLiveEntry({ id: 'a', expiresAt: now + 1000, dismissedAt: now - 1000 }, now),
      'expiresAt in future → live',
    ),
    assert(
      !isLiveEntry({ id: 'b', expiresAt: now - 1, dismissedAt: now - 10 }, now),
      'expiresAt in past → not live',
    ),
    assert(
      isLiveEntry({ id: 'c', expiresAt: null, dismissedAt: now - DEFAULT_TTL_MS / 2 }, now),
      'expiresAt=null + dismissedAt свежий → live (через DEFAULT_TTL_MS)',
    ),
    assert(
      !isLiveEntry({ id: 'd', expiresAt: null, dismissedAt: now - DEFAULT_TTL_MS - 1000 }, now),
      'expiresAt=null + dismissedAt стар → not live',
    ),
  ];
}

function testReadStoredLegacy(): TestResult[] {
  if (typeof localStorage === 'undefined') return [];
  const now = Date.parse('2026-05-20T12:00:00Z');
  const out: TestResult[] = [];
  withStorage(['old-a', 'old-b'], () => {
    const r = readStored(now);
    out.push(
      assert(
        r.length === 2 && r.every((e) => e.expiresAt === null && e.dismissedAt === now),
        'legacy string[] формат ремигрируется с dismissedAt=now',
      ),
    );
  });
  withStorage('not-an-array', () => {
    out.push(assert(readStored(now).length === 0, 'битый JSON / не-массив → []'));
  });
  withStorage([{ id: 123 }, { foo: 'bar' }, null, 'ok-legacy'], () => {
    const r = readStored(now);
    out.push(
      assert(
        r.length === 1 && r[0].id === 'ok-legacy',
        'мусорные элементы отбрасываются, валидные сохраняются',
      ),
    );
  });
  return out;
}

function testReadStoredFiltersExpired(): TestResult[] {
  if (typeof localStorage === 'undefined') return [];
  const now = Date.parse('2026-05-20T12:00:00Z');
  const data = [
    { id: 'live', expiresAt: now + 60_000, dismissedAt: now - 1000 },
    { id: 'dead', expiresAt: now - 60_000, dismissedAt: now - 120_000 },
  ];
  const out: TestResult[] = [];
  withStorage(data, () => {
    const r = readStored(now);
    out.push(
      assert(r.length === 1 && r[0].id === 'live', 'истёкшая запись отфильтрована'),
    );
  });
  return out;
}

export async function runAll(): Promise<void> {
  const groups = [
    { title: 'isLiveEntry', results: testIsLiveEntry() },
    { title: 'readStored: legacy migration', results: testReadStoredLegacy() },
    { title: 'readStored: filters expired', results: testReadStoredFiltersExpired() },
  ];
  let passed = 0;
  let failed = 0;
  console.group('🟡 dismissed TTL smoke');
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
