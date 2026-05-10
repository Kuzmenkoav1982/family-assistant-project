-- Гарантии целостности связи Дом ⇄ Финансы

-- 1. Уникальность пары (source_type, source_id) — защита от дубликатов транзакций
-- от двойного клика, повторного запроса и параллельных оплат
CREATE UNIQUE INDEX IF NOT EXISTS uniq_finance_tx_source
  ON t_p5815085_family_assistant_pro.finance_transactions(source_type, source_id)
  WHERE source_type IS NOT NULL AND source_id IS NOT NULL;

-- 2. Ограничение значений source_type — словарь источников
ALTER TABLE t_p5815085_family_assistant_pro.finance_transactions
  DROP CONSTRAINT IF EXISTS finance_tx_source_type_check;

ALTER TABLE t_p5815085_family_assistant_pro.finance_transactions
  ADD CONSTRAINT finance_tx_source_type_check
  CHECK (
    source_type IS NULL OR
    source_type IN (
      'home_utility',
      'shopping',
      'trip_expense',
      'garage',
      'pet_expense',
      'event_expense'
    )
  );
