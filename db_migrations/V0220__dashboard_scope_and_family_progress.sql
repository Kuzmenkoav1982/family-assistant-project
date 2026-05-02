-- Добавляем scope для хабов: 'family' (общий) или 'personal' (личный)
ALTER TABLE t_p5815085_family_assistant_pro.dashboard_hubs
ADD COLUMN IF NOT EXISTS scope VARCHAR(16) NOT NULL DEFAULT 'family';

-- Размечаем личные хабы
UPDATE t_p5815085_family_assistant_pro.dashboard_hubs
SET scope = 'personal'
WHERE slug IN ('health', 'nutrition', 'values', 'development', 'pets');

-- Общие хабы остаются с scope='family' (по дефолту)
-- family, planning, finance, household, leisure, family-code

-- Прогресс на уровне семьи (для общих хабов)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_family_progress (
  family_id VARCHAR(64) NOT NULL,
  step_id INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  completed_by VARCHAR(64) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (family_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_family_progress_family
  ON t_p5815085_family_assistant_pro.dashboard_family_progress(family_id);

-- Настройки режима (авто/ручной) на уровне семьи
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dashboard_family_settings (
  family_id VARCHAR(64) NOT NULL,
  section_id INTEGER NOT NULL,
  mode VARCHAR(16) NOT NULL DEFAULT 'manual',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (family_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_family_settings_family
  ON t_p5815085_family_assistant_pro.dashboard_family_settings(family_id);

-- Снимок общего прогресса семьи для рейтинга (обновляется при каждом запросе)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_dashboard_snapshot (
  family_id VARCHAR(64) PRIMARY KEY,
  family_name VARCHAR(255) NULL,
  overall_progress INTEGER NOT NULL DEFAULT 0,
  active_hubs INTEGER NOT NULL DEFAULT 0,
  completed_sections INTEGER NOT NULL DEFAULT 0,
  members_count INTEGER NOT NULL DEFAULT 1,
  activity_score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_family_snapshot_overall
  ON t_p5815085_family_assistant_pro.family_dashboard_snapshot(overall_progress DESC);
