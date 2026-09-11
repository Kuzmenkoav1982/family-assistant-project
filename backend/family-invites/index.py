"""
Business: Приглашения в семью — создание, просмотр, отзыв, присоединение
Args: event с httpMethod, body (action: create/join/list/delete), X-Auth-Token
Returns: JSON с кодом приглашения или результатом присоединения

Авторизация: backend/_shared/auth_guard.py.

Ключевые решения этой функции:
  - Приглашение создаёт только admin/owner. Раньше это мог сделать
    любой участник, включая viewer и детский профиль.
  - Роль хранится в family_invites.access_role и задаётся ПРИ СОЗДАНИИ.
    Принимающий приглашение не может выбрать себе роль через body,
    и 'admin' через приглашение не выдаётся в принципе.
  - Использование приглашения атомарно: счётчик инкрементируется
    условным UPDATE, поэтому два одновременных join по коду с max_uses=1
    не могут оба пройти.
  - Повторное использование одним пользователем блокируется уникальным
    индексом в family_invite_redemptions.
  - Смена семьи больше не удаляет прежнее членство: оно отзывается
    (member_status='revoked'), иначе терялись бы связанные данные.
"""

import json
import os
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import boto3
import psycopg2
import requests
from botocore.exceptions import ClientError
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

YANDEX_POSTBOX_ACCESS_KEY = os.environ.get('YANDEX_POSTBOX_ACCESS_KEY')
YANDEX_POSTBOX_SECRET_KEY = os.environ.get('YANDEX_POSTBOX_SECRET_KEY')
YANDEX_SMS_API_KEY = os.environ.get('YANDEX_SMS_API_KEY')
YANDEX_SMS_SENDER = os.environ.get('YANDEX_SMS_SENDER', 'FamilyApp')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'noreply@family-assistant.app')

# Роли, которые можно выдать приглашением. 'admin' отсутствует намеренно.
INVITABLE_ROLES = frozenset({'parent', 'guardian', 'viewer', 'child'})

MAX_USES_LIMIT = 20
MAX_DAYS_VALID = 30


def _connect():
    conn = psycopg2.connect(ag.DATABASE_URL)
    conn.autocommit = False
    return conn


def generate_invite_code() -> str:
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))


def send_email_invite(email: str, invite_code: str, family_name: str, role: str) -> bool:
    if not all([YANDEX_POSTBOX_ACCESS_KEY, YANDEX_POSTBOX_SECRET_KEY]):
        print('Yandex Postbox credentials not configured')
        return False
    try:
        ses_client = boto3.client(
            'ses', region_name='ru-central1',
            endpoint_url='https://postbox.cloud.yandex.net',
            aws_access_key_id=YANDEX_POSTBOX_ACCESS_KEY,
            aws_secret_access_key=YANDEX_POSTBOX_SECRET_KEY,
        )
        html_body = f'''
        <html><body>
            <h2>Приглашение в семью</h2>
            <p>Вас пригласили присоединиться к семье <strong>{family_name}</strong>
               с ролью <strong>{role}</strong>.</p>
            <p>Код приглашения: <strong>{invite_code}</strong></p>
            <a href="https://nasha-semiya.ru/join?code={invite_code}">Присоединиться</a>
            <p><small>Ссылка ограничена по сроку действия</small></p>
        </body></html>
        '''
        ses_client.send_email(
            Source=FROM_EMAIL,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': f'Приглашение в семью "{family_name}"', 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {'Data': html_body, 'Charset': 'UTF-8'},
                    'Text': {'Data': f'Приглашение в семью {family_name}. Код: {invite_code}',
                             'Charset': 'UTF-8'},
                },
            },
        )
        return True
    except (ClientError, Exception) as exc:  # noqa: BLE001
        print(f'Error sending email invite: {type(exc).__name__}')
        return False


def send_sms_invite(phone: str, invite_code: str, family_name: str) -> bool:
    if not YANDEX_SMS_API_KEY:
        return False
    try:
        response = requests.post(
            'https://sms.yandex.ru/sendsms',
            json={'phone': phone,
                  'text': f'Приглашение в семью "{family_name}". Код: {invite_code}',
                  'sender': YANDEX_SMS_SENDER},
            headers={'Authorization': f'Bearer {YANDEX_SMS_API_KEY}',
                     'Content-Type': 'application/json'},
            timeout=10,
        )
        return response.status_code == 200 and response.json().get('status') == 'ok'
    except Exception as exc:  # noqa: BLE001
        print(f'Error sending SMS invite: {type(exc).__name__}')
        return False


def create_invite(ctx, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Создание приглашения. Требует прав администрирования участников:
    добавление человека в семью — это управление доступом, а не рядовое
    действие любого участника.
    """
    ag.require_permission(ctx, 'family_members', 'create')

    requested_role = str(body.get('role') or body.get('access_role') or 'viewer')
    if requested_role not in INVITABLE_ROLES:
        ag.audit_denied(ctx, 'family_members', 'create', 'INVITE_ROLE_NOT_ALLOWED',
                        http_status=403)
        raise AuthError(403, 'PERMISSION_DENIED',
                        'This role cannot be granted via invite')

    try:
        max_uses = max(1, min(int(body.get('max_uses', 1) or 1), MAX_USES_LIMIT))
        days_valid = max(1, min(int(body.get('days_valid', 7) or 7), MAX_DAYS_VALID))
    except (TypeError, ValueError):
        raise AuthError(400, 'INVALID_INPUT', 'Invalid invite parameters')

    invite_type = str(body.get('invite_type', 'link'))
    invite_value = str(body.get('invite_value', '') or '')
    code = generate_invite_code()
    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=days_valid)

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.family_invites
                (family_id, invite_code, created_by, max_uses, expires_at, access_role)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, invite_code, max_uses, expires_at, access_role
            """,
            (ctx.family_id, code, ctx.user_id, max_uses, expires_at, requested_role),
        )
        invite = cur.fetchone()

        cur.execute(f"SELECT name FROM {SCHEMA}.families WHERE id = %s", (ctx.family_id,))
        row = cur.fetchone()
        family_name = row['name'] if row else 'Семья'
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    sent = False
    if invite_type == 'email' and invite_value:
        sent = send_email_invite(invite_value, code, family_name, requested_role)
    elif invite_type == 'sms' and invite_value:
        sent = send_sms_invite(invite_value, code, family_name)

    ag.audit_allowed(ctx, 'family_members', 'create', reason_code='INVITE_CREATED',
                     resource_type='family_invite', resource_id=str(invite['id']))

    return {
        'success': True,
        'sent': sent,
        'invite': {
            'id': str(invite['id']),
            'code': invite['invite_code'],
            'max_uses': invite['max_uses'],
            'access_role': invite['access_role'],
            'expires_at': invite['expires_at'].isoformat(),
            'family_name': family_name,
        },
    }


def join_family(ctx, event: Dict[str, Any], body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Присоединение по коду. Роль берётся из приглашения, а не из запроса.
    Счётчик использований увеличивается условным UPDATE — это и есть
    защита от гонки и повторного использования исчерпанного кода.
    """
    invite_code = str(body.get('invite_code', '') or '').strip().upper()
    member_name = str(body.get('member_name', '') or '').strip()[:255]
    relationship = str(body.get('relationship', '') or '')[:100]
    force_leave = bool(body.get('force_leave', False))

    if not invite_code or not member_name:
        raise AuthError(400, 'INVALID_INPUT', 'Требуются код приглашения и имя')

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Атомарно: находим пригодное приглашение и сразу занимаем слот.
        # Если код исчерпан, просрочен, отозван или деактивирован —
        # UPDATE не затронет ни одной строки.
        cur.execute(
            f"""
            UPDATE {SCHEMA}.family_invites
            SET uses_count = uses_count + 1
            WHERE id = (
                SELECT id FROM {SCHEMA}.family_invites
                WHERE invite_code = %s
                  AND is_active
                  AND revoked_at IS NULL
                  AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                  AND uses_count < max_uses
                FOR UPDATE SKIP LOCKED
            )
            RETURNING id, family_id, access_role
            """,
            (invite_code,),
        )
        invite = cur.fetchone()
        if not invite:
            conn.rollback()
            # Единый ответ для «нет такого кода», «просрочен», «исчерпан»:
            # иначе код становится оракулом для перебора.
            raise AuthError(400, 'INVITE_NOT_USABLE',
                            'Приглашение недействительно или исчерпано')

        family_id = str(invite['family_id'])
        granted_role = invite['access_role']

        cur.execute(
            f"""SELECT fm.id, fm.family_id, fm.member_status, f.name AS family_name
                FROM {SCHEMA}.family_members fm
                JOIN {SCHEMA}.families f ON f.id = fm.family_id
                WHERE fm.user_id = %s
                  AND COALESCE(fm.member_status, 'active') = 'active'""",
            (ctx.user_id,),
        )
        existing = cur.fetchone()

        if existing and str(existing['family_id']) == family_id:
            conn.rollback()
            return {'success': True, 'already_member': True,
                    'message': 'Вы уже состоите в этой семье'}

        if existing and not force_leave:
            cur.execute(f"SELECT name FROM {SCHEMA}.families WHERE id = %s", (family_id,))
            target = cur.fetchone()
            conn.rollback()
            return {
                'warning': True,
                'current_family': existing['family_name'],
                'target_family': target['name'] if target else 'новой семье',
                'message': 'Вы уже состоите в другой семье. '
                           'Присоединение приведёт к выходу из текущей.',
            }

        if existing and force_leave:
            # Прежнее членство отзывается, а не удаляется: на участника
            # ссылаются задачи, события и медицинские записи.
            cur.execute(
                f"""UPDATE {SCHEMA}.family_members
                    SET member_status = 'revoked', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s""",
                (existing['id'],),
            )
            cur.execute(
                f"""UPDATE {SCHEMA}.member_guardianships
                    SET revoked_at = (NOW() AT TIME ZONE 'UTC'),
                        revoke_reason = 'MEMBER_LEFT_FAMILY', status = 'rejected'
                    WHERE (guardian_member_id = %s OR dependent_member_id = %s)
                      AND revoked_at IS NULL""",
                (existing['id'], existing['id']),
            )

        # Заготовленный профиль без аккаунта: связываем, если он есть.
        cur.execute(
            f"""SELECT id FROM {SCHEMA}.family_members
                WHERE family_id = %s AND name = %s AND user_id IS NULL
                  AND COALESCE(member_status, 'active') = 'active'
                LIMIT 1""",
            (family_id, member_name),
        )
        placeholder = cur.fetchone()

        if placeholder:
            cur.execute(
                f"""UPDATE {SCHEMA}.family_members
                    SET user_id = %s, relationship = %s, role = %s,
                        access_role = %s, account_type = 'full',
                        member_status = 'active', joined_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s AND family_id = %s
                    RETURNING id""",
                (ctx.user_id, relationship, 'Член семьи', granted_role,
                 placeholder['id'], family_id),
            )
        else:
            cur.execute(
                f"""INSERT INTO {SCHEMA}.family_members
                        (family_id, user_id, name, relationship, role, access_role,
                         account_type, member_status, points, level, workload,
                         avatar, avatar_type, joined_at)
                    VALUES (%s, %s, %s, %s, 'Член семьи', %s, 'full', 'active',
                            0, 1, 0, '👤', 'emoji', CURRENT_TIMESTAMP)
                    RETURNING id""",
                (family_id, ctx.user_id, member_name, relationship, granted_role),
            )
        member = cur.fetchone()

        # Повторное использование одного кода тем же пользователем
        # отсекается уникальным индексом.
        cur.execute(
            f"""INSERT INTO {SCHEMA}.family_invite_redemptions
                    (invite_id, family_id, redeemed_by_user_id, member_id,
                     granted_access_role, ip_hash)
                VALUES (%s, %s, %s, %s, %s, %s)""",
            (invite['id'], family_id, ctx.user_id, member['id'],
             granted_role, ctx.ip_hash),
        )

        cur.execute(f"SELECT name FROM {SCHEMA}.families WHERE id = %s", (family_id,))
        family = cur.fetchone()
        conn.commit()
        cur.close()
    except psycopg2.IntegrityError:
        conn.rollback()
        raise AuthError(409, 'INVITE_ALREADY_REDEEMED',
                        'Это приглашение уже использовано вами')
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    return {
        'success': True,
        'family': {
            'id': family_id,
            'name': family['name'] if family else 'Семья',
            'member_id': str(member['id']),
            'access_role': granted_role,
        },
    }


def list_invites(ctx) -> Dict[str, Any]:
    """Список приглашений своей семьи. Доступен управляющим доступом."""
    ag.require_permission(ctx, 'family_members', 'create')

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT id, invite_code, max_uses, uses_count, expires_at,
                       is_active, access_role, created_at
                FROM {SCHEMA}.family_invites
                WHERE family_id = %s AND is_active AND revoked_at IS NULL
                ORDER BY created_at DESC""",
            (ctx.family_id,),
        )
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    invites = []
    for row in rows:
        item = dict(row)
        item['id'] = str(item['id'])
        item['code'] = item.pop('invite_code', '')
        for field in ('expires_at', 'created_at'):
            if item.get(field):
                item[field] = item[field].isoformat()
        invites.append(item)

    return {'success': True, 'invites': invites}


def revoke_invite(ctx, invite_id: str) -> Dict[str, Any]:
    ag.require_permission(ctx, 'family_members', 'delete')

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"SELECT id, family_id FROM {SCHEMA}.family_invites WHERE id = %s",
            (invite_id,),
        )
        invite = cur.fetchone()
        if not invite:
            raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
        ag.require_same_family(ctx, str(invite['family_id']),
                               'family_invite', invite_id)

        cur.execute(
            f"""UPDATE {SCHEMA}.family_invites
                SET is_active = FALSE, revoked_at = (NOW() AT TIME ZONE 'UTC')
                WHERE id = %s AND family_id = %s""",
            (invite_id, ctx.family_id),
        )
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    ag.audit_allowed(ctx, 'family_members', 'delete', reason_code='INVITE_REVOKED',
                     resource_type='family_invite', resource_id=invite_id)
    return {'success': True}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    try:
        ctx = ag.require_session(event)

        if method == 'GET':
            ag.require_family_member(ctx)
            return ag.json_response(list_invites(ctx), event=event)

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            action = body.get('action', '')

            if action == 'create':
                ag.require_family_member(ctx)
                return ag.json_response(create_invite(ctx, body), status=201, event=event)

            if action == 'join':
                # join — единственное действие, доступное пользователю
                # без членства в семье: именно так он его и получает.
                return ag.json_response(join_family(ctx, event, body), event=event)

            if action == 'delete':
                ag.require_family_member(ctx)
                invite_id = body.get('invite_id', '')
                if not invite_id:
                    return ag.json_response({'error': 'Требуется ID приглашения'},
                                            status=400, event=event)
                return ag.json_response(revoke_invite(ctx, str(invite_id)), event=event)

            return ag.json_response({'error': 'Неизвестное действие'},
                                    status=400, event=event)

        return ag.json_response({'error': 'Метод не поддерживается'},
                                status=405, event=event)

    except AuthError as exc:
        return ag.error_response(exc, event)
    except (ValueError, TypeError):
        return ag.json_response({'error': 'Некорректные данные запроса'},
                                status=400, event=event)
    except Exception:
        return ag.json_response({'error': 'Внутренняя ошибка'}, status=500, event=event)
