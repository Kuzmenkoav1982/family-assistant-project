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
  /** Альтернативное название для портфолио взрослого */
  label_adult?: string;
  /** Альтернативное описание для портфолио взрослого */
  hint_adult?: string;
  /** Альтернативный CTA-текст для портфолио взрослого */
  cta_text_adult?: string;
  /** Если источник вообще не уместен для портфолио взрослого — скрываем */
  hide_for_adult?: boolean;
  /** D.1: какую вкладку открыть на целевой странице (опционально). */
  tab?: string;
  /** D.1: какое действие запустить на целевой странице — обычно открыть форму добавления. */
  action?:
    | 'add-skill'
    | 'add-area'
    | 'add-activity'
    | 'add-vaccination'
    | 'add-doctor-visit'
    | 'add-mood-entry'
    | 'add-vital'
    | 'add-ritual'
    | 'add-tradition'
    | 'add-record';
  /** D.1: дополнительные query-параметры, специфичные для целевой страницы (например mode=child). */
  extraParams?: Record<string, string>;
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
    label_adult: 'Самооценка',
    hint_adult: 'Ваши ответы и наблюдения о себе — самый точный личный взгляд.',
    cta_text_adult: 'Обновить самооценку',
  },
  child_skills: {
    source_type: 'child_skills',
    label: 'Навыки ребёнка',
    hint: 'Список того, что ребёнок умеет делать самостоятельно.',
    spheres: ['life_skills', 'intellect'],
    category: 'family',
    route: '/children',
    cta_text: 'Добавить область',
    freshness_days: 90,
    priority: 8,
    tab: 'development',
    action: 'add-area',
    extraParams: { mode: 'parent' },
    label_adult: 'Личные навыки',
    hint_adult: 'Список ваших умений и компетенций — что вы делаете самостоятельно и хорошо.',
    cta_text_adult: 'Открыть профиль',
    hide_for_adult: true,
  },
  children_activities: {
    source_type: 'children_activities',
    label: 'Кружки и активности',
    hint: 'Регулярные занятия, секции, увлечения ребёнка.',
    spheres: ['creativity', 'body', 'social', 'intellect'],
    category: 'family',
    route: '/children',
    cta_text: 'Добавить занятие',
    freshness_days: 30,
    priority: 7,
    tab: 'development',
    action: 'add-activity',
    extraParams: { mode: 'parent' },
    label_adult: 'Хобби и активности',
    hint_adult: 'Регулярные занятия, спорт, хобби и увлечения.',
    cta_text_adult: 'Добавить занятие',
    hide_for_adult: true,
  },
  children_vaccinations: {
    source_type: 'children_vaccinations',
    label: 'Прививки',
    hint: 'Календарь вакцинации и плановые прививки.',
    spheres: ['body'],
    category: 'family',
    route: '/health',
    cta_text: 'Добавить прививку',
    freshness_days: 365,
    priority: 4,
    tab: 'vaccinations',
    action: 'add-vaccination',
    hint_adult: 'Ваш календарь вакцинации и плановые прививки.',
  },
  children_doctor_visits: {
    source_type: 'children_doctor_visits',
    label: 'Визиты к врачу',
    hint: 'Плановые осмотры и медицинские записи.',
    spheres: ['body'],
    category: 'family',
    route: '/health',
    cta_text: 'Добавить визит',
    freshness_days: 180,
    priority: 5,
    tab: 'history',
    action: 'add-doctor-visit',
    hint_adult: 'Ваши плановые осмотры и медицинские записи.',
  },
  children_mood_entries: {
    source_type: 'children_mood_entries',
    label: 'Дневник настроения',
    hint: 'Регулярные записи о настроении и самочувствии ребёнка.',
    spheres: ['emotions'],
    category: 'family',
    route: '/children',
    cta_text: 'Добавить запись',
    freshness_days: 14,
    priority: 9,
    tab: 'diary',
    action: 'add-mood-entry',
    extraParams: { mode: 'child' },
    hint_adult: 'Регулярные записи о вашем настроении и самочувствии.',
    hide_for_adult: true,
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
    label_adult: 'Самодиагностика',
    hint_adult: 'Развёрнутая самодиагностика по всем сферам жизни.',
    cta_text_adult: 'Пройти самодиагностику',
  },
  family_traditions: {
    source_type: 'family_traditions',
    label: 'Семейные традиции',
    hint: 'Регулярные семейные привычки и ритуалы — основа ценностей.',
    spheres: ['values', 'social'],
    category: 'family',
    route: '/culture',
    cta_text: 'Добавить традицию',
    freshness_days: 60,
    priority: 6,
    action: 'add-tradition',
  },
  family_rituals: {
    source_type: 'family_rituals',
    label: 'Семейные ритуалы',
    hint: 'Ежедневные семейные ритуалы — ужин, чтение перед сном и другие.',
    spheres: ['values', 'social', 'emotions'],
    category: 'family',
    route: '/culture',
    cta_text: 'Добавить ритуал',
    freshness_days: 30,
    priority: 6,
    action: 'add-ritual',
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
    hint_adult: 'Ваши задачи и регулярные обязанности в семье.',
  },
  vital_records: {
    source_type: 'vital_records',
    label: 'Показатели здоровья',
    hint: 'Рост, вес, физические замеры.',
    spheres: ['body'],
    category: 'auto',
    route: '/health',
    cta_text: 'Добавить показатель',
    freshness_days: 90,
    priority: 5,
    tab: 'vitals',
    action: 'add-vital',
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
    hint_adult: 'Ваши события, занятия и встречи из календаря.',
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
    hint_adult: 'Ваши регулярные привычки — спорт, режим, ритуалы.',
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

/**
 * Возвращает запись с подставленными «взрослыми» формулировками,
 * если они заданы и audience = 'adult'. Иначе возвращает исходную запись.
 */
export function resolveSourceForAudience(
  entry: SourceRegistryEntry,
  audience: 'child' | 'adult' = 'child',
): SourceRegistryEntry {
  if (audience !== 'adult') return entry;
  if (!entry.label_adult && !entry.hint_adult && !entry.cta_text_adult) return entry;
  return {
    ...entry,
    label: entry.label_adult ?? entry.label,
    hint: entry.hint_adult ?? entry.hint,
    cta_text: entry.cta_text_adult ?? entry.cta_text,
  };
}

/**
 * Возвращает топ-N источников с подтверждённым маршрутом для сферы.
 * Используется в блоке «Что добавить, чтобы оценка стала точнее».
 * Источники с route=null отфильтровываются — не показываем CTA, ведущий в никуда.
 *
 * audience: 'child' (по умолчанию) — все источники; 'adult' — со взрослыми текстами,
 * без источников, помеченных hide_for_adult.
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
      if (audience === 'adult' && s.hide_for_adult) return false;
      return true;
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((s) => resolveSourceForAudience(s, audience));
}

/**
 * D.1: Резолвер «рекомендация → целевое действие».
 *
 * Возвращает {kind, pathname, search} для перехода из блока подсказок портфолио
 * в конкретную форму создания записи. Контракт стабильный:
 *  - kind: 'route' (на текущий момент модалок поверх портфолио нет)
 *  - pathname: маршрут из registry
 *  - search: query-строка с member, action, tab, from=portfolio
 *  - href: готовая строка для <Link to=...>
 *
 * Если в записи нет route или source_type неизвестен — возвращает null
 * (CTA не показывается, фолбэк на отсутствие кнопки).
 */
export interface RecommendationTarget {
  kind: 'route';
  pathname: string;
  search: string;
  href: string;
  sourceType: string;
  action?: string;
  tab?: string;
  memberId?: string;
}

export function resolveRecommendationTarget(
  memberId: string | null | undefined,
  sourceType: string,
): RecommendationTarget | null {
  const entry = SOURCES_REGISTRY[sourceType];
  if (!entry) return null;
  if (!entry.route) return null;

  const params = new URLSearchParams();
  if (memberId) {
    params.set('member', memberId);
    // На /children исторически используется ключ childId — дублируем для совместимости.
    if (entry.route === '/children') {
      params.set('childId', memberId);
    }
  }
  if (entry.action) params.set('action', entry.action);
  if (entry.tab) params.set('tab', entry.tab);
  if (entry.extraParams) {
    for (const [k, v] of Object.entries(entry.extraParams)) {
      params.set(k, v);
    }
  }
  params.set('from', 'portfolio');
  // D.1: куда вернуть пользователя после успешного сохранения формы.
  if (memberId) {
    params.set('returnTo', `/portfolio/${memberId}`);
  }

  const search = params.toString();
  const href = search ? `${entry.route}?${search}` : entry.route;

  return {
    kind: 'route',
    pathname: entry.route,
    search,
    href,
    sourceType,
    action: entry.action,
    tab: entry.tab,
    memberId: memberId ?? undefined,
  };
}