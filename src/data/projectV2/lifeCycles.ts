// ─────────────────────────────────────────────────────────────
// 5 ЖИЗНЕННЫХ ЦИКЛОВ СЕМЬИ
//
// Это смысловая модель продукта «Наша семья» поверх хабов.
// Хабы и разделы группируются по тому, в какой фазе жизни семьи
// они работают: от сбора фактов до исполнения и обратной связи.
//
// Цель — единый язык для команды:
// «куда мы добавляем фичу», «зачем существует раздел», «где
// ценность для пользователя». Рассматривается как горизонтальный
// разрез поверх вертикальных доменов (Семья / Финансы / Здоровье…).
// ─────────────────────────────────────────────────────────────

export type LifeCycleId =
  | "collect"   // Сбор и фиксация
  | "panorama"  // Панорама и обзор
  | "reflect"   // Осмысление
  | "agree"     // Договорённости и кодексы
  | "execute";  // Исполнение

export interface CycleHubRef {
  hubId: string;       // id из REAL_STRUCTURE (asIsReality)
  label: string;       // как показывать
  role: string;        // роль раздела в этом цикле (одно предложение)
  primary?: boolean;   // основной житель цикла, а не вспомогательный
}

export interface LifeCycle {
  id: LifeCycleId;
  order: number;
  title: string;
  subtitle: string;
  question: string;     // главный вопрос пользователя на этой фазе
  description: string;  // 2-3 предложения о смысле фазы
  icon: string;
  color: string;        // tailwind from-… to-…
  bg: string;           // мягкая заливка карточки
  border: string;
  textAccent: string;
  hubs: CycleHubRef[];  // что в продукте уже работает на эту фазу
  nextCycle: LifeCycleId | null;
  nextHint: string;     // как фаза переходит в следующую
}

export const LIFE_CYCLES: LifeCycle[] = [
  {
    id: "collect",
    order: 1,
    title: "Сбор и фиксация",
    subtitle: "Что есть в нашей семье",
    question: "Кто мы, что у нас есть, что с нами происходит?",
    description:
      "Семья накапливает факты о себе: состав, здоровье, питание, деньги, имущество, питомцы, государственные права. Это сырьё для всего продукта.",
    icon: "Database",
    color: "from-slate-400 to-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    textAccent: "text-slate-700",
    nextCycle: "panorama",
    nextHint: "Накопленные факты собираются в общую картину",
    hubs: [
      { hubId: "family",     label: "Семья",      role: "состав, профили, дети, дерево, маячок", primary: true },
      { hubId: "health",     label: "Здоровье",   role: "показатели, диагнозы, прививки, врачи", primary: true },
      { hubId: "nutrition",  label: "Питание",    role: "БЖУ, рационы, продукты, рецепты", primary: true },
      { hubId: "finance",    label: "Финансы",    role: "счета, долги, имущество, кэш-флоу", primary: true },
      { hubId: "household",  label: "Быт",        role: "покупки, гараж, бытовые сущности", primary: true },
      { hubId: "pets",       label: "Питомцы",    role: "карточки животных и их данные", primary: true },
      { hubId: "gov",        label: "Госуслуги",  role: "права, документы, меры поддержки" },
    ],
  },
  {
    id: "panorama",
    order: 2,
    title: "Панорама и обзор",
    subtitle: "Какая у нас сейчас картина",
    question: "Что у нас в порядке, а что требует внимания?",
    description:
      "Из сырых данных рождаются обзоры, дашборды, прогнозы и портфолио. Семья видит себя целиком, а не по кусочкам.",
    icon: "LayoutDashboard",
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    textAccent: "text-emerald-700",
    nextCycle: "reflect",
    nextHint: "Картина запускает осмысление и выводы",
    hubs: [
      { hubId: "dashboard",   label: "Дашборд",            role: "общий обзор семьи и внимания", primary: true },
      { hubId: "finance",     label: "Финансы",            role: "финансовый пульс, кэш-флоу прогноз", primary: true },
      { hubId: "development", label: "Развитие",           role: "портфолио развития семьи", primary: true },
      { hubId: "planning",    label: "Планирование",       role: "аналитика по целям и задачам" },
      { hubId: "nutrition",   label: "Питание",            role: "прогресс диеты, динамика" },
      { hubId: "notifications", label: "Уведомления",      role: "сводка событий по всем доменам" },
    ],
  },
  {
    id: "reflect",
    order: 3,
    title: "Осмысление",
    subtitle: "Что это для нас значит",
    question: "Что мы об этом думаем? Что важно? Что хотим менять?",
    description:
      "Картина превращается в выводы. Здесь работает ИИ-психолог, мастерская жизни, зеркало родителя — пространство тихого размышления, разговора и инсайтов.",
    icon: "Lightbulb",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textAccent: "text-amber-700",
    nextCycle: "agree",
    nextHint: "Инсайты закрепляются как правила и принципы",
    hubs: [
      { hubId: "development",   label: "Развитие",      role: "Семейный психолог, Мастерская жизни, Зеркало родителя", primary: true },
      { hubId: "values",        label: "Ценности",      role: "осмысление ценностей, традиций, веры", primary: true },
      { hubId: "family-matrix", label: "Семейный код",  role: "Личный/Парный/Детский код как пространство выводов" },
      { hubId: "blog",          label: "Блог",          role: "контент для размышления и расширения горизонта" },
    ],
  },
  {
    id: "agree",
    order: 4,
    title: "Договорённости и кодексы",
    subtitle: "Что мы для себя решили",
    question: "Какие у нас правила? О чём мы договорились?",
    description:
      "Выводы фиксируются как кодексы и принципы: личные, парные, семейные, детские. Это слой, который превращает мысли в устойчивую субъектность семьи.",
    icon: "ScrollText",
    color: "from-fuchsia-400 to-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    textAccent: "text-purple-700",
    nextCycle: "execute",
    nextHint: "Договорённости отдаются в исполнение и проверку временем",
    hubs: [
      { hubId: "family-matrix", label: "Семейный код",  role: "Личный/Код пары/Код семьи/Детский код, ритуалы примирения", primary: true },
      { hubId: "values",        label: "Ценности",      role: "Правила дома, традиции как закреплённые договорённости", primary: true },
      { hubId: "household",     label: "Быт",           role: "Голосования как механика семейных решений" },
    ],
  },
  {
    id: "execute",
    order: 5,
    title: "Исполнение",
    subtitle: "Что мы с этим делаем",
    question: "Как мы это сделаем? Когда? Кто?",
    description:
      "Решения превращаются в задачи, цели, календарные события, покупки и поездки. Результаты возвращаются обратно в Сбор — цикл замыкается.",
    icon: "Target",
    color: "from-blue-400 to-violet-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textAccent: "text-blue-700",
    nextCycle: null,
    nextHint: "Результаты исполнения становятся новыми фактами в Сборе — цикл замыкается",
    hubs: [
      { hubId: "planning",    label: "Планирование",   role: "цели, задачи, календарь, план покупок", primary: true },
      { hubId: "household",   label: "Быт",            role: "список покупок, голосования (исполнение)" },
      { hubId: "leisure",     label: "Путешествия",    role: "поездки, праздники, досуг как реализация" },
      { hubId: "nutrition",   label: "Питание",        role: "меню на неделю, режимы как ежедневная практика" },
      { hubId: "finance",     label: "Финансы",        role: "стратегия погашения, бюджет в действии" },
      { hubId: "family",      label: "Семья",          role: "Чат семьи как ежедневная коммуникация" },
    ],
  },
];

export function getCycle(id: LifeCycleId): LifeCycle {
  return LIFE_CYCLES.find((c) => c.id === id)!;
}
