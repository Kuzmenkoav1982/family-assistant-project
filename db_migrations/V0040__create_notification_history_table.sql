CREATE TABLE notification_history (
  id SERIAL PRIMARY KEY,
  family_id INTEGER NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_history_family_id ON notification_history(family_id);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history(status);