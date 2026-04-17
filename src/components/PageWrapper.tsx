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
    const getScrollTop = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    const onTouchStart = (e: TouchEvent) => {
      if (getScrollTop() > 5) {
        isDragging.current = false;
        return;
      }
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || refreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && getScrollTop() <= 5) {
        setPullDistance(Math.min(delta * 0.5, 120));
      } else if (delta < 0) {
        setPullDistance(0);
      }
    };

    const onTouchEnd = async () => {
      if (!isDragging.current) {
        setPullDistance(0);
        return;
      }
      isDragging.current = false;
      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(60);
        await new Promise(r => setTimeout(r, 400));
        window.location.reload();
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [pullDistance, refreshing]);

  const visible = pullDistance > 0 || refreshing;
  const ready = pullDistance >= THRESHOLD;
  const indicatorY = refreshing ? 20 : Math.max(-60, pullDistance - 60);

  return (
    <>
      {visible && (
        <div
          className="fixed left-0 right-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{
            top: 70,
            transform: `translateY(${indicatorY}px)`,
            transition: refreshing ? 'transform 0.2s' : 'none',
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl px-4 py-2.5 flex items-center gap-2 border border-violet-200">
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`text-violet-600 ${refreshing ? 'animate-spin' : ''}`}
              style={!refreshing ? { transform: `rotate(${(pullDistance / THRESHOLD) * 360}deg)`, transition: 'transform 0.05s' } : {}}
            >
              <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            <span className="text-sm font-semibold text-violet-700">
              {refreshing ? 'Обновляем...' : ready ? 'Отпустите' : 'Потяните'}
            </span>
          </div>
        </div>
      )}
      <div className="pt-16 pb-14">{children}</div>
    </>
  );
}

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const noPadding = NO_PADDING_ROUTES.some(r => location.pathname.startsWith(r));

  if (noPadding) return <>{children}</>;

  return <PullToRefreshWrapper>{children}</PullToRefreshWrapper>;
}
