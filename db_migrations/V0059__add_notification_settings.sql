-- Добавляем колонку с настройками уведомлений в push_subscriptions
ALTER TABLE t_p5815085_family_assistant_pro.push_subscriptions 
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "votings": true,
  "tasks": true,
  "shopping": true,
  "calendar": true,
  "medications": true,
  "birthdays": true,
  "subscription": true,
  "important_dates": true
}'::jsonb;

-- Добавляем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_family_id 
ON t_p5815085_family_assistant_pro.push_subscriptions(family_id);