-- Таблица мечт
CREATE TABLE IF NOT EXISTS children_dreams (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    achieved BOOLEAN DEFAULT FALSE,
    achieved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица дневника
CREATE TABLE IF NOT EXISTS children_diary (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица копилки
CREATE TABLE IF NOT EXISTS children_piggybank (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL UNIQUE,
    family_id VARCHAR(255) NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица транзакций копилки
CREATE TABLE IF NOT EXISTS children_transactions (
    id SERIAL PRIMARY KEY,
    piggybank_id INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS children_achievements (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    date_earned DATE NOT NULL DEFAULT CURRENT_DATE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_dreams_member ON children_dreams(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_dreams_achieved ON children_dreams(achieved);
CREATE INDEX IF NOT EXISTS idx_diary_member ON children_diary(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_diary_date ON children_diary(date);
CREATE INDEX IF NOT EXISTS idx_piggybank_member ON children_piggybank(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_piggybank ON children_transactions(piggybank_id);
CREATE INDEX IF NOT EXISTS idx_achievements_member ON children_achievements(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_achievements_date ON children_achievements(date_earned);
