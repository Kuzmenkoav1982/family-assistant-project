-- Добавляем поле role для разделения сообщений пользователя и ассистента
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Создаем индекс для быстрого поиска истории по семье
CREATE INDEX IF NOT EXISTS idx_chat_messages_family_created 
ON chat_messages(family_id, created_at DESC);