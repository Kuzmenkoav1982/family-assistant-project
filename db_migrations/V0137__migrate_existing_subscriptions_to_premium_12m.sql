-- Миграция 2 активных подписок на новый тариф Premium 12 месяцев

-- 1. Обновляем подписку kuzmenkoav1982@yandex.ru (family_id: ca92a40b-8e92-4709-9dca-54f52f86d364)
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET 
    plan_type = 'premium_12m',
    amount = 2699.00,
    updated_at = CURRENT_TIMESTAMP
WHERE id = '75a15a08-e390-422b-ae18-c5130339e169';

-- 2. Обновляем подписку july80@mail.ru (family_id: 046e1a53-a0e6-43d4-bf81-9571b2ff0e4a)
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET 
    plan_type = 'premium_12m',
    amount = 2699.00,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'd349dcef-01b0-4849-adc8-4ad1eb820af1';