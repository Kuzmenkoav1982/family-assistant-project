-- Активация подписки для пользователя kuzmenkoav1982@yandex.ru после оплаты 200₽

-- Обновляем статус платежа на "paid"
UPDATE t_p5815085_family_assistant_pro.payments
SET status = 'paid',
    paid_at = NOW(),
    payment_method = 'yookassa'
WHERE id = '4e79decc-ef63-4b99-a1ae-ee7ee5c364f9';

-- Активируем подписку
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'active',
    updated_at = NOW()
WHERE id = 'b39c3358-f1d9-43f6-81f4-cb5cf7f132fc';