-- Часть 1: добавляем поля и таблицу настроек
ALTER TABLE t_p5815085_family_assistant_pro.dashboard_sections
  ADD COLUMN IF NOT EXISTS auto_table VARCHAR(64),
  ADD COLUMN IF NOT EXISTS auto_user_field VARCHAR(64),
  ADD COLUMN IF NOT EXISTS auto_min_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS auto_logic VARCHAR(32) DEFAULT 'count',
  ADD COLUMN IF NOT EXISTS auto_supported BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_user_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  section_id INT NOT NULL REFERENCES t_p5815085_family_assistant_pro.dashboard_sections(id),
  mode VARCHAR(16) NOT NULL DEFAULT 'auto',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_dash_user_settings_user
  ON t_p5815085_family_assistant_pro.dashboard_user_settings(user_id);
