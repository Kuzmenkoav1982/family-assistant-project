-- Добавляем таблицу для вложений к медицинским записям
CREATE TABLE IF NOT EXISTS health_attachments (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL REFERENCES health_records(id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'document')),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_attachments_record ON health_attachments(record_id);
