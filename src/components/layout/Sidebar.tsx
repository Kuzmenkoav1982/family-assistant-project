import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  items: MenuItem[];
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

  
  const [openSections, setOpenSections] = useState<string[]>([
    'family', 
    'values', 
    'planning', 
    'household',
    'in-dev'
  ]);

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
      title: '🏠 СЕМЬЯ И ЛЮДИ',
      icon: 'Users',
      items: [
        { id: 'profiles', label: 'Профили семьи', icon: 'Users', path: '/?section=family' },
        { id: 'children', label: 'Дети', icon: 'Baby', path: '/children' }
      ]
    },
    {
      id: 'values',
      title: '💖 ЦЕННОСТИ И КУЛЬТУРА',
      icon: 'Heart',
      items: [
        { id: 'values', label: 'Ценности', icon: 'Heart', path: '/?section=values' },
        { id: 'traditions', label: 'Традиции', icon: 'Sparkles', path: '/?section=traditions' },
        { id: 'family-code', label: 'Кодекс семьи', icon: 'ScrollText', path: '/rules' },
        { id: 'house-rules', label: 'Правила дома', icon: 'FileText', path: '/rules' }
      ]
    },
    {
      id: 'planning',
      title: '🎯 ПЛАНИРОВАНИЕ',
      icon: 'Target',
      items: [
        { id: 'goals', label: 'Цели', icon: 'Target', path: '/?section=goals' },
        { id: 'tasks', label: 'Задачи', icon: 'CheckSquare', path: '/?section=tasks' },
        { id: 'calendar', label: 'Календарь', icon: 'Calendar', path: '/calendar' },
        { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', path: '/analytics' }
      ]
    },
    {
      id: 'household',
      title: '🏠 БЫТ И ХОЗЯЙСТВО',
      icon: 'Home',
      items: [
        { id: 'shopping', label: 'Покупки', icon: 'ShoppingCart', path: '/shopping' },
        { id: 'recipes', label: 'Рецепты', icon: 'ChefHat', path: '/recipes' },
        { id: 'meals', label: 'Меню на неделю', icon: 'UtensilsCrossed', path: '/meals' },
        { id: 'nutrition', label: 'Питание', icon: 'Apple', path: '/nutrition' },
        { id: 'voting', label: 'Голосования', icon: 'ThumbsUp', path: '/voting' }
      ]
    },
    {
      id: 'leisure',
      title: '🌍 ПУТЕШЕСТВИЯ И ДОСУГ',
      icon: 'Plane',
      items: [
        { id: 'trips', label: 'Путешествия', icon: 'Plane', path: '/trips' }
      ]
    },
    {
      id: 'development',
      title: '💬 РАЗВИТИЕ',
      icon: 'Brain',
      items: [
        { id: 'development', label: 'Развитие', icon: 'Brain', path: '/development' }
      ]
    },
    {
      id: 'in-dev',
      title: '🔧 В РАЗРАБОТКЕ',
      icon: 'Wrench',
      items: [
        { id: 'in-development-list', label: 'В разработке', icon: 'Construction', path: '/in-development' },
        { id: 'life-road', label: 'Дорога жизни', icon: 'Route', path: '/life-road', inDev: true }
      ]
    }
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (item: MenuItem) => {
    if (!item.path) return false;
    // Compare full path including query params
    const currentFullPath = location.pathname + location.search;
    return currentFullPath === item.path;
  };



  return (
    <>
      <div 
        className={`fixed left-0 top-16 bottom-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-transform duration-300 overflow-y-auto ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Icon name="Menu" size={16} />
            Разделы
          </h3>
          <div className="flex items-center gap-1">

            <Button
              onClick={() => onVisibilityChange(false)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {menuSections.map((section) => (
            <Collapsible
              key={section.id}
              open={openSections.includes(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    {section.title}
                  </span>
                  <Icon 
                    name={openSections.includes(section.id) ? "ChevronDown" : "ChevronRight"} 
                    size={14} 
                    className="text-gray-500"
                  />
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 mt-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={item.inDev}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                      isActive(item)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : item.inDev
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon name={item.icon as any} size={16} />
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                    {item.id === 'in-development-list' && (
                      <Badge variant="secondary" className="text-xs">9</Badge>
                    )}
                    {item.inDev && (
                      <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        DEV
                      </span>
                    )}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
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