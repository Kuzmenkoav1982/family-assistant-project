-- Компенсация пользователям за системный баг несохранения ИИ-диеты (ai_diet_plans пуста за всё время).
-- Округление вверх до ближайших 50 ₽, аналогично компенсации Светлане Олещенко.

-- Алексей К. (family_id ca92a40b-8e92-4709-9dca-54f52f86d364), потрачено 236 ₽ -> компенсация 250 ₽
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 250, updated_at = NOW()
WHERE family_id = 'ca92a40b-8e92-4709-9dca-54f52f86d364';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
SELECT id, 'topup', 250, 'support_compensation', 'Компенсация за технический сбой (несохранённые ИИ-диеты)', '5c862395-7e81-467a-bcb0-3642e926c99a'
FROM t_p5815085_family_assistant_pro.family_wallet
WHERE family_id = 'ca92a40b-8e92-4709-9dca-54f52f86d364';

-- Акакий (family_id 43454326-e11d-4f62-aeaf-fcc9de26bd5e), потрачено 51 ₽ -> компенсация 100 ₽
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 100, updated_at = NOW()
WHERE family_id = '43454326-e11d-4f62-aeaf-fcc9de26bd5e';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
SELECT id, 'topup', 100, 'support_compensation', 'Компенсация за технический сбой (несохранённые ИИ-диеты)', 'a622daca-4629-4835-9bfe-53cb83f4aacb'
FROM t_p5815085_family_assistant_pro.family_wallet
WHERE family_id = '43454326-e11d-4f62-aeaf-fcc9de26bd5e';

-- Юлия (family_id 046e1a53-a0e6-43d4-bf81-9571b2ff0e4a), потрачено 17 ₽ -> компенсация 50 ₽
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 50, updated_at = NOW()
WHERE family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
SELECT id, 'topup', 50, 'support_compensation', 'Компенсация за технический сбой (несохранённые ИИ-диеты)', '3b86fc3c-8b3c-4cb6-ad62-78a3830cc854'
FROM t_p5815085_family_assistant_pro.family_wallet
WHERE family_id = '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a';