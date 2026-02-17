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
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map(item => {
              const isActive = currentPath === item.path || 
                (item.path !== '/' && currentPath.startsWith(item.path));

              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`whitespace-nowrap ${isActive ? '' : 'text-white hover:bg-white/20'}`}
                  title={item.label}
                >
                  <Icon name={item.icon} size={18} />
                  <span className="ml-1 text-xs hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-t-lg px-4 py-1.5 transition-all duration-300 ${
          isVisible ? 'bottom-[48px]' : 'bottom-0'
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
