-- Добавляем поля для тегов, фото, участников, координат
ALTER TABLE leisure_activities 
ADD COLUMN IF NOT EXISTS tags TEXT[], 
ADD COLUMN IF NOT EXISTS photos TEXT[],
ADD COLUMN IF NOT EXISTS participants TEXT[],
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS share_token VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_leisure_tags ON leisure_activities USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_leisure_location ON leisure_activities (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_leisure_share_token ON leisure_activities (share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leisure_reminder ON leisure_activities (reminder_datetime) WHERE reminder_sent = false;

COMMENT ON COLUMN leisure_activities.tags IS 'Массив тегов для категоризации активностей';
COMMENT ON COLUMN leisure_activities.photos IS 'Массив URL фотографий из S3';
COMMENT ON COLUMN leisure_activities.participants IS 'Массив ID участников из family_members';
COMMENT ON COLUMN leisure_activities.latitude IS 'Широта для отображения на карте';
COMMENT ON COLUMN leisure_activities.longitude IS 'Долгота для отображения на карте';
COMMENT ON COLUMN leisure_activities.share_token IS 'Токен для публичного доступа к wishlist';
COMMENT ON COLUMN leisure_activities.is_public IS 'Доступна ли активность по публичной ссылке';
COMMENT ON COLUMN leisure_activities.reminder_datetime IS 'Дата и время напоминания';
COMMENT ON COLUMN leisure_activities.reminder_sent IS 'Было ли отправлено напоминание';
