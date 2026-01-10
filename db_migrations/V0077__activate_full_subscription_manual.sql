-- Активация полной подписки для kuzmenkoav1982@yandex.ru после оплаты 306.67₽

-- Восстанавливаем и активируем подписку full
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'active',
    start_date = NOW(),
    updated_at = NOW()
WHERE id = '75a15a08-e390-422b-ae18-c5130339e169';

-- Обновляем платёж на paid
UPDATE t_p5815085_family_assistant_pro.payments
SET status = 'paid',
    paid_at = NOW(),
    payment_method = 'yookassa'
WHERE payment_id = '30f3b0ff-000f-5001-9000-1c82fb823eae';

-- Деактивируем старую подписку ai_assistant (апгрейд завершён)
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'upgraded',
    updated_at = NOW()
WHERE id = 'b39c3358-f1d9-43f6-81f4-cb5cf7f132fc';