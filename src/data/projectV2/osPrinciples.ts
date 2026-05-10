// ─────────────────────────────────────────────────────────────
// ПРАВИЛА И ЛОГИКИ СЕМЕЙНОЙ ОС
//
// Каталог переиспользуемых паттернов, смыслов и решений,
// которые мы применяем при разработке любых новых хабов и
// разделов. Цель — общий язык команды и предсказуемость продукта.
//
// При создании нового модуля сверяемся с этим каталогом —
// чтобы UX/архитектура соответствовали уже принятым правилам.
// ─────────────────────────────────────────────────────────────

export type PrincipleCategory =
  | 'concept'      // Концепции и смыслы
  | 'architecture' // Архитектурные правила
  | 'ux'           // UX-паттерны
  | 'data'         // Данные и состояние
  | 'visual'       // Визуальный язык
  | 'workflow';    // Процесс разработки

export type PrincipleStatus = 'active' | 'in-progress' | 'planned';

export interface PrincipleExample {
  /** Где применяется в проекте */
  where: string;
  /** Краткое описание применения */
  description: string;
  /** Путь к файлу или компоненту (для технической ссылки) */
  ref?: string;
}

export interface OsPrinciple {
  id: string;
  category: PrincipleCategory;
  /** Короткий заголовок */
  title: string;
  /** Одно предложение — суть правила */
  summary: string;
  /** Подробное описание (несколько предложений) */
  description: string;
  /** Когда применяем (триггер) */
  when: string[];
  /** Что делаем (действие) */
  rule: string[];
  /** Чего не делаем (анти-паттерн) */
  antiPatterns?: string[];
  /** Где уже применили — конкретные примеры из кода */
  examples: PrincipleExample[];
  /** Статус принципа */
  status: PrincipleStatus;
  /** Иконка lucide-react */
  icon: string;
  /** Цветовой акцент */
  accent: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose' | 'cyan' | 'slate';
  /** Связанные принципы */
  relatedIds?: string[];
}

export const CATEGORY_META: Record<
  PrincipleCategory,
  { label: string; description: string; icon: string; cls: string }
> = {
  concept: {
    label: 'Концепция',
    description: 'Главные смыслы продукта: что такое «Семейная ОС», 5 циклов, смысловой слой',
    icon: 'Compass',
    cls: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  architecture: {
    label: 'Архитектура',
    description: 'Правила структуры кода: канон сущностей, модальность, типы хабов',
    icon: 'Boxes',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ux: {
    label: 'UX-паттерн',
    description: 'Переиспользуемые UI-решения: ProgressMap, табы-слои, зонтики, бейджи',
    icon: 'LayoutDashboard',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  data: {
    label: 'Данные',
    description: 'Правила работы с состоянием, БД, картой реальности',
    icon: 'Database',
    cls: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  visual: {
    label: 'Визуальный язык',
    description: 'Цвета, бейджи, иконки, заголовки и подзаголовки',
    icon: 'Palette',
    cls: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  workflow: {
    label: 'Процесс',
    description: 'Правила разработки: миграции, актуализация админки, проверки',
    icon: 'GitBranch',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export const STATUS_META: Record<PrincipleStatus, { label: string; cls: string }> = {
  active: { label: 'Применяется', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  'in-progress': { label: 'В работе', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
  planned: { label: 'Запланировано', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
};

// ─────────────────────────────────────────────────────────────
// КАТАЛОГ ПРИНЦИПОВ
// ─────────────────────────────────────────────────────────────
export const OS_PRINCIPLES: OsPrinciple[] = [
  // ═══════════ КОНЦЕПЦИИ ═══════════
  {
    id: 'family-os-positioning',
    category: 'concept',
    title: 'Семейная ОС, а не органайзер',
    summary: 'Продукт позиционируется как операционка семьи, а не «ещё одно приложение для задач»',
    description:
      'Главный смысловой выбор: мы не конкурируем с Todoist или Trello. Мы — единая ОС семьи, где живут профили, отношения, договорённости, здоровье, бюджет и смыслы. Это позиционирование должно быть видно во всех точках входа — лендинг, онбординг, презентации, инструкции.',
    when: [
      'Создаём новый раздел или фичу',
      'Пишем тексты на лендинге, в онбординге, в SEO',
      'Готовим презентации и маркетинг',
    ],
    rule: [
      'Используем формулировку «Семейная ОС» / «ОС вашей семьи» / «семейная операционка»',
      'Объясняем смысл каждой фичи через контекст всей семьи, а не индивидуального пользователя',
      'Подчёркиваем единый ритм: общая картина, общие договорённости, общее исполнение',
    ],
    antiPatterns: [
      '«Семейный органайзер» / «приложение для задач семьи»',
      'Описание фичи в отрыве от семейного контекста',
    ],
    examples: [
      { where: 'Лендинг hero', description: 'Заголовок «Семейная операционка»', ref: 'src/components/welcome/WelcomeHero.tsx' },
      { where: 'Онбординг шаг 1', description: 'Заголовок «Добро пожаловать в Семейную ОС»', ref: 'src/pages/Onboarding.tsx' },
      { where: 'Инструкции', description: 'Раздел «Семейная ОС — что это»', ref: 'src/components/instructions/sectionsData.ts' },
      { where: 'InvestorDeck', description: 'Cover slide: «Семейная операционка»', ref: 'src/components/investor-deck/slidesData.ts' },
    ],
    status: 'active',
    icon: 'Layers',
    accent: 'violet',
    relatedIds: ['five-cycles', 'meaning-layer'],
  },
  {
    id: 'five-cycles',
    category: 'concept',
    title: '5 циклов жизни семьи',
    summary: 'Сбор → Картина → Осмысление → Договорённости → Исполнение → петля',
    description:
      'Горизонтальный разрез поверх всех хабов. Один продукт работает в 5 фазах жизни семьи последовательно и циклично. Каждый раздел отвечает за свою фазу, а вместе они образуют единый ритм.',
    when: [
      'Объясняем продукт пользователю или инвестору',
      'Решаем, в какой раздел добавить новую фичу',
      'Пишем онбординг или обучающие материалы',
    ],
    rule: [
      'При добавлении фичи определяем её фазу: Сбор / Картина / Осмысление / Договорённости / Исполнение',
      'В админке отражаем циклы как горизонтальную карту',
      'Результаты Исполнения возвращаются в Сбор как новые факты — петля замыкается',
    ],
    examples: [
      { where: 'Админка → вкладка «Циклы»', description: 'Карта 5 фаз с привязкой хабов', ref: 'src/data/projectV2/lifeCycles.ts' },
      { where: 'Лендинг', description: 'Блок WelcomeFamilyOS с 5 карточками-фазами', ref: 'src/components/welcome/WelcomeFamilyOS.tsx' },
      { where: 'Инструкции', description: 'Описание 5 фаз в первом разделе', ref: 'src/components/instructions/sectionsData.ts' },
    ],
    status: 'active',
    icon: 'RefreshCcw',
    accent: 'emerald',
    relatedIds: ['family-os-positioning'],
  },
  {
    id: 'meaning-layer',
    category: 'concept',
    title: 'Смысловой слой как дифференциатор',
    summary: 'Семейный код, Мастерская жизни, Зеркало родителя — наш редкий moat',
    description:
      'Большинство приложений конкурируют в утилитарном слое (задачи, бюджет). Наш дифференциатор — смысловой слой: пространство договорённостей, рефлексии и осмысления. Его сложно скопировать, потому что он требует продуктовой смелости.',
    when: [
      'Расставляем приоритеты в развитии',
      'Делаем маркетинг и продажи',
      'Презентуем продукт инвесторам',
    ],
    rule: [
      'В маркетинге показываем смысловой слой как первый дифференциатор',
      'Не «прячем» Семейный код / Мастерскую жизни за утилитарными разделами',
      'Защищаем рефлексивные модули от превращения в «ещё один трекер»',
    ],
    examples: [
      { where: 'Лендинг WelcomeFamilyOS', description: 'Плашка «Смысловой слой»', ref: 'src/components/welcome/WelcomeFamilyOS.tsx' },
      { where: 'InvestorDeck slide 3', description: 'Решение: смысловой слой первой строкой', ref: 'src/components/investor-deck/slidesData.ts' },
    ],
    status: 'active',
    icon: 'Heart',
    accent: 'rose',
    relatedIds: ['family-os-positioning'],
  },

  // ═══════════ АРХИТЕКТУРА ═══════════
  {
    id: 'entity-canon',
    category: 'architecture',
    title: 'Канон сущностей',
    summary: 'У каждого объекта меню/хаба есть один из 7 канонических типов',
    description:
      'Чтобы продукт был предсказуем, фиксируем тип каждой сущности: hub / section / overview / hero-ai / shortcut / content / system. Поле kind в RealRow — опциональное (выводится из status), но рекомендуется явно указывать для важных случаев.',
    when: [
      'Добавляем новый раздел в Sidebar или хаб',
      'Создаём новую страницу',
      'Описываем структуру в asIsReality.ts',
    ],
    rule: [
      'Определяем kind: hub | section | overview | hero-ai | shortcut | content | system',
      'Для шорткатов на чужие хабы — status: linked (не cross-hub)',
      'Для AI-блоков на странице — kind: hero-ai + modality: ai',
    ],
    examples: [
      { where: 'asIsReality.ts', description: 'Тип EntityKind + KIND_META', ref: 'src/data/projectV2/asIsReality.ts' },
      { where: 'Админка панель деталей', description: 'KindBadge у каждого раздела', ref: 'src/components/admin/KindBadge.tsx' },
    ],
    status: 'active',
    icon: 'Boxes',
    accent: 'blue',
    relatedIds: ['modality-badges'],
  },
  {
    id: 'modality-badges',
    category: 'architecture',
    title: 'Модальность раздела',
    summary: '«Жанр» доверия: Право / Госданные / ИИ / Осмысление / Контент / Утилитарная',
    description:
      'В одном продукте живут серьёзные (право, госданные) и мягкие (рефлексия, ИИ) сущности. Модальность маркирует «жанр» доверия в глазах пользователя и помогает не смешивать тональности.',
    when: [
      'Создаём раздел с государственными данными или правовым контекстом',
      'Добавляем ИИ-сценарий или AI-помощника',
      'Делаем модуль рефлексии / осмысления',
    ],
    rule: [
      'Право → Кодекс РФ, юридические тексты',
      'Госданные → Меры поддержки, льготы, госуслуги',
      'ИИ → AI-сценарии, ИИ-помощники',
      'Осмысление → Рефлексия, психология, ценности',
      'Контент → Статьи, блог, справка',
      'Утилитарная (по умолчанию) → бюджет, задачи, меню',
    ],
    examples: [
      { where: 'Госуслуги', description: 'Кодекс РФ → Право, Навигатор мер → Госданные', ref: 'src/pages/StateHub.tsx' },
      { where: 'Развитие', description: 'Психолог / Мастерская / Зеркало → Осмысление', ref: 'src/data/projectV2/asIsReality.ts' },
    ],
    status: 'active',
    icon: 'ShieldCheck',
    accent: 'cyan',
    relatedIds: ['entity-canon'],
  },
  {
    id: 'cross-hub-shortcut',
    category: 'architecture',
    title: 'Кросс-хаб шорткат, а не дубль',
    summary: 'Раздел живёт в одном хабе, в других — намеренный шорткат-карточка',
    description:
      'Когда раздел тематически нужен в нескольких хабах, мы НЕ создаём дубли. Канонический раздел живёт в одном хабе (status: match), а в других — карточка-шорткат (status: linked). В админке такие шорткаты выводятся отдельным блоком, не считаются «требуют внимания».',
    when: [
      'Раздел нужен в нескольких хабах одновременно',
      'Существующий раздел тематически расширяет соседний хаб',
    ],
    rule: [
      'Канонический раздел — status: match в одном хабе',
      'Шорткат — status: linked + crossHubOn: «Имя канонического хаба»',
      'В заметке указываем «намеренный шорткат на …»',
    ],
    examples: [
      { where: 'Зеркало родителя', description: 'Канон в «Семейном коде», шорткат в «Развитии»', ref: 'src/data/projectV2/asIsReality.ts' },
    ],
    status: 'active',
    icon: 'Link',
    accent: 'cyan',
    relatedIds: ['entity-canon'],
  },

  // ═══════════ UX-ПАТТЕРНЫ ═══════════
  {
    id: 'progress-map',
    category: 'ux',
    title: 'ProgressMap — карта пошагового прогресса',
    summary: 'Универсальный компонент: пользователь видит, где он сейчас, что заполнил и что впереди',
    description:
      'Вместо линейного прогресс-бара показываем карту шагов сверху страницы. У каждого шага: статус (done / current / available / locked), иконка, подзаголовок, tooltip для locked. Заполняемая линия между шагами — визуализация общего прогресса. Кликабельные пройденные шаги — возврат назад, заблокированные — нет.',
    when: [
      'Делаем хаб с несколькими тематическими разделами',
      'Создаём мастер заполнения / онбординг',
      'Показываем прогресс реализации плана в админке',
    ],
    rule: [
      'Импортируем ProgressMap из @/components/ui/progress-map',
      'Определяем массив ProgressStep с id, label, hint, icon, status',
      'Для locked шагов добавляем tooltip с условием разблокировки',
      'Используем accent под цвет хаба: violet/emerald/blue/amber/rose',
    ],
    examples: [
      { where: 'Админка / Карта плана', description: '9 шагов архитектурной дочистки', ref: 'src/pages/AdminProjectV2.tsx' },
      { where: 'Развитие', description: '4 слоя-таба: Панорама / Практика / Диалог / Рефлексия', ref: 'src/pages/DevelopmentHub.tsx' },
      { where: 'Дом и быт', description: 'Покупки / Решения / Дом / Транспорт', ref: 'src/pages/HouseholdHub.tsx' },
      { where: 'Дом (модуль)', description: 'Квартира / Коммуналка / Показания / Ремонты', ref: 'src/pages/HomeModule.tsx' },
    ],
    status: 'active',
    icon: 'Compass',
    accent: 'violet',
    relatedIds: ['layered-tabs', 'umbrella-groups'],
  },
  {
    id: 'layered-tabs',
    category: 'ux',
    title: 'Слои-табы внутри хаба',
    summary: 'Сложный хаб разбиваем на 3-5 явных слоёв с акцентным цветом',
    description:
      'Когда внутри хаба смешано несколько разных режимов работы, не сваливаем всё в одну сетку. Делим на слои-табы: каждый со своим цветом-акцентом, описательной плашкой и ProgressMap. Так пользователь не теряется в сложности.',
    when: [
      'Внутри хаба больше 4-5 разных по смыслу разделов',
      'Разделы хаба относятся к разным циклам или разным типам активности',
    ],
    rule: [
      'Чёткий цвет-акцент для каждого слоя (emerald / blue / violet / amber)',
      'Под слоем — описательная плашка с целью слоя',
      'Сверху — ProgressMap с переключением кликом',
    ],
    examples: [
      { where: 'Развитие', description: 'Панорама / Практика / Диалог / Рефлексия', ref: 'src/pages/DevelopmentHub.tsx' },
      { where: 'Дом', description: 'Квартира / Коммуналка / Показания / Ремонты', ref: 'src/pages/HomeModule.tsx' },
    ],
    status: 'active',
    icon: 'LayoutDashboard',
    accent: 'emerald',
    relatedIds: ['progress-map'],
  },
  {
    id: 'umbrella-groups',
    category: 'ux',
    title: 'Зонтики-группы внутри хаба',
    summary: 'Карточки хаба группируем по смысловым зонтикам с заголовком и подзаголовком',
    description:
      'Когда в хабе разные типы карточек (например, бытовые задачи и транспорт), не показываем их одной сеткой. Группируем под зонтиками: «Дом и хозяйство», «Транспорт» и т.п. Каждая группа — мини-секция с заголовком, подзаголовком и описанием.',
    when: [
      'В хабе несколько типов карточек, относящихся к разным темам',
      'Хочется явно показать структуру хаба пользователю',
    ],
    rule: [
      'Группа = заголовок (h2) + подзаголовок + описание + сетка карточек',
      'Цветной border-l-4 для визуального якоря',
      'Иконка-якорь группы в заголовке',
    ],
    examples: [
      { where: 'Дом и быт', description: 'Группы «Дом и хозяйство» и «Транспорт»', ref: 'src/pages/HouseholdHub.tsx' },
      { where: 'Госуслуги', description: 'Группы «Сервисы» (emerald) и «Знание» (blue)', ref: 'src/pages/StateHub.tsx' },
    ],
    status: 'active',
    icon: 'FolderTree',
    accent: 'amber',
    relatedIds: ['layered-tabs'],
  },
  {
    id: 'empty-state-friendly',
    category: 'ux',
    title: 'Дружелюбное пустое состояние',
    summary: 'Вместо пустоты — иконка, объяснение и подсказка для первого действия',
    description:
      'Если в разделе ещё нет данных, показываем мягкую плашку с иконкой и текстом-подсказкой. Не пугаем пользователя, а даём импульс к действию.',
    when: [
      'В разделе нет ни одной записи',
      'Только что создан новый модуль',
    ],
    rule: [
      'rounded-xl border-dashed border-slate-200 bg-slate-50/50',
      'Тематическая иконка в slate-300',
      'Короткий текст с примером первого действия',
    ],
    examples: [
      { where: 'Дом → Коммуналка', description: '«Платежей пока нет. Добавьте первый — например, электричество…»', ref: 'src/pages/HomeModule.tsx' },
      { where: 'Дом → Ремонты', description: '«Задач пока нет. Добавьте первый ремонт…»', ref: 'src/pages/HomeModule.tsx' },
    ],
    status: 'active',
    icon: 'Sparkles',
    accent: 'slate',
  },

  // ═══════════ ДАННЫЕ ═══════════
  {
    id: 'as-is-reality-truth',
    category: 'data',
    title: 'Карта реальности — источник истины',
    summary: 'asIsReality.ts фиксирует фактическое состояние Sidebar и хабов',
    description:
      'Файл asIsReality.ts — это источник истины «как оно сейчас на самом деле». Он сравнивает Sidebar и реальные страницы хабов. Если есть расхождение — оно явно отмечается статусом (rename / menu-only / hub-only / cross-hub).',
    when: [
      'Меняем что-то в Sidebar или на странице хаба',
      'Добавляем новый раздел или переименовываем существующий',
    ],
    rule: [
      'СРАЗУ после изменения — обновить запись в asIsReality.ts',
      'Цель: 0 «требуют внимания» во всех хабах после правки',
      'Hero-AI / linked / hub-root считаются нормой, не багом',
    ],
    antiPatterns: [
      'Менять Sidebar и забывать обновить asIsReality.ts',
      'Создавать дубли вместо linked-шортката',
    ],
    examples: [
      { where: 'asIsReality.ts шапка', description: 'Зафиксированное правило в комментарии', ref: 'src/data/projectV2/asIsReality.ts' },
      { where: 'Админка карта реальности', description: 'Все хабы 0 расхождений', ref: 'src/pages/AdminProjectV2.tsx' },
    ],
    status: 'active',
    icon: 'Database',
    accent: 'cyan',
  },
  {
    id: 'local-storage-first',
    category: 'data',
    title: 'localStorage для MVP-модулей',
    summary: 'Новые модули стартуют с localStorage, БД подключается позже',
    description:
      'Чтобы быстро запустить новый модуль и проверить ценность, начинаем с локального хранения. Это даёт пользователю немедленную пользу, а нам — возможность валидировать UX до инвестиций в backend и БД.',
    when: [
      'Запускаем MVP нового модуля',
      'Хотим проверить интерес пользователя к фиче',
    ],
    rule: [
      'Уникальный STORAGE_KEY на модуль (например, "home-module-data-v1")',
      'try/catch на чтение и запись',
      'useEffect для синхронизации после каждого изменения',
      'Версионирование ключа (v1, v2…) для миграций',
    ],
    examples: [
      { where: 'Дом (модуль)', description: 'Все 4 таба сохраняются в localStorage', ref: 'src/pages/HomeModule.tsx' },
    ],
    status: 'active',
    icon: 'HardDrive',
    accent: 'cyan',
  },

  // ═══════════ ВИЗУАЛЬНЫЙ ЯЗЫК ═══════════
  {
    id: 'lucide-icons',
    category: 'visual',
    title: 'Только Icon-обёртка для иконок',
    summary: 'Никаких прямых импортов из lucide-react — только @/components/ui/icon',
    description:
      'Чтобы избежать ошибок при опечатках в именах иконок, используем компонент-обёртку Icon с возможностью fallback. Это даёт типобезопасность и предсказуемое поведение.',
    when: ['В любом компоненте, где нужна иконка'],
    rule: [
      "import Icon from '@/components/ui/icon';",
      '<Icon name="Home" size={24} />',
      'fallback="CircleAlert" — на случай неизвестного имени',
    ],
    antiPatterns: [
      "import { Home } from 'lucide-react'",
      'Прямое использование <Home /> без обёртки',
    ],
    examples: [
      { where: 'Везде в проекте', description: 'Все иконки через @/components/ui/icon', ref: 'src/components/ui/icon.tsx' },
    ],
    status: 'active',
    icon: 'Wand2',
    accent: 'rose',
  },
  {
    id: 'static-tailwind-classes',
    category: 'visual',
    title: 'Только статические Tailwind-классы',
    summary: 'Динамические классы вида `bg-${color}-500` не работают — Tailwind не видит их',
    description:
      'Tailwind JIT сканирует исходники и находит классы только статически. Динамическая интерполяция в строке ломает стилизацию. Решение: хранить полный класс в данных или использовать lookup-таблицу.',
    when: ['Когда нужны разные цвета для разных вариантов компонента'],
    rule: [
      'Хранить готовый класс в данных: `borderClass: "border-l-4 border-emerald-500"`',
      'Или использовать lookup-объект: `ACCENT_STYLES = { violet: { bg: "bg-violet-600" } }`',
      'Не использовать `bg-${variable}-500`',
    ],
    examples: [
      { where: 'StateHub группы', description: 'containerClass / iconClass в данных группы', ref: 'src/pages/StateHub.tsx' },
      { where: 'ProgressMap ACCENT_STYLES', description: 'Lookup-таблица для 5 акцентов', ref: 'src/components/ui/progress-map.tsx' },
    ],
    status: 'active',
    icon: 'AlertTriangle',
    accent: 'amber',
  },

  // ═══════════ ПРОЦЕСС ═══════════
  {
    id: 'admin-sync-rule',
    category: 'workflow',
    title: 'Синхрон админки после изменений',
    summary: 'Любое изменение продукта → обновление /admin/project-v2 в этом же коммите',
    description:
      'Админка /admin/project-v2 — рабочий инструмент команды. Если она отстаёт от реальности, теряет смысл. Поэтому при любом изменении хабов / разделов / Sidebar — сразу обновляем asIsReality.ts, чтобы счётчики и карта были корректными.',
    when: [
      'Переименовали раздел',
      'Добавили / удалили карточку на хабе',
      'Изменили Sidebar',
    ],
    rule: [
      'Шаг 1: внести изменение в код хаба/Sidebar',
      'Шаг 2: обновить asIsReality.ts',
      'Шаг 3: проверить, что в админке 0 «требуют внимания»',
      'Шаг 4: при необходимости — обновить ROADMAP_STEPS',
    ],
    examples: [
      { where: 'Дом и быт переименование', description: 'Sidebar + HouseholdHub + asIsReality синхронно', ref: 'src/data/projectV2/asIsReality.ts' },
      { where: 'Госуслуги дочистка', description: 'StateHub + asIsReality модальность', ref: 'src/data/projectV2/asIsReality.ts' },
    ],
    status: 'active',
    icon: 'GitMerge',
    accent: 'amber',
    relatedIds: ['as-is-reality-truth'],
  },
  {
    id: 'non-breaking-changes',
    category: 'workflow',
    title: 'Изменения только дополняющие, не ломающие',
    summary: 'Новые поля — опциональные, новые типы — расширения, существующее работает как раньше',
    description:
      'При расширении системы (новые типы, новые поля) делаем их опциональными и обратно совместимыми. Старый код продолжает работать. Используем fallback-функции там, где нужно вывести значение из старых полей.',
    when: [
      'Расширяем тип данных (RealRow, Section и т.п.)',
      'Добавляем новый канон или категорию',
    ],
    rule: [
      'Новые поля — опциональные (`field?: Type`)',
      'Расширения enum — не удаляем старые значения',
      'Если поле опциональное — пишем fallback-функцию (resolveEntityKind)',
    ],
    examples: [
      { where: 'EntityKind', description: 'Поле kind опциональное + resolveEntityKind fallback', ref: 'src/data/projectV2/asIsReality.ts' },
      { where: 'Modality', description: 'Опциональное поле modality, бейдж не показывается без значения', ref: 'src/data/projectV2/asIsReality.ts' },
    ],
    status: 'active',
    icon: 'ShieldCheck',
    accent: 'emerald',
  },
  {
    id: 'new-hub-checklist',
    category: 'workflow',
    title: 'Чеклист нового хаба',
    summary: 'При создании нового хаба обязательно проходим этот список',
    description:
      'Чтобы новый хаб соответствовал всем уже принятым правилам, при его создании сверяемся с этим чеклистом. Помогает не забыть актуализацию админки, SEO, мета и инструкции.',
    when: ['Создаём новый верхнеуровневый хаб'],
    rule: [
      '1. Создать страницу /pages/HubName.tsx с SectionHero и SEOHead',
      '2. Добавить ProgressMap, если есть несколько разделов/слоёв',
      '3. Использовать зонтики или табы при сложности больше 4 карточек',
      '4. Проставить modality для всех ключевых карточек',
      '5. Добавить запись в asIsReality.ts (REAL_STRUCTURE)',
      '6. Добавить в Sidebar и при необходимости — в GlobalBottomBar',
      '7. Добавить маршрут в App.tsx',
      '8. Обновить sectionsData.ts (инструкции) с описанием хаба',
      '9. Проверить /admin/project-v2 → 0 «требуют внимания»',
      '10. Обновить SEO в SEOHead.tsx и index.html, если меняется список хабов',
    ],
    examples: [
      { where: 'Модуль «Дом»', description: 'Создан по этому чеклисту', ref: 'src/pages/HomeModule.tsx' },
    ],
    status: 'active',
    icon: 'CheckSquare',
    accent: 'amber',
    relatedIds: ['admin-sync-rule', 'progress-map', 'modality-badges'],
  },
];
