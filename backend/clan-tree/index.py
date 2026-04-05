"""
Управление общим родом — создание рода, приглашение родственников, принятие/отклонение приглашений
"""

import json
import os
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def esc(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json'
    }


def resp(status_code: int, body: Any) -> dict:
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(body, default=str, ensure_ascii=False)
    }


def verify_token(token: str) -> Optional[str]:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = {esc(token)} AND expires_at > CURRENT_TIMESTAMP
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['user_id']) if row else None


def get_family_id(user_id: str) -> Optional[str]:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {esc(user_id)} LIMIT 1
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['family_id']) if row else None


def get_user_clan(user_id: str, family_id: str) -> Optional[Dict]:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT c.id, c.name, c.description, c.created_by, cm.role, cm.status
        FROM {SCHEMA}.clans c
        JOIN {SCHEMA}.clan_members cm ON cm.clan_id = c.id
        WHERE cm.family_id = {esc(family_id)} AND cm.status = 'active'
        LIMIT 1
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


def get_clan_families(clan_id: str) -> List[Dict]:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT cm.id, cm.family_id, cm.user_id, cm.role, cm.status, cm.joined_at, cm.created_at,
               u.name as user_name, u.email as user_email
        FROM {SCHEMA}.clan_members cm
        LEFT JOIN {SCHEMA}.users u ON u.id = cm.user_id
        WHERE cm.clan_id = {esc(clan_id)}
        ORDER BY cm.created_at
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def get_pending_invites(user_id: str, family_id: str) -> List[Dict]:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT cm.id, cm.clan_id, cm.status, cm.created_at,
               c.name as clan_name, c.description as clan_description,
               inv.name as invited_by_name
        FROM {SCHEMA}.clan_members cm
        JOIN {SCHEMA}.clans c ON c.id = cm.clan_id
        LEFT JOIN {SCHEMA}.users inv ON inv.id = cm.invited_by
        WHERE cm.family_id = {esc(family_id)} AND cm.status = 'pending'
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def create_clan(user_id: str, family_id: str, name: str, description: str = None) -> Dict:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.clans (name, description, created_by)
        VALUES ({esc(name)}, {esc(description)}, {esc(user_id)}::uuid)
        RETURNING *
    """)
    clan = dict(cur.fetchone())
    cur.execute(f"""
        INSERT INTO {SCHEMA}.clan_members (clan_id, family_id, user_id, role, status, joined_at)
        VALUES ({esc(str(clan['id']))}, {esc(family_id)}, {esc(user_id)}::uuid, 'owner', 'active', CURRENT_TIMESTAMP)
        RETURNING *
    """)
    cur.execute(f"""
        UPDATE {SCHEMA}.family_tree SET clan_id = {esc(str(clan['id']))}::uuid
        WHERE family_id = {esc(family_id)} AND clan_id IS NULL
    """)
    cur.close()
    conn.close()
    return clan


def invite_by_email(clan_id: str, inviter_id: str, email: str) -> Dict:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT id FROM {SCHEMA}.users WHERE email = {esc(email)} LIMIT 1
    """)
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return {'error': 'Пользователь с таким email не найден в приложении'}

    target_user_id = str(user['id'])
    cur.execute(f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id = {esc(target_user_id)}::uuid LIMIT 1
    """)
    fm = cur.fetchone()
    if not fm:
        cur.close()
        conn.close()
        return {'error': 'У пользователя нет семьи'}

    target_family_id = str(fm['family_id'])
    cur.execute(f"""
        SELECT id, status FROM {SCHEMA}.clan_members 
        WHERE clan_id = {esc(clan_id)}::uuid AND family_id = {esc(target_family_id)}
    """)
    existing = cur.fetchone()
    if existing:
        cur.close()
        conn.close()
        st = existing['status']
        if st == 'active':
            return {'error': 'Эта семья уже в роду'}
        elif st == 'pending':
            return {'error': 'Приглашение уже отправлено'}
        else:
            return {'error': f'Статус: {st}'}

    cur.execute(f"""
        INSERT INTO {SCHEMA}.clan_members (clan_id, family_id, user_id, role, status, invited_by)
        VALUES ({esc(clan_id)}::uuid, {esc(target_family_id)}, {esc(target_user_id)}::uuid, 'member', 'pending', {esc(inviter_id)}::uuid)
        RETURNING *
    """)
    invite = dict(cur.fetchone())
    cur.close()
    conn.close()
    return {'invite': invite}


def accept_invite(invite_id: str, family_id: str) -> bool:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.clan_members 
        SET status = 'active', joined_at = CURRENT_TIMESTAMP
        WHERE id = {esc(invite_id)}::uuid AND family_id = {esc(family_id)} AND status = 'pending'
        RETURNING clan_id
    """)
    row = cur.fetchone()
    if row:
        clan_id = str(row['clan_id'])
        cur.execute(f"""
            UPDATE {SCHEMA}.family_tree SET clan_id = {esc(clan_id)}::uuid
            WHERE family_id = {esc(family_id)} AND clan_id IS NULL
        """)
    cur.close()
    conn.close()
    return row is not None


def decline_invite(invite_id: str, family_id: str) -> bool:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.clan_members 
        SET status = 'declined'
        WHERE id = {esc(invite_id)}::uuid AND family_id = {esc(family_id)} AND status = 'pending'
    """)
    changed = cur.rowcount > 0
    cur.close()
    conn.close()
    return changed


def handler(event: dict, context) -> dict:
    """Управление общим родом — создание, приглашения родственников, принятие"""

    if event.get('httpMethod') == 'OPTIONS':
        return resp(200, '')

    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return resp(401, {'error': 'Требуется авторизация'})

    user_id = verify_token(token)
    if not user_id:
        return resp(401, {'error': 'Недействительный токен'})

    family_id = get_family_id(user_id)
    if not family_id:
        return resp(404, {'error': 'Семья не найдена'})

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'GET' and action == 'invites':
        invites = get_pending_invites(user_id, family_id)
        return resp(200, {'invites': invites})

    if method == 'GET':
        clan = get_user_clan(user_id, family_id)
        if not clan:
            invites = get_pending_invites(user_id, family_id)
            return resp(200, {'clan': None, 'families': [], 'invites': invites})
        families = get_clan_families(str(clan['id']))
        return resp(200, {'clan': clan, 'families': families, 'invites': []})

    if method == 'POST' and action == 'create':
        body = json.loads(event.get('body', '{}'))
        name = body.get('name', '').strip()
        if not name:
            return resp(400, {'error': 'Укажите название рода'})
        existing = get_user_clan(user_id, family_id)
        if existing:
            return resp(400, {'error': 'Вы уже состоите в роду'})
        clan = create_clan(user_id, family_id, name, body.get('description'))
        return resp(201, {'clan': clan})

    if method == 'POST' and action == 'invite':
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').strip().lower()
        if not email:
            return resp(400, {'error': 'Укажите email'})
        clan = get_user_clan(user_id, family_id)
        if not clan:
            return resp(400, {'error': 'Сначала создайте род'})
        result = invite_by_email(str(clan['id']), user_id, email)
        if 'error' in result:
            return resp(400, result)
        return resp(201, result)

    if method == 'POST' and action == 'accept':
        body = json.loads(event.get('body', '{}'))
        invite_id = body.get('invite_id')
        if not invite_id:
            return resp(400, {'error': 'Не указан invite_id'})
        ok = accept_invite(invite_id, family_id)
        if not ok:
            return resp(404, {'error': 'Приглашение не найдено'})
        return resp(200, {'success': True})

    if method == 'POST' and action == 'decline':
        body = json.loads(event.get('body', '{}'))
        invite_id = body.get('invite_id')
        if not invite_id:
            return resp(400, {'error': 'Не указан invite_id'})
        ok = decline_invite(invite_id, family_id)
        if not ok:
            return resp(404, {'error': 'Приглашение не найдено'})
        return resp(200, {'success': True})

    return resp(405, {'error': 'Метод не поддерживается'})
