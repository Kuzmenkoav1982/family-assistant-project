-- Создание таблицы для инвайтов детских профилей
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.child_invites (
    id SERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    child_member_id INTEGER NOT NULL,
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    created_by INTEGER NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    activated_user_id VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_child_invites_token ON t_p5815085_family_assistant_pro.child_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_child_invites_child_member ON t_p5815085_family_assistant_pro.child_invites(child_member_id);
CREATE INDEX IF NOT EXISTS idx_child_invites_is_used ON t_p5815085_family_assistant_pro.child_invites(is_used);
