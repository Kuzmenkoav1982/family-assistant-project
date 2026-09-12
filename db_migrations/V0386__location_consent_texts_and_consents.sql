-- Геолокация: модель информированного согласия (152-ФЗ). Часть 1.
--
-- Почему отдельная подсистема, а не поле в family_members:
-- согласие по ч.1.1 ст.9 152-ФЗ не может быть частью другого документа
-- и должно быть доказуемым спустя год. Доказать можно только если
-- сохранён ТЕКСТ, который человек видел, и параметры, на которые он
-- соглашался. Булево поле «согласен» этого не доказывает.

-- 1. Версионированные тексты согласия.
-- Через год спор «на что он соглашался» решается этой таблицей.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_consent_texts (
    version text PRIMARY KEY,
    body_md text NOT NULL,
    summary text NOT NULL,
    effective_from timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current boolean NOT NULL DEFAULT false,
    legal_review_status text NOT NULL DEFAULT 'pending_legal_review',
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_texts
    DROP CONSTRAINT IF EXISTS location_consent_texts_review_values;

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_texts
    ADD CONSTRAINT location_consent_texts_review_values
    CHECK (legal_review_status IN ('pending_legal_review', 'approved', 'superseded'));

-- 2. Согласия на сбор геоданных.
-- subject_member_id — чьё местоположение собирается: субъект данных,
-- а не тот, кому удобно смотреть.
-- consent_role: self — субъект сам; legal_representative — подтверждённый
-- представитель малолетнего. Роль parent/admin/owner представителем НЕ делает.
-- subject_age_at_grant — возраст в момент выдачи: определяет, кто был вправе
-- давать согласие и когда оно прекратится (14 лет).
-- retention_days: 0 = не хранить историю, только последняя позиция.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL,
    subject_member_id uuid NOT NULL,
    granted_by_user_id uuid NULL,
    granted_by_member_id uuid NULL,
    consent_role text NOT NULL,
    subject_age_at_grant integer NULL,
    text_version text NOT NULL,
    purpose text NOT NULL,
    data_scope jsonb NOT NULL DEFAULT '{}'::jsonb,
    retention_days integer NOT NULL DEFAULT 7,
    update_interval_seconds integer NOT NULL DEFAULT 600,
    status text NOT NULL DEFAULT 'active',
    granted_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at timestamp NULL,
    revoked_by_user_id uuid NULL,
    revoke_reason text NULL,
    next_reminder_at timestamp NULL,
    last_reminded_at timestamp NULL,
    superseded_by uuid NULL,
    supersede_reason text NULL,
    ip_hash text NULL,
    user_agent_family text NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    DROP CONSTRAINT IF EXISTS location_consents_role_values;

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD CONSTRAINT location_consents_role_values
    CHECK (consent_role IN ('self', 'legal_representative'));

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    DROP CONSTRAINT IF EXISTS location_consents_status_values;

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD CONSTRAINT location_consents_status_values
    CHECK (status IN ('active', 'revoked', 'superseded', 'expired'));

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    DROP CONSTRAINT IF EXISTS location_consents_retention_values;

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD CONSTRAINT location_consents_retention_values
    CHECK (retention_days IN (0, 7, 30, 90));

-- У субъекта не может быть двух действующих согласий одновременно:
-- иначе непонятно, какой срок хранения и какой состав данных применять.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_location_consent
    ON t_p5815085_family_assistant_pro.location_consents (subject_member_id)
 WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_location_consents_family
    ON t_p5815085_family_assistant_pro.location_consents (family_id, status);
