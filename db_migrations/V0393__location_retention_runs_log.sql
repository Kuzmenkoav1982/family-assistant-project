-- Журнал запусков retention-cron: без него нельзя ответить на вопрос
-- "когда последний раз реально прошла физическая очистка геоданных" и
-- невозможно алертить при пропуске планового запуска (cron-триггер
-- платформы не гарантирует выполнение — сеть, таймаут, отключённый
-- триггер по ошибке конфигурации).
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_retention_runs (
    id bigserial PRIMARY KEY,
    started_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp NULL,
    status text NOT NULL DEFAULT 'running',
    purged integer NULL,
    marked_for_deletion integer NULL,
    purge_after_backfilled integer NULL,
    active_points_remaining integer NULL,
    skipped_reason text NULL,
    error_message text NULL
);

ALTER TABLE t_p5815085_family_assistant_pro.location_retention_runs
    DROP CONSTRAINT IF EXISTS location_retention_runs_status_check;

ALTER TABLE t_p5815085_family_assistant_pro.location_retention_runs
    ADD CONSTRAINT location_retention_runs_status_check
    CHECK (status IN ('running', 'success', 'skipped', 'failed'));

CREATE INDEX IF NOT EXISTS idx_location_retention_runs_started
    ON t_p5815085_family_assistant_pro.location_retention_runs (started_at DESC);

-- Ожидаемая периодичность запуска — нужна, чтобы health-эндпоинт умел
-- сказать "запуск просрочен", а не только "последний запуск был тогда-то".
INSERT INTO t_p5815085_family_assistant_pro.feature_flags (flag_key, is_enabled, description)
VALUES ('location_retention_cron_configured', false,
        'Технический маркер: retention-cron поставлен на расписание у оператора (Yandex Cloud Trigger/cron-job.org). Пока false — health-эндпоинт не поднимает тревогу об отсутствии запусков, т.к. их не должно быть вовсе.')
ON CONFLICT (flag_key) DO NOTHING;
