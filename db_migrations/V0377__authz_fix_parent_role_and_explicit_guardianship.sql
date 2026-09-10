-- ============================================================
-- V0377 — Исправление последствий миграции editor -> parent
--         и переход на ЯВНЫЕ связи доступа к детским данным.
--
-- Проблема, обнаруженная при проверке V0376:
--   UPDATE family_members SET access_role='parent' WHERE access_role='editor'
--   приравняла право РЕДАКТИРОВАНИЯ к семейному ОТНОШЕНИЮ.
--   Факт: участник "Матвей" (role='Сын', birth_date=2014-03-12, 12 лет)
--   получил access_role='parent' и по политике auth_guard получал бы
--   доступ к медицинским данным младшего брата Ильи (2021 г.р.).
--
-- Принцип после этой миграции:
--   роль определяет ТИП разрешения, отношение определяет КОНКРЕТНОГО
--   субъекта. Роль 'parent' сама по себе НЕ открывает данные детей.
-- ============================================================

-- ---------- 1. ОТКАТ НЕКОРРЕКТНОГО editor -> parent ----------

UPDATE t_p5815085_family_assistant_pro.family_members
SET access_role = 'viewer',
    updated_at = CURRENT_TIMESTAMP
WHERE access_role = 'parent'
  AND (
        role IN ('Сын', 'Дочь', 'Ребёнок', 'Ребенок', 'Внук', 'Внучка',
                 'Брат', 'Сестра', 'Подопечный')
     OR account_type = 'child_profile'
     OR (birth_date IS NOT NULL
         AND birth_date > (CURRENT_DATE - INTERVAL '18 years'))
  );

-- ---------- 2. ЯВНЫЕ СВЯЗИ ОПЕКУНСТВА ВМЕСТО НЕЯВНОГО parent ----------
-- Пока нет отдельной модели родства, доступ взрослого к данным ребёнка
-- выдаётся ТОЛЬКО адресной записью в member_guardianships.

INSERT INTO t_p5815085_family_assistant_pro.member_guardianships
    (family_id, guardian_member_id, dependent_member_id, scopes, granted_by)
SELECT
    kid.family_id,
    adult.id,
    kid.id,
    ARRAY['health', 'medications', 'children', 'documents', 'portfolio']::TEXT[],
    NULL
FROM t_p5815085_family_assistant_pro.family_members kid
JOIN t_p5815085_family_assistant_pro.family_members adult
     ON adult.family_id = kid.family_id
    AND adult.id <> kid.id
WHERE
    (kid.account_type = 'child_profile' OR kid.access_role = 'child')
    AND adult.user_id IS NOT NULL
    AND adult.account_type = 'full'
    AND adult.access_role IN ('admin', 'parent')
    AND (adult.birth_date IS NULL
         OR adult.birth_date <= (CURRENT_DATE - INTERVAL '18 years'))
    AND adult.role NOT IN ('Сын', 'Дочь', 'Ребёнок', 'Ребенок',
                           'Внук', 'Внучка', 'Подопечный')
    AND NOT EXISTS (
        SELECT 1 FROM t_p5815085_family_assistant_pro.member_guardianships g
        WHERE g.guardian_member_id = adult.id
          AND g.dependent_member_id = kid.id
          AND g.revoked_at IS NULL
    );

-- ---------- 3. СНИМОК permissions JSONB ДО БУДУЩЕЙ МИГРАЦИИ ----------
-- Backend временно не применяет JSONB как источник истины.
-- Сохраняем пользовательские настройки, чтобы позже перенести их
-- как СУЖАЮЩИЕ ограничения базовой роли (не расширяющие).

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.permissions_jsonb_snapshot (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    family_id UUID NOT NULL,
    access_role TEXT,
    permissions JSONB,
    granular_permissions JSONB,
    captured_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

INSERT INTO t_p5815085_family_assistant_pro.permissions_jsonb_snapshot
    (member_id, family_id, access_role, permissions, granular_permissions)
SELECT id, family_id, access_role, permissions, granular_permissions
FROM t_p5815085_family_assistant_pro.family_members
WHERE permissions IS NOT NULL OR granular_permissions IS NOT NULL;

-- ---------- 4. РЕТЕНШН АУДИТА ----------
-- 12 месяцев для чувствительных событий (роли, владение, экспорт,
-- разрешённый доступ), 180 дней для рядовых технических отказов.
-- Аудит сам содержит ПДн, поэтому «хранить всё 3-5 лет» не делаем.

ALTER TABLE t_p5815085_family_assistant_pro.authz_audit_log
    ADD COLUMN IF NOT EXISTS retain_until TIMESTAMP;

UPDATE t_p5815085_family_assistant_pro.authz_audit_log
SET retain_until = occurred_at + INTERVAL '365 days'
WHERE retain_until IS NULL
  AND (result = 'allowed' OR module IN ('family_members', 'export', 'finance'));

UPDATE t_p5815085_family_assistant_pro.authz_audit_log
SET retain_until = occurred_at + INTERVAL '180 days'
WHERE retain_until IS NULL;

CREATE INDEX IF NOT EXISTS idx_authz_audit_retain
    ON t_p5815085_family_assistant_pro.authz_audit_log(retain_until);
