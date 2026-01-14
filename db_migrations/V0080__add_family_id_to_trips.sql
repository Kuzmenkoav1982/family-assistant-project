-- Добавляем поле family_id в таблицу trips для изоляции поездок по семьям
ALTER TABLE t_p5815085_family_assistant_pro.trips 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES t_p5815085_family_assistant_pro.families(id);

-- Создаем индекс для быстрого поиска по семьям
CREATE INDEX IF NOT EXISTS idx_trips_family_id 
ON t_p5815085_family_assistant_pro.trips(family_id);

-- Обновляем существующие поездки: привязываем к семье создателя
UPDATE t_p5815085_family_assistant_pro.trips t
SET family_id = (
  SELECT fm.family_id 
  FROM t_p5815085_family_assistant_pro.family_members fm
  WHERE fm.user_id::text = t.created_by::text
  LIMIT 1
)
WHERE t.family_id IS NULL AND t.created_by IS NOT NULL;