-- Создание таблиц для отслеживания посещаемости и активности пользователей

-- Таблица просмотров страниц
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    family_id INTEGER,
    user_id INTEGER,
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(500),
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_family_id ON page_views(family_id);
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);

-- Таблица активности пользователей (агрегированные данные по дням)
CREATE TABLE IF NOT EXISTS user_activity_daily (
    id SERIAL PRIMARY KEY,
    family_id INTEGER,
    activity_date DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    calendar_events INTEGER DEFAULT 0,
    children_added INTEGER DEFAULT 0,
    shopping_items INTEGER DEFAULT 0,
    recipes_viewed INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    session_duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(family_id, activity_date)
);

CREATE INDEX idx_user_activity_daily_family_id ON user_activity_daily(family_id);
CREATE INDEX idx_user_activity_daily_date ON user_activity_daily(activity_date);

COMMENT ON TABLE page_views IS 'Логирование всех просмотров страниц для аналитики посещаемости';
COMMENT ON TABLE user_activity_daily IS 'Агрегированная активность пользователей по дням для быстрых запросов';