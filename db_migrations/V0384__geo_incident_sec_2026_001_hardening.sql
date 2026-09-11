-- Последствия инцидента SEC-2026-001 (публичная геолокация).
--
-- Код уже закрыт (require_location_access). Миграция закрепляет то,
-- что нельзя держать только в коде: принадлежность геозон семье,
-- отдельное согласие на доступ к перемещениям и журнал просмотров.
--
-- 1. Геозоны без владельца.
-- geofences.family_id был NULL-able, и функция создавала зоны без него:
-- такая зона попадала в общий список и была видна всем. Осиротевшие
-- зоны не удаляем (это чей-то домашний адрес), но изолируем.
-- Колонка zone_status добавлена предыдущей миграцией.

UPDATE t_p5815085_family_assistant_pro.geofences
   SET zone_status = 'orphaned_no_family'
 WHERE family_id IS NULL AND zone_status = 'active';

ALTER TABLE t_p5815085_family_assistant_pro.geofences
    DROP CONSTRAINT IF EXISTS geofences_family_required;

ALTER TABLE t_p5815085_family_assistant_pro.geofences
    ADD CONSTRAINT geofences_family_required
    CHECK (family_id IS NOT NULL OR zone_status <> 'active');

CREATE INDEX IF NOT EXISTS idx_geofences_family
    ON t_p5815085_family_assistant_pro.geofences (family_id)
 WHERE zone_status = 'active';

-- 2. Отдельное согласие на доступ к перемещениям.
-- Подтверждая опекунство над ребёнком, человек соглашается вести его
-- здоровье и календарь. Точные перемещения — отдельное решение, и оно
-- не должно выдаваться одной кнопкой вместе с остальными правами.

ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS location_consent_status text NOT NULL DEFAULT 'not_requested';

ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS location_consent_at timestamp NULL;

ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD COLUMN IF NOT EXISTS location_consent_by uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    DROP CONSTRAINT IF EXISTS guardianships_location_consent_values;

ALTER TABLE t_p5815085_family_assistant_pro.member_guardianships
    ADD CONSTRAINT guardianships_location_consent_values
    CHECK (location_consent_status IN
           ('not_requested', 'requested', 'granted', 'declined', 'revoked'));

-- Geo-scope никогда не выдавался осознанно, только просачивался через
-- политику доступа по названию роли. Ни одной такой связи быть не должно.
UPDATE t_p5815085_family_assistant_pro.member_guardianships
   SET scopes = array_remove(array_remove(scopes, 'geolocation'), 'all')
 WHERE 'geolocation' = ANY(scopes) OR 'all' = ANY(scopes);

-- 3. Журнал просмотров чужих перемещений.
-- authz_audit_log отвечает на «кто что пытался», но по геоданным нужен
-- отдельный, не смешанный с общим потоком журнал: именно его выгружают,
-- когда родитель спрашивает «кто видел, где был мой ребёнок».
-- Хранит только решения и идентификаторы, без самих координат.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_access_log (
    id bigserial PRIMARY KEY,
    occurred_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    family_id uuid NULL,
    viewer_member_id uuid NULL,
    subject_member_id uuid NULL,
    access_kind text NOT NULL,
    grant_reason text NULL,
    precision_level text NULL,
    points_returned integer NULL,
    request_id text NULL,
    ip_hash text NULL
);

CREATE INDEX IF NOT EXISTS idx_location_access_subject
    ON t_p5815085_family_assistant_pro.location_access_log
       (subject_member_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_location_access_family
    ON t_p5815085_family_assistant_pro.location_access_log
       (family_id, occurred_at DESC);

-- 4. Срок хранения координат.
-- Бессрочная история перемещений несоразмерна цели «посмотреть, где
-- ребёнок был сегодня». Срок объявляем в данных, а не в комментарии,
-- чтобы очистка не зависела от памяти разработчика. Саму очистку
-- отдельной задачей: удаление данных требует решения владельца продукта.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.location_retention_policy (
    id integer PRIMARY KEY DEFAULT 1,
    retention_days integer NOT NULL DEFAULT 90,
    precise_window_days integer NOT NULL DEFAULT 14,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO t_p5815085_family_assistant_pro.location_retention_policy
    (id, retention_days, precise_window_days)
VALUES (1, 90, 14) ON CONFLICT (id) DO NOTHING;
