-- Таблица для здоровья детей
CREATE TABLE IF NOT EXISTS children_health (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица прививок
CREATE TABLE IF NOT EXISTS children_vaccinations (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    vaccine VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица рецептов (фото)
CREATE TABLE IF NOT EXISTS children_prescriptions (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    photo_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица анализов (фото)
CREATE TABLE IF NOT EXISTS children_analyses (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица визитов к врачам
CREATE TABLE IF NOT EXISTS children_doctor_visits (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    doctor VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица приёма лекарств
CREATE TABLE IF NOT EXISTS children_medications (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    frequency VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица расписания приёма лекарств
CREATE TABLE IF NOT EXISTS children_medication_schedule (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_vaccinations_member ON children_vaccinations(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_member ON children_prescriptions(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_analyses_member ON children_analyses(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_doctor_visits_member ON children_doctor_visits(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_medications_member ON children_medications(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_medication_schedule_med ON children_medication_schedule(medication_id);
