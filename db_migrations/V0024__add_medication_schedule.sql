-- Таблица для расписания приема лекарств
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.children_medication_schedule (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    time_of_day TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для отметок о приеме лекарств
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.children_medication_intake (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    schedule_id INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    taken_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(medication_id, schedule_id, scheduled_date)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_medication_schedule_medication ON t_p5815085_family_assistant_pro.children_medication_schedule(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_intake_medication ON t_p5815085_family_assistant_pro.children_medication_intake(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_intake_date ON t_p5815085_family_assistant_pro.children_medication_intake(scheduled_date);