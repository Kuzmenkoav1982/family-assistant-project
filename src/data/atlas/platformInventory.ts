// Авто-слой паспорта платформы.
// Источник правды — Sidebar.tsx. Здесь зеркалируем структуру 1:1.
// Любые правки наименований — сначала в Sidebar.tsx, потом сюда.

import type { InventoryHub, InventorySection } from './types';

export const HUBS: InventoryHub[] = [
  { id: 'family', title: 'Семья', icon: 'Users', hubPath: '/family-hub' },
  { id: 'health', title: 'Здоровье', icon: 'HeartPulse', hubPath: '/health-hub' },
  { id: 'nutrition', title: 'Питание', icon: 'Apple', hubPath: '/nutrition' },
  { id: 'values', title: 'Ценности', icon: 'Heart', hubPath: '/values-hub' },
  { id: 'planning', title: 'Планирование', icon: 'Target', hubPath: '/planning-hub' },
  { id: 'finance', title: 'Финансы', icon: 'Wallet', hubPath: '/finance' },
  { id: 'household', title: 'Быт', icon: 'Home', hubPath: '/household-hub' },
  { id: 'leisure', title: 'Путешествия', icon: 'Plane', hubPath: '/leisure-hub' },
  { id: 'development', title: 'Развитие', icon: 'Brain', hubPath: '/development-hub' },
  { id: 'family-matrix', title: 'Семейный код', icon: 'Sparkles', hubPath: '/family-matrix' },
  { id: 'pets', title: 'Питомцы', icon: 'PawPrint', hubPath: '/pets' },
  { id: 'family-state', title: 'Госуслуги', icon: 'Landmark', hubPath: '/state-hub' },
  { id: 'articles', title: 'Полезные статьи', icon: 'BookOpen' },
  { id: 'in-dev', title: 'В разработке', icon: 'Wrench' },
];

export const SECTIONS: InventorySection[] = [
  // ── Семья ─────────────────────────────────────────
  { id: 'profiles', hubId: 'family', label: 'Профили семьи', icon: 'Users', path: '/?section=family', source: 'sidebar' },
  { id: 'tree', hubId: 'family', label: 'Семейное древо', icon: 'GitBranch', path: '/tree', source: 'sidebar' },
  { id: 'children', hubId: 'family', label: 'Дети', icon: 'Baby', path: '/children', source: 'sidebar' },
  { id: 'family-tracker', hubId: 'family', label: 'Семейный маячок', icon: 'MapPin', path: '/family-tracker', source: 'sidebar' },
  { id: 'family-chat', hubId: 'family', label: 'Чат семьи', icon: 'MessagesSquare', path: '/family-chat', badge: 'Новое', source: 'sidebar' },

  // ── Здоровье ──────────────────────────────────────
  { id: 'health', hubId: 'health', label: 'Здоровье семьи', icon: 'HeartPulse', path: '/health', source: 'sidebar' },

  // ── Питание ───────────────────────────────────────
  { id: 'nutrition-hub', hubId: 'nutrition', label: 'Питание', icon: 'Apple', path: '/nutrition', source: 'sidebar' },
  { id: 'diet-ai', hubId: 'nutrition', label: 'ИИ-Диета', icon: 'Brain', path: '/nutrition/diet', source: 'sidebar' },
  { id: 'diet-preset', hubId: 'nutrition', label: 'Готовые режимы', icon: 'ListChecks', path: '/nutrition/programs', source: 'sidebar' },
  { id: 'recipe-products', hubId: 'nutrition', label: 'Рецепт из продуктов', icon: 'ChefHat', path: '/nutrition/recipe-from-products', source: 'sidebar' },
  { id: 'nutrition-tracker', hubId: 'nutrition', label: 'Счётчик БЖУ', icon: 'Calculator', path: '/nutrition/tracker', source: 'sidebar' },
  { id: 'meals', hubId: 'nutrition', label: 'Меню на неделю', icon: 'UtensilsCrossed', path: '/meals', source: 'sidebar' },
  { id: 'recipes', hubId: 'nutrition', label: 'Рецепты', icon: 'BookOpen', path: '/recipes', source: 'sidebar' },

  // ── Ценности ──────────────────────────────────────
  { id: 'values', hubId: 'values', label: 'Ценности', icon: 'Heart', path: '/values', source: 'sidebar' },
  { id: 'faith', hubId: 'values', label: 'Вера', icon: 'Church', path: '/faith', source: 'sidebar' },
  { id: 'traditions', hubId: 'values', label: 'Традиции', icon: 'Sparkles', path: '/culture', source: 'sidebar' },
  { id: 'wisdom', hubId: 'values', label: 'Мудрость народа', icon: 'BookOpen', path: '/wisdom', source: 'sidebar' },
  { id: 'house-rules', hubId: 'values', label: 'Правила дома', icon: 'FileText', path: '/rules', source: 'sidebar' },

  // ── Планирование ──────────────────────────────────
  { id: 'goals', hubId: 'planning', label: 'Цели', icon: 'Target', path: '/?section=goals', source: 'sidebar' },
  { id: 'tasks', hubId: 'planning', label: 'Задачи', icon: 'CheckSquare', path: '/tasks', source: 'sidebar' },
  { id: 'calendar', hubId: 'planning', label: 'Календарь', icon: 'Calendar', path: '/calendar', source: 'sidebar' },
  { id: 'purchases', hubId: 'planning', label: 'План покупок', icon: 'ShoppingBag', path: '/purchases', source: 'sidebar' },
  { id: 'analytics', hubId: 'planning', label: 'Аналитика', icon: 'BarChart3', path: '/analytics', source: 'sidebar' },

  // ── Финансы ───────────────────────────────────────
  { id: 'finance-analytics', hubId: 'finance', label: 'Финансовый пульс', icon: 'Activity', path: '/finance/analytics', source: 'sidebar' },
  { id: 'finance-strategy', hubId: 'finance', label: 'Стратегия погашения', icon: 'Swords', path: '/finance/strategy', source: 'sidebar' },
  { id: 'finance-cashflow', hubId: 'finance', label: 'Кэш-флоу прогноз', icon: 'TrendingUp', path: '/finance/cashflow', source: 'sidebar' },
  { id: 'finance-budget', hubId: 'finance', label: 'Бюджет', icon: 'PieChart', path: '/finance/budget', source: 'sidebar' },
  { id: 'finance-accounts', hubId: 'finance', label: 'Счета и карты', icon: 'CreditCard', path: '/finance/accounts', source: 'sidebar' },
  { id: 'finance-debts', hubId: 'finance', label: 'Кредиты и долги', icon: 'Receipt', path: '/finance/debts', source: 'sidebar' },
  { id: 'finance-goals', hubId: 'finance', label: 'Финансовые цели', icon: 'Target', path: '/finance/goals', source: 'sidebar' },
  { id: 'finance-literacy', hubId: 'finance', label: 'Финграмотность', icon: 'GraduationCap', path: '/finance/literacy', source: 'sidebar' },
  { id: 'finance-assets', hubId: 'finance', label: 'Имущество', icon: 'Home', path: '/finance/assets', source: 'sidebar' },
  { id: 'finance-loyalty', hubId: 'finance', label: 'Скидочные карты', icon: 'Ticket', path: '/finance/loyalty', source: 'sidebar' },
  { id: 'finance-antiscam', hubId: 'finance', label: 'Антимошенник', icon: 'ShieldAlert', path: '/finance/antiscam', source: 'sidebar' },
  { id: 'wallet', hubId: 'finance', label: 'Кошелёк сервиса', icon: 'Wallet', path: '/wallet', source: 'sidebar' },

  // ── Быт ───────────────────────────────────────────
  { id: 'shopping', hubId: 'household', label: 'Покупки', icon: 'ShoppingCart', path: '/shopping', source: 'sidebar' },
  { id: 'voting', hubId: 'household', label: 'Голосования', icon: 'ThumbsUp', path: '/voting', source: 'sidebar' },
  { id: 'garage', hubId: 'household', label: 'Гараж', icon: 'Car', path: '/garage', source: 'sidebar' },

  // ── Путешествия ───────────────────────────────────
  { id: 'trips', hubId: 'leisure', label: 'Путешествия', icon: 'Plane', path: '/trips', source: 'sidebar' },
  { id: 'leisure', hubId: 'leisure', label: 'Досуг', icon: 'MapPin', path: '/leisure', source: 'sidebar' },
  { id: 'events', hubId: 'leisure', label: 'Праздники', icon: 'PartyPopper', path: '/events', source: 'sidebar' },

  // ── Развитие ──────────────────────────────────────
  { id: 'portfolio', hubId: 'development', label: 'Портфолио развития', icon: 'Sparkles', path: '/portfolio', badge: 'Новое', source: 'sidebar' },
  { id: 'development', hubId: 'development', label: 'Развитие', icon: 'Brain', path: '/development', source: 'sidebar' },
  { id: 'psychologist', hubId: 'development', label: 'Психолог ИИ', icon: 'BrainCircuit', path: '/psychologist', source: 'sidebar' },
  { id: 'life-road', hubId: 'development', label: 'Мастерская жизни', icon: 'Hammer', path: '/life-road', source: 'sidebar' },

  // ── Семейный код ──────────────────────────────────
  { id: 'family-matrix-personal', hubId: 'family-matrix', label: 'Личный код', icon: 'UserCircle2', path: '/family-matrix/personal', source: 'sidebar' },
  { id: 'family-matrix-couple', hubId: 'family-matrix', label: 'Код пары', icon: 'Heart', path: '/family-matrix/couple', source: 'sidebar' },
  { id: 'family-matrix-family', hubId: 'family-matrix', label: 'Код семьи', icon: 'Users', path: '/family-matrix/family', source: 'sidebar' },
  { id: 'family-matrix-rituals', hubId: 'family-matrix', label: 'Ритуалы примирения', icon: 'Flame', path: '/family-matrix/rituals', source: 'sidebar' },
  { id: 'family-matrix-child', hubId: 'family-matrix', label: 'Детский код', icon: 'Baby', path: '/family-matrix/child', source: 'sidebar' },
  { id: 'family-matrix-name', hubId: 'family-matrix', label: 'Имя для малыша', icon: 'Sparkles', path: '/family-matrix/name', source: 'sidebar' },
  { id: 'family-matrix-astrology', hubId: 'family-matrix', label: 'Астрология', icon: 'Moon', path: '/family-matrix/astrology', source: 'sidebar' },
  { id: 'family-matrix-mirror', hubId: 'family-matrix', label: 'Зеркало родителя', icon: 'HeartHandshake', path: '/pari-test', source: 'sidebar' },

  // ── Питомцы ───────────────────────────────────────
  { id: 'pets-hub', hubId: 'pets', label: 'Питомцы', icon: 'PawPrint', path: '/pets', source: 'sidebar' },
  { id: 'pets-ai', hubId: 'pets', label: 'ИИ-ветеринар', icon: 'Sparkles', path: '/pets?tab=ai', source: 'sidebar' },
  { id: 'pets-vaccines', hubId: 'pets', label: 'Вакцинация', icon: 'Syringe', path: '/pets?tab=vaccines', source: 'sidebar' },
  { id: 'pets-vet', hubId: 'pets', label: 'Визиты к ветеринару', icon: 'Stethoscope', path: '/pets?tab=vet', source: 'sidebar' },
  { id: 'pets-meds', hubId: 'pets', label: 'Лекарства', icon: 'Pill', path: '/pets?tab=medications', source: 'sidebar' },
  { id: 'pets-food', hubId: 'pets', label: 'Питание', icon: 'Bone', path: '/pets?tab=food', source: 'sidebar' },
  { id: 'pets-grooming', hubId: 'pets', label: 'Груминг', icon: 'Scissors', path: '/pets?tab=grooming', source: 'sidebar' },
  { id: 'pets-activity', hubId: 'pets', label: 'Активность', icon: 'Activity', path: '/pets?tab=activities', source: 'sidebar' },
  { id: 'pets-expenses', hubId: 'pets', label: 'Расходы', icon: 'Wallet', path: '/pets?tab=expenses', source: 'sidebar' },
  { id: 'pets-health', hubId: 'pets', label: 'Показатели здоровья', icon: 'LineChart', path: '/pets?tab=health', source: 'sidebar' },
  { id: 'pets-items', hubId: 'pets', label: 'Вещи и игрушки', icon: 'Package', path: '/pets?tab=items', source: 'sidebar' },
  { id: 'pets-photos', hubId: 'pets', label: 'Фотоальбом', icon: 'Camera', path: '/pets?tab=photos', source: 'sidebar' },

  // ── Госуслуги ─────────────────────────────────────
  { id: 'support-navigator', hubId: 'family-state', label: 'Навигатор мер поддержки', icon: 'Sparkles', path: '/support-navigator', badge: 'Новое', source: 'sidebar' },
  { id: 'what-is-family', hubId: 'family-state', label: 'Что такое семья', icon: 'Users', path: '/what-is-family', source: 'sidebar' },
  { id: 'family-code', hubId: 'family-state', label: 'Семейный кодекс РФ', icon: 'Scale', path: '/family-code', source: 'sidebar' },
  { id: 'state-support', hubId: 'family-state', label: 'Господдержка семей', icon: 'HandHeart', path: '/state-support', source: 'sidebar' },
  { id: 'family-policy', hubId: 'family-state', label: 'Семейная политика', icon: 'Flag', path: '/family-policy', source: 'sidebar' },
  { id: 'family-news', hubId: 'family-state', label: 'Новости и инициативы', icon: 'Newspaper', path: '/family-news', source: 'sidebar' },

  // ── Полезные статьи ──────────────────────────────
  { id: 'articles', hubId: 'articles', label: 'Все статьи', icon: 'FileText', path: '/articles', source: 'sidebar' },

  // ── В разработке ─────────────────────────────────
  { id: 'in-development-list', hubId: 'in-dev', label: 'В разработке', icon: 'Construction', path: '/in-development', source: 'sidebar' },
];

/** Утилиты доступа */
export function getHubById(id: string): InventoryHub | undefined {
  return HUBS.find((h) => h.id === id);
}

export function getSectionsByHub(hubId: string): InventorySection[] {
  return SECTIONS.filter((s) => s.hubId === hubId);
}

export function countSectionsByHub(): Record<string, number> {
  return HUBS.reduce<Record<string, number>>((acc, hub) => {
    acc[hub.id] = SECTIONS.filter((s) => s.hubId === hub.id).length;
    return acc;
  }, {});
}
