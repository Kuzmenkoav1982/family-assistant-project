CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.trip_wishes (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    wish_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_wishes_trip_id ON t_p5815085_family_assistant_pro.trip_wishes(trip_id);