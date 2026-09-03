ALTER TABLE t_p5815085_family_assistant_pro.family_members
ADD COLUMN IF NOT EXISTS member_color VARCHAR(20);

COMMENT ON COLUMN t_p5815085_family_assistant_pro.family_members.member_color IS 'Персональный цвет члена семьи, выбирается вручную пользователем. Используется для различения событий в календаре.';