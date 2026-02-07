-- Создаем таблицу для отслеживания просмотров welcome-страницы
CREATE TABLE IF NOT EXISTS welcome_page_views (
    id SERIAL PRIMARY KEY,
    page VARCHAR(100) NOT NULL DEFAULT 'welcome',
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_welcome_page_views_session ON welcome_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_welcome_page_views_viewed_at ON welcome_page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_welcome_page_views_page ON welcome_page_views(page);

-- Комментарии
COMMENT ON TABLE welcome_page_views IS 'Отслеживание просмотров welcome-страницы для сравнения с Яндекс.Метрикой';
COMMENT ON COLUMN welcome_page_views.page IS 'Название страницы (welcome, generating-true и т.д.)';
COMMENT ON COLUMN welcome_page_views.session_id IS 'Уникальный ID сессии пользователя';
COMMENT ON COLUMN welcome_page_views.user_agent IS 'User-Agent браузера';
COMMENT ON COLUMN welcome_page_views.viewed_at IS 'Дата и время просмотра';