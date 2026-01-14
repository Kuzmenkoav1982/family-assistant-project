-- Создаем новую таблицу для отслеживания локаций с правильными UUID типами
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_location_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    family_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_location_family_created 
ON t_p5815085_family_assistant_pro.family_location_tracking(family_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_location_user_created 
ON t_p5815085_family_assistant_pro.family_location_tracking(user_id, created_at DESC);