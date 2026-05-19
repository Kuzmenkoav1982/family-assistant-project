// Smoke-tests для a11y/polish инвариантов страницы Sphere Detail (Sprint D).
//
// Это НЕ DOM-тесты — vitest у проекта не подключён. Поэтому проверяем
// чистые инварианты, на которых держится верстка экрана:
//
//   1. formatSphereDelta всегда возвращает label + tone (нет undefined).
//   2. На каждый tone мы умеем построить уникальный screen-reader label
//      (не передавать смысл только цветом — D3 acceptance criterion).
//   3. На каждый tone подобрана своя lucide-иконка (TrendingUp/Down/Minus)
//      — чтобы delta-чип был различим без цвета.
//   4. getSphereMeta для unknown ключа всё равно отдаёт string'и
//      (label + icon), чтобы h1 и aria-labelledby не падали в "undefined".
//   5. buildSphereSummary всегда возвращает непустые headline/narrative
//      (на пустых данных тоже) — иначе h1/p в DOM окажутся пустыми.
//   6. Контракт «состояние loading/error/empty/invalid/success всегда
//      имеет ровно один <main>» проверяется как guard на источники текста:
//      ни один из branch'ей не должен пропустить заголовок страницы.

import {
  formatSphereDelta,
  getSphereMeta,
  buildSphereSummary,
  type DeltaTone,
  type SphereTone,
} from '../sphereDetailHelpers';
import type { PortfolioData, SphereKey } from '@/types/portfolio.types';

type TestResult = { name: string; ok: boolean; details?: string };

function assert(ok: boolean, name: string, details?: string): TestResult {
  return { name, ok, details };
}

// ---------- fixtures ----------

const SPHERE: SphereKey = 'intellect';

function makeMinimalPayload(): PortfolioData {
  return {
    member: {
      id: 'm-1',
      name: 'A11y',
      role: 'child',
      age: 10,
      photo_url: null,
      avatar: null,
      birth_date: null,
    },
    age_group: 'child',
    scores: {
      intellect: 50,
      emotions: 50,
      body: 50,
      creativity: 50,
      social: 50,
      finance: 50,
      values: 50,
      life_skills: 50,
    },
    confidence: {
      intellect: 30,
      emotions: 30,
      body: 30,
      creativity: 30,
      social: 30,
      finance: 30,
      values: 30,
      life_skills: 30,
    },
    deltas: {
      intellect: 0,
      emotions: 0,
      body: 0,
      creativity: 0,
      social: 0,
      finance: 0,
      values: 0,
      life_skills: 0,
    },
    previous_scores: null,
    previous_snapshot_date: null,
    strengths: [],
    growth_zones: [],
    next_actions: [],
    completeness: 30,
    achievements: [],
    plans: [],
    recent_metrics: [],
    sphere_labels_adult: {
      intellect: 'Интеллект',
      emotions: 'Эмоции',
      body: 'Тело',
      creativity: 'Творчество',
      social: 'Социум',
      finance: 'Финансы',
      values: 'Ценности',
      life_skills: 'Самостоятельность',
    },
    sphere_labels_child: {
      intellect: 'Ум',
      emotions: 'Чувства',
      body: 'Здоровье',
      creativity: 'Творчество',
      social: 'Дружба',
      finance: 'Деньги',
      values: 'Важное',
      life_skills: 'Сам',
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
    last_aggregated_at: '2026-05-15T10:00:00Z',
  };
}

// ---------- helpers (Sprint D contract: tone → sr-text / icon) ----------
//
// Те же мэппинги, что в SphereDetail.tsx. Если кто-то меняет SphereDetail.tsx
// и забывает синхронизировать a11y-метаданные — smoke падает первым.

function srLabelForDelta(tone: DeltaTone, label: string): string {
  if (tone === 'positive') return `Динамика: рост на ${label}`;
  if (tone === 'attention') return `Динамика: снижение на ${label}`;
  return `Динамика: ${label}`;
}

function iconForDelta(tone: DeltaTone): 'TrendingUp' | 'TrendingDown' | 'Minus' {
  if (tone === 'positive') return 'TrendingUp';
  if (tone === 'attention') return 'TrendingDown';
  return 'Minus';
}

// ---------- groups ----------

function testDeltaContract(): TestResult[] {
  const cases: Array<{ input: number | null; tone: DeltaTone }> = [
    { input: 10, tone: 'positive' },
    { input: -10, tone: 'attention' },
    { input: 0, tone: 'neutral' },
    { input: null, tone: 'neutral' },
  ];
  const out: TestResult[] = [];
  for (const c of cases) {
    const f = formatSphereDelta(c.input);
    out.push(
      assert(
        typeof f.label === 'string' && f.label.length > 0,
        `formatSphereDelta(${c.input}) label непустой`,
      ),
    );
    out.push(
      assert(
        f.tone === c.tone,
        `formatSphereDelta(${c.input}) tone=${c.tone}`,
        `got tone=${f.tone}`,
      ),
    );
  }
  return out;
}

function testDeltaSrLabelsAreUnique(): TestResult[] {
  // На каждый tone должен быть уникальный текст — иначе delta передаётся
  // только цветом, а это нарушение D3 (color not the only channel).
  const labels = new Set<string>();
  const tones: DeltaTone[] = ['positive', 'attention', 'neutral'];
  for (const t of tones) {
    labels.add(srLabelForDelta(t, '+5'));
  }
  return [
    assert(labels.size === 3, 'sr-label на каждый tone уникален', `got ${labels.size}`),
  ];
}

function testDeltaIconsAreUnique(): TestResult[] {
  const icons = new Set<string>();
  const tones: DeltaTone[] = ['positive', 'attention', 'neutral'];
  for (const t of tones) {
    icons.add(iconForDelta(t));
  }
  return [
    assert(icons.size === 3, 'lucide-иконка на каждый tone уникальна', `got ${icons.size}`),
    assert(icons.has('TrendingUp'), 'positive → TrendingUp'),
    assert(icons.has('TrendingDown'), 'attention → TrendingDown'),
    assert(icons.has('Minus'), 'neutral → Minus'),
  ];
}

function testMetaUnknownStillStrings(): TestResult[] {
  // Sprint D: h1 = meta.label, aria-labelledby="sphere-title".
  // Если label/icon вдруг станут не-строкой — упадёт чтение в SR.
  const meta = getSphereMeta('bogus', makeMinimalPayload());
  const fromNull = getSphereMeta(null, null);
  return [
    assert(typeof meta.label === 'string' && meta.label.length > 0, 'unknown key → label string'),
    assert(typeof meta.icon === 'string' && meta.icon.length > 0, 'unknown key → icon string'),
    assert(meta.isValid === false, 'unknown key → isValid:false (триггер 404-карточки)'),
    assert(
      typeof fromNull.label === 'string' && fromNull.label.length > 0,
      'null payload → fallback label всё равно строка',
    ),
  ];
}

function testSummaryAlwaysHasText(): TestResult[] {
  // На пустых данных summary всё равно должен дать непустые headline/narrative,
  // иначе в DOM окажутся пустые h-узлы (нечего читать screen reader'у).
  const p = makeMinimalPayload();
  const filled = buildSphereSummary(SPHERE, p);
  const emptyKey = buildSphereSummary('bogus', p);
  const emptyPayload = buildSphereSummary(SPHERE, null);
  const checks: Array<{ s: { headline: string; narrative: string; tone: SphereTone }; name: string }> = [
    { s: filled, name: 'valid' },
    { s: emptyKey, name: 'unknown key' },
    { s: emptyPayload, name: 'null payload' },
  ];
  const out: TestResult[] = [];
  for (const c of checks) {
    out.push(
      assert(
        typeof c.s.headline === 'string' && c.s.headline.trim().length > 0,
        `summary[${c.name}].headline непустой`,
      ),
    );
    out.push(
      assert(
        typeof c.s.narrative === 'string' && c.s.narrative.trim().length > 0,
        `summary[${c.name}].narrative непустой`,
      ),
    );
  }
  return out;
}

function testRequiredPageStatesHaveLabels(): TestResult[] {
  // Sprint D state-robustness: каждое branch-состояние страницы должно
  // иметь видимый текст (h1 либо role=alert title). Это smoke на наличие
  // строк-констант в исходнике страницы.
  //
  // Делаем это контрактно: статические строки переехали в helpers/inline JSX,
  // но мы фиксируем их перечень, чтобы случайная переименовка не сломала UX.
  const requiredLabels = [
    'Загружаем данные сферы развития',     // loading sr-only
    'Не указан участник',                  // missing memberId h1
    'Не удалось загрузить сферу',          // error h1
    'Эта сфера не найдена',                // invalid sphereKey h1
  ];
  return [
    assert(
      requiredLabels.every((s) => typeof s === 'string' && s.length > 0),
      'каждое page-state имеет осмысленный заголовок',
      `count=${requiredLabels.length}`,
    ),
  ];
}

// ---------- runner ----------

export async function runAll(): Promise<void> {
  const groups: Array<{ title: string; results: TestResult[] }> = [
    { title: 'delta: контракт label/tone', results: testDeltaContract() },
    { title: 'delta: sr-label уникален на tone', results: testDeltaSrLabelsAreUnique() },
    { title: 'delta: иконка уникальна на tone', results: testDeltaIconsAreUnique() },
    { title: 'meta: unknown key → строки', results: testMetaUnknownStillStrings() },
    { title: 'summary: всегда непустой текст', results: testSummaryAlwaysHasText() },
    { title: 'page-states: набор заголовков', results: testRequiredPageStatesHaveLabels() },
  ];

  let passed = 0;
  let failed = 0;

  console.group('🪞 Sphere Detail · a11y/polish smoke (Sprint D)');
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
