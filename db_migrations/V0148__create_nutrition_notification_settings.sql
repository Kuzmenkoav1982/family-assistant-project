CREATE TABLE IF NOT EXISTS nutrition_notification_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    time_value VARCHAR(5) DEFAULT NULL,
    interval_minutes INTEGER DEFAULT NULL,
    channel VARCHAR(20) DEFAULT 'push',
    quiet_start VARCHAR(5) DEFAULT '22:00',
    quiet_end VARCHAR(5) DEFAULT '07:00',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_nns_user ON nutrition_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_nns_type ON nutrition_notification_settings(notification_type);

COMMENT ON TABLE nutrition_notification_settings IS 'Настройки уведомлений раздела питания';
COMMENT ON COLUMN nutrition_notification_settings.notification_type IS 'Тип: weight_reminder, meal_reminder, water_reminder, motivation, weekly_report, sos_followup, plan_ending';
COMMENT ON COLUMN nutrition_notification_settings.time_value IS 'Время для напоминания (HH:MM), например 08:00 для взвешивания';
COMMENT ON COLUMN nutrition_notification_settings.interval_minutes IS 'Интервал для повторяющихся (120 для воды каждые 2ч)';
COMMENT ON COLUMN nutrition_notification_settings.channel IS 'Канал: push, telegram, both';