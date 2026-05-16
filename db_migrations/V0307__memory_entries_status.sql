-- Family Memory: lifecycle status (draft / published / archived)
-- archived_at уже есть; добавляем явный статус, чтобы:
-- 1) корректно скрывать незавершённые черновики из всех списков
-- 2) при cancel-flow мы знаем, какие записи можно безопасно очистить
-- 3) последующая логика становится явной, а не "угадывание по заполненности"

ALTER TABLE memory_entries
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published';

-- Backfill: все существующие живые записи считаем published.
-- archived (через archived_at) пересчитывать не нужно — фильтрация уже идёт по archived_at IS NULL.
UPDATE memory_entries
SET status = 'published'
WHERE status IS NULL OR status = '';

-- Для записей, помещённых в архив через archived_at, ставим status='archived',
-- чтобы статус и архивный флаг были согласованы.
UPDATE memory_entries
SET status = 'archived'
WHERE archived_at IS NOT NULL AND status <> 'archived';

CREATE INDEX IF NOT EXISTS idx_memory_entries_status ON memory_entries(status);
CREATE INDEX IF NOT EXISTS idx_memory_entries_family_status ON memory_entries(family_id, status);
