
ALTER TABLE t_p5815085_family_assistant_pro.garage_service_records
  ADD COLUMN IF NOT EXISTS photo_urls text[] NULL DEFAULT '{}';
