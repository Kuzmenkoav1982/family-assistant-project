import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import { isShellHiddenRoute } from '@/lib/shellRoutes';

export default function GlobalSidebar() {
  const location = useLocation();

  // SSR-safe lazy init.
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    try {
      const saved = localStorage.getItem('globalSidebarVisible');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('globalSidebarVisible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    const handler = () => setIsVisible(prev => !prev);
    window.addEventListener('toggleGlobalSidebar', handler);
    return () => window.removeEventListener('toggleGlobalSidebar', handler);
  }, []);

  if (isShellHiddenRoute(location.pathname)) return null;

  return (
    <Sidebar isVisible={isVisible} onVisibilityChange={setIsVisible} />
  );
}