-- Create simplified purchases table for family-wide purchase planning
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    family_id VARCHAR(255) NOT NULL,
    member_id VARCHAR(255),  -- NULL means for whole family
    season VARCHAR(50) NOT NULL CHECK (season IN ('winter', 'spring', 'summer', 'autumn')),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    estimated_cost INTEGER,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    purchased BOOLEAN NOT NULL DEFAULT FALSE,
    purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_purchases_family_season ON purchases(family_id, season);
CREATE INDEX idx_purchases_member ON purchases(member_id);

-- Add comments for documentation
COMMENT ON TABLE purchases IS 'Family-wide purchase planning by seasons';
COMMENT ON COLUMN purchases.member_id IS 'NULL means purchase is for the whole family';
COMMENT ON COLUMN purchases.season IS 'Season for purchase: winter, spring, summer, autumn';