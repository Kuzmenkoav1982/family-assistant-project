-- Таблица идей пользователей
CREATE TABLE IF NOT EXISTS user_ideas (
    id VARCHAR(36) PRIMARY KEY,
    user_id TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'bug')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'in_progress', 'completed', 'rejected')),
    votes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица голосов за идеи
CREATE TABLE IF NOT EXISTS idea_votes (
    id SERIAL PRIMARY KEY,
    idea_id VARCHAR(36) NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, user_id)
);

-- Таблица комментариев к идеям
CREATE TABLE IF NOT EXISTS idea_comments (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрой работы
CREATE INDEX IF NOT EXISTS idx_user_ideas_category ON user_ideas(category);
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status);
CREATE INDEX IF NOT EXISTS idx_user_ideas_votes ON user_ideas(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_ideas_created ON user_ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_votes_idea ON idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_votes_user ON idea_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_idea ON idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_created ON idea_comments(created_at DESC);