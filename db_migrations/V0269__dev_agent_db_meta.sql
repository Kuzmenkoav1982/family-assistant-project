CREATE TABLE IF NOT EXISTS dev_agent_db_snapshots (
  id BIGSERIAL PRIMARY KEY,
  environment TEXT NOT NULL,
  source_type TEXT NOT NULL,
  schema_name TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_dadbsnap_env_active ON dev_agent_db_snapshots(environment, is_active);

CREATE TABLE IF NOT EXISTS dev_agent_db_tables (
  id BIGSERIAL PRIMARY KEY,
  db_snapshot_id BIGINT NOT NULL REFERENCES dev_agent_db_snapshots(id),
  table_name TEXT NOT NULL,
  columns_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  indexes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  foreign_keys_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (db_snapshot_id, table_name)
);
