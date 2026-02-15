-- Sync wallet balance with actual transaction sum
-- Transactions sum: 250 rub. Current balance: 350 rub.
-- The 100 rub difference is from old manual migration that credited balance directly.
UPDATE family_wallet SET balance_rub = 250, updated_at = NOW() WHERE id = 1;