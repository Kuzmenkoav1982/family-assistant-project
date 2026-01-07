-- Добавляем поле paid_at в таблицу domovoy_donations
ALTER TABLE t_p5815085_family_assistant_pro.domovoy_donations
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;