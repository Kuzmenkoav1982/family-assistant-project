/**
 * Реестр сценариев Домового.
 * Каждый сценарий — это последовательность шагов с действиями и переходами.
 */

export interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  benefit?: string;
  href?: string;
  cta: string;
  ctaSecondary?: string;
}

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  totalSteps: number;
  steps: ScenarioStep[];
  completionMessage: string;
}

export const SCENARIO_REGISTRY: Record<string, Scenario> = {

  // ── Настроить семью ────────────────────────────────────────────────────────
  'setup-family': {
    id: 'setup-family',
    title: 'Настроить семью',
    emoji: '🏠',
    tagline: 'Создадим базовый семейный профиль за 4 шага',
    totalSteps: 4,
    completionMessage: 'Семейный профиль создан! Теперь можно добавить детей и настроить финансы.',
    steps: [
      {
        id: 'family-name',
        title: 'Название семьи',
        description: 'Придумайте название — например, «Семья Ивановых» или просто «Наша семья».',
        benefit: 'Это поможет персонализировать весь интерфейс.',
        href: '/settings',
        cta: 'Заполнить название',
        ctaSecondary: 'Пропустить пока',
      },
      {
        id: 'family-members',
        title: 'Добавить членов семьи',
        description: 'Пригласите супруга(у) и других близких — у каждого будет свой профиль.',
        benefit: 'Задачи, события и расходы можно будет распределять между всеми.',
        href: '/settings',
        cta: 'Добавить участников',
        ctaSecondary: 'Продолжить без этого',
      },
      {
        id: 'family-children',
        title: 'Добавить детей',
        description: 'Создайте профили для каждого ребёнка — это откроет детский кабинет.',
        benefit: 'Рост, занятия, достижения и финансы ребёнка будут в одном месте.',
        href: '/children',
        cta: 'Добавить ребёнка',
        ctaSecondary: 'У меня нет детей',
      },
      {
        id: 'family-home',
        title: 'Информация о доме',
        description: 'Укажите город и тип жилья — это нужно для коммунальных напоминаний.',
        benefit: 'Домовой будет напоминать об оплате ЖКХ и важных домашних делах.',
        href: '/settings',
        cta: 'Указать данные',
        ctaSecondary: 'Заполнить позже',
      },
    ],
  },

  // ── Добавить ребёнка ───────────────────────────────────────────────────────
  'add-child': {
    id: 'add-child',
    title: 'Добавить ребёнка',
    emoji: '👶',
    tagline: 'Создадим профиль ребёнка за 3 шага',
    totalSteps: 3,
    completionMessage: 'Профиль ребёнка готов! Теперь доступен личный кабинет с ростом, занятиями и достижениями.',
    steps: [
      {
        id: 'child-basics',
        title: 'Основные данные',
        description: 'Имя, возраст и аватар ребёнка.',
        benefit: 'Появится личный кабинет с персональным пространством.',
        href: '/children',
        cta: 'Заполнить данные',
      },
      {
        id: 'child-interests',
        title: 'Интересы и занятия',
        description: 'Чем увлекается ребёнок? Какие кружки и секции посещает?',
        benefit: 'Домовой подберёт подходящие рекомендации по развитию.',
        href: '/children',
        cta: 'Указать интересы',
        ctaSecondary: 'Добавить позже',
      },
      {
        id: 'child-goals',
        title: 'Первая цель',
        description: 'Что хочет достичь ребёнок? Цель может быть большой или маленькой.',
        benefit: 'Появится трекер прогресса и мотивация для ребёнка.',
        href: '/children',
        cta: 'Добавить цель',
        ctaSecondary: 'Пропустить',
      },
    ],
  },

  // ── Запустить раздел «Дети» ───────────────────────────────────────────────
  'setup-children-module': {
    id: 'setup-children-module',
    title: 'Запустить раздел «Дети»',
    emoji: '🌱',
    tagline: 'Активируем детский контур за 4 шага',
    totalSteps: 4,
    completionMessage: 'Детский контур активирован! Теперь есть рост, занятия, достижения и семейная память.',
    steps: [
      {
        id: 'child-profile',
        title: 'Профиль ребёнка',
        description: 'Убедитесь, что базовые данные заполнены.',
        href: '/children',
        cta: 'Проверить профиль',
      },
      {
        id: 'child-development',
        title: 'Области развития',
        description: 'Укажите направления: спорт, учёба, творчество, социальность.',
        benefit: 'Появится персональный маршрут развития и рекомендации.',
        href: '/children',
        cta: 'Настроить развитие',
      },
      {
        id: 'child-activities',
        title: 'Занятия и кружки',
        description: 'Добавьте текущие секции и активности ребёнка.',
        benefit: 'Занятия станут связаны с ростом — будет понятно, зачем каждое.',
        href: '/children',
        cta: 'Добавить занятие',
        ctaSecondary: 'Пока нет занятий',
      },
      {
        id: 'child-first-achievement',
        title: 'Первое достижение',
        description: 'Отметьте что-то, чем ребёнок уже гордится — большое или маленькое.',
        benefit: 'Начнётся история успехов, которую можно будет листать.',
        href: '/children',
        cta: 'Добавить достижение',
        ctaSecondary: 'Сделать позже',
      },
    ],
  },

  // ── Финансовый контроль ───────────────────────────────────────────────────
  'child-finance': {
    id: 'child-finance',
    title: 'Детские финансы',
    emoji: '💳',
    tagline: 'Настроим финансовый контур ребёнка за 3 шага',
    totalSteps: 3,
    completionMessage: 'Детский финансовый контур готов! Ребёнок учится управлять деньгами.',
    steps: [
      {
        id: 'piggy-bank',
        title: 'Копилка',
        description: 'Создайте копилку ребёнка и установите первую финансовую цель.',
        benefit: 'Ребёнок начнёт понимать ценность накоплений.',
        href: '/children',
        cta: 'Создать копилку',
      },
      {
        id: 'spending-habits',
        title: 'Карманные деньги',
        description: 'Укажите, сколько денег получает ребёнок и на что их тратит.',
        benefit: 'Появится история трат и финансовые привычки.',
        href: '/children',
        cta: 'Настроить',
        ctaSecondary: 'Позже',
      },
      {
        id: 'financial-goals',
        title: 'Финансовая цель',
        description: 'На что ребёнок хочет накопить? Игрушка, поездка, курс.',
        benefit: 'Мотивация копить становится конкретной и понятной.',
        href: '/children',
        cta: 'Добавить цель',
      },
    ],
  },

  // ── Карта платформы ───────────────────────────────────────────────────────
  'platform-map': {
    id: 'platform-map',
    title: 'Карта платформы',
    emoji: '🗺️',
    tagline: 'Посмотрим, что есть в «Нашей семье»',
    totalSteps: 1,
    completionMessage: 'Вы изучили карту! Выберите раздел, с которого хотите начать.',
    steps: [
      {
        id: 'explore-map',
        title: 'Обзор экосистемы',
        description: 'Откройте карту всей платформы и выберите, с чего начать.',
        cta: 'Открыть карту',
      },
    ],
  },
};

/** Сохранить прогресс сценария */
export function saveScenarioProgress(scenarioId: string, stepIndex: number): void {
  const data = { scenarioId, stepIndex, updatedAt: Date.now() };
  localStorage.setItem(`domovoy_flow_${scenarioId}`, JSON.stringify(data));
}

/** Загрузить прогресс сценария */
export function loadScenarioProgress(scenarioId: string): { stepIndex: number } | null {
  const raw = localStorage.getItem(`domovoy_flow_${scenarioId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Сбросить прогресс сценария */
export function clearScenarioProgress(scenarioId: string): void {
  localStorage.removeItem(`domovoy_flow_${scenarioId}`);
}

/** Список всех незавершённых сценариев */
export function getIncompleteScenarios(): Array<{ scenarioId: string; stepIndex: number }> {
  const result: Array<{ scenarioId: string; stepIndex: number }> = [];
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('domovoy_flow_')) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key) ?? '');
      const scenario = SCENARIO_REGISTRY[data.scenarioId];
      if (scenario && data.stepIndex < scenario.totalSteps - 1) {
        result.push({ scenarioId: data.scenarioId, stepIndex: data.stepIndex });
      }
    } catch { /* пропускаем */ }
  }
  return result;
}
