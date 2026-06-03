/**
 * Граф модулей платформы «Наша семья».
 * Используется в DomovoyPlatformMap для визуализации.
 */

export interface PlatformModule {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  href: string;
  status: 'live' | 'dev' | 'planned';
  color: string;         // Tailwind класс фона карточки
  accentColor: string;   // Tailwind класс акцентного цвета
  connections: string[]; // id связанных модулей
  /** Позиция в визуальной сетке (col, row) — для layout */
  position: { col: number; row: number };
}

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    id: 'family',
    label: 'Семья',
    emoji: '👨‍👩‍👧',
    tagline: 'Профили, приглашения, роли',
    href: '/settings',
    status: 'live',
    color: 'bg-rose-50',
    accentColor: 'text-rose-600',
    connections: ['children', 'calendar', 'memory', 'tasks'],
    position: { col: 2, row: 1 },
  },
  {
    id: 'children',
    label: 'Дети',
    emoji: '👶',
    tagline: 'Кабинет, рост, занятия, достижения',
    href: '/children',
    status: 'live',
    color: 'bg-sky-50',
    accentColor: 'text-sky-600',
    connections: ['family', 'finance', 'memory', 'education'],
    position: { col: 1, row: 2 },
  },
  {
    id: 'finance',
    label: 'Финансы',
    emoji: '💰',
    tagline: 'Бюджет, цели, расходы, долги',
    href: '/budget',
    status: 'live',
    color: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    connections: ['family', 'children', 'goals'],
    position: { col: 3, row: 2 },
  },
  {
    id: 'calendar',
    label: 'Календарь',
    emoji: '📅',
    tagline: 'События, напоминания, планы',
    href: '/calendar',
    status: 'live',
    color: 'bg-violet-50',
    accentColor: 'text-violet-600',
    connections: ['family', 'tasks'],
    position: { col: 2, row: 2 },
  },
  {
    id: 'memory',
    label: 'Память',
    emoji: '📷',
    tagline: 'Истории, альбомы, воспоминания',
    href: '/memory',
    status: 'live',
    color: 'bg-amber-50',
    accentColor: 'text-amber-600',
    connections: ['family', 'children', 'family-tree'],
    position: { col: 1, row: 3 },
  },
  {
    id: 'tasks',
    label: 'Задачи',
    emoji: '✅',
    tagline: 'Семейные дела и ответственности',
    href: '/tasks',
    status: 'live',
    color: 'bg-teal-50',
    accentColor: 'text-teal-600',
    connections: ['family', 'calendar'],
    position: { col: 2, row: 3 },
  },
  {
    id: 'goals',
    label: 'Цели',
    emoji: '🎯',
    tagline: 'Финансовые и жизненные цели',
    href: '/goals',
    status: 'live',
    color: 'bg-orange-50',
    accentColor: 'text-orange-600',
    connections: ['finance', 'children'],
    position: { col: 3, row: 3 },
  },
  {
    id: 'family-tree',
    label: 'Древо',
    emoji: '🌳',
    tagline: 'Семейное древо и родословная',
    href: '/tree',
    status: 'live',
    color: 'bg-lime-50',
    accentColor: 'text-lime-600',
    connections: ['family', 'memory'],
    position: { col: 1, row: 1 },
  },
  {
    id: 'education',
    label: 'Обучение',
    emoji: '📚',
    tagline: 'Финансовая грамотность, курсы',
    href: '/finance-literacy',
    status: 'live',
    color: 'bg-indigo-50',
    accentColor: 'text-indigo-600',
    connections: ['children', 'finance'],
    position: { col: 3, row: 1 },
  },
  {
    id: 'domovoy',
    label: 'Домовой',
    emoji: '🤖',
    tagline: 'AI-проводник и помощник',
    href: '/ai-assistant',
    status: 'live',
    color: 'bg-slate-50',
    accentColor: 'text-slate-600',
    connections: ['family', 'children', 'finance', 'calendar', 'memory'],
    position: { col: 2, row: 4 },
  },
];

export const MODULE_MAP: Record<string, PlatformModule> = Object.fromEntries(
  PLATFORM_MODULES.map(m => [m.id, m])
);
