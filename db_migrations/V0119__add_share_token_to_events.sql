-- Добавить поле для публичной ссылки на праздник
ALTER TABLE family_events ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Индекс для быстрого поиска по токену
CREATE INDEX IF NOT EXISTS idx_family_events_share_token ON family_events(share_token) WHERE share_token IS NOT NULL;
