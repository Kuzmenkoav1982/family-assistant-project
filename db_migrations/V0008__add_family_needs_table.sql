-- Таблица для потребностей семьи
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_needs (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_family_needs_family_id ON t_p5815085_family_assistant_pro.family_needs(family_id);
CREATE INDEX IF NOT EXISTS idx_family_needs_status ON t_p5815085_family_assistant_pro.family_needs(status);