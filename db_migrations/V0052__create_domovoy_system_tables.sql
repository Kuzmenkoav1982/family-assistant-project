-- Создание таблиц для системы Домового

-- Таблица настроек ассистента для пользователей
CREATE TABLE IF NOT EXISTS assistant_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    assistant_type VARCHAR(50) NOT NULL CHECK (assistant_type IN ('neutral', 'domovoy')),
    assistant_name VARCHAR(100),
    assistant_role VARCHAR(50),
    assistant_level INTEGER DEFAULT 1 CHECK (assistant_level >= 1 AND assistant_level <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица уровней прокачки Домового для каждого пользователя
CREATE TABLE IF NOT EXISTS domovoy_levels (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
    total_donated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица донатов на прокачку Домового
CREATE TABLE IF NOT EXISTS domovoy_donations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 100),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('sbp', 'card', 'yumoney')),
    level_before INTEGER NOT NULL,
    level_after INTEGER NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица настроек платежных реквизитов (для админки)
CREATE TABLE IF NOT EXISTS payment_settings (
    id SERIAL PRIMARY KEY,
    payment_method VARCHAR(50) NOT NULL UNIQUE CHECK (payment_method IN ('sbp', 'card', 'yumoney')),
    is_active BOOLEAN DEFAULT false,
    account_number VARCHAR(255),
    qr_code_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_assistant_settings_user_id ON assistant_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_domovoy_levels_user_id ON domovoy_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_domovoy_donations_user_id ON domovoy_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_domovoy_donations_created_at ON domovoy_donations(created_at);
CREATE INDEX IF NOT EXISTS idx_domovoy_donations_status ON domovoy_donations(payment_status);

-- Комментарии к таблицам
COMMENT ON TABLE assistant_settings IS 'Настройки AI-ассистента для каждого пользователя';
COMMENT ON TABLE domovoy_levels IS 'Уровни прокачки Домового для пользователей';
COMMENT ON TABLE domovoy_donations IS 'История донатов на прокачку Домового';
COMMENT ON TABLE payment_settings IS 'Настройки платежных реквизитов для админки';

-- Вставка начальных данных для платежных настроек
INSERT INTO payment_settings (payment_method, is_active, description) 
VALUES 
    ('sbp', false, 'Система быстрых платежей'),
    ('card', false, 'Оплата банковской картой'),
    ('yumoney', false, 'Электронный кошелёк ЮMoney')
ON CONFLICT (payment_method) DO NOTHING;
