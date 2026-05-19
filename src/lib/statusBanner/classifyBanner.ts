// classifyBanner — определяет lifecycle-статус баннера для админ-списка.
//
// Pure-функция, ноль зависимостей. Используется в /admin/status-banner для
// группировки списка и в smoke-тестах.

import type { StatusBanner } from './types';

export type BannerLifecycle = 'active' | 'scheduled' | 'expired' | 'disabled';

export function classifyBanner(
  banner: StatusBanner,
  now: Date | number = Date.now(),
): BannerLifecycle {
  const t = typeof now === 'number' ? now : now.getTime();
  if (!banner.enabled) return 'disabled';

  if (banner.endsAt) {
    const ends = Date.parse(banner.endsAt);
    if (Number.isFinite(ends) && ends <= t) return 'expired';
  }

  if (banner.startsAt) {
    const starts = Date.parse(banner.startsAt);
    if (Number.isFinite(starts) && starts > t) return 'scheduled';
  }

  return 'active';
}

export const LIFECYCLE_LABEL: Record<BannerLifecycle, string> = {
  active: 'Активный',
  scheduled: 'Запланирован',
  expired: 'Завершён',
  disabled: 'Выключен',
};

export const LIFECYCLE_TONE: Record<BannerLifecycle, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  scheduled: 'bg-blue-100 text-blue-800',
  expired: 'bg-slate-100 text-slate-600',
  disabled: 'bg-amber-100 text-amber-800',
};
