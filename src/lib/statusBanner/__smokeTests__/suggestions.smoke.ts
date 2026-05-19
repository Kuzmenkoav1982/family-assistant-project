// Smoke для suggestion engine (B4).
//
// Главные инварианты, которые НЕЛЬЗЯ ломать:
//   1. Engine — pure: одинаковый вход → одинаковый выход (стабильные id).
//   2. NO AUTOPUBLISH: каждый draft.enabled === false. Это контрактная
//      гарантия v1, нарушение = silent push в shell.
//   3. Audience всех drafts === 'all' (соответствует B3.6 all_only_v1).

import { generateSuggestions } from '../suggestions/engine';
import type { SignalSnapshot } from '../suggestions/types';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

const FROZEN_NOW = new Date('2026-05-20T12:00:00Z');

function testEmptySnapshot(): TestResult[] {
  const out = generateSuggestions({}, FROZEN_NOW);
  return [
    assert(Array.isArray(out) && out.length === 0, 'пустой snapshot → []'),
  ];
}

function testWebVitalsPoor(): TestResult[] {
  const out = generateSuggestions({ performanceRating: 'poor' }, FROZEN_NOW);
  return [
    assert(out.length === 1, 'один suggestion для performanceRating=poor'),
    assert(out[0].draft.type === 'warning', 'тип warning'),
    assert(out[0].sourceKind === 'web_vitals', 'sourceKind web_vitals'),
    assert(out[0].confidence > 0.5, 'confidence высокий'),
  ];
}

function testSystemStatusMapping(): TestResult[] {
  const critical = generateSuggestions({ systemStatus: 'critical' }, FROZEN_NOW);
  const warning = generateSuggestions({ systemStatus: 'warning' }, FROZEN_NOW);
  const healthy = generateSuggestions({ systemStatus: 'healthy' }, FROZEN_NOW);
  return [
    assert(critical[0]?.draft.type === 'critical', 'critical → draft.type=critical'),
    assert(warning[0]?.draft.type === 'warning', 'warning → draft.type=warning'),
    assert(healthy.length === 0, 'healthy → нет suggestion'),
  ];
}

function testSortedByConfidence(): TestResult[] {
  const out = generateSuggestions(
    { performanceRating: 'needs-improvement', systemStatus: 'critical' },
    FROZEN_NOW,
  );
  return [
    assert(out.length >= 2, 'minimum 2 suggestions'),
    assert(
      out[0].confidence >= out[out.length - 1].confidence,
      'отсортировано по confidence desc',
    ),
  ];
}

function testStableId(): TestResult[] {
  const a = generateSuggestions({ performanceRating: 'poor' }, FROZEN_NOW);
  const b = generateSuggestions({ performanceRating: 'poor' }, FROZEN_NOW);
  return [
    assert(a[0].id === b[0].id, 'одинаковый вход → одинаковый id'),
  ];
}

function testNoAutopublish(): TestResult[] {
  // КРИТИЧНАЯ гарантия: ни один draft не должен прийти как enabled=true.
  // Если этот тест когда-нибудь упадёт — значит engine начал toggle-ить и
  // shell может silently показать баннер без явного действия админа.
  const snapshots: SignalSnapshot[] = [
    { performanceRating: 'poor' },
    { performanceRating: 'needs-improvement' },
    { systemStatus: 'warning' },
    { systemStatus: 'critical' },
    {
      alerts: [
        {
          id: 'a1',
          type: 'critical',
          title: 'Sample alert',
          message: 'Test message',
        },
      ],
    },
    {
      manualHint: {
        type: 'maintenance',
        title: 'Test',
        message: 'Test',
      },
    },
  ];
  const results: TestResult[] = [];
  for (const snap of snapshots) {
    const out = generateSuggestions(snap, FROZEN_NOW);
    for (const s of out) {
      results.push(
        assert(
          s.draft.enabled === false,
          `[NO AUTOPUBLISH] ${s.id} draft.enabled === false`,
          `got enabled=${s.draft.enabled}`,
        ),
      );
    }
  }
  return results;
}

function testAudienceAlwaysAll(): TestResult[] {
  // Соответствие B3.6 (all_only_v1): suggestion не должен предлагать gated
  // аудитории, чтобы не создавать заведомо невидимые баннеры.
  const out = generateSuggestions(
    {
      performanceRating: 'poor',
      systemStatus: 'critical',
      manualHint: { type: 'info', title: 'X', message: 'Y' },
    },
    FROZEN_NOW,
  );
  return out.map((s) =>
    assert(s.draft.audience === 'all', `${s.id} audience='all'`, `got ${s.draft.audience}`),
  );
}

function testAlertCriticalDownshift(): TestResult[] {
  // Engine из alert.type='critical' предлагает 'warning' (не critical) —
  // потому что переход в critical-баннер должен делать человек осознанно.
  const out = generateSuggestions(
    {
      alerts: [
        { id: 'a1', type: 'critical', title: 'Перегрузка', message: 'CPU 95%' },
      ],
    },
    FROZEN_NOW,
  );
  return [
    assert(out.length >= 1, 'хотя бы один suggestion из alert'),
    assert(out[0].draft.type === 'warning', 'critical alert → suggestion warning (не critical)'),
  ];
}

export async function runAll(): Promise<void> {
  const groups = [
    { title: 'empty snapshot', results: testEmptySnapshot() },
    { title: 'web vitals: poor', results: testWebVitalsPoor() },
    { title: 'system status mapping', results: testSystemStatusMapping() },
    { title: 'sorted by confidence', results: testSortedByConfidence() },
    { title: 'stable id', results: testStableId() },
    { title: 'NO AUTOPUBLISH (critical guard)', results: testNoAutopublish() },
    { title: 'audience always all (B3.6 policy)', results: testAudienceAlwaysAll() },
    { title: 'critical alert → warning suggestion', results: testAlertCriticalDownshift() },
  ];
  let passed = 0;
  let failed = 0;
  console.group('🟡 Status Banner Suggestions smoke (B4)');
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
