CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.faith_reading_progress (
    id SERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    member_id VARCHAR(100),
    religion VARCHAR(50) NOT NULL,
    item_type VARCHAR(20) NOT NULL DEFAULT 'book',
    item_title VARCHAR(300) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    bookmark_position TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(family_id, member_id, religion, item_type, item_title)
);

CREATE INDEX IF NOT EXISTS idx_faith_reading_family ON t_p5815085_family_assistant_pro.faith_reading_progress(family_id, member_id, religion);