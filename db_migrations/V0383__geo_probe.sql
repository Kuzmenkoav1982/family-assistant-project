ALTER TABLE t_p5815085_family_assistant_pro.geofences
    ADD COLUMN IF NOT EXISTS zone_status text NOT NULL DEFAULT 'active';
