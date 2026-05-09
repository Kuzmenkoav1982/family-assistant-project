// Карта сущностей платформы.
// Здесь живут «вещи», которыми оперирует продукт: цели, планы, наблюдения,
// достижения, эмоции, события, правила, договорённости, AI-инсайты и т.д.
// Главная задача — для каждой сущности зафиксировать ОДИН home (где её «дом»).
//
// КАК ЧИТАТЬ:
//   homeSection — рекомендуемый «дом» сущности по принципу one-home-per-entity
//   createdIn — все места, где сущность сейчас может быть СОЗДАНА (фактическое состояние)
//   editedIn — все места, где её редактируют
//   aggregatedIn — где она агрегируется и интерпретируется
//   shownIn — где витрина / summary / deep-link
//
// Если len(createdIn) > 1 — это потенциальный конфликт, кандидат в журнал решений.

import type { PlatformEntity } from './types';

export const ENTITIES: PlatformEntity[] = [
  // ── Семья и люди ──────────────────────────────────────
  {
    id: 'family-member',
    name: 'Член семьи',
    description: 'Человек в составе семьи (взрослый, ребёнок, старший)',
    homeSection: 'profiles',
    createdIn: ['profiles'],
    editedIn: ['profiles'],
    aggregatedIn: ['analytics', 'family-tracker'],
    shownIn: [
      'tree',
      'children',
      'health',
      'portfolio',
      'family-tracker',
      'family-chat',
      'calendar',
      'tasks',
      'goals',
      'family-matrix-personal',
      'family-matrix-family',
    ],
    notes: 'Дом один — profiles. Все остальные разделы используют справочник.',
  },
  {
    id: 'ancestor',
    name: 'Предок',
    description: 'Родственник в родословной (бабушка, дед и далее)',
    homeSection: 'tree',
    createdIn: ['tree'],
    editedIn: ['tree'],
    aggregatedIn: ['tree'],
    shownIn: ['tree'],
  },

  // ── Цели и планы ──────────────────────────────────────
  {
    id: 'goal',
    name: 'Цель',
    description: 'Желаемый результат с критерием успеха и сроком',
    homeSection: 'goals',
    createdIn: ['goals', 'finance-goals', 'life-road'],
    editedIn: ['goals', 'finance-goals'],
    aggregatedIn: ['analytics', 'portfolio'],
    shownIn: ['portfolio', 'life-road', 'analytics'],
    notes:
      'КОНФЛИКТ: цели создаются в 3 разных местах с разными моделями. ' +
      'Решение через триаду: Goals = операционные цели, Finance-goals = деньги, ' +
      'Life-road = жизненные векторы. Нужно проверить что между ними есть мосты.',
  },
  {
    id: 'task',
    name: 'Задача',
    description: 'Конкретное действие с дедлайном и исполнителем',
    homeSection: 'tasks',
    createdIn: ['tasks', 'house-rules', 'meals'],
    editedIn: ['tasks'],
    aggregatedIn: ['analytics'],
    shownIn: ['calendar', 'analytics'],
    notes: 'Задачи могут порождаться из правил дома и меню — это ОК, но дом задачи — tasks.',
  },
  {
    id: 'event',
    name: 'Событие',
    description: 'Запланированное событие с датой и временем',
    homeSection: 'calendar',
    createdIn: ['calendar', 'events', 'health', 'trips'],
    editedIn: ['calendar', 'events', 'health'],
    aggregatedIn: ['calendar'],
    shownIn: ['calendar', 'family-tracker'],
    notes:
      'КОНФЛИКТ: события создаются в 4 местах. Календарь должен быть единым домом, ' +
      'остальные — витринами с deep-link на calendar для редактирования.',
  },
  {
    id: 'development-plan',
    name: 'План развития',
    description: 'Микроплан развития по сфере (например, моторика 0-3 лет)',
    homeSection: 'portfolio',
    createdIn: ['portfolio', 'development'],
    editedIn: ['portfolio', 'development'],
    aggregatedIn: ['portfolio'],
    shownIn: ['portfolio', 'development'],
    notes:
      'КОНФЛИКТ: planный развития есть и в Портфолио, и в разделе Развитие. ' +
      'Гипотеза: Портфолио = микропланы по сферам, Развитие = долгосрочные планы.',
  },
  {
    id: 'life-vector',
    name: 'Жизненный вектор',
    description: 'Длинный смысловой вектор жизни (Мастерская жизни)',
    homeSection: 'life-road',
    createdIn: ['life-road'],
    editedIn: ['life-road'],
    aggregatedIn: ['life-road'],
    shownIn: ['life-road'],
  },

  // ── Наблюдения и оценки ──────────────────────────────
  {
    id: 'observation',
    name: 'Наблюдение / оценка родителя',
    description: 'Субъективная фиксация наблюдения за членом семьи',
    homeSection: 'children',
    createdIn: ['children', 'portfolio'],
    editedIn: ['children', 'portfolio'],
    aggregatedIn: ['portfolio'],
    shownIn: ['portfolio', 'children'],
    notes:
      'КОНФЛИКТ: оценки родителя создаются и в children, и в portfolio. ' +
      'Решение: один home (children как source), portfolio как interpretation.',
  },
  {
    id: 'achievement',
    name: 'Достижение',
    description: 'Награда, грамота, важный момент',
    homeSection: 'children',
    createdIn: ['children', 'portfolio', 'development'],
    editedIn: ['children'],
    aggregatedIn: ['portfolio'],
    shownIn: ['portfolio', 'children', 'development'],
    notes: 'Создаётся в 3 местах. Нужен один дом (children для детей, ?для взрослых) + витрины.',
  },
  {
    id: 'habit',
    name: 'Привычка',
    description: 'Регулярное поведение для отслеживания',
    homeSection: 'development',
    createdIn: ['development', 'portfolio'],
    editedIn: ['development'],
    aggregatedIn: ['portfolio'],
    shownIn: ['portfolio', 'development'],
  },

  // ── Финансовые сущности ──────────────────────────────
  {
    id: 'money-account',
    name: 'Счёт / карта',
    description: 'Банковский счёт или карта',
    homeSection: 'finance-accounts',
    createdIn: ['finance-accounts'],
    editedIn: ['finance-accounts'],
    aggregatedIn: ['finance-analytics'],
    shownIn: ['finance-analytics', 'finance-budget'],
  },
  {
    id: 'expense',
    name: 'Трата',
    description: 'Финансовая операция расхода',
    homeSection: 'finance-budget',
    createdIn: ['finance-budget', 'finance-accounts', 'pets-expenses', 'garage'],
    editedIn: ['finance-budget'],
    aggregatedIn: ['finance-analytics', 'finance-cashflow'],
    shownIn: ['finance-analytics', 'finance-cashflow'],
    notes:
      'Расходы порождаются в нескольких местах (питомцы, машина) — это нормально. ' +
      'Главное: все они агрегируются в finance-analytics через единый формат.',
  },
  {
    id: 'debt',
    name: 'Кредит / долг',
    description: 'Финансовое обязательство',
    homeSection: 'finance-debts',
    createdIn: ['finance-debts'],
    editedIn: ['finance-debts'],
    aggregatedIn: ['finance-strategy', 'finance-analytics', 'finance-cashflow'],
    shownIn: ['finance-strategy', 'finance-analytics'],
  },

  // ── Здоровье ──────────────────────────────────────────
  {
    id: 'medical-record',
    name: 'Медицинская запись',
    description: 'Визит, прививка, анализ, показатель здоровья',
    homeSection: 'health',
    createdIn: ['health', 'nutrition-tracker'],
    editedIn: ['health'],
    aggregatedIn: ['portfolio', 'health'],
    shownIn: ['portfolio', 'children', 'health'],
  },

  // ── Питание ──────────────────────────────────────────
  {
    id: 'recipe',
    name: 'Рецепт',
    description: 'Рецепт блюда',
    homeSection: 'recipes',
    createdIn: ['recipes', 'recipe-products'],
    editedIn: ['recipes'],
    aggregatedIn: ['recipes'],
    shownIn: ['meals', 'recipes'],
  },
  {
    id: 'meal',
    name: 'Приём пищи',
    description: 'Конкретный приём пищи в дне',
    homeSection: 'nutrition-tracker',
    createdIn: ['nutrition-tracker', 'meals'],
    editedIn: ['nutrition-tracker'],
    aggregatedIn: ['nutrition-tracker'],
    shownIn: ['nutrition-tracker', 'meals'],
  },

  // ── Покупки ──────────────────────────────────────────
  {
    id: 'shopping-item',
    name: 'Покупка (товар)',
    description: 'Позиция в списке покупок',
    homeSection: 'shopping',
    createdIn: ['shopping', 'meals', 'purchases'],
    editedIn: ['shopping', 'purchases'],
    aggregatedIn: ['shopping'],
    shownIn: ['shopping'],
    notes:
      'Покупки порождаются из меню и из плана покупок. Решение: ' +
      'shopping — операционный список, purchases — крупные планируемые. Это два разных дома.',
  },

  // ── Договорённости и правила ─────────────────────────
  {
    id: 'rule',
    name: 'Правило / договорённость',
    description: 'Семейная договорённость, правило дома',
    homeSection: 'house-rules',
    createdIn: ['house-rules', 'voting'],
    editedIn: ['house-rules'],
    aggregatedIn: ['house-rules'],
    shownIn: ['house-rules', 'family-chat'],
  },
  {
    id: 'tradition',
    name: 'Традиция / ритуал',
    description: 'Повторяющийся семейный ритуал',
    homeSection: 'traditions',
    createdIn: ['traditions', 'family-matrix-rituals', 'faith'],
    editedIn: ['traditions'],
    aggregatedIn: ['traditions'],
    shownIn: ['traditions', 'calendar', 'portfolio'],
    notes:
      'КОНФЛИКТ: «ритуалы» есть в traditions (общие), family-matrix-rituals (примирение), ' +
      'faith (религиозные). Стоит явно разделить по типам.',
  },

  // ── Тесты и психология ───────────────────────────────
  {
    id: 'psy-test-result',
    name: 'Результат психологического теста',
    description: 'Профиль личности/пары/семьи/ребёнка по PARI или другим тестам',
    homeSection: 'family-matrix-personal',
    createdIn: [
      'family-matrix-personal',
      'family-matrix-couple',
      'family-matrix-family',
      'family-matrix-child',
      'family-matrix-mirror',
    ],
    editedIn: [],
    aggregatedIn: ['family-matrix-personal'],
    shownIn: [
      'family-matrix-personal',
      'family-matrix-couple',
      'family-matrix-family',
      'family-matrix-child',
      'family-matrix-mirror',
    ],
    notes:
      'Каждый тест — отдельный «дом», но все тесты — одна сущность. ' +
      'Можно сделать общий «Кабинет тестов» как агрегатор результатов.',
  },

  // ── Питомцы ──────────────────────────────────────────
  {
    id: 'pet',
    name: 'Питомец',
    description: 'Животное в составе семьи',
    homeSection: 'pets-hub',
    createdIn: ['pets-hub'],
    editedIn: ['pets-hub'],
    aggregatedIn: ['pets-hub'],
    shownIn: [
      'pets-hub',
      'pets-vaccines',
      'pets-vet',
      'pets-meds',
      'pets-food',
      'pets-grooming',
      'pets-activity',
      'pets-expenses',
      'pets-health',
      'pets-items',
      'pets-photos',
    ],
  },

  // ── Сообщения и коммуникация ─────────────────────────
  {
    id: 'message',
    name: 'Сообщение',
    description: 'Сообщение в семейном чате',
    homeSection: 'family-chat',
    createdIn: ['family-chat'],
    editedIn: ['family-chat'],
    aggregatedIn: ['family-chat'],
    shownIn: ['family-chat'],
  },
  {
    id: 'vote',
    name: 'Голосование',
    description: 'Голосование по семейному вопросу',
    homeSection: 'voting',
    createdIn: ['voting'],
    editedIn: ['voting'],
    aggregatedIn: ['voting'],
    shownIn: ['voting', 'family-chat'],
  },

  // ── Государственная поддержка ────────────────────────
  {
    id: 'support-measure',
    name: 'Мера господдержки',
    description: 'Льгота, выплата, программа от государства',
    homeSection: 'state-support',
    createdIn: ['state-support'],
    editedIn: ['state-support'],
    aggregatedIn: ['support-navigator'],
    shownIn: ['support-navigator', 'state-support'],
  },

  // ── AI-инсайт ────────────────────────────────────────
  {
    id: 'ai-insight',
    name: 'AI-инсайт / совет',
    description: 'Рекомендация AI на основе данных пользователя',
    homeSection: 'portfolio',
    createdIn: ['portfolio', 'psychologist', 'pets-ai', 'diet-ai', 'family-matrix-mirror'],
    editedIn: [],
    aggregatedIn: ['portfolio'],
    shownIn: ['portfolio', 'psychologist', 'pets-ai', 'diet-ai', 'family-matrix-mirror'],
    notes:
      'AI-инсайты порождаются во многих местах — это нормально, у каждого свой контекст. ' +
      'Главное: маркировать тип источника (правило / совет ИИ / наблюдение).',
  },
];

export function getEntityById(id: string): PlatformEntity | undefined {
  return ENTITIES.find((e) => e.id === id);
}

/** Сущности с конфликтом «несколько домов» (createdIn длиннее 1) */
export function getMultiHomeEntities(): PlatformEntity[] {
  return ENTITIES.filter((e) => e.createdIn.length > 1);
}
