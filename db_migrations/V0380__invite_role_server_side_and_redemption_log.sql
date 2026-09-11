-- ============================================================
-- V0380 — Приглашения: роль хранится на сервере, использование
--         атомарно, журнал принятия приглашений.
--
-- Проблема: family_invites не хранит выдаваемую роль. Клиент передавал
-- role при создании приглашения только для текста письма, а при join
-- роль вообще не применялась — присоединившийся получал access_role
-- по умолчанию. Это делает приглашение неуправляемым: невозможно ни
-- ограничить его viewer-ом, ни доказать, на каких условиях человек вошёл.
-- ============================================================

-- Роль, которую даёт приглашение. Задаётся при создании и больше
-- не принимается от того, кто приглашение принимает.
ALTER TABLE t_p5815085_family_assistant_pro.family_invites
    ADD COLUMN IF NOT EXISTS access_role TEXT NOT NULL DEFAULT 'viewer';

-- 'admin' через приглашение не выдаётся: расширение круга
-- администраторов — отдельная операция владельца.
ALTER TABLE t_p5815085_family_assistant_pro.family_invites
    DROP CONSTRAINT IF EXISTS family_invites_access_role_chk;

ALTER TABLE t_p5815085_family_assistant_pro.family_invites
    ADD CONSTRAINT family_invites_access_role_chk
    CHECK (access_role IN ('parent', 'guardian', 'viewer', 'child'));

-- Исторические приглашения приводим к минимальной роли: какие права
-- предполагались, достоверно неизвестно, поэтому выдаём наименьшие.
UPDATE t_p5815085_family_assistant_pro.family_invites
SET access_role = 'viewer'
WHERE access_role IS NULL
   OR access_role NOT IN ('parent', 'guardian', 'viewer', 'child');

ALTER TABLE t_p5815085_family_assistant_pro.family_invites
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;

-- Счётчик использований не должен уходить за предел даже при гонке
-- двух одновременных join-запросов по одному коду.
ALTER TABLE t_p5815085_family_assistant_pro.family_invites
    DROP CONSTRAINT IF EXISTS family_invites_uses_within_max;

UPDATE t_p5815085_family_assistant_pro.family_invites
SET uses_count = max_uses
WHERE uses_count > max_uses;

ALTER TABLE t_p5815085_family_assistant_pro.family_invites
    ADD CONSTRAINT family_invites_uses_within_max
    CHECK (uses_count >= 0 AND uses_count <= max_uses);

CREATE INDEX IF NOT EXISTS idx_family_invites_code_active
    ON t_p5815085_family_assistant_pro.family_invites(invite_code)
    WHERE is_active AND revoked_at IS NULL;

-- Журнал принятия приглашений: кто, по какому коду, с какой ролью
-- и когда вошёл в семью. Нужен для разбора инцидентов членства.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.family_invite_redemptions (
    id BIGSERIAL PRIMARY KEY,
    invite_id UUID NOT NULL,
    family_id UUID NOT NULL,
    redeemed_by_user_id UUID NOT NULL,
    member_id UUID,
    granted_access_role TEXT NOT NULL,
    ip_hash TEXT,
    redeemed_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS idx_invite_redemptions_invite
    ON t_p5815085_family_assistant_pro.family_invite_redemptions(invite_id);

CREATE INDEX IF NOT EXISTS idx_invite_redemptions_user
    ON t_p5815085_family_assistant_pro.family_invite_redemptions(redeemed_by_user_id, redeemed_at DESC);

-- Один пользователь не может дважды использовать одно приглашение.
CREATE UNIQUE INDEX IF NOT EXISTS uq_invite_redemption_once
    ON t_p5815085_family_assistant_pro.family_invite_redemptions(invite_id, redeemed_by_user_id);
