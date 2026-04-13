UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 500.00,
    updated_at = now()
WHERE id = 11;

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions
  (wallet_id, type, amount_rub, reason, description, user_id, created_at)
VALUES
  (11, 'credit', 500.00, 'admin_bonus', 'Начисление от администратора — вознаграждение тестировщику', 'bf00f46d-ee9a-45dd-b25f-c901850d687c', now());
