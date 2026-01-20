-- Создание таблиц для управления тарифными планами

-- Таблица тарифных планов
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    period VARCHAR(50) NOT NULL,
    period_months INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    visible BOOLEAN DEFAULT true,
    popular BOOLEAN DEFAULT false,
    discount INTEGER DEFAULT 0,
    functions_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица функций, доступных в тарифах
CREATE TABLE IF NOT EXISTS plan_features (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь тарифов и функций
CREATE TABLE IF NOT EXISTS plan_feature_mappings (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    feature_id VARCHAR(50) REFERENCES plan_features(id),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, feature_id)
);

-- Индексы
CREATE INDEX idx_subscription_plans_visible ON subscription_plans(visible);
CREATE INDEX idx_plan_features_category ON plan_features(category);
CREATE INDEX idx_plan_feature_mappings_plan ON plan_feature_mappings(plan_id);
CREATE INDEX idx_plan_feature_mappings_feature ON plan_feature_mappings(feature_id);

-- Вставка базовых тарифов
INSERT INTO subscription_plans (id, name, price, period, period_months, description, visible, popular, discount, functions_count, sort_order)
VALUES 
    ('basic', 'Базовый', 299, '1 месяц', 1, 'Гибкая оплата', true, false, 0, 6, 1),
    ('standard', 'Семейный', 799, '3 месяца', 3, 'Все функции Базового', true, true, 20, 8, 2),
    ('premium', 'Премиум', 2499, '12 месяцев', 12, 'Все функции Семейного', true, false, 50, 9, 3)
ON CONFLICT (id) DO NOTHING;

-- Вставка функций
INSERT INTO plan_features (id, name, description, category, sort_order) VALUES
    ('members_5', 'До 5 членов семьи', 'Базовый лимит участников', 'basic', 1),
    ('members_10', 'До 10 членов семьи', 'Расширенный лимит', 'basic', 2),
    ('members_unlimited', 'Неограниченное число членов', 'Без ограничений', 'basic', 3),
    ('calendar', 'Календарь событий (базовый)', 'Планирование событий', 'basic', 4),
    ('shopping', 'Списки покупок', 'Совместные списки', 'basic', 5),
    ('finance', 'Финансовый учет', 'Учёт доходов и расходов', 'basic', 6),
    ('tasks', 'Рецепты (до 50 рецептов)', 'Семейная кулинарная книга', 'family', 7),
    ('family_chat', 'Семейный чат', 'Общение внутри семьи', 'family', 8),
    ('voting', 'Голосования', 'Совместные решения', 'family', 9),
    ('children_health', 'Здоровье детей', 'Медицинские записи детей', 'family', 10),
    ('medical', 'Медицинские записи', 'Карты всех членов семьи', 'family', 11),
    ('ai_assistant', 'ИИ-помощник "Домовой"', 'Умный семейный ассистент', 'ai', 12),
    ('ai_recommendations', 'Автоматические напоминания', 'Персональные рекомендации', 'ai', 13),
    ('ai_analysis', 'Подбор решений по продуктам', 'Автоматический анализ', 'ai', 14),
    ('ai_budget', 'Анализ семейного бюджета', 'Финансовые инсайты', 'ai', 15),
    ('trips', 'Путешествия и поездки', 'Планирование путешествий', 'family', 16),
    ('analytics', 'Аналитика и отчеты', 'Детальная статистика', 'analytics', 17),
    ('export', 'Экспорт данных', 'Выгрузка в Excel/PDF', 'analytics', 18),
    ('family_tree', 'Семейное древо', 'Генеалогическое древо', 'family', 19),
    ('support_basic', 'Техподдержка', 'Email-поддержка', 'support', 20),
    ('support_priority', 'Приоритетная поддержка', 'Быстрый ответ', 'support', 21),
    ('support_vip', 'VIP поддержка 24/7', 'Круглосуточная помощь', 'support', 22),
    ('alice', 'Интеграция с Алисой', 'Голосовое управление', 'ai', 23)
ON CONFLICT (id) DO NOTHING;

-- Связка базового тарифа с функциями
INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled) VALUES
    ('basic', 'members_5', true),
    ('basic', 'calendar', true),
    ('basic', 'shopping', true),
    ('basic', 'finance', true),
    ('basic', 'family_chat', true),
    ('basic', 'support_basic', true)
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Связка семейного тарифа с функциями
INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled) VALUES
    ('standard', 'members_10', true),
    ('standard', 'tasks', true),
    ('standard', 'voting', true),
    ('standard', 'children_health', true),
    ('standard', 'medical', true),
    ('standard', 'ai_recommendations', true),
    ('standard', 'support_priority', true),
    ('standard', 'alice', true)
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Связка премиум тарифа с функциями
INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled) VALUES
    ('premium', 'members_unlimited', true),
    ('premium', 'ai_assistant', true),
    ('premium', 'ai_analysis', true),
    ('premium', 'ai_budget', true),
    ('premium', 'trips', true),
    ('premium', 'analytics', true),
    ('premium', 'export', true),
    ('premium', 'family_tree', true),
    ('premium', 'support_vip', true)
ON CONFLICT (plan_id, feature_id) DO NOTHING;

COMMENT ON TABLE subscription_plans IS 'Тарифные планы подписок';
COMMENT ON TABLE plan_features IS 'Функции, доступные в тарифах';
COMMENT ON TABLE plan_feature_mappings IS 'Связь тарифов и функций';