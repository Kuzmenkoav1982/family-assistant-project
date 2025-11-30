CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.push_subscriptions (
    id SERIAL PRIMARY KEY,
    family_id VARCHAR(255) NOT NULL UNIQUE,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_family_id 
ON t_p5815085_family_assistant_pro.push_subscriptions(family_id);

COMMENT ON TABLE t_p5815085_family_assistant_pro.push_subscriptions IS 'Push notification subscriptions for families';
