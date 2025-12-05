-- Таблица поездок
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planning', -- wishlist/planning/booked/ongoing/completed
    budget DECIMAL(10, 2),
    spent DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'RUB',
    description TEXT,
    cover_image TEXT,
    participants TEXT, -- JSON array с user_id
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);

-- Таблица билетов и броней
CREATE TABLE IF NOT EXISTS trip_bookings (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    booking_type VARCHAR(50) NOT NULL, -- flight/train/bus/hotel/car/other
    title VARCHAR(255) NOT NULL,
    booking_number VARCHAR(100),
    provider VARCHAR(255),
    date_from TIMESTAMP,
    date_to TIMESTAMP,
    cost DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RUB',
    status VARCHAR(50) DEFAULT 'pending', -- pending/confirmed/cancelled
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_trip ON trip_bookings(trip_id);
CREATE INDEX idx_bookings_type ON trip_bookings(booking_type);

-- Таблица маршрута по дням
CREATE TABLE IF NOT EXISTS trip_itinerary (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    places TEXT, -- JSON array мест [{name, address, lat, lng, time, notes}]
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_itinerary_trip ON trip_itinerary(trip_id, day_number);

-- Wish list - места мечты
CREATE TABLE IF NOT EXISTS trip_wishlist (
    id SERIAL PRIMARY KEY,
    destination VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low/medium/high
    estimated_budget DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RUB',
    best_season VARCHAR(50),
    duration_days INTEGER,
    tags TEXT, -- JSON array тегов
    image_url TEXT,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wishlist_priority ON trip_wishlist(priority);
CREATE INDEX idx_wishlist_user ON trip_wishlist(user_id);

-- Дневник путешествий
CREATE TABLE IF NOT EXISTS trip_diary (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    date DATE NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood VARCHAR(50), -- amazing/great/good/neutral/bad
    location VARCHAR(255),
    weather VARCHAR(50),
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diary_trip ON trip_diary(trip_id, date);

-- Фотоальбомы из поездок
CREATE TABLE IF NOT EXISTS trip_photos (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    photo_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    date_taken DATE,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_trip ON trip_photos(trip_id);