-- Серверный rollout-режим для геолокации: пока adult self-tracking не прошёл
-- полный внешний E2E QA и юридическое утверждение текста согласия, глобальные
-- geo-флаги (geolocation_collection_enabled и т.д.) остаются выключенными для
-- ВСЕХ семей. Этот allowlist даёт способ включить сценарий ТОЛЬКО для явно
-- перечисленных QA-семей, не трогая глобальные флаги и не открывая функцию
-- реальным пользователям платформы.
--
-- Режимы geolocation_rollout_mode (хранится как feature_flags не подходит —
-- это не boolean, а строковый режим, поэтому отдельная однострочная таблица):
--   disabled  — allowlist не действует вообще, доступ решают только обычные
--               geo-флаги (текущее поведение до этой миграции);
--   allowlist — geo-флаги обязаны быть включены КАК И РАНЬШЕ, но сверх этого
--               семья обязана присутствовать в geolocation_rollout_families
--               с не истёкшим expires_at. Семьи не в списке получают отказ,
--               даже если глобальный флаг включён;
--   global    — allowlist не проверяется, решают только обычные geo-флаги
--               (обычный "боевой" режим после расширения rollout).
--
-- ВАЖНО: allowlist — это ДОПОЛНИТЕЛЬНОЕ ограничение поверх geo-флагов, а не
-- замена. В режиме allowlist семья из списка без включённого
-- geolocation_adult_self_collection_enabled всё равно получит отказ.

CREATE TABLE t_p5815085_family_assistant_pro.geolocation_rollout_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    mode TEXT NOT NULL DEFAULT 'disabled'
        CHECK (mode IN ('disabled', 'allowlist', 'global')),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by_user_id UUID NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO t_p5815085_family_assistant_pro.geolocation_rollout_settings (id, mode)
VALUES (1, 'disabled');

CREATE TABLE t_p5815085_family_assistant_pro.geolocation_rollout_families (
    family_id UUID PRIMARY KEY REFERENCES t_p5815085_family_assistant_pro.families(id),
    adult_self_collection_enabled BOOLEAN NOT NULL DEFAULT true,
    history_enabled BOOLEAN NOT NULL DEFAULT false,
    geofences_enabled BOOLEAN NOT NULL DEFAULT false,
    reason TEXT NOT NULL,
    enabled_by_user_id UUID NULL,
    enabled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_geo_rollout_families_expires
    ON t_p5815085_family_assistant_pro.geolocation_rollout_families (expires_at);

-- Аудит изменений allowlist: кто, когда, какую семью добавил/убрал/продлил.
-- Отдельно от authz_audit_log (тот пишется guard-ом на КАЖДЫЙ запрос доступа
-- к данным, это же — редкие административные изменения состава allowlist).
CREATE TABLE t_p5815085_family_assistant_pro.geolocation_rollout_events (
    id SERIAL PRIMARY KEY,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    family_id UUID NULL,
    actor_user_id UUID NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb
);
