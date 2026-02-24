import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

const HIDDEN_ROUTES = [
  '/welcome', '/login', '/register', '/reset-password', '/presentation',
  '/onboarding', '/demo-mode', '/admin-login', '/investor-deck',
];

export default function GlobalSidebar() {
  const location = useLocation();
  const [showHint, setShowHint] = useState(false);
  const hintShownRef = useRef(false);

  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('globalSidebarVisible');
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('globalSidebarVisible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    const handler = () => setIsVisible(prev => !prev);
    window.addEventListener('toggleGlobalSidebar', handler);
    return () => window.removeEventListener('toggleGlobalSidebar', handler);
  }, []);

  useEffect(() => {
    if (hintShownRef.current) return;
    const shouldShowHint = localStorage.getItem('demoShowSidebarHint') === 'true';
    if (shouldShowHint && location.pathname === '/') {
      hintShownRef.current = true;
      localStorage.removeItem('demoShowSidebarHint');

      let closeTimer: ReturnType<typeof setTimeout>;

      const openTimer = setTimeout(() => {
        setIsVisible(true);
        setShowHint(true);

        closeTimer = setTimeout(() => {
          setIsVisible(false);
          setShowHint(false);
        }, 1500);
      }, 800);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [location.pathname]);

  const shouldHide = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));
  if (shouldHide) return null;

  return (
    <>
      <Sidebar isVisible={isVisible} onVisibilityChange={setIsVisible} />
      {showHint && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          Все разделы здесь
        </div>
      )}
    </>
  );
}