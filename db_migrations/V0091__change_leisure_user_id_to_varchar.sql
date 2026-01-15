-- Изменяем тип колонки user_id с INTEGER на VARCHAR для поддержки UUID
ALTER TABLE leisure_activities ALTER COLUMN user_id TYPE VARCHAR(255);

-- Добавляем комментарий
COMMENT ON COLUMN leisure_activities.user_id IS 'UUID пользователя из таблицы users';
