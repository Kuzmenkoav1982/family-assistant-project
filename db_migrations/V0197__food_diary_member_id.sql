-- bug14/bug15: добавляем member_id (UUID) в food_diary для связи с family_members
ALTER TABLE t_p5815085_family_assistant_pro.food_diary
  ADD COLUMN IF NOT EXISTS member_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_food_diary_member_id
  ON t_p5815085_family_assistant_pro.food_diary(member_id, date DESC);
