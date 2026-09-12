"""
Business: заявление о законном представительстве ребёнка (самодекларация)
Args: event с httpMethod GET/POST/DELETE, X-Auth-Token
Returns: GET — текст заявления и право его сделать; POST — заявление; DELETE — отзыв

ЧТО ЭТА ФУНКЦИЯ ДЕЛАЕТ И ЧЕГО НЕ ДЕЛАЕТ
---------------------------------------
Она фиксирует ОДИН факт: пользователь заявил, что является законным
представителем конкретного ребёнка. Документы не загружаются, внешняя
проверка не проводится, поэтому verification_level всегда 'self_declared'.

Платформа не вправе утверждать, что установила статус представителя, —
и ни один текст здесь этого не утверждает. Уровень 'externally_verified'
существует в модели, но НЕ ВЫДАЁТСЯ этим кодом ни при каких условиях.

Заявление само по себе НЕ:
    включает GPS;
    создаёт согласие на обработку геоданных;
    выдаёт geolocation:read;
    делает заявителя получателем координат;
    включает историю или геозоны.
Это следующие, отдельные решения. Разделение намеренное: иначе одна
галочка незаметно включала бы слежение за ребёнком.

Роли owner, admin, parent и семейные подписи «Мама»/«Папа»
представительства НЕ доказывают и здесь не проверяются.
"""

import json
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA


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
                return _declare(conn, ctx, event)
            if method == 'DELETE':
                return _revoke(conn, ctx, event)
            return ag.json_response({'error': 'Method not allowed'},
                                    status=405, event=event)
        finally:
            conn.close()

    except AuthError as exc:
        return ag.error_response(exc, event)
    except Exception as exc:  # noqa: BLE001
        print(f'[legal-representative] failed: {type(exc).__name__}: {exc}')
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
                  FROM {SCHEMA}.representative_declaration_texts
                 WHERE is_current = true
              ORDER BY effective_from DESC LIMIT 1"""
        )
        row = cur.fetchone()
        return dict(row) if row else {}


def _load_subject(ctx: ag.AuthContext, subject_id: str) -> Dict[str, Any]:
    """Чужой участник и несуществующий неотличимы: 404 в обоих случаях."""
    subject = ag._load_member(subject_id) if subject_id else None
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    return subject


def _status(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Что показать до галочки: имя и возраст ребёнка, имя заявителя,
    текст заявления и вычисленное СЕРВЕРОМ право его сделать.

    Клиент не решает сам, вправе ли он заявлять: возраст, активность
    членства и семью проверяет сервер.
    """
    params = event.get('queryStringParameters') or {}
    subject_id = str(params.get('subject_member_id') or '')
    subject = _load_subject(ctx, subject_id)

    actor = ag._load_member(ctx.member_id) if ctx.member_id else None
    eligibility = ag.representation_eligibility(actor, subject)
    existing = ag.load_representation(ctx.member_id, subject_id) if ctx.member_id else None

    # Другие заявители показываются без притязания на достоверность:
    # это список заявивших, а не список установленных представителей.
    others = [
        {
            'id': str(r['id']),
            'representative_member_id': str(r['representative_member_id']),
            'representative_name': r.get('representative_name'),
            'status': r.get('status'),
            'verification_level': r.get('verification_level'),
            'declared_at': r.get('declared_at'),
        }
        for r in ag.list_representations(subject_id)
        if str(r['representative_member_id']) != str(ctx.member_id or '')
    ]

    return ag.json_response({
        'success': True,
        'subject_member_id': subject_id,
        'subject_name': subject.get('name'),
        'subject_age': ag._member_age(subject),
        'subject_birth_date': subject.get('birth_date'),
        'subject_has_account': bool(subject.get('user_id')),
        'representative_member_id': ctx.member_id,
        'representative_name': (actor or {}).get('name'),
        'representative_age': ag._member_age(actor),
        'self_consent_age': ag.SELF_CONSENT_AGE,
        'adult_age': ag.ADULT_AGE,
        'declaration_text': _current_text(conn),
        'eligibility': eligibility,
        'declaration': _serialize(existing) if existing else None,
        'other_declarations': others,
    }, event=event)


def _serialize(rep: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': str(rep['id']),
        'status': rep.get('status'),
        # Никогда не 'verified': простая галочка проверкой не является.
        'verification_level': rep.get('verification_level'),
        'declaration_text_version': rep.get('declaration_text_version'),
        'declared_at': rep.get('declared_at'),
        'revoked_at': rep.get('revoked_at'),
    }


def _declare(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Создание заявления. Успех означает ровно одно: заявление записано.
    Никаких побочных включений — ни GPS, ни согласия, ни доступа.
    """
    data = _body(event)
    subject_id = str(data.get('subject_member_id') or '')
    subject = _load_subject(ctx, subject_id)
    actor = ag._load_member(ctx.member_id) if ctx.member_id else None

    # Галочка обязательна и не предустановлена на клиенте; сервер
    # проверяет её отдельно, чтобы согласие нельзя было получить
    # запросом в обход экрана.
    if not bool(data.get('declaration_accepted')):
        raise AuthError(400, 'REPRESENTATION_NOT_DECLARED',
                        'Declaration checkbox is required')

    eligibility = ag.representation_eligibility(actor, subject)
    if not eligibility.get('allowed'):
        reason = eligibility.get('reason') or 'REPRESENTATION_NOT_DECLARED'
        ag.log_representation_event(ctx, 'rejected', subject_member_id=subject_id,
                                    representative_member_id=ctx.member_id,
                                    details={'reason': reason})
        status = 404 if reason == 'CROSS_FAMILY_ACCESS' else 403
        raise AuthError(status, reason)

    # Заявление даётся на КОНКРЕТНУЮ версию текста. Если текст обновился,
    # пока экран был открыт, заявление отклоняется: иначе через год
    # невозможно доказать, что именно человек прочитал.
    text = _current_text(conn)
    if not text:
        raise AuthError(503, 'GEOLOCATION_DISABLED',
                        'Declaration text is not published')
    accepted_version = str(data.get('declaration_text_version') or '')
    if accepted_version != text['version']:
        raise AuthError(409, 'REPRESENTATION_NOT_DECLARED',
                        'Declaration text version mismatch, reload the form')

    actor_age = ag._member_age(actor)
    subject_age = ag._member_age(subject)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Повторное заявление того же человека о том же ребёнке — не
        # ошибка (мог отозвать и передумать), но это НОВОЕ заявление
        # с новой датой и версией текста.
        cur.execute(
            f"""INSERT INTO {SCHEMA}.legal_representatives
                    (family_id, representative_member_id, representative_user_id,
                     dependent_member_id, subject_member_id, status,
                     verification_level, declaration_text_version, declared_at,
                     representative_age_at_declaration, subject_age_at_declaration,
                     source, basis, revoked_at, revoked_by_user_id, revoke_reason,
                     ip_hash, user_agent_family, request_id)
                VALUES (%s, %s, %s, %s, %s, 'declared', %s, %s, NOW(),
                        %s, %s, 'ui', 'self_declaration',
                        NULL, NULL, NULL, %s, %s, %s)
                ON CONFLICT (representative_member_id, dependent_member_id)
                DO UPDATE SET status = 'declared',
                              verification_level = EXCLUDED.verification_level,
                              declaration_text_version = EXCLUDED.declaration_text_version,
                              declared_at = NOW(),
                              representative_age_at_declaration = EXCLUDED.representative_age_at_declaration,
                              subject_age_at_declaration = EXCLUDED.subject_age_at_declaration,
                              revoked_at = NULL,
                              revoked_by_user_id = NULL,
                              revoke_reason = NULL,
                              ip_hash = EXCLUDED.ip_hash,
                              user_agent_family = EXCLUDED.user_agent_family,
                              request_id = EXCLUDED.request_id
                RETURNING id""",
            (ctx.family_id, ctx.member_id, ctx.user_id, subject_id, subject_id,
             ag.VERIFICATION_SELF_DECLARED, text['version'],
             actor_age, subject_age,
             ctx.ip_hash, ctx.user_agent_family, ctx.request_id),
        )
        representation_id = str(cur.fetchone()['id'])

    ag.log_representation_event(
        ctx, 'declared', representation_id=representation_id,
        subject_member_id=subject_id, representative_member_id=ctx.member_id,
        verification_level=ag.VERIFICATION_SELF_DECLARED,
        declaration_text_version=text['version'],
        details={'representative_age': actor_age, 'subject_age': subject_age,
                 'source': 'ui'})

    return ag.json_response({
        'success': True,
        'representation_id': representation_id,
        'subject_member_id': subject_id,
        'status': 'declared',
        # Возвращаем уровень явно, чтобы UI не мог показать «проверено».
        'verification_level': ag.VERIFICATION_SELF_DECLARED,
        'declaration_text_version': text['version'],
        # Прямое напоминание вызывающему коду: дальше нужен отдельный
        # экран согласия, само заявление ничего не включило.
        'consent_required': True,
        'gps_started': False,
    }, event=event)


def _revoke(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Отзыв СВОЕГО заявления. Чужое не трогаем: один представитель не
    может править заявление другого.

    Отзыв заявления прекращает и согласие, выданное на его основании, —
    иначе данные ребёнка продолжали бы собираться по отпавшему основанию.
    """
    params = event.get('queryStringParameters') or {}
    data = _body(event)
    subject_id = str(data.get('subject_member_id')
                     or params.get('subject_member_id') or '')
    _load_subject(ctx, subject_id)

    rep = ag.load_representation(ctx.member_id, subject_id) if ctx.member_id else None
    if not rep or rep.get('revoked_at'):
        return ag.json_response({'success': True, 'already_revoked': True},
                                event=event)

    representation_id = str(rep['id'])
    reason = str(data.get('reason') or 'user_revoked')

    with conn.cursor() as cur:
        cur.execute(
            f"""UPDATE {SCHEMA}.legal_representatives
                   SET status = 'revoked', revoked_at = NOW(),
                       revoked_by_user_id = %s, revoke_reason = %s
                 WHERE id = %s""",
            (ctx.user_id, reason, representation_id),
        )
        # Согласия, стоявшие на этом заявлении, прекращаются вместе с ним.
        # Отзыв одного заявления НЕ трогает заявления других представителей
        # и выданные ими согласия — у них собственное основание.
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consents
                   SET status = 'revoked', revoked_at = NOW(),
                       revoked_by_user_id = %s,
                       revoke_reason = 'representation_revoked',
                       collection_enabled = false,
                       collection_disabled_at = NOW()
                 WHERE representation_id = %s AND status = 'active'
             RETURNING id""",
            (ctx.user_id, representation_id),
        )
        affected = [str(r[0]) for r in cur.fetchall()]
        if affected:
            cur.execute(
                f"""UPDATE {SCHEMA}.location_consent_recipients
                       SET status = 'revoked', revoked_at = NOW()
                     WHERE consent_id = ANY(%s::uuid[]) AND revoked_at IS NULL""",
                (affected,),
            )

    ag.log_representation_event(
        ctx, 'revoked', representation_id=representation_id,
        subject_member_id=subject_id, representative_member_id=ctx.member_id,
        verification_level=rep.get('verification_level'),
        declaration_text_version=rep.get('declaration_text_version'),
        details={'reason': reason, 'revoked_consents': affected})

    for consent_id in affected:
        ag.log_consent_event(ctx, 'revoked', consent_id=consent_id,
                             subject_member_id=subject_id,
                             details={'reason': 'representation_revoked'})

    return ag.json_response({
        'success': True,
        'revoked': True,
        'representation_id': representation_id,
        'revoked_consents': len(affected),
    }, event=event)
