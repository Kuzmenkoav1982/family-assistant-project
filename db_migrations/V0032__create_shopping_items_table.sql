-- Создаем таблицу для списка покупок
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.shopping_items (
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

-- Индексы
CREATE INDEX IF NOT EXISTS idx_shopping_items_family_id ON t_p5815085_family_assistant_pro.shopping_items(family_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_bought ON t_p5815085_family_assistant_pro.shopping_items(bought);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON t_p5815085_family_assistant_pro.shopping_items(category);