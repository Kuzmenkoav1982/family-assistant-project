import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', icon: 'Home', label: 'Домой' },
  { path: '/development', icon: 'Brain', label: 'Развитие' },
  { path: '/nutrition', icon: 'Apple', label: 'Питание' },
  { path: '/shopping', icon: 'ShoppingCart', label: 'Покупки' },
  { path: '/leisure-hub', icon: 'Plane', label: 'Путешествия' },
  { path: '/calendar', icon: 'Calendar', label: 'Календарь' },
  { path: '/children', icon: 'Baby', label: 'Дети' },
  { path: '/planning-hub', icon: 'Target', label: 'Планирование' },
];

const HIDDEN_ROUTES = [
  '/welcome', '/login', '/register', '/reset-password', '/presentation',
  '/onboarding', '/demo-mode', '/admin-login', '/investor-deck',
];

export default function GlobalBottomBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('globalBottomBarVisible');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('globalBottomBarVisible', String(isVisible));
  }, [isVisible]);

  const shouldHide = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));
  if (shouldHide) return null;

  const currentPath = location.pathname;

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 z-40 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-full py-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-max mx-auto px-2 gap-0.5 sm:gap-1 sm:justify-center sm:min-w-0">
            {NAV_ITEMS.map(item => {
              const isActive = currentPath === item.path || 
                (item.path !== '/' && currentPath.startsWith(item.path));

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  className={`flex flex-col items-center justify-center gap-0.5 w-10 h-12 rounded-lg flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Icon name={item.icon} size={22} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-t-lg px-4 py-1.5 transition-all duration-300 ${
          isVisible ? 'bottom-[56px]' : 'bottom-0'
        }`}
      >
        <Icon
          name={isVisible ? 'ChevronDown' : 'ChevronUp'}
          size={20}
          className="text-gray-600"
        />
      </button>
    </>
  );
}