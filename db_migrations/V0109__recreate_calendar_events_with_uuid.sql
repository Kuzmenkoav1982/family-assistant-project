-- Создаём новую таблицу с правильными типами
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.calendar_events_new (
    id SERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time VARCHAR(10),
    duration VARCHAR(50),
    location VARCHAR(255),
    category VARCHAR(100),
    created_by INTEGER,
    assigned_to TEXT[],
    visibility VARCHAR(20) DEFAULT 'family',
    color VARCHAR(20),
    reminder_time VARCHAR(10),
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_days INTEGER,
    reminder_date DATE,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20),
    recurring_interval INTEGER DEFAULT 1,
    recurring_end_date DATE,
    recurring_days_of_week INTEGER[],
    attendees JSONB,
    child_id UUID,
    completed BOOLEAN DEFAULT false,
    created_by_name VARCHAR(255),
    created_by_avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Копируем данные из старой таблицы (если их можно преобразовать)
-- Пропускаем, т.к. старые данные с family_id=1 не совместимы с UUID

-- Создаём индексы
CREATE INDEX idx_calendar_events_new_family_id ON t_p5815085_family_assistant_pro.calendar_events_new(family_id);
CREATE INDEX idx_calendar_events_new_date ON t_p5815085_family_assistant_pro.calendar_events_new(date);
CREATE INDEX idx_calendar_events_new_reminder_date ON t_p5815085_family_assistant_pro.calendar_events_new(reminder_date) WHERE reminder_enabled = true;

-- Переименовываем таблицы
ALTER TABLE t_p5815085_family_assistant_pro.calendar_events RENAME TO calendar_events_old;
ALTER TABLE t_p5815085_family_assistant_pro.calendar_events_new RENAME TO calendar_events;
