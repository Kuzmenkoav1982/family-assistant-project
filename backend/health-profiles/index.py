"""
Business: медицинские профили членов семьи — чтение, создание, обновление
Args: event с httpMethod, body, headers X-Auth-Token (обязательно), X-User-Id (переходный, опционально)
Returns: JSON со списком профилей или результатом операции

────────────────────────────────────────────────────────────────────────────
МОДЕЛЬ ДОСТУПА (волна 1, серверная авторизация)

Actor определяется ТОЛЬКО из sessions.token. X-User-Id больше не является
identity: он допустим лишь как requested member ("от имени какого доступного
мне участника действую") и проверяется через resolve_requested_member().

Проверки на каждую операцию:
  1) require_session            — кто выполняет запрос
  2) require_permission         — может ли роль работать с модулем health
  3) require_same_family        — профиль относится к моей семье (IDOR/BOLA)
  4) require_subject_access     — доступ к данным именно этого человека

Роль admin НЕ даёт автоматического доступа к здоровью всех участников:
нужна явная связь member_guardianships или родительство над ребёнком.

KE-health: health_profiles.user_id физически хранит family_members.id,
поэтому субъект профиля — это member_id.
"""

import json
import os
from typing import Any, Dict, List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

from auth_guard import (
    AuthContext,
    AuthError,
    accessible_subject_ids,
    audit_allowed,
    error_response,
    json_response,
    preflight,
    require_permission,
    require_same_family,
    require_session,
    require_subject_access,
    resolve_requested_member,
)
from encryption_utils import encrypt_list, decrypt_list

SCHEMA = 't_p5815085_family_assistant_pro'
MODULE = 'health'


def _connect():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))


def _member_directory(cursor, member_ids: List[str]) -> Dict[str, Dict[str, Any]]:
    """Имена/фото участников одним запросом к БД — без внутреннего HTTP-вызова."""
    if not member_ids:
        return {}
    cursor.execute(
        f"""SELECT id::text, name, age, photo_url
            FROM {SCHEMA}.family_members WHERE id::text = ANY(%s)""",
        (list(member_ids),),
    )
    return {
        r[0]: {'name': r[1] or 'Член семьи', 'age': r[2] or 0, 'photo_url': r[3]}
        for r in cursor.fetchall()
    }


def _load_member(cursor, member_id: str) -> Optional[Dict[str, Any]]:
    """Участник и его семья — для проверки субъекта, указанного в теле запроса."""
    cursor.execute(
        f"""SELECT id::text, family_id::text, access_role, account_type
            FROM {SCHEMA}.family_members WHERE id::text = %s""",
        (str(member_id),),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return {'id': row[0], 'family_id': row[1], 'access_role': row[2], 'account_type': row[3]}


def _load_profile(cursor, profile_id: str) -> Optional[Dict[str, Any]]:
    """Профиль + family_id субъекта. Нужен ДО любой отдачи данных клиенту."""
    cursor.execute(
        f"""
        SELECT hp.id, hp.user_id AS subject_member_id, fm.family_id::text AS family_id
        FROM health_profiles hp
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE hp.id = %s
        """,
        (profile_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return {'id': row[0], 'subject_member_id': row[1], 'family_id': row[2]}


def _serialize(cursor, rows, directory) -> List[Dict[str, Any]]:
    profiles = []
    for row in rows:
        profile_id = row[0]
        cursor.execute(
            'SELECT id, name, relation, phone, is_primary FROM emergency_contacts WHERE profile_id = %s',
            (profile_id,),
        )
        contacts = [
            {'id': c[0], 'name': c[1], 'relation': c[2], 'phone': c[3], 'isPrimary': c[4]}
            for c in cursor.fetchall()
        ]
        info = directory.get(str(row[1]), {'name': 'Член семьи', 'age': 0, 'photo_url': None})
        profiles.append({
            'id': row[0],
            'userId': row[1],
            'userName': info['name'],
            'userAge': info['age'],
            'photoUrl': info.get('photo_url'),
            'bloodType': row[2],
            'rhFactor': row[3],
            'allergies': decrypt_list(row[4]) if row[4] else [],
            'chronicDiseases': decrypt_list(row[5]) if row[5] else [],
            'emergencyContacts': contacts,
            'privacy': row[6],
            'sharedWith': row[7] or [],
            'createdAt': row[8].isoformat() if row[8] else None,
            'updatedAt': row[9].isoformat() if row[9] else None,
        })
    return profiles


def _handle_get(event, ctx: AuthContext, cursor) -> Dict[str, Any]:
    """
    Массовый список НИКОГДА не возвращает чужие записи: выборка ограничена
    множеством субъектов, к которым у актора есть подтверждённый доступ.
    """
    # read_own достаточно для своего профиля; сама выборка ограничена
    # accessible_subject_ids, поэтому расширения прав здесь не происходит.
    require_permission(ctx, MODULE, 'read_own')
    subjects = accessible_subject_ids(ctx, MODULE)
    if not subjects:
        return json_response([], 200, event)

    cursor.execute(
        """
        SELECT id, user_id, blood_type, rh_factor, allergies, chronic_diseases,
               privacy, shared_with, created_at, updated_at
        FROM health_profiles
        WHERE user_id = ANY(%s)
        """,
        (subjects,),
    )
    rows = cursor.fetchall()
    directory = _member_directory(cursor, [str(r[1]) for r in rows])
    profiles = _serialize(cursor, rows, directory)
    audit_allowed(ctx, MODULE, 'read', 'ACCESSIBLE_SUBJECTS', resource_type='health_profile')
    return json_response(profiles, 200, event)


def _handle_post(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'create')
    body = json.loads(event.get('body') or '{}')

    # Субъект профиля никогда не принимается на веру из body: значение
    # проходит проверку принадлежности семье и права на этого человека.
    # Без этого можно было бы завести медицинский профиль на чужого члена
    # чужой семьи, просто указав его UUID в userId.
    requested = body.get('userId') or resolve_requested_member(event, ctx, MODULE)
    subject_member_id = str(requested)

    subject = _load_member(cursor, subject_member_id)
    if not subject:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, subject['family_id'], 'family_member', subject_member_id)
    require_subject_access(ctx, subject_member_id, MODULE, resource_type='health_profile')

    cursor.execute(
        """
        INSERT INTO health_profiles
        (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
        VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """,
        (
            subject_member_id,
            body.get('bloodType'),
            body.get('rhFactor'),
            encrypt_list(body.get('allergies', [])),
            encrypt_list(body.get('chronicDiseases', [])),
            body.get('privacy', 'private'),
            body.get('sharedWith', []),
        ),
    )
    profile_id = cursor.fetchone()[0]

    for contact in body.get('emergencyContacts', []):
        if not contact.get('name') or not contact.get('relation') or not contact.get('phone'):
            continue
        cursor.execute(
            """INSERT INTO emergency_contacts (id, profile_id, name, relation, phone, is_primary)
               VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s)""",
            (profile_id, contact['name'], contact['relation'], contact['phone'],
             contact.get('isPrimary', False)),
        )

    conn.commit()
    audit_allowed(ctx, MODULE, 'create', 'POLICY_ALLOW',
                  resource_type='health_profile', resource_id=profile_id,
                  subject_member_id=subject_member_id)
    return json_response({'id': profile_id, 'message': 'Profile created'}, 201, event)


def _handle_put(event, ctx: AuthContext, cursor, conn) -> Dict[str, Any]:
    require_permission(ctx, MODULE, 'update')
    body = json.loads(event.get('body') or '{}')
    profile_id = body.get('id')
    if not profile_id:
        return json_response({'error': 'Profile ID required'}, 400, event)

    # Загружаем объект и проверяем принадлежность ДО изменения.
    profile = _load_profile(cursor, profile_id)
    if not profile:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, profile['family_id'], 'health_profile', profile_id)
    require_subject_access(ctx, profile['subject_member_id'], MODULE,
                           resource_type='health_profile', resource_id=profile_id)

    cursor.execute(
        """
        UPDATE health_profiles
        SET blood_type = %s, rh_factor = %s, allergies = %s,
            chronic_diseases = %s, privacy = %s, shared_with = %s, updated_at = NOW()
        WHERE id = %s
        """,
        (
            body.get('bloodType'),
            body.get('rhFactor'),
            encrypt_list(body.get('allergies', [])),
            encrypt_list(body.get('chronicDiseases', [])),
            body.get('privacy', 'private'),
            body.get('sharedWith', []),
            profile_id,
        ),
    )

    if 'emergencyContacts' in body:
        cursor.execute('DELETE FROM emergency_contacts WHERE profile_id = %s', (profile_id,))
        for contact in body['emergencyContacts']:
            if not contact.get('name') or not contact.get('relation') or not contact.get('phone'):
                continue
            cursor.execute(
                """INSERT INTO emergency_contacts (id, profile_id, name, relation, phone, is_primary)
                   VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s)""",
                (profile_id, contact['name'], contact['relation'], contact['phone'],
                 contact.get('isPrimary', False)),
            )

    conn.commit()
    audit_allowed(ctx, MODULE, 'update', 'POLICY_ALLOW',
                  resource_type='health_profile', resource_id=profile_id,
                  subject_member_id=profile['subject_member_id'])
    return json_response({'message': 'Profile updated'}, 200, event)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return preflight(event)

    try:
        ctx = require_session(event)
    except AuthError as exc:
        return error_response(exc, event)

    conn = None
    try:
        conn = _connect()
        cursor = conn.cursor()

        if method == 'GET':
            return _handle_get(event, ctx, cursor)
        if method == 'POST':
            return _handle_post(event, ctx, cursor, conn)
        if method == 'PUT':
            return _handle_put(event, ctx, cursor, conn)

        return json_response({'error': 'Method not allowed'}, 405, event)

    except AuthError as exc:
        if conn:
            conn.rollback()
        return error_response(exc, event)
    except Exception as exc:
        if conn:
            conn.rollback()
        print(f'[ERROR] health-profiles: {exc}')
        return json_response({'error': 'Internal error'}, 500, event)
    finally:
        if conn:
            conn.close()