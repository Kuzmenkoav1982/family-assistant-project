// Portfolio Member detail (Sprint B.2) — лёгкий section-wrapper.
//
// Цель: дать секциям единый ритм/лейбл/якорь БЕЗ перерисовки внутренних
// карточек (Trust/KeyHighlights/Radar/Improve/Insights/History/Table/
// Plan/Achievements). Никаких bg-white обёрток поверх внутренних `<Card>`
// (иначе будет «карточка в карточке»). Только:
//   - опциональная sticky-лейбл-шапка (uppercase tracking, серая)
//   - id-якорь для будущей навигации (#radar, #insights и т.д.)
//   - единый вертикальный отступ через `space-y-1.5`
//
// Внутренние компоненты сами рисуют свою `Card` — это не меняется.

import Icon from '@/components/ui/icon';
import type { ReactNode } from 'react';

export interface PortfolioSectionProps {
  /** Технический id (anchor). Пример: `radar`, `insights`. */
  id?: string;
  /** Короткий лейбл-шапка (uppercase). Если пусто — шапка не рисуется. */
  label?: string;
  /** Имя иконки lucide для шапки. Игнорируется, если нет label. */
  icon?: string;
  /** Дочерний компонент (внутри обычно `<Card>`). */
  children: ReactNode;
  /** Доп. классы на корневой `<section>`. */
  className?: string;
}

export default function PortfolioSection({
  id,
  label,
  icon,
  children,
  className = '',
}: PortfolioSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={label && id ? `${id}-label` : undefined}
      className={`space-y-1.5 scroll-mt-4 ${className}`.trim()}
    >
      {label && (
        <div
          id={id ? `${id}-label` : undefined}
          className="flex items-center gap-1.5 px-1 print:hidden"
        >
          {icon && (
            <Icon
              name={icon}
              size={11}
              className="text-gray-400"
              fallback="Circle"
            />
          )}
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
            {label}
          </span>
        </div>
      )}
      {children}
    </section>
  );
}
