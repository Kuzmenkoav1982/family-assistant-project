-- Обновление тарифных планов: новая система оплаты

-- 1. Скрываем старые тарифы (делаем их невидимыми)
UPDATE t_p5815085_family_assistant_pro.subscription_plans
SET visible = false, updated_at = CURRENT_TIMESTAMP
WHERE id IN ('basic', 'standard', 'premium', 'free', 'ai_assistant', 'full');

-- 2. Создаём новые тарифы
INSERT INTO t_p5815085_family_assistant_pro.subscription_plans (
    id, name, price, period, period_months, description, visible, popular, discount, sort_order
) VALUES 
(
    'free_2026', 
    'Free', 
    0.00, 
    'навсегда', 
    0, 
    '5 AI-запросов в день, до 10 фото, до 2 членов семьи', 
    true, 
    false, 
    0, 
    1
),
(
    'premium_1m', 
    'Premium 1 месяц', 
    299.00, 
    '1 месяц', 
    1, 
    'Безлимитные AI-запросы, фото и члены семьи', 
    true, 
    false, 
    0, 
    2
),
(
    'premium_3m', 
    'Premium 3 месяца', 
    799.00, 
    '3 месяца', 
    3, 
    'Безлимитные AI-запросы, фото и члены семьи', 
    true, 
    true, 
    11, 
    3
),
(
    'premium_6m', 
    'Premium 6 месяцев', 
    1499.00, 
    '6 месяцев', 
    6, 
    'Безлимитные AI-запросы, фото и члены семьи', 
    true, 
    false, 
    17, 
    4
),
(
    'premium_12m', 
    'Premium 12 месяцев', 
    2699.00, 
    '12 месяцев', 
    12, 
    'Безлимитные AI-запросы, фото и члены семьи', 
    true, 
    false, 
    25, 
    5
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    period = EXCLUDED.period,
    period_months = EXCLUDED.period_months,
    description = EXCLUDED.description,
    visible = EXCLUDED.visible,
    popular = EXCLUDED.popular,
    discount = EXCLUDED.discount,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;