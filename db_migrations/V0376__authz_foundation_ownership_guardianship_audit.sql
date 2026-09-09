-- ============================================================
-- Server-side authorization foundation
-- 1) Владение семьёй отделено от роли участника
-- 2) Явные связи опекун -> подопечный (ABAC / relationship)
-- 3) Аудит решений авторизации (без содержимого данных)
-- ============================================================

-- ---------- 1. ВЛАДЕНИЕ СЕМЬЁЙ ----------

ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES t_p5815085_family_assistant_pro.users(id);

ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD COLUMN IF NOT EXISTS ownership_transferred_at TIMESTAMP;

-- Backfill: владелец = самый ранний участник с role='Владелец',
-- иначе самый ранний admin, иначе самый ранний участник с аккаунтом.
WITH ranked AS (
    SELECT
        fm.family_id,
        fm.user_id,
        ROW_NUMBER() OVER (
            PARTITION BY fm.family_id
            ORDER BY
                CASE WHEN fm.role = 'Владелец' THEN 0
                     WHEN fm.access_role = 'admin' THEN 1
                     ELSE 2 END,
                fm.created_at ASC
        ) AS rn
    FROM t_p5815085_family_assistant_pro.family_members fm
    WHERE fm.user_id IS NOT NULL
)
UPDATE t_p5815085_family_assistant_pro.families f
SET owner_user_id = ranked.user_id
FROM ranked
WHERE ranked.family_id = f.id
  AND ranked.rn = 1
  AND f.owner_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_families_owner_user_id
    ON t_p5815085_family_assistant_pro.families(owner_user_id);

-- Журнал передач владения (отдельная операция, не обычное администрирование)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_ownership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    from_user_id UUID,
    to_user_id UUID NOT NULL,
    performed_by UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_family_ownership_history_family
    ON t_p5815085_family_assistant_pro.family_ownership_history(family_id, created_at DESC);

-- ---------- 2. ОПЕКУНСТВО (relationship / ABAC) ----------
-- guardian не должен автоматически видеть данные всех участников.
-- Доступ к чувствительным данным конкретного человека даётся явной связью.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_guardianships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    guardian_member_id UUID NOT NULL,
    dependent_member_id UUID NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['health']::TEXT[],
    granted_by UUID,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT member_guardianships_no_self CHECK (guardian_member_id <> dependent_member_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_member_guardianship_active
    ON t_p5815085_family_assistant_pro.member_guardianships(guardian_member_id, dependent_member_id)
    WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_member_guardianships_dependent
    ON t_p5815085_family_assistant_pro.member_guardianships(dependent_member_id)
    WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_member_guardianships_family
    ON t_p5815085_family_assistant_pro.member_guardianships(family_id);

-- ---------- 3. АУДИТ РЕШЕНИЙ АВТОРИЗАЦИИ ----------
-- Отдельная таблица от security_audit_log: там user_id INTEGER,
-- что несовместимо с users.id UUID. Содержимое данных НЕ логируется.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.authz_audit_log (
    id BIGSERIAL PRIMARY KEY,
    occurred_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    request_id TEXT,
    actor_user_id UUID,
    actor_member_id UUID,
    family_id UUID,
    actor_role TEXT,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    subject_member_id UUID,
    result TEXT NOT NULL,
    reason_code TEXT NOT NULL,
    http_status INTEGER,
    ip_hash TEXT,
    user_agent_family TEXT,
    CONSTRAINT authz_audit_result_chk CHECK (result IN ('allowed', 'denied'))
);

CREATE INDEX IF NOT EXISTS idx_authz_audit_occurred_at
    ON t_p5815085_family_assistant_pro.authz_audit_log(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_authz_audit_actor
    ON t_p5815085_family_assistant_pro.authz_audit_log(actor_user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_authz_audit_family
    ON t_p5815085_family_assistant_pro.authz_audit_log(family_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_authz_audit_resource
    ON t_p5815085_family_assistant_pro.authz_audit_log(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_authz_audit_denied
    ON t_p5815085_family_assistant_pro.authz_audit_log(occurred_at DESC)
    WHERE result = 'denied';

-- Анти-флуд: счётчик одинаковых отказов вместо тысячи строк
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.authz_denial_counters (
    id BIGSERIAL PRIMARY KEY,
    bucket_key TEXT NOT NULL,
    window_start TIMESTAMP NOT NULL,
    hits INTEGER NOT NULL DEFAULT 1,
    last_seen_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_authz_denial_bucket
    ON t_p5815085_family_assistant_pro.authz_denial_counters(bucket_key, window_start);

-- ---------- 4. НОРМАЛИЗАЦИЯ РОЛЕЙ ----------
UPDATE t_p5815085_family_assistant_pro.family_members
SET access_role = 'parent'
WHERE access_role = 'editor';

UPDATE t_p5815085_family_assistant_pro.family_members
SET access_role = 'child'
WHERE access_role IS NULL OR access_role = '';
