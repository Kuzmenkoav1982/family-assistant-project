-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'other',
    cuisine TEXT DEFAULT 'russian',
    cooking_time INTEGER,
    difficulty TEXT DEFAULT 'medium',
    servings INTEGER DEFAULT 4,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    dietary_tags TEXT[],
    image_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_recipes_family_id ON recipes(family_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);

-- Create full-text search index for recipes
CREATE INDEX IF NOT EXISTS idx_recipes_search ON recipes USING gin(to_tsvector('russian', name || ' ' || COALESCE(description, '') || ' ' || ingredients));