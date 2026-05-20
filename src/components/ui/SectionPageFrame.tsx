// SectionPageFrame — канонический frame для inner section pages.
//
// Единая точка входа: вместо прямого использования SectionHero или
// кастомных inline-header'ов страницы используют этот компонент.
//
// variant="hero"  → полноэкранный image header (бывший SectionHero)
// variant="light" → лёгкий header без изображения, с accent-полосой
//
// Контракт:
//   - backPath обязателен (back navigation = стандарт inner pages)
//   - backMode="none" — escape hatch для root-like страниц без back
//   - width: standard (5xl) | wide (7xl) | narrow (3xl)
//   - rightAction: слот для CTA кнопки в шапке
//   - imageUrl: только для variant="hero", optional

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { ReactNode } from 'react';

export type SectionVariant = 'hero' | 'light';
export type SectionWidth = 'standard' | 'wide' | 'narrow';

const WIDTH_CLASS: Record<SectionWidth, string> = {
  standard: 'max-w-5xl',
  wide:     'max-w-7xl',
  narrow:   'max-w-3xl',
};

export interface SectionPageFrameProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  /** Escape hatch: скрыть back-кнопку на root-like страницах. */
  backMode?: 'default' | 'none';
  /**
   * Скрыть title/subtitle в light variant — когда страница сама рендерит
   * свой заголовок как первый children (например WorkshopHero).
   * Back-кнопка при этом остаётся.
   */
  hideTitle?: boolean;
  variant?: SectionVariant;
  width?: SectionWidth;
  /** Только для variant="hero". Если не передан — hero не рендерится, используется light. */
  imageUrl?: string;
  /** Accent-цвет для variant="light" (tailwind text-class). */
  accentColor?: string;
  /** Slot для CTA справа в шапке. */
  rightAction?: ReactNode;
  children: ReactNode;
  /** Background класс для всей страницы. */
  backgroundClass?: string;
}

export default function SectionPageFrame({
  title,
  subtitle,
  backPath = '/',
  backMode = 'default',
  hideTitle = false,
  variant,
  width = 'standard',
  imageUrl,
  accentColor = 'text-gray-700',
  rightAction,
  children,
  backgroundClass = 'bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900',
}: SectionPageFrameProps) {
  const navigate = useNavigate();
  const containerCls = `${WIDTH_CLASS[width]} mx-auto px-4`;

  // Если variant не задан явно — hero когда есть imageUrl, иначе light
  const resolvedVariant: SectionVariant = variant ?? (imageUrl ? 'hero' : 'light');

  const handleBack = () => navigate(backPath);

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <div className={containerCls}>
        {resolvedVariant === 'hero' && imageUrl ? (
          // ── Hero variant ──────────────────────────────────────────
          <div className="relative -mx-4 -mt-4 mb-4 rounded-b-2xl overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-44 sm:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex items-end justify-between gap-2">
              <div className="flex items-end gap-2 sm:gap-3 min-w-0 flex-1">
                {backMode !== 'none' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-white hover:bg-white/20 mb-1 flex-shrink-0"
                    aria-label="Назад"
                  >
                    <Icon name="ArrowLeft" size={18} />
                  </Button>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg leading-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {rightAction && <div className="mb-1 flex-shrink-0">{rightAction}</div>}
            </div>
          </div>
        ) : (
          // ── Light variant ─────────────────────────────────────────
          (backMode !== 'none' || !hideTitle) && (
            <div className="flex items-start justify-between gap-3 pt-4 pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 min-w-0">
                {backMode !== 'none' && (
                  <button
                    onClick={handleBack}
                    aria-label="Назад"
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon name="ArrowLeft" size={16} />
                  </button>
                )}
                {!hideTitle && (
                  <div className="min-w-0">
                    <h1 className={`text-lg sm:text-xl font-bold truncate ${accentColor}`}>
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
            </div>
          )
        )}

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}