-- Откат неудачного апгрейда до full для пользователя kuzmenkoav1982@yandex.ru

-- Отменяем неоплаченную подписку full
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'cancelled',
    updated_at = NOW()
WHERE id = '75a15a08-e390-422b-ae18-c5130339e169' AND status = 'pending';

-- Отменяем неоплаченный платёж апгрейда
UPDATE t_p5815085_family_assistant_pro.payments
SET status = 'cancelled'
WHERE payment_id = '30f3b0ff-000f-5001-9000-1c82fb823eae' AND status = 'pending';

-- Возвращаем старую подписку ai_assistant в статус active
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'active',
    updated_at = NOW()
WHERE id = 'b39c3358-f1d9-43f6-81f4-cb5cf7f132fc';