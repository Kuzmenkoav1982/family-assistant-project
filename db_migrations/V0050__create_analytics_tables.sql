CREATE TABLE IF NOT EXISTS analytics_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    rating VARCHAR(20),
    session_id VARCHAR(255),
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_created_at ON analytics_metrics(created_at);
CREATE INDEX idx_analytics_metric_name ON analytics_metrics(metric_name);

CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    total_users INT DEFAULT 0,
    active_today INT DEFAULT 0,
    active_week INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO user_statistics (total_users, active_today, active_week) 
VALUES (5, 2, 4);
