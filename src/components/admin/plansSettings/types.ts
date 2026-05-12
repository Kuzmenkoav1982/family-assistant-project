export interface PlanFeature {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  category: 'basic' | 'family' | 'ai' | 'analytics' | 'support';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  periodMonths: number;
  description: string;
  visible: boolean;
  popular?: boolean;
  features: PlanFeature[];
  functionsCount: number;
  discount?: number;
  activeFrom?: string;
  activeUntil?: string;
}

export const AVAILABLE_FEATURES: PlanFeature[] = [
  { id: 'members_5', name: 'До 5 членов семьи', enabled: false, category: 'basic', description: 'Базовый лимит участников' },
  { id: 'members_10', name: 'До 10 членов семьи', enabled: false, category: 'basic', description: 'Расширенный лимит' },
  { id: 'members_unlimited', name: 'Неограниченное число членов', enabled: false, category: 'basic', description: 'Без ограничений' },
  { id: 'calendar', name: 'Календарь событий (базовый)', enabled: false, category: 'basic', description: 'Планирование событий' },
  { id: 'shopping', name: 'Списки покупок', enabled: false, category: 'basic', description: 'Совместные списки' },
  { id: 'finance', name: 'Финансовый учет', enabled: false, category: 'basic', description: 'Учёт доходов и расходов' },
  { id: 'tasks', name: 'Рецепты (до 50 рецептов)', enabled: false, category: 'family', description: 'Семейная кулинарная книга' },
  { id: 'family_chat', name: 'Семейный чат', enabled: false, category: 'family', description: 'Общение внутри семьи' },
  { id: 'voting', name: 'Комментарии 1ТБ', enabled: false, category: 'family', description: 'Совместные решения' },
  { id: 'children_health', name: 'Здоровье детей', enabled: false, category: 'family', description: 'Медицинские записи детей' },
  { id: 'medical', name: 'Медицинские записи', enabled: false, category: 'family', description: 'Карты всех членов семьи' },
  { id: 'ai_assistant', name: 'ИИ-помощник "Домовой"', enabled: false, category: 'ai', description: 'Умный семейный ассистент' },
  { id: 'ai_recommendations', name: 'Автоматические напоминания', enabled: false, category: 'ai', description: 'Персональные рекомендации' },
  { id: 'ai_analysis', name: 'Подбор решений по продуктам', enabled: false, category: 'ai', description: 'Автоматический анализ' },
  { id: 'ai_budget', name: 'Анализ семейного бюджета', enabled: false, category: 'ai', description: 'Финансовые инсайты' },
  { id: 'trips', name: 'Путешествия и поездки', enabled: false, category: 'family', description: 'Планирование путешествий' },
  { id: 'analytics', name: 'Аналитика и отчеты', enabled: false, category: 'analytics', description: 'Детальная статистика' },
  { id: 'export', name: 'Экспорт данных', enabled: false, category: 'analytics', description: 'Выгрузка в Excel/PDF' },
  { id: 'family_tree', name: 'Семейное древо', enabled: false, category: 'family', description: 'Генеалогическое древо' },
  { id: 'support_basic', name: 'Техподдержка', enabled: false, category: 'support', description: 'Email-поддержка' },
  { id: 'support_priority', name: 'Приоритетная поддержка', enabled: false, category: 'support', description: 'Быстрый ответ' },
  { id: 'support_vip', name: 'VIP поддержка 24/7', enabled: false, category: 'support', description: 'Круглосуточная помощь' },
  { id: 'no_ai', name: 'Нет AI-помощника', enabled: false, category: 'ai', description: 'Без ИИ-функций' },
  { id: 'unlimited_storage', name: 'Безлимитная история', enabled: false, category: 'analytics', description: 'Вечное хранение' },
  { id: 'alice', name: 'Интеграция с Алисой', enabled: false, category: 'ai', description: 'Голосовое управление' },
];

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    period: 'навсегда',
    periodMonths: 0,
    description: 'Условие: помогайте нам развивать платформу своими идеями и предложениями!',
    visible: true,
    functionsCount: 8,
    features: [
      { id: 'members_10', name: 'Профили семьи (до 10 человек)', enabled: true, category: 'basic' },
      { id: 'calendar', name: 'Календарь событий (базовый)', enabled: true, category: 'basic' },
      { id: 'shopping', name: 'Списки покупок и задач', enabled: true, category: 'basic' },
      { id: 'recipes', name: 'Рецепты (до 50 рецептов)', enabled: true, category: 'family' },
      { id: 'family_chat', name: 'Семейный чат', enabled: true, category: 'family' },
      { id: 'storage_1gb', name: 'Хранилище 1 ГБ', enabled: true, category: 'basic' },
      { id: 'no_ai', name: 'Нет AI-помощника', enabled: false, category: 'ai' },
      { id: 'history_3m', name: 'История событий 3 месяца', enabled: false, category: 'analytics' },
    ]
  },
  {
    id: 'ai_assistant',
    name: 'AI-Помощник "Домовой"',
    price: 200,
    period: 'месяц',
    periodMonths: 1,
    description: 'Умный помощник для всей семьи',
    popular: true,
    visible: true,
    functionsCount: 6,
    features: [
      { id: 'ai_assistant', name: 'Умный семейный помощник', enabled: true, category: 'ai' },
      { id: 'ai_reminders', name: 'Автоматические напоминания', enabled: true, category: 'ai' },
      { id: 'ai_recipes', name: 'Подбор рецептов по продуктам', enabled: true, category: 'ai' },
      { id: 'ai_budget', name: 'Анализ семейного бюджета', enabled: true, category: 'ai' },
      { id: 'ai_tips', name: 'Советы по организации быта', enabled: true, category: 'ai' },
      { id: 'ai_qa', name: 'Быстрые ответы на вопросы', enabled: true, category: 'ai' },
    ]
  },
  {
    id: 'full',
    name: 'Полный пакет',
    price: 500,
    period: 'месяц',
    periodMonths: 1,
    description: 'Все возможности + приоритет',
    popular: true,
    visible: true,
    functionsCount: 5,
    discount: 60,
    features: [
      { id: 'ai_full', name: 'AI-Помощник "Домовой"', enabled: true, category: 'ai' },
      { id: 'storage_20gb', name: '20 ГБ хранилища', enabled: true, category: 'basic' },
      { id: 'history_unlimited', name: 'Безлимитная история', enabled: true, category: 'analytics' },
      { id: 'support_priority', name: 'Приоритетная поддержка', enabled: true, category: 'support' },
      { id: 'alice', name: 'Ранний доступ к новинкам', enabled: true, category: 'support' },
    ]
  },
  {
    id: 'basic',
    name: 'Базовый',
    price: 299,
    period: '1 месяц',
    periodMonths: 1,
    description: 'Гибкая оплата',
    visible: false,
    functionsCount: 6,
    features: []
  },
  {
    id: 'standard',
    name: 'Семейный',
    price: 799,
    period: '3 месяца',
    periodMonths: 3,
    description: 'Все функции Базового',
    popular: true,
    visible: false,
    functionsCount: 8,
    discount: 20,
    features: []
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 2499,
    period: '12 месяцев',
    periodMonths: 12,
    description: 'Все функции Семейного',
    visible: false,
    functionsCount: 9,
    discount: 50,
    features: []
  }
];

export const CATEGORY_LABELS = {
  basic: 'Базовые функции',
  family: 'Семейные функции',
  ai: 'ИИ и автоматизация',
  analytics: 'Аналитика и отчёты',
  support: 'Поддержка'
};

export const CATEGORY_COLORS = {
  basic: 'bg-blue-100 text-blue-800',
  family: 'bg-purple-100 text-purple-800',
  ai: 'bg-green-100 text-green-800',
  analytics: 'bg-orange-100 text-orange-800',
  support: 'bg-gray-100 text-gray-800'
};
