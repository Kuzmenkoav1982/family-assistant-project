-- Добавление поля notified для отслеживания отправленных уведомлений
ALTER TABLE geofence_events 
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE;