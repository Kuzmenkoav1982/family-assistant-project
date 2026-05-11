CREATE TABLE IF NOT EXISTS dev_agent_repo_snapshots (
  id BIGSERIAL PRIMARY KEY,
  environment TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
