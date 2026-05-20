ALTER TABLE t_p5815085_family_assistant_pro.status_banners
  DROP CONSTRAINT status_banners_audience_chk;

UPDATE t_p5815085_family_assistant_pro.status_banners
  SET audience = 'public' WHERE audience = 'all';

UPDATE t_p5815085_family_assistant_pro.status_banners
  SET audience = 'admin' WHERE audience = 'admins';

ALTER TABLE t_p5815085_family_assistant_pro.status_banners
  ALTER COLUMN audience SET DEFAULT 'public';

ALTER TABLE t_p5815085_family_assistant_pro.status_banners
  ADD CONSTRAINT status_banners_audience_chk
  CHECK (audience IN ('public', 'authenticated', 'admin'));
