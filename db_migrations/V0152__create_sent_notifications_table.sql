CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.sent_notifications (
    id SERIAL PRIMARY KEY,
    family_id VARCHAR(255) NOT NULL,
    notification_hash VARCHAR(64) NOT NULL,
    title TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(family_id, notification_hash)
);

CREATE INDEX idx_sent_notifications_family_hash 
ON t_p5815085_family_assistant_pro.sent_notifications(family_id, notification_hash);

CREATE INDEX idx_sent_notifications_sent_at 
ON t_p5815085_family_assistant_pro.sent_notifications(sent_at);