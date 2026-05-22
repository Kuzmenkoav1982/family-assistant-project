/**
 * Canonical Metrics — единый источник правды по цифрам платформы.
 * Все слайды и презентации должны ссылаться сюда, чтобы избежать рассинхрона.
 */

export const CANONICAL_METRICS = {
  users: {
    value: 81,
    label: 'пользователей',
    formatted: '81',
  },
  families: {
    value: 93,
    label: 'семей',
    formatted: '93',
  },
  mau30d: {
    value: 25,
    label: 'активных за 30 дней',
    formatted: '~25',
    note: 'Closed beta · фокус на breadth и связности, не на growth-маркетинге',
  },
  wau7d: {
    value: 4,
    label: 'активных за 7 дней',
    formatted: '~4',
  },
  hubs: {
    value: 12,
    label: 'хабов',
    formatted: '12',
  },
  sections: {
    value: 74,
    label: 'разделов',
    formatted: '74',
  },
  uiModules: {
    value: 146,
    label: 'UI/бизнес-модулей',
    formatted: '146+',
  },
  backendFunctions: {
    value: 120,
    label: 'backend functions',
    formatted: '120+',
    note: 'Cloud Functions, обслуживают платформу',
  },
  coreTables: {
    value: 151,
    label: 'продуктовых таблиц БД',
    formatted: '151',
  },
  totalTables: {
    value: 290,
    label: 'таблиц БД включая системные',
    formatted: '290+',
  },
  aiScenariosLive: {
    value: 11,
    label: 'AI-сценариев работают',
    formatted: '11',
  },
  aiScenariosTarget: {
    value: 15,
    label: 'ролей в roadmap',
    formatted: '15',
  },
  softwareRegistry: {
    deposit: 'Депонирование ПО выполнено',
    registry: 'Включение в Реестр российского ПО — документы поданы, ожидаем включения',
    short: 'Депонирование выполнено · Реестр ПО — на стадии регистрации',
  },
  productStatus: {
    short: 'Ядро платформы работает в production',
    full: 'Ядро платформы разработано и работает в production на nasha-semya.ru. Следующий слой — масштабирование каналов и AI-оркестрации.',
  },
} as const;

export const ROADMAP_DISCLAIMER =
  'Milestone targets / scenario plan — стратегические ориентиры, а не жёсткие обязательства';
