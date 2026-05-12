import type { SphereKey } from '@/types/portfolio.types';

export type SourceCategory = 'parent' | 'family' | 'auto' | 'achievement' | 'plan';

export interface SourceRegistryEntry {
  /** Ключ source_type из метрик портфолио */
  source_type: string;
  /** Человекочитаемое название */
  label: string;
  /** Короткое объяснение, что это за данные */
  hint: string;
  /** К каким сферам относится — для группировки и подсказок */
  spheres: SphereKey[];
  /** Тип источника — для маркировки факт/мнение/алгоритм */
  category: SourceCategory;
  /** Подтверждённый внутренний маршрут. null = маршрут не подтверждён, CTA не показываем */
  route: string | null;
  /** Текст кнопки CTA */
  cta_text: string;
  /** Через сколько дней данные считаются «давно не обновлялись» */
  freshness_days: number;
  /** Приоритет показа в подсказках «что добавить» (выше = важнее) */
  priority: number;
}

/**
 * Реестр источников данных портфолио.
 * Маршруты ТОЛЬКО подтверждённые в App.tsx — иначе route=null.
 *
 * Подтверждённые маршруты на момент создания реестра:
 * /finance, /finance/goals, /health, /events, /calendar,
 * /leisure, /trips, /tree, /community, /rules, /family-policy,
 * /nutrition, /children, /wallet
 */
export const SOURCES_REGISTRY: Record<string, SourceRegistryEntry> = {
  parent_input: {
    source_type: 'parent_input',
    label: 'Оценка родителя',
    hint: 'Ваши ответы и наблюдения о ребёнке — самый точный личный взгляд.',
    spheres: ['intellect', 'emotions', 'body', 'creativity', 'social', 'finance', 'values', 'life_skills'],
    category: 'parent',
    route: null,
    cta_text: 'Обновить оценку',
    freshness_days: 60,
    priority: 10,
  },
  child_skills: {
    source_type: 'child_skills',
    label: 'Навыки ребёнка',
    hint: 'Список того, что ребёнок умеет делать самостоятельно.',
    spheres: ['life_skills', 'intellect'],
    category: 'family',
    route: '/children',
    cta_text: 'Открыть раздел детей',
    freshness_days: 90,
    priority: 8,
  },
  children_activities: {
    source_type: 'children_activities',
    label: 'Кружки и активности',
    hint: 'Регулярные занятия, секции, увлечения ребёнка.',
    spheres: ['creativity', 'body', 'social', 'intellect'],
    category: 'family',
    route: '/leisure',
    cta_text: 'Открыть досуг',
    freshness_days: 30,
    priority: 7,
  },
  children_vaccinations: {
    source_type: 'children_vaccinations',
    label: 'Прививки',
    hint: 'Календарь вакцинации и плановые прививки.',
    spheres: ['body'],
    category: 'family',
    route: '/health',
    cta_text: 'Открыть здоровье',
    freshness_days: 365,
    priority: 4,
  },
  children_doctor_visits: {
    source_type: 'children_doctor_visits',
    label: 'Визиты к врачу',
    hint: 'Плановые осмотры и медицинские записи.',
    spheres: ['body'],
    category: 'family',
    route: '/health',
    cta_text: 'Открыть здоровье',
    freshness_days: 180,
    priority: 5,
  },
  children_mood_entries: {
    source_type: 'children_mood_entries',
    label: 'Дневник настроения',
    hint: 'Регулярные записи о настроении и самочувствии ребёнка.',
    spheres: ['emotions'],
    category: 'family',
    route: '/health',
    cta_text: 'Открыть здоровье',
    freshness_days: 14,
    priority: 9,
  },
  child_development_assessments: {
    source_type: 'child_development_assessments',
    label: 'Оценка развития',
    hint: 'Развёрнутая родительская диагностика по всем сферам.',
    spheres: ['intellect', 'emotions', 'body', 'creativity', 'social', 'finance', 'values', 'life_skills'],
    category: 'parent',
    route: null,
    cta_text: 'Пройти диагностику',
    freshness_days: 90,
    priority: 10,
  },
  family_traditions: {
    source_type: 'family_traditions',
    label: 'Семейные традиции',
    hint: 'Регулярные семейные привычки и ритуалы — основа ценностей.',
    spheres: ['values', 'social'],
    category: 'family',
    route: '/family-policy',
    cta_text: 'Открыть семейный кодекс',
    freshness_days: 60,
    priority: 6,
  },
  family_rituals: {
    source_type: 'family_rituals',
    label: 'Семейные ритуалы',
    hint: 'Ежедневные семейные ритуалы — ужин, чтение перед сном и другие.',
    spheres: ['values', 'social', 'emotions'],
    category: 'family',
    route: '/family-policy',
    cta_text: 'Открыть семейный кодекс',
    freshness_days: 30,
    priority: 6,
  },
  tasks_v2: {
    source_type: 'tasks_v2',
    label: 'Задачи и обязанности',
    hint: 'Домашние задачи и регулярные обязанности ребёнка.',
    spheres: ['life_skills', 'social'],
    category: 'family',
    route: null,
    cta_text: 'Открыть задачи',
    freshness_days: 14,
    priority: 7,
  },
  vital_records: {
    source_type: 'vital_records',
    label: 'Показатели здоровья',
    hint: 'Рост, вес, физические замеры.',
    spheres: ['body'],
    category: 'auto',
    route: '/health',
    cta_text: 'Открыть здоровье',
    freshness_days: 90,
    priority: 5,
  },
  achievements: {
    source_type: 'achievements',
    label: 'Достижения',
    hint: 'Награды, грамоты, важные моменты — гордость семьи.',
    spheres: ['intellect', 'creativity', 'body', 'social'],
    category: 'achievement',
    route: null,
    cta_text: 'Добавить достижение',
    freshness_days: 60,
    priority: 6,
  },
  reading: {
    source_type: 'reading',
    label: 'Чтение',
    hint: 'Прочитанные книги и регулярность чтения.',
    spheres: ['intellect'],
    category: 'auto',
    route: null,
    cta_text: 'Записать книгу',
    freshness_days: 14,
    priority: 7,
  },
  calendar_event: {
    source_type: 'calendar_event',
    label: 'События календаря',
    hint: 'События, занятия и встречи, где участвует ребёнок.',
    spheres: ['social', 'creativity', 'body'],
    category: 'auto',
    route: '/calendar',
    cta_text: 'Открыть календарь',
    freshness_days: 14,
    priority: 5,
  },
  habit_tracker: {
    source_type: 'habit_tracker',
    label: 'Трекер привычек',
    hint: 'Регулярные привычки ребёнка — спорт, гигиена, режим.',
    spheres: ['body', 'life_skills'],
    category: 'auto',
    route: null,
    cta_text: 'Открыть привычки',
    freshness_days: 7,
    priority: 7,
  },
};

export const SOURCE_CATEGORY_META: Record<
  SourceCategory,
  { label: string; icon: string; description: string }
> = {
  parent: {
    label: 'Оценка родителя',
    icon: 'User',
    description: 'Ваши личные наблюдения и оценки',
  },
  family: {
    label: 'Семейные данные',
    icon: 'Users',
    description: 'Записи и активности семьи',
  },
  auto: {
    label: 'Автоматически учтённые',
    icon: 'Database',
    description: 'Данные из подключённых разделов',
  },
  achievement: {
    label: 'Достижения',
    icon: 'Trophy',
    description: 'Награды, грамоты и яркие моменты',
  },
  plan: {
    label: 'Планы развития',
    icon: 'Target',
    description: 'Активные цели и шаги развития',
  },
};

export function getSourceEntry(source_type: string): SourceRegistryEntry | null {
  return SOURCES_REGISTRY[source_type] || null;
}

export type SourceFreshness = 'fresh' | 'stale' | 'never';

export function getSourceFreshness(
  source_type: string,
  measured_at: string | null,
): SourceFreshness {
  if (!measured_at) return 'never';
  const entry = SOURCES_REGISTRY[source_type];
  if (!entry) return 'fresh';
  const diffDays = Math.floor(
    (Date.now() - new Date(measured_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays > entry.freshness_days ? 'stale' : 'fresh';
}

/** Возвращает источники, относящиеся к конкретной сфере, отсортированные по priority */
export function getSourcesForSphere(sphere: SphereKey): SourceRegistryEntry[] {
  return Object.values(SOURCES_REGISTRY)
    .filter((s) => s.spheres.includes(sphere))
    .sort((a, b) => b.priority - a.priority);
}

/** Источники, специфичные только для портфолио ребёнка — не показываем взрослым */
const CHILD_ONLY_SOURCES = new Set<string>([
  'child_skills',
  'children_activities',
  'parent_input',
]);

/**
 * Возвращает топ-N источников с подтверждённым маршрутом для сферы.
 * Используется в блоке «Что добавить, чтобы оценка стала точнее».
 * Источники с route=null отфильтровываются — не показываем CTA, ведущий в никуда.
 *
 * audience: 'child' (по умолчанию) — все источники; 'adult' — без «детских».
 */
export function getActionableSourcesForSphere(
  sphere: SphereKey,
  limit = 3,
  audience: 'child' | 'adult' = 'child',
): SourceRegistryEntry[] {
  return Object.values(SOURCES_REGISTRY)
    .filter((s) => {
      if (!s.spheres.includes(sphere)) return false;
      if (s.route === null) return false;
      if (audience === 'adult' && CHILD_ONLY_SOURCES.has(s.source_type)) return false;
      return true;
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}