CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_roles (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(64) UNIQUE NOT NULL,
  name         VARCHAR(128) NOT NULL,
  emoji        VARCHAR(16),
  icon         VARCHAR(64),
  color        VARCHAR(16),
  description  TEXT,
  sort_order   INT DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   INT,
  updated_by   INT
);
CREATE INDEX IF NOT EXISTS idx_domovoy_roles_active ON "t_p5815085_family_assistant_pro".domovoy_roles(is_active, sort_order);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_assets (
  id              BIGSERIAL PRIMARY KEY,
  kind            VARCHAR(32) NOT NULL,
  name            VARCHAR(255),
  alt             TEXT,
  url             TEXT NOT NULL,
  s3_key          TEXT,
  width           INT,
  height          INT,
  size_bytes      BIGINT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      INT
);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_role_versions (
  id                BIGSERIAL PRIMARY KEY,
  role_id           INT NOT NULL REFERENCES "t_p5815085_family_assistant_pro".domovoy_roles(id),
  environment       VARCHAR(8) NOT NULL CHECK (environment IN ('stage','prod')),
  version_number    INT NOT NULL,
  status            VARCHAR(16) NOT NULL CHECK (status IN ('draft','published','archived')),
  goal              TEXT,
  do_rules          TEXT,
  dont_rules        TEXT,
  tone              VARCHAR(64),
  response_length   VARCHAR(32),
  cta_template      TEXT,
  greeting          TEXT,
  examples          JSONB,
  role_prompt       TEXT NOT NULL,
  safety_rules      TEXT,
  formatting_rules  TEXT,
  variables_schema  JSONB,
  hubs              JSONB,
  pages             JSONB,
  entry_points      JSONB,
  ai_config_override JSONB,
  context_sources_override JSONB,
  asset_id          BIGINT REFERENCES "t_p5815085_family_assistant_pro".domovoy_assets(id),
  bg_class          VARCHAR(64),
  image_css         TEXT,
  published_at      TIMESTAMPTZ,
  published_by      INT,
  archived_at       TIMESTAMPTZ,
  prompt_checksum   VARCHAR(64),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        INT,
  UNIQUE (role_id, environment, version_number)
);
CREATE INDEX IF NOT EXISTS idx_drv_role_env_status ON "t_p5815085_family_assistant_pro".domovoy_role_versions(role_id, environment, status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_drv_one_published
  ON "t_p5815085_family_assistant_pro".domovoy_role_versions(role_id, environment)
  WHERE status = 'published';

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_ai_configs (
  id              SERIAL PRIMARY KEY,
  environment     VARCHAR(8) NOT NULL CHECK (environment IN ('stage','prod')),
  status          VARCHAR(16) NOT NULL CHECK (status IN ('draft','published','archived')),
  version_number  INT NOT NULL,
  provider        VARCHAR(32) NOT NULL DEFAULT 'yandexgpt',
  model_uri       VARCHAR(128) NOT NULL,
  fallback_model_uri VARCHAR(128),
  temperature     NUMERIC(3,2) DEFAULT 0.7,
  max_tokens      INT DEFAULT 3000,
  history_depth   INT DEFAULT 10,
  timeout_sec     INT DEFAULT 30,
  retry_count     INT DEFAULT 1,
  retry_backoff_ms INT DEFAULT 500,
  price_rub       NUMERIC(8,2) DEFAULT 3.00,
  limit_family_day INT DEFAULT 1000,
  limit_user_hour INT DEFAULT 60,
  debug_log_level VARCHAR(16) DEFAULT 'info',
  persona_domovoy TEXT,
  persona_neutral TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INT,
  published_at    TIMESTAMPTZ,
  published_by    INT,
  UNIQUE (environment, version_number)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_aic_one_published
  ON "t_p5815085_family_assistant_pro".domovoy_ai_configs(environment)
  WHERE status = 'published';

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_context_sources (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(64) UNIQUE NOT NULL,
  name            VARCHAR(128) NOT NULL,
  description     TEXT,
  is_enabled_global BOOLEAN DEFAULT TRUE,
  token_limit     INT DEFAULT 500,
  priority        INT DEFAULT 0,
  roles_whitelist JSONB,
  example_payload JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_asset_usages (
  id              BIGSERIAL PRIMARY KEY,
  asset_id        BIGINT NOT NULL REFERENCES "t_p5815085_family_assistant_pro".domovoy_assets(id),
  usage_type      VARCHAR(32) NOT NULL,
  ref_role_id     INT REFERENCES "t_p5815085_family_assistant_pro".domovoy_roles(id),
  ref_page        VARCHAR(255),
  ref_component   VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dau_asset ON "t_p5815085_family_assistant_pro".domovoy_asset_usages(asset_id);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_prompt_traces (
  id                  BIGSERIAL PRIMARY KEY,
  trace_uuid          UUID NOT NULL UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  family_id           INT,
  user_id             INT,
  session_id          VARCHAR(64),
  environment         VARCHAR(8) NOT NULL DEFAULT 'prod',
  role_code           VARCHAR(64),
  role_version_id     BIGINT REFERENCES "t_p5815085_family_assistant_pro".domovoy_role_versions(id),
  ai_config_id        INT REFERENCES "t_p5815085_family_assistant_pro".domovoy_ai_configs(id),
  entry_point         VARCHAR(64),
  model               VARCHAR(128),
  temperature         NUMERIC(3,2),
  max_tokens          INT,
  history_depth       INT,
  input_tokens        INT,
  output_tokens       INT,
  latency_ms          INT,
  status              VARCHAR(16) NOT NULL DEFAULT 'ok',
  error_code          VARCHAR(64),
  feedback_score      SMALLINT,
  prompt_checksum     VARCHAR(64),
  context_summary     JSONB,
  full_trace_available BOOLEAN DEFAULT FALSE,
  full_trace_s3_key   TEXT,
  full_trace_reason   VARCHAR(32)
);
CREATE INDEX IF NOT EXISTS idx_dpt_family_created ON "t_p5815085_family_assistant_pro".domovoy_prompt_traces(family_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dpt_role_created ON "t_p5815085_family_assistant_pro".domovoy_prompt_traces(role_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dpt_status ON "t_p5815085_family_assistant_pro".domovoy_prompt_traces(status, created_at DESC);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_debug_targets (
  id              BIGSERIAL PRIMARY KEY,
  scope           VARCHAR(16) NOT NULL,
  family_id       INT,
  role_code       VARCHAR(64),
  enabled_until   TIMESTAMPTZ NOT NULL,
  reason          TEXT,
  created_by      INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ddt_enabled_until ON "t_p5815085_family_assistant_pro".domovoy_debug_targets(enabled_until);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_test_cases (
  id              BIGSERIAL PRIMARY KEY,
  role_id         INT NOT NULL REFERENCES "t_p5815085_family_assistant_pro".domovoy_roles(id),
  name            VARCHAR(255) NOT NULL,
  question        TEXT NOT NULL,
  must_contain    JSONB,
  must_not_contain JSONB,
  expected_style  TEXT,
  is_critical     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INT
);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_test_runs (
  id              BIGSERIAL PRIMARY KEY,
  test_case_id    BIGINT NOT NULL REFERENCES "t_p5815085_family_assistant_pro".domovoy_test_cases(id),
  role_version_id BIGINT REFERENCES "t_p5815085_family_assistant_pro".domovoy_role_versions(id),
  environment     VARCHAR(8) NOT NULL,
  response        TEXT,
  passed          BOOLEAN,
  score           NUMERIC(3,2),
  trace_uuid      UUID,
  notes           TEXT,
  ran_at          TIMESTAMPTZ DEFAULT NOW(),
  ran_by          INT
);
CREATE INDEX IF NOT EXISTS idx_dtr_case ON "t_p5815085_family_assistant_pro".domovoy_test_runs(test_case_id, ran_at DESC);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_audit_log (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  actor_user_id   INT,
  actor_ip        VARCHAR(64),
  event_type      VARCHAR(64) NOT NULL,
  entity_type     VARCHAR(64),
  entity_id       BIGINT,
  environment     VARCHAR(8),
  before_data     JSONB,
  after_data      JSONB,
  notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_dal_entity ON "t_p5815085_family_assistant_pro".domovoy_audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dal_actor ON "t_p5815085_family_assistant_pro".domovoy_audit_log(actor_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS "t_p5815085_family_assistant_pro".domovoy_feature_flags (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(64) NOT NULL,
  description     TEXT,
  environment     VARCHAR(8) NOT NULL,
  is_enabled      BOOLEAN DEFAULT FALSE,
  payload         JSONB,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      INT,
  UNIQUE (code, environment)
);
