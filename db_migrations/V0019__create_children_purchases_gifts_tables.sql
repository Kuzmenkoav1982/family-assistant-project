-- Таблица планов покупок
CREATE TABLE IF NOT EXISTS children_purchase_plans (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    season VARCHAR(50) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица элементов покупок
CREATE TABLE IF NOT EXISTS children_purchase_items (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    estimated_cost INTEGER,
    purchased BOOLEAN DEFAULT FALSE,
    purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подарков
CREATE TABLE IF NOT EXISTS children_gifts (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    event VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    gift VARCHAR(255) NOT NULL,
    given BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_purchase_plans_member ON children_purchase_plans(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_plan ON children_purchase_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_gifts_member ON children_gifts(member_id, family_id);
CREATE INDEX IF NOT EXISTS idx_gifts_date ON children_gifts(date);
