"""
Business: согласие на обработку данных о местоположении (152-ФЗ)
Args: event с httpMethod GET/POST/DELETE, X-Auth-Token
Returns: GET — статус и условия; POST — выдача согласия; DELETE — отзыв

Почему отдельная функция, а не поле в настройках:
согласие по ч.1.1 ст.9 152-ФЗ не может быть частью другого документа
и должно быть доказуемым спустя год. Доказательство складывается из
версии текста, который человек видел, и параметров, на которые он
соглашался, — всё это фиксируется здесь.

РАЗДЕЛЕНИЕ, которое нельзя нарушать:
    согласие субъекта   → системе разрешено СОБИРАТЬ его местоположение
    получатели согласия → кому конкретно разрешено его СМОТРЕТЬ
Согласие без получателя не открывает координаты никому.

ВОЗРАСТНАЯ МОДЕЛЬ (требует утверждения юристом):
    младше 14   — согласие даёт ПОДТВЕРЖДЁННЫЙ законный представитель;
    14 и старше — только сам субъект; представитель может лишь запросить;
    возраст неизвестен — включить нельзя вообще.

Решение о том, кто вправе дать согласие, принимает СЕРВЕР
(auth_guard.consent_eligibility), а не клиент.
"""

import json
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

ALLOWED_RETENTION = (0, 7, 30, 90)
DEFAULT_RETENTION = 7
MIN_INTERVAL_SECONDS = 300
MAX_INTERVAL_SECONDS = 3600
REMINDER_INTERVAL = "INTERVAL '1 year'"


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    try:
        ctx = ag.require_session(event)
        ag.require_family_member(ctx)

        conn = psycopg2.connect(ag.DATABASE_URL)
        conn.autocommit = True
        try:
            if method == 'GET':
                return _status(conn, ctx, event)
            if method == 'POST':
                return _grant(conn, ctx, event)
            if method == 'DELETE':
                return _revoke(conn, ctx, event)
            return ag.json_response({'error': 'Method not allowed'},
                                    status=405, event=event)
        finally:
            conn.close()

    except AuthError as exc:
        return ag.error_response(exc, event)
    except Exception as exc:  # noqa: BLE001
        print(f'[location-consent] failed: {type(exc).__name__}: {exc}')
        return ag.json_response({'error': 'Внутренняя ошибка'},
                                status=500, event=event)


def _body(event: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        return {}


def _current_text(conn) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""SELECT version, summary, body_md, legal_review_status
                FROM {SCHEMA}.location_consent_texts
                WHERE is_current = true
                ORDER BY effective_from DESC LIMIT 1"""
        )
        row = cur.fetchone()
        return dict(row) if row else {}


def _status(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Что показать пользователю до включения тумблера и после.

    Отдаём и текст согласия, и вычисленное сервером право его дать —
    клиент не должен сам решать, вправе ли он включить отслеживание
    за ребёнка.
    """
    params = event.get('queryStringParameters') or {}
    subject_id = str(params.get('subject_member_id') or ctx.member_id or '')

    subject = ag._load_member(subject_id) if subject_id else None
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

    eligibility = ag.consent_eligibility(subject, ctx.member_id)
    consent = ag.load_active_location_consent(subject_id)

    payload: Dict[str, Any] = {
        'success': True,
        'subject_member_id': subject_id,
        'subject_name': subject.get('name'),
        'subject_age': ag._member_age(subject),
        'self_consent_age': ag.SELF_CONSENT_AGE,
        'geolocation_enabled': ag.geo_flag_enabled(ag.GEO_COLLECTION_FLAG),
        'consent_text': _current_text(conn),
        'eligibility': eligibility,
        'retention_options': list(ALLOWED_RETENTION),
        'default_retention_days': DEFAULT_RETENTION,
        'consent': None,
    }

    if consent:
        valid, reason = ag._consent_still_valid(consent, subject)
        payload['consent'] = {
            'id': str(consent['id']),
            'granted_at': consent.get('granted_at'),
            'consent_role': consent.get('consent_role'),
            'text_version': consent.get('text_version'),
            'retention_days': consent.get('retention_days'),
            'update_interval_seconds': consent.get('update_interval_seconds'),
            'data_scope': consent.get('data_scope'),
            'recipients': consent.get('recipients') or [],
            'valid': valid,
            'invalid_reason': None if valid else reason,
        }

    # Кто видел положение субъекта — показываем самому субъекту.
    # Прозрачность обязательна: без неё «управление доступом» на словах.
    if subject_id == ctx.member_id:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"""SELECT viewer_member_id, access_kind, occurred_at
                    FROM {SCHEMA}.location_access_log
                    WHERE subject_member_id = %s
                    ORDER BY occurred_at DESC LIMIT 50""",
                (subject_id,),
            )
            payload['recent_views'] = [dict(r) for r in cur.fetchall()]

    return ag.json_response(payload, event=event)


def _grant(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Выдача согласия. Только после успешного ответа отсюда клиент вправе
    запускать GPS — оптимистичное включение запрещено.
    """
    data = _body(event)
    subject_id = str(data.get('subject_member_id') or ctx.member_id or '')

    subject = ag._load_member(subject_id) if subject_id else None
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    if (subject.get('member_status') or 'active') != 'active':
        raise AuthError(403, 'SUBJECT_NOT_ACTIVE')

    # Право дать согласие вычисляет сервер: возраст, роль, подтверждённое
    # законное представительство. Клиент на это не влияет.
    eligibility = ag.consent_eligibility(subject, ctx.member_id)
    if not eligibility.get('allowed'):
        reason = eligibility.get('reason') or 'LOCATION_CONSENT_REQUIRED'
        ag.log_consent_event(ctx, 'grant_denied', subject_member_id=subject_id,
                             details={'reason': reason})
        raise AuthError(403, reason)

    # Согласие даётся на КОНКРЕТНУЮ версию текста: иначе через год
    # невозможно доказать, что именно человек прочитал.
    text = _current_text(conn)
    if not text:
        raise AuthError(503, 'GEOLOCATION_DISABLED', 'Consent text is not published')
    accepted_version = str(data.get('text_version') or '')
    if accepted_version != text['version']:
        raise AuthError(409, 'LOCATION_CONSENT_REQUIRED',
                        'Consent text version mismatch, reload the form')

    retention = data.get('retention_days', DEFAULT_RETENTION)
    try:
        retention = int(retention)
    except (TypeError, ValueError):
        retention = DEFAULT_RETENTION
    if retention not in ALLOWED_RETENTION:
        return ag.json_response({'error': 'Недопустимый срок хранения'},
                                status=400, event=event)

    interval = data.get('update_interval_seconds', 600)
    try:
        interval = int(interval)
    except (TypeError, ValueError):
        interval = 600
    interval = max(MIN_INTERVAL_SECONDS, min(MAX_INTERVAL_SECONDS, interval))

    scope = data.get('data_scope') or {}
    data_scope = {
        'precise': bool(scope.get('precise', True)),
        'history': retention > 0,
        'background': bool(scope.get('background', True)),
        'geofences': bool(scope.get('geofences', False)),
    }

    # Получатели: только активные участники своей семьи. Сам субъект
    # получателем не является — он и так видит себя.
    raw_recipients = data.get('recipients') or []
    recipients = []
    if isinstance(raw_recipients, list):
        candidates = [str(r) for r in raw_recipients if ag._is_uuid(r)]
        if candidates:
            with conn.cursor() as cur:
                cur.execute(
                    f"""SELECT id FROM {SCHEMA}.family_members
                        WHERE family_id = %s AND id = ANY(%s::uuid[])
                          AND COALESCE(member_status,'active') = 'active'""",
                    (ctx.family_id, candidates),
                )
                recipients = [str(r[0]) for r in cur.fetchall() if str(r[0]) != subject_id]

    age = ag._member_age(subject)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Прежнее согласие не удаляем — оно доказательство. Помечаем
        # как заменённое, чтобы история решений оставалась полной.
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consents
                   SET status = 'superseded',
                       supersede_reason = 'replaced_by_new_consent'
                 WHERE subject_member_id = %s AND status = 'active'""",
            (subject_id,),
        )

        cur.execute(
            f"""INSERT INTO {SCHEMA}.location_consents
                    (family_id, subject_member_id, granted_by_user_id,
                     granted_by_member_id, consent_role, subject_age_at_grant,
                     text_version, purpose, data_scope, retention_days,
                     update_interval_seconds, status, next_reminder_at,
                     ip_hash, user_agent_family)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s,
                        'active', NOW() + {REMINDER_INTERVAL}, %s, %s)
                RETURNING id""",
            (ctx.family_id, subject_id, ctx.user_id, ctx.member_id,
             eligibility.get('required_role') or 'self', age,
             text['version'],
             'Показывать местоположение выбранным участникам семьи',
             json.dumps(data_scope), retention, interval,
             ctx.ip_hash, ctx.user_agent_family),
        )
        consent_id = str(cur.fetchone()['id'])

        for recipient in recipients:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.location_consent_recipients
                        (consent_id, recipient_member_id)
                    VALUES (%s, %s)
                    ON CONFLICT (consent_id, recipient_member_id) DO NOTHING""",
                (consent_id, recipient),
            )

    ag.log_consent_event(ctx, 'granted', consent_id=consent_id,
                         subject_member_id=subject_id,
                         text_version=text['version'],
                         details={'retention_days': retention,
                                  'recipients': recipients,
                                  'data_scope': data_scope,
                                  'consent_role': eligibility.get('required_role'),
                                  'subject_age_at_grant': age})

    return ag.json_response({
        'success': True,
        'consent_id': consent_id,
        'subject_member_id': subject_id,
        'retention_days': retention,
        'update_interval_seconds': interval,
        'recipients': recipients,
        'data_scope': data_scope,
        'text_version': text['version'],
    }, event=event)


def _revoke(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Отзыв согласия. Должен быть в один шаг и без уговоров.

    После отзыва: сбор прекращается, получатели теряют доступ,
    накопленные точки помечаются к очистке по выбранной политике.
    Сам факт отзыва остаётся в журнале навсегда.
    """
    params = event.get('queryStringParameters') or {}
    data = _body(event)
    subject_id = str(data.get('subject_member_id')
                     or params.get('subject_member_id')
                     or ctx.member_id or '')

    subject = ag._load_member(subject_id) if subject_id else None
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

    # Отозвать может сам субъект или тот, кто вправе был давать согласие.
    # Если право выдачи утрачено (например, ребёнку исполнилось 14),
    # отзыв всё равно доступен: прекращение обработки не должно
    # блокироваться формальностями.
    eligibility = ag.consent_eligibility(subject, ctx.member_id)
    is_self = ctx.member_id == subject_id
    if not is_self and not eligibility.get('allowed'):
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT 1 FROM {SCHEMA}.location_consents
                    WHERE subject_member_id = %s AND status = 'active'
                      AND granted_by_member_id = %s""",
                (subject_id, ctx.member_id),
            )
            was_granter = cur.fetchone() is not None
        if not was_granter:
            raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    consent = ag.load_active_location_consent(subject_id)
    if not consent:
        return ag.json_response({'success': True, 'already_revoked': True},
                                event=event)

    consent_id = str(consent['id'])
    retention_days = int(consent.get('retention_days') or 0)

    with conn.cursor() as cur:
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consents
                   SET status = 'revoked', revoked_at = NOW(),
                       revoked_by_user_id = %s, revoke_reason = %s
                 WHERE id = %s""",
            (ctx.user_id, str(data.get('reason') or 'user_revoked'), consent_id),
        )
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consent_recipients
                   SET revoked_at = NOW()
                 WHERE consent_id = %s AND revoked_at IS NULL""",
            (consent_id,),
        )
        # Накопленные точки: при «не хранить историю» стираем немедленно,
        # иначе оставляем до конца выбранного пользователем срока —
        # ровно то, на что он соглашался.
        if retention_days == 0:
            cur.execute(
                f"""UPDATE {SCHEMA}.family_location_tracking
                       SET usage_status = 'pending_deletion', purge_after = NOW()
                     WHERE consent_id = %s AND usage_status = 'active'""",
                (consent_id,),
            )
        else:
            cur.execute(
                f"""UPDATE {SCHEMA}.family_location_tracking
                       SET purge_after = LEAST(
                             COALESCE(purge_after, NOW() + INTERVAL '%s days'),
                             created_at + INTERVAL '%s days')
                     WHERE consent_id = %s AND usage_status = 'active'""",
                (retention_days, retention_days, consent_id),
            )

    ag.log_consent_event(ctx, 'revoked', consent_id=consent_id,
                         subject_member_id=subject_id,
                         text_version=consent.get('text_version'),
                         details={'reason': str(data.get('reason') or 'user_revoked'),
                                  'retention_days': retention_days})

    return ag.json_response({
        'success': True,
        'revoked': True,
        'subject_member_id': subject_id,
        'collection_stopped': True,
    }, event=event)
