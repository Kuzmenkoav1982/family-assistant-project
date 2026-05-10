import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  registerNewBadge,
  applyTopLevelLimit,
  dismissNewBadge,
} from '@/lib/newBadge';

const OWNER_ONLY_FINANCE_ITEMS = ['finance-analytics', 'finance-strategy', 'finance-cashflow', 'finance-budget', 'finance-accounts', 'finance-debts', 'finance-recurring', 'finance-assets'];

type GroupId = 'life' | 'care' | 'meaning' | 'world' | 'system';

const GROUPS: { id: GroupId; title: string; hint: string }[] = [
  { id: 'life',    title: 'Жизнь семьи',       hint: 'Операционный контур' },
  { id: 'care',    title: 'Забота',            hint: 'Состояние и здоровье' },
  { id: 'meaning', title: 'Смысл и отношения', hint: 'Развитие и ценности' },
  { id: 'world',   title: 'Внешний мир',       hint: 'Государство и знание' },
  { id: 'system',  title: 'Система',           hint: 'Сервис и настройки' },
];

interface MenuSection {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  accentBg: string;
  items: MenuItem[];
  hubPath?: string;
  group: GroupId;
  topBadge?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  action?: () => void;
  inDev?: boolean;
  badge?: string;
}

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

  const menuSections: MenuSection[] = [
    {
      id: 'family',
      title: 'Семья',
      icon: 'Users',
      iconColor: 'text-blue-600',
      accentBg: 'bg-blue-50 dark:bg-blue-950/40',
      hubPath: '/family-hub',
      group: 'life',
      topBadge: 'Новое',
      items: [
        { id: 'profiles', label: 'Профили семьи', icon: 'Users', path: '/?section=family' },
        { id: 'tree', label: 'Семейное древо', icon: 'GitBranch', path: '/tree' },
        { id: 'children', label: 'Дети', icon: 'Baby', path: '/children' },
        { id: 'family-tracker', label: 'Семейный маячок', icon: 'MapPin', path: '/family-tracker' },
        { id: 'family-chat', label: 'Чат семьи', icon: 'MessagesSquare', path: '/family-chat', badge: 'Новое' }
      ]
    },
    {
      id: 'health',
      title: 'Здоровье',
      icon: 'HeartPulse',
      iconColor: 'text-rose-600',
      accentBg: 'bg-rose-50 dark:bg-rose-950/40',
      hubPath: '/health-hub',
      group: 'care',
      items: [
        { id: 'health', label: 'Здоровье семьи', icon: 'HeartPulse', path: '/health' }
      ]
    },
    {
      id: 'nutrition',
      title: 'Питание',
      icon: 'Apple',
      iconColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      hubPath: '/nutrition',
      group: 'care',
      items: [
        { id: 'diet-ai', label: 'ИИ-Диета по данным', icon: 'Brain', path: '/nutrition/diet' },
        { id: 'diet-preset', label: 'Готовые режимы питания', icon: 'ListChecks', path: '/nutrition/programs' },
        { id: 'recipe-products', label: 'Рецепт из продуктов', icon: 'ChefHat', path: '/nutrition/recipe-from-products' },
        { id: 'diet-progress', label: 'Прогресс диеты', icon: 'TrendingUp', path: '/nutrition/progress', badge: 'Новое' },
        { id: 'nutrition-tracker', label: 'Счётчик БЖУ', icon: 'Calculator', path: '/nutrition/tracker' },
        { id: 'meals', label: 'Меню на неделю', icon: 'UtensilsCrossed', path: '/meals' },
        { id: 'recipes', label: 'Рецепты', icon: 'BookOpen', path: '/recipes' }
      ]
    },
    {
      id: 'values',
      title: 'Ценности и культура',
      icon: 'Heart',
      iconColor: 'text-pink-600',
      accentBg: 'bg-pink-50 dark:bg-pink-950/40',
      hubPath: '/values-hub',
      group: 'meaning',
      items: [
        { id: 'values', label: 'Ценности семьи', icon: 'Heart', path: '/values' },
        { id: 'faith', label: 'Вера', icon: 'Church', path: '/faith' },
        { id: 'traditions', label: 'Традиции и культура', icon: 'Sparkles', path: '/culture' },
        { id: 'wisdom', label: 'Мудрость народа', icon: 'BookOpen', path: '/wisdom' },
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
      group: 'life',
      items: [
        { id: 'goals', label: 'Цели семьи', icon: 'Target', path: '/?section=goals' },
        { id: 'tasks', label: 'Задачи', icon: 'CheckSquare', path: '/tasks' },
        { id: 'calendar', label: 'Календарь', icon: 'Calendar', path: '/calendar' },
        { id: 'purchases', label: 'План покупок', icon: 'ShoppingBag', path: '/purchases' },
        { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', path: '/analytics' }
      ]
    },
    {
      id: 'finance',
      title: 'Финансы',
      icon: 'Wallet',
      iconColor: 'text-emerald-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      hubPath: '/finance',
      group: 'life',
      items: [
        { id: 'finance-analytics', label: 'Финансовый пульс', icon: 'Activity', path: '/finance/analytics' },
        { id: 'finance-strategy', label: 'Стратегия погашения', icon: 'Swords', path: '/finance/strategy' },
        { id: 'finance-cashflow', label: 'Кэш-флоу прогноз', icon: 'TrendingUp', path: '/finance/cashflow' },
        { id: 'finance-budget', label: 'Бюджет', icon: 'PieChart', path: '/finance/budget' },
        { id: 'finance-accounts', label: 'Счета и карты', icon: 'CreditCard', path: '/finance/accounts' },
        { id: 'finance-debts', label: 'Кредиты и долги', icon: 'Receipt', path: '/finance/debts' },
        { id: 'finance-goals', label: 'Финансовые цели', icon: 'Target', path: '/finance/goals' },
        { id: 'finance-literacy', label: 'Финансовая грамотность', icon: 'GraduationCap', path: '/finance/literacy' },
        { id: 'finance-assets', label: 'Имущество', icon: 'Home', path: '/finance/assets' },
        { id: 'finance-loyalty', label: 'Скидочные карты', icon: 'Ticket', path: '/finance/loyalty' },
        { id: 'finance-antiscam', label: 'Антимошенник', icon: 'ShieldAlert', path: '/finance/antiscam' },
        { id: 'wallet', label: 'Кошелёк сервиса', icon: 'Wallet', path: '/wallet' }
      ]
    },
    {
      id: 'household',
      title: 'Дом и быт',
      icon: 'Home',
      iconColor: 'text-amber-600',
      accentBg: 'bg-amber-50 dark:bg-amber-950/40',
      hubPath: '/household-hub',
      group: 'life',
      topBadge: 'Новое',
      items: [
        { id: 'shopping', label: 'Список покупок', icon: 'ShoppingCart', path: '/shopping' },
        { id: 'voting', label: 'Голосования', icon: 'ThumbsUp', path: '/voting' },
        { id: 'home', label: 'Дом', icon: 'Building', path: '/home-hub', badge: 'Новое' },
        { id: 'garage', label: 'Гараж', icon: 'Car', path: '/garage' }
      ]
    },
    {
      id: 'leisure',
      title: 'Путешествия',
      icon: 'Plane',
      iconColor: 'text-sky-600',
      accentBg: 'bg-sky-50 dark:bg-sky-950/40',
      hubPath: '/leisure-hub',
      group: 'life',
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
      group: 'meaning',
      topBadge: 'Новое',
      items: [
        { id: 'portfolio', label: 'Портфолио развития', icon: 'Sparkles', path: '/portfolio', badge: 'Новое' },
        { id: 'development', label: 'Развитие семьи', icon: 'Brain', path: '/development' },
        { id: 'psychologist', label: 'Семейный психолог', icon: 'BrainCircuit', path: '/psychologist' },
        { id: 'life-road', label: 'Мастерская жизни', icon: 'Hammer', path: '/life-road' }
      ]
    },
    {
      id: 'family-matrix',
      title: 'Семейный код',
      icon: 'Sparkles',
      iconColor: 'text-purple-600',
      accentBg: 'bg-purple-50 dark:bg-purple-950/40',
      hubPath: '/family-matrix',
      group: 'meaning',
      items: [
        { id: 'family-matrix-personal', label: 'Личный код', icon: 'UserCircle2', path: '/family-matrix/personal' },
        { id: 'family-matrix-couple', label: 'Код пары', icon: 'Heart', path: '/family-matrix/couple' },
        { id: 'family-matrix-family', label: 'Код семьи', icon: 'Users', path: '/family-matrix/family' },
        { id: 'family-matrix-rituals', label: 'Ритуалы примирения', icon: 'Flame', path: '/family-matrix/rituals' },
        { id: 'family-matrix-child', label: 'Детский код', icon: 'Baby', path: '/family-matrix/child' },
        { id: 'family-matrix-name', label: 'Имя для малыша', icon: 'Sparkles', path: '/family-matrix/name' },
        { id: 'family-matrix-astrology', label: 'Астрология', icon: 'Moon', path: '/family-matrix/astrology' },
        { id: 'family-matrix-mirror', label: 'Зеркало родителя', icon: 'HeartHandshake', path: '/pari-test' }
      ]
    },
    {
      id: 'pets',
      title: 'Питомцы',
      icon: 'PawPrint',
      iconColor: 'text-violet-600',
      accentBg: 'bg-violet-50 dark:bg-violet-950/40',
      hubPath: '/pets',
      group: 'care',
      items: [
        { id: 'pets-ai', label: 'ИИ-ветеринар', icon: 'Sparkles', path: '/pets?tab=ai' },
        { id: 'pets-vaccines', label: 'Прививки', icon: 'Syringe', path: '/pets?tab=vaccines' },
        { id: 'pets-vet', label: 'Ветеринар', icon: 'Stethoscope', path: '/pets?tab=vet' },
        { id: 'pets-meds', label: 'Лекарства', icon: 'Pill', path: '/pets?tab=medications' },
        { id: 'pets-food', label: 'Питание', icon: 'Bone', path: '/pets?tab=food' },
        { id: 'pets-grooming', label: 'Груминг', icon: 'Scissors', path: '/pets?tab=grooming' },
        { id: 'pets-activity', label: 'Активность', icon: 'Activity', path: '/pets?tab=activities' },
        { id: 'pets-expenses', label: 'Расходы', icon: 'Wallet', path: '/pets?tab=expenses' },
        { id: 'pets-health', label: 'Здоровье', icon: 'LineChart', path: '/pets?tab=health' },
        { id: 'pets-items', label: 'Вещи', icon: 'Package', path: '/pets?tab=items' },
        { id: 'pets-responsibilities', label: 'Обязанности', icon: 'Users', path: '/pets?tab=responsibilities' },
        { id: 'pets-photos', label: 'Фото', icon: 'Camera', path: '/pets?tab=photos' }
      ]
    },
    {
      id: 'family-state',
      title: 'Госуслуги',
      icon: 'Landmark',
      iconColor: 'text-slate-600',
      accentBg: 'bg-slate-50 dark:bg-slate-800/40',
      hubPath: '/state-hub',
      group: 'world',
      topBadge: 'Новое',
      items: [
        { id: 'support-navigator', label: 'Навигатор мер поддержки', icon: 'Sparkles', path: '/support-navigator', badge: 'Новое' },
        { id: 'what-is-family', label: 'Что такое семья', icon: 'Users', path: '/what-is-family' },
        { id: 'family-code', label: 'Семейный кодекс РФ', icon: 'Scale', path: '/family-code' },
        { id: 'state-support', label: 'Господдержка семей', icon: 'HandHeart', path: '/state-support' },
        { id: 'family-policy', label: 'Семейная политика', icon: 'Flag', path: '/family-policy' },
        { id: 'family-news', label: 'Новости и инициативы', icon: 'Newspaper', path: '/family-news' }
      ]
    },
    {
      id: 'articles',
      title: 'Полезные статьи',
      icon: 'BookOpen',
      iconColor: 'text-orange-600',
      accentBg: 'bg-orange-50 dark:bg-orange-950/40',
      group: 'world',
      items: [
        { id: 'articles', label: 'Все статьи', icon: 'FileText', path: '/articles' }
      ]
    },
    {
      id: 'sys-dashboard',
      title: 'Дашборд',
      icon: 'LayoutDashboard',
      iconColor: 'text-cyan-600',
      accentBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      hubPath: '/dashboard',
      group: 'system',
      items: []
    },
    {
      id: 'sys-referral',
      title: 'Реферальная программа',
      icon: 'Gift',
      iconColor: 'text-violet-600',
      accentBg: 'bg-violet-50 dark:bg-violet-950/40',
      hubPath: '/referral',
      group: 'system',
      items: []
    },
    {
      id: 'in-dev',
      title: 'В разработке',
      icon: 'Wrench',
      iconColor: 'text-gray-500',
      accentBg: 'bg-gray-50 dark:bg-gray-800/40',
      group: 'system',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Гасим бейдж при переходе на хаб
  useEffect(() => {
    const visited = menuSections.find(s => s.hubPath === location.pathname);
    if (visited && visited.topBadge) {
      dismissNewBadge(visited.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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