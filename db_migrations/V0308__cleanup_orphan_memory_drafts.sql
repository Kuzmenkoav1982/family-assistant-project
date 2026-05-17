-- Cleanup orphan drafts: давние черновики без фото и без явного контекста
-- (старше 7 дней) переводим в archived. Безопасно — не трогаем опубликованные.

UPDATE memory_entries
SET status = 'archived', archived_at = CURRENT_TIMESTAMP
WHERE status = 'draft'
  AND archived_at IS NULL
  AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
  AND id NOT IN (SELECT memory_entry_id FROM memory_assets);
