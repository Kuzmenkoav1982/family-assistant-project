-- Добавляем поле для эмблемы семьи
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS logo_url TEXT;