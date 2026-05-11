CREATE TABLE IF NOT EXISTS dev_agent_code_chunks (
  id BIGSERIAL PRIMARY KEY,
  snapshot_id BIGINT NOT NULL REFERENCES dev_agent_repo_snapshots(id),
  file_id BIGINT NOT NULL REFERENCES dev_agent_files(id),
  chunk_index INT NOT NULL,
  chunk_kind TEXT NOT NULL,
  symbol_name TEXT,
  start_line INT,
  end_line INT,
  token_estimate INT,
  chunk_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (file_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_dachunk_snap_file ON dev_agent_code_chunks(snapshot_id, file_id);
CREATE INDEX IF NOT EXISTS idx_dachunk_symbol ON dev_agent_code_chunks(symbol_name);
