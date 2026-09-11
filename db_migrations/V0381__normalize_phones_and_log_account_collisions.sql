-- ============================================================
-- V0381 — Нормализация телефонов и уникальность пользователя.
--
-- Первопричина дубликатов найдена: телефон хранился «как ввели».
-- '+79629547830' и '79629547830' считались разными людьми, поэтому
-- один человек регистрировался повторно и получал второй аккаунт
-- и второй профиль в той же семье. Именно так появились записи,
-- помеченные [ДУБЛИКАТ - УДАЛИТЬ].
--
-- Без этого шага изоляция дубликатов лечит следствие: завтра
-- появятся новые.
-- ============================================================

-- ---------- 1. ЖУРНАЛ СТОЛКНОВЕНИЙ ----------
-- Аккаунты, которые после нормализации оказываются одним человеком.
-- Не сливаем автоматически: у каждого своя сессия, свой профиль
-- и потенциально свои данные. Решение принимается вручную.

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.user_phone_collisions (
    id BIGSERIAL PRIMARY KEY,
    normalized_phone TEXT NOT NULL,
    user_ids UUID[] NOT NULL,
    raw_variants TEXT[] NOT NULL,
    decision TEXT NOT NULL DEFAULT 'pending',
    decided_at TIMESTAMP,
    notes TEXT,
    detected_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_phone_collision
    ON t_p5815085_family_assistant_pro.user_phone_collisions(normalized_phone);

INSERT INTO t_p5815085_family_assistant_pro.user_phone_collisions
    (normalized_phone, user_ids, raw_variants)
SELECT regexp_replace(phone, '[^0-9]', '', 'g'),
       array_agg(id ORDER BY created_at),
       array_agg(phone ORDER BY created_at)
FROM t_p5815085_family_assistant_pro.users
WHERE phone IS NOT NULL
GROUP BY 1
HAVING COUNT(*) > 1
ON CONFLICT (normalized_phone) DO NOTHING;

-- ---------- 2. ПРИВОДИМ К ЕДИНОМУ ВИДУ ----------
-- Только цифры; 8XXXXXXXXXX -> 7XXXXXXXXXX.
-- Номера, чья нормализация столкнулась бы с уже существующим
-- аккаунтом, пропускаются: они зафиксированы в журнале выше
-- и разбираются вручную, а не перезаписываются автоматически.

UPDATE t_p5815085_family_assistant_pro.users u
SET phone = CASE
        WHEN length(regexp_replace(u.phone, '[^0-9]', '', 'g')) = 11
             AND regexp_replace(u.phone, '[^0-9]', '', 'g') LIKE '8%'
            THEN '7' || substring(regexp_replace(u.phone, '[^0-9]', '', 'g') from 2)
        WHEN length(regexp_replace(u.phone, '[^0-9]', '', 'g')) = 10
            THEN '7' || regexp_replace(u.phone, '[^0-9]', '', 'g')
        ELSE regexp_replace(u.phone, '[^0-9]', '', 'g')
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE u.phone IS NOT NULL
  AND u.phone <> regexp_replace(u.phone, '[^0-9]', '', 'g')
  AND NOT EXISTS (
      SELECT 1 FROM t_p5815085_family_assistant_pro.users o
      WHERE o.id <> u.id
        AND regexp_replace(o.phone, '[^0-9]', '', 'g')
            = regexp_replace(u.phone, '[^0-9]', '', 'g')
  );

-- ---------- 3. СВЯЗЬ СТОЛКНОВЕНИЙ С РАЗБОРОМ ДУБЛИКАТОВ ----------
-- Если участник помечен как дубликат и его пользователь участвует
-- в столкновении номеров — это и есть объяснение происхождения записи.

UPDATE t_p5815085_family_assistant_pro.member_duplicate_review r
SET notes = COALESCE(r.notes || ' | ', '')
            || 'PHONE_COLLISION: аккаунт создан повторно из-за '
            || 'ненормализованного номера ' || c.normalized_phone
FROM t_p5815085_family_assistant_pro.user_phone_collisions c
WHERE r.user_id = ANY(c.user_ids)
  AND (r.notes IS NULL OR r.notes NOT LIKE '%PHONE_COLLISION%');
