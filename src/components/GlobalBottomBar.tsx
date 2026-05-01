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

const HOME_ITEM: NavItem = { id: 'home', path: '/', icon: 'Home', label: 'Главная' };
const DOMOVOY_IMG = 'https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png';

const HUB_ITEMS: NavItem[] = [
  { id: 'dashboard', path: '/dashboard', icon: 'LayoutDashboard', label: 'Дашборд' },
  { id: 'family', path: '/family-hub', icon: 'Users', label: 'Семья' },
  { id: 'health', path: '/health-hub', icon: 'HeartPulse', label: 'Здоровье' },
  { id: 'nutrition', path: '/nutrition', icon: 'Apple', label: 'Питание' },
  { id: 'values', path: '/values-hub', icon: 'Heart', label: 'Ценности' },
  { id: 'planning', path: '/planning-hub', icon: 'Target', label: 'Планирование' },
  { id: 'finance', path: '/finance', icon: 'Wallet', label: 'Финансы' },
  { id: 'household', path: '/household-hub', icon: 'Home', label: 'Быт' },
  { id: 'leisure', path: '/leisure-hub', icon: 'Plane', label: 'Путешествия' },
  { id: 'development', path: '/development-hub', icon: 'Brain', label: 'Развитие' },
  { id: 'family-matrix', path: '/family-matrix', icon: 'Sparkles', label: 'Семейный код' },
  { id: 'pets', path: '/pets', icon: 'PawPrint', label: 'Питомцы' },
];

const ALL_ITEMS: NavItem[] = [HOME_ITEM, ...HUB_ITEMS];

const DEFAULT_IDS = ['home', 'dashboard', 'family', 'health', 'nutrition', 'planning', 'finance', 'development'];
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
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  const moveItem = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    if (fromId === 'home' || toId === 'home') return;
    setSelectedIds(prev => {
      const from = prev.indexOf(fromId);
      const to = prev.indexOf(toId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  };

  const shiftItem = (id: string, dir: -1 | 1) => {
    if (id === 'home') return;
    setSelectedIds(prev => {
      const idx = prev.indexOf(id);
      const target = idx + dir;
      if (idx === -1 || target < 1 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

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
                  ? 'hover:bg-white/15'
                  : 'bg-white/25'
              }`}
            >
              <div className="relative">
                <div
                  role="img"
                  aria-label="Домовой"
                  style={{
                    backgroundImage: `url(${DOMOVOY_IMG})`,
                    backgroundSize: '130%',
                    backgroundPosition: '50% 18%',
                    backgroundRepeat: 'no-repeat',
                  }}
                  className={`w-7 h-7 rounded-full bg-white/90 ring-2 transition-all ${
                    domovoyHidden
                      ? 'ring-white/30 opacity-60 grayscale'
                      : 'ring-white'
                  }`}
                />
                {domovoyHidden && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 ring-1 ring-white" />
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
              Выберите до {MAX_MIDDLE - 1} хабов. «Главная» и «Домовой» закреплены.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Порядок на панели
              </span>
              <span className="text-[10px] text-gray-400">перетащи или ↑↓</span>
            </div>
            <div className="flex flex-col gap-1.5 bg-gray-50 rounded-xl p-2 max-h-[28vh] overflow-y-auto">
              {middleItems.map((item, idx) => {
                const isHome = item.id === 'home';
                const isDragging = dragId === item.id;
                const isOver = dragOverId === item.id && !isHome;
                return (
                  <div
                    key={item.id}
                    draggable={!isHome}
                    onDragStart={(e) => {
                      if (isHome) { e.preventDefault(); return; }
                      setDragId(item.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      if (isHome || !dragId) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverId !== item.id) setDragOverId(item.id);
                    }}
                    onDragLeave={() => {
                      if (dragOverId === item.id) setDragOverId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragId && !isHome) moveItem(dragId, item.id);
                      setDragId(null);
                      setDragOverId(null);
                    }}
                    onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                    className={`flex items-center gap-2 p-2 rounded-lg border bg-white transition-all ${
                      isDragging ? 'opacity-40' : ''
                    } ${isOver ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} ${
                      isHome ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <Icon
                      name="GripVertical"
                      size={16}
                      className={isHome ? 'text-gray-200' : 'text-gray-400'}
                    />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isHome ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white'
                    }`}>
                      <Icon name={item.icon} size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate flex-1">
                      {item.label}
                    </span>
                    {isHome ? (
                      <span className="text-[10px] text-gray-400 px-1">закр.</span>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => shiftItem(item.id, -1)}
                          disabled={idx <= 1}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Icon name="ChevronUp" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => shiftItem(item.id, 1)}
                          disabled={idx >= middleItems.length - 1}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Icon name="ChevronDown" size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          title="Убрать"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white cursor-not-allowed">
                <Icon name="GripVertical" size={16} className="text-gray-200" />
                <div
                  role="img"
                  aria-label="Домовой"
                  style={{
                    backgroundImage: `url(${DOMOVOY_IMG})`,
                    backgroundSize: '130%',
                    backgroundPosition: '50% 18%',
                    backgroundRepeat: 'no-repeat',
                  }}
                  className={`w-8 h-8 rounded-lg flex-shrink-0 bg-gray-100 ring-1 ring-gray-200 ${
                    domovoyHidden ? 'grayscale opacity-60' : ''
                  }`}
                />
                <span className="text-sm font-medium text-gray-800 truncate flex-1">
                  Домовой
                </span>
                <button
                  type="button"
                  onClick={toggleDomovoy}
                  className={`text-[11px] px-2 py-1 rounded-md font-medium transition-colors ${
                    domovoyHidden
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {domovoyHidden ? 'Скрыт' : 'Показан'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide pt-1">
            Все хабы
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto">
            {HUB_ITEMS.map(item => {
              const checked = selectedIds.includes(item.id);
              const disabled = !checked && selectedIds.length >= MAX_MIDDLE;
              return (
                <button
                  key={item.id}
                  onClick={() => !disabled && toggleItem(item.id)}
                  disabled={disabled}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    checked
                      ? 'border-blue-500 bg-blue-50'
                      : disabled
                        ? 'border-gray-100 bg-gray-50 opacity-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    checked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon name={item.icon} size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate">{item.label}</span>
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