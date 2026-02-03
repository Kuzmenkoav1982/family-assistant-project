-- Добавляем поле для указания типа прививки (плановая или выполненная)
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS scheduled_age_months INTEGER;
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS notes TEXT;

-- Создаём таблицу плановых прививок (справочник)
CREATE TABLE IF NOT EXISTS vaccination_schedule (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    age_months INTEGER NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vaccination_schedule_age ON vaccination_schedule(age_months);

COMMENT ON TABLE vaccination_schedule IS 'Справочник плановых прививок по возрасту';
COMMENT ON COLUMN vaccinations.status IS 'Статус: completed, planned, skipped';
COMMENT ON COLUMN vaccinations.scheduled_age_months IS 'Плановый возраст для прививки (в месяцах)';

-- Вставляем типовые плановые прививки (Национальный календарь РФ)
INSERT INTO vaccination_schedule (name, age_months, description, is_mandatory) VALUES
('Гепатит B (1-я доза)', 0, 'В первые 24 часа жизни', true),
('БЦЖ', 0, 'На 3-7 день жизни', true),
('Гепатит B (2-я доза)', 1, 'В 1 месяц', true),
('Пневмококковая инфекция (1-я доза)', 2, 'В 2 месяца', true),
('АКДС (1-я доза)', 3, 'Коклюш, дифтерия, столбняк', true),
('Полиомиелит (1-я доза)', 3, 'Инактивированная вакцина', true),
('Гемофильная инфекция (1-я доза)', 3, 'Для детей из групп риска', false),
('Пневмококковая инфекция (2-я доза)', 4, 'В 4.5 месяца', true),
('АКДС (2-я доза)', 4, 'В 4.5 месяца', true),
('Полиомиелит (2-я доза)', 4, 'В 4.5 месяца', true),
('Гемофильная инфекция (2-я доза)', 4, 'В 4.5 месяца', false),
('Гепатит B (3-я доза)', 6, 'В 6 месяцев', true),
('АКДС (3-я доза)', 6, 'В 6 месяцев', true),
('Полиомиелит (3-я доза)', 6, 'В 6 месяцев', true),
('Гемофильная инфекция (3-я доза)', 6, 'В 6 месяцев', false),
('Корь, краснуха, паротит', 12, 'В 1 год', true),
('Пневмококковая инфекция (ревакцинация)', 15, 'В 15 месяцев', true),
('АКДС (ревакцинация 1)', 18, 'В 1.5 года', true),
('Полиомиелит (ревакцинация 1)', 18, 'В 1.5 года', true),
('Полиомиелит (ревакцинация 2)', 20, 'В 20 месяцев', true),
('АКДС (ревакцинация 2)', 84, 'В 7 лет (перед школой)', true),
('Корь, краснуха, паротит (ревакцинация)', 72, 'В 6 лет', true),
('Грипп (ежегодно)', 6, 'С 6 месяцев ежегодно', false)
ON CONFLICT DO NOTHING;