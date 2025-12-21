-- Добавляем поле completed для отслеживания выполненных событий
ALTER TABLE t_p5815085_family_assistant_pro.calendar_events 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Индекс для быстрого поиска невыполненных событий
CREATE INDEX IF NOT EXISTS idx_calendar_events_completed ON t_p5815085_family_assistant_pro.calendar_events(completed) WHERE completed = false;

COMMENT ON COLUMN t_p5815085_family_assistant_pro.calendar_events.completed IS 'Флаг выполнения события (для задач/событий с чек-боксом)';