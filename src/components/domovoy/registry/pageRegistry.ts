/**
 * Реестр страниц платформы «Наша семья».
 * Каждая запись описывает: раздел, breadcrumb, доступные действия,
 * ценность для пользователя и сценарии Домового.
 */

export interface PageAction {
  label: string;
  icon: string;
  href?: string;
  scenarioId?: string;
  description?: string;
}

export interface PageContext {
  label: string;
  breadcrumb: string[];
  moduleKey: string;
  tagline: string;
  actions: PageAction[];
  relatedModules?: string[];
}

export const PAGE_REGISTRY: Record<string, PageContext> = {
  // ── Главная ────────────────────────────────────────────────────────────────
  '/': {
    label: 'Главная',
    breadcrumb: ['Главная'],
    moduleKey: 'home',
    tagline: 'Центр управления семьёй',
    actions: [
      { label: 'Настроить семью',    icon: 'Users',       scenarioId: 'setup-family' },
      { label: 'Добавить ребёнка',   icon: 'Baby',        scenarioId: 'add-child' },
      { label: 'Открыть финансы',    icon: 'Wallet',      href: '/budget' },
      { label: 'Семейный календарь', icon: 'Calendar',    href: '/calendar' },
    ],
  },

  // ── Дети ───────────────────────────────────────────────────────────────────
  '/children': {
    label: 'Дети',
    breadcrumb: ['Главная', 'Дети'],
    moduleKey: 'children',
    tagline: 'Профили и кабинеты детей',
    actions: [
      { label: 'Добавить ребёнка',    icon: 'UserPlus',    href: '/children?action=add-child' },
      { label: 'Развитие',            icon: 'TrendingUp',  href: '/children?tab=development' },
      { label: 'Занятия и кружки',    icon: 'Dumbbell',    href: '/children?tab=activities' },
      { label: 'Финансы ребёнка',     icon: 'Wallet',      href: '/children?tab=money' },
    ],
    relatedModules: ['development', 'finance', 'memory'],
  },

  '/children/:id': {
    label: 'Кабинет ребёнка',
    breadcrumb: ['Главная', 'Дети', 'Кабинет'],
    moduleKey: 'children',
    tagline: 'Личное пространство ребёнка',
    actions: [
      { label: 'Рост и развитие',     icon: 'TrendingUp',  scenarioId: 'child-growth' },
      { label: 'Добавить занятие',    icon: 'Plus',        scenarioId: 'add-activity' },
      { label: 'Добавить достижение', icon: 'Star',        scenarioId: 'add-achievement' },
      { label: 'Семейные истории',    icon: 'Heart',       href: '/memory' },
    ],
  },

  // ── Финансы ────────────────────────────────────────────────────────────────
  '/budget': {
    label: 'Бюджет',
    breadcrumb: ['Главная', 'Финансы', 'Бюджет'],
    moduleKey: 'finance',
    tagline: 'Семейный бюджет и расходы',
    actions: [
      { label: 'Добавить расход',     icon: 'ArrowDown',   href: '/budget' },
      { label: 'Поставить цель',      icon: 'Target',      href: '/goals' },
      { label: 'Анализ трат',         icon: 'BarChart2',   href: '/finance-analytics' },
      { label: 'Детские финансы',     icon: 'Baby',        scenarioId: 'child-finance' },
    ],
    relatedModules: ['goals', 'children'],
  },

  '/goals': {
    label: 'Цели',
    breadcrumb: ['Главная', 'Финансы', 'Цели'],
    moduleKey: 'finance',
    tagline: 'Семейные финансовые цели',
    actions: [
      { label: 'Добавить цель',       icon: 'Target',      href: '/goals' },
      { label: 'Обновить прогресс',   icon: 'TrendingUp',  href: '/goals' },
      { label: 'История трат',        icon: 'Clock',       href: '/budget' },
    ],
  },

  // ── Календарь ──────────────────────────────────────────────────────────────
  '/calendar': {
    label: 'Календарь',
    breadcrumb: ['Главная', 'Календарь'],
    moduleKey: 'calendar',
    tagline: 'Семейные события и планы',
    actions: [
      { label: 'Создать событие',     icon: 'Plus',        href: '/calendar' },
      { label: 'Посмотреть неделю',   icon: 'CalendarDays', href: '/calendar' },
      { label: 'Важные даты',         icon: 'Star',        href: '/calendar' },
    ],
  },

  // ── Память ────────────────────────────────────────────────────────────────
  '/memory': {
    label: 'Воспоминания',
    breadcrumb: ['Главная', 'Память'],
    moduleKey: 'memory',
    tagline: 'Семейные истории и альбомы',
    actions: [
      { label: 'Добавить историю',    icon: 'BookOpen',    href: '/memory' },
      { label: 'Создать альбом',      icon: 'Image',       href: '/memory' },
      { label: 'Отметить людей',      icon: 'Users',       href: '/memory' },
      { label: 'Семейная линия',      icon: 'GitBranch',   href: '/tree' },
    ],
    relatedModules: ['children', 'family-tree'],
  },

  // ── Задачи ─────────────────────────────────────────────────────────────────
  '/tasks': {
    label: 'Задачи',
    breadcrumb: ['Главная', 'Задачи'],
    moduleKey: 'tasks',
    tagline: 'Семейные дела и ответственности',
    actions: [
      { label: 'Создать задачу',      icon: 'Plus',        href: '/tasks' },
      { label: 'Мои задачи',          icon: 'CheckSquare', href: '/tasks' },
      { label: 'Распределить',        icon: 'Shuffle',     href: '/tasks' },
    ],
  },

  // ── Настройки ──────────────────────────────────────────────────────────────
  '/settings': {
    label: 'Настройки',
    breadcrumb: ['Главная', 'Настройки'],
    moduleKey: 'settings',
    tagline: 'Настройки профиля и семьи',
    actions: [
      { label: 'Профиль семьи',       icon: 'Users',       scenarioId: 'setup-family' },
      { label: 'Уведомления',         icon: 'Bell',        scenarioId: 'setup-reminders' },
      { label: 'Добавить ребёнка',    icon: 'Baby',        href: '/children?action=add-child' },
    ],
  },

  // ── AI-ассистент ───────────────────────────────────────────────────────────
  '/ai-assistant': {
    label: 'Домовой',
    breadcrumb: ['Главная', 'Домовой'],
    moduleKey: 'domovoy',
    tagline: 'Ваш AI-проводник по платформе',
    actions: [
      { label: 'Карта платформы',     icon: 'Map',         scenarioId: 'platform-map' },
      { label: 'Настроить семью',     icon: 'Users',       scenarioId: 'setup-family' },
      { label: 'Добавить ребёнка',    icon: 'Baby',        scenarioId: 'add-child' },
    ],
  },

  // ── Библиотека ────────────────────────────────────────────────────────────
  '/finance-literacy': {
    label: 'Финансовая грамотность',
    breadcrumb: ['Главная', 'Обучение'],
    moduleKey: 'education',
    tagline: 'Курсы и уроки по финансам',
    actions: [
      { label: 'Начать курс',         icon: 'BookOpen',    href: '/finance-literacy' },
      { label: 'Уроки для детей',     icon: 'Baby',        href: '/finance-literacy' },
    ],
  },
};

/** Получить контекст страницы по текущему pathname */
export function getPageContext(pathname: string): PageContext | null {
  // Точное совпадение
  if (PAGE_REGISTRY[pathname]) return PAGE_REGISTRY[pathname];

  // Паттерн с параметрами (например /children/123 → /children/:id)
  for (const [pattern, ctx] of Object.entries(PAGE_REGISTRY)) {
    if (!pattern.includes(':')) continue;
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
    if (regex.test(pathname)) return ctx;
  }

  return null;
}