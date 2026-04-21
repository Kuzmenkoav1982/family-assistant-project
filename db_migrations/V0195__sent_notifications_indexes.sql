-- Индексы для ускорения дедупликации в sent_notifications (bug17)
CREATE INDEX IF NOT EXISTS idx_sent_notifications_family_sent_at
  ON t_p5815085_family_assistant_pro.sent_notifications(family_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_sent_notifications_family_hash
  ON t_p5815085_family_assistant_pro.sent_notifications(family_id, notification_hash);
