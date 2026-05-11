CREATE TABLE IF NOT EXISTS dev_agent_runs (
  id BIGSERIAL PRIMARY KEY,
  run_uuid UUID UNIQUE,
  session_id BIGINT REFERENCES dev_agent_sessions(id),
  question_msg_id BIGINT REFERENCES dev_agent_messages(id),
  answer_msg_id BIGINT REFERENCES dev_agent_messages(id),
  environment TEXT NOT NULL,
  snapshot_id BIGINT REFERENCES dev_agent_repo_snapshots(id),
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'none',
  prompt_checksum TEXT,
  retrieval_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  error_code TEXT,
  full_trace_available BOOLEAN NOT NULL DEFAULT FALSE,
  full_trace_s3_key TEXT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_darun_env_created ON dev_agent_runs(environment, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_darun_mode_status ON dev_agent_runs(mode, status, created_at DESC);

CREATE TABLE IF NOT EXISTS dev_agent_tool_calls (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES dev_agent_runs(id),
  tool_name TEXT NOT NULL,
  tool_input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  tool_output_summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  latency_ms INT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_datool_run ON dev_agent_tool_calls(run_id, created_at);
