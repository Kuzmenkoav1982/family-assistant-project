-- Фикс рассинхрона балансов: привязать "висящие" транзакции (account_id IS NULL) 
-- к единственному активному счёту семьи, затем пересчитать balance всех счетов 
-- как сумму их транзакций (+income / -expense).

-- 1. Привязываем NULL account_id к единственному активному счёту семьи
UPDATE finance_transactions ft
SET account_id = sub.acc_id
FROM (
    SELECT fa.family_id, MIN(fa.id::text)::uuid AS acc_id, COUNT(*) AS cnt
    FROM finance_accounts fa
    WHERE COALESCE(fa.is_active, true) = true
    GROUP BY fa.family_id
    HAVING COUNT(*) = 1
) sub
WHERE ft.account_id IS NULL
  AND ft.family_id = sub.family_id;

-- 2. Пересчитываем balance всех счетов как сумму транзакций 
-- (income добавляет, expense вычитает)
UPDATE finance_accounts fa
SET balance = COALESCE(sums.total, 0),
    updated_at = NOW()
FROM (
    SELECT 
        account_id,
        SUM(CASE WHEN transaction_type = 'income' THEN amount 
                 WHEN transaction_type = 'expense' THEN -amount 
                 ELSE 0 END) AS total
    FROM finance_transactions
    WHERE account_id IS NOT NULL
    GROUP BY account_id
) sums
WHERE fa.id = sums.account_id;
