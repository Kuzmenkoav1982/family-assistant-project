-- Добавляем колонку reset_code для SMS кодов восстановления
ALTER TABLE t_p5815085_family_assistant_pro.password_reset_tokens 
ADD COLUMN IF NOT EXISTS reset_code VARCHAR(6);

-- Создаем индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_reset_code 
ON t_p5815085_family_assistant_pro.password_reset_tokens(reset_code);