CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.rate_limit_log (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_action_time 
ON t_p5815085_family_assistant_pro.rate_limit_log(ip_address, action_type, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at 
ON t_p5815085_family_assistant_pro.rate_limit_log(created_at);