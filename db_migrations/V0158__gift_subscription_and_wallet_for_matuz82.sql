-- Подписка на месяц для Романа (matuz82@mail.ru)
INSERT INTO t_p5815085_family_assistant_pro.subscriptions
  (family_id, plan_type, status, amount, currency, start_date, end_date, auto_renew, payment_method, payment_provider)
VALUES
  ('4b23f985-f9d3-4476-a747-932455f2cffc', 'family', 'active', 330.00, 'RUB', NOW(), NOW() + INTERVAL '1 month', false, 'manual', 'manual');

-- Пополнение кошелька на 1000 ₽
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 1000.00, updated_at = NOW()
WHERE family_id = '4b23f985-f9d3-4476-a747-932455f2cffc';

-- Запись транзакции
INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions
  (wallet_id, type, amount_rub, reason, description, user_id)
VALUES
  (8, 'deposit', 1000.00, 'admin_gift', 'Приветственное пополнение от администратора', 'c2696437-c3e1-4828-960f-42e351e604be');
