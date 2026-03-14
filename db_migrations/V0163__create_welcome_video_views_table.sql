CREATE TABLE IF NOT EXISTS welcome_video_views (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    user_agent TEXT DEFAULT '',
    viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_welcome_video_views_session ON welcome_video_views(session_id);
CREATE INDEX idx_welcome_video_views_viewed_at ON welcome_video_views(viewed_at);