UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 100.00, updated_at = NOW()
WHERE family_id = 'ca92a40b-8e92-4709-9dca-54f52f86d364';

UPDATE t_p5815085_family_assistant_pro.payments
SET status = 'paid', paid_at = NOW()
WHERE payment_id = '31230fb7-000f-5001-8000-1e8f62f3784c'
  AND status = 'pending';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions
  (wallet_id, type, amount_rub, reason, description, user_id)
VALUES
  (1, 'topup', 100.00, 'topup', 'Пополнение через ЮKassa (ручное зачисление)', '5c862395-7e81-467a-bcb0-3642e926c99a');