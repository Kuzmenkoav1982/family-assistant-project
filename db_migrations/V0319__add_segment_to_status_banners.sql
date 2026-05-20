ALTER TABLE t_p5815085_family_assistant_pro.status_banners
  ADD COLUMN IF NOT EXISTS segment TEXT NULL DEFAULT NULL;

ALTER TABLE t_p5815085_family_assistant_pro.status_banners
  ADD CONSTRAINT status_banners_segment_chk
  CHECK (segment IS NULL OR segment IN ('registered_last_7d'));
