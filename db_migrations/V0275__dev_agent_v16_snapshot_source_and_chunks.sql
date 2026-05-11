-- V1.6 Dev Agent: snapshot source metadata + chunk extra fields
ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_repo_snapshots ADD COLUMN IF NOT EXISTS source_kind TEXT NOT NULL DEFAULT 'seed';
ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_repo_snapshots ADD COLUMN IF NOT EXISTS source_repo TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_repo_snapshots ADD COLUMN IF NOT EXISTS source_ref TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_repo_snapshots ADD COLUMN IF NOT EXISTS source_meta JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_code_chunks ADD COLUMN IF NOT EXISTS sha256 TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_code_chunks ADD COLUMN IF NOT EXISTS lang_code TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_code_chunks ADD COLUMN IF NOT EXISTS byte_size INT;
CREATE INDEX IF NOT EXISTS idx_dachunk_lang ON t_p5815085_family_assistant_pro.dev_agent_code_chunks(lang_code);

ALTER TABLE t_p5815085_family_assistant_pro.dev_agent_files ADD COLUMN IF NOT EXISTS imports JSONB NOT NULL DEFAULT '[]'::jsonb;
