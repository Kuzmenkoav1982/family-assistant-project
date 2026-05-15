// Sphere Detail helpers (Sprint C / Wave 2 / Portfolio V1).
//
// Чистые TS-хелперы для страницы /portfolio/:memberId/sphere/:sphereKey.
// Никакого React, router, API, console — только нормализация payload'а
// MemberPortfolio + LifeGoal[] в удобные для рендера структуры.
//
// Контракт:
//   - любой null/undefined во входе → sensible default, не throw
//   - unknown sphereKey → isValid:false, остальные коллекторы возвращают []
//   - входные массивы НЕ мутируются (toSorted-стиль через [...arr].sort)
//   - source of truth для валидного набора сфер — SPHERE_ORDER из portfolio.types
//   - labels/icons берутся из payload (backend = source of truth), фронт
//     просто читает sphere_labels_child / sphere_icons
//
// Soft dependency: goals — отдельный аргумент, helper не дёргает API сам.
// Если goals не загрузились — UI передаст [] и блок «Связанные цели»
// деградирует локально, не валя весь Sphere Detail.

import {
  SPHERE_ORDER,
  type SphereKey,
  type PortfolioData,
  type StrengthGrowthItem,
  type Achievement,
  type PortfolioMetric,
  type NextAction,
  type DevelopmentPlan,
} from '@/types/portfolio.types';
import type { LifeGoal } from '@/components/life-road/types';

// ---------- types ----------

export type SphereTone = 'positive' | 'attention' | 'neutral' | 'empty';
export type DeltaTone = 'positive' | 'attention' | 'neutral';

export interface SphereMeta {
  key: string;
  isValid: boolean;
  label: string;
  icon: string;
}

export interface SphereHero {
  score: number | null;
  confidence: number | null;
  delta: number | null;
  trendLabel: string;
  updatedAtLabel: string | null;
}

export interface SphereSummary {
  headline: string;
  narrative: string;
  tone: SphereTone;
}

export interface SphereSource {
  metric_key: string;
  source_type: string;
  source_id: string | null;
  measured_at: string;
  raw_value: string | null;
  metric_value: number | null;
}

export interface SphereNextStep {
  text: string;
  origin: 'plan' | 'next_action' | 'fallback';
  sourceTag: string | null;
}

export interface DeltaFormat {
  sign: '+' | '-' | '';
  label: string;
  tone: DeltaTone;
}

// ---------- guards ----------

const VALID_KEYS: ReadonlySet<string> = new Set(SPHERE_ORDER);

function isValidKey(key: string | null | undefined): key is SphereKey {
  return typeof key === 'string' && VALID_KEYS.has(key);
}

function safeNumber(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return v;
}

function safeString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// ---------- 1. getSphereMeta ----------

const FALLBACK_LABEL = 'Сфера развития';
const FALLBACK_ICON = 'Circle';

export function getSphereMeta(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): SphereMeta {
  const key = safeString(sphereKey);
  if (!isValidKey(key)) {
    return { key, isValid: false, label: FALLBACK_LABEL, icon: FALLBACK_ICON };
  }
  const labels = payload?.sphere_labels_child ?? null;
  const icons = payload?.sphere_icons ?? null;
  const label = labels && labels[key] ? labels[key] : FALLBACK_LABEL;
  const icon = icons && icons[key] ? icons[key] : FALLBACK_ICON;
  return { key, isValid: true, label, icon };
}

// ---------- 2. buildSphereHero ----------

function pickSphereUpdatedAt(
  sphereKey: SphereKey,
  payload: PortfolioData,
): string | null {
  const metrics = Array.isArray(payload.recent_metrics) ? payload.recent_metrics : [];
  let latest: string | null = null;
  for (const m of metrics) {
    if (!m || m.sphere_key !== sphereKey) continue;
    const at = safeString(m.measured_at);
    if (!at) continue;
    if (!latest || at > latest) latest = at;
  }
  if (latest) return latest;
  const agg = safeString(payload.last_aggregated_at);
  return agg || null;
}

function trendLabelFromDelta(delta: number | null): string {
  if (delta === null) return 'нет данных по динамике';
  if (delta > 0) return 'растёт';
  if (delta < 0) return 'требует внимания';
  return 'стабильно';
}

export function buildSphereHero(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): SphereHero {
  const empty: SphereHero = {
    score: null,
    confidence: null,
    delta: null,
    trendLabel: trendLabelFromDelta(null),
    updatedAtLabel: null,
  };
  if (!payload || !isValidKey(sphereKey)) return empty;
  const score = safeNumber(payload.scores?.[sphereKey]);
  const confidence = safeNumber(payload.confidence?.[sphereKey]);
  const delta = safeNumber(payload.deltas?.[sphereKey]);
  return {
    score,
    confidence,
    delta,
    trendLabel: trendLabelFromDelta(delta),
    updatedAtLabel: pickSphereUpdatedAt(sphereKey, payload),
  };
}

// ---------- 3. buildSphereSummary ----------

const HEADLINE_BY_TONE: Record<SphereTone, string> = {
  empty: 'Накапливаем данные',
  positive: 'Сфера в плюсе',
  attention: 'Нужна поддержка',
  neutral: 'Стабильная зона',
};

function pickTone(hero: SphereHero, hasAnySignal: boolean): SphereTone {
  if (!hasAnySignal && hero.score === null) return 'empty';
  if (hero.score === null) return 'neutral';
  const score = hero.score;
  const delta = hero.delta ?? 0;
  if (delta <= -5) return 'attention';
  if (score < 35) return 'attention';
  if (score >= 70 && delta >= 0) return 'positive';
  if (delta >= 5) return 'positive';
  return 'neutral';
}

function narrativeForTone(
  tone: SphereTone,
  hero: SphereHero,
  sphereLabel: string,
): string {
  if (tone === 'empty') {
    return `Для сферы «${sphereLabel}» пока недостаточно сигналов. Добавьте наблюдения или пройдите тесты — мы соберём картину.`;
  }
  const scorePart = hero.score !== null ? `Текущий уровень ${hero.score}` : 'Уровень пока не посчитан';
  const deltaPart =
    hero.delta === null
      ? 'динамика не определена'
      : hero.delta > 0
        ? `динамика +${hero.delta}`
        : hero.delta < 0
          ? `динамика ${hero.delta}`
          : 'без изменений';
  if (tone === 'positive') {
    return `${scorePart}, ${deltaPart}. Сфера движется в правильную сторону — продолжайте.`;
  }
  if (tone === 'attention') {
    return `${scorePart}, ${deltaPart}. Это зона, которой стоит уделить внимание ближайшие недели.`;
  }
  return `${scorePart}, ${deltaPart}. Сфера в спокойном состоянии — поддерживаем ритм.`;
}

export function buildSphereSummary(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): SphereSummary {
  const meta = getSphereMeta(sphereKey, payload);
  const hero = buildSphereHero(sphereKey, payload);
  const strengths = collectSphereStrengths(sphereKey, payload);
  const growth = collectSphereGrowthZones(sphereKey, payload);
  const sources = collectSphereSources(sphereKey, payload);
  const hasAnySignal =
    strengths.length > 0 ||
    growth.length > 0 ||
    sources.length > 0 ||
    hero.score !== null ||
    hero.confidence !== null;

  const tone: SphereTone = !meta.isValid
    ? 'empty'
    : pickTone(hero, hasAnySignal);

  return {
    headline: HEADLINE_BY_TONE[tone],
    narrative: narrativeForTone(tone, hero, meta.label),
    tone,
  };
}

// ---------- 4–5. strengths & growth zones ----------

function filterItemsBySphere(
  items: StrengthGrowthItem[] | null | undefined,
  sphereKey: SphereKey,
): StrengthGrowthItem[] {
  if (!Array.isArray(items)) return [];
  const out: StrengthGrowthItem[] = [];
  for (const it of items) {
    if (it && it.sphere === sphereKey) out.push(it);
  }
  return out;
}

export function collectSphereStrengths(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): StrengthGrowthItem[] {
  if (!payload || !isValidKey(sphereKey)) return [];
  return filterItemsBySphere(payload.strengths, sphereKey);
}

export function collectSphereGrowthZones(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): StrengthGrowthItem[] {
  if (!payload || !isValidKey(sphereKey)) return [];
  return filterItemsBySphere(payload.growth_zones, sphereKey);
}

// ---------- 6. collectSphereSources ----------

const SOURCES_LIMIT = 5;

function metricDedupKey(m: PortfolioMetric): string {
  // Если есть source_id — он + source_type достаточно специфичны.
  // Если нет — добавляем measured_at, чтобы не схлопнуть разные события.
  return m.source_id
    ? `${m.source_type}::${m.source_id}`
    : `${m.source_type}::${m.metric_key}::${m.measured_at}`;
}

export function collectSphereSources(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): SphereSource[] {
  if (!payload || !isValidKey(sphereKey)) return [];
  const metrics = Array.isArray(payload.recent_metrics) ? payload.recent_metrics : [];
  const filtered = metrics.filter((m): m is PortfolioMetric => !!m && m.sphere_key === sphereKey);
  const sorted = [...filtered].sort((a, b) => {
    const ax = safeString(a.measured_at);
    const bx = safeString(b.measured_at);
    if (ax === bx) return 0;
    return ax < bx ? 1 : -1; // desc
  });
  const seen = new Set<string>();
  const out: SphereSource[] = [];
  for (const m of sorted) {
    const k = metricDedupKey(m);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({
      metric_key: safeString(m.metric_key),
      source_type: safeString(m.source_type),
      source_id: m.source_id ?? null,
      measured_at: safeString(m.measured_at),
      raw_value: m.raw_value ?? null,
      metric_value: safeNumber(m.metric_value),
    });
    if (out.length >= SOURCES_LIMIT) break;
  }
  return out;
}

// ---------- 7. collectSphereAchievements ----------

export function collectSphereAchievements(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): Achievement[] {
  if (!payload || !isValidKey(sphereKey)) return [];
  const list = Array.isArray(payload.achievements) ? payload.achievements : [];
  const filtered = list.filter((a) => !!a && a.sphere_key === sphereKey);
  return [...filtered].sort((a, b) => {
    const ax = safeString(a.earned_at);
    const bx = safeString(b.earned_at);
    if (ax === bx) return 0;
    return ax < bx ? 1 : -1; // desc
  });
}

// ---------- 8. collectRelatedGoals ----------

const EXCLUDED_GOAL_STATUSES: ReadonlySet<string> = new Set(['done', 'archived']);

const GOAL_STATUS_PRIORITY: Record<string, number> = {
  active: 0,
  paused: 1,
};

function goalStatusRank(status: string): number {
  if (status in GOAL_STATUS_PRIORITY) return GOAL_STATUS_PRIORITY[status];
  return 9;
}

export function collectRelatedGoals(
  sphereKey: string | null | undefined,
  goals: LifeGoal[] | null | undefined,
  options?: { memberId?: string | null },
): LifeGoal[] {
  if (!isValidKey(sphereKey)) return [];
  if (!Array.isArray(goals) || goals.length === 0) return [];
  const memberId = options?.memberId ?? null;
  const filtered = goals.filter((g) => {
    if (!g) return false;
    if (g.sphere !== sphereKey) return false;
    if (EXCLUDED_GOAL_STATUSES.has(g.status)) return false;
    if (memberId && g.ownerId && g.ownerId !== memberId) return false;
    return true;
  });
  return [...filtered].sort((a, b) => {
    const sa = goalStatusRank(a.status);
    const sb = goalStatusRank(b.status);
    if (sa !== sb) return sa - sb;
    const au = safeString(a.updatedAt);
    const bu = safeString(b.updatedAt);
    if (au !== bu) return au < bu ? 1 : -1; // newer first
    return safeString(a.title).localeCompare(safeString(b.title), 'ru');
  });
}

// ---------- 9. buildSphereNextSteps ----------

const NEXT_STEPS_LIMIT = 3;
const NEXT_STEPS_FALLBACK: SphereNextStep[] = [
  {
    text: 'Накапливаем сигналы, чтобы предложить следующий шаг',
    origin: 'fallback',
    sourceTag: null,
  },
];

function normalizeStepText(text: string): string {
  return text.toLocaleLowerCase('ru').replace(/\s+/g, ' ').trim();
}

export function buildSphereNextSteps(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): SphereNextStep[] {
  if (!payload || !isValidKey(sphereKey)) return NEXT_STEPS_FALLBACK;

  const candidates: SphereNextStep[] = [];

  const plans: DevelopmentPlan[] = Array.isArray(payload.plans) ? payload.plans : [];
  for (const p of plans) {
    if (!p || p.sphere_key !== sphereKey) continue;
    if (p.status === 'done' || p.status === 'archived') continue;
    const text = safeString(p.next_step) || safeString(p.title);
    if (!text) continue;
    candidates.push({ text, origin: 'plan', sourceTag: p.milestone ?? null });
  }

  const actions: NextAction[] = Array.isArray(payload.next_actions) ? payload.next_actions : [];
  for (const a of actions) {
    if (!a || a.sphere !== sphereKey) continue;
    const text = safeString(a.action);
    if (!text) continue;
    candidates.push({ text, origin: 'next_action', sourceTag: a.source ?? null });
  }

  const seen = new Set<string>();
  const out: SphereNextStep[] = [];
  for (const c of candidates) {
    const k = normalizeStepText(c.text);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= NEXT_STEPS_LIMIT) break;
  }

  return out.length > 0 ? out : NEXT_STEPS_FALLBACK;
}

// ---------- 10. formatSphereDelta ----------

const DELTA_DASH = '—';

export function formatSphereDelta(delta: number | null | undefined): DeltaFormat {
  const v = safeNumber(delta);
  if (v === null) return { sign: '', label: DELTA_DASH, tone: 'neutral' };
  if (v === 0) return { sign: '', label: DELTA_DASH, tone: 'neutral' };
  if (v > 0) return { sign: '+', label: `↑ +${v}`, tone: 'positive' };
  return { sign: '-', label: `↓ ${v}`, tone: 'attention' };
}

// ---------- 11. isSphereDataEmpty ----------

export function isSphereDataEmpty(
  sphereKey: string | null | undefined,
  payload: PortfolioData | null | undefined,
): boolean {
  if (!isValidKey(sphereKey)) return true;
  if (!payload) return true;

  if (safeNumber(payload.scores?.[sphereKey]) !== null) return false;
  if (collectSphereSources(sphereKey, payload).length > 0) return false;
  if (collectSphereStrengths(sphereKey, payload).length > 0) return false;
  if (collectSphereGrowthZones(sphereKey, payload).length > 0) return false;
  if (collectSphereAchievements(sphereKey, payload).length > 0) return false;

  // next_actions / plans проверяем отдельно (buildSphereNextSteps всегда отдаёт
  // как минимум fallback, поэтому смотрим сырые поля).
  const plans = Array.isArray(payload.plans) ? payload.plans : [];
  if (plans.some((p) => p && p.sphere_key === sphereKey)) return false;

  const actions = Array.isArray(payload.next_actions) ? payload.next_actions : [];
  if (actions.some((a) => a && a.sphere === sphereKey)) return false;

  return true;
}
