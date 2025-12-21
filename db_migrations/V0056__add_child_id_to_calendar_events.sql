-- Добавляем поле child_id для привязки событий к конкретному ребёнку
ALTER TABLE t_p5815085_family_assistant_pro.calendar_events 
ADD COLUMN IF NOT EXISTS child_id UUID;

-- Индекс для быстрого поиска событий ребёнка
CREATE INDEX IF NOT EXISTS idx_calendar_events_child ON t_p5815085_family_assistant_pro.calendar_events(child_id);

-- Комментарий для документации
COMMENT ON COLUMN t_p5815085_family_assistant_pro.calendar_events.child_id IS 'ID ребёнка из family_members, если событие связано с конкретным ребёнком';