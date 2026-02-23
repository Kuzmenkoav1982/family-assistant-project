
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    family_id varchar(255),
    type varchar(50) NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    target_url varchar(500) NOT NULL DEFAULT '/notifications',
    channel varchar(20) NOT NULL DEFAULT 'push',
    status varchar(20) NOT NULL DEFAULT 'pending',
    sent_at timestamp,
    read_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_status 
ON t_p5815085_family_assistant_pro.notifications (user_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON t_p5815085_family_assistant_pro.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_family_type 
ON t_p5815085_family_assistant_pro.notifications (family_id, type);
