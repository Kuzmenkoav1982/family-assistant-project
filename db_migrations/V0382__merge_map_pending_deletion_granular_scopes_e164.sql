-- ============================================================
-- V0382 — Карта соответствий дубликатов, карантин перед удалением,
--         гранулярные scopes опекунства, модель телефона E.164,
--         карточка инцидента геолокации.
--
-- Ничего не удаляется физически. Вводится состояние pending_deletion
-- и 30-дневный карантин: удаление — отдельное решение отдельной
-- миграции после повторной проверки ссылок.
-- ============================================================

-- ------------------------------------------------------------
-- 1. КАРТА duplicate -> canonical
-- ------------------------------------------------------------
-- Даже когда переносить нечего, карта отвечает на вопрос
-- «куда делась запись» через год после удаления.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_merge_map (
    id BIGSERIAL PRIMARY KEY,
    duplicate_member_id UUID NOT NULL,
    canonical_member_id UUID NOT NULL,
    duplicate_user_id   UUID,
    canonical_user_id   UUID,
    family_id           UUID NOT NULL,
    reason              TEXT NOT NULL,
    evidence            JSONB NOT NULL DEFAULT '{}'::jsonb,
    ref_check           JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_account_action TEXT NOT NULL DEFAULT 'not_decided',
    decided_at          TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    decided_by          TEXT NOT NULL,
    quarantine_until    TIMESTAMP,
    purged_at           TIMESTAMP,
    CONSTRAINT member_merge_map_not_self CHECK (duplicate_member_id <> canonical_member_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_member_merge_map_duplicate
    ON t_p5815085_family_assistant_pro.member_merge_map(duplicate_member_id);

-- Основание: дубликаты — телефон-аккаунты без email/имени, созданные
-- в тот же день, что и канонические email-аккаунты того же человека,
-- с 1-2 сессиями и нулём содержательных данных. Канонические записи —
-- с именем, email и активной историей сессий.

INSERT INTO t_p5815085_family_assistant_pro.member_merge_map
    (duplicate_member_id, canonical_member_id, duplicate_user_id, canonical_user_id,
     family_id, reason, evidence, ref_check, decided_by, quarantine_until)
VALUES
  ('ab40fa23-3c53-4cef-9ea3-e62e83099da9', '850429bd-81da-4cd4-a22b-cc4832f3ebcc',
   '9184df7b-b25e-4416-856e-0b27629bc4de', '5a89a195-41aa-447e-a239-58a3058153b2',
   '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a',
   'PHONE_SIGNUP_DUPLICATE_OF_EMAIL_ACCOUNT',
   jsonb_build_object(
     'duplicate_name', '[ДУБЛИКАТ - УДАЛИТЬ] Вадим',
     'canonical_name', 'Вадим',
     'duplicate_identity', 'phone 79852208544, no email, no name',
     'canonical_identity', 'email voronovva1976@mail.ru, name Вадим',
     'duplicate_sessions', 1, 'canonical_sessions', 6,
     'same_day_signup', true,
     'marked_by', 'V0095/V0098 name prefix [ДУБЛИКАТ - УДАЛИТЬ]'),
   jsonb_build_object('profiles',0,'tasks',0,'calendar_child',0,'health',0,
                      'guardianships_active',0,'other_families',0),
   'wave3-audit', (NOW() AT TIME ZONE 'UTC') + INTERVAL '30 days'),

  ('1903430d-7e05-4fe8-b1dd-fbcdf63d81ce', '8156df8c-e718-4bb7-a68e-107921ea8515',
   '7469e81d-cafb-4c08-8d69-155ead053d7c', '7bda5971-2de6-4b5c-852c-dca5c7ce8571',
   '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a',
   'PHONE_SIGNUP_DUPLICATE_OF_EMAIL_ACCOUNT',
   jsonb_build_object(
     'duplicate_name', '[ДУБЛИКАТ - УДАЛИТЬ] Людмила',
     'canonical_name', 'Людочка',
     'duplicate_identity', 'phone +79629547830, no email, no name',
     'canonical_identity', 'email kuzmenkolv1961@mail.ru, name Людочка',
     'duplicate_sessions', 1, 'canonical_sessions', 11,
     'phone_collision_with', '1f097a7f-a95d-4282-9768-d18a15a8112b',
     'note', 'тот же номер, что у второго дубликата, в другом формате записи'),
   jsonb_build_object('profiles',0,'tasks',0,'calendar_child',0,'health',0,
                      'guardianships_active',0,'other_families',0),
   'wave3-audit', (NOW() AT TIME ZONE 'UTC') + INTERVAL '30 days'),

  ('1f097a7f-a95d-4282-9768-d18a15a8112b', '8156df8c-e718-4bb7-a68e-107921ea8515',
   'e90357a7-84b1-4d4a-8143-5a0c26537cfb', '7bda5971-2de6-4b5c-852c-dca5c7ce8571',
   '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a',
   'PHONE_SIGNUP_DUPLICATE_OF_EMAIL_ACCOUNT',
   jsonb_build_object(
     'duplicate_name', '[ДУБЛИКАТ - УДАЛИТЬ] Людочка',
     'canonical_name', 'Людочка',
     'duplicate_identity', 'phone 79629547830, no email, no name',
     'canonical_identity', 'email kuzmenkolv1961@mail.ru, name Людочка',
     'duplicate_sessions', 2, 'canonical_sessions', 11,
     'phone_collision_with', '1903430d-7e05-4fe8-b1dd-fbcdf63d81ce',
     'note', 'обе стороны телефонной коллизии — дубликаты одного человека'),
   jsonb_build_object('profiles',0,'tasks',0,'calendar_child',0,'health',0,
                      'guardianships_active',0,'other_families',0),
   'wave3-audit', (NOW() AT TIME ZONE 'UTC') + INTERVAL '30 days'),

  ('d4525a8e-1c96-4e87-8bdd-ace17aa43aff', '8156df8c-e718-4bb7-a68e-107921ea8515',
   '7ffabbc6-0235-4b30-9845-e392fd8aef14', '7bda5971-2de6-4b5c-852c-dca5c7ce8571',
   '046e1a53-a0e6-43d4-bf81-9571b2ff0e4a',
   'PHONE_SIGNUP_DUPLICATE_OF_EMAIL_ACCOUNT',
   jsonb_build_object(
     'duplicate_name', '[ДУБЛИКАТ - УДАЛИТЬ] Людочка',
     'canonical_name', 'Людочка',
     'duplicate_identity', 'phone 79250329205, no email, no name',
     'canonical_identity', 'email kuzmenkolv1961@mail.ru, name Людочка',
     'duplicate_sessions', 1, 'canonical_sessions', 11,
     'note', 'третья попытка входа по телефону того же человека'),
   jsonb_build_object('profiles',0,'tasks',0,'calendar_child',0,'health',0,
                      'guardianships_active',0,'other_families',0),
   'wave3-audit', (NOW() AT TIME ZONE 'UTC') + INTERVAL '30 days')
ON CONFLICT (duplicate_member_id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. РЕЗЕРВНАЯ КОПИЯ ЗАТРОНУТЫХ СТРОК ДО ЛЮБОГО УДАЛЕНИЯ
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_deletion_backup (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    row_data JSONB NOT NULL,
    backed_up_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS idx_member_deletion_backup_member
    ON t_p5815085_family_assistant_pro.member_deletion_backup(member_id);

INSERT INTO t_p5815085_family_assistant_pro.member_deletion_backup (member_id, table_name, row_data)
SELECT fm.id, 'family_members', to_jsonb(fm)
FROM t_p5815085_family_assistant_pro.family_members fm
JOIN t_p5815085_family_assistant_pro.member_merge_map mm ON mm.duplicate_member_id = fm.id
WHERE NOT EXISTS (
    SELECT 1 FROM t_p5815085_family_assistant_pro.member_deletion_backup b
    WHERE b.member_id = fm.id AND b.table_name = 'family_members');

INSERT INTO t_p5815085_family_assistant_pro.member_deletion_backup (member_id, table_name, row_data)
SELECT mm.duplicate_member_id, 'member_guardianships', to_jsonb(g)
FROM t_p5815085_family_assistant_pro.member_guardianships g
JOIN t_p5815085_family_assistant_pro.member_merge_map mm
  ON mm.duplicate_member_id IN (g.dependent_member_id, g.guardian_member_id)
WHERE NOT EXISTS (
    SELECT 1 FROM t_p5815085_family_assistant_pro.member_deletion_backup b
    WHERE b.member_id = mm.duplicate_member_id AND b.table_name = 'member_guardianships'
      AND b.row_data->>'id' = g.id::text);

INSERT INTO t_p5815085_family_assistant_pro.member_deletion_backup (member_id, table_name, row_data)
SELECT mm.duplicate_member_id, 'users', to_jsonb(u)
FROM t_p5815085_family_assistant_pro.users u
JOIN t_p5815085_family_assistant_pro.member_merge_map mm ON mm.duplicate_user_id = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM t_p5815085_family_assistant_pro.member_deletion_backup b
    WHERE b.member_id = mm.duplicate_member_id AND b.table_name = 'users');

INSERT INTO t_p5815085_family_assistant_pro.member_deletion_backup (member_id, table_name, row_data)
SELECT mm.duplicate_member_id, 'sessions', to_jsonb(s)
FROM t_p5815085_family_assistant_pro.sessions s
JOIN t_p5815085_family_assistant_pro.member_merge_map mm ON mm.duplicate_user_id = s.user_id
WHERE NOT EXISTS (
    SELECT 1 FROM t_p5815085_family_assistant_pro.member_deletion_backup b
    WHERE b.member_id = mm.duplicate_member_id AND b.table_name = 'sessions'
      AND b.row_data->>'id' = s.id::text);

-- ------------------------------------------------------------
-- 3. СОСТОЯНИЕ pending_deletion + КАРАНТИН
-- ------------------------------------------------------------

ALTER TABLE t_p5815085_family_assistant_pro.family_members
    DROP CONSTRAINT IF EXISTS family_members_member_status_check;

ALTER TABLE t_p5815085_family_assistant_pro.family_members
    ADD CONSTRAINT family_members_member_status_check
    CHECK (member_status IN ('pending', 'active', 'revoked',
                             'duplicate_review', 'pending_deletion'));

UPDATE t_p5815085_family_assistant_pro.family_members fm
SET member_status = 'pending_deletion',
    updated_at = CURRENT_TIMESTAMP
FROM t_p5815085_family_assistant_pro.member_merge_map mm
WHERE mm.duplicate_member_id = fm.id
  AND fm.member_status = 'duplicate_review';

UPDATE t_p5815085_family_assistant_pro.member_duplicate_review r
SET canonical_member_id = mm.canonical_member_id,
    decision = 'pending_deletion',
    decided_at = (NOW() AT TIME ZONE 'UTC'),
    notes = 'V0382: канон установлен, 30-дневный карантин; '
            || 'аккаунт пользователя НЕ удаляется вместе с записью участника'
FROM t_p5815085_family_assistant_pro.member_merge_map mm
WHERE mm.duplicate_member_id = r.member_id;

-- Архивируем деактивированные опекунства дубликатов (копия уже в backup).
UPDATE t_p5815085_family_assistant_pro.member_guardianships g
SET revoke_reason = COALESCE(g.revoke_reason, 'DUPLICATE_REVIEW') || '|ARCHIVED_V0382'
FROM t_p5815085_family_assistant_pro.member_merge_map mm
WHERE mm.duplicate_member_id IN (g.dependent_member_id, g.guardian_member_id)
  AND g.revoked_at IS NOT NULL
  AND g.revoke_reason NOT LIKE '%ARCHIVED_V0382%';

-- ------------------------------------------------------------
-- 4. ГРАНУЛЯРНОЕ ПОДТВЕРЖДЕНИЕ ОПЕКУНСТВА
-- ------------------------------------------------------------
-- Подтверждается не «ребёнок целиком», а каждая область отдельно.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.guardianship_scope_consents (
    id BIGSERIAL PRIMARY KEY,
    guardianship_id UUID NOT NULL,
    scope TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    decided_at TIMESTAMP,
    decided_by UUID,
    decision_channel TEXT,
    note TEXT,
    CONSTRAINT guardianship_scope_status_check
        CHECK (status IN ('pending', 'granted', 'denied', 'revoked')),
    CONSTRAINT guardianship_scope_name_check
        CHECK (scope IN ('calendar', 'health', 'medications', 'documents',
                         'geolocation', 'portfolio', 'export'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_guardianship_scope
    ON t_p5815085_family_assistant_pro.guardianship_scope_consents(guardianship_id, scope);

-- Неподтверждённые связи теряют действующие scopes полностью.
-- Запрошенное сохраняется в scopes_requested — это заявка, не право.
UPDATE t_p5815085_family_assistant_pro.member_guardianships
SET scopes = ARRAY[]::TEXT[]
WHERE status = 'pending_confirmation'
  AND revoked_at IS NULL
  AND COALESCE(array_length(scopes, 1), 0) > 0;

-- Геолокация не входит даже в заявку: её запрашивают отдельно и осознанно.
UPDATE t_p5815085_family_assistant_pro.member_guardianships
SET scopes_requested = array_remove(scopes_requested, 'geolocation')
WHERE scopes_requested IS NOT NULL;

-- ------------------------------------------------------------
-- 5. ТЕЛЕФОН: МОДЕЛЬ E.164
-- ------------------------------------------------------------

ALTER TABLE t_p5815085_family_assistant_pro.users
    ADD COLUMN IF NOT EXISTS phone_raw TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.users
    ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.users
    ADD COLUMN IF NOT EXISTS phone_country TEXT;
ALTER TABLE t_p5815085_family_assistant_pro.users
    ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;
ALTER TABLE t_p5815085_family_assistant_pro.users
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active';

UPDATE t_p5815085_family_assistant_pro.users
SET phone_raw = phone
WHERE phone IS NOT NULL AND phone_raw IS NULL;

-- Бэкфилл только для РФ-номеров, которые распознаются однозначно:
-- 11 цифр, начинающихся с 7 или 8 -> +7XXXXXXXXXX.
-- Всё остальное намеренно остаётся NULL и нормализуется в приложении
-- через libphonenumber: догадываться о стране в SQL нельзя.
UPDATE t_p5815085_family_assistant_pro.users
SET phone_e164 = '+7' || RIGHT(regexp_replace(phone, '\D', '', 'g'), 10),
    phone_country = 'RU'
WHERE phone IS NOT NULL
  AND phone_e164 IS NULL
  AND LENGTH(regexp_replace(phone, '\D', '', 'g')) = 11
  AND LEFT(regexp_replace(phone, '\D', '', 'g'), 1) IN ('7', '8');

-- Аккаунты-дубликаты выводятся из активных ДО построения уникального
-- индекса: иначе существующая коллизия не даст его создать.
UPDATE t_p5815085_family_assistant_pro.users u
SET account_status = 'pending_deletion'
FROM t_p5815085_family_assistant_pro.member_merge_map mm
WHERE mm.duplicate_user_id = u.id
  AND u.account_status = 'active';

-- Частичный уникальный индекс: один АКТИВНЫЙ аккаунт на номер.
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone_e164_active
    ON t_p5815085_family_assistant_pro.users(phone_e164)
    WHERE phone_e164 IS NOT NULL AND account_status = 'active';

-- Сессии аккаунтов-дубликатов инвалидируются (не удаляются: строки нужны
-- для ретроспективы инцидента). Вход по дублирующему телефону больше
-- не даёт доступа к пространству.
UPDATE t_p5815085_family_assistant_pro.sessions s
SET expires_at = (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 second'
FROM t_p5815085_family_assistant_pro.member_merge_map mm
WHERE mm.duplicate_user_id = s.user_id
  AND s.expires_at > (NOW() AT TIME ZONE 'UTC');

-- ------------------------------------------------------------
-- 6. КАРТОЧКА ИНЦИДЕНТА БЕЗОПАСНОСТИ
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.security_incidents (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    exposure_from TIMESTAMP,
    exposure_to TIMESTAMP,
    discovered_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    affected_scope JSONB NOT NULL DEFAULT '{}'::jsonb,
    exploitation_evidence TEXT,
    log_availability TEXT,
    remediation TEXT,
    notification_decision TEXT,
    owner_role TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

INSERT INTO t_p5815085_family_assistant_pro.security_incidents
    (code, title, severity, status, exposure_from, exposure_to,
     affected_scope, exploitation_evidence, log_availability,
     remediation, notification_decision, owner_role)
VALUES (
  'SEC-2026-001',
  'Геоданные участников доступны без аутентификации (location-history, geofences, family-tracker, trips)',
  'critical', 'under_review',
  TIMESTAMP '2026-01-13 00:00:00',
  TIMESTAMP '2026-09-11 00:00:00',
  jsonb_build_object(
    'endpoints', jsonb_build_array(
       'location-history: member_id без сессии -> координаты за день (закрыто ранее в волне 3)',
       'geofences GET: возвращал геозоны ВСЕХ семей, таблица не имеет family_id вовсе',
       'family-tracker: сессия есть, но family через LIMIT 1 и без subject-проверки',
       'trips/trip_places: координаты мест без проверки семьи'),
    'rows_family_location_tracking', 187,
    'distinct_users_with_coordinates', 10,
    'distinct_families', 6,
    'distinct_members_resolved', 8,
    'rows_attributable_to_children', 2,
    'avg_accuracy_meters', 6653.8,
    'geofences_rows', 0,
    'geofence_events_rows', 0,
    'trip_places_rows', 23,
    'coordinate_precision', 'полная точность, без огрубления',
    'cdn_cacheable', 'Access-Control-Allow-Origin: * на всех затронутых функциях'),
  'Признаков массового перебора не обнаружено: журнал HTTP-запросов за период '
  || 'отсутствует, поэтому НЕВОЗМОЖНО ни подтвердить, ни опровергнуть обращения '
  || 'без токена. Косвенный признак в пользу отсутствия эксплуатации: geofences и '
  || 'geofence_events пусты, family_location_tracking содержит только записи '
  || 'участников соответствующих семей. Средняя точность 6.6 км указывает на '
  || 'IP-геолокацию, а не GPS, что снижает потенциальный вред.',
  'Журналы доступа к облачным функциям за 2026-01..2026-08 недоступны '
  || '(ретенция платформы). Аудит authz введён только V0376 (2026-09). '
  || 'Это само по себе дефект: с этого релиза просмотр точных координат логируется.',
  'V0382 + правки функций: закрыты все geo-эндпоинты, geolocation выделен в '
  || 'отдельный scope, роль больше не открывает чужие координаты, введено '
  || 'огрубление координат истории и обязательный аудит просмотра.',
  'Требуется решение ответственного за безопасность и юриста. Материал для '
  || 'решения: 6 семей, 10 пользователей, 2 записи относятся к детям; '
  || 'фактическая эксплуатация не подтверждена, но и не исключена из-за '
  || 'отсутствия логов.',
  'security_officer + legal'
)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------
-- 7. РЕТЕНЦИЯ ГЕОДАННЫХ И ВЛАДЕЛЕЦ ГЕОЗОН
-- ------------------------------------------------------------

ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP;

UPDATE t_p5815085_family_assistant_pro.family_location_tracking
SET retention_expires_at = created_at + INTERVAL '90 days'
WHERE retention_expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_location_tracking_retention
    ON t_p5815085_family_assistant_pro.family_location_tracking(retention_expires_at);

-- Геозоны без владельца — дефект схемы: таблица была общей на всю базу,
-- поэтому GET возвращал зоны всех семей. Таблица пуста, бэкфилл не нужен.
ALTER TABLE t_p5815085_family_assistant_pro.geofences
    ADD COLUMN IF NOT EXISTS family_id UUID;
ALTER TABLE t_p5815085_family_assistant_pro.geofences
    ADD COLUMN IF NOT EXISTS created_by_member_id UUID;

CREATE INDEX IF NOT EXISTS idx_geofences_family
    ON t_p5815085_family_assistant_pro.geofences(family_id);
