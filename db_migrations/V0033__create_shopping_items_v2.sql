-- Создаём новую таблицу shopping_items_v2 с правильными правами
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.shopping_items_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Продукты',
    quantity TEXT,
    priority TEXT DEFAULT 'normal',
    bought BOOLEAN DEFAULT FALSE,
    added_by UUID,
    added_by_name TEXT,
    bought_by UUID,
    bought_by_name TEXT,
    bought_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаём индексы
CREATE INDEX IF NOT EXISTS idx_shopping_items_v2_family_id 
ON t_p5815085_family_assistant_pro.shopping_items_v2(family_id);

CREATE INDEX IF NOT EXISTS idx_shopping_items_v2_bought 
ON t_p5815085_family_assistant_pro.shopping_items_v2(bought);

CREATE INDEX IF NOT EXISTS idx_shopping_items_v2_category 
ON t_p5815085_family_assistant_pro.shopping_items_v2(category);