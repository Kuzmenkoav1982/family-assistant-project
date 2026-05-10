-- Добавляем поля для связи между модулями
-- finance_transactions ← knows source (home utility)
ALTER TABLE t_p5815085_family_assistant_pro.finance_transactions
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS source_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_finance_tx_source
  ON t_p5815085_family_assistant_pro.finance_transactions(source_type, source_id);

-- home_utilities ← knows linked transaction
ALTER TABLE t_p5815085_family_assistant_pro.home_utilities
  ADD COLUMN IF NOT EXISTS linked_transaction_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_home_utilities_linked_tx
  ON t_p5815085_family_assistant_pro.home_utilities(linked_transaction_id);
