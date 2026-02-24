
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.geofence_alert_settings (
    id SERIAL PRIMARY KEY,
    family_id VARCHAR(255) NOT NULL,
    member_id VARCHAR(255) NOT NULL,
    alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_members JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(family_id, member_id)
);

COMMENT ON TABLE t_p5815085_family_assistant_pro.geofence_alert_settings IS 'Настройки уведомлений геозон: за кем следить и кому слать';
COMMENT ON COLUMN t_p5815085_family_assistant_pro.geofence_alert_settings.member_id IS 'За кем следим (family_members.id)';
COMMENT ON COLUMN t_p5815085_family_assistant_pro.geofence_alert_settings.notify_members IS 'Массив member_id кому слать уведомления, пустой = всем';
