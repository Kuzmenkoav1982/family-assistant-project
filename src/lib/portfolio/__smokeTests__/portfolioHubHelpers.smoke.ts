// Smoke-tests для Portfolio Hub V1 (Sprint A).
// Чистые функции форматирования и состояния карточек.

import type {
  FamilyPortfolioListItem,
  StrengthGrowthItem,
} from '@/types/portfolio.types';
import {
  buildHubSummary,
  formatLastAggregated,
  getMemberCardChips,
  getMemberCardState,
  pluralRu,
  sortMembersForHub,
} from '@/lib/portfolio/portfolioHubHelpers';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

function makeItem(p: Partial<FamilyPortfolioListItem> & { id: string }): FamilyPortfolioListItem {
  return {
    name: p.name ?? `Member ${p.id}`,
    role: 'parent',
    age: 30,
    photo_url: null,
    avatar: null,
    birth_date: null,
    has_portfolio: true,
    scores: {},
    confidence: {},
    completeness: 50,
    strengths: [],
    growth_zones: [],
    last_aggregated_at: null,
    ...p,
  } as FamilyPortfolioListItem;
}

const NOW = new Date('2026-05-14T12:00:00.000Z');

// --------- pluralRu ---------

export function testPluralBasic(): TestResult[] {
  return [
    assert(pluralRu(1, 'день', 'дня', 'дней') === 'день', '1 → день'),
    assert(pluralRu(2, 'день', 'дня', 'дней') === 'дня', '2 → дня'),
    assert(pluralRu(5, 'день', 'дня', 'дней') === 'дней', '5 → дней'),
    assert(pluralRu(11, 'день', 'дня', 'дней') === 'дней', '11 → дней (исключение)'),
    assert(pluralRu(21, 'день', 'дня', 'дней') === 'день', '21 → день'),
    assert(pluralRu(22, 'день', 'дня', 'дней') === 'дня', '22 → дня'),
    assert(pluralRu(0, 'день', 'дня', 'дней') === 'дней', '0 → дней'),
  ];
}

// --------- formatLastAggregated ---------

export function testFormatNullLike(): TestResult[] {
  return [
    assert(formatLastAggregated(null, NOW) === null, 'null → null'),
    assert(formatLastAggregated(undefined, NOW) === null, 'undefined → null'),
    assert(formatLastAggregated('', NOW) === null, 'empty → null'),
    assert(formatLastAggregated('not-a-date', NOW) === null, 'мусор → null'),
  ];
}

export function testFormatJustNow(): TestResult[] {
  // Меньше минуты назад.
  const iso = new Date(NOW.getTime() - 30 * 1000).toISOString();
  return [assert(formatLastAggregated(iso, NOW) === 'только что', '30 сек → только что')];
}

export function testFormatFuture(): TestResult[] {
  // Если по какой-то причине дата в будущем — fallback «только что».
  const iso = new Date(NOW.getTime() + 5 * 60 * 1000).toISOString();
  return [assert(formatLastAggregated(iso, NOW) === 'только что', 'будущее → только что')];
}

export function testFormatMinutes(): TestResult[] {
  return [
    assert(
      formatLastAggregated(new Date(NOW.getTime() - 5 * 60 * 1000).toISOString(), NOW) ===
        '5 минут назад',
      '5 минут',
    ),
    assert(
      formatLastAggregated(new Date(NOW.getTime() - 1 * 60 * 1000).toISOString(), NOW) ===
        '1 минуту назад',
      '1 минуту',
    ),
  ];
}

export function testFormatHoursDaysWeeks(): TestResult[] {
  const h = (n: number) => new Date(NOW.getTime() - n * 3600 * 1000).toISOString();
  return [
    assert(formatLastAggregated(h(2), NOW) === '2 часа назад', '2 часа'),
    assert(formatLastAggregated(h(1), NOW) === '1 час назад', '1 час'),
    assert(formatLastAggregated(h(25), NOW) === '1 день назад', '25 часов = 1 день'),
    assert(formatLastAggregated(h(24 * 8), NOW) === '1 неделю назад', '8 дней = 1 неделя'),
  ];
}

export function testFormatMonthsYears(): TestResult[] {
  const d = (n: number) => new Date(NOW.getTime() - n * 24 * 3600 * 1000).toISOString();
  return [
    assert(formatLastAggregated(d(60), NOW) === '2 месяца назад', '60 дней = 2 месяца'),
    assert(formatLastAggregated(d(400), NOW) === '1 год назад', '400 дней = 1 год'),
    assert(formatLastAggregated(d(365 * 3), NOW) === '3 года назад', '3 года'),
  ];
}

// --------- getMemberCardState ---------

export function testCardState(): TestResult[] {
  return [
    assert(
      getMemberCardState(makeItem({ id: 'a', has_portfolio: false })) === 'empty',
      'has_portfolio=false → empty',
    ),
    assert(
      getMemberCardState(makeItem({ id: 'b', has_portfolio: true, completeness: 10 })) === 'thin',
      'completeness=10 → thin',
    ),
    assert(
      getMemberCardState(makeItem({ id: 'c', has_portfolio: true, completeness: 30 })) === 'ready',
      'completeness=30 (граница) → ready',
    ),
    assert(
      getMemberCardState(makeItem({ id: 'd', has_portfolio: true, completeness: 80 })) === 'ready',
      'completeness=80 → ready',
    ),
  ];
}

// --------- getMemberCardChips ---------

const sphereChip = (sphere: string, score: number): StrengthGrowthItem =>
  ({ sphere, score, label: sphere, icon: 'Star' }) as StrengthGrowthItem;

export function testChipsLimit(): TestResult[] {
  const item = makeItem({
    id: 'x',
    strengths: [
      sphereChip('intellect', 80),
      sphereChip('emotions', 75),
      sphereChip('body', 70), // должна обрезаться, лимит 2
    ],
    growth_zones: [
      sphereChip('finance', 30),
      sphereChip('values', 25),
      sphereChip('social', 20),
    ],
  });
  const chips = getMemberCardChips(item);
  return [
    assert(chips.strengths.length === 2, 'strengths обрезаны до 2'),
    assert(chips.growth.length === 2, 'growth обрезан до 2'),
  ];
}

export function testChipsDedup(): TestResult[] {
  // Если одна сфера попала и в strengths, и в growth — в growth не показываем.
  const item = makeItem({
    id: 'y',
    strengths: [sphereChip('intellect', 80)],
    growth_zones: [
      sphereChip('intellect', 40), // должна выпасть
      sphereChip('finance', 30),
      sphereChip('values', 25),
    ],
  });
  const chips = getMemberCardChips(item);
  return [
    assert(chips.growth.length === 2, 'growth = 2 после дедупа'),
    assert(
      chips.growth.every((g) => g.sphere !== 'intellect'),
      'intellect не дублируется в growth',
    ),
  ];
}

// --------- sortMembersForHub ---------

export function testSortByState(): TestResult[] {
  const items = [
    makeItem({ id: 'empty', has_portfolio: false, completeness: 0 }),
    makeItem({ id: 'thin', has_portfolio: true, completeness: 10 }),
    makeItem({ id: 'ready1', has_portfolio: true, completeness: 50 }),
    makeItem({ id: 'ready2', has_portfolio: true, completeness: 90 }),
  ];
  const sorted = sortMembersForHub(items).map((i) => i.id);
  return [
    assert(
      JSON.stringify(sorted) === JSON.stringify(['ready2', 'ready1', 'thin', 'empty']),
      'порядок: ready (по completeness desc) → thin → empty',
    ),
  ];
}

export function testSortStableForEqual(): TestResult[] {
  // Два ready с одинаковой completeness — порядок сохраняется относительный.
  const items = [
    makeItem({ id: 'A', has_portfolio: true, completeness: 50 }),
    makeItem({ id: 'B', has_portfolio: true, completeness: 50 }),
  ];
  const sorted = sortMembersForHub(items).map((i) => i.id);
  return [assert(sorted[0] === 'A' && sorted[1] === 'B', 'стабильная сортировка для равных')];
}

// --------- buildHubSummary ---------

export function testHubSummary(): TestResult[] {
  const items = [
    makeItem({ id: '1', has_portfolio: true, completeness: 80 }),
    makeItem({ id: '2', has_portfolio: true, completeness: 50 }),
    makeItem({ id: '3', has_portfolio: true, completeness: 5 }),
    makeItem({ id: '4', has_portfolio: false }),
  ];
  const s = buildHubSummary(items);
  return [
    assert(s.total === 4, 'total = 4'),
    assert(s.withPortfolio === 2, 'ready = 2'),
    assert(s.thin === 1, 'thin = 1'),
    assert(s.empty === 1, 'empty = 1'),
  ];
}

export function testHubSummaryEmpty(): TestResult[] {
  const s = buildHubSummary([]);
  return [
    assert(s.total === 0, 'total = 0'),
    assert(s.withPortfolio === 0, 'ready = 0'),
    assert(s.thin === 0, 'thin = 0'),
    assert(s.empty === 0, 'empty = 0'),
  ];
}

// --------- runner ---------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'portfolio-hub: pluralRu', results: testPluralBasic() },
    { title: 'portfolio-hub: format null/empty', results: testFormatNullLike() },
    { title: 'portfolio-hub: format just now', results: testFormatJustNow() },
    { title: 'portfolio-hub: format future fallback', results: testFormatFuture() },
    { title: 'portfolio-hub: format minutes', results: testFormatMinutes() },
    { title: 'portfolio-hub: format hours/days/weeks', results: testFormatHoursDaysWeeks() },
    { title: 'portfolio-hub: format months/years', results: testFormatMonthsYears() },
    { title: 'portfolio-hub: card state', results: testCardState() },
    { title: 'portfolio-hub: chips limit', results: testChipsLimit() },
    { title: 'portfolio-hub: chips dedup', results: testChipsDedup() },
    { title: 'portfolio-hub: sort by state+completeness', results: testSortByState() },
    { title: 'portfolio-hub: sort stable for equal', results: testSortStableForEqual() },
    { title: 'portfolio-hub: hub summary', results: testHubSummary() },
    { title: 'portfolio-hub: hub summary empty', results: testHubSummaryEmpty() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('Portfolio Hub V1 smoke tests (Sprint A)');
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
