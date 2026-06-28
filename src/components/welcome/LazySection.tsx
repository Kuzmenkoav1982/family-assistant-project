import { ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: number;
}

/**
 * Откладывает рендеринг секций за экраном через нативный content-visibility: auto.
 * Браузер сам пропускает отрисовку невидимых секций и резервирует под них место
 * (contain-intrinsic-size), но НЕ удаляет их из DOM — поэтому при скролле
 * не возникает скачков прокрутки (jump-to-top), как было с IntersectionObserver.
 */
export default function LazySection({
  children,
  minHeight = 400,
}: LazySectionProps) {
  return (
    <div
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${minHeight}px`,
      }}
    >
      {children}
    </div>
  );
}
