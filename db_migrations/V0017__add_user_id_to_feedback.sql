-- Добавляем user_id если его нет
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id TEXT;