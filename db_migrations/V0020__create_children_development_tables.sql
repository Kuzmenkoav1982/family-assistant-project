-- Таблица областей развития
CREATE TABLE IF NOT EXISTS children_development (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    area VARCHAR(50) NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 0,
    target_level INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица активностей (секции, кружки)
CREATE TABLE IF NOT EXISTS children_activities (
    id SERIAL PRIMARY KEY,
    development_id INTEGER NOT NULL,
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    schedule VARCHAR(255),
    cost INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тестов
CREATE TABLE IF NOT EXISTS children_tests (
    id SERIAL PRIMARY KEY,
    development_id INTEGER,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_by VARCHAR(255),
    assigned_date DATE,
    completed_date DATE,
    score INTEGER,
    reward_points INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_development_member ON children_development(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_activities_development ON children_activities(development_id);
CREATE INDEX IF NOT EXISTS idx_tests_member ON children_tests(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON children_tests(status);
