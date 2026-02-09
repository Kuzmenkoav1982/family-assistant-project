-- Новая система подписок с лимитами

-- 1. Таблица для отслеживания использования лимитов
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES t_p5815085_family_assistant_pro.families(id),
    
    -- Лимиты AI-запросов
    ai_requests_used INTEGER DEFAULT 0,
    ai_requests_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Лимиты фотографий
    photos_used INTEGER DEFAULT 0,
    
    -- Лимиты членов семьи
    family_members_count INTEGER DEFAULT 0,
    
    -- Метаданные
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_family_usage UNIQUE(family_id)
);

-- 2. Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_subscription_usage_family ON t_p5815085_family_assistant_pro.subscription_usage(family_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_reset_date ON t_p5815085_family_assistant_pro.subscription_usage(ai_requests_reset_date);

-- 3. Добавляем поле payment_token для рекуррентных платежей
ALTER TABLE t_p5815085_family_assistant_pro.subscriptions 
ADD COLUMN IF NOT EXISTS payment_token TEXT;

ALTER TABLE t_p5815085_family_assistant_pro.subscriptions 
ADD COLUMN IF NOT EXISTS yookassa_payment_id TEXT;

ALTER TABLE t_p5815085_family_assistant_pro.subscriptions 
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- 4. Создаём индексы для новых полей
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_token ON t_p5815085_family_assistant_pro.subscriptions(payment_token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON t_p5815085_family_assistant_pro.subscriptions(end_date);

-- 5. Инициализация записей для существующих семей
INSERT INTO t_p5815085_family_assistant_pro.subscription_usage (family_id, family_members_count)
SELECT 
    f.id,
    COALESCE(COUNT(fm.id), 0)
FROM t_p5815085_family_assistant_pro.families f
LEFT JOIN t_p5815085_family_assistant_pro.family_members fm ON f.id = fm.family_id
WHERE NOT EXISTS (
    SELECT 1 FROM t_p5815085_family_assistant_pro.subscription_usage su WHERE su.family_id = f.id
)
GROUP BY f.id
ON CONFLICT (family_id) DO NOTHING;