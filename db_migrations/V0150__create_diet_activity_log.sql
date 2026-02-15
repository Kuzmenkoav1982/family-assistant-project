CREATE TABLE IF NOT EXISTS diet_activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_id INTEGER REFERENCES diet_plans(id),
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    steps INTEGER DEFAULT 0,
    exercise_type VARCHAR(100),
    exercise_duration_min INTEGER DEFAULT 0,
    exercise_note TEXT,
    calories_burned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, plan_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_dal_user_plan ON diet_activity_log(user_id, plan_id);
COMMENT ON TABLE diet_activity_log IS 'Ежедневный трекинг физической активности в рамках диеты';