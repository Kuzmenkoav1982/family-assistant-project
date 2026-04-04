
ALTER TABLE t_p5815085_family_assistant_pro.family_tree
  ADD COLUMN IF NOT EXISTS spouse_id integer NULL,
  ADD COLUMN IF NOT EXISTS gender varchar(10) NULL,
  ADD COLUMN IF NOT EXISTS birth_date date NULL,
  ADD COLUMN IF NOT EXISTS death_date date NULL,
  ADD COLUMN IF NOT EXISTS occupation varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS avatar varchar(10) NULL DEFAULT '👤',
  ADD COLUMN IF NOT EXISTS updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_family_tree_family_id 
  ON t_p5815085_family_assistant_pro.family_tree(family_id);

CREATE INDEX IF NOT EXISTS idx_family_tree_parent_id 
  ON t_p5815085_family_assistant_pro.family_tree(parent_id);
