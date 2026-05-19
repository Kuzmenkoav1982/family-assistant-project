// Status Banner — selection / resolution helper (B1).
//
// Контракт:
//   - чистая функция, никаких побочных эффектов
//   - не падает на битых данных: невалидные записи отбрасываются как 'invalid'
//   - детерминированный порядок выбора:
//       enabled → started → not expired → audience match → route match →
//       not locally dismissed → priority desc → publishedAt/updatedAt/createdAt desc
//   - возвращает result + список отброшенных кандидатов (для smoke/debug)
//
// Использование:
//   const r = resolveActiveBanner(banners, {
//     pathname: location.pathname,
//     viewer: 'authenticated',
//     dismissedIds: readDismissed(),
//   });
//   if (r.active) renderBanner(r.active.banner, r.active.effectiveDismissible);

import {
  BANNER_AUDIENCES,
  BANNER_TYPES,
  DEFAULT_DISMISSIBLE_BY_TYPE,
  type BannerAudience,
  type BannerType,
  type RejectReason,
  type RejectedCandidate,
  type ResolveContext,
  type ResolveResult,
  type ResolvedBanner,
  type StatusBanner,
  type ViewerKind,
} from './types';

const VALID_TYPES: ReadonlySet<string> = new Set(BANNER_TYPES);
const VALID_AUDIENCES: ReadonlySet<string> = new Set(BANNER_AUDIENCES);

// ---------- guards ----------

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function nonEmpty(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isBannerType(v: unknown): v is BannerType {
  return typeof v === 'string' && VALID_TYPES.has(v);
}

function isAudience(v: unknown): v is BannerAudience {
  return typeof v === 'string' && VALID_AUDIENCES.has(v);
}

function toMillis(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : NaN;
  }
  return NaN;
}

function isFiniteOrNull(t: number | null): t is number | null {
  // null допустим, NaN — нет
  return t === null || Number.isFinite(t);
}

/**
 * Жёсткая валидация записи. Любая запись, которая не пройдёт — отбрасывается
 * как 'invalid'. Это защита от мусора из БД / частично обновлённого payload'а.
 */
export function isValidBanner(input: unknown): input is StatusBanner {
  if (!input || typeof input !== 'object') return false;
  const b = input as Record<string, unknown>;

  if (!nonEmpty(b.id)) return false;
  if (!isBannerType(b.type)) return false;
  if (!nonEmpty(b.title)) return false;
  if (!nonEmpty(b.message)) return false;
  if (!isAudience(b.audience)) return false;

  // CTA pair
  const hasLabel = isString(b.ctaLabel) && b.ctaLabel.trim().length > 0;
  const hasHref = isString(b.ctaHref) && b.ctaHref.trim().length > 0;
  if (hasLabel !== hasHref) return false;

  // booleans
  if (typeof b.enabled !== 'boolean') return false;
  if (typeof b.dismissible !== 'boolean') return false;

  // dates: должны быть либо null, либо парситься в число
  const starts = toMillis(b.startsAt);
  const ends = toMillis(b.endsAt);
  if (!isFiniteOrNull(starts)) return false;
  if (!isFiniteOrNull(ends)) return false;
  if (starts !== null && ends !== null && ends <= starts) return false;

  // routeScope = массив строк
  if (!Array.isArray(b.routeScope)) return false;
  for (const p of b.routeScope) {
    if (!isString(p)) return false;
  }

  // priority — конечное число
  if (typeof b.priority !== 'number' || !Number.isFinite(b.priority)) return false;

  return true;
}

// ---------- audience matching ----------

function audienceMatches(banner: StatusBanner, viewer: ViewerKind): boolean {
  if (banner.audience === 'all') return true;
  if (banner.audience === 'authenticated') {
    return viewer === 'authenticated' || viewer === 'admin';
  }
  if (banner.audience === 'admins') {
    return viewer === 'admin';
  }
  return false;
}

// ---------- route matching ----------

/**
 * Пустой routeScope = global → совпадает со всем.
 * Иначе — pathname должен начинаться хотя бы с одного из префиксов
 * на границе сегмента ('/portfolio' матчит '/portfolio' и '/portfolio/123',
 * но НЕ '/portfolio-compare').
 */
function routeMatches(scope: ReadonlyArray<string>, pathname: string): boolean {
  if (scope.length === 0) return true;
  const path = pathname || '/';
  for (const raw of scope) {
    const prefix = raw.trim();
    if (!prefix) continue;
    if (prefix === '/' || prefix === '/*') return true;
    if (path === prefix) return true;
    if (path.startsWith(prefix + '/')) return true;
  }
  return false;
}

// ---------- effective dismissible ----------

/**
 * critical по умолчанию не dismissible. Если админ явно поставил dismissible=true
 * для critical — уважаем (поле в БД boolean NOT NULL, значит пришло осознанно).
 *
 * Сейчас БД хранит boolean NOT NULL DEFAULT TRUE — мы НЕ можем отличить «не задано»
 * от «явно true». Поэтому правило применяем мягко: для critical при dismissible=true
 * мы оставляем true (админ выбрал явно). В будущем, если БД станет nullable —
 * helper уже готов учитывать DEFAULT_DISMISSIBLE_BY_TYPE.
 */
function resolveDismissible(banner: StatusBanner): boolean {
  // На сегодня — просто отдаём то, что в БД, плюс safety-net для critical:
  // если по какой-то причине поле было сброшено в false-by-mistake — не падаем.
  if (banner.type === 'critical') {
    return banner.dismissible === true ? true : DEFAULT_DISMISSIBLE_BY_TYPE.critical;
  }
  return banner.dismissible;
}

// ---------- comparator for active candidates ----------

function freshnessOf(b: StatusBanner): number {
  const pub = toMillis(b.publishedAt);
  if (typeof pub === 'number' && Number.isFinite(pub)) return pub;
  const upd = toMillis(b.updatedAt);
  if (typeof upd === 'number' && Number.isFinite(upd)) return upd;
  const cr = toMillis(b.createdAt);
  if (typeof cr === 'number' && Number.isFinite(cr)) return cr;
  return 0;
}

function compareActive(a: StatusBanner, b: StatusBanner): number {
  if (b.priority !== a.priority) return b.priority - a.priority;
  return freshnessOf(b) - freshnessOf(a);
}

// ---------- main resolver ----------

export function resolveActiveBanner(
  candidates: ReadonlyArray<unknown>,
  ctx: ResolveContext,
): ResolveResult {
  const nowMs = (() => {
    if (ctx.now === undefined) return Date.now();
    if (typeof ctx.now === 'number') return ctx.now;
    return ctx.now.getTime();
  })();
  const dismissed = new Set(ctx.dismissedIds ?? []);
  const rejected: RejectedCandidate[] = [];
  const alive: StatusBanner[] = [];

  for (const raw of candidates) {
    if (!isValidBanner(raw)) {
      const id = isString((raw as { id?: unknown })?.id)
        ? (raw as { id: string }).id
        : '<invalid>';
      rejected.push({ id, reason: 'invalid' });
      continue;
    }

    const banner = raw;

    if (!banner.enabled) {
      rejected.push({ id: banner.id, reason: 'disabled' });
      continue;
    }

    const starts = toMillis(banner.startsAt);
    if (typeof starts === 'number' && starts > nowMs) {
      rejected.push({ id: banner.id, reason: 'not-started' });
      continue;
    }

    const ends = toMillis(banner.endsAt);
    if (typeof ends === 'number' && ends <= nowMs) {
      rejected.push({ id: banner.id, reason: 'expired' });
      continue;
    }

    if (!audienceMatches(banner, ctx.viewer)) {
      rejected.push({ id: banner.id, reason: 'audience-mismatch' });
      continue;
    }

    if (!routeMatches(banner.routeScope, ctx.pathname)) {
      rejected.push({ id: banner.id, reason: 'route-mismatch' });
      continue;
    }

    const effectiveDismissible = resolveDismissible(banner);
    if (effectiveDismissible && dismissed.has(banner.id)) {
      rejected.push({ id: banner.id, reason: 'locally-dismissed' });
      continue;
    }

    alive.push(banner);
  }

  if (alive.length === 0) {
    return { active: null, rejected };
  }

  alive.sort(compareActive);
  const winner = alive[0];

  // Тех. note: невыбранные alive — не «rejected» в смысле политики, это
  // просто проигравшие сортировку. В rejected их не пишем, чтобы не путать
  // консьюмеров. Если нужно для debug — добавим в B5.

  const resolved: ResolvedBanner = {
    banner: winner,
    effectiveDismissible: resolveDismissible(winner),
    reason: 'selected',
  };

  return { active: resolved, rejected };
}

// ---------- exports for tests ----------

export const __test__ = {
  audienceMatches,
  routeMatches,
  resolveDismissible,
  freshnessOf,
  compareActive,
  toMillis,
};
