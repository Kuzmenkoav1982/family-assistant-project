-- Таблица для отслеживания кликов по разделам велком-страницы
CREATE TABLE IF NOT EXISTS welcome_section_clicks (
  id SERIAL PRIMARY KEY,
  section_index INTEGER NOT NULL,
  section_title VARCHAR(255) NOT NULL,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  user_agent TEXT
);

-- Индексы для быстрого получения статистики
CREATE INDEX IF NOT EXISTS idx_welcome_section_clicks_section_index ON welcome_section_clicks(section_index);
CREATE INDEX IF NOT EXISTS idx_welcome_section_clicks_clicked_at ON welcome_section_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_welcome_section_clicks_session_id ON welcome_section_clicks(session_id);