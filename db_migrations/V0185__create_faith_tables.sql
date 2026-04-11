CREATE TABLE IF NOT EXISTS family_faith (
    id SERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    religion VARCHAR(50) NOT NULL DEFAULT 'orthodox',
    custom_religion_name VARCHAR(200),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    fasting_sync_enabled BOOLEAN DEFAULT TRUE,
    calendar_sync_enabled BOOLEAN DEFAULT TRUE,
    my_temple_name VARCHAR(300),
    my_temple_address TEXT,
    my_temple_schedule TEXT,
    my_temple_contacts VARCHAR(300),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(family_id)
);

CREATE TABLE IF NOT EXISTS faith_events (
    id SERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'holiday',
    religion VARCHAR(50) NOT NULL,
    is_fasting BOOLEAN DEFAULT FALSE,
    fasting_rules TEXT,
    is_recurring BOOLEAN DEFAULT TRUE,
    recurring_type VARCHAR(20) DEFAULT 'yearly',
    is_custom BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    synced_to_calendar BOOLEAN DEFAULT FALSE,
    calendar_event_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faith_prayers (
    id SERIAL PRIMARY KEY,
    religion VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    time_of_day VARCHAR(20),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faith_name_days (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    saint_name VARCHAR(300),
    religion VARCHAR(50) NOT NULL DEFAULT 'orthodox',
    day INT NOT NULL,
    month INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faith_family ON family_faith(family_id);
CREATE INDEX IF NOT EXISTS idx_faith_events_family ON faith_events(family_id);
CREATE INDEX IF NOT EXISTS idx_faith_events_date ON faith_events(event_date);
CREATE INDEX IF NOT EXISTS idx_faith_events_religion ON faith_events(religion);
CREATE INDEX IF NOT EXISTS idx_faith_prayers_religion ON faith_prayers(religion);
CREATE INDEX IF NOT EXISTS idx_faith_name_days_name ON faith_name_days(name);
CREATE INDEX IF NOT EXISTS idx_faith_name_days_date ON faith_name_days(month, day);