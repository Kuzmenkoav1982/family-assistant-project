-- Лог согласий пользователей на обработку ПДн (152-ФЗ).
-- Фиксируем ТОЛЬКО фактические согласия с момента внедрения. Прошлое не заполняется.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.user_consents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    consent_type VARCHAR(50) NOT NULL DEFAULT 'privacy_policy',
    policy_version VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user
    ON t_p5815085_family_assistant_pro.user_consents (user_id);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_version
    ON t_p5815085_family_assistant_pro.user_consents (user_id, consent_type, policy_version);
