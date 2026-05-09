// Журнал архитектурных решений по найденным конфликтам и пересечениям.
// Главный управленческий инструмент паспорта.
//
// Заполняется в Шаге 7 (после матрицы пересечений).

import type { OverlapCase } from './types';

export const OVERLAP_CASES: OverlapCase[] = [
  // ── Безопасность ──────────────────────────────────────
  {
    id: 'security-admin-route-guard',
    sectionA: 'admin-routes',
    sectionB: 'admin-login',
    sharedFunction: 'авторизация администратора',
    riskLevel: 'medium',
    problem:
      'Бэкенд защищён X-Admin-Token и возвращает 401 без токена. Однако часть админ-страниц ' +
      'ранее не имела клиентской проверки: страница загружалась, данные не приходили — ' +
      'плохой UX и небольшое раскрытие структуры UI.',
    recommendation:
      'Создан компонент AdminRoute (App.tsx). Все 15 admin-маршрутов кроме /admin/login ' +
      'обёрнуты в AdminRoute. Без adminToken идёт редирект на /admin/login. ' +
      'Дальнейшее усиление (JWT с истечением, серверная функция admin-verify) — отдельный кейс.',
    decision: 'keep',
    status: 'decided',
    notes: 'Закрыто в этой же сессии. См. principle admin-route-guard.',
  },

  // ── Главный кейс: триада Портфолио ↔ Мастерская ↔ Развитие ──
  {
    id: 'overlap-portfolio-life-road',
    sectionA: 'portfolio',
    sectionB: 'life-road',
    sharedEntity: 'goal',
    sharedFunction: 'карта развития человека',
    riskLevel: 'high',
    problem:
      'Оба раздела позиционируются как карта развития. Портфолио — диагностика по сферам ' +
      'на основе данных. Мастерская — осмысление пути и сезонов. Без чёткого разграничения ' +
      'пользователь не понимает куда идти за чем.',
    recommendation:
      'Принять триаду как принцип: Портфолио = interpretation (диагноз сейчас), ' +
      'Мастерская = reflection (осмысление пути), Развитие = action (исполнение). ' +
      'Разграничить владение сущностями: микропланы развития — Портфолио, длинные жизненные ' +
      'векторы — Мастерская, операционные планы — Развитие. Сделать мост: Портфолио → ' +
      '«добавить в вектор» → Мастерская; Мастерская → «разбить на план» → Развитие.',
    decision: 'needs-review',
    status: 'open',
    notes: 'Гипотеза триады уже зафиксирована в platformPrinciples (status: hypothesis).',
  },
  {
    id: 'overlap-portfolio-development',
    sectionA: 'portfolio',
    sectionB: 'development',
    sharedEntity: 'development-plan',
    sharedFunction: 'планы развития',
    riskLevel: 'high',
    problem:
      'Микропланы развития есть и в Портфолио (по сферам), и в разделе Развитие. Пользователь ' +
      'может создать план в одном месте, не увидеть в другом.',
    recommendation:
      'Гипотеза: Портфолио владеет микропланами по 8 сферам (короткие, привязаны к сфере). ' +
      'Развитие владеет долгосрочными планами и трекингом навыков. Развитие читает микропланы ' +
      'из Портфолио как витрину. Создание микропланов — только в Портфолио.',
    decision: 'needs-review',
    status: 'open',
  },

  // ── Цели в нескольких местах ──────────────────────────
  {
    id: 'overlap-goals-finance-life',
    sectionA: 'goals',
    sectionB: 'finance-goals',
    sharedEntity: 'goal',
    sharedFunction: 'постановка целей',
    riskLevel: 'medium',
    problem:
      'Цели создаются в трёх местах: общие цели (goals), финансовые цели (finance-goals), ' +
      'жизненные векторы (life-road). Модели разные, нет единого реестра целей семьи.',
    recommendation:
      'Goals = операционные цели (короткие, измеримые). Finance-goals = денежные накопления ' +
      'с особой логикой расчёта взносов. Life-road = жизненные векторы (длинные, смысловые). ' +
      'Сделать в /goals «вид» с фильтром «все цели семьи» — витрина, агрегирующая все три типа.',
    decision: 'split',
    status: 'open',
  },

  // ── События календаря ─────────────────────────────────
  {
    id: 'overlap-events-calendar',
    sectionA: 'calendar',
    sectionB: 'events',
    sharedEntity: 'event',
    sharedFunction: 'события и даты',
    riskLevel: 'medium',
    problem:
      'События создаются в calendar, events (праздники), health (визиты), trips (поездки). ' +
      'Это нормально функционально, но единый «дом» события — calendar.',
    recommendation:
      'Сделать calendar единственным местом редактирования событий. Из events/health/trips — ' +
      'создавать через тот же API события, но с категорией. В этих разделах — витрина по своей ' +
      'категории + deep-link «Открыть в календаре для редактирования».',
    decision: 'merge',
    status: 'open',
  },

  // ── Покупки операционные vs крупные ───────────────────
  {
    id: 'overlap-shopping-purchases',
    sectionA: 'shopping',
    sectionB: 'purchases',
    sharedEntity: 'shopping-item',
    sharedFunction: 'списки покупок',
    riskLevel: 'low',
    problem:
      'Два раздела покупок могут путать. Shopping — ежедневный список (молоко, хлеб). ' +
      'Purchases — крупные планируемые (телевизор, ремонт). Разные по природе, но название схожее.',
    recommendation:
      'Оставить разделение, но переименовать: shopping → «Список покупок (ежедневный)», ' +
      'purchases → «План крупных покупок». Между ними — связь через бюджет.',
    decision: 'rename',
    status: 'open',
  },

  // ── Достижения и оценки ───────────────────────────────
  {
    id: 'overlap-children-portfolio-observations',
    sectionA: 'children',
    sectionB: 'portfolio',
    sharedEntity: 'observation',
    sharedFunction: 'оценки и наблюдения по ребёнку',
    riskLevel: 'medium',
    problem:
      'Оценки родителя и наблюдения создаются и в children, и в portfolio. ' +
      'Дублирование логики ввода.',
    recommendation:
      'Children = source (ввод фактов о ребёнке: оценки, обязанности, достижения). ' +
      'Portfolio = interpretation (читает данные children и собирает картину по сферам). ' +
      'Перенести ввод оценок в children, в portfolio оставить только агрегацию.',
    decision: 'move',
    status: 'open',
  },

  // ── Ритуалы в трёх местах ─────────────────────────────
  {
    id: 'overlap-rituals',
    sectionA: 'traditions',
    sectionB: 'family-matrix-rituals',
    sharedEntity: 'tradition',
    sharedFunction: 'ритуалы',
    riskLevel: 'low',
    problem:
      'Ритуалы есть в traditions (общие семейные), family-matrix-rituals (примирение), ' +
      'faith (религиозные). Это разные типы, но общая сущность.',
    recommendation:
      'Оставить разделение по контексту, но завести единое поле type у tradition: ' +
      '«семейная», «ритуал примирения», «религиозная». Из traditions можно фильтровать.',
    decision: 'keep',
    status: 'deferred',
  },

  // ── Психологические тесты ─────────────────────────────
  {
    id: 'overlap-psy-tests',
    sectionA: 'family-matrix-personal',
    sectionB: 'family-matrix-mirror',
    sharedEntity: 'psy-test-result',
    sharedFunction: 'психологические тесты',
    riskLevel: 'low',
    problem:
      'В Семейном коде 8 разделов-тестов. Результаты живут каждый в своём разделе, ' +
      'нет общего «кабинета результатов».',
    recommendation:
      'Сделать в /family-matrix главную страницу с агрегатом всех пройденных тестов: ' +
      'список + последние результаты + прогресс. Навигация в отдельные тесты остаётся.',
    decision: 'keep',
    status: 'open',
  },

  // ── Достижения для взрослых ───────────────────────────
  {
    id: 'overlap-achievements-adult',
    sectionA: 'children',
    sectionB: 'development',
    sharedEntity: 'achievement',
    sharedFunction: 'достижения',
    riskLevel: 'medium',
    problem:
      'Достижения хранятся в children (ребёнок) и development (взрослый/семья). ' +
      'Раздел portfolio показывает их обоих. Пользователю непонятно куда писать.',
    recommendation:
      'Унифицировать сущность achievement: один home — development (как универсальный), ' +
      'но в children показывать как витрину со своей UX-обёрткой для родителя. ' +
      'Связано с расширением Портфолио на взрослых.',
    decision: 'merge',
    status: 'open',
  },

  // ── AI-инсайты в нескольких местах ────────────────────
  {
    id: 'overlap-ai-insights',
    sectionA: 'portfolio',
    sectionB: 'psychologist',
    sharedEntity: 'ai-insight',
    sharedFunction: 'AI-рекомендации',
    riskLevel: 'low',
    problem:
      'AI-инсайты порождаются в portfolio, psychologist, pets-ai, diet-ai, mirror. ' +
      'Это нормально (разные контексты), но нет единой ленты «что AI мне сегодня сказал».',
    recommendation:
      'Оставить специализированные инсайты в своих разделах. В portfolio добавить виджет ' +
      '«Свежие AI-советы» с агрегатом из всех источников + маркировкой «откуда».',
    decision: 'keep',
    status: 'deferred',
  },
];

export function getCasesByStatus(status: OverlapCase['status']): OverlapCase[] {
  return OVERLAP_CASES.filter((c) => c.status === status);
}