-- Создаём таблицу для идей пользователей
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.user_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('feature', 'improvement', 'bug')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'in_progress', 'completed', 'rejected')),
    votes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для голосов за идеи
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.idea_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(idea_id, user_id)
);

-- Таблица для комментариев к идеям
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.idea_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL,
    user_id UUID NOT NULL,
    parent_comment_id UUID,
    text TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_ideas_user_id ON t_p5815085_family_assistant_pro.user_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON t_p5815085_family_assistant_pro.user_ideas(status);
CREATE INDEX IF NOT EXISTS idx_user_ideas_category ON t_p5815085_family_assistant_pro.user_ideas(category);
CREATE INDEX IF NOT EXISTS idx_user_ideas_votes ON t_p5815085_family_assistant_pro.user_ideas(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_ideas_created ON t_p5815085_family_assistant_pro.user_ideas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_idea_votes_idea_id ON t_p5815085_family_assistant_pro.idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_votes_user_id ON t_p5815085_family_assistant_pro.idea_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_idea_comments_idea_id ON t_p5815085_family_assistant_pro.idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_comments_parent ON t_p5815085_family_assistant_pro.idea_comments(parent_comment_id);
