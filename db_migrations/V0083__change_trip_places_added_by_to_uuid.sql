-- Изменяем тип поля added_by с integer на UUID
ALTER TABLE t_p5815085_family_assistant_pro.trip_places 
ALTER COLUMN added_by TYPE UUID USING NULL;

-- Комментарий к полю
COMMENT ON COLUMN t_p5815085_family_assistant_pro.trip_places.added_by IS 'UUID пользователя, добавившего место';
