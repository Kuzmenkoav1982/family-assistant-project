-- Support Desk: расширение таблицы feedback
ALTER TABLE t_p5815085_family_assistant_pro.feedback
  ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS family_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS ai_summary TEXT NULL,
  ADD COLUMN IF NOT EXISTS ai_draft TEXT NULL,
  ADD COLUMN IF NOT EXISTS ai_category VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS ai_priority VARCHAR(10) NULL;

-- Таблица сообщений по обращению (история ответов и внутренних заметок)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.feedback_messages (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'reply',
  body TEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);