ALTER TABLE t_p5815085_family_assistant_pro.traditions
  ADD COLUMN IF NOT EXISTS family_uuid uuid NULL,
  ADD COLUMN IF NOT EXISTS next_date text NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_traditions_family_uuid
  ON t_p5815085_family_assistant_pro.traditions (family_uuid)
  WHERE family_uuid IS NOT NULL;
