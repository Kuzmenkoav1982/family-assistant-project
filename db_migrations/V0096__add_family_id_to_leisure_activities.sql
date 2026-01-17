-- Добавляем family_id в leisure_activities для поддержки семейных мероприятий

ALTER TABLE t_p5815085_family_assistant_pro.leisure_activities 
ADD COLUMN IF NOT EXISTS family_id UUID;

-- Добавляем индекс для быстрого поиска по family_id
CREATE INDEX IF NOT EXISTS idx_leisure_activities_family_id 
ON t_p5815085_family_assistant_pro.leisure_activities(family_id);

-- Заполняем family_id для существующих записей на основе user_id
UPDATE t_p5815085_family_assistant_pro.leisure_activities la
SET family_id = fm.family_id
FROM t_p5815085_family_assistant_pro.family_members fm
WHERE la.user_id::text = fm.user_id::text
  AND la.family_id IS NULL;