import { useEffect, useRef, useState } from 'react';

// Общие хуки для polish-эффектов прогресса (SMART / OKR / Wheel).
// Вынесены отдельно, чтобы не дублировать в каждом *ProgressDisplay.

/** Системная настройка «уменьшать анимации». При true — без зумов/glow. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/**
 * Tick-up: плавно докручивает отображаемое число от предыдущего к новому.
 * При reduced-motion — мгновенно. Длительность ~700 мс, ease-out cubic.
 */
export function useAnimatedNumber(
  target: number,
  reducedMotion: boolean,
  durationMs = 700,
): number {
  const [displayed, setDisplayed] = useState(target);
  const fromRef = useRef(target);
  const startTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = displayed;
    if (reducedMotion || displayed === target) {
      setDisplayed(target);
      return;
    }
    startTsRef.current = null;
    const tick = (ts: number) => {
      if (startTsRef.current === null) startTsRef.current = ts;
      const elapsed = ts - startTsRef.current;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(fromRef.current + (target - fromRef.current) * eased);
      setDisplayed(value);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion]);

  return displayed;
}

/** Стандартный shape объекта flash-эффекта. */
export interface ProgressFlash {
  delta: number;
  from: number;
  to: number;
  /** Метка нового события для перезапуска эффекта. */
  nonce: number;
}
