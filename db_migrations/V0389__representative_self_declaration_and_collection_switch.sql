-- ============================================================
-- ЗАЯВЛЕНИЕ О ЗАКОННОМ ПРЕДСТАВИТЕЛЬСТВЕ (самодекларация)
-- ============================================================
-- Принципиальное ограничение первой версии: документы не загружаются
-- и внешняя проверка не проводится. Поэтому платформа НЕ ВПРАВЕ
-- утверждать, что установила статус представителя. Она может
-- зафиксировать только одно: человек ЗАЯВИЛ о представительстве.
--
-- Отсюда verification_level:
--   self_declared        — заявлено пользователем, не проверено;
--   externally_verified  — зарезервировано под документальную проверку,
--                          сейчас не выдаётся ни одним кодом.
--
-- Роль owner/admin/parent и семейная подпись «Мама»/«Папа»
-- представительством НЕ являются и никогда не должны в него
-- конвертироваться автоматически.

-- 1. Версионированный текст заявления.
-- Отдельно от согласия на геолокацию: это разные документы и разные
-- решения. Через год надо доказать, какой именно текст человек видел.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.representative_declaration_texts (
    version text PRIMARY KEY,
    body_md text NOT NULL,
    summary text NOT NULL,
    effective_from timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current boolean NOT NULL DEFAULT false,
    legal_review_status text NOT NULL DEFAULT 'pending_legal_review',
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Расширение legal_representatives под самодекларацию.
-- Таблица пуста (0 строк), поэтому расширяем её, а не плодим вторую
-- сущность: два источника истины о представительстве — гарантированный
-- способ однажды спутать заявленное с проверенным.
ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS verification_level text NOT NULL DEFAULT 'self_declared';

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS representative_user_id uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS subject_member_id uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS declaration_text_version text NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS declared_at timestamp NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS representative_age_at_declaration integer NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS subject_age_at_declaration integer NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'ui';

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS revoked_by_user_id uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS revoke_reason text NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS expires_at timestamp NULL;

-- Доказательственные реквизиты заявления.
ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS ip_hash text NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS user_agent_family text NULL;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD COLUMN IF NOT EXISTS request_id text NULL;

-- subject_member_id — синоним dependent_member_id в терминах согласия.
UPDATE t_p5815085_family_assistant_pro.legal_representatives
   SET subject_member_id = dependent_member_id
 WHERE subject_member_id IS NULL;

-- 'confirmed' остаётся допустимым только ради возможной внешней
-- проверки в будущем. Простая галочка даёт 'declared', и никакой код
-- не должен превращать её в 'confirmed'.
ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    DROP CONSTRAINT IF EXISTS legal_representatives_status_values;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD CONSTRAINT legal_representatives_status_values
    CHECK (status IN ('declared', 'confirmed', 'revoked', 'rejected', 'expired', 'pending'));

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    DROP CONSTRAINT IF EXISTS legal_representatives_verification_level;

ALTER TABLE t_p5815085_family_assistant_pro.legal_representatives
    ADD CONSTRAINT legal_representatives_verification_level
    CHECK (verification_level IN ('self_declared', 'externally_verified'));

CREATE INDEX IF NOT EXISTS idx_legal_reps_subject_active
    ON t_p5815085_family_assistant_pro.legal_representatives
       (dependent_member_id)
 WHERE status IN ('declared', 'confirmed') AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_legal_reps_representative
    ON t_p5815085_family_assistant_pro.legal_representatives
       (representative_member_id, status);

-- 3. Неизменяемый журнал событий представительства.
-- Отдельно от журнала согласия: это разные юридические факты.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.legal_representative_events (
    id bigserial PRIMARY KEY,
    occurred_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    representation_id uuid NULL,
    family_id uuid NULL,
    subject_member_id uuid NULL,
    representative_member_id uuid NULL,
    action text NOT NULL,
    verification_level text NULL,
    declaration_text_version text NULL,
    actor_user_id uuid NULL,
    actor_member_id uuid NULL,
    actor_role text NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    request_id text NULL,
    ip_hash text NULL,
    user_agent_family text NULL
);

CREATE INDEX IF NOT EXISTS idx_legal_rep_events_subject
    ON t_p5815085_family_assistant_pro.legal_representative_events
       (subject_member_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_legal_rep_events_representation
    ON t_p5815085_family_assistant_pro.legal_representative_events
       (representation_id, occurred_at DESC);

-- ============================================================
-- РАЗДЕЛЕНИЕ «ВЫКЛЮЧИТЬ СБОР» И «ОТОЗВАТЬ СОГЛАСИЕ»
-- ============================================================
-- Это были одним действием — и это ошибка в обе стороны.
-- Выключение тумблера обязано немедленно останавливать сбор, но не
-- обязано уничтожать юридическую запись согласия: человек, поставивший
-- телефон на зарядку, не отзывал разрешение. И наоборот — отзыв не
-- может быть спрятан за тумблером.
ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD COLUMN IF NOT EXISTS collection_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD COLUMN IF NOT EXISTS collection_disabled_at timestamp NULL;

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD COLUMN IF NOT EXISTS collection_disabled_by_user_id uuid NULL;

ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD COLUMN IF NOT EXISTS collection_disabled_reason text NULL;

-- Согласие, выданное представителем, привязывается к КОНКРЕТНОМУ
-- заявлению. Если заявление отозвано, видно, какое согласие на нём стояло.
ALTER TABLE t_p5815085_family_assistant_pro.location_consents
    ADD COLUMN IF NOT EXISTS representation_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_location_consents_representation
    ON t_p5815085_family_assistant_pro.location_consents (representation_id)
 WHERE representation_id IS NOT NULL;

-- ============================================================
-- ИЗМЕНЕНИЕ ДАТЫ РОЖДЕНИЯ
-- ============================================================
-- Дата рождения определяет, кто вправе дать согласие. Значит, её
-- изменение — привилегированное действие, а не правка профиля:
-- сдвинув ребёнку год рождения, взрослый иначе обошёл бы правило 14 лет.
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.member_birth_date_changes (
    id bigserial PRIMARY KEY,
    occurred_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    family_id uuid NULL,
    member_id uuid NOT NULL,
    old_birth_date date NULL,
    new_birth_date date NULL,
    old_age integer NULL,
    new_age integer NULL,
    age_band_changed boolean NOT NULL DEFAULT false,
    consent_suspended boolean NOT NULL DEFAULT false,
    actor_user_id uuid NULL,
    actor_member_id uuid NULL,
    request_id text NULL,
    ip_hash text NULL
);

CREATE INDEX IF NOT EXISTS idx_birth_date_changes_member
    ON t_p5815085_family_assistant_pro.member_birth_date_changes
       (member_id, occurred_at DESC);

-- ============================================================
-- ТЕКСТ ЗАЯВЛЕНИЯ v1 — ОЖИДАЕТ УТВЕРЖДЕНИЯ ЮРИСТОМ
-- ============================================================
INSERT INTO t_p5815085_family_assistant_pro.representative_declaration_texts
    (version, summary, body_md, is_current, legal_review_status)
VALUES (
    '2026-09-12.r1',
    'Заявление о законном представительстве ребёнка',
    E'## Заявление о законном представительстве\n\n'
    'Я заявляю, что являюсь законным представителем указанного ребёнка '
    '(родителем, усыновителем, опекуном или попечителем) и вправе принимать '
    'решения об обработке его персональных данных, включая данные о '
    'местоположении.\n\n'
    '**Что делает платформа.** Платформа сохраняет это заявление, его версию, '
    'дату, время и сведения об устройстве, с которого оно сделано. '
    'Платформа **не проверяет** его по государственным реестрам и по '
    'документам и не подтверждает ваш статус представителя.\n\n'
    '**Ответственность.** Заявление недостоверных сведений о представительстве '
    'может повлечь ответственность, предусмотренную законодательством '
    'Российской Федерации. Обработка данных ребёнка лицом, не являющимся его '
    'законным представителем, является нарушением его прав.\n\n'
    '**Что это заявление НЕ делает.** Оно само по себе не включает сбор '
    'местоположения, не создаёт согласия на обработку геоданных и не даёт вам '
    'доступа к координатам ребёнка. Это отдельные решения, которые принимаются '
    'на следующих шагах.\n\n'
    '**Отзыв.** Заявление можно отозвать в любой момент. После отзыва вы больше '
    'не сможете давать согласие за ребёнка, а выданное вами согласие прекращает '
    'действовать.\n\n'
    '_Текст ожидает юридического утверждения._',
    true,
    'pending_legal_review'
)
ON CONFLICT (version) DO NOTHING;
