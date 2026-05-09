// Конфиг платформы "Наша Семья" — версия v2 (после реорганизации по советам эксперта)
// Этот файл — единственная точка правды для страницы AdminProjectV2

export type LayerType = 'sources' | 'execution' | 'panorama' | 'reflection' | 'codes';

export interface HubSection {
  name: string;
  description: string;
}

export interface HubConnection {
  hubId: string;
  direction: 'from' | 'to';
  description: string;
}

export interface HubV2 {
  id: string;
  nameOld: string;
  nameNew: string;
  icon: string;
  color: string;
  layer: LayerType;
  path: string;
  tagline: string;
  purpose: string;
  sections: HubSection[];
  notDoes: string[];
  connections: HubConnection[];
  priority: 'P1' | 'P2' | 'P3';
  changeType: 'rename' | 'restructure' | 'unchanged' | 'new';
}

export interface LayerConfig {
  id: LayerType;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const LAYERS: LayerConfig[] = [
  {
    id: 'codes',
    name: 'Кодексы',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    description: 'Философия, ценности и идентичность — личная, парная и семейная',
  },
  {
    id: 'reflection',
    name: 'Осмысление',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    description: 'Рефлексия, инсайты, психология — помогают понять себя и семью',
  },
  {
    id: 'panorama',
    name: 'Панорамы',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    description: 'Сводная картина развития — аналитика и прогресс одним взглядом',
  },
  {
    id: 'execution',
    name: 'Исполнение',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    description: 'Планирование и действия — здесь ставятся задачи и фиксируются события',
  },
  {
    id: 'sources',
    name: 'Источники',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    description: 'Фактические данные о жизни семьи — люди, деньги, здоровье, быт',
  },
];

export const HUBS_V2: HubV2[] = [
  // ═══════════════════════════════════════
  // СЛОЙ: КОДЕКСЫ
  // ═══════════════════════════════════════
  {
    id: 'personal-code',
    nameOld: 'Личный код',
    nameNew: 'Личный код',
    icon: 'User',
    color: 'from-violet-500 to-purple-600',
    layer: 'codes',
    path: '/family-matrix/personal',
    tagline: 'Кто я — личность, тип, характер',
    purpose:
      'Помогает каждому члену семьи понять свою личность через научный тест. Результат — персональный профиль с сильными сторонами, склонностями и рекомендациями.',
    sections: [
      { name: 'Личностный тест', description: 'Тест на личностные особенности на основе психологических методик' },
      { name: 'Профиль личности', description: 'Результаты теста с детальной расшифровкой' },
      { name: 'Рекомендации', description: 'Персональные советы на основе типа личности' },
    ],
    notDoes: [
      'Не ставит психологические диагнозы',
      'Не заменяет работу с настоящим психологом',
      'Не анализирует отношения в паре (для этого — Код пары)',
    ],
    connections: [
      { hubId: 'couple-code', direction: 'to', description: 'Личные профили используются в анализе пары' },
      { hubId: 'family-code', direction: 'to', description: 'Личные профили складываются в семейную систему' },
      { hubId: 'portfolio', direction: 'to', description: 'Тип личности учитывается в Портфолио развития' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },
  {
    id: 'couple-code',
    nameOld: 'Код пары',
    nameNew: 'Код пары',
    icon: 'Heart',
    color: 'from-pink-500 to-rose-600',
    layer: 'codes',
    path: '/family-matrix/couple',
    tagline: 'Мы как пара — динамика, совместимость, точки роста',
    purpose:
      'Совместный тест для двоих. Показывает динамику отношений, зоны согласия и напряжения, даёт паре общий язык для разговора о важном.',
    sections: [
      { name: 'Совместный тест', description: 'Оба партнёра проходят тест — результаты сравниваются' },
      { name: 'Карта совместимости', description: 'Визуальное отображение совпадений и различий' },
      { name: 'Точки роста', description: 'Рекомендации для пары на основе результатов' },
    ],
    notDoes: [
      'Не оценивает кто прав, кто виноват',
      'Не заменяет семейную терапию',
      'Не анализирует всю семью (для этого — Код семьи)',
    ],
    connections: [
      { hubId: 'personal-code', direction: 'from', description: 'Берёт личные профили каждого партнёра' },
      { hubId: 'family-code', direction: 'to', description: 'Профиль пары входит в семейную систему' },
      { hubId: 'psychologist', direction: 'to', description: 'Сложные паттерны разбираются с Психологом ИИ' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },
  {
    id: 'family-code',
    nameOld: 'Семейный код',
    nameNew: 'Код семьи',
    icon: 'Sparkles',
    color: 'from-indigo-500 to-violet-600',
    layer: 'codes',
    path: '/family-matrix',
    tagline: 'Семья как система — правила, традиции, уклад',
    purpose:
      'Тест семейной системы. Показывает как семья функционирует как единое целое: стили воспитания, распределение ролей, традиции и ценности.',
    sections: [
      { name: 'Тест семейной системы', description: 'Диагностика семьи как системы' },
      { name: 'Семейный профиль', description: 'Уклад, роли, стиль воспитания' },
      { name: 'Традиции и ритуалы', description: 'Фиксация семейных традиций и ритуалов' },
      { name: 'Правила семьи', description: 'Договорённости и устои' },
    ],
    notDoes: [
      'Не ведёт личные профили (для этого — Личный код)',
      'Не фиксирует события в календаре',
      'Не отслеживает финансы или быт',
    ],
    connections: [
      { hubId: 'personal-code', direction: 'from', description: 'Учитывает личные профили всех членов' },
      { hubId: 'couple-code', direction: 'from', description: 'Учитывает профиль пары' },
      { hubId: 'values', direction: 'to', description: 'Семейные ценности связаны с Ценностями' },
    ],
    priority: 'P1',
    changeType: 'rename',
  },

  // ═══════════════════════════════════════
  // СЛОЙ: ОСМЫСЛЕНИЕ
  // ═══════════════════════════════════════
  {
    id: 'life-road',
    nameOld: 'Мастерская жизни',
    nameNew: 'Мастерская жизни',
    icon: 'Route',
    color: 'from-pink-500 to-orange-500',
    layer: 'reflection',
    path: '/life-road',
    tagline: 'Путь, сезоны, большие смыслы и векторы жизни',
    purpose:
      'Место для долгосрочного осмысления жизни. Хронология событий, жизненные сезоны, большие векторы — то, что нельзя увидеть в повседневной суете.',
    sections: [
      { name: 'Дорога', description: 'Хронология жизни — ключевые события и сезоны' },
      { name: 'Инсайты', description: 'ИИ-анализ жизненного пути' },
      { name: 'Цели', description: 'Большие жизненные цели и векторы' },
      { name: 'Баланс', description: 'Колесо баланса жизни по сферам' },
      { name: 'Методики', description: 'Библиотека авторских методик осмысления' },
    ],
    notDoes: [
      'Не ведёт ежедневные задачи (для этого — Планирование)',
      'Не является психологическим чатом (для этого — Психолог ИИ)',
      'Не хранит медицинские данные',
      'Не отслеживает финансовые цели (для этого — Финансы)',
    ],
    connections: [
      { hubId: 'portfolio', direction: 'to', description: 'Жизненные векторы отражаются в Портфолио развития' },
      { hubId: 'planning', direction: 'to', description: 'Большие цели разбиваются на задачи в Планировании' },
      { hubId: 'psychologist', direction: 'to', description: 'Глубокие вопросы разбираются с Психологом ИИ' },
      { hubId: 'values', direction: 'from', description: 'Опирается на личные ценности' },
    ],
    priority: 'P1',
    changeType: 'unchanged',
  },
  {
    id: 'psychologist',
    nameOld: 'Психолог ИИ',
    nameNew: 'Психолог ИИ',
    icon: 'MessageCircleHeart',
    color: 'from-teal-500 to-cyan-600',
    layer: 'reflection',
    path: '/psychologist',
    tagline: 'Поддержка, техники и справочник — доступный психолог в кармане',
    purpose:
      'Базовая психологическая поддержка на каждый день. ИИ-консультации, техники релаксации, семейные упражнения и справочник возрастных кризисов.',
    sections: [
      { name: 'Консультации ИИ', description: 'Чат с ИИ-психологом по любому вопросу' },
      { name: 'Тесты', description: 'Психологические тесты и опросники' },
      { name: 'Техники релаксации', description: 'Упражнения для снятия стресса с трекингом' },
      { name: 'Семейные упражнения', description: 'Практики для всей семьи' },
      { name: 'Справочник кризисов', description: 'Возрастные кризисы у детей — что делать' },
    ],
    notDoes: [
      'Не заменяет настоящего психолога при серьёзных проблемах',
      'Не ставит диагнозы',
      'Не ведёт юридические или медицинские дела',
      'Не анализирует личностный тип (для этого — Личный код)',
    ],
    connections: [
      { hubId: 'life-road', direction: 'from', description: 'Получает контекст жизненного пути' },
      { hubId: 'couple-code', direction: 'from', description: 'Учитывает профиль пары' },
      { hubId: 'portfolio', direction: 'to', description: 'Техники и практики попадают в Портфолио' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },
  {
    id: 'parent-mirror',
    nameOld: 'Зеркало родителя',
    nameNew: 'Зеркало родителя',
    icon: 'ScanFace',
    color: 'from-rose-500 to-pink-600',
    layer: 'reflection',
    path: '/pari-test',
    tagline: 'Научный взгляд на свои родительские установки',
    purpose:
      'Тест PARI Шефера-Белла — один из самых известных научных инструментов для диагностики родительских установок. Даёт объективную картину стиля воспитания.',
    sections: [
      { name: 'Тест PARI', description: '35 вопросов — научная диагностика родительских установок' },
      { name: 'Радар установок', description: 'Визуальная радар-диаграмма по шкалам' },
      { name: 'ИИ-разбор', description: 'ИИ объясняет результаты и даёт рекомендации' },
    ],
    notDoes: [
      'Не оценивает ребёнка',
      'Не является обвинением или осуждением',
      'Не заменяет работу с психологом при тяжёлых случаях',
      'Не ведёт ежедневный дневник (для этого — Дети)',
    ],
    connections: [
      { hubId: 'family', direction: 'from', description: 'Берёт данные о членах семьи' },
      { hubId: 'portfolio', direction: 'to', description: 'Результаты теста попадают в Портфолио развития' },
      { hubId: 'psychologist', direction: 'to', description: 'Сложные установки разбираются с Психологом ИИ' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },

  // ═══════════════════════════════════════
  // СЛОЙ: ПАНОРАМЫ
  // ═══════════════════════════════════════
  {
    id: 'portfolio',
    nameOld: 'Развитие',
    nameNew: 'Портфолио развития',
    icon: 'BarChart3',
    color: 'from-violet-500 to-purple-600',
    layer: 'panorama',
    path: '/development-hub',
    tagline: 'Сводная картина роста семьи — одним взглядом',
    purpose:
      'Панорама развития. Агрегирует данные из всех хабов и показывает целостную картину: как растут дети, как развиваются взрослые, какие практики работают.',
    sections: [
      { name: 'Картина развития', description: 'Сводный дашборд прогресса всей семьи' },
      { name: 'Достижения', description: 'Зафиксированные достижения членов семьи' },
      { name: 'Рекомендованный шаг', description: 'ИИ-рекомендация следующего шага развития' },
      { name: 'Аналитика', description: 'Тренды и динамика по периодам' },
    ],
    notDoes: [
      'Не создаёт цели — только отображает их (для создания — Мастерская жизни или Планирование)',
      'Не ведёт диалог как психолог',
      'Не владеет жизненной философией (для этого — Мастерская жизни)',
      'Не хранит первичные данные о детях (для этого — хаб Семья)',
    ],
    connections: [
      { hubId: 'life-road', direction: 'from', description: 'Получает жизненные векторы и цели' },
      { hubId: 'development', direction: 'from', description: 'Получает данные о практиках и упражнениях' },
      { hubId: 'psychologist', direction: 'from', description: 'Получает данные о выполненных техниках' },
      { hubId: 'parent-mirror', direction: 'from', description: 'Получает результаты тестов' },
      { hubId: 'planning', direction: 'from', description: 'Получает выполненные задачи' },
    ],
    priority: 'P1',
    changeType: 'rename',
  },

  // ═══════════════════════════════════════
  // СЛОЙ: ИСПОЛНЕНИЕ
  // ═══════════════════════════════════════
  {
    id: 'planning',
    nameOld: 'Планирование',
    nameNew: 'Планирование',
    icon: 'Target',
    color: 'from-blue-500 to-indigo-600',
    layer: 'execution',
    path: '/planning-hub',
    tagline: 'Задачи, события, календарь — повседневное управление жизнью',
    purpose:
      'Операционный центр семьи. Задачи, напоминания, события, семейный календарь — всё что нужно сделать сегодня, на неделе и в месяце.',
    sections: [
      { name: 'Задачи', description: 'Личные и семейные задачи с приоритетами' },
      { name: 'Календарь', description: 'Семейный календарь событий' },
      { name: 'Напоминания', description: 'Умные напоминания' },
      { name: 'Еженедельник', description: 'Планирование на неделю' },
      { name: 'Ретроспектива', description: 'Итоги периода' },
    ],
    notDoes: [
      'Не хранит большие жизненные цели (для этого — Мастерская жизни)',
      'Не анализирует развитие (для этого — Портфолио развития)',
      'Не ведёт финансовый учёт (для этого — Финансы)',
    ],
    connections: [
      { hubId: 'life-road', direction: 'from', description: 'Большие цели разбиваются на задачи здесь' },
      { hubId: 'portfolio', direction: 'to', description: 'Выполненные задачи видны в Портфолио' },
      { hubId: 'family', direction: 'from', description: 'Задачи назначаются членам семьи' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },

  // ═══════════════════════════════════════
  // СЛОЙ: ИСТОЧНИКИ
  // ═══════════════════════════════════════
  {
    id: 'family',
    nameOld: 'Семья',
    nameNew: 'Семья',
    icon: 'Users',
    color: 'from-blue-400 to-indigo-500',
    layer: 'sources',
    path: '/family-hub',
    tagline: 'Профили, дерево и чат — все люди семьи в одном месте',
    purpose:
      'Главный справочник семьи. Здесь живут профили всех членов, семейное дерево, дни рождения, контакты и семейный чат.',
    sections: [
      { name: 'Профили', description: 'Карточки всех членов семьи' },
      { name: 'Семейное дерево', description: 'Визуальное дерево родственных связей' },
      { name: 'Дети', description: 'Дневники детей, развитие, наблюдения' },
      { name: 'Семейный маячок', description: 'Геолокация членов семьи' },
      { name: 'Чат семьи', description: 'Общий семейный чат' },
    ],
    notDoes: [
      'Не ведёт финансы (для этого — Финансы)',
      'Не анализирует психологию (для этого — Психолог ИИ)',
      'Не строит планы (для этого — Планирование)',
    ],
    connections: [
      { hubId: 'planning', direction: 'to', description: 'Члены семьи назначаются исполнителями задач' },
      { hubId: 'personal-code', direction: 'to', description: 'Личные коды привязаны к профилям' },
      { hubId: 'portfolio', direction: 'to', description: 'Достижения детей видны в Портфолио' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },
  {
    id: 'values',
    nameOld: 'Ценности',
    nameNew: 'Ценности',
    icon: 'Heart',
    color: 'from-rose-400 to-pink-500',
    layer: 'sources',
    path: '/values-hub',
    tagline: 'Что важно лично тебе — карта личных приоритетов',
    purpose:
      'Личные ценности каждого члена семьи. Помогает понять свои приоритеты, принимать решения в соответствии с тем, что действительно важно.',
    sections: [
      { name: 'Карта ценностей', description: 'Визуальная карта личных ценностей' },
      { name: 'Упражнения', description: 'Практики для осознания ценностей' },
      { name: 'Сравнение с семьёй', description: 'Пересечение ценностей членов семьи' },
    ],
    notDoes: [
      'Не заменяет Код семьи (там — семейная система в целом)',
      'Не ведёт задачи и планы',
      'Не является психологическим тестом (для этого — Личный код)',
    ],
    connections: [
      { hubId: 'life-road', direction: 'to', description: 'Ценности питают жизненные векторы' },
      { hubId: 'family-code', direction: 'to', description: 'Личные ценности складываются в семейные' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
  {
    id: 'development',
    nameOld: 'Развитие',
    nameNew: 'Практики развития',
    icon: 'Brain',
    color: 'from-emerald-400 to-teal-500',
    layer: 'sources',
    path: '/development-hub',
    tagline: 'Упражнения, маршруты и привычки — что делать для роста',
    purpose:
      'Операционная база для саморазвития. Конкретные практики, курсы, упражнения и маршруты — то, что человек активно делает для своего роста.',
    sections: [
      { name: 'Маршруты', description: 'Тематические маршруты саморазвития' },
      { name: 'Упражнения', description: 'Библиотека практических упражнений' },
      { name: 'Привычки', description: 'Трекер привычек' },
      { name: 'Прогресс', description: 'Статистика и достижения' },
    ],
    notDoes: [
      'Не показывает общую картину (для этого — Портфолио развития)',
      'Не анализирует психологически (для этого — Психолог ИИ)',
      'Не хранит жизненные векторы (для этого — Мастерская жизни)',
    ],
    connections: [
      { hubId: 'portfolio', direction: 'to', description: 'Выполненные практики видны в Портфолио' },
      { hubId: 'planning', direction: 'from', description: 'Практики планируются через Планирование' },
    ],
    priority: 'P1',
    changeType: 'rename',
  },
  {
    id: 'finance',
    nameOld: 'Финансы',
    nameNew: 'Финансы',
    icon: 'Wallet',
    color: 'from-green-400 to-emerald-500',
    layer: 'sources',
    path: '/finance',
    tagline: 'Бюджет, цели, кредиты — полный финансовый контроль',
    purpose:
      'Финансовый центр семьи. Учёт доходов и расходов, бюджетирование, контроль кредитов, финансовые цели и защита от мошенников.',
    sections: [
      { name: 'Финансовый пульс', description: 'Сводная картина финансов' },
      { name: 'Бюджет', description: 'Ежемесячный бюджет по категориям' },
      { name: 'Счета', description: 'Банковские счета и карты' },
      { name: 'Кредиты', description: 'Кредиты и стратегия погашения' },
      { name: 'Цели', description: 'Финансовые цели накопления' },
      { name: 'Кэш-флоу', description: 'Движение денег' },
      { name: 'Имущество', description: 'Учёт имущества' },
      { name: 'Скидочные карты', description: 'Кошелёк скидочных карт' },
      { name: 'Антимошенник', description: 'Защита от финансового мошенничества' },
      { name: 'Финграмотность', description: 'Обучение финансовой грамотности' },
    ],
    notDoes: [
      'Не планирует задачи и события (для этого — Планирование)',
      'Не ведёт здоровье или быт',
      'Не управляет покупками списком (для этого — Быт)',
    ],
    connections: [
      { hubId: 'planning', direction: 'from', description: 'Финансовые цели связаны с планами' },
      { hubId: 'portfolio', direction: 'to', description: 'Финансовый прогресс виден в Портфолио' },
      { hubId: 'household', direction: 'to', description: 'Бытовые расходы фиксируются в Финансах' },
    ],
    priority: 'P2',
    changeType: 'unchanged',
  },
  {
    id: 'health',
    nameOld: 'Здоровье',
    nameNew: 'Здоровье',
    icon: 'HeartPulse',
    color: 'from-red-400 to-rose-500',
    layer: 'sources',
    path: '/health-hub',
    tagline: 'Медкарта, прививки, врачи — здоровье всей семьи',
    purpose:
      'Медицинский архив семьи. Карточки здоровья на каждого, история болезней, прививки, приёмы врачей, анализы и напоминания.',
    sections: [
      { name: 'Медкарта', description: 'Медицинские карты всех членов семьи' },
      { name: 'Прививки', description: 'Карта прививок и напоминания' },
      { name: 'Врачи', description: 'Записи к врачам и история приёмов' },
      { name: 'Анализы', description: 'История анализов и показателей' },
    ],
    notDoes: [
      'Не является медицинским сервисом или заменой врача',
      'Не ведёт рецепты блюд (для этого — Питание)',
      'Не анализирует психологическое состояние (для этого — Психолог ИИ)',
    ],
    connections: [
      { hubId: 'family', direction: 'from', description: 'Привязана к профилям членов семьи' },
      { hubId: 'planning', direction: 'to', description: 'Визиты к врачам попадают в Планирование' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
  {
    id: 'nutrition',
    nameOld: 'Питание',
    nameNew: 'Питание',
    icon: 'Apple',
    color: 'from-lime-400 to-green-500',
    layer: 'sources',
    path: '/nutrition',
    tagline: 'Меню, рецепты и КБЖУ — питание под контролем',
    purpose:
      'Всё о питании семьи: планирование меню, база рецептов, трекинг КБЖУ, список покупок и персональные рекомендации по питанию.',
    sections: [
      { name: 'Меню недели', description: 'Планирование питания на неделю' },
      { name: 'Рецепты', description: 'База семейных рецептов' },
      { name: 'Трекер КБЖУ', description: 'Дневник питания с подсчётом калорий' },
      { name: 'Список покупок', description: 'Автогенерация по меню' },
      { name: 'Рекомендации', description: 'Персональные рекомендации по питанию' },
      { name: 'ИИ-нутрициолог', description: 'Консультации по питанию' },
      { name: 'Ограничения', description: 'Аллергии и диетические ограничения' },
    ],
    notDoes: [
      'Не ведёт медицинские карты (для этого — Здоровье)',
      'Не планирует задачи (для этого — Планирование)',
      'Не управляет финансами на еду (для этого — Финансы)',
    ],
    connections: [
      { hubId: 'health', direction: 'to', description: 'Данные о питании влияют на показатели здоровья' },
      { hubId: 'household', direction: 'to', description: 'Список покупок перетекает в Быт' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
  {
    id: 'household',
    nameOld: 'Быт',
    nameNew: 'Быт',
    icon: 'Home',
    color: 'from-amber-400 to-orange-500',
    layer: 'sources',
    path: '/household-hub',
    tagline: 'Покупки, дела по дому и расписание — домашний порядок',
    purpose:
      'Управление домашним хозяйством. Списки покупок, дела по дому, расписание уборки, счётчики коммунальных услуг.',
    sections: [
      { name: 'Список покупок', description: 'Совместный список покупок семьи' },
      { name: 'Дела по дому', description: 'Задачи по уходу за домом' },
      { name: 'Расписание', description: 'График уборки и домашних обязанностей' },
    ],
    notDoes: [
      'Не ведёт финансовый учёт (для этого — Финансы)',
      'Не планирует поездки (для этого — Путешествия)',
      'Не управляет питанием (для этого — Питание)',
    ],
    connections: [
      { hubId: 'nutrition', direction: 'from', description: 'Список покупок генерируется из меню' },
      { hubId: 'finance', direction: 'to', description: 'Расходы на быт фиксируются в Финансах' },
      { hubId: 'planning', direction: 'to', description: 'Домашние дела появляются в Планировании' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
  {
    id: 'leisure',
    nameOld: 'Путешествия',
    nameNew: 'Путешествия',
    icon: 'Plane',
    color: 'from-sky-400 to-blue-500',
    layer: 'sources',
    path: '/leisure-hub',
    tagline: 'Поездки, места и воспоминания — география семьи',
    purpose:
      'Планирование и архив путешествий семьи. Новые поездки, места мечты, история посещённых мест и семейная карта.',
    sections: [
      { name: 'Поездки', description: 'Планирование и история путешествий' },
      { name: 'Карта мест', description: 'Карта посещённых и желаемых мест' },
      { name: 'Фотоальбом', description: 'Фото из поездок' },
    ],
    notDoes: [
      'Не ведёт финансы поездок (для этого — Финансы)',
      'Не планирует ежедневные задачи (для этого — Планирование)',
    ],
    connections: [
      { hubId: 'planning', direction: 'to', description: 'Поездки появляются в Планировании' },
      { hubId: 'finance', direction: 'to', description: 'Расходы на поездки фиксируются в Финансах' },
      { hubId: 'family', direction: 'from', description: 'Поездки привязаны к членам семьи' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
  {
    id: 'pets',
    nameOld: 'Питомцы',
    nameNew: 'Питомцы',
    icon: 'PawPrint',
    color: 'from-orange-400 to-amber-500',
    layer: 'sources',
    path: '/pets',
    tagline: 'Здоровье, питание и уход — всё о любимцах семьи',
    purpose:
      'Полный уход за питомцами. Медкарта, прививки, визиты к ветеринару, питание, груминг, активность и расходы.',
    sections: [
      { name: 'Питомцы', description: 'Карточки питомцев' },
      { name: 'ИИ-ветеринар', description: 'Консультации по здоровью питомца' },
      { name: 'Вакцинация', description: 'График прививок' },
      { name: 'Визиты', description: 'История посещений ветеринара' },
      { name: 'Питание', description: 'Рацион и режим питания' },
      { name: 'Груминг', description: 'Расписание ухода' },
      { name: 'Активность', description: 'Трекер прогулок и активности' },
      { name: 'Расходы', description: 'Затраты на питомца' },
      { name: 'Показатели здоровья', description: 'Вес, температура и другие показатели' },
      { name: 'Фотоальбом', description: 'Фото питомца' },
    ],
    notDoes: [
      'Не ведёт здоровье людей (для этого — Здоровье)',
      'Не является заменой настоящего ветеринара',
    ],
    connections: [
      { hubId: 'finance', direction: 'to', description: 'Расходы на питомцев фиксируются в Финансах' },
      { hubId: 'planning', direction: 'to', description: 'Визиты к ветеринару попадают в Планирование' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
  {
    id: 'family-state',
    nameOld: 'Госуслуги',
    nameNew: 'Госуслуги',
    icon: 'Landmark',
    color: 'from-slate-400 to-gray-500',
    layer: 'sources',
    path: '/state-hub',
    tagline: 'Документы, льготы и сроки — государственные вопросы семьи',
    purpose:
      'Навигатор по государственным услугам для семьи. Льготы, пособия, документы, сроки — всё в одном месте.',
    sections: [
      { name: 'Льготы и пособия', description: 'Список доступных льгот для семьи' },
      { name: 'Документы', description: 'Сроки действия документов и напоминания' },
      { name: 'Заявления', description: 'Шаблоны и статусы заявлений' },
      { name: 'Сроки', description: 'Важные даты и дедлайны' },
      { name: 'Справки', description: 'Нужные справки и где их получить' },
      { name: 'Инструкции', description: 'Пошаговые гайды по госуслугам' },
    ],
    notDoes: [
      'Не является официальным порталом Госуслуг',
      'Не хранит юридически значимые документы',
      'Не ведёт финансовый учёт (для этого — Финансы)',
    ],
    connections: [
      { hubId: 'family', direction: 'from', description: 'Привязана к профилям членов семьи' },
      { hubId: 'planning', direction: 'to', description: 'Дедлайны попадают в Планирование' },
      { hubId: 'finance', direction: 'to', description: 'Льготы учитываются в Финансах' },
    ],
    priority: 'P3',
    changeType: 'unchanged',
  },
];

// Получить хаб по ID
export const getHubById = (id: string): HubV2 | undefined =>
  HUBS_V2.find((h) => h.id === id);

// Получить хабы по слою
export const getHubsByLayer = (layer: LayerType): HubV2[] =>
  HUBS_V2.filter((h) => h.layer === layer);

// Получить конфиг слоя по ID
export const getLayerConfig = (id: LayerType): LayerConfig =>
  LAYERS.find((l) => l.id === id)!;

// Порядок слоёв для дерева (сверху вниз)
export const LAYER_ORDER: LayerType[] = ['codes', 'reflection', 'panorama', 'execution', 'sources'];
