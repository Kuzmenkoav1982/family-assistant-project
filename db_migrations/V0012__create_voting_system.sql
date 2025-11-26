-- Создаем таблицу для голосований
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.votings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    voting_type VARCHAR(50) NOT NULL CHECK (voting_type IN ('meal', 'rule', 'general')),
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу для опций голосования
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.voting_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voting_id UUID NOT NULL,
    option_text TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу для голосов
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voting_id UUID NOT NULL,
    option_id UUID,
    member_id UUID NOT NULL,
    vote_value BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(voting_id, member_id, option_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_votings_family_id ON t_p5815085_family_assistant_pro.votings(family_id);
CREATE INDEX IF NOT EXISTS idx_votings_status ON t_p5815085_family_assistant_pro.votings(status);
CREATE INDEX IF NOT EXISTS idx_voting_options_voting_id ON t_p5815085_family_assistant_pro.voting_options(voting_id);
CREATE INDEX IF NOT EXISTS idx_votes_voting_id ON t_p5815085_family_assistant_pro.votes(voting_id);
CREATE INDEX IF NOT EXISTS idx_votes_member_id ON t_p5815085_family_assistant_pro.votes(member_id);