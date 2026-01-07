-- Активируем подписку для первого пользователя july80@mail.ru
-- Он реально оплатил 500₽, но webhook не отработал

UPDATE t_p5815085_family_assistant_pro.payments
SET status = 'succeeded', paid_at = NOW()
WHERE payment_id = '30f0818b-000f-5000-b000-109014fef4d2';

UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'active', start_date = NOW(), updated_at = NOW()
WHERE id = 'd349dcef-01b0-4849-adc8-4ad1eb820af1';