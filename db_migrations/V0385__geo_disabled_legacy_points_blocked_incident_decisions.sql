-- SEC-2026-001: фиксация ПРИНЯТЫХ РЕШЕНИЙ.
--
-- Технические дыры закрыты ранее (V0382-V0384 + правки функций). Здесь
-- закрепляется то, что решено по итогам разбора и что не должно жить
-- только в коде фронтенда:
--   1. геолокация выключена до отдельного согласия и UI управления доступом;
--   2. 187 исторических точек заблокированы от использования, не удалены;
--   3. решения по уведомлениям зафиксированы в реестре инцидентов.
--
-- Часть шагов уже применена предыдущим (оборвавшимся) запуском —
-- все операции идемпотентны и повторный прогон безопасен.

-- 1. Выключение геолокации.
UPDATE t_p5815085_family_assistant_pro.feature_flags
   SET is_enabled = false,
       description = 'Геолокация семьи. ВЫКЛЮЧЕНО с 11.09.2026 по итогам '
                     || 'SEC-2026-001. Включать только после отдельного '
                     || 'согласия на перемещения и UI управления доступом.',
       updated_at = CURRENT_TIMESTAMP
 WHERE flag_key = 'family_tracker_enabled';

-- Сбор и показ разделены намеренно: «открыть раздел» и «писать новые
-- координаты человека» — разные решения, второе не должно включаться заодно.
INSERT INTO t_p5815085_family_assistant_pro.feature_flags
    (flag_key, is_enabled, description)
VALUES
    ('geolocation_collection_enabled', false,
     'Запись новых координат участников. ВЫКЛЮЧЕНО с 11.09.2026 (SEC-2026-001). '
     || 'Новые данные геолокации не собираются без отдельного разрешения.'),
    ('geolocation_history_enabled', false,
     'Выдача истории перемещений. ВЫКЛЮЧЕНО с 11.09.2026 (SEC-2026-001). '
     || 'Исторические точки заблокированы от использования в приложении.')
ON CONFLICT (flag_key) DO UPDATE
   SET is_enabled = false,
       description = EXCLUDED.description,
       updated_at = CURRENT_TIMESTAMP;

-- 2. Блокировка исторических точек (не удаление).
ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD COLUMN IF NOT EXISTS usage_status text NOT NULL DEFAULT 'active';
ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD COLUMN IF NOT EXISTS blocked_reason text NULL;
ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD COLUMN IF NOT EXISTS blocked_at timestamp NULL;

ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    DROP CONSTRAINT IF EXISTS location_usage_status_values;
ALTER TABLE t_p5815085_family_assistant_pro.family_location_tracking
    ADD CONSTRAINT location_usage_status_values
    CHECK (usage_status IN ('active', 'blocked_incident', 'pending_deletion'));

UPDATE t_p5815085_family_assistant_pro.family_location_tracking
   SET usage_status   = 'blocked_incident',
       blocked_reason = 'SEC-2026-001: собрано в период незащищённого доступа',
       blocked_at     = CURRENT_TIMESTAMP
 WHERE usage_status = 'active';

CREATE INDEX IF NOT EXISTS idx_location_usable
    ON t_p5815085_family_assistant_pro.family_location_tracking
       (family_id, created_at DESC)
 WHERE usage_status = 'active';

-- 3. Legal hold: заблокированные точки одновременно являются
-- доказательством, retention-очистка не должна их снести.
ALTER TABLE t_p5815085_family_assistant_pro.location_retention_policy
    ADD COLUMN IF NOT EXISTS legal_hold boolean NOT NULL DEFAULT false;
ALTER TABLE t_p5815085_family_assistant_pro.location_retention_policy
    ADD COLUMN IF NOT EXISTS legal_hold_reason text NULL;

UPDATE t_p5815085_family_assistant_pro.location_retention_policy
   SET legal_hold = true,
       legal_hold_reason = 'SEC-2026-001: точки сохраняются как доказательство '
                           || 'до отдельного решения об удалении',
       updated_at = CURRENT_TIMESTAMP
 WHERE id = 1;

-- 4. Карточка инцидента в существующем реестре.
-- Уточняется оценка точности: формулировка «средняя 6.6 км, это
-- IP-геолокация» верна только в среднем по платформе и вводит в
-- заблуждение. Минимальная точность 10 м, в трёх семьях средняя 16-47 м,
-- то есть часть треков — точный GPS. Смягчающий вывод снимается.
UPDATE t_p5815085_family_assistant_pro.security_incidents
   SET status = 'remediated_monitoring',
       affected_scope = affected_scope || jsonb_build_object(
           'coordinate_precision',
           'НЕ приблизительные: минимум 10 м, в трёх семьях средняя 16-47 м '
           || '(точный GPS). Средняя 6.6 км по платформе смещена одной семьёй '
           || 'с IP-геолокацией и не характеризует выборку.',
           'data_categories', jsonb_build_array(
               'точные координаты участников',
               'история перемещений по дням',
               'адреса геозон (дом/школа/садик)',
               'состав семьи и идентификаторы участников',
               'местоположение несовершеннолетних (2 человека, 5 и 12 лет)'),
           'legacy_points_blocked', 187,
           'geolocation_disabled_at', '2026-09-11'),
       exploitation_evidence =
           'Подтверждённых обращений посторонних не обнаружено. Вместе с тем '
           || 'отсутствие журналов HTTP-запросов за период уязвимости не '
           || 'позволяет полностью исключить такой доступ: «не обнаружено» '
           || 'здесь означает отсутствие данных, а не отсутствие события. '
           || 'Косвенно в пользу отсутствия эксплуатации: geofences и '
           || 'geofence_events пусты, раздел почти не использовался, '
           || 'member_id — UUIDv4 (слепой перебор непрактичен). Опровергающее '
           || 'обстоятельство: UUID участников отдавались другими API, '
           || 'поэтому моделью «UUID как секрет» защита не является.',
       remediation =
           'V0382-V0384 + правки функций: закрыты все geo-эндпоинты '
           || '(require_session/require_location_access), geolocation выделен '
           || 'в отдельный scope, роль больше не открывает чужие координаты, '
           || 'огрубление истории старше 14 дней, обязательный аудит просмотра '
           || '(location_access_log), CRON_SECRET на рассылке, family_id '
           || 'обязателен для активных геозон. ДОПОЛНИТЕЛЬНО (эта миграция): '
           || 'геолокация выключена флагами family_tracker_enabled / '
           || 'geolocation_collection_enabled / geolocation_history_enabled; '
           || '187 исторических точек переведены в usage_status='
           || '''blocked_incident'' и приложением не используются; '
           || 'legal_hold на retention-очистку.',
       notification_decision =
           'РЕШЕНО 11.09.2026: семьям сейчас сообщения не отправляем; '
           || 'самостоятельного публичного сообщения об инциденте не делаем; '
           || 'новые данные геолокации не собираем без отдельного разрешения. '
           || 'Решение принято при известных вводных: 6 семей, 10 человек, '
           || '2 несовершеннолетних, подтверждённых обращений посторонних не '
           || 'обнаружено, полностью исключить доступ нельзя. ОТКРЫТО и '
           || 'подлежит пересмотру при появлении любого признака '
           || 'эксплуатации: вопрос уведомления регулятора и затронутых '
           || 'семей остаётся за ответственным за безопасность и юристом.',
       owner_role = 'security_officer + legal'
 WHERE code = 'SEC-2026-001';
