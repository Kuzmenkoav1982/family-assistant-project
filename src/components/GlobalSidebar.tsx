import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

const HIDDEN_ROUTES = [
  '/welcome', '/login', '/register', '/reset-password', '/presentation',
  '/onboarding', '/demo-mode', '/admin-login', '/investor-deck',
];

export default function GlobalSidebar() {
  const location = useLocation();

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

  const shouldHide = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));
  if (shouldHide) return null;

  return (
    <Sidebar isVisible={isVisible} onVisibilityChange={setIsVisible} />
  );
}
