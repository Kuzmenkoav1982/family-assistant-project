-- Раздельное управление получателями согласия на геолокацию: добавление
-- нового получателя ПОСЛЕ первичной выдачи согласия должно требовать
-- отдельного подтверждения субъекта, а не молчаливо расширять доступ.
--
-- status='active'   — получатель реально видит координаты (текущее поведение);
-- status='pending'   — получатель предложен представителем/не-субъектом
--                       и ждёт подтверждения самого субъекта;
-- status='revoked'   — доступ отозван, запись сохранена для аудита.
--
-- DEFAULT 'active' сохраняет обратную совместимость: все получатели,
-- добавленные раньше через _grant, были добавлены САМИМ субъектом в
-- рамках одного действия (согласие на adult self-tracking требует
-- is_self=true), то есть уже были "подтверждены" в момент создания.

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_recipients
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_recipients
    ADD COLUMN IF NOT EXISTS requested_by_member_id uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_recipients
    ADD COLUMN IF NOT EXISTS confirmed_at timestamp NULL;

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_recipients
    DROP CONSTRAINT IF EXISTS location_consent_recipients_status_check;

ALTER TABLE t_p5815085_family_assistant_pro.location_consent_recipients
    ADD CONSTRAINT location_consent_recipients_status_check
    CHECK (status IN ('pending', 'active', 'revoked'));

-- Существующие "живые" (revoked_at IS NULL) записи считаем подтверждёнными
-- задним числом, чтобы не разорвать уже выданный доступ ретроактивно.
UPDATE t_p5815085_family_assistant_pro.location_consent_recipients
   SET confirmed_at = granted_at
 WHERE revoked_at IS NULL AND confirmed_at IS NULL;
