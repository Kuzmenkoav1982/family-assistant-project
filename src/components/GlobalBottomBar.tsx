import { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type NavItem = { id: string; path?: string; icon: string; label: string; type?: 'nav' | 'domovoy' };

const ALL_ITEMS: NavItem[] = [
  { id: 'home', path: '/', icon: 'Home', label: 'Домой' },
  { id: 'development', path: '/development', icon: 'Brain', label: 'Развитие' },
  { id: 'nutrition', path: '/nutrition', icon: 'Apple', label: 'Питание' },
  { id: 'shopping', path: '/shopping', icon: 'ShoppingCart', label: 'Покупки' },
  { id: 'leisure', path: '/leisure-hub', icon: 'Plane', label: 'Путешествия' },
  { id: 'calendar', path: '/calendar', icon: 'Calendar', label: 'Календарь' },
  { id: 'children', path: '/children', icon: 'Baby', label: 'Дети' },
  { id: 'planning', path: '/planning-hub', icon: 'Target', label: 'Планирование' },
  { id: 'chat', path: '/chat', icon: 'MessageCircle', label: 'Чат семьи' },
  { id: 'tasks', path: '/tasks', icon: 'CheckSquare', label: 'Задачи' },
  { id: 'finance', path: '/finance', icon: 'Wallet', label: 'Финансы' },
  { id: 'health', path: '/health', icon: 'Heart', label: 'Здоровье' },
  { id: 'photos', path: '/photos', icon: 'Image', label: 'Фото' },
  { id: 'goals', path: '/goals', icon: 'Flag', label: 'Цели' },
];

const DEFAULT_IDS = ['home', 'development', 'nutrition', 'shopping', 'leisure', 'calendar', 'children', 'planning'];
const STORAGE_KEY = 'bottomBarItems';
const MAX_MIDDLE = 8;

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

  const [domovoyHidden, setDomovoyHidden] = useState(() => localStorage.getItem('domovoyHidden') === 'true');

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_IDS;
  });

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('globalBottomBarVisible', String(isVisible));
  }, [isVisible]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    const handleStorage = () => {
      setDomovoyHidden(localStorage.getItem('domovoyHidden') === 'true');
    };
    const handleToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.hidden === 'boolean') setDomovoyHidden(detail.hidden);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('domovoy:toggle', handleToggle);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('domovoy:toggle', handleToggle);
    };
  }, []);

  const toggleDomovoy = () => {
    const next = !domovoyHidden;
    setDomovoyHidden(next);
    localStorage.setItem('domovoyHidden', String(next));
    window.dispatchEvent(new CustomEvent('domovoy:toggle', { detail: { hidden: next } }));
  };

  const toggleItem = (id: string) => {
    if (id === 'home') return;
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= MAX_MIDDLE) return prev;
      return [...prev, id];
    });
  };

  const resetToDefault = () => setSelectedIds(DEFAULT_IDS);

  const middleItems = useMemo(
    () => selectedIds.map(id => ALL_ITEMS.find(i => i.id === id)).filter(Boolean) as NavItem[],
    [selectedIds]
  );

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
            {middleItems.map(item => {
              const isActive = item.path && (currentPath === item.path ||
                (item.path !== '/' && currentPath.startsWith(item.path)));

              return (
                <button
                  key={item.id}
                  onClick={() => item.path && navigate(item.path)}
                  onContextMenu={(e) => { e.preventDefault(); setSettingsOpen(true); }}
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

            <button
              onClick={() => setSettingsOpen(true)}
              title="Настроить кнопки"
              className="flex flex-col items-center justify-center gap-0.5 w-10 h-12 rounded-lg flex-shrink-0 text-white/60 hover:text-white hover:bg-white/15 transition-colors"
            >
              <Icon name="Settings2" size={20} />
            </button>

            <button
              onClick={toggleDomovoy}
              title={domovoyHidden ? 'Показать Домового' : 'Скрыть Домового'}
              className={`flex flex-col items-center justify-center gap-0.5 w-10 h-12 rounded-lg flex-shrink-0 transition-colors ${
                domovoyHidden
                  ? 'text-white/60 hover:text-white hover:bg-white/15'
                  : 'bg-white/25 text-white'
              }`}
            >
              <div className="relative">
                <Icon name="Sparkles" size={22} />
                {domovoyHidden && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400" />
                )}
              </div>
            </button>
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

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Настройка нижней панели</DialogTitle>
            <DialogDescription>
              Выберите до {MAX_MIDDLE} кнопок. «Домой» и «Домовой» закреплены.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto">
            {ALL_ITEMS.map(item => {
              const checked = selectedIds.includes(item.id);
              const isHome = item.id === 'home';
              const disabled = !checked && selectedIds.length >= MAX_MIDDLE;
              return (
                <button
                  key={item.id}
                  onClick={() => !isHome && !disabled && toggleItem(item.id)}
                  disabled={isHome || disabled}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    checked
                      ? 'border-blue-500 bg-blue-50'
                      : disabled
                        ? 'border-gray-100 bg-gray-50 opacity-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isHome ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    checked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon name={item.icon} size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate">{item.label}</span>
                  {isHome && <span className="ml-auto text-[10px] text-gray-400">закр.</span>}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={resetToDefault} className="flex-1">
              По умолчанию
            </Button>
            <Button onClick={() => setSettingsOpen(false)} className="flex-1">
              Готово
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
