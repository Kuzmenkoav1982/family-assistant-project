-- Привязка денежной операции к обращению поддержки + защита от повторного начисления.
-- Сумма и баланс НЕ меняются: только метаданные существующей транзакции №177.
ALTER TABLE t_p5815085_family_assistant_pro.wallet_transactions
    ADD COLUMN IF NOT EXISTS support_ticket_id INTEGER NULL;

UPDATE t_p5815085_family_assistant_pro.wallet_transactions
   SET support_ticket_id = 42
 WHERE id = 177
   AND wallet_id = 91
   AND reason = 'support_compensation'
   AND amount_rub = 500.00
   AND support_ticket_id IS NULL;

-- Одно обращение — одна компенсация этого типа: повторная вставка по №42 будет отклонена БД.
CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_tx_support_compensation_per_ticket
    ON t_p5815085_family_assistant_pro.wallet_transactions (support_ticket_id, reason)
    WHERE support_ticket_id IS NOT NULL AND reason = 'support_compensation';