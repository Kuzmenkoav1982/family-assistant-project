import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface MenuSection {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  accentBg: string;
  items: MenuItem[];
  hubPath?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  action?: () => void;
  inDev?: boolean;
}

interface SidebarProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export default function Sidebar({ isVisible, onVisibilityChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const menuSections: MenuSection[] = [
    {
      id: 'family',
      title: 'Семья',
      icon: 'Users',
      iconColor: 'text-blue-600',
      accentBg: 'bg-blue-50 dark:bg-blue-950/40',
      hubPath: '/family-hub',
      items: [
        { id: 'profiles', label: 'Профили семьи', icon: 'Users', path: '/?section=family' },
        { id: 'children', label: 'Дети', icon: 'Baby', path: '/children' },
        { id: 'family-tracker', label: 'Семейный маячок', icon: 'MapPin', path: '/family-tracker' }
      ]
    },
    {
      id: 'health',
      title: 'Здоровье',
      icon: 'HeartPulse',
      iconColor: 'text-rose-600',
      accentBg: 'bg-rose-50 dark:bg-rose-950/40',
      hubPath: '/health-hub',
      items: [
        { id: 'health', label: 'Здоровье семьи', icon: 'HeartPulse', path: '/health' }
      ]
    },
    {
      id: 'values',
      title: 'Ценности и культура',
      icon: 'Heart',
      iconColor: 'text-pink-600',
      accentBg: 'bg-pink-50 dark:bg-pink-950/40',
      hubPath: '/values-hub',
      items: [
        { id: 'values', label: 'Ценности', icon: 'Heart', path: '/values' },
        { id: 'traditions', label: 'Традиции', icon: 'Sparkles', path: '/culture' },
        { id: 'house-rules', label: 'Правила дома', icon: 'FileText', path: '/rules' }
      ]
    },
    {
      id: 'planning',
      title: 'Планирование',
      icon: 'Target',
      iconColor: 'text-indigo-600',
      accentBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      hubPath: '/planning-hub',
      items: [
        { id: 'goals', label: 'Цели', icon: 'Target', path: '/?section=goals' },
        { id: 'tasks', label: 'Задачи', icon: 'CheckSquare', path: '/tasks' },
        { id: 'calendar', label: 'Календарь', icon: 'Calendar', path: '/calendar' },
        { id: 'purchases', label: 'План покупок', icon: 'ShoppingBag', path: '/purchases' },
        { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', path: '/analytics' }
      ]
    },
    {
      id: 'nutrition',
      title: 'Питание',
      icon: 'Apple',
      iconColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      hubPath: '/nutrition',
      items: [
        { id: 'nutrition-hub', label: 'Питание', icon: 'Apple', path: '/nutrition' },
        { id: 'diet-ai', label: 'ИИ-Диета', icon: 'Brain', path: '/nutrition/diet' },
        { id: 'diet-preset', label: 'Готовые режимы', icon: 'ListChecks', path: '/nutrition/programs' },
        { id: 'recipe-products', label: 'Рецепт из продуктов', icon: 'ChefHat', path: '/nutrition/recipe-from-products' },
        { id: 'nutrition-tracker', label: 'Счётчик БЖУ', icon: 'Calculator', path: '/nutrition/tracker' },
        { id: 'meals', label: 'Меню на неделю', icon: 'UtensilsCrossed', path: '/meals' },
        { id: 'recipes', label: 'Рецепты', icon: 'BookOpen', path: '/recipes' }
      ]
    },
    {
      id: 'household',
      title: 'Быт и хозяйство',
      icon: 'Home',
      iconColor: 'text-amber-600',
      accentBg: 'bg-amber-50 dark:bg-amber-950/40',
      hubPath: '/household-hub',
      items: [
        { id: 'shopping', label: 'Покупки', icon: 'ShoppingCart', path: '/shopping' },
        { id: 'voting', label: 'Голосования', icon: 'ThumbsUp', path: '/voting' }
      ]
    },
    {
      id: 'leisure',
      title: 'Путешествия и досуг',
      icon: 'Plane',
      iconColor: 'text-sky-600',
      accentBg: 'bg-sky-50 dark:bg-sky-950/40',
      hubPath: '/leisure-hub',
      items: [
        { id: 'trips', label: 'Путешествия', icon: 'Plane', path: '/trips' },
        { id: 'leisure', label: 'Досуг', icon: 'MapPin', path: '/leisure' },
        { id: 'events', label: 'Праздники', icon: 'PartyPopper', path: '/events' }
      ]
    },
    {
      id: 'development',
      title: 'Развитие',
      icon: 'Brain',
      iconColor: 'text-violet-600',
      accentBg: 'bg-violet-50 dark:bg-violet-950/40',
      hubPath: '/development-hub',
      items: [
        { id: 'development', label: 'Развитие', icon: 'Brain', path: '/development' }
      ]
    },
    {
      id: 'family-state',
      title: 'Семья и государство',
      icon: 'Landmark',
      iconColor: 'text-slate-600',
      accentBg: 'bg-slate-50 dark:bg-slate-800/40',
      hubPath: '/state-hub',
      items: [
        { id: 'what-is-family', label: 'Что такое семья', icon: 'Users', path: '/what-is-family' },
        { id: 'family-code', label: 'Семейный кодекс РФ', icon: 'Scale', path: '/family-code' },
        { id: 'state-support', label: 'Господдержка семей', icon: 'HandHeart', path: '/state-support' },
        { id: 'family-policy', label: 'Семейная политика', icon: 'Flag', path: '/family-policy' },
        { id: 'family-news', label: 'Новости и инициативы', icon: 'Newspaper', path: '/family-news' }
      ]
    },
    {
      id: 'in-dev',
      title: 'В разработке',
      icon: 'Wrench',
      iconColor: 'text-gray-500',
      accentBg: 'bg-gray-50 dark:bg-gray-800/40',
      items: [
        { id: 'in-development-list', label: 'В разработке', icon: 'Construction', path: '/in-development' }
      ]
    }
  ];

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
        className={`fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 overflow-y-auto ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
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
        </div>

        <div className="p-3 space-y-1">
          {menuSections.map((section) => {
            const isOpen = openSections.includes(section.id);
            const active = isSectionActive(section);

            return (
              <Collapsible
                key={section.id}
                open={isOpen}
                onOpenChange={() => toggleSection(section.id)}
              >
                <div className={`flex items-center rounded-xl transition-colors ${active ? section.accentBg : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                  {section.hubPath ? (
                    <button
                      className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-l-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/40 transition-colors group"
                      onClick={() => {
                        navigate(section.hubPath!);
                        onVisibilityChange(false);
                      }}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? section.accentBg : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Icon name={section.icon} size={15} className={section.iconColor} />
                      </div>
                      <span className={`text-[13px] font-semibold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {section.title}
                      </span>
                      <Icon name="ArrowRight" size={12} className="text-gray-300 dark:text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : (
                    <button
                      className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-l-xl transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? section.accentBg : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Icon name={section.icon} size={15} className={section.iconColor} />
                      </div>
                      <span className={`text-[13px] font-semibold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {section.title}
                      </span>
                    </button>
                  )}
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <CollapsibleTrigger asChild>
                    <button className="px-3 py-2.5 rounded-r-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/40 transition-colors" title="Разделы">
                      <Icon 
                        name={isOpen ? "ChevronDown" : "ChevronRight"} 
                        size={14} 
                        className={`transition-colors ${isOpen ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="mt-0.5 ml-5 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                  {section.items.map((item) => (
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
                      <Icon name={item.icon} size={15} className={isActive(item) ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'} />
                      <span className="text-[13px]">{item.label}</span>
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

        <div className="p-4 mt-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-400 text-center">
            Наша Семья · v1.0
          </p>
        </div>
      </div>

      <button
        onClick={() => onVisibilityChange(!isVisible)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-r-lg py-4 px-2 transition-all duration-300 ${
          isVisible ? 'translate-x-[280px]' : 'translate-x-0'
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