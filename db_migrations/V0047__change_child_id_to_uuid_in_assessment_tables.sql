-- Изменяем типы child_id и family_id на UUID в таблицах оценки развития
ALTER TABLE t_p5815085_family_assistant_pro.child_development_assessments 
  ALTER COLUMN child_id TYPE VARCHAR(255),
  ALTER COLUMN family_id TYPE VARCHAR(255);

ALTER TABLE t_p5815085_family_assistant_pro.development_plans 
  ALTER COLUMN child_id TYPE VARCHAR(255),
  ALTER COLUMN family_id TYPE VARCHAR(255);
