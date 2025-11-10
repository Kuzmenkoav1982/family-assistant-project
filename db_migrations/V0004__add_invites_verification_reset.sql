-- Таблица для инвайтов в семью
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES t_p5815085_family_assistant_pro.families(id),
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES t_p5815085_family_assistant_pro.users(id),
    max_uses INTEGER DEFAULT 1,
    uses_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Добавляем поле родства к членам семьи
ALTER TABLE t_p5815085_family_assistant_pro.family_members
ADD COLUMN IF NOT EXISTS relationship VARCHAR(100);

-- Таблица для кодов подтверждения
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES t_p5815085_family_assistant_pro.users(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    code VARCHAR(6) NOT NULL,
    code_type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

-- Таблица для токенов восстановления пароля
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p5815085_family_assistant_pro.users(id),
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_invites_code ON t_p5815085_family_assistant_pro.family_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_invites_family ON t_p5815085_family_assistant_pro.family_invites(family_id);
CREATE INDEX IF NOT EXISTS idx_verification_code ON t_p5815085_family_assistant_pro.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_reset_token ON t_p5815085_family_assistant_pro.password_reset_tokens(token);