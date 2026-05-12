-- Этап 1 триады: расширение life_goals + новые таблицы для milestones/KR/checkins/links
-- Принцип: расширяем существующую life_goals, не ломаем legacy.

-- 1. Новые поля в life_goals
ALTER TABLE life_goals
  ADD COLUMN IF NOT EXISTS framework_type VARCHAR(32) NOT NULL DEFAULT 'generic',
  ADD COLUMN IF NOT EXISTS framework_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scope VARCHAR(16) NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS horizon VARCHAR(16) NULL,
  ADD COLUMN IF NOT EXISTS season VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS why_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS linked_sphere_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_from VARCHAR(32) NULL,
  ADD COLUMN IF NOT EXISTS source_context JSONB NULL,
  ADD COLUMN IF NOT EXISTS execution_progress INTEGER NULL,
  ADD COLUMN IF NOT EXISTS outcome_signal JSONB NULL;

-- Бэкфил framework_type из старого framework, чтобы legacy цели не ломались
UPDATE life_goals
SET framework_type = CASE
  WHEN framework IS NULL OR framework = '' THEN 'generic'
  WHEN framework IN ('smart', 'okr', 'wheel', 'generic') THEN framework
  ELSE 'generic'
END
WHERE framework_type = 'generic';

-- Бэкфил scope: если owner_id заполнен — personal, иначе family
UPDATE life_goals
SET scope = CASE WHEN owner_id IS NULL THEN 'family' ELSE 'personal' END;

-- Индексы для часто используемых выборок
CREATE INDEX IF NOT EXISTS idx_life_goals_family_status ON life_goals(family_id, status);
CREATE INDEX IF NOT EXISTS idx_life_goals_owner ON life_goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_life_goals_framework ON life_goals(framework_type);

-- 2. Milestones (вехи цели)
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES life_goals(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  due_date DATE NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  order_index INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_status ON goal_milestones(goal_id, status);

-- 3. Key Results (для OKR)
CREATE TABLE IF NOT EXISTS goal_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES life_goals(id),
  title VARCHAR(255) NOT NULL,
  metric_type VARCHAR(32) NOT NULL DEFAULT 'number',
  unit VARCHAR(32) NULL,
  start_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  current_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  target_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  due_date DATE NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_goal_key_results_goal ON goal_key_results(goal_id);

-- 4. Check-ins (еженедельные сверки)
CREATE TABLE IF NOT EXISTS goal_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES life_goals(id),
  author_id UUID NULL REFERENCES family_members(id),
  period_start DATE NULL,
  period_end DATE NULL,
  summary TEXT NULL,
  blockers TEXT NULL,
  next_step TEXT NULL,
  self_assessment INTEGER NULL,
  data JSONB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_goal_checkins_goal ON goal_checkins(goal_id, created_at DESC);

-- 5. Action links — связь цели с задачами/привычками/ритуалами/событиями
CREATE TABLE IF NOT EXISTS goal_action_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES life_goals(id),
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  milestone_id UUID NULL REFERENCES goal_milestones(id),
  key_result_id UUID NULL REFERENCES goal_key_results(id),
  meta JSONB NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (goal_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_goal_action_links_goal ON goal_action_links(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_action_links_entity ON goal_action_links(entity_type, entity_id);

-- 6. Комментарии для документации
COMMENT ON COLUMN life_goals.framework_type IS 'Канонический тип методики: generic | smart | okr | wheel';
COMMENT ON COLUMN life_goals.framework_state IS 'Структурные данные конкретной методики (SMART-грани, OKR-конфиг, Wheel-замеры)';
COMMENT ON COLUMN life_goals.scope IS 'personal или family';
COMMENT ON COLUMN life_goals.horizon IS 'quarter | season | year | long';
COMMENT ON COLUMN life_goals.linked_sphere_ids IS 'JSON-массив id сфер портфолио';
COMMENT ON COLUMN life_goals.created_from IS 'workshop | portfolio | development | external';
COMMENT ON COLUMN life_goals.execution_progress IS 'Кэш вычисляемого прогресса. Источник истины — milestones/KR/tasks';
COMMENT ON COLUMN life_goals.outcome_signal IS 'JSON: изменения скоров сфер, achievements';
