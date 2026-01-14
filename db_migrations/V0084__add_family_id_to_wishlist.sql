-- Добавить family_id к trip_wishlist
ALTER TABLE t_p5815085_family_assistant_pro.trip_wishlist 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES t_p5815085_family_assistant_pro.families(id);