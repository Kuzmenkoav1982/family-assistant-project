// GlobalStatusBanner — глобальный верхний баннер для системных сообщений.
//
// B2 контракт:
//   - читает источник через useBannerSource() (в B3 заменится на fetch)
//   - резолвит активный через resolveActiveBanner() (B1)
//   - viewer (public/authenticated/admin) — useViewer()
//   - dismissed-список — useDismissedBanners() (localStorage)
//   - 5 типов: info | maintenance | warning | critical | update
//   - dismissible: при критичных не показываем кнопку закрытия
//   - a11y: role=alert для critical, role=status для остальных
//   - визуал: тип передаётся не только цветом — каждому tipу своя lucide-иконка
//   - не показывается на HIDDEN_ROUTES (auth/presentation страницы)
//
// Встраивается ОДИН раз в App.tsx, между GlobalTopBar и GlobalSidebar.

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { resolveActiveBanner } from '@/lib/statusBanner/resolveActiveBanner';
import { useBannerSource } from '@/lib/statusBanner/useBannerSource';
import { useViewer } from '@/lib/statusBanner/useViewer';
import { useDismissedBanners } from '@/lib/statusBanner/useDismissedBanners';
import type { BannerType } from '@/lib/statusBanner/types';

const HIDDEN_ROUTES = [
  '/welcome',
  '/login',
  '/register',
  '/reset-password',
  '/presentation',
  '/onboarding',
  '/demo-mode',
  '/admin-login',
  '/investor-deck',
];

type ToneStyle = {
  container: string;
  iconColor: string;
  icon: string;
  closeBtn: string;
};

const STYLE_BY_TYPE: Record<BannerType, ToneStyle> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    iconColor: 'text-blue-600',
    icon: 'Info',
    closeBtn: 'text-blue-700 hover:bg-blue-100',
  },
  update: {
    container: 'bg-violet-50 border-violet-200 text-violet-900',
    iconColor: 'text-violet-600',
    icon: 'Sparkles',
    closeBtn: 'text-violet-700 hover:bg-violet-100',
  },
  maintenance: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    iconColor: 'text-amber-600',
    icon: 'Wrench',
    closeBtn: 'text-amber-700 hover:bg-amber-100',
  },
  warning: {
    container: 'bg-orange-50 border-orange-200 text-orange-900',
    iconColor: 'text-orange-600',
    icon: 'AlertTriangle',
    closeBtn: 'text-orange-700 hover:bg-orange-100',
  },
  critical: {
    container: 'bg-rose-50 border-rose-300 text-rose-900',
    iconColor: 'text-rose-600',
    icon: 'AlertOctagon',
    closeBtn: 'text-rose-700 hover:bg-rose-100',
  },
};

const TYPE_SR_LABEL: Record<BannerType, string> = {
  info: 'Информация',
  update: 'Обновление',
  maintenance: 'Технические работы',
  warning: 'Внимание',
  critical: 'Критичное сообщение',
};

export default function GlobalStatusBanner() {
  const location = useLocation();
  const banners = useBannerSource();
  const viewer = useViewer();
  const { dismissed, dismiss } = useDismissedBanners();

  const shouldHide = HIDDEN_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + '/'),
  );

  const resolved = useMemo(() => {
    if (shouldHide) return null;
    const r = resolveActiveBanner(banners, {
      pathname: location.pathname,
      viewer,
      dismissedIds: dismissed,
    });
    return r.active;
  }, [banners, location.pathname, viewer, dismissed, shouldHide]);

  if (!resolved) return null;

  const { banner, effectiveDismissible } = resolved;
  const style = STYLE_BY_TYPE[banner.type];
  const isCritical = banner.type === 'critical';
  const role = isCritical ? 'alert' : 'status';
  const ariaLive = isCritical ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`fixed left-0 right-0 top-16 z-40 border-b ${style.container}`}
      data-banner-id={banner.id}
      data-banner-type={banner.type}
    >
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-start gap-2 sm:gap-3">
          <Icon
            name={style.icon}
            size={18}
            aria-hidden="true"
            className={`${style.iconColor} mt-0.5 shrink-0`}
            fallback="Info"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="sr-only">{TYPE_SR_LABEL[banner.type]}:</span>
              <span className="text-sm font-semibold break-words">
                {banner.title}
              </span>
            </div>
            <div className="text-xs sm:text-sm mt-0.5 break-words leading-snug">
              {banner.message}
            </div>
            {banner.ctaLabel && banner.ctaHref && (
              <a
                href={banner.ctaHref}
                target={banner.ctaHref.startsWith('http') ? '_blank' : undefined}
                rel={banner.ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1 mt-1.5 text-xs sm:text-sm font-medium underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40 rounded"
              >
                {banner.ctaLabel}
                <Icon name="ArrowRight" size={12} aria-hidden="true" />
              </a>
            )}
          </div>
          {effectiveDismissible && (
            <button
              type="button"
              onClick={() => dismiss(banner.id)}
              aria-label="Закрыть сообщение"
              className={`min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-md ${style.closeBtn} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40 shrink-0`}
            >
              <Icon name="X" size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
