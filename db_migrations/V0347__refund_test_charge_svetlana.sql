-- Возврат средств за тестовый вызов generate-diet-plan (проверка фикса), списанных с баланса Светланы Олещенко.
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 17, updated_at = NOW()
WHERE family_id = '17f14a7e-85eb-4333-b7cb-fdd34272bc28';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
SELECT id, 'topup', 17, 'support_compensation', 'Возврат за тестовый вызов при проверке фикса', '1f61bcd5-8d55-4b59-b7d1-acef7cb628e2'
FROM t_p5815085_family_assistant_pro.family_wallet
WHERE family_id = '17f14a7e-85eb-4333-b7cb-fdd34272bc28';