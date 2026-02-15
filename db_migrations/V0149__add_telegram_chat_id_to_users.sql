ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT NULL;
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON users(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
COMMENT ON COLUMN users.telegram_chat_id IS 'Telegram chat ID для отправки уведомлений (привязка через бот)';