-- Публичный SEO-блог "Наша Семья": зеркало MAX-канала + независимые посты

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.public_blog_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.public_blog_tags (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.public_blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    category_id INTEGER,
    author_name VARCHAR(255) DEFAULT 'Наша Семья',
    seo_title VARCHAR(500),
    seo_description TEXT,
    seo_keywords TEXT,
    source VARCHAR(20) DEFAULT 'admin',
    max_message_id BIGINT,
    max_chat_id BIGINT,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    reading_time_min INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'published',
    published_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pbp_status_published ON t_p5815085_family_assistant_pro.public_blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_pbp_category ON t_p5815085_family_assistant_pro.public_blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_pbp_max_message ON t_p5815085_family_assistant_pro.public_blog_posts(max_message_id);
CREATE INDEX IF NOT EXISTS idx_pbp_slug ON t_p5815085_family_assistant_pro.public_blog_posts(slug);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.public_blog_post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.public_blog_post_views (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    visitor_hash VARCHAR(64),
    user_agent VARCHAR(500),
    referrer VARCHAR(500),
    ip_country VARCHAR(2),
    viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pbpv_post ON t_p5815085_family_assistant_pro.public_blog_post_views(post_id, viewed_at DESC);

INSERT INTO t_p5815085_family_assistant_pro.public_blog_categories (slug, name, emoji, description, sort_order) VALUES
('psychology', 'Психология семьи', '🧠', 'Эмоциональная безопасность, отношения и общение в семье', 1),
('children', 'Дети и воспитание', '👶', 'Развитие, образование и воспитание детей в современной семье', 2),
('relationships', 'Отношения в паре', '❤️', 'Любовь, языки любви, разрешение конфликтов между супругами', 3),
('health', 'Здоровье и питание', '🍎', 'Здоровое питание, иммунитет, медицина для всей семьи', 4),
('finance', 'Финансы семьи', '💰', 'Бюджет, цели, финансовая грамотность для семьи', 5),
('leisure', 'Досуг и традиции', '🎉', 'Семейные традиции, путешествия, праздники и совместный отдых', 6),
('education', 'Образование', '📚', 'Школа, чтение, развитие навыков, обучение детей', 7),
('safety', 'Безопасность', '🔐', 'Защита данных, безопасность детей, защита от мошенников', 8)
ON CONFLICT (slug) DO NOTHING;
