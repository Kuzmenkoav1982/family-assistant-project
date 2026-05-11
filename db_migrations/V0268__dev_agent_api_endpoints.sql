CREATE TABLE IF NOT EXISTS dev_agent_api_endpoints (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id BIGINT NOT NULL REFERENCES dev_agent_repo_snapshots(id),
  function_name TEXT NOT NULL,
  action_name TEXT,
  http_method TEXT,
  endpoint_path TEXT,
  source_file_id BIGINT REFERENCES dev_agent_files(id),
  auth_scope TEXT,
  schema_in JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_out JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_daapi_snap_fn ON dev_agent_api_endpoints(snapshot_id, function_name);
