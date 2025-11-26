-- Создаем таблицу для голосов за разделы в разработке
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.dev_section_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id VARCHAR(100) NOT NULL,
    member_id UUID,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section_id, member_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_dev_section_votes_section_id ON t_p5815085_family_assistant_pro.dev_section_votes(section_id);
CREATE INDEX IF NOT EXISTS idx_dev_section_votes_member_id ON t_p5815085_family_assistant_pro.dev_section_votes(member_id);