// ─────────────────────────────────────────────────────────────
// РЕАЛЬНАЯ ТЕКУЩАЯ СТРУКТУРА ПРОДУКТА (источник истины «Как есть сейчас»)
//
// Источник A — реальное левое меню (гармошка)
// Источник B — реальная страница хаба (карточки + hero/AI блоки)
//
// Этот файл фиксирует расхождения, а не нормализует их.
// ─────────────────────────────────────────────────────────────

export type RealEntryStatus =
  | "match"          // совпадает
  | "rename"         // другое название
  | "menu-only"      // только в меню
  | "hub-only"       // только на хабе
  | "cross-hub"      // живёт в одном хабе меню, но показан на другом хабе
  | "hero-ai"        // hero / AI-блок
  | "hub-root";      // корень хаба / обзор (пункт меню = сама страница хаба)

export type RealNodeType = "hub" | "service" | "content" | "in-dev";

export interface RealRow {
  /** Что в левом меню (если есть) */
  menu: string | null;
  /** Что на странице хаба (если есть) */
  hub: string | null;
  /** Статус сопоставления */
  status: RealEntryStatus;
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
      { menu: null, hub: "ИИ-Воспитатель", status: "hero-ai", note: "AI-блок на странице раздела «Дети»" },
      { menu: "Профили семьи", hub: "Профили семьи", status: "match" },
      { menu: "Семейное дерево", hub: "Семейное дерево", status: "match", note: "порядок отличается" },
      { menu: "Дети", hub: "Дети", status: "match", note: "порядок отличается" },
      { menu: "Семейный маячок", hub: "Семейный маячок", status: "match" },
      { menu: "Чат семьи", hub: null, status: "menu-only" },
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
      { menu: null, hub: "ИИ-Доктор и Фитнес-тренер", status: "hero-ai" },
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
      { menu: null, hub: "ИИ-Диетолог", status: "hero-ai" },
      { menu: "ИИ-Диета по данным", hub: "ИИ-Диета по данным", status: "match" },
      { menu: "Готовые режимы питания", hub: "Готовые режимы питания", status: "match" },
      { menu: "Рецепт из продуктов", hub: "Рецепт из продуктов", status: "match" },
      { menu: "Прогресс диеты", hub: "Прогресс диеты", status: "match" },
      { menu: "Счётчик БЖУ", hub: "Счётчик БЖУ", status: "match" },
      { menu: "Меню на неделю", hub: "Меню на неделю", status: "match" },
      { menu: "Рецепты", hub: "Рецепты", status: "match" },
      { menu: null, hub: "ИИ-Повар", status: "hero-ai", note: "AI-блок на странице «Рецепты»" },
      { menu: null, hub: "Семейный кошелёк", status: "hub-only", note: "карточка-шорткат на /wallet (живёт в Финансах)" },
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
      { menu: "Ценности семьи", hub: "Ценности семьи", status: "match" },
      { menu: "Вера", hub: "Вера", status: "match" },
      { menu: "Традиции и культура", hub: "Традиции и культура", status: "match" },
      { menu: "Мудрость народа", hub: "Мудрость народа", status: "match" },
      { menu: "Правила дома", hub: "Правила дома", status: "match" },
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
      { menu: null, hub: "ИИ-Организатор", status: "hero-ai" },
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
      { menu: null, hub: "ИИ-Финконсультант", status: "hero-ai", note: "кастомный AI-диалог в шапке хаба Финансы" },
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
    menuLabel: "Быт",
    hubLabel: "Быт и хозяйство",
    icon: "Home",
    color: "from-orange-400 to-red-500",
    archHubId: "household",
    rows: [
      { menu: "Список покупок", hub: "Список покупок", status: "match" },
      { menu: "Голосования", hub: "Голосования", status: "match" },
      { menu: "Гараж", hub: "Гараж", status: "match" },
      { menu: null, hub: "ИИ-Автомеханик", status: "hero-ai", note: "AI-блок на странице «Гараж»" },
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
      { menu: null, hub: "ИИ-Тревел-планер", status: "hero-ai", note: "AI-блок на странице «Путешествия»" },
      { menu: "Досуг", hub: "Досуг", status: "match" },
      { menu: "Праздники", hub: "Праздники", status: "match" },
      { menu: null, hub: "ИИ-Организатор праздников", status: "hero-ai", note: "AI-блок на странице «Праздники»" },
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
      { menu: "Портфолио развития", hub: "Портфолио развития", status: "match" },
      { menu: "Развитие семьи", hub: "Развитие семьи", status: "match" },
      { menu: "Семейный психолог", hub: "Семейный психолог", status: "match" },
      { menu: null, hub: "ИИ-Психолог", status: "hero-ai", note: "AI-блок на странице «Семейный психолог»" },
      { menu: "Мастерская жизни", hub: "Мастерская жизни", status: "match" },
      {
        menu: null,
        hub: "Зеркало родителя",
        status: "cross-hub",
        crossHubOn: "Семейный код",
        note: "в меню живёт в хабе «Семейный код», на странице показан и здесь",
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
      { menu: "Личный код", hub: "Личный код", status: "match" },
      { menu: "Код пары", hub: "Код пары", status: "match" },
      { menu: "Код семьи", hub: "Код семьи", status: "match" },
      { menu: "Ритуалы примирения", hub: "Ритуалы примирения", status: "match" },
      { menu: "Детский код", hub: "Детский код", status: "match" },
      { menu: "Имя для малыша", hub: "Имя для малыша", status: "match" },
      { menu: "Астрология", hub: "Астрология", status: "match" },
      {
        menu: "Зеркало родителя",
        hub: "Зеркало родителя",
        status: "cross-hub",
        crossHubOn: "Развитие",
        note: "также показано на хабе «Развитие»",
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
      { menu: null, hub: "ИИ-Ветеринар", status: "hero-ai", note: "AI-блок в шапке хаба Питомцы (рядом со вкладками)" },
      { menu: "ИИ-ветеринар", hub: "ИИ-ветеринар", status: "match" },
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
      { menu: "Навигатор мер поддержки", hub: "Навигатор мер поддержки", status: "match" },
      { menu: "Что такое семья", hub: "Что такое семья", status: "match" },
      { menu: "Семейный кодекс РФ", hub: "Семейный кодекс РФ", status: "match" },
      { menu: "Господдержка семей", hub: "Господдержка семей", status: "match" },
      { menu: "Семейная политика", hub: "Семейная политика", status: "match" },
      { menu: "Новости и инициативы", hub: "Новости и инициативы", status: "match" },
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
  "hero-ai":  { label: "Hero / AI-блок",   cls: "bg-purple-50 text-purple-700 border-purple-200",    dot: "bg-purple-500" },
  "hub-root": { label: "Корень хаба",      cls: "bg-slate-100 text-slate-600 border-slate-200",      dot: "bg-slate-400" },
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
// Утилиты подсчёта
// ─────────────────────────────────────────────────────────────
export interface HubCounters {
  menu: number;
  hub: number;
  diff: number;
  hasNameMismatch: boolean;
}

export function countHub(h: RealHub): HubCounters {
  const menu = h.rows.filter((r) => r.menu !== null).length;
  const hub = h.rows.filter((r) => r.hub !== null).length;
  const diff = h.rows.filter((r) => r.status !== "match").length;
  const hasNameMismatch = !!h.hubLabel && h.hubLabel !== h.menuLabel;
  return { menu, hub, diff: diff + (hasNameMismatch ? 1 : 0), hasNameMismatch };
}

export function getDiscrepancies(h: RealHub): RealRow[] {
  return h.rows.filter((r) => r.status !== "match");
}