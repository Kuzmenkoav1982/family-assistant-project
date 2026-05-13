/**
 * Sidebar config — конфигурация основной навигации (components/layout/Sidebar.tsx).
 *
 * Вынесено из inline-определения в Sidebar.tsx (Stage refactor Sidebar A).
 *
 * Содержимое 1-в-1 совпадает с прежним inline-кодом — изменений в порядке секций,
 * порядке пунктов, маршрутах, лейблах и иконках НЕТ. Это сознательно: цель
 * рефакторинга — только сократить размер Sidebar.tsx и упростить будущие правки
 * меню (тут редактируется конфиг, в Sidebar.tsx — поведение).
 *
 * Что лежит здесь:
 *  - типы `GroupId`, `MenuSection`, `MenuItem` — публичный контракт для Sidebar.tsx.
 *  - `GROUPS` — верхнеуровневые группы (Жизнь семьи / Забота / ...).
 *  - `OWNER_ONLY_FINANCE_ITEMS` — id пунктов, которые видит только owner семьи.
 *  - `menuSections` — полный список секций со всеми пунктами.
 *
 * Что НЕ лежит здесь (живёт в Sidebar.tsx):
 *  - хуки `useState` / `useEffect` / `useMemo`.
 *  - localStorage save/restore (`sidebarOpenSections`).
 *  - badge-логика (`registerNewBadge`, `applyTopLevelLimit`, `dismissNewBadge`).
 *  - вычисление активной секции, переходов, авто-разворота.
 *
 * Когда менять этот файл:
 *  - добавить/убрать пункт меню,
 *  - изменить порядок секций,
 *  - поменять иконку / лейбл / маршрут.
 *
 * Когда менять Sidebar.tsx:
 *  - изменить поведение (как раскрывается, как считается активная секция и т.п.).
 */

export type GroupId = 'life' | 'care' | 'meaning' | 'world' | 'system';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  action?: () => void;
  inDev?: boolean;
  badge?: string;
}

export interface MenuSection {
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

/**
 * Финансовые пункты, доступные только владельцу семьи.
 * Используется в Sidebar.tsx как фильтр items в группе "Финансы".
 */
export const OWNER_ONLY_FINANCE_ITEMS = [
  'finance-analytics',
  'finance-strategy',
  'finance-cashflow',
  'finance-budget',
  'finance-accounts',
  'finance-debts',
  'finance-recurring',
  'finance-assets',
] as const;

/**
 * Верхнеуровневые группы. Порядок здесь определяет порядок отрисовки секций
 * в сайдбаре (Sidebar.tsx маппит GROUPS, фильтруя menuSections по group).
 */
export const GROUPS: { id: GroupId; title: string; hint: string }[] = [
  { id: 'life',    title: 'Жизнь семьи',       hint: 'Операционный контур' },
  { id: 'care',    title: 'Забота',            hint: 'Состояние и здоровье' },
  { id: 'meaning', title: 'Смысл и отношения', hint: 'Развитие и ценности' },
  { id: 'world',   title: 'Внешний мир',       hint: 'Государство и знание' },
  { id: 'system',  title: 'Система',           hint: 'Сервис и настройки' },
];

/**
 * Полная конфигурация секций сайдбара.
 * НЕ менять порядок без явной задачи на UX-перестройку навигации.
 */
export const menuSections: MenuSection[] = [
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
