export interface Framework {
  id: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  gradient: string;
  steps: string[];
  hint: string;
}

export const FRAMEWORKS: Framework[] = [
  {
    id: 'smart',
    title: 'SMART-цели',
    short: 'Чёткая постановка целей',
    description:
      'Цель должна быть Конкретной, Измеримой, Достижимой, Релевантной и Ограниченной по времени. Идеально для рабочих и проектных задач.',
    icon: 'Target',
    gradient: 'from-blue-500 to-cyan-500',
    steps: [
      'Конкретно: что именно я хочу?',
      'Измеримо: как я пойму, что достиг?',
      'Достижимо: реально ли это в моих условиях?',
      'Релевантно: зачем мне это сейчас?',
      'Срок: к какой дате я завершу?',
    ],
    hint: 'Запиши результат одним предложением: «К [дате] я [действие] — измерим [метрика]».',
  },
  {
    id: 'wheel',
    title: 'Колесо баланса',
    short: '8 сфер жизни в равновесии',
    description:
      'Оцени каждую сферу жизни от 1 до 10 и увидь перекосы. Помогает выбрать, куда вкладывать энергию в первую очередь.',
    icon: 'PieChart',
    gradient: 'from-emerald-500 to-teal-500',
    steps: [
      'Оцени 8 сфер по шкале 1–10',
      'Найди 2 самых низких',
      'Поставь по одной маленькой цели в каждую',
      'Проверяй каждые 3 месяца',
    ],
    hint: 'Не пытайся всё сразу. Подними самую слабую сферу на 2 балла — этого достаточно.',
  },
  {
    id: 'ikigai',
    title: 'Икигай',
    short: 'Смысл жизни на пересечении 4 сфер',
    description:
      'Японская концепция: твоё призвание там, где пересекаются «что я люблю», «в чём я силён», «что нужно миру» и «за что мне могут платить».',
    icon: 'Compass',
    gradient: 'from-rose-500 to-orange-500',
    steps: [
      'Что ты любишь делать?',
      'В чём ты по-настоящему хорош?',
      'Что миру от тебя нужно?',
      'За что тебе готовы платить?',
      'Найди пересечение всех четырёх',
    ],
    hint: 'Не ищи идеальный ответ сразу — смотри, какие занятия попадают в 2-3 круга.',
  },
  {
    id: 'covey',
    title: '7 навыков Кови',
    short: 'Навыки высокоэффективных людей',
    description:
      'Классика Стивена Кови: проактивность, начинай с конца в уме, главное — раньше, думай Win-Win, сначала пойми, синергия, заточка пилы.',
    icon: 'Award',
    gradient: 'from-purple-500 to-indigo-500',
    steps: [
      '1. Будь проактивен — отвечай за свою жизнь',
      '2. Начинай, представляя конец',
      '3. Сначала делай главное',
      '4. Думай Win-Win',
      '5. Сначала пойми, потом будь понят',
      '6. Достигай синергии в команде',
      '7. Затачивай пилу — обновляйся',
    ],
    hint: 'Не пытайся освоить все 7 сразу. Бери один навык на месяц.',
  },
  {
    id: 'okr',
    title: 'OKR — амбициозные цели',
    short: 'Цель + измеримые ключевые результаты',
    description:
      'Метод Google и Intel. Ставишь одну вдохновляющую цель и 3–5 измеримых ключевых результатов, которые подтверждают её достижение.',
    icon: 'Rocket',
    gradient: 'from-violet-500 to-fuchsia-500',
    steps: [
      'Сформулируй вдохновляющую цель (Objective)',
      'Добавь 3–5 ключевых результатов (Key Results)',
      'Каждый KR — число и срок',
      'Раз в неделю — короткий статус',
    ],
    hint: 'Здоровый OKR — амбициозный. Если выполнено на 70%, это уже успех.',
  },
];

export interface BalanceSphere {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const BALANCE_SPHERES: BalanceSphere[] = [
  { id: 'health',     label: 'Здоровье',     icon: 'HeartPulse', color: '#ef4444' },
  { id: 'family',     label: 'Семья',        icon: 'Users',      color: '#ec4899' },
  { id: 'career',     label: 'Карьера',      icon: 'Briefcase',  color: '#8b5cf6' },
  { id: 'finance',    label: 'Финансы',      icon: 'Wallet',     color: '#10b981' },
  { id: 'love',       label: 'Отношения',    icon: 'Heart',      color: '#f43f5e' },
  { id: 'growth',     label: 'Развитие',     icon: 'BookOpen',   color: '#3b82f6' },
  { id: 'leisure',    label: 'Досуг',        icon: 'Palette',    color: '#f59e0b' },
  { id: 'spirit',     label: 'Душа',         icon: 'Sparkles',   color: '#06b6d4' },
];

export const GOAL_SPHERES = BALANCE_SPHERES.concat([
  { id: 'personal', label: 'Личное', icon: 'User', color: '#6366f1' },
]);
