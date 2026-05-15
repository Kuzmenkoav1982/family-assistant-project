// Smoke-tests для sphereDetailHelpers (Sprint C / Wave 2 / Portfolio V1).
//
// Контракт:
//   - все helpers — pure TS, без DOM/React
//   - тесты проверяют граничные случаи: null, undefined, unknown sphereKey,
//     пустые массивы, дубли, ограничение по размеру
//   - источник истины для валидных ключей — SPHERE_ORDER из portfolio.types

import {
  getSphereMeta,
  buildSphereHero,
  buildSphereSummary,
  collectSphereStrengths,
  collectSphereGrowthZones,
  collectSphereSources,
  collectSphereAchievements,
  collectRelatedGoals,
  buildSphereNextSteps,
  formatSphereDelta,
  isSphereDataEmpty,
} from '../sphereDetailHelpers';
import type { PortfolioData, SphereKey } from '@/types/portfolio.types';
import type { LifeGoal } from '@/components/life-road/types';

type TestResult = { name: string; ok: boolean; details?: string };
function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ---------- fixtures ----------

const SPHERE: SphereKey = 'intellect';
const OTHER_SPHERE: SphereKey = 'emotions';

function makePayload(overrides: Partial<PortfolioData> = {}): PortfolioData {
  const base: PortfolioData = {
    member: {
      id: 'm-1',
      name: 'Тест',
      role: 'child',
      age: 10,
      photo_url: null,
      avatar: null,
      birth_date: null,
    },
    age_group: 'child',
    scores: {
      intellect: 65,
      emotions: 50,
      body: 40,
      creativity: 70,
      social: 55,
      finance: 30,
      values: 60,
      life_skills: 45,
    },
    confidence: {
      intellect: 40,
      emotions: 30,
      body: 20,
      creativity: 50,
      social: 35,
      finance: 15,
      values: 45,
      life_skills: 25,
    },
    deltas: {
      intellect: 5,
      emotions: -3,
      body: 0,
      creativity: 8,
      social: -1,
      finance: 0,
      values: 2,
      life_skills: -7,
    },
    previous_scores: null,
    previous_snapshot_date: null,
    strengths: [],
    growth_zones: [],
    next_actions: [],
    completeness: 40,
    achievements: [],
    plans: [],
    recent_metrics: [],
    sphere_labels_adult: {
      intellect: 'Интеллект',
      emotions: 'Эмоциональная сфера',
      body: 'Тело и здоровье',
      creativity: 'Творчество',
      social: 'Социальные навыки',
      finance: 'Финансовые навыки',
      values: 'Ценности и характер',
      life_skills: 'Самостоятельность',
    },
    sphere_labels_child: {
      intellect: 'Ум и знания',
      emotions: 'Чувства',
      body: 'Здоровье и спорт',
      creativity: 'Творчество',
      social: 'Дружба и общение',
      finance: 'Деньги',
      values: 'Что важно',
      life_skills: 'Самостоятельность',
    },
    sphere_icons: {
      intellect: 'Brain',
      emotions: 'Heart',
      body: 'Activity',
      creativity: 'Palette',
      social: 'Users',
      finance: 'Coins',
      values: 'Star',
      life_skills: 'Target',
    },
    last_aggregated_at: '2026-05-10T10:00:00Z',
  };
  return { ...base, ...overrides };
}

// ---------- groups ----------

function testSphereMetaValid(): TestResult[] {
  const p = makePayload();
  const meta = getSphereMeta(SPHERE, p);
  return [
    assert(meta.isValid === true, 'valid key → isValid:true'),
    assert(meta.label === 'Ум и знания', 'valid key → label из payload'),
    assert(meta.icon === 'Brain', 'valid key → icon из payload'),
  ];
}

function testSphereMetaUnknown(): TestResult[] {
  const p = makePayload();
  const m1 = getSphereMeta('bogus', p);
  const m2 = getSphereMeta(null, p);
  const m3 = getSphereMeta(undefined, undefined);
  return [
    assert(m1.isValid === false, 'unknown key → isValid:false'),
    assert(m1.label === 'Сфера развития', 'unknown key → fallback label'),
    assert(m1.icon === 'Circle', 'unknown key → fallback icon'),
    assert(m2.isValid === false, 'null key → isValid:false'),
    assert(m3.isValid === false, 'undefined payload → не падает'),
  ];
}

function testHeroFull(): TestResult[] {
  const p = makePayload({
    recent_metrics: [
      { sphere_key: SPHERE, metric_key: 'pari', metric_value: 70, metric_unit: null, source_type: 'pari', source_id: 'p1', measured_at: '2026-05-13T10:00:00Z', raw_value: null },
    ],
  });
  const h = buildSphereHero(SPHERE, p);
  return [
    assert(h.score === 65, 'score из scores'),
    assert(h.confidence === 40, 'confidence из confidence'),
    assert(h.delta === 5, 'delta из deltas'),
    assert(h.trendLabel === 'растёт', 'trendLabel positive'),
    assert(h.updatedAtLabel === '2026-05-13T10:00:00Z', 'updatedAt = последний metric по сфере'),
  ];
}

function testHeroMissing(): TestResult[] {
  const p = makePayload({
    scores: { ...makePayload().scores, intellect: null as unknown as number },
    confidence: { ...makePayload().confidence, intellect: null as unknown as number },
    deltas: { ...makePayload().deltas, intellect: null as unknown as number },
    recent_metrics: [],
    last_aggregated_at: '',
  });
  const h = buildSphereHero(SPHERE, p);
  const empty = buildSphereHero(SPHERE, null);
  const unknown = buildSphereHero('bogus', p);
  return [
    assert(h.score === null, 'null score → null'),
    assert(h.confidence === null, 'null confidence → null'),
    assert(h.delta === null, 'null delta → null'),
    assert(h.updatedAtLabel === null, 'нет ни metric ни aggregated → null'),
    assert(empty.score === null && empty.delta === null, 'null payload → пустой hero'),
    assert(unknown.score === null, 'unknown key → пустой hero'),
  ];
}

function testSummaryTone(): TestResult[] {
  // positive: высокий score + положительная delta
  const positive = buildSphereSummary(SPHERE, makePayload({
    scores: { ...makePayload().scores, intellect: 75 },
    deltas: { ...makePayload().deltas, intellect: 8 },
  }));
  // attention: сильное падение
  const attention = buildSphereSummary(SPHERE, makePayload({
    scores: { ...makePayload().scores, intellect: 50 },
    deltas: { ...makePayload().deltas, intellect: -10 },
  }));
  // neutral: средний score, нулевая delta
  const neutral = buildSphereSummary(SPHERE, makePayload({
    scores: { ...makePayload().scores, intellect: 50 },
    deltas: { ...makePayload().deltas, intellect: 0 },
  }));
  // empty: ничего нет
  const emptyPayload = makePayload({
    scores: { ...makePayload().scores, intellect: null as unknown as number },
    deltas: { ...makePayload().deltas, intellect: null as unknown as number },
    confidence: { ...makePayload().confidence, intellect: null as unknown as number },
    strengths: [],
    growth_zones: [],
    recent_metrics: [],
  });
  const empty = buildSphereSummary(SPHERE, emptyPayload);
  return [
    assert(positive.tone === 'positive', 'positive: high score + positive delta'),
    assert(attention.tone === 'attention', 'attention: delta <= -5'),
    assert(neutral.tone === 'neutral', 'neutral: средняя зона'),
    assert(empty.tone === 'empty', 'empty: нет ни score, ни сигналов'),
    assert(typeof positive.headline === 'string' && positive.headline.length > 0, 'headline всегда строка'),
    assert(typeof empty.narrative === 'string' && empty.narrative.length > 0, 'narrative всегда строка'),
  ];
}

function testSourcesAggregation(): TestResult[] {
  const p = makePayload({
    recent_metrics: [
      { sphere_key: SPHERE, metric_key: 'a', metric_value: 1, metric_unit: null, source_type: 'pari', source_id: 'p1', measured_at: '2026-05-01T00:00:00Z', raw_value: null },
      { sphere_key: SPHERE, metric_key: 'b', metric_value: 2, metric_unit: null, source_type: 'achievement', source_id: 'a1', measured_at: '2026-05-13T00:00:00Z', raw_value: null },
      { sphere_key: OTHER_SPHERE, metric_key: 'x', metric_value: 3, metric_unit: null, source_type: 'pari', source_id: 'p2', measured_at: '2026-05-14T00:00:00Z', raw_value: null },
      { sphere_key: SPHERE, metric_key: 'c', metric_value: 4, metric_unit: null, source_type: 'note', source_id: null, measured_at: '2026-05-05T00:00:00Z', raw_value: null },
    ],
  });
  const list = collectSphereSources(SPHERE, p);
  return [
    assert(list.length === 3, 'фильтр по sphere_key (исключили emotions)'),
    assert(list[0].metric_key === 'b', 'sort desc: самый свежий первый'),
    assert(list[2].metric_key === 'a', 'sort desc: самый старый последний'),
  ];
}

function testSourcesLimit(): TestResult[] {
  const items = Array.from({ length: 8 }, (_, i) => ({
    sphere_key: SPHERE,
    metric_key: `m${i}`,
    metric_value: i,
    metric_unit: null,
    source_type: 'pari',
    source_id: `p${i}`,
    measured_at: `2026-05-${10 + i}T00:00:00Z`,
    raw_value: null,
  }));
  const p = makePayload({ recent_metrics: items });
  const list = collectSphereSources(SPHERE, p);
  return [
    assert(list.length === 5, 'лимит 5 соблюдён'),
    assert(list[0].metric_key === 'm7', 'первый — самый свежий'),
  ];
}

function testSourcesDedup(): TestResult[] {
  const p = makePayload({
    recent_metrics: [
      { sphere_key: SPHERE, metric_key: 'a', metric_value: 1, metric_unit: null, source_type: 'pari', source_id: 'p1', measured_at: '2026-05-13T00:00:00Z', raw_value: null },
      { sphere_key: SPHERE, metric_key: 'a', metric_value: 1, metric_unit: null, source_type: 'pari', source_id: 'p1', measured_at: '2026-05-13T00:00:00Z', raw_value: null }, // дубль
      { sphere_key: SPHERE, metric_key: 'b', metric_value: 2, metric_unit: null, source_type: 'note', source_id: null, measured_at: '2026-05-12T00:00:00Z', raw_value: null },
      { sphere_key: SPHERE, metric_key: 'b', metric_value: 2, metric_unit: null, source_type: 'note', source_id: null, measured_at: '2026-05-11T00:00:00Z', raw_value: null }, // не дубль (другой measured_at)
    ],
  });
  const list = collectSphereSources(SPHERE, p);
  return [
    assert(list.length === 3, 'dedup по source_id+type, без source_id — по measured_at'),
  ];
}

function testSourcesEmpty(): TestResult[] {
  return [
    assert(collectSphereSources(SPHERE, makePayload({ recent_metrics: [] })).length === 0, 'пустой recent_metrics → []'),
    assert(collectSphereSources(SPHERE, null).length === 0, 'null payload → []'),
    assert(collectSphereSources('bogus', makePayload()).length === 0, 'unknown key → []'),
  ];
}

function testStrengthsGrowth(): TestResult[] {
  const p = makePayload({
    strengths: [
      { sphere: SPHERE, score: 80, label: 'Сильная логика', icon: 'Brain' },
      { sphere: OTHER_SPHERE, score: 70, label: 'Эмпатия', icon: 'Heart' },
    ],
    growth_zones: [
      { sphere: SPHERE, score: 30, label: 'Внимание', icon: 'Brain' },
    ],
  });
  return [
    assert(collectSphereStrengths(SPHERE, p).length === 1, 'strengths фильтр по сфере'),
    assert(collectSphereStrengths(SPHERE, p)[0].label === 'Сильная логика', 'правильный элемент'),
    assert(collectSphereGrowthZones(SPHERE, p).length === 1, 'growth_zones фильтр по сфере'),
    assert(collectSphereStrengths(SPHERE, null).length === 0, 'null payload → []'),
    assert(collectSphereGrowthZones('bogus', p).length === 0, 'unknown key → []'),
  ];
}

function testAchievements(): TestResult[] {
  const p = makePayload({
    achievements: [
      { id: 'a1', badge_key: 'b1', title: 'Старое', description: null, icon: 'Star', sphere_key: SPHERE, category: 'cat', earned_at: '2026-04-01T00:00:00Z' },
      { id: 'a2', badge_key: 'b2', title: 'Новое', description: null, icon: 'Star', sphere_key: SPHERE, category: 'cat', earned_at: '2026-05-10T00:00:00Z' },
      { id: 'a3', badge_key: 'b3', title: 'Чужая сфера', description: null, icon: 'Heart', sphere_key: OTHER_SPHERE, category: 'cat', earned_at: '2026-05-12T00:00:00Z' },
    ],
  });
  const list = collectSphereAchievements(SPHERE, p);
  return [
    assert(list.length === 2, 'фильтр по sphere_key'),
    assert(list[0].id === 'a2', 'sort desc: новое первое'),
    assert(list[1].id === 'a1', 'старое второе'),
    assert(collectSphereAchievements(SPHERE, makePayload({ achievements: [] })).length === 0, 'пусто → []'),
  ];
}

function makeGoal(overrides: Partial<LifeGoal>): LifeGoal {
  return {
    id: 'g',
    title: 'Цель',
    sphere: SPHERE,
    status: 'active',
    progress: 0,
    steps: [],
    frameworkType: 'generic',
    frameworkState: {},
    scope: 'personal',
    linkedSphereIds: [],
    ...overrides,
  };
}

function testRelatedGoalsFilter(): TestResult[] {
  const goals: LifeGoal[] = [
    makeGoal({ id: 'g1', title: 'Б', sphere: SPHERE, status: 'active', updatedAt: '2026-05-10' }),
    makeGoal({ id: 'g2', title: 'А', sphere: SPHERE, status: 'active', updatedAt: '2026-05-12' }),
    makeGoal({ id: 'g3', title: 'Done', sphere: SPHERE, status: 'done' }),
    makeGoal({ id: 'g4', title: 'Archived', sphere: SPHERE, status: 'archived' }),
    makeGoal({ id: 'g5', title: 'Other sphere', sphere: OTHER_SPHERE, status: 'active' }),
    makeGoal({ id: 'g6', title: 'Paused', sphere: SPHERE, status: 'paused', updatedAt: '2026-05-15' }),
  ];
  const list = collectRelatedGoals(SPHERE, goals);
  return [
    assert(list.length === 3, 'исключили done/archived/other sphere'),
    assert(list[0].id === 'g2', 'active с более свежим updatedAt — выше'),
    assert(list[1].id === 'g1', 'active с менее свежим — ниже'),
    assert(list[2].id === 'g6', 'paused — после active'),
  ];
}

function testRelatedGoalsMember(): TestResult[] {
  const goals: LifeGoal[] = [
    makeGoal({ id: 'g1', sphere: SPHERE, ownerId: 'm-1' }),
    makeGoal({ id: 'g2', sphere: SPHERE, ownerId: 'm-2' }),
    makeGoal({ id: 'g3', sphere: SPHERE, ownerId: null }),
  ];
  const list = collectRelatedGoals(SPHERE, goals, { memberId: 'm-1' });
  return [
    assert(list.length === 2, 'фильтр memberId: свой owner + null-owner (семейные) проходят'),
    assert(list.some((g) => g.id === 'g1'), 'свой owner проходит'),
    assert(list.some((g) => g.id === 'g3'), 'null owner проходит (семейная)'),
    assert(!list.some((g) => g.id === 'g2'), 'чужой owner отфильтрован'),
  ];
}

function testRelatedGoalsEmpty(): TestResult[] {
  return [
    assert(collectRelatedGoals(SPHERE, []).length === 0, 'пустой массив → []'),
    assert(collectRelatedGoals(SPHERE, null).length === 0, 'null → []'),
    assert(collectRelatedGoals(SPHERE, undefined).length === 0, 'undefined → []'),
    assert(collectRelatedGoals('bogus', [makeGoal({ sphere: SPHERE })]).length === 0, 'unknown key → []'),
  ];
}

function testNextStepsMerge(): TestResult[] {
  const p = makePayload({
    plans: [
      { id: 'p1', sphere_key: SPHERE, title: 'План 1', description: null, milestone: 'M1', target_date: null, status: 'active', progress: 0, next_step: 'Шаг от плана' },
      { id: 'p2', sphere_key: SPHERE, title: 'План завершён', description: null, milestone: null, target_date: null, status: 'done', progress: 100, next_step: null },
    ],
    next_actions: [
      { sphere: SPHERE, sphere_label: 'X', icon: 'Brain', action: 'Шаг от действия', source: 'plan' },
      { sphere: OTHER_SPHERE, sphere_label: 'Y', icon: 'Heart', action: 'Чужая сфера', source: 'plan' },
    ],
  });
  const list = buildSphereNextSteps(SPHERE, p);
  return [
    assert(list.length === 2, 'merge plans + next_actions, без чужой сферы и done-плана'),
    assert(list[0].origin === 'plan', 'plans идут первыми'),
    assert(list[0].text === 'Шаг от плана', 'next_step из плана'),
    assert(list[1].origin === 'next_action', 'next_actions после'),
  ];
}

function testNextStepsDedupLimit(): TestResult[] {
  const p = makePayload({
    plans: [
      { id: 'p1', sphere_key: SPHERE, title: 'A', description: null, milestone: null, target_date: null, status: 'active', progress: 0, next_step: 'Сделать упражнение' },
    ],
    next_actions: [
      { sphere: SPHERE, sphere_label: 'X', icon: 'Brain', action: '  сделать  упражнение  ', source: 'plan' }, // дубль после normalize
      { sphere: SPHERE, sphere_label: 'X', icon: 'Brain', action: 'Действие 2', source: 'plan' },
      { sphere: SPHERE, sphere_label: 'X', icon: 'Brain', action: 'Действие 3', source: 'plan' },
      { sphere: SPHERE, sphere_label: 'X', icon: 'Brain', action: 'Действие 4', source: 'plan' },
    ],
  });
  const list = buildSphereNextSteps(SPHERE, p);
  return [
    assert(list.length === 3, 'лимит 3 соблюдён'),
    assert(list.filter((s) => s.text.toLocaleLowerCase('ru').includes('упражнение')).length === 1, 'dedup по нормализованному тексту'),
  ];
}

function testNextStepsFallback(): TestResult[] {
  const empty = buildSphereNextSteps(SPHERE, makePayload({ plans: [], next_actions: [] }));
  const nullP = buildSphereNextSteps(SPHERE, null);
  const unknown = buildSphereNextSteps('bogus', makePayload());
  return [
    assert(empty.length === 1 && empty[0].origin === 'fallback', 'пусто → fallback'),
    assert(nullP[0].origin === 'fallback', 'null payload → fallback'),
    assert(unknown[0].origin === 'fallback', 'unknown key → fallback'),
    assert(empty[0].text.length > 0, 'fallback text не пустой'),
  ];
}

function testDeltaFormat(): TestResult[] {
  const plus = formatSphereDelta(5);
  const minus = formatSphereDelta(-3);
  const zero = formatSphereDelta(0);
  const nul = formatSphereDelta(null);
  const undef = formatSphereDelta(undefined);
  return [
    assert(plus.label === '↑ +5' && plus.tone === 'positive', '+5 → ↑ +5 / positive'),
    assert(minus.label === '↓ -3' && minus.tone === 'attention', '-3 → ↓ -3 / attention'),
    assert(zero.label === '—' && zero.tone === 'neutral', '0 → — / neutral'),
    assert(nul.label === '—' && nul.tone === 'neutral', 'null → — / neutral'),
    assert(undef.label === '—' && undef.tone === 'neutral', 'undefined → — / neutral'),
  ];
}

function testIsEmpty(): TestResult[] {
  const fullEmpty = makePayload({
    scores: { intellect: null as unknown as number, emotions: 50, body: 40, creativity: 70, social: 55, finance: 30, values: 60, life_skills: 45 },
    strengths: [],
    growth_zones: [],
    recent_metrics: [],
    achievements: [],
    plans: [],
    next_actions: [],
  });
  const withScore = makePayload();
  const withMetric = makePayload({
    scores: { intellect: null as unknown as number, emotions: 50, body: 40, creativity: 70, social: 55, finance: 30, values: 60, life_skills: 45 },
    recent_metrics: [{ sphere_key: SPHERE, metric_key: 'a', metric_value: 1, metric_unit: null, source_type: 'pari', source_id: 'p', measured_at: '2026-05-01', raw_value: null }],
  });
  const withPlan = makePayload({
    scores: { intellect: null as unknown as number, emotions: 50, body: 40, creativity: 70, social: 55, finance: 30, values: 60, life_skills: 45 },
    plans: [{ id: 'p', sphere_key: SPHERE, title: 'T', description: null, milestone: null, target_date: null, status: 'active', progress: 0, next_step: null }],
  });
  return [
    assert(isSphereDataEmpty(SPHERE, fullEmpty) === true, 'нет данных → empty'),
    assert(isSphereDataEmpty(SPHERE, withScore) === false, 'есть score → не empty'),
    assert(isSphereDataEmpty(SPHERE, withMetric) === false, 'есть metric → не empty'),
    assert(isSphereDataEmpty(SPHERE, withPlan) === false, 'есть plan → не empty'),
    assert(isSphereDataEmpty('bogus', withScore) === true, 'unknown key → empty'),
    assert(isSphereDataEmpty(SPHERE, null) === true, 'null payload → empty'),
  ];
}

// ---------- runner ----------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'sphere meta: valid key', results: testSphereMetaValid() },
    { title: 'sphere meta: unknown key', results: testSphereMetaUnknown() },
    { title: 'hero: full data', results: testHeroFull() },
    { title: 'hero: missing fields', results: testHeroMissing() },
    { title: 'summary: tone', results: testSummaryTone() },
    { title: 'sources: aggregation', results: testSourcesAggregation() },
    { title: 'sources: limit 5', results: testSourcesLimit() },
    { title: 'sources: dedup', results: testSourcesDedup() },
    { title: 'sources: empty', results: testSourcesEmpty() },
    { title: 'strengths & growth', results: testStrengthsGrowth() },
    { title: 'achievements', results: testAchievements() },
    { title: 'related goals: filter & sort', results: testRelatedGoalsFilter() },
    { title: 'related goals: memberId', results: testRelatedGoalsMember() },
    { title: 'related goals: empty', results: testRelatedGoalsEmpty() },
    { title: 'next steps: merge', results: testNextStepsMerge() },
    { title: 'next steps: dedup & limit', results: testNextStepsDedupLimit() },
    { title: 'next steps: fallback', results: testNextStepsFallback() },
    { title: 'delta formatter', results: testDeltaFormat() },
    { title: 'isSphereDataEmpty', results: testIsEmpty() },
  ];

  let passed = 0;
  let failed = 0;
   
  console.group('SphereDetail helpers smoke (Sprint C)');
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
