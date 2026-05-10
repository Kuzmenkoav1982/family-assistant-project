-- ─────────────────────────────────────────────────────────────
-- Модуль «Дом»: квартира, коммуналка, показания, ремонты
-- ─────────────────────────────────────────────────────────────

-- Параметры квартиры (одна запись на семью)
CREATE TABLE IF NOT EXISTS home_apartment (
    family_id UUID PRIMARY KEY,
    address TEXT NOT NULL DEFAULT '',
    area NUMERIC(10, 2) NULL,
    rooms INTEGER NULL,
    ownership VARCHAR(32) NULL,  -- own | rent | mortgage
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Коммунальные платежи
CREATE TABLE IF NOT EXISTS home_utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    due_date DATE NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_home_utilities_family ON home_utilities(family_id);
CREATE INDEX IF NOT EXISTS idx_home_utilities_due ON home_utilities(family_id, due_date);

-- Показания счётчиков
CREATE TABLE IF NOT EXISTS home_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    meter_type VARCHAR(32) NOT NULL,   -- electricity | cold-water | hot-water | gas | heating | other
    reading_date DATE NOT NULL,
    value NUMERIC(14, 3) NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_home_meters_family ON home_meters(family_id);
CREATE INDEX IF NOT EXISTS idx_home_meters_type_date ON home_meters(family_id, meter_type, reading_date DESC);

-- Ремонты и работы по дому
CREATE TABLE IF NOT EXISTS home_repairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'planned',     -- planned | in-progress | done
    priority VARCHAR(32) NOT NULL DEFAULT 'medium',    -- low | medium | high
    estimate_rub NUMERIC(12, 2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_home_repairs_family ON home_repairs(family_id);
CREATE INDEX IF NOT EXISTS idx_home_repairs_status ON home_repairs(family_id, status);
