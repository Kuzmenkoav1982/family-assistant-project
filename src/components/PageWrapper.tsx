import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NO_PADDING_ROUTES = [
  '/welcome', '/login', '/register', '/reset-password', '/presentation',
  '/onboarding', '/demo-mode', '/admin-login', '/investor-deck',
];

function PullToRefreshWrapper({ children }: { children: React.ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const THRESHOLD = 70;

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || refreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(delta * 0.5, THRESHOLD + 20));
      }
    };

    const onTouchEnd = async () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        await new Promise(r => setTimeout(r, 300));
        window.location.reload();
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance, refreshing]);

  const active = pullDistance > 0 || refreshing;
  const ready = pullDistance >= THRESHOLD;

  return (
    <div className="pt-16 pb-14">
      <div
        className="flex items-center justify-center gap-2 text-violet-600 text-sm font-medium overflow-hidden transition-all duration-200"
        style={{ height: active ? Math.max(pullDistance, refreshing ? 48 : 0) : 0 }}
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={refreshing ? 'animate-spin' : 'transition-transform duration-150'}
          style={!refreshing ? { transform: `rotate(${(pullDistance / THRESHOLD) * 180}deg)` } : {}}
        >
          <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
        <span>{refreshing ? 'Обновляем...' : ready ? 'Отпустите для обновления' : 'Потяните для обновления'}</span>
      </div>
      {children}
    </div>
  );
}

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noPadding = NO_PADDING_ROUTES.some(r => location.pathname.startsWith(r));

  if (noPadding) return <>{children}</>;

  return <PullToRefreshWrapper>{children}</PullToRefreshWrapper>;
}
