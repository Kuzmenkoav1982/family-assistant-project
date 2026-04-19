import { useEffect, useRef } from 'react';

interface Options {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  ignoreSelectors?: string[];
}

export function useSwipe<T extends HTMLElement = HTMLDivElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  ignoreSelectors = ['button', 'input', 'textarea', 'a', '[role="slider"]'],
}: Options) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let active = false;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ignoreSelectors.some((sel) => target.closest(sel))) {
        active = false;
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      active = true;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!active) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) onSwipeLeft?.();
        else onSwipeRight?.();
      }
      active = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, ignoreSelectors]);

  return ref;
}
