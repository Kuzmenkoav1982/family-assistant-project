-- Добавляем user_id в таблицу врачей и created_at
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_doctors_user ON doctors(user_id);
