-- Добавляем поля для кодов привязки в alice_users
ALTER TABLE t_p5815085_family_assistant_pro.alice_users
ADD COLUMN IF NOT EXISTS linking_code VARCHAR(8),
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS linked_at TIMESTAMP WITH TIME ZONE;

-- Создаём индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_alice_users_linking_code 
ON t_p5815085_family_assistant_pro.alice_users(linking_code);