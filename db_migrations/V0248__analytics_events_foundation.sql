-- Analytics events: продуктовая воронка, не путать с system/ops логами.
-- Хранить только enums/IDs/счётчики. Никакого свободного текста, имён, AI-промптов.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_name VARCHAR(64) NOT NULL,
    user_id UUID,
    family_id VARCHAR(64),
    member_id UUID,
    session_id VARCHAR(64),
    page VARCHAR(128),
    props JSONB,
    user_agent VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time
    ON t_p5815085_family_assistant_pro.analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time
    ON t_p5815085_family_assistant_pro.analytics_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_family_time
    ON t_p5815085_family_assistant_pro.analytics_events (family_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
    ON t_p5815085_family_assistant_pro.analytics_events (created_at DESC);
