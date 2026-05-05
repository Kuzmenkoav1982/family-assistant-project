-- Реакции на посты блога: эмодзи-кнопки без авторизации
-- Защита от накруток: уникальный (post_id, ip_hash, emoji)

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.public_blog_post_reactions (
    id BIGSERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    emoji VARCHAR(20) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT public_blog_post_reactions_unique UNIQUE (post_id, ip_hash, emoji)
);

CREATE INDEX IF NOT EXISTS idx_public_blog_post_reactions_post_id ON t_p5815085_family_assistant_pro.public_blog_post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_public_blog_post_reactions_emoji ON t_p5815085_family_assistant_pro.public_blog_post_reactions(post_id, emoji);

COMMENT ON TABLE t_p5815085_family_assistant_pro.public_blog_post_reactions IS 'Anonymous emoji reactions';
COMMENT ON COLUMN t_p5815085_family_assistant_pro.public_blog_post_reactions.ip_hash IS 'SHA256 hash for fraud protection';
