-- Добавляем поле для хранения прикрепленных файлов к лекарствам
ALTER TABLE medications ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Создаём таблицу для отслеживания приёмов лекарств
CREATE TABLE IF NOT EXISTS medication_intakes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    medication_id TEXT NOT NULL REFERENCES medications(id),
    reminder_id TEXT REFERENCES medication_reminders(id),
    scheduled_time TIME NOT NULL,
    scheduled_date DATE NOT NULL,
    actual_time TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medication_intakes_medication_id ON medication_intakes(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_intakes_scheduled_date ON medication_intakes(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_medication_intakes_status ON medication_intakes(status);

COMMENT ON TABLE medication_intakes IS 'История приёмов лекарств';
COMMENT ON COLUMN medication_intakes.status IS 'Статус: pending, taken, skipped, missed';