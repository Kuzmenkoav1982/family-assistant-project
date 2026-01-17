-- Создание таблицы для семейного меню
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    day VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    dish_name VARCHAR(255) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    added_by UUID,
    added_by_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска меню семьи
CREATE INDEX idx_family_meal_plans_family_id ON t_p5815085_family_assistant_pro.family_meal_plans(family_id);

-- Индекс для поиска по дню недели
CREATE INDEX idx_family_meal_plans_day ON t_p5815085_family_assistant_pro.family_meal_plans(family_id, day);

COMMENT ON TABLE t_p5815085_family_assistant_pro.family_meal_plans IS 'Недельное меню семьи';
