
UPDATE t_p5815085_family_assistant_pro.family_wallet 
SET balance_rub = balance_rub + 100, updated_at = NOW()
WHERE family_id = 'ca92a40b-8e92-4709-9dca-54f52f86d364';

UPDATE t_p5815085_family_assistant_pro.payments 
SET status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = 'yookassa'
WHERE payment_id = '31230794-000f-5001-9000-1c2b0ee549fc';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions 
(wallet_id, type, amount_rub, reason, description, user_id)
VALUES (1, 'topup', 100, 'topup', 'Оплата через ЮKassa (ручное зачисление)', '5c862395-7e81-467a-bcb0-3642e926c99a');
