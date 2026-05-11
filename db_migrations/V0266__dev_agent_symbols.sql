CREATE TABLE IF NOT EXISTS dev_agent_symbols (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id BIGINT NOT NULL REFERENCES dev_agent_repo_snapshots(id),
  file_id BIGINT NOT NULL REFERENCES dev_agent_files(id),
  symbol_name TEXT NOT NULL,
  symbol_kind TEXT NOT NULL,
  exported BOOLEAN NOT NULL DEFAULT FALSE,
  line_no INT,
  signature_text TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dasym_snap_kind ON dev_agent_symbols(snapshot_id, symbol_kind);
CREATE INDEX IF NOT EXISTS idx_dasym_name ON dev_agent_symbols(symbol_name);
