ALTER TABLE dev_agent_files ADD COLUMN IF NOT EXISTS lang_code TEXT;
ALTER TABLE dev_agent_files ADD COLUMN IF NOT EXISTS file_category TEXT NOT NULL DEFAULT 'other';
CREATE INDEX IF NOT EXISTS idx_dafile_snap_cat ON dev_agent_files(snapshot_id, file_category);
