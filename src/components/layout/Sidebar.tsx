import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import {
  registerNewBadge,
  applyTopLevelLimit,
  dismissNewBadge,
} from '@/lib/newBadge';
import {
  GROUPS,
  OWNER_ONLY_FINANCE_ITEMS,
  menuSections,
  type MenuItem,
  type MenuSection,
} from './sidebar.config';

interface SidebarProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export default function Sidebar({ isVisible, onVisibilityChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotificationCenter();
  const isOwner = useIsFamilyOwner();
  const [openSections, setOpenSections] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sidebarOpenSections');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpenSections', JSON.stringify(openSections));
    } catch (_e) {
      // ignore quota / private mode errors
    }
  }, [openSections]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // menuSections / GROUPS / OWNER_ONLY_FINANCE_ITEMS / типы — см. ./sidebar.config.ts.
  // Здесь они только используются: Sidebar отвечает за поведение, конфиг — за данные.

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    onVisibilityChange(false);
  };

  const isActive = (item: MenuItem) => {
    if (!item.path) return false;
    const currentFullPath = location.pathname + location.search;
    if (currentFullPath === item.path) return true;
    if (item.path.startsWith('/nutrition') && item.id === 'nutrition-hub' && location.pathname === '/nutrition') return true;
    return false;
  };

  const isSectionActive = (section: MenuSection) => {
    if (section.hubPath && location.pathname === section.hubPath) return true;
    return section.items.some(item => isActive(item));
  };

  // Авторазворот активной секции
  useEffect(() => {
    const active = menuSections.find(s => isSectionActive(s));
    if (active && !openSections.includes(active.id)) {
      setOpenSections(prev => [...prev, active.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Регистрируем «Новое»-бейджи при монтировании, считаем какие активны и помещаются в лимит
  const visibleNewBadgeIds = useMemo(() => {
    const candidates = menuSections.filter(s => s.topBadge).map(s => s.id);
    candidates.forEach(registerNewBadge);
    return applyTopLevelLimit(candidates);
     
  }, []);

  // Гасим бейдж при переходе на хаб
  useEffect(() => {
    const visited = menuSections.find(s => s.hubPath === location.pathname);
    if (visited && visited.topBadge) {
      dismissNewBadge(visited.id);
    }
     
  }, [location.pathname]);

  return (
    <>
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          style={{ top: '64px' }}
          onClick={() => onVisibilityChange(false)}
        />
      )}
      
      <div 
        className={`fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 overflow-y-auto w-[296px] max-w-[88vw] ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                navigate('/settings');
                onVisibilityChange(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 hover:from-blue-100 hover:to-purple-100 transition-colors flex-1"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Icon name="Settings" size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Настройки</span>
            </button>
            <button
              onClick={() => onVisibilityChange(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Icon name="X" size={18} className="text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => { navigate('/notifications'); onVisibilityChange(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 mt-2 rounded-xl transition-colors ${
              location.pathname === '/notifications'
                ? 'bg-orange-50 dark:bg-orange-950/40'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Icon name="Bell" size={15} className="text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Уведомления</span>
            {unreadCount > 0 && (
              <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold px-1.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { navigate('/blog'); onVisibilityChange(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 mt-2 rounded-xl transition-colors ${
              location.pathname.startsWith('/blog')
                ? 'bg-pink-50 dark:bg-pink-950/40'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <Icon name="BookOpen" size={15} className="text-pink-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Блог</span>
          </button>
        </div>

        <div className="p-3 space-y-4">
          {GROUPS.map((group) => {
            const sectionsInGroup = menuSections.filter(s => s.group === group.id);
            if (sectionsInGroup.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <div className="px-2 pb-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-normal break-words leading-tight">
                    {group.title}
                  </div>
                  {group.hint && (
                    <div className="text-[10px] text-gray-300 dark:text-gray-600 whitespace-normal break-words leading-tight mt-0.5">
                      {group.hint}
                    </div>
                  )}
                </div>

                {sectionsInGroup.map((section) => {
                  const isOpen = openSections.includes(section.id);
                  const active = isSectionActive(section);

                  return (
                    <Collapsible
                      key={section.id}
                      open={isOpen}
                      onOpenChange={() => toggleSection(section.id)}
                    >
                      <div className={`flex items-center rounded-xl transition-all relative ${
                        active
                          ? `${section.accentBg} ring-1 ring-inset ring-black/5 dark:ring-white/10`
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      }`}>
                        {active && (
                          <span className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${section.iconColor.replace('text-', 'bg-')}`} />
                        )}
                        {section.hubPath ? (
                          <button
                            className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-l-xl hover:bg-gray-100/60 dark:hover:bg-gray-700/30 transition-colors group min-w-0"
                            onClick={() => {
                              navigate(section.hubPath!);
                              onVisibilityChange(false);
                            }}
                            title={section.title}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/70 dark:bg-gray-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <Icon name={section.icon} size={15} className={section.iconColor} />
                            </div>
                            <span className={`flex-1 min-w-0 text-[13px] font-semibold leading-tight line-clamp-2 break-words text-left ${active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {section.title}
                            </span>
                            {section.topBadge && visibleNewBadgeIds.has(section.id) && (
                              <span className="ml-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                {section.topBadge}
                              </span>
                            )}
                            <Icon name="ArrowRight" size={12} className="text-gray-300 dark:text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        ) : (
                          <button
                            className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-l-xl transition-colors min-w-0"
                            onClick={() => toggleSection(section.id)}
                            title={section.title}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/70 dark:bg-gray-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <Icon name={section.icon} size={15} className={section.iconColor} />
                            </div>
                            <span className={`flex-1 min-w-0 text-[13px] font-semibold leading-tight line-clamp-2 break-words text-left ${active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {section.title}
                            </span>
                            {section.topBadge && visibleNewBadgeIds.has(section.id) && (
                              <span className="ml-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                {section.topBadge}
                              </span>
                            )}
                          </button>
                        )}
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                        <CollapsibleTrigger asChild>
                          <button className="px-3 py-2.5 rounded-r-xl hover:bg-gray-100/60 dark:hover:bg-gray-700/30 transition-colors" title="Разделы">
                            <Icon
                              name={isOpen ? 'ChevronDown' : 'ChevronRight'}
                              size={14}
                              className={`transition-colors ${isOpen ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}
                            />
                          </button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="mt-0.5 ml-5 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                        {section.items.filter(item => isOwner || !OWNER_ONLY_FINANCE_ITEMS.includes(item.id)).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            disabled={item.inDev}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                              isActive(item)
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : item.inDev
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <Icon name={item.icon} size={15} className={`flex-shrink-0 ${isActive(item) ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="flex-1 min-w-0 text-[13px] leading-tight line-clamp-2 break-words text-left" title={item.label}>{item.label}</span>
                            {item.badge && !item.inDev && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-full ml-auto">
                                {item.badge}
                              </span>
                            )}
                            {item.inDev && (
                              <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full ml-auto">
                                DEV
                              </span>
                            )}
                          </button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="p-4 mt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-400 text-center">
            Наша Семья · v1.0
          </p>
        </div>
      </div>

      <button
        onClick={() => onVisibilityChange(!isVisible)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-r-lg py-4 px-2 transition-all duration-300 ${
          isVisible ? 'translate-x-[296px]' : 'translate-x-0'
        }`}
      >
        <Icon 
          name={isVisible ? 'ChevronLeft' : 'ChevronRight'} 
          size={20} 
          className="text-gray-600 dark:text-gray-400" 
        />
      </button>
    </>
  );
}
