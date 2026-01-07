-- Создаём таблицу мест для посещения внутри поездок (Wish List мест в поездке)
CREATE TABLE IF NOT EXISTS trip_places (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    place_name VARCHAR(255) NOT NULL,
    place_type VARCHAR(50) DEFAULT 'attraction', -- attraction, restaurant, hotel, activity, other
    address TEXT,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    estimated_cost DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RUB',
    priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    status VARCHAR(20) DEFAULT 'planned', -- planned, visited, skipped
    visited_date DATE,
    notes TEXT,
    ai_recommended BOOLEAN DEFAULT FALSE,
    ai_description TEXT,
    image_url TEXT,
    added_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_trip_places_trip_id ON trip_places(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_places_status ON trip_places(status);
CREATE INDEX IF NOT EXISTS idx_trip_places_priority ON trip_places(priority);

-- Комментарии
COMMENT ON TABLE trip_places IS 'Список мест для посещения внутри конкретной поездки (Wish List)';
COMMENT ON COLUMN trip_places.place_type IS 'Тип места: attraction, restaurant, hotel, activity, other';
COMMENT ON COLUMN trip_places.status IS 'Статус посещения: planned (запланировано), visited (посещено), skipped (пропущено)';
COMMENT ON COLUMN trip_places.ai_recommended IS 'Место было рекомендовано AI-помощником';
COMMENT ON COLUMN trip_places.priority IS 'Приоритет посещения: high, medium, low';