-- Приветственный бонус новому пользователю Юлии (samojlenko1993@list.ru)
-- Кошелёк семьи "Моя семья" (владелец Юлия), family_id = 2aa9b383-5e9d-4e64-868a-b7cd94526957, wallet id=77

UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 10000.00, updated_at = NOW()
WHERE id = 77;

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions
    (wallet_id, type, amount_rub, reason, description, user_id, created_at)
VALUES
    (77, 'topup', 10000.00, 'welcome_bonus',
     'Приветственный бонус — рады видеть вас в «Наша Семья»!',
     'a4cebfa5-4f14-4bbd-a5a7-cf9079c1ee83', NOW());