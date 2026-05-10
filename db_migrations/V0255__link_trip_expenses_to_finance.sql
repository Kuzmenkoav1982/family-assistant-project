-- Расширяем поддержку source_id: integer-источники (trip_expenses, garage и др.)
-- Меняем тип source_id с UUID на TEXT для универсальности.
-- UUID-источники продолжат работать (UUID валиден как text).

-- 1. Снимаем существующий уникальный индекс и пересоздадим после смены типа
DROP INDEX IF EXISTS t_p5815085_family_assistant_pro.uniq_finance_tx_source;

-- 2. Меняем тип
ALTER TABLE t_p5815085_family_assistant_pro.finance_transactions
  ALTER COLUMN source_id TYPE TEXT USING source_id::text;

-- 3. Восстанавливаем уникальный индекс (теперь по text)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_finance_tx_source
  ON t_p5815085_family_assistant_pro.finance_transactions(source_type, source_id)
  WHERE source_type IS NOT NULL AND source_id IS NOT NULL;

-- 4. Добавляем поле для связи trip_expenses → finance_transactions
ALTER TABLE t_p5815085_family_assistant_pro.trip_expenses
  ADD COLUMN IF NOT EXISTS linked_transaction_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_trip_expenses_linked_tx
  ON t_p5815085_family_assistant_pro.trip_expenses(linked_transaction_id);
