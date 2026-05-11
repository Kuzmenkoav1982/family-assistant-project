-- Domovoy Studio: Regression Suite
-- Банк контрольных вопросов по ролям + история прогонов.

CREATE TABLE IF NOT EXISTS domovoy_regression_questions (
  id            BIGSERIAL PRIMARY KEY,
  role_id       BIGINT NOT NULL REFERENCES domovoy_roles(id),
  question      TEXT NOT NULL,
  expected_hint TEXT,
  tags          TEXT[] DEFAULT '{}',
  weight        SMALLINT DEFAULT 1,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    BIGINT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regq_role ON domovoy_regression_questions(role_id, is_active);

CREATE TABLE IF NOT EXISTS domovoy_regression_runs (
  id              BIGSERIAL PRIMARY KEY,
  run_uuid        UUID NOT NULL UNIQUE,
  role_id         BIGINT NOT NULL REFERENCES domovoy_roles(id),
  role_code       TEXT NOT NULL,
  version_id      BIGINT REFERENCES domovoy_role_versions(id),
  version_number  INT,
  environment     TEXT NOT NULL,
  persona         TEXT,
  total_questions INT DEFAULT 0,
  passed          INT DEFAULT 0,
  failed          INT DEFAULT 0,
  errored         INT DEFAULT 0,
  avg_latency_ms  INT,
  total_input_tokens  INT DEFAULT 0,
  total_output_tokens INT DEFAULT 0,
  status          TEXT DEFAULT 'running',
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  triggered_by    BIGINT,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_regrun_role ON domovoy_regression_runs(role_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_regrun_version ON domovoy_regression_runs(version_id);

CREATE TABLE IF NOT EXISTS domovoy_regression_results (
  id              BIGSERIAL PRIMARY KEY,
  run_id          BIGINT NOT NULL REFERENCES domovoy_regression_runs(id),
  question_id     BIGINT REFERENCES domovoy_regression_questions(id),
  question_text   TEXT NOT NULL,
  expected_hint   TEXT,
  ai_response     TEXT,
  status          TEXT NOT NULL,
  error_code      TEXT,
  latency_ms      INT,
  input_tokens    INT,
  output_tokens   INT,
  trace_uuid      UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regres_run ON domovoy_regression_results(run_id);
