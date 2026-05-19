// Smoke для classifyBanner (B5).

import { classifyBanner } from '../classifyBanner';
import type { StatusBanner } from '../types';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

const NOW = Date.parse('2026-05-20T12:00:00Z');

function make(over: Partial<StatusBanner>): StatusBanner {
  return {
    id: over.id ?? 'b',
    type: over.type ?? 'info',
    title: 't',
    message: 'm',
    ctaLabel: null,
    ctaHref: null,
    enabled: over.enabled ?? true,
    dismissible: true,
    startsAt: over.startsAt ?? null,
    endsAt: over.endsAt ?? null,
    audience: 'all',
    routeScope: [],
    priority: 10,
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    publishedAt: null,
    unpublishedAt: null,
  };
}

function testAllStates(): TestResult[] {
  return [
    assert(
      classifyBanner(make({ enabled: false }), NOW) === 'disabled',
      'disabled when enabled=false (даже если в окне)',
    ),
    assert(
      classifyBanner(
        make({ enabled: true, endsAt: '2026-05-19T00:00:00Z' }),
        NOW,
      ) === 'expired',
      'expired when endsAt <= now',
    ),
    assert(
      classifyBanner(
        make({ enabled: true, startsAt: '2026-06-01T00:00:00Z' }),
        NOW,
      ) === 'scheduled',
      'scheduled when startsAt > now',
    ),
    assert(
      classifyBanner(make({ enabled: true }), NOW) === 'active',
      'active when no window',
    ),
    assert(
      classifyBanner(
        make({
          enabled: true,
          startsAt: '2026-05-01T00:00:00Z',
          endsAt: '2026-05-30T00:00:00Z',
        }),
        NOW,
      ) === 'active',
      'active when within window',
    ),
  ];
}

function testPriority(): TestResult[] {
  // disabled должен побеждать всё остальное (даже expired)
  return [
    assert(
      classifyBanner(
        make({ enabled: false, endsAt: '2026-05-19T00:00:00Z' }),
        NOW,
      ) === 'disabled',
      'disabled побеждает expired',
    ),
    // expired побеждает scheduled (в принципе невозможно одновременно)
    // но проверяем что endsAt раньше startsAt — кейс для битых данных
    assert(
      classifyBanner(
        make({
          enabled: true,
          startsAt: '2026-06-01T00:00:00Z',
          endsAt: '2026-05-19T00:00:00Z',
        }),
        NOW,
      ) === 'expired',
      'expired раньше scheduled при странном окне',
    ),
  ];
}

export async function runAll(): Promise<void> {
  const groups = [
    { title: 'all states', results: testAllStates() },
    { title: 'priority of lifecycle reasons', results: testPriority() },
  ];
  let passed = 0;
  let failed = 0;
  console.group('🟡 classifyBanner smoke');
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
