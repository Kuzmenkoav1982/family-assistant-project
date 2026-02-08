
-- Таблица для отслеживания отправленных уведомлений о подписке
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.subscription_notifications_log (
    id SERIAL PRIMARY KEY,
    subscription_id UUID NOT NULL,
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'expiring_7days', 'expiring_3days', 'expiring_1day'
    channel VARCHAR(20) NOT NULL, -- 'email' или 'push'
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    days_left INTEGER NOT NULL,
    
    -- Индексы для быстрого поиска
    CONSTRAINT unique_subscription_notification UNIQUE (subscription_id, notification_type, channel)
);

CREATE INDEX IF NOT EXISTS idx_sub_notif_subscription ON t_p5815085_family_assistant_pro.subscription_notifications_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_notif_user ON t_p5815085_family_assistant_pro.subscription_notifications_log(user_id);
