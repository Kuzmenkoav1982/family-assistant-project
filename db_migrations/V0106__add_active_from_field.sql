-- Добавляем поле active_from для планирования запуска тарифов
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS active_from TIMESTAMP DEFAULT NOW();

-- Обновляем существующие тарифы - делаем их неактивными (скрываем)
UPDATE subscription_plans 
SET visible = false, 
    updated_at = NOW()
WHERE id IN ('basic', 'standard', 'premium');

-- Добавляем недостающие функции
INSERT INTO plan_features (id, name, category, description) VALUES
('storage_1gb', 'Хранилище 1 ГБ', 'storage', 'Бесплатное хранилище для файлов'),
('history_3mo', 'История событий 3 месяца', 'basic', 'Ограниченная история'),
('history_unlimited', 'Безлимитная история', 'premium', 'Вся история без ограничений'),
('quick_answers', 'Быстрые ответы на вопросы', 'ai', 'AI отвечает на вопросы'),
('early_access', 'Ранний доступ к новинкам', 'premium', 'Первыми получаете новые функции'),
('storage_20gb', '20 ГБ хранилища', 'storage', 'Расширенное хранилище'),
('members_10', 'До 10 членов семьи', 'basic', 'Ограничение участников семьи'),
('ai_help', 'Советы по организации быта', 'ai', 'Помощник дает советы')
ON CONFLICT (id) DO NOTHING;

-- Вставляем актуальные тарифы с сайта
INSERT INTO subscription_plans (id, name, price, period, period_months, description, visible, popular, discount, functions_count, sort_order, active_from) VALUES
('free', 'Бесплатный', 0, 'навсегда', 0, 'Условие: помогайте нам развивать платформу своими идеями и предложениями!', true, false, 0, 8, 1, NOW()),
('ai_assistant', 'AI-Помощник "Домовой"', 200, 'месяц', 1, 'Умный помощник для всей семьи', true, true, 0, 6, 2, NOW()),
('full', 'Полный пакет', 500, 'месяц', 1, 'Все возможности + приоритет', true, true, 60, 5, 3, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  period = EXCLUDED.period,
  description = EXCLUDED.description,
  visible = EXCLUDED.visible,
  popular = EXCLUDED.popular,
  discount = EXCLUDED.discount,
  updated_at = NOW();

-- Функции для Бесплатного тарифа
INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled) VALUES
('free', 'members_10', true),
('free', 'calendar', true),
('free', 'shopping', true),
('free', 'tasks', true),
('free', 'family_chat', true),
('free', 'storage_1gb', true),
('free', 'ai_assistant', false),
('free', 'history_3mo', true)
ON CONFLICT (plan_id, feature_id) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Функции для AI-Помощник
INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled) VALUES
('ai_assistant', 'ai_assistant', true),
('ai_assistant', 'ai_recommendations', true),
('ai_assistant', 'ai_analysis', true),
('ai_assistant', 'ai_budget', true),
('ai_assistant', 'ai_help', true),
('ai_assistant', 'quick_answers', true)
ON CONFLICT (plan_id, feature_id) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Функции для Полного пакета
INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled) VALUES
('full', 'ai_assistant', true),
('full', 'storage_20gb', true),
('full', 'history_unlimited', true),
('full', 'support_priority', true),
('full', 'early_access', true)
ON CONFLICT (plan_id, feature_id) DO UPDATE SET enabled = EXCLUDED.enabled;