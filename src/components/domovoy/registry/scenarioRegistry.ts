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
        href: '/children?action=add-child',
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
        href: '/children?action=add-child',
        cta: 'Добавить ребёнка',
      },
      {
        id: 'child-interests',
        title: 'Интересы и занятия',
        description: 'Чем увлекается ребёнок? Какие кружки и секции посещает?',
        benefit: 'Домовой подберёт подходящие рекомендации по развитию.',
        href: '/children?mode=child&tab=activities',
        cta: 'Указать интересы',
        ctaSecondary: 'Добавить позже',
      },
      {
        id: 'child-goals',
        title: 'Первая цель',
        description: 'Что хочет достичь ребёнок? Цель может быть большой или маленькой.',
        benefit: 'Появится трекер прогресса и мотивация для ребёнка.',
        href: '/goals',
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
        href: '/children?tab=development',
        cta: 'Настроить развитие',
      },
      {
        id: 'child-activities',
        title: 'Занятия и кружки',
        description: 'Добавьте текущие секции и активности ребёнка.',
        benefit: 'Занятия станут связаны с ростом — будет понятно, зачем каждое.',
        href: '/children?mode=child&tab=activities',
        cta: 'Добавить занятие',
        ctaSecondary: 'Пока нет занятий',
      },
      {
        id: 'child-first-achievement',
        title: 'Первое достижение',
        description: 'Отметьте что-то, чем ребёнок уже гордится — большое или маленькое.',
        benefit: 'Начнётся история успехов, которую можно будет листать.',
        href: '/children?mode=child&tab=achievements',
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
        href: '/children?tab=money',
        cta: 'Открыть финансы ребёнка',
      },
      {
        id: 'spending-habits',
        title: 'Карманные деньги',
        description: 'Укажите, сколько денег получает ребёнок и на что их тратит.',
        benefit: 'Появится история трат и финансовые привычки.',
        href: '/children?tab=money',
        cta: 'Настроить',
        ctaSecondary: 'Позже',
      },
      {
        id: 'financial-goals',
        title: 'Финансовая цель',
        description: 'На что ребёнок хочет накопить? Игрушка, поездка, курс.',
        benefit: 'Мотивация копить становится конкретной и понятной.',
        href: '/goals',
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

  // ── Первый вход / не знаю с чего начать ───────────────────────────────────
  'first-start': {
    id: 'first-start',
    title: 'С чего начать',
    emoji: '❓',
    tagline: 'Поможем разобраться за 3 простых шага',
    totalSteps: 3,
    completionMessage: 'Отлично! Вы познакомились с платформой. Теперь выберите, что хотите сделать первым.',
    steps: [
      {
        id: 'discover',
        title: 'Что такое «Наша семья»?',
        description: 'Это экосистема для семьи: дети, финансы, память, задачи, календарь — всё в одном месте.',
        benefit: 'Все важные семейные данные собраны вместе, а не разбросаны по разным приложениям.',
        href: '/',
        cta: 'Понял, продолжить',
      },
      {
        id: 'family-core',
        title: 'Начнём с семьи',
        description: 'Создайте семейный профиль — это займёт 2 минуты и откроет все возможности.',
        benefit: 'Семейный профиль — фундамент: без него многие разделы не работают в полную силу.',
        href: '/settings',
        cta: 'Создать профиль',
        ctaSecondary: 'Посмотреть карту платформы',
      },
      {
        id: 'choose-path',
        title: 'Выберите первый шаг',
        description: 'Куда хотите пойти дальше? Домовой поможет в любом направлении.',
        href: '/',
        cta: 'Выбрать раздел',
        ctaSecondary: 'Показать карту платформы',
      },
    ],
  },

  // ── Поиск нужного раздела ─────────────────────────────────────────────────
  'find-section': {
    id: 'find-section',
    title: 'Найти раздел',
    emoji: '🔍',
    tagline: 'Быстро перейти в нужное место платформы',
    totalSteps: 1,
    completionMessage: 'Нашли нужный раздел! Домовой всегда поможет сориентироваться.',
    steps: [
      {
        id: 'open-map',
        title: 'Карта платформы',
        description: 'Откройте карту всех модулей — там можно быстро перейти в любой раздел.',
        benefit: 'Не нужно помнить, где что находится — карта покажет всё сразу.',
        cta: 'Открыть карту',
      },
    ],
  },

  // ── Семейная память / истории ──────────────────────────────────────────────
  'family-memory': {
    id: 'family-memory',
    title: 'Семейная память',
    emoji: '📷',
    tagline: 'Начнём сохранять истории семьи',
    totalSteps: 3,
    completionMessage: 'Первые воспоминания сохранены! Семейная история начата.',
    steps: [
      {
        id: 'memory-intro',
        title: 'Раздел «Воспоминания»',
        description: 'Здесь можно сохранять истории, фотографии и важные моменты семьи.',
        benefit: 'Воспоминания не теряются — они собраны в одном месте и доступны всей семье.',
        href: '/memory',
        cta: 'Открыть воспоминания',
      },
      {
        id: 'first-story',
        title: 'Добавить первую историю',
        description: 'Запишите любой момент — поездку, праздник, просто важный день.',
        benefit: 'Даже короткая запись сегодня станет ценной памятью через несколько лет.',
        href: '/memory',
        cta: 'Добавить историю',
        ctaSecondary: 'Посмотреть пример',
      },
      {
        id: 'family-tree-link',
        title: 'Связать с семейным древом',
        description: 'Отметьте в истории людей из вашего древа — воспоминания станут частью родословной.',
        benefit: 'Дети смогут видеть историю семьи в контексте всей родословной.',
        href: '/tree',
        cta: 'Открыть древо',
        ctaSecondary: 'Пропустить пока',
      },
    ],
  },

  // ── Настройка напоминаний ─────────────────────────────────────────────────
  'setup-reminders': {
    id: 'setup-reminders',
    title: 'Напоминания',
    emoji: '🔔',
    tagline: 'Настроим уведомления под вашу семью',
    totalSteps: 3,
    completionMessage: 'Напоминания настроены! Домовой будет напоминать о важном вовремя.',
    steps: [
      {
        id: 'notifications-types',
        title: 'Что напоминать?',
        description: 'Выберите, о чём хотите получать уведомления: задачи, события, финансы, дети.',
        benefit: 'Правильные напоминания снижают стресс и помогают ничего не забывать.',
        href: '/settings?section=notifications',
        cta: 'Настроить уведомления',
      },
      {
        id: 'calendar-events',
        title: 'Важные события в календарь',
        description: 'Добавьте ближайшие семейные события — дни рождения, встречи, планы.',
        href: '/calendar',
        cta: 'Открыть календарь',
        ctaSecondary: 'Пропустить',
      },
      {
        id: 'tasks-reminders',
        title: 'Задачи с дедлайнами',
        description: 'Расставьте приоритеты в задачах — Домовой напомнит о срочных вовремя.',
        href: '/tasks',
        cta: 'Открыть задачи',
        ctaSecondary: 'Завершить',
      },
    ],
  },

  // ── Поддержка / частые вопросы ────────────────────────────────────────────
  'help-faq': {
    id: 'help-faq',
    title: 'Помощь и FAQ',
    emoji: '💬',
    tagline: 'Ответим на самые частые вопросы',
    totalSteps: 2,
    completionMessage: 'Надеемся, всё стало понятнее! Домовой всегда рядом, если появятся вопросы.',
    steps: [
      {
        id: 'faq-overview',
        title: 'Как пользоваться платформой?',
        description: 'Основной принцип: создайте семейный профиль → добавьте членов семьи → выберите нужные разделы.',
        benefit: 'Платформа работает для всей семьи — каждый участник видит своё и общее.',
        href: '/',
        cta: 'Хорошо, продолжить',
      },
      {
        id: 'support-contact',
        title: 'Нужна помощь?',
        description: 'Если что-то непонятно — напишите в поддержку или задайте вопрос Домовому прямо в чате.',
        href: '/domovoy',
        cta: 'Написать в поддержку',
        ctaSecondary: 'Задать вопрос Домовому',
      },
    ],
  },

  // ── Библиотека / чтение ───────────────────────────────────────────────────
  'family-library': {
    id: 'family-library',
    title: 'Семейная библиотека',
    emoji: '📚',
    tagline: 'Откроем раздел чтения и обучения',
    totalSteps: 2,
    completionMessage: 'Библиотека открыта! Читайте вместе — это одна из лучших семейных традиций.',
    steps: [
      {
        id: 'library-intro',
        title: 'Финансовая грамотность',
        description: 'В разделе «Обучение» есть курсы и уроки по финансам для взрослых и детей.',
        benefit: 'Финансовая грамотность всей семьи — это совместные цели, меньше ошибок, больше уверенности.',
        href: '/finance/literacy',
        cta: 'Открыть обучение',
      },
      {
        id: 'child-reading',
        title: 'Развитие через чтение',
        description: 'Отметьте в профиле ребёнка интерес к чтению — Домовой подберёт рекомендации.',
        benefit: 'Привычка читать формируется в детстве — важно начать рано.',
        href: '/children?tab=activities',
        cta: 'Открыть профиль ребёнка',
        ctaSecondary: 'Пропустить',
      },
    ],
  },

  // ── Возврат к незавершённому ──────────────────────────────────────────────
  'resume-flow': {
    id: 'resume-flow',
    title: 'Продолжить начатое',
    emoji: '▶️',
    tagline: 'Вернёмся к тому, что не успели завершить',
    totalSteps: 1,
    completionMessage: 'Отлично, вернулись! Продолжайте там, где остановились.',
    steps: [
      {
        id: 'resume-prompt',
        title: 'Незавершённые процессы',
        description: 'Домовой помнит, на каком шаге вы остановились. Выберите процесс, чтобы продолжить.',
        benefit: 'Не нужно начинать заново — прогресс сохранён.',
        href: '/',
        cta: 'Посмотреть незавершённые',
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