-- Добавление полей для повторяющихся событий и напоминаний

ALTER TABLE t_p5815085_family_assistant_pro.calendar_events
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_days INTEGER,
ADD COLUMN IF NOT EXISTS reminder_date DATE,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20),
ADD COLUMN IF NOT EXISTS recurring_interval INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS recurring_end_date DATE,
ADD COLUMN IF NOT EXISTS recurring_days_of_week INTEGER[];

-- Создаём индекс для быстрого поиска событий с напоминаниями
CREATE INDEX IF NOT EXISTS idx_calendar_events_reminder_date ON t_p5815085_family_assistant_pro.calendar_events(reminder_date) WHERE reminder_enabled = true;

-- Создаём индекс для событий по дате
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON t_p5815085_family_assistant_pro.calendar_events(date);
