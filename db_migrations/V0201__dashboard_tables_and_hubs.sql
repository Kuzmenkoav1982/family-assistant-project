-- Dashboard: хабы, разделы, шаги чек-листа, прогресс пользователей

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_hubs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  title VARCHAR(128) NOT NULL,
  icon VARCHAR(64) NOT NULL,
  color VARCHAR(32) NOT NULL,
  route VARCHAR(128) NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_sections (
  id SERIAL PRIMARY KEY,
  hub_id INT NOT NULL REFERENCES t_p5815085_family_assistant_pro.dashboard_hubs(id),
  slug VARCHAR(64) NOT NULL,
  title VARCHAR(128) NOT NULL,
  icon VARCHAR(64) NOT NULL,
  route VARCHAR(255) NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_sections_hub ON t_p5815085_family_assistant_pro.dashboard_sections(hub_id);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_steps (
  id SERIAL PRIMARY KEY,
  section_id INT NOT NULL REFERENCES t_p5815085_family_assistant_pro.dashboard_sections(id),
  slug VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_steps_section ON t_p5815085_family_assistant_pro.dashboard_steps(section_id);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  step_id INT NOT NULL REFERENCES t_p5815085_family_assistant_pro.dashboard_steps(id),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_progress_user ON t_p5815085_family_assistant_pro.dashboard_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_progress_step ON t_p5815085_family_assistant_pro.dashboard_user_progress(step_id);

INSERT INTO t_p5815085_family_assistant_pro.dashboard_hubs (slug, title, icon, color, route, position) VALUES
('family',       'Семья',         'Users',      '#EC4899', '/family-hub',      0),
('health',       'Здоровье',      'HeartPulse', '#F87171', '/health-hub',      1),
('nutrition',    'Питание',       'Apple',      '#FB923C', '/nutrition',       2),
('values',       'Ценности',      'Heart',      '#FBBF24', '/values-hub',      3),
('planning',     'Планирование',  'Target',     '#3B82F6', '/planning-hub',    4),
('finance',      'Финансы',       'Wallet',     '#10B981', '/finance',         5),
('household',    'Быт',           'Home',       '#D4A574', '/household-hub',   6),
('leisure',      'Путешествия',   'Plane',      '#22D3EE', '/leisure-hub',     7),
('development',  'Развитие',      'Rocket',     '#A855F7', '/development-hub', 8),
('family-code',  'Семейный код',  'Sparkles',   '#8B5CF6', '/family-matrix',   9),
('pets',         'Питомцы',       'PawPrint',   '#84CC16', '/pets',           10)
ON CONFLICT (slug) DO NOTHING;
