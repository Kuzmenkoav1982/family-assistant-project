-- ============================================================
-- V0379 — Изоляция дубликатов, происхождение опекунств,
--         происхождение владения, классификация пустых семей.
--
-- Принцип волны: ничего не убирается физически. Неподтверждённая
-- запись переводится в наблюдаемое состояние и исключается из
-- авторизации, но остаётся в БД до ручного решения.
--
-- Миграция идемпотентна: часть шагов уже применена ранее.
-- ============================================================

-- ------------------------------------------------------------
-- 1. ПРОИСХОЖДЕНИЕ И СТАТУС ОПЕКУНСТВ
-- ------------------------------------------------------------
-- 29 связей созданы V0377 по косвенным признакам (роль, возраст,
-- общая семья). Это предположение, а не подтверждённое родство:
-- помечаем pending_confirmation и сужаем действующий scope.

ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'explicit';
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS created_by_migration TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS scopes_requested TEXT[];
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS confirmed_by UUID;
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS revoke_reason TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS evidence TEXT;

UPDATE t_p5815085_family_assistant_pro.member_guardianships
SET scopes_requested = COALESCE(scopes_requested, scopes)
WHERE scopes_requested IS NULL;

UPDATE t_p5815085_family_assistant_pro.member_guardianships
SET source = 'migration_backfill',
    status = 'pending_confirmation',
    created_by_migration = 'V0377',
    confirmed_at = NULL,
    scopes = ARRAY['health', 'medications', 'children']::TEXT[]
WHERE granted_by IS NULL
  AND created_by_migration IS NULL
  AND created_at < TIMESTAMP '2026-09-11';

UPDATE t_p5815085_family_assistant_pro.member_guardianships g
SET evidence = 'ROLE_ADULT_SAME_FAMILY: guardian.access_role=' || COALESCE(gm.access_role, '-')
               || ', guardian.role=' || COALESCE(gm.role, '-')
               || ', dependent.account_type=' || COALESCE(dm.account_type, '-')
               || ', dependent.access_role=' || COALESCE(dm.access_role, '-')
               || ', dependent.birth_date=' || COALESCE(dm.birth_date::text, 'unknown')
FROM t_p5815085_family_assistant_pro.family_members gm,
     t_p5815085_family_assistant_pro.family_members dm
WHERE gm.id = g.guardian_member_id
  AND dm.id = g.dependent_member_id
  AND g.source = 'migration_backfill'
  AND g.evidence IS NULL;

CREATE INDEX IF NOT EXISTS idx_member_guardianships_status
    ON t_p5815085_family_assistant_pro.member_guardianships(status)
    WHERE revoked_at IS NULL;

-- ------------------------------------------------------------
-- 2. ЖУРНАЛ РАЗБОРА ДУБЛИКАТОВ
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_duplicate_review (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    family_id UUID NOT NULL,
    user_id UUID,
    marked_by_migration TEXT,
    ref_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
    canonical_member_id UUID,
    decision TEXT NOT NULL DEFAULT 'pending',
    decided_at TIMESTAMP,
    decided_by UUID,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_member_duplicate_review_member
    ON t_p5815085_family_assistant_pro.member_duplicate_review(member_id);

INSERT INTO t_p5815085_family_assistant_pro.member_duplicate_review
    (member_id, family_id, user_id, marked_by_migration, ref_counts, decision)
SELECT
    fm.id, fm.family_id, fm.user_id, 'V0095/V0098',
    jsonb_build_object(
        'guardianships_as_dependent',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.member_guardianships g
             WHERE g.dependent_member_id = fm.id),
        'guardianships_as_guardian',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.member_guardianships g
             WHERE g.guardian_member_id = fm.id),
        'permissions_snapshot',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.permissions_jsonb_snapshot p
             WHERE p.member_id = fm.id),
        'tasks_assigned',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.tasks t
             WHERE t.assignee_id = fm.id),
        'calendar_events_as_child',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.calendar_events c
             WHERE c.child_id = fm.id),
        'member_profiles',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.member_profiles mp
             WHERE mp.member_id = fm.id),
        'sessions_of_user',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.sessions s
             WHERE s.user_id = fm.user_id),
        'other_members_of_user',
            (SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.family_members o
             WHERE o.user_id = fm.user_id AND o.id <> fm.id)
    ),
    'pending'
FROM t_p5815085_family_assistant_pro.family_members fm
WHERE fm.name LIKE '[ДУБЛИКАТ%'
ON CONFLICT (member_id) DO NOTHING;

-- ------------------------------------------------------------
-- 3. НОВОЕ СОСТОЯНИЕ УЧАСТНИКА: duplicate_review
-- ------------------------------------------------------------
-- Прежний CHECK допускал только pending/active/revoked. Нужен
-- отдельный статус: запись не активна, но и не отозвана — она
-- находится на разборе и не должна участвовать в авторизации.

ALTER TABLE t_p5815085_family_assistant_pro.family_members
    DROP CONSTRAINT IF EXISTS family_members_member_status_check;

ALTER TABLE t_p5815085_family_assistant_pro.family_members
    ADD CONSTRAINT family_members_member_status_check
    CHECK (member_status IN ('pending', 'active', 'revoked', 'duplicate_review'));

UPDATE t_p5815085_family_assistant_pro.family_members
SET member_status = 'duplicate_review',
    updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '[ДУБЛИКАТ%'
  AND member_status <> 'duplicate_review';

-- Опекунства на дубликат и от дубликата деактивируются с сохранением следа.
UPDATE t_p5815085_family_assistant_pro.member_guardianships g
SET revoked_at = (NOW() AT TIME ZONE 'UTC'),
    revoke_reason = 'DUPLICATE_REVIEW',
    status = 'rejected'
FROM t_p5815085_family_assistant_pro.family_members dm
WHERE dm.id = g.dependent_member_id
  AND dm.member_status = 'duplicate_review'
  AND g.revoked_at IS NULL;

UPDATE t_p5815085_family_assistant_pro.member_guardianships g
SET revoked_at = (NOW() AT TIME ZONE 'UTC'),
    revoke_reason = 'DUPLICATE_REVIEW_GUARDIAN',
    status = 'rejected'
FROM t_p5815085_family_assistant_pro.family_members gm
WHERE gm.id = g.guardian_member_id
  AND gm.member_status = 'duplicate_review'
  AND g.revoked_at IS NULL;

UPDATE t_p5815085_family_assistant_pro.member_duplicate_review r
SET ref_counts = jsonb_set(r.ref_counts, '{guardianships_revoked_by_isolation}',
        to_jsonb((SELECT COUNT(*) FROM t_p5815085_family_assistant_pro.member_guardianships g
                  WHERE (g.dependent_member_id = r.member_id OR g.guardian_member_id = r.member_id)
                    AND g.revoke_reason LIKE 'DUPLICATE_REVIEW%')))
WHERE TRUE;

-- ------------------------------------------------------------
-- 4. ПРОИСХОЖДЕНИЕ ВЛАДЕНИЯ СЕМЬЁЙ
-- ------------------------------------------------------------

ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD COLUMN IF NOT EXISTS ownership_source TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD COLUMN IF NOT EXISTS ownership_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD COLUMN IF NOT EXISTS ownership_confirmed_at TIMESTAMP;
ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD COLUMN IF NOT EXISTS space_status TEXT NOT NULL DEFAULT 'active';

-- Есть участник с role='Владелец' — прямое свидетельство владения.
UPDATE t_p5815085_family_assistant_pro.families f
SET ownership_source = 'migration_owner_role'
WHERE f.owner_user_id IS NOT NULL
  AND f.ownership_source IS NULL
  AND EXISTS (
      SELECT 1 FROM t_p5815085_family_assistant_pro.family_members m
      WHERE m.family_id = f.id AND m.user_id = f.owner_user_id AND m.role = 'Владелец'
  );

-- Остальные назначены правилом «самый ранний admin» — это догадка.
UPDATE t_p5815085_family_assistant_pro.families f
SET ownership_source = 'migration_fallback'
WHERE f.owner_user_id IS NOT NULL
  AND f.ownership_source IS NULL;

-- ------------------------------------------------------------
-- 5. КЛАССИФИКАЦИЯ ПУСТЫХ ПРОСТРАНСТВ
-- ------------------------------------------------------------

UPDATE t_p5815085_family_assistant_pro.families f
SET space_status = 'abandoned_empty'
WHERE f.owner_user_id IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM t_p5815085_family_assistant_pro.family_members m
      WHERE m.family_id = f.id
  );

CREATE INDEX IF NOT EXISTS idx_families_space_status
    ON t_p5815085_family_assistant_pro.families(space_status);

-- ------------------------------------------------------------
-- 6. ИНВАРИАНТ: АКТИВНАЯ СЕМЬЯ НЕ БЫВАЕТ БЕЗ ВЛАДЕЛЬЦА
-- ------------------------------------------------------------

ALTER TABLE t_p5815085_family_assistant_pro.families
    DROP CONSTRAINT IF EXISTS families_active_requires_owner;

ALTER TABLE t_p5815085_family_assistant_pro.families
    ADD CONSTRAINT families_active_requires_owner
    CHECK (space_status <> 'active' OR owner_user_id IS NOT NULL);
