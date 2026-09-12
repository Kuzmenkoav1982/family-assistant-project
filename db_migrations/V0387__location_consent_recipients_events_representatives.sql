-- Геолокация: модель согласия. Часть 2 — получатели, журнал, представители.

-- 3. Получатели: кто именно может видеть положение субъекта.
-- Отдельно от согласия, потому что «разрешил собирать» и «разрешил
-- показывать вот этому человеку» — разные решения. Согласие без
-- получателя не открывает координаты никому.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_consent_recipients (
    id bigserial PRIMARY KEY,
    consent_id uuid NOT NULL,
    recipient_member_id uuid NOT NULL,
    granted_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at timestamp NULL,
    UNIQUE (consent_id, recipient_member_id)
);

CREATE INDEX IF NOT EXISTS idx_location_recipients_active
    ON t_p5815085_family_assistant_pro.location_consent_recipients (recipient_member_id)
 WHERE revoked_at IS NULL;

-- 4. Неизменяемый журнал решений.
-- Пишется всегда: выдача, отзыв, отказ, напоминание, автопрекращение.
-- Именно он отвечает на вопрос «докажите, что согласие было».
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_consent_events (
    id bigserial PRIMARY KEY,
    occurred_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consent_id uuid NULL,
    subject_member_id uuid NULL,
    family_id uuid NULL,
    action text NOT NULL,
    actor_user_id uuid NULL,
    actor_member_id uuid NULL,
    actor_role text NULL,
    text_version text NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    request_id text NULL,
    ip_hash text NULL,
    user_agent_family text NULL
);

CREATE INDEX IF NOT EXISTS idx_location_consent_events_subject
    ON t_p5815085_family_assistant_pro.location_consent_events
       (subject_member_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_location_consent_events_consent
    ON t_p5815085_family_assistant_pro.location_consent_events
       (consent_id, occurred_at DESC);

-- 5. Подтверждение законного представителя.
-- Ключевая защита: до 14 лет согласие даёт законный представитель, но
-- роль parent/admin/owner в этой БД представителем НЕ делает —
-- V0376 выдала роль parent в том числе 12-летнему участнику.
-- Пока представитель не подтверждён явно, геолокация ребёнка не включается.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.legal_representatives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL,
    representative_member_id uuid NOT NULL,
    dependent_member_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    basis text NULL,
    confirmed_at timestamp NULL,
    confirmed_by_user_id uuid NULL,
    revoked_at timestamp NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (representative_member_id, dependent_member_id)
);

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    DROP CONSTRAINT IF EXISTS legal_representatives_status_values;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD CONSTRAINT legal_representatives_status_values
    CHECK (status IN ('pending', 'confirmed', 'revoked'));

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    DROP CONSTRAINT IF EXISTS legal_representatives_not_self;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD CONSTRAINT legal_representatives_not_self
    CHECK (representative_member_id <> dependent_member_id);

-- 6. Привязка собранных точек к согласию.
-- Без этого нельзя ответить «по какому согласию собрана эта координата»
-- и корректно очистить данные при отзыве.
-- purge_after — момент, после которого точка подлежит физической очистке.
ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD COLUMN IF NOT EXISTS consent_id uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD COLUMN IF NOT EXISTS purge_after timestamp NULL;

CREATE INDEX IF NOT EXISTS idx_location_purge_after
    ON t_p5815085_family_assistant_pro.family_location_tracking (purge_after)
 WHERE usage_status = 'active' AND purge_after IS NOT NULL;
