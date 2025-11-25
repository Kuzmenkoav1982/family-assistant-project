-- Список покупок
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    quantity VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal',
    bought BOOLEAN DEFAULT false,
    added_by UUID,
    added_by_name VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Цели семьи
CREATE TABLE IF NOT EXISTS family_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    target_date DATE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Важные даты
CREATE TABLE IF NOT EXISTS important_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50),
    description TEXT,
    recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновление таблицы традиций
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS family_id UUID;
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS frequency VARCHAR(50);
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS participants JSONB;
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE traditions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновление таблицы блог постов
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS family_id UUID;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Обновление таблицы событий календаря
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS family_id UUID;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by_avatar VARCHAR(255);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'family';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS attendees JSONB;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_shopping_items_family ON shopping_items(family_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_bought ON shopping_items(bought);
CREATE INDEX IF NOT EXISTS idx_family_goals_family ON family_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_family_goals_status ON family_goals(status);
CREATE INDEX IF NOT EXISTS idx_important_dates_family ON important_dates(family_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_date ON important_dates(date);
CREATE INDEX IF NOT EXISTS idx_traditions_family ON traditions(family_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_family ON blog_posts(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_family ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);