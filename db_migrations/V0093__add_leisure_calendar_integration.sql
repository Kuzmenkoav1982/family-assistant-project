-- Добавляем поля для интеграции досуга с семейным календарем
ALTER TABLE t_p5815085_family_assistant_pro.leisure_activities
ADD COLUMN IF NOT EXISTS show_in_calendar BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS visible_to TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'leisure';

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_leisure_show_in_calendar ON t_p5815085_family_assistant_pro.leisure_activities(show_in_calendar);
CREATE INDEX IF NOT EXISTS idx_leisure_date ON t_p5815085_family_assistant_pro.leisure_activities(date) WHERE show_in_calendar = TRUE;