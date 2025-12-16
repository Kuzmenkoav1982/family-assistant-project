-- Таблица для привязки Yandex User ID к аккаунтам семьи
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.alice_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yandex_user_id VARCHAR(255) UNIQUE NOT NULL,
    family_id UUID NOT NULL,
    member_id UUID NOT NULL,
    linking_code VARCHAR(8),
    code_expires_at TIMESTAMP,
    linked_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для логирования команд Алисы
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.alice_commands_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yandex_user_id VARCHAR(255) NOT NULL,
    family_id UUID,
    command_text TEXT NOT NULL,
    command_category VARCHAR(50),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_alice_users_yandex_id ON t_p5815085_family_assistant_pro.alice_users(yandex_user_id);
CREATE INDEX IF NOT EXISTS idx_alice_users_family ON t_p5815085_family_assistant_pro.alice_users(family_id);
CREATE INDEX IF NOT EXISTS idx_alice_commands_user ON t_p5815085_family_assistant_pro.alice_commands_log(yandex_user_id);
CREATE INDEX IF NOT EXISTS idx_alice_commands_date ON t_p5815085_family_assistant_pro.alice_commands_log(created_at);

-- Комментарии к таблицам
COMMENT ON TABLE t_p5815085_family_assistant_pro.alice_users IS 'Связь между Yandex User ID и аккаунтами пользователей';
COMMENT ON TABLE t_p5815085_family_assistant_pro.alice_commands_log IS 'Лог всех команд через Яндекс.Алису для аналитики';
