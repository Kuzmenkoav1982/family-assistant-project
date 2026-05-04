CREATE TABLE IF NOT EXISTS hub_events (
    id SERIAL PRIMARY KEY,
    hub VARCHAR(100) NOT NULL,
    hub_label VARCHAR(200) NOT NULL,
    family_id VARCHAR(255),
    session_id VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hub_events_hub ON hub_events(hub);
CREATE INDEX IF NOT EXISTS idx_hub_events_created_at ON hub_events(created_at);
CREATE INDEX IF NOT EXISTS idx_hub_events_family_id ON hub_events(family_id);
