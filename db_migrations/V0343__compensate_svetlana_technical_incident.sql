-- Компенсация Светлане Олещенко (family_id 17f14a7e-85eb-4333-b7cb-fdd34272bc28) за технический сбой:
-- несохранённая история AI-чата и несохранённый результат AI-диеты (05.07.2026).
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 100, updated_at = NOW()
WHERE family_id = '17f14a7e-85eb-4333-b7cb-fdd34272bc28';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
SELECT id, 'topup', 100, 'support_compensation', 'Компенсация за технический сбой (несохранённая AI-диета и история чата)', '1f61bcd5-8d55-4b59-b7d1-acef7cb628e2'
FROM t_p5815085_family_assistant_pro.family_wallet
WHERE family_id = '17f14a7e-85eb-4333-b7cb-fdd34272bc28';