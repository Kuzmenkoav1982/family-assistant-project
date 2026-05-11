CREATE TABLE IF NOT EXISTS dev_agent_files (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id BIGINT NOT NULL REFERENCES dev_agent_repo_snapshots(id),
  path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  line_count INT,
  sha256 TEXT,
  raw_s3_key TEXT,
  is_indexed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (snapshot_id, path)
);
