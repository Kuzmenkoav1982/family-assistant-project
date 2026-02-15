-- Fix: mark duplicate +50 wallet transaction as corrected
-- Transaction id=4 is a duplicate of id=3 (same payment 3123192a, same second 23:30:41)
UPDATE wallet_transactions SET description = 'ДУБЛЬ (исправлено)', amount_rub = 0 WHERE id = 4;

-- Correct the wallet balance: remove the duplicate 50 rub
UPDATE family_wallet SET balance_rub = balance_rub - 50 WHERE id = 1;