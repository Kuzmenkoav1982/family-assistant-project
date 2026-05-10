-- Связь Покупки → Финансы (вторая петля ОС)
-- Добавляем опциональную цену и связь с финансовой транзакцией.

ALTER TABLE t_p5815085_family_assistant_pro.shopping_items_v2
  ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) NULL,
  ADD COLUMN IF NOT EXISTS linked_transaction_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_shopping_v2_linked_tx
  ON t_p5815085_family_assistant_pro.shopping_items_v2(linked_transaction_id);

-- Добавляем 'shopping' в словарь источников финансовых транзакций
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
