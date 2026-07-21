-- Начисление бонуса за активное использование приложения (5 событий в календаре за неделю)
-- Владислава Плуталова (vladaplutalova@yandex.ru), family_id=24158b08-7647-42aa-9c40-9936d34143d7
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 1000, updated_at = NOW()
WHERE family_id = '24158b08-7647-42aa-9c40-9936d34143d7';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
VALUES (76, 'topup', 1000, 'active_usage_bonus', 'Бонус за активное использование приложения — спасибо, что ведёте семейный календарь вместе с нами!', '2257b142-ffb8-40f1-b77e-520bdd400c6d');