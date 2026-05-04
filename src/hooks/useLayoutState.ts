import { useState } from 'react';

const availableSections = [
  { id: 'family', icon: 'Users', label: 'Профили семьи' },
  { id: 'tasks', icon: 'CheckSquare', label: 'Задачи' },
  { id: 'recipes', icon: 'ChefHat', label: 'Рецепты' },
  { id: 'trips', icon: 'Plane', label: 'Путешествия' },
  { id: 'health', icon: 'Heart', label: 'Здоровье' },
  { id: 'analytics', icon: 'BarChart3', label: 'Аналитика' },
  { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
  { id: 'goals', icon: 'Target', label: 'Цели' },
  { id: 'values', icon: 'HeartHandshake', label: 'Ценности' },
  { id: 'traditions', icon: 'Sparkles', label: 'Традиции' },
  { id: 'shopping', icon: 'ShoppingCart', label: 'Покупки' },
  { id: 'meals', icon: 'UtensilsCrossed', label: 'Меню' },
];

export default function useLayoutState() {
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [autoHideTopBar, setAutoHideTopBar] = useState(false);
  const [isLeftMenuVisible, setIsLeftMenuVisible] = useState(false);
  const [showSidebarHint, setShowSidebarHint] = useState(false);
  const [autoHideLeftMenu, setAutoHideLeftMenu] = useState(() => localStorage.getItem('autoHideLeftMenu') === 'true');
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [autoHideBottomBar, setAutoHideBottomBar] = useState(() => localStorage.getItem('autoHideBottomBar') === 'true');
  const [showTopPanelSettings, setShowTopPanelSettings] = useState(false);
  const [showLeftPanelSettings, setShowLeftPanelSettings] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);

  const [bottomBarSections, setBottomBarSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('bottomBarSections');
    return saved ? JSON.parse(saved) : ['analytics', 'children', 'calendar', 'shopping'];
  });

  const [leftPanelSections, setLeftPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('leftPanelSections');
    const availableSectionIds = ['today', 'family', 'tasks', 'recipes', 'trips', 'health', 'analytics', 'calendar', 'goals', 'values', 'traditions', 'shopping', 'meals'];
    return saved ? JSON.parse(saved) : availableSectionIds;
  });

  const [topPanelSections, setTopPanelSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('topPanelSections');
    let sections = saved ? JSON.parse(saved) : ['stats', 'auth', 'settings', 'familySwitcher'];
    sections = sections.filter((s: string) => !['style', 'voting', 'presentation', 'reset', 'language', 'profile', 'instructions', 'appearance'].includes(s));
    if (!sections.includes('settings')) {
      sections.push('settings');
    }
    localStorage.setItem('topPanelSections', JSON.stringify(sections));
    return sections;
  });

  return {
    isTopBarVisible, setIsTopBarVisible,
    autoHideTopBar, setAutoHideTopBar,
    isLeftMenuVisible, setIsLeftMenuVisible,
    showSidebarHint, setShowSidebarHint,
    autoHideLeftMenu, setAutoHideLeftMenu,
    isBottomBarVisible, setIsBottomBarVisible,
    autoHideBottomBar, setAutoHideBottomBar,
    showTopPanelSettings, setShowTopPanelSettings,
    showLeftPanelSettings, setShowLeftPanelSettings,
    showWidgetSettings, setShowWidgetSettings,
    bottomBarSections, setBottomBarSections,
    leftPanelSections, setLeftPanelSections,
    topPanelSections, setTopPanelSections,
    availableSections,
  };
}