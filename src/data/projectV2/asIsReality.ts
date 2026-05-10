// ─────────────────────────────────────────────────────────────
// РЕАЛЬНАЯ ТЕКУЩАЯ СТРУКТУРА ПРОДУКТА (источник истины «Как есть сейчас»)
//
// Источник A — реальное левое меню (гармошка) → src/components/layout/Sidebar.tsx
// Источник B — реальные страницы хабов → src/pages/*Hub.tsx + Pets.tsx
//
// ⚠ ПРАВИЛО (зафиксировано):
// После любого устранения расхождения между Sidebar и хабом
// СРАЗУ обновить соответствующую запись в этом файле, чтобы
// админка /admin/project-v2 всегда показывала достоверную картину.
// «Требует внимания» = реальные баги. Hero-AI / linked / hub-root = норма.
// ─────────────────────────────────────────────────────────────

export type RealEntryStatus =
  | "match"          // совпадает
  | "rename"         // другое название (требует внимания)
  | "menu-only"      // только в меню (требует внимания)
  | "hub-only"       // только на хабе (требует внимания)
  | "cross-hub"      // живёт в одном хабе меню, но показан на другом хабе (требует внимания)
  | "linked"         // намеренная карточка-шорткат на чужой раздел (норма)
  | "hero-ai"        // hero / AI-блок (норма)
  | "hub-root";      // корень хаба / точка входа (норма)

export type RealNodeType = "hub" | "service" | "content" | "in-dev";

// ─────────────────────────────────────────────────────────────
// КАНОН СУЩНОСТЕЙ (что вообще существует в продукте)
// Каждый объект меню/хаба может иметь один из этих типов.
// Поле kind у RealRow — опциональное: если не задано,
// тип выводится из status (для обратной совместимости).
// ─────────────────────────────────────────────────────────────
export type EntityKind =
  | "hub"        // верхнеуровневый хаб (раздел меню первого уровня)
  | "section"    // обычный внутренний раздел (рабочая страница)
  | "overview"   // обзорная карточка / точка входа = сама страница хаба
  | "hero-ai"    // hero / AI-блок на странице хаба (намеренная фича)
  | "shortcut"   // намеренная карточка-шорткат на чужой раздел
  | "content"    // контентная страница (статьи, лента, справка)
  | "system";    // системная страница (настройки, уведомления, дашборд, реф-программа)

// ─────────────────────────────────────────────────────────────
// МОДАЛЬНОСТЬ (какого «жанра» этот раздел в глазах пользователя)
// Помогает удерживать доверие в продукте, где рядом живут
// серьёзные (право, госданные) и мягкие (рефлексия, ИИ) сущности.
// ─────────────────────────────────────────────────────────────
export type Modality =
  | "right"       // право, юридический контекст (Кодекс РФ и т.п.)
  | "gov-data"    // государственные данные / меры поддержки
  | "ai"          // ИИ-помощник, AI-сценарий
  | "reflection"  // пространство осмысления и осмысленных решений
  | "content"     // редакционный контент / справка / блог
  | "utility";    // повседневная утилитарная функция (бюджет, задачи, меню)

export interface RealRow {
  /** Что в левом меню (если есть) */
  menu: string | null;
  /** Что на странице хаба (если есть) */
  hub: string | null;
  /** Статус сопоставления */
  status: RealEntryStatus;
  /** Канонический тип сущности (опционально; если не задан — выводится из status) */
  kind?: EntityKind;
  /** Модальность раздела (опционально; помогает маркировать «жанр» доверия) */
  modality?: Modality;
  /** Кросс-хаб: пункт также показан на другом хабе */
  crossHubOn?: string;
  /** Заметка */
  note?: string;
}

export interface RealHub {
  id: string;
  type: RealNodeType;
  /** Название в левом меню */
  menuLabel: string;
  /** Название страницы хаба (если отличается — показываем оба) */
  hubLabel?: string;
  icon: string;
  color: string; // tailwind gradient
  /** Сопоставление пункт-в-пункт */
  rows: RealRow[];
  /** Подсказка/описание для сервисных и контентных страниц */
  description?: string;
  /** Внутренние вкладки/фильтры (для сервисных и контентных страниц) */
  tabs?: string[];
  /** Подпункт в меню (для контентных страниц с одним подпунктом) */
  menuChild?: string;
  /** Связка с архитектурным хабом из HUBS_AS_IS (для бейджей будущих ролей) */
  archHubId?: string;
}

// ─────────────────────────────────────────────────────────────
// Полный список верхнеуровневых разделов в реальном порядке меню
// ─────────────────────────────────────────────────────────────
export const REAL_STRUCTURE: RealHub[] = [
  // ───────── СЕРВИСНЫЕ СТРАНИЦЫ ─────────
  {
    id: "dashboard",
    type: "service",
    menuLabel: "Дашборд",
    icon: "LayoutDashboard",
    color: "from-slate-400 to-slate-600",
    description: "Сервисная страница: дашборд/обзор семьи",
    rows: [],
  },
  {
    id: "notifications",
    type: "service",
    menuLabel: "Уведомления",
    icon: "Bell",
    color: "from-rose-400 to-rose-600",
    description: "Сервисная страница: вкладки уведомлений",
    tabs: ["Все", "Лекарства", "Календарь", "Задачи", "Питание", "Покупки"],
    rows: [],
  },
  {
    id: "blog",
    type: "content",
    menuLabel: "Блог",
    icon: "BookOpen",
    color: "from-pink-400 to-pink-600",
    description: "Контентная страница: лента + категории",
    tabs: [
      "Психология семьи",
      "Дети и воспитание",
      "Отношения в паре",
      "Здоровье и питание",
      "Финансы семьи",
      "Досуг и традиции",
      "Образование",
      "Безопасность",
    ],
    rows: [],
  },
  {
    id: "referral",
    type: "service",
    menuLabel: "Реферальная программа",
    icon: "Gift",
    color: "from-orange-400 to-orange-600",
    description: "Сервисная страница: реф-код, приглашения, бонусы",
    rows: [],
  },

  // ───────── ХАБЫ (в порядке левого меню) ─────────
  {
    id: "family",
    type: "hub",
    menuLabel: "Семья",
    icon: "Users",
    color: "from-blue-400 to-indigo-500",
    archHubId: "family",
    rows: [
      { menu: null, hub: "ИИ-Воспитатель", status: "hero-ai", modality: "ai", note: "AI-блок на странице раздела «Дети»" },
      { menu: "Профили семьи", hub: "Профили семьи", status: "match" },
      { menu: "Семейное дерево", hub: "Семейное дерево", status: "match", note: "порядок отличается" },
      { menu: "Дети", hub: "Дети", status: "match", note: "порядок отличается" },
      { menu: "Семейный маячок", hub: "Семейный маячок", status: "match" },
      { menu: "Чат семьи", hub: "Чат семьи", status: "match" },
    ],
  },
  {
    id: "health",
    type: "hub",
    menuLabel: "Здоровье",
    icon: "HeartPulse",
    color: "from-red-400 to-rose-500",
    archHubId: "health",
    rows: [
      { menu: null, hub: "ИИ-Доктор и Фитнес-тренер", status: "hero-ai", modality: "ai" },
      { menu: "Здоровье семьи", hub: "Здоровье семьи", status: "match" },
    ],
  },
  {
    id: "nutrition",
    type: "hub",
    menuLabel: "Питание",
    icon: "Apple",
    color: "from-green-400 to-emerald-500",
    archHubId: "nutrition",
    rows: [
      { menu: null, hub: "ИИ-Диетолог", status: "hero-ai", modality: "ai" },
      { menu: "ИИ-Диета по данным",   hub: "ИИ-Диета по данным",   status: "match", modality: "ai" },
      { menu: "Готовые режимы питания", hub: "Готовые режимы питания", status: "match", modality: "utility" },
      { menu: "Рецепт из продуктов",  hub: "Рецепт из продуктов",  status: "match", modality: "ai" },
      { menu: "Прогресс диеты",       hub: "Прогресс диеты",       status: "match", modality: "utility" },
      { menu: "Счётчик БЖУ",          hub: "Счётчик БЖУ",          status: "match", modality: "utility" },
      { menu: "Меню на неделю",       hub: "Меню на неделю",       status: "match", modality: "utility" },
      { menu: "Рецепты",              hub: "Рецепты",              status: "match", modality: "content" },
      { menu: null, hub: "ИИ-Повар",  status: "hero-ai", modality: "ai", note: "AI-блок на странице «Рецепты»" },
    ],
  },
  {
    id: "values",
    type: "hub",
    menuLabel: "Ценности и культура",
    hubLabel: "Ценности и культура",
    icon: "Heart",
    color: "from-pink-400 to-rose-500",
    archHubId: "values",
    rows: [
      { menu: "Ценности семьи",      hub: "Ценности семьи",      status: "match", modality: "reflection" },
      { menu: "Вера",                hub: "Вера",                status: "match", modality: "reflection" },
      { menu: "Традиции и культура", hub: "Традиции и культура", status: "match", modality: "reflection" },
      { menu: "Мудрость народа",     hub: "Мудрость народа",     status: "match", modality: "content"    },
      { menu: "Правила дома",        hub: "Правила дома",        status: "match", modality: "reflection" },
    ],
  },
  {
    id: "planning",
    type: "hub",
    menuLabel: "Планирование",
    icon: "Target",
    color: "from-violet-400 to-purple-500",
    archHubId: "planning",
    rows: [
      { menu: null, hub: "ИИ-Организатор", status: "hero-ai", modality: "ai" },
      { menu: "Цели семьи", hub: "Цели семьи", status: "match" },
      { menu: "Задачи", hub: "Задачи", status: "match" },
      { menu: "Календарь", hub: "Календарь", status: "match" },
      { menu: "План покупок", hub: "План покупок", status: "match" },
      { menu: "Аналитика", hub: "Аналитика", status: "match" },
    ],
  },
  {
    id: "finance",
    type: "hub",
    menuLabel: "Финансы",
    icon: "Wallet",
    color: "from-amber-400 to-orange-500",
    archHubId: "finance",
    rows: [
      { menu: null, hub: "ИИ-Финконсультант", status: "hero-ai", modality: "ai", note: "кастомный AI-диалог в шапке хаба Финансы" },
      { menu: "Финансовый пульс", hub: "Финансовый пульс", status: "match" },
      { menu: "Стратегия погашения", hub: "Стратегия погашения", status: "match" },
      { menu: "Кэш-флоу прогноз", hub: "Кэш-флоу прогноз", status: "match" },
      { menu: "Бюджет", hub: "Бюджет", status: "match" },
      { menu: "Счета и карты", hub: "Счета и карты", status: "match" },
      { menu: "Кредиты и долги", hub: "Кредиты и долги", status: "match" },
      { menu: "Финансовые цели", hub: "Финансовые цели", status: "match" },
      { menu: "Финансовая грамотность", hub: "Финансовая грамотность", status: "match" },
      { menu: "Имущество", hub: "Имущество", status: "match" },
      { menu: "Скидочные карты", hub: "Скидочные карты", status: "match" },
      { menu: "Антимошенник", hub: "Антимошенник", status: "match" },
      { menu: "Кошелёк сервиса", hub: "Кошелёк сервиса", status: "match" },
    ],
  },
  {
    id: "household",
    type: "hub",
    menuLabel: "Дом и быт",
    hubLabel: "Дом и быт",
    icon: "Home",
    color: "from-orange-400 to-red-500",
    archHubId: "household",
    rows: [
      { menu: "Список покупок", hub: "Список покупок", status: "match",   modality: "utility" },
      { menu: "Голосования",    hub: "Голосования",    status: "match",   modality: "utility" },
      { menu: "Дом",            hub: "Дом",            status: "match",   modality: "utility", note: "квартира, коммуналка, показания счётчиков, ремонты (страница /home-hub)" },
      { menu: "Гараж",          hub: "Гараж",          status: "match",   modality: "utility", note: "на хабе сгруппирован под зонтиком «Транспорт»" },
      { menu: null,             hub: "ИИ-Автомеханик", status: "hero-ai", modality: "ai", note: "AI-блок на странице «Гараж»" },
    ],
  },
  {
    id: "leisure",
    type: "hub",
    menuLabel: "Путешествия",
    hubLabel: "Путешествия и досуг",
    icon: "Plane",
    color: "from-cyan-400 to-blue-500",
    archHubId: "leisure",
    rows: [
      { menu: "Путешествия", hub: "Путешествия", status: "match" },
      { menu: null, hub: "ИИ-Тревел-планер", status: "hero-ai", modality: "ai", note: "AI-блок на странице «Путешествия»" },
      { menu: "Досуг", hub: "Досуг", status: "match" },
      { menu: "Праздники", hub: "Праздники", status: "match" },
      { menu: null, hub: "ИИ-Организатор праздников", status: "hero-ai", modality: "ai", note: "AI-блок на странице «Праздники»" },
    ],
  },
  {
    id: "development",
    type: "hub",
    menuLabel: "Развитие",
    icon: "Brain",
    color: "from-indigo-400 to-violet-500",
    archHubId: "development",
    rows: [
      { menu: "Портфолио развития",  hub: "Портфолио развития",  status: "match", modality: "utility",    note: "слой «Панорама»" },
      { menu: "Развитие семьи",      hub: "Развитие семьи",      status: "match", modality: "reflection", note: "слой «Практика»" },
      { menu: "Мастерская жизни",    hub: "Мастерская жизни",    status: "match", modality: "reflection", note: "слой «Практика»" },
      { menu: "Семейный психолог",   hub: "Семейный психолог",   status: "match", modality: "reflection", note: "слой «Диалог»" },
      { menu: null,                  hub: "ИИ-Психолог",         status: "hero-ai", modality: "ai",       note: "AI-блок на странице «Семейный психолог», слой «Диалог»" },
      {
        menu: null,
        hub: "Зеркало родителя",
        status: "linked",
        modality: "reflection",
        crossHubOn: "Семейный код",
        note: "слой «Рефлексия» — намеренный шорткат на раздел из «Семейного кода»",
      },
    ],
  },
  {
    id: "family-matrix",
    type: "hub",
    menuLabel: "Семейный код",
    icon: "Sparkles",
    color: "from-fuchsia-400 to-purple-500",
    archHubId: "family-matrix",
    rows: [
      { menu: "Личный код",          hub: "Личный код",          status: "match", modality: "reflection" },
      { menu: "Код пары",            hub: "Код пары",            status: "match", modality: "reflection" },
      { menu: "Код семьи",           hub: "Код семьи",           status: "match", modality: "reflection" },
      { menu: "Ритуалы примирения",  hub: "Ритуалы примирения",  status: "match", modality: "reflection" },
      { menu: "Детский код",         hub: "Детский код",         status: "match", modality: "reflection" },
      { menu: "Имя для малыша",      hub: "Имя для малыша",      status: "match", modality: "reflection" },
      { menu: "Астрология",          hub: "Астрология",          status: "match", modality: "reflection" },
      {
        menu: "Зеркало родителя",
        hub: "Зеркало родителя",
        status: "match",
        modality: "reflection",
        note: "канонический раздел; есть карточка-шорткат в «Развитии»",
      },
    ],
  },
  {
    id: "pets",
    type: "hub",
    menuLabel: "Питомцы",
    icon: "PawPrint",
    color: "from-yellow-400 to-amber-500",
    archHubId: "pets",
    rows: [
      { menu: null, hub: "ИИ-Ветеринар", status: "hero-ai", modality: "ai", note: "AI-блок в шапке хаба Питомцы (рядом со вкладками)" },
      { menu: "ИИ-ветеринар", hub: "ИИ-ветеринар", status: "match", modality: "ai" },
      { menu: "Прививки", hub: "Прививки", status: "match" },
      { menu: "Ветеринар", hub: "Ветеринар", status: "match" },
      { menu: "Лекарства", hub: "Лекарства", status: "match" },
      { menu: "Питание", hub: "Питание", status: "match" },
      { menu: "Груминг", hub: "Груминг", status: "match" },
      { menu: "Активность", hub: "Активность", status: "match" },
      { menu: "Расходы", hub: "Расходы", status: "match" },
      { menu: "Здоровье", hub: "Здоровье", status: "match" },
      { menu: "Вещи", hub: "Вещи", status: "match" },
      { menu: "Обязанности", hub: "Обязанности", status: "match" },
      { menu: "Фото", hub: "Фото", status: "match" },
    ],
  },
  {
    id: "family-state",
    type: "hub",
    menuLabel: "Госуслуги",
    hubLabel: "Семья и государство",
    icon: "Landmark",
    color: "from-blue-500 to-sky-600",
    archHubId: "family-state",
    rows: [
      { menu: "Навигатор мер поддержки", hub: "Навигатор мер поддержки", status: "match", modality: "gov-data" },
      { menu: "Что такое семья",         hub: "Что такое семья",         status: "match", modality: "content"  },
      { menu: "Семейный кодекс РФ",      hub: "Семейный кодекс РФ",      status: "match", modality: "right"    },
      { menu: "Господдержка семей",      hub: "Господдержка семей",      status: "match", modality: "gov-data" },
      { menu: "Семейная политика",       hub: "Семейная политика",       status: "match", modality: "content"  },
      { menu: "Новости и инициативы",    hub: "Новости и инициативы",    status: "match", modality: "content"  },
    ],
  },

  // ───────── КОНТЕНТ / ПРОЧЕЕ ─────────
  {
    id: "articles",
    type: "content",
    menuLabel: "Полезные статьи",
    icon: "FileText",
    color: "from-teal-400 to-cyan-500",
    description: "Контентная страница: лента статей с фильтрами",
    menuChild: "Все статьи",
    tabs: [
      "Семейный бюджет",
      "Воспитание",
      "Отношения",
      "Здоровье",
      "Планирование",
      "Питание",
    ],
    rows: [],
  },
  {
    id: "in-dev",
    type: "in-dev",
    menuLabel: "В разработке",
    icon: "Wrench",
    color: "from-gray-400 to-slate-500",
    description: "Служебный раздел / placeholder / без фактической структуры",
    rows: [],
  },

  // ───────── НАСТРОЙКИ (отдельно, обычно внизу/в профиле) ─────────
  {
    id: "settings",
    type: "service",
    menuLabel: "Настройки",
    icon: "Settings",
    color: "from-zinc-400 to-zinc-600",
    description: "Сервисная страница с разделами настроек",
    tabs: [
      "Семья",
      "Уведомления",
      "Кошелёк",
      "Внешний вид",
      "Аккаунт",
      "Ассистенты",
    ],
    rows: [],
  },
];

// Фильтруем дубль household-pets (он был оставлен ошибкой выше при копировании)
export const REAL_HUBS: RealHub[] = REAL_STRUCTURE.filter(
  (h) => h.id !== "household-pets"
);

// ─────────────────────────────────────────────────────────────
// Метаданные статусов
// ─────────────────────────────────────────────────────────────
export const STATUS_META: Record<
  RealEntryStatus,
  { label: string; cls: string; dot: string }
> = {
  match:      { label: "Совпадает",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  rename:     { label: "Другое название",  cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  "menu-only":{ label: "Только в меню",    cls: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-500" },
  "hub-only": { label: "Только на хабе",   cls: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-500" },
  "cross-hub":{ label: "Кросс-хаб",        cls: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
  linked:     { label: "Связка-шорткат",   cls: "bg-sky-50 text-sky-700 border-sky-200",             dot: "bg-sky-500" },
  "hero-ai":  { label: "ИИ-блок",          cls: "bg-violet-50 text-violet-700 border-violet-200",    dot: "bg-violet-500" },
  "hub-root": { label: "Точка входа",      cls: "bg-slate-50 text-slate-600 border-slate-200",       dot: "bg-slate-400" },
};

export const TYPE_META: Record<
  RealNodeType,
  { label: string; cls: string }
> = {
  hub:     { label: "Хаб",                cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  service: { label: "Сервисная страница", cls: "bg-zinc-50 text-zinc-700 border-zinc-200" },
  content: { label: "Контентная страница",cls: "bg-teal-50 text-teal-700 border-teal-200" },
  "in-dev":{ label: "В разработке",       cls: "bg-gray-50 text-gray-500 border-gray-200" },
};

// ─────────────────────────────────────────────────────────────
// Метаданные канона сущностей
// ─────────────────────────────────────────────────────────────
export const KIND_META: Record<
  EntityKind,
  { label: string; cls: string; icon: string; description: string }
> = {
  hub:      { label: "Хаб",            cls: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "LayoutGrid",  description: "Верхнеуровневый раздел меню" },
  section:  { label: "Раздел",         cls: "bg-slate-50 text-slate-700 border-slate-200",   icon: "FileText",    description: "Обычная рабочая страница внутри хаба" },
  overview: { label: "Точка входа",    cls: "bg-stone-50 text-stone-600 border-stone-200",   icon: "Home",        description: "Обзорная страница самого хаба (корень)" },
  "hero-ai":{ label: "ИИ-блок",        cls: "bg-violet-50 text-violet-700 border-violet-200", icon: "Sparkles",   description: "Hero/AI-секция на странице хаба" },
  shortcut: { label: "Шорткат",        cls: "bg-sky-50 text-sky-700 border-sky-200",         icon: "Link",        description: "Намеренная карточка-ссылка на чужой раздел" },
  content:  { label: "Контент",        cls: "bg-teal-50 text-teal-700 border-teal-200",      icon: "BookOpen",    description: "Редакционный или справочный контент" },
  system:   { label: "Системная",      cls: "bg-zinc-50 text-zinc-700 border-zinc-200",      icon: "Settings",    description: "Системная страница (настройки, уведомления, дашборд)" },
};

// ─────────────────────────────────────────────────────────────
// Метаданные модальности
// ─────────────────────────────────────────────────────────────
export const MODALITY_META: Record<
  Modality,
  { label: string; cls: string; icon: string; description: string }
> = {
  right:      { label: "Право",        cls: "bg-blue-50 text-blue-700 border-blue-200",       icon: "Scale",        description: "Юридический контекст: законы, кодексы, права" },
  "gov-data": { label: "Госданные",    cls: "bg-cyan-50 text-cyan-700 border-cyan-200",       icon: "Landmark",     description: "Государственные сервисы, меры поддержки, льготы" },
  ai:         { label: "ИИ-помощник",  cls: "bg-violet-50 text-violet-700 border-violet-200", icon: "Sparkles",     description: "ИИ-сценарий или AI-ассистент" },
  reflection: { label: "Осмысление",   cls: "bg-amber-50 text-amber-700 border-amber-200",    icon: "Lightbulb",    description: "Пространство тихого размышления и осознанных решений" },
  content:    { label: "Контент",      cls: "bg-teal-50 text-teal-700 border-teal-200",       icon: "BookOpen",     description: "Редакционный контент, статьи, справка" },
  utility:    { label: "Утилитарная",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "Wrench",    description: "Повседневная утилитарная функция: бюджет, задачи, меню" },
};

/**
 * Вывод канонического типа сущности из status, если kind не задан явно.
 * Это даёт обратную совместимость со всеми существующими записями.
 */
export function resolveEntityKind(row: RealRow, hubKind?: RealNodeType): EntityKind {
  if (row.kind) return row.kind;
  switch (row.status) {
    case "hero-ai":   return "hero-ai";
    case "linked":    return "shortcut";
    case "hub-root":  return "overview";
    case "cross-hub": return "shortcut";
    default:
      // service/content на уровне хаба → system/content
      if (hubKind === "service") return "system";
      if (hubKind === "content") return "content";
      return "section";
  }
}

// ─────────────────────────────────────────────────────────────
// Утилиты подсчёта
//
// Считаются "расхождениями" только реально требующие внимания статусы:
// rename, menu-only, hub-only, cross-hub.
// Нормальные технические статусы НЕ учитываются:
//   • hero-ai  — намеренный AI/hero-блок на странице (ИИ-помощник)
//   • hub-root — пункт меню = сама страница хаба (точка входа)
// ─────────────────────────────────────────────────────────────
const NORMAL_STATUSES = new Set<RealEntryStatus>(["match", "hero-ai", "hub-root", "linked"]);

export interface HubCounters {
  menu: number;
  hub: number;
  diff: number;
  aiBlocks: number;
  hasNameMismatch: boolean;
}

export function countHub(h: RealHub): HubCounters {
  const menu = h.rows.filter((r) => r.menu !== null).length;
  const hub = h.rows.filter((r) => r.hub !== null).length;
  const diff = h.rows.filter((r) => !NORMAL_STATUSES.has(r.status)).length;
  const aiBlocks = h.rows.filter((r) => r.status === "hero-ai").length;
  const hasNameMismatch = !!h.hubLabel && h.hubLabel !== h.menuLabel;
  return {
    menu,
    hub,
    diff: diff + (hasNameMismatch ? 1 : 0),
    aiBlocks,
    hasNameMismatch,
  };
}

export function getDiscrepancies(h: RealHub): RealRow[] {
  return h.rows.filter((r) => !NORMAL_STATUSES.has(r.status));
}

export function getAiBlocks(h: RealHub): RealRow[] {
  return h.rows.filter((r) => r.status === "hero-ai");
}