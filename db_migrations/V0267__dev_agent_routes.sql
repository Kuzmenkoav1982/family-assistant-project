CREATE TABLE IF NOT EXISTS dev_agent_routes (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id BIGINT NOT NULL REFERENCES dev_agent_repo_snapshots(id),
  route_path TEXT NOT NULL,
  page_component TEXT,
  source_file_id BIGINT REFERENCES dev_agent_files(id),
  area TEXT NOT NULL,
  auth_scope TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_daroute_snap_area ON dev_agent_routes(snapshot_id, area);
