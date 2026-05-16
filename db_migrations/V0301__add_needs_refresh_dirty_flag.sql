-- Добавляем needs_refresh в member_portfolios для durable stale/dirty модели.
-- needs_refresh=true ставится после каждого save source-данных (grades/dreams/medications/traditions).
-- aggregate сбрасывает его в false после успешного пересчёта.
-- get&debug=1 читает stale=true если needs_refresh=true (даже если HTTP trigger не сработал).
ALTER TABLE t_p5815085_family_assistant_pro.member_portfolios
    ADD COLUMN IF NOT EXISTS needs_refresh boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS marked_dirty_at timestamp without time zone NULL DEFAULT NULL;