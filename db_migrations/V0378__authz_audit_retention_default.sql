-- ============================================================
-- V0378 — Срок хранения проставляется автоматически при записи.
--
-- V0377 заполнила retain_until только для уже существующих строк.
-- Новые события писались без срока хранения, то есть политика
-- ретеншна существовала на бумаге, но не применялась к тому,
-- что появляется сейчас. Аудит содержит ПДн, поэтому «навсегда»
-- здесь — не безопасное значение по умолчанию.
--
-- База: 365 дней. Более короткий срок (180 дней) для рядовых
-- технических отказов проставляет чистильщик, а не DEFAULT:
-- выражение DEFAULT не видит значения соседних колонок строки.
-- ============================================================

ALTER TABLE t_p5815085_family_assistant_pro.authz_audit_log
    ALTER COLUMN retain_until
    SET DEFAULT ((NOW() AT TIME ZONE 'UTC') + INTERVAL '365 days');

UPDATE t_p5815085_family_assistant_pro.authz_audit_log
SET retain_until = occurred_at + INTERVAL '180 days'
WHERE retain_until IS NULL
  AND result = 'denied'
  AND reason_code IN ('NO_SESSION_TOKEN', 'SESSION_INVALID', 'SESSION_EXPIRED');

UPDATE t_p5815085_family_assistant_pro.authz_audit_log
SET retain_until = occurred_at + INTERVAL '365 days'
WHERE retain_until IS NULL;
