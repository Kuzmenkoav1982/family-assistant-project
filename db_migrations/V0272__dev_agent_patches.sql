CREATE TABLE IF NOT EXISTS dev_agent_patches (
  id BIGSERIAL PRIMARY KEY,
  patch_uuid UUID UNIQUE,
  run_id BIGINT REFERENCES dev_agent_runs(id),
  session_id BIGINT REFERENCES dev_agent_sessions(id),
  environment TEXT NOT NULL,
  base_snapshot_id BIGINT REFERENCES dev_agent_repo_snapshots(id),
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  unified_diff_text TEXT,
  files_changed_count INT NOT NULL DEFAULT 0,
  additions INT NOT NULL DEFAULT 0,
  deletions INT NOT NULL DEFAULT 0,
  lint_status TEXT NOT NULL DEFAULT 'not_run',
  tests_status TEXT NOT NULL DEFAULT 'not_run',
  build_status TEXT NOT NULL DEFAULT 'not_run',
  export_s3_key TEXT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dapatch_env_status ON dev_agent_patches(environment, status, updated_at DESC);
