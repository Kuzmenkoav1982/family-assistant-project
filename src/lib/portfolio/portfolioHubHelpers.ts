// Portfolio Hub V1 — read-only helpers для главного экрана `/portfolio`.
//
// Чистые функции форматирования. Никаких side-effects, fetch'ей или React.
// Зачем отдельный файл: чтобы покрыть smoke-тестами и не дублировать
// форматирование в каждом блоке.
//
// Контракт: ничего из этого файла не пишет в БД и не зовёт API.

import type {
  FamilyPortfolioListItem,
  StrengthGrowthItem,
} from '@/types/portfolio.types';

/** Visual-state карточки участника в Hub. */
export type MemberCardState =
  | 'ready' // есть портфолио + есть данные
  | 'thin' // есть портфолио, но completeness < THIN_THRESHOLD
  | 'empty'; // нет портфолио вообще (has_portfolio === false)

export const COMPLETENESS_THIN_THRESHOLD = 30; // <30% — «мало данных»

export function getMemberCardState(item: FamilyPortfolioListItem): MemberCardState {
  if (!item.has_portfolio) return 'empty';
  if (typeof item.completeness !== 'number' || item.completeness < COMPLETENESS_THIN_THRESHOLD) {
    return 'thin';
  }
  return 'ready';
}

/**
 * «Обновлено N …» — человеческий timestamp.
 * Возвращает короткий ярлык для шапки/карточки. null если данных нет.
 */
export function formatLastAggregated(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diffMs = now.getTime() - t;
  if (diffMs < 0) return 'только что';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} ${pluralRu(minutes, 'минуту', 'минуты', 'минут')} назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${pluralRu(hours, 'час', 'часа', 'часов')} назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${pluralRu(days, 'день', 'дня', 'дней')} назад`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${pluralRu(weeks, 'неделю', 'недели', 'недель')} назад`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${pluralRu(months, 'месяц', 'месяца', 'месяцев')} назад`;
  const years = Math.floor(days / 365);
  return `${years} ${pluralRu(years, 'год', 'года', 'лет')} назад`;
}

/** Русское склонение «1 X / 2 Y / 5 Z». */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/**
 * Топ-чипы карточки: до 2 strengths и до 2 growth zones.
 * Дедупликация по sphere (чтобы одна сфера не появлялась в обоих списках).
 */
export interface MemberCardChips {
  strengths: StrengthGrowthItem[];
  growth: StrengthGrowthItem[];
}

export function getMemberCardChips(item: FamilyPortfolioListItem): MemberCardChips {
  const strengths = (item.strengths ?? []).slice(0, 2);
  const strengthSet = new Set(strengths.map((s) => s.sphere));
  const growth = (item.growth_zones ?? [])
    .filter((g) => !strengthSet.has(g.sphere))
    .slice(0, 2);
  return { strengths, growth };
}

/** Сортировка карточек семьи. По умолчанию: completeness desc, потом ready→thin→empty. */
export function sortMembersForHub(
  items: FamilyPortfolioListItem[],
): FamilyPortfolioListItem[] {
  const stateRank: Record<MemberCardState, number> = { ready: 0, thin: 1, empty: 2 };
  return [...items].sort((a, b) => {
    const ra = stateRank[getMemberCardState(a)];
    const rb = stateRank[getMemberCardState(b)];
    if (ra !== rb) return ra - rb;
    return (b.completeness ?? 0) - (a.completeness ?? 0);
  });
}

/** Сводка для шапки Hub: «N участников · M с активным портфолио». */
export interface HubSummary {
  total: number;
  withPortfolio: number;
  thin: number;
  empty: number;
}

export function buildHubSummary(items: FamilyPortfolioListItem[]): HubSummary {
  let withPortfolio = 0;
  let thin = 0;
  let empty = 0;
  for (const it of items) {
    const s = getMemberCardState(it);
    if (s === 'ready') withPortfolio++;
    else if (s === 'thin') thin++;
    else empty++;
  }
  return { total: items.length, withPortfolio, thin, empty };
}
