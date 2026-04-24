-- Таблица массовых рассылок из админки
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.admin_broadcasts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    message text NOT NULL,
    target_audience varchar(50) DEFAULT 'all',
    sent_count integer DEFAULT 0,
    status varchar(30) DEFAULT 'sent',
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_created ON t_p5815085_family_assistant_pro.admin_broadcasts(created_at DESC);

-- Лента клиентских ошибок для мониторинга
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.client_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    error_message text NOT NULL,
    error_stack text,
    page_path varchar(500),
    user_agent varchar(500),
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_errors_created ON t_p5815085_family_assistant_pro.client_errors(created_at DESC);

-- Фич-тумблеры для включения/выключения функций без кода
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.feature_flags (
    flag_key varchar(100) PRIMARY KEY,
    is_enabled boolean DEFAULT false,
    description text,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Базовые фич-флаги
INSERT INTO t_p5815085_family_assistant_pro.feature_flags (flag_key, is_enabled, description)
VALUES
    ('registration_enabled', true, 'Разрешить регистрацию новых пользователей'),
    ('payments_enabled', true, 'Приём платежей'),
    ('ai_assistant_enabled', true, 'ИИ-помощник Домовой'),
    ('max_bot_enabled', true, 'Бот в MAX'),
    ('alice_skill_enabled', true, 'Навык Алисы'),
    ('broadcast_banner', false, 'Показывать баннер-объявление на главной')
ON CONFLICT (flag_key) DO NOTHING;
