CREATE TABLE IF NOT EXISTS dev_agent_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_uuid UUID UNIQUE,
  environment TEXT NOT NULL,
  title TEXT NOT NULL,
  default_mode TEXT NOT NULL DEFAULT 'explain',
  status TEXT NOT NULL DEFAULT 'active',
  created_by BIGINT NOT NULL,
  last_run_at TIMESTAMPTZ,
  pinned_patch_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dases_env_updated ON dev_agent_sessions(environment, updated_at DESC);

CREATE TABLE IF NOT EXISTS dev_agent_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES dev_agent_sessions(id),
  speaker TEXT NOT NULL,
  content_text TEXT NOT NULL,
  citations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_damsg_session ON dev_agent_messages(session_id, created_at);
