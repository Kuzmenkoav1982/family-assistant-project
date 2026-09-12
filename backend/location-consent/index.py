"""
Business: согласие на обработку данных о местоположении (152-ФЗ)
Args: event с httpMethod GET/POST/PATCH/PUT/DELETE, X-Auth-Token
Returns: GET — статус; POST — выдача; PATCH — тумблер сбора;
         PUT — управление получателями; DELETE — отзыв согласия

ВЫКЛЮЧИТЬ СБОР ≠ ОТОЗВАТЬ СОГЛАСИЕ — это два разных действия:
    PATCH  collection_enabled=false — сбор немедленно прекращается,
           согласие остаётся действующим, включить обратно можно без
           нового согласия;
    DELETE — согласие отзывается, получатели теряют доступ, запускается
           политика удаления, следующее включение требует нового согласия.
Объединять их в один тумблер нельзя: тогда ни одно из двух решений
человек не принимает осознанно.

ДОБАВЛЕНИЕ ПОЛУЧАТЕЛЯ — тоже отдельное решение, а не побочный эффект
выдачи согласия:
    PUT {action:'add_recipient'}     — если получателя добавляет НЕ сам
        субъект (например, законный представитель за ребёнка), запись
        создаётся в статусе 'pending' и НЕ даёт доступа к координатам,
        пока субъект её не подтвердит явно. Если добавляет сам субъект —
        подтверждение не требуется: он и так решает за себя.
    PUT {action:'confirm_recipient'} — субъект подтверждает ожидающего
        получателя; только после этого запись переходит в 'active' и
        начинает давать доступ.
    PUT {action:'revoke_recipient'}  — немедленный отзыв, без подтверждений
        и промежуточных состояний: прекращение доступа не должно требовать
        чьего-либо согласия.
Каждое из трёх действий пишет отдельное событие в location_consent_events.

Почему отдельная функция, а не поле в настройках:
согласие по ч.1.1 ст.9 152-ФЗ не может быть частью другого документа
и должно быть доказуемым спустя год. Доказательство складывается из
версии текста, который человек видел, и параметров, на которые он
соглашался, — всё это фиксируется здесь.

РАЗДЕЛЕНИЕ, которое нельзя нарушать:
    согласие субъекта   → системе разрешено СОБИРАТЬ его местоположение
    получатели согласия → кому конкретно разрешено его СМОТРЕТЬ
Согласие без получателя не открывает координаты никому. Согласие с
получателем в статусе 'pending' — тоже: пока субъект не подтвердил,
получатель координат не видит (см. load_active_location_consent —
recipients возвращает только status='active').

ВОЗРАСТНАЯ МОДЕЛЬ (требует утверждения юристом):
    младше 14   — согласие даёт ПОДТВЕРЖДЁННЫЙ представитель (self_declared);
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
            if method == 'PATCH':
                return _set_collection(conn, ctx, event)
            if method == 'PUT':
                return _manage_recipient(conn, ctx, event)
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
            # Сбор и согласие — разные состояния. Клиент обязан видеть
            # оба: «выключено» не значит «отозвано».
            'collection_enabled': bool(consent.get('collection_enabled', True)),
            'collection_disabled_at': consent.get('collection_disabled_at'),
            'representation_id': (str(consent['representation_id'])
                                  if consent.get('representation_id') else None),
            'next_reminder_at': consent.get('next_reminder_at'),
            'valid': valid,
            'invalid_reason': None if valid else reason,
        }
        payload['recipients_detail'] = _recipients_detail(conn, str(consent['id']))

    # Заявления о представительстве показываем как ЗАЯВЛЕНИЯ, без
    # намёка на проверку: платформа их не проверяла.
    payload['representations'] = [
        {
            'id': str(r['id']),
            'representative_member_id': str(r['representative_member_id']),
            'representative_name': r.get('representative_name'),
            'status': r.get('status'),
            'verification_level': r.get('verification_level'),
            'declared_at': r.get('declared_at'),
        }
        for r in ag.list_representations(subject_id)
    ]

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


def _recipients_detail(conn, consent_id: str) -> list:
    """
    Кто конкретно может видеть местоположение: имя, основание, статус,
    когда выдано, когда смотрел в последний раз.

    Показываем именно поимённый список, а не роли: «администраторы видят
    вас» — это не ответ на вопрос «кто меня видит». Включает и записи в
    статусе 'pending' — субъект должен видеть, что кто-то предложил
    получателя и ждёт его собственного подтверждения, а не узнавать
    об этом постфактум по факту просмотра.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""SELECT r.recipient_member_id, r.granted_at, r.status,
                       r.requested_by_member_id, m.name,
                       (SELECT MAX(l.occurred_at)
                          FROM {SCHEMA}.location_access_log l
                         WHERE l.viewer_member_id = r.recipient_member_id
                           AND l.subject_member_id = c.subject_member_id
                       ) AS last_access
                  FROM {SCHEMA}.location_consent_recipients r
                  JOIN {SCHEMA}.location_consents c ON c.id = r.consent_id
             LEFT JOIN {SCHEMA}.family_members m ON m.id = r.recipient_member_id
                 WHERE r.consent_id = %s AND r.revoked_at IS NULL
              ORDER BY r.granted_at""",
            (consent_id,),
        )
        return [
            {
                'member_id': str(row['recipient_member_id']),
                'name': row.get('name'),
                # Основание всегда одно и то же и названо честно: доступ
                # дан поимённо этим согласием, а не ролью в семье.
                'basis': 'named_in_consent',
                'status': row.get('status'),
                'awaiting_confirmation': row.get('status') == 'pending',
                'capabilities': ['geolocation:read_current'] if row.get('status') == 'active' else [],
                'granted_at': row.get('granted_at'),
                'last_access': row.get('last_access'),
            }
            for row in cur.fetchall()
        ]


def _set_collection(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Тумблер сбора. НЕ отзыв согласия.

    Раньше выключение тумблера отзывало согласие — это ошибка в обе
    стороны. Человек, выключивший передачу на ночь, не отзывал
    разрешение обрабатывать данные; а отзыв, спрятанный за тумблером,
    нельзя ни найти, ни осознанно совершить.

    Здесь: выключение немедленно останавливает сбор, согласие остаётся
    действующим, повторное включение возможно без нового согласия —
    если его условия не изменились и оно не отозвано.
    """
    data = _body(event)
    subject_id = str(data.get('subject_member_id') or ctx.member_id or '')
    enabled = bool(data.get('collection_enabled'))

    subject = ag._load_member(subject_id) if subject_id else None
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

    consent = ag.load_active_location_consent(subject_id)
    if not consent:
        raise AuthError(403, 'LOCATION_CONSENT_REQUIRED')

    is_self = ctx.member_id == subject_id
    eligibility = ag.consent_eligibility(subject, ctx.member_id)

    # ВЫКЛЮЧИТЬ вправе шире, чем включить: прекращение обработки не
    # должно упираться в формальности. Достаточно быть субъектом или
    # тем, кто это согласие выдал.
    was_granter = str(consent.get('granted_by_member_id') or '') == str(ctx.member_id or '')
    if enabled:
        if not is_self and not eligibility.get('allowed'):
            raise AuthError(403, eligibility.get('reason') or 'SUBJECT_ACCESS_DENIED')
        # Возобновление сбора допустимо только по действующему согласию.
        valid, reason = ag._consent_still_valid(consent, subject)
        if not valid:
            raise AuthError(403, reason)
        # Emergency kill switch — впереди adult/minor-проверки: включение
        # сбора обратно тоже открывает обработку координат, а kill switch
        # обязан останавливать это независимо от прочих флагов.
        if ag.geo_kill_switch_active():
            raise AuthError(503, 'GEOLOCATION_DISABLED')
        # И только если adult/minor-сценарий для этого субъекта сейчас
        # включён: согласие могло быть выдано раньше, когда флаг был
        # включён, а затем сценарий выключили (например, экстренно).
        ag.require_geo_scope_for_subject(subject)
    elif not is_self and not was_granter and not eligibility.get('allowed'):
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    consent_id = str(consent['id'])
    with conn.cursor() as cur:
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consents
                   SET collection_enabled = %s,
                       collection_disabled_at = CASE WHEN %s THEN NULL ELSE NOW() END,
                       collection_disabled_by_user_id = CASE WHEN %s THEN NULL ELSE %s END,
                       collection_disabled_reason = CASE WHEN %s THEN NULL ELSE %s END
                 WHERE id = %s""",
            (enabled, enabled, enabled, ctx.user_id, enabled,
             str(data.get('reason') or 'user_switched_off'), consent_id),
        )

    ag.log_consent_event(ctx, 'collection_enabled' if enabled else 'collection_disabled',
                         consent_id=consent_id, subject_member_id=subject_id,
                         text_version=consent.get('text_version'),
                         details={'collection_enabled': enabled,
                                  'reason': str(data.get('reason') or '')})

    return ag.json_response({
        'success': True,
        'collection_enabled': enabled,
        # Явно сообщаем, что согласие НЕ тронуто: вызывающий код не
        # должен додумывать это сам.
        'consent_status': 'active',
        'consent_revoked': False,
        'subject_member_id': subject_id,
    }, event=event)


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

    # Emergency kill switch проверяется ПЕРВЫМ и безусловно, раньше даже
    # права дать согласие: он должен уметь остановить геолокацию целиком
    # одним изменением в БД, независимо от возраста, роли и заявлений о
    # представительстве. Найдено QA (docs/legal/compliance-checklist.md,
    # раздел 4/6): раньше этой проверки здесь не было, и при включённом
    # kill switch новое согласие всё равно создавалось бы — хотя
    # geolocation_emergency_kill_switch описан в БД как блокирующий ВСЕ
    # операции с геоданными.
    if ag.geo_kill_switch_active():
        ag.log_consent_event(ctx, 'grant_denied', subject_member_id=subject_id,
                             details={'reason': 'GEOLOCATION_DISABLED',
                                      'note': 'emergency kill switch active'})
        raise AuthError(503, 'GEOLOCATION_DISABLED')

    # Право дать согласие вычисляет сервер: возраст, роль, подтверждённое
    # законное представительство. Клиент на это не влияет.
    eligibility = ag.consent_eligibility(subject, ctx.member_id)
    if not eligibility.get('allowed'):
        reason = eligibility.get('reason') or 'LOCATION_CONSENT_REQUIRED'
        ag.log_consent_event(ctx, 'grant_denied', subject_member_id=subject_id,
                             details={'reason': reason})
        raise AuthError(403, reason)

    # Adult/minor-флаги: даже если право дать согласие есть (заявление о
    # представительстве сделано корректно), сам production-сценарий для
    # несовершеннолетних может быть выключен отдельно от взрослого.
    # Проверяем здесь ДО записи согласия — иначе согласие создалось бы,
    # а require_location_access всё равно отказывал бы 503 при каждом
    # обращении, что вводит пользователя в заблуждение о причине отказа.
    try:
        ag.require_geo_scope_for_subject(subject)
    except AuthError:
        ag.log_consent_event(ctx, 'grant_denied', subject_member_id=subject_id,
                             details={'reason': 'GEOLOCATION_DISABLED',
                                      'note': 'adult/minor scope flag is off'})
        raise

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
                     representation_id, collection_enabled,
                     ip_hash, user_agent_family)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s,
                        'active', NOW() + {REMINDER_INTERVAL}, %s, true, %s, %s)
                RETURNING id""",
            (ctx.family_id, subject_id, ctx.user_id, ctx.member_id,
             eligibility.get('required_role') or 'self', age,
             text['version'],
             'Показывать местоположение выбранным участникам семьи',
             json.dumps(data_scope), retention, interval,
             # Согласие представителя всегда привязано к его заявлению:
             # отозвал заявление — согласие теряет основание.
             eligibility.get('representation_id'),
             ctx.ip_hash, ctx.user_agent_family),
        )
        consent_id = str(cur.fetchone()['id'])

        # Если согласие выдаёт САМ субъект — получатели, названные в этом
        # же запросе, вступают в силу сразу: субъект и так уже принимает
        # решение за себя, отдельное подтверждение было бы формальностью
        # поверх формальности. Если согласие выдаёт представитель за
        # ребёнка — получатели остаются 'pending' до тех пор, пока субъект
        # (позже, когда сможет) их не подтвердит: представитель не должен
        # мочь одним действием и включить сбор, и назначить, кто смотрит.
        is_self_grant = ctx.member_id == subject_id
        recipient_status = 'active' if is_self_grant else 'pending'
        for recipient in recipients:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.location_consent_recipients
                        (consent_id, recipient_member_id, status,
                         requested_by_member_id,
                         confirmed_at)
                    VALUES (%s, %s, %s, %s, CASE WHEN %s = 'active' THEN NOW() ELSE NULL END)
                    ON CONFLICT (consent_id, recipient_member_id) DO NOTHING""",
                (consent_id, recipient, recipient_status, ctx.member_id, recipient_status),
            )

    ag.log_consent_event(ctx, 'granted', consent_id=consent_id,
                         subject_member_id=subject_id,
                         text_version=text['version'],
                         details={'retention_days': retention,
                                  'recipients': recipients,
                                  'recipients_status': recipient_status,
                                  'data_scope': data_scope,
                                  'consent_role': eligibility.get('required_role'),
                                  'subject_age_at_grant': age})

    return ag.json_response({
        'success': True,
        'consent_id': consent_id,
        'subject_member_id': subject_id,
        'retention_days': retention,
        'update_interval_seconds': interval,
        'recipients': recipients if is_self_grant else [],
        'pending_recipients': [] if is_self_grant else recipients,
        'data_scope': data_scope,
        'text_version': text['version'],
    }, event=event)


RECIPIENT_ACTIONS = ('add_recipient', 'confirm_recipient', 'revoke_recipient')


def _manage_recipient(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Управление получателями ПОСЛЕ первичной выдачи согласия — отдельно
    от _grant, потому что "кто видит мои координаты" может меняться в
    любой момент и не должно требовать пересоздания согласия целиком.

    add_recipient:
        Если добавляет сам субъект — новый получатель сразу 'active'.
        Если добавляет НЕ субъект (представитель ребёнка, либо тот, кому
        видимость уже назначена) — запись создаётся 'pending' и не даёт
        доступа: get_active_location_consent() отдаёт только status='active'.
        Молчаливое расширение круга смотрящих без ведома субъекта запрещено.

    confirm_recipient:
        Только сам субъект может перевести 'pending' → 'active'. Это и
        есть то самое "отдельное подтверждение субъекта", без которого
        получатель координат не видит.

    revoke_recipient:
        Немедленно и без подтверждений: прекращение доступа не должно
        быть сложнее, чем его выдача. Доступен субъекту и тому, кто
        выдавал согласие (granted_by_member_id).
    """
    data = _body(event)
    action = str(data.get('action') or '')
    if action not in RECIPIENT_ACTIONS:
        return ag.json_response(
            {'error': f'Unknown action, expected one of {RECIPIENT_ACTIONS}'},
            status=400, event=event)

    subject_id = str(data.get('subject_member_id') or ctx.member_id or '')
    recipient_id = str(data.get('recipient_member_id') or '')
    if not ag._is_uuid(recipient_id):
        return ag.json_response({'error': 'recipient_member_id is required'},
                                status=400, event=event)

    subject = ag._load_member(subject_id) if subject_id else None
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

    consent = ag.load_active_location_consent(subject_id)
    if not consent:
        raise AuthError(403, 'LOCATION_CONSENT_REQUIRED')
    consent_id = str(consent['id'])
    is_self = ctx.member_id == subject_id

    # Emergency kill switch блокирует только РАСШИРЕНИЕ доступа
    # (add_recipient/confirm_recipient) — те же действия, что и
    # require_location_access использовал бы, чтобы открыть координаты
    # новому человеку. revoke_recipient НЕ блокируется: прекращение
    # доступа не должно зависеть от того, работает ли геолокация сейчас,
    # иначе аварийная остановка сама стала бы поводом не отозвать доступ.
    if action in ('add_recipient', 'confirm_recipient') and ag.geo_kill_switch_active():
        raise AuthError(503, 'GEOLOCATION_DISABLED')

    # Получатель обязан быть активным участником той же семьи и не самим
    # субъектом: субъект и так видит себя, называть его "получателем"
    # означало бы задвоить смысл одной и той же вещи.
    if recipient_id == subject_id:
        return ag.json_response({'error': 'Subject cannot be its own recipient'},
                                status=400, event=event)
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT 1 FROM {SCHEMA}.family_members
                WHERE id = %s AND family_id = %s
                  AND COALESCE(member_status,'active') = 'active'""",
            (recipient_id, ctx.family_id),
        )
        if not cur.fetchone():
            raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

    if action == 'add_recipient':
        return _add_recipient(conn, ctx, consent_id, subject_id, recipient_id, is_self, event)
    if action == 'confirm_recipient':
        return _confirm_recipient(conn, ctx, consent_id, subject_id, recipient_id, is_self, event)
    return _revoke_recipient(conn, ctx, consent_id, subject_id, recipient_id, is_self, event)


def _add_recipient(conn, ctx: ag.AuthContext, consent_id: str, subject_id: str,
                   recipient_id: str, is_self: bool, event: Dict[str, Any]) -> Dict[str, Any]:
    # Право предложить получателя: сам субъект (для себя) или тот, кто
    # выдавал согласие (представитель ребёнка). Посторонний участник
    # семьи назначать себе или другим доступ к чужим координатам не может.
    eligibility = ag.consent_eligibility(ag._load_member(subject_id), ctx.member_id)
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT 1 FROM {SCHEMA}.location_consents
                WHERE id = %s AND granted_by_member_id = %s""",
            (consent_id, ctx.member_id),
        )
        was_granter = cur.fetchone() is not None
    if not is_self and not was_granter and not eligibility.get('allowed'):
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    status = 'active' if is_self else 'pending'
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""INSERT INTO {SCHEMA}.location_consent_recipients
                    (consent_id, recipient_member_id, status,
                     requested_by_member_id, confirmed_at, revoked_at)
                VALUES (%s, %s, %s, %s, CASE WHEN %s = 'active' THEN NOW() ELSE NULL END, NULL)
                ON CONFLICT (consent_id, recipient_member_id) DO UPDATE
                   SET status = EXCLUDED.status,
                       requested_by_member_id = EXCLUDED.requested_by_member_id,
                       confirmed_at = EXCLUDED.confirmed_at,
                       revoked_at = NULL,
                       granted_at = CASE WHEN {SCHEMA}.location_consent_recipients.revoked_at
                                              IS NOT NULL
                                         THEN NOW()
                                         ELSE {SCHEMA}.location_consent_recipients.granted_at END
                RETURNING status""",
            (consent_id, recipient_id, status, ctx.member_id, status),
        )
        final_status = cur.fetchone()['status']

    ag.log_consent_event(ctx, 'recipient_added', consent_id=consent_id,
                         subject_member_id=subject_id,
                         details={'recipient_member_id': recipient_id,
                                  'status': final_status,
                                  'added_by_self': is_self})

    return ag.json_response({
        'success': True,
        'recipient_member_id': recipient_id,
        'status': final_status,
        'awaiting_confirmation': final_status == 'pending',
    }, event=event)


def _confirm_recipient(conn, ctx: ag.AuthContext, consent_id: str, subject_id: str,
                       recipient_id: str, is_self: bool, event: Dict[str, Any]) -> Dict[str, Any]:
    # Подтверждение — исключительно действие субъекта. Ни представитель,
    # ни сам предлагаемый получатель не могут подтвердить доступ к чужим
    # координатам за субъекта: это лишило бы подтверждение всякого смысла.
    if not is_self:
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    with conn.cursor() as cur:
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consent_recipients
                   SET status = 'active', confirmed_at = NOW()
                 WHERE consent_id = %s AND recipient_member_id = %s
                   AND status = 'pending' AND revoked_at IS NULL""",
            (consent_id, recipient_id),
        )
        confirmed = cur.rowcount > 0

    if not confirmed:
        return ag.json_response({'error': 'No pending recipient request found'},
                                status=404, event=event)

    ag.log_consent_event(ctx, 'recipient_confirmed', consent_id=consent_id,
                         subject_member_id=subject_id,
                         details={'recipient_member_id': recipient_id})

    return ag.json_response({
        'success': True,
        'recipient_member_id': recipient_id,
        'status': 'active',
    }, event=event)


def _revoke_recipient(conn, ctx: ag.AuthContext, consent_id: str, subject_id: str,
                      recipient_id: str, is_self: bool, event: Dict[str, Any]) -> Dict[str, Any]:
    # Отозвать получателя вправе сам субъект или тот, кто выдавал согласие
    # (например, представитель ребёнка). Отзыв никогда не требует
    # подтверждения второй стороны: прекращение доступа не может
    # блокироваться тем, у кого этот доступ отбирают.
    with conn.cursor() as cur:
        cur.execute(
            f"""SELECT 1 FROM {SCHEMA}.location_consents
                WHERE id = %s AND granted_by_member_id = %s""",
            (consent_id, ctx.member_id),
        )
        was_granter = cur.fetchone() is not None
    if not is_self and not was_granter:
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    with conn.cursor() as cur:
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consent_recipients
                   SET status = 'revoked', revoked_at = NOW()
                 WHERE consent_id = %s AND recipient_member_id = %s
                   AND revoked_at IS NULL""",
            (consent_id, recipient_id),
        )
        revoked = cur.rowcount > 0

    ag.log_consent_event(ctx, 'recipient_revoked', consent_id=consent_id,
                         subject_member_id=subject_id,
                         details={'recipient_member_id': recipient_id,
                                  'already_revoked': not revoked})

    return ag.json_response({
        'success': True,
        'recipient_member_id': recipient_id,
        'status': 'revoked',
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
                       revoked_by_user_id = %s, revoke_reason = %s,
                       collection_enabled = false,
                       collection_disabled_at = NOW()
                 WHERE id = %s""",
            (ctx.user_id, str(data.get('reason') or 'user_revoked'), consent_id),
        )
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consent_recipients
                   SET status = 'revoked', revoked_at = NOW()
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