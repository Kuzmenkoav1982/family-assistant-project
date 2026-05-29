"""
Управление заявками на привязку участника семьи к узлу в семейном древе.
Actions: create, list, review (approve/link/postpone/reject)
"""

import json
import os
from datetime import datetime
from typing import Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


def q(v: Any) -> str:
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def get_member(cur, token: str) -> Optional[dict]:
    cur.execute(f"""
        SELECT fm.id, fm.family_id, fm.user_id, fm.role, fm.name,
               u.email, u.name as user_name
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON u.id = s.user_id
        JOIN {SCHEMA}.family_members fm ON fm.user_id = u.id
        WHERE s.token = {q(token)} AND s.expires_at > NOW()
        LIMIT 1
    """)
    return cur.fetchone()


def create_request(member: dict, body: dict) -> dict:
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Проверяем нет ли уже активной заявки от этого участника
        cur.execute(f"""
            SELECT id FROM {SCHEMA}.tree_link_requests
            WHERE family_id = {q(member['family_id'])}
              AND user_id = {q(member['user_id'])}
              AND status = 'pending'
            LIMIT 1
        """)
        existing = cur.fetchone()
        if existing:
            # Обновляем существующую
            cur.execute(f"""
                UPDATE {SCHEMA}.tree_link_requests
                SET requested_role = {q(body.get('requested_role'))},
                    action_type    = {q(body.get('action_type', 'create_new_person'))},
                    note           = {q(body.get('note'))},
                    updated_at     = NOW()
                WHERE id = {q(existing['id'])}
                RETURNING id
            """)
            req = cur.fetchone()
            conn.commit()
            return {'success': True, 'request_id': str(req['id']), 'updated': True}

        cur.execute(f"""
            INSERT INTO {SCHEMA}.tree_link_requests
                (family_id, user_id, member_id, requested_role, action_type, note, status)
            VALUES
                ({q(member['family_id'])}, {q(member['user_id'])}, {q(member['id'])},
                 {q(body.get('requested_role'))}, {q(body.get('action_type', 'create_new_person'))},
                 {q(body.get('note'))}, 'pending')
            RETURNING id
        """)
        req = cur.fetchone()
        conn.commit()
        cur.close(); conn.close()
        return {'success': True, 'request_id': str(req['id'])}
    except Exception as e:
        conn.rollback()
        cur.close(); conn.close()
        return {'error': str(e)}


def list_requests(member: dict, status_filter: Optional[str]) -> dict:
    """Список заявок для владельца/админа семьи"""
    if member['role'] not in ('Владелец', 'Администратор'):
        return {'error': 'Недостаточно прав'}

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        where_status = f"AND r.status = {q(status_filter)}" if status_filter else ""
        cur.execute(f"""
            SELECT r.id, r.user_id, r.member_id, r.requested_role, r.action_type,
                   r.status, r.note, r.created_at,
                   u.email, u.name as user_name,
                   fm.name as member_name, fm.avatar
            FROM {SCHEMA}.tree_link_requests r
            JOIN {SCHEMA}.users u ON u.id = r.user_id
            JOIN {SCHEMA}.family_members fm ON fm.id = r.member_id
            WHERE r.family_id = {q(member['family_id'])} {where_status}
            ORDER BY r.created_at DESC
        """)
        rows = cur.fetchall()
        cur.close(); conn.close()
        return {
            'success': True,
            'requests': [
                {**dict(row),
                 'id': str(row['id']),
                 'user_id': str(row['user_id']),
                 'member_id': str(row['member_id']),
                 'created_at': row['created_at'].isoformat() if row['created_at'] else None}
                for row in rows
            ]
        }
    except Exception as e:
        cur.close(); conn.close()
        return {'error': str(e)}


def review_request(member: dict, body: dict) -> dict:
    """Обработка заявки владельцем: link / create / postpone / reject"""
    if member['role'] not in ('Владелец', 'Администратор'):
        return {'error': 'Недостаточно прав'}

    request_id = body.get('request_id')
    action = body.get('action')  # link | create | postpone | reject
    if not request_id or action not in ('link', 'create', 'postpone', 'reject'):
        return {'error': 'Укажите request_id и action (link|create|postpone|reject)'}

    status_map = {
        'link': 'linked',
        'create': 'created',
        'postpone': 'postponed',
        'reject': 'rejected',
    }

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            UPDATE {SCHEMA}.tree_link_requests
            SET status      = {q(status_map[action])},
                reviewed_by = {q(member['user_id'])},
                reviewed_at = NOW(),
                updated_at  = NOW()
            WHERE id = {q(request_id)}
              AND family_id = {q(member['family_id'])}
            RETURNING id, status
        """)
        updated = cur.fetchone()
        if not updated:
            conn.rollback(); cur.close(); conn.close()
            return {'error': 'Заявка не найдена'}
        conn.commit()
        cur.close(); conn.close()
        return {'success': True, 'id': str(updated['id']), 'status': updated['status']}
    except Exception as e:
        conn.rollback(); cur.close(); conn.close()
        return {'error': str(e)}


def handler(event: dict, context) -> dict:
    """Tree Link Requests — управление заявками на привязку к древу"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    token = (event.get('headers') or {}).get('X-Auth-Token', '')
    method = event.get('httpMethod', 'GET')

    conn0 = get_db()
    cur0 = conn0.cursor(cursor_factory=RealDictCursor)
    member = get_member(cur0, token)
    cur0.close(); conn0.close()

    if not member:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        body = {}

    params = event.get('queryStringParameters') or {}
    action = params.get('action') or body.get('action', '')

    if method == 'POST' and action == 'create':
        result = create_request(member, body)
    elif method == 'GET' and action == 'list':
        result = list_requests(member, params.get('status'))
    elif method == 'POST' and action == 'review':
        result = review_request(member, body)
    else:
        result = {'error': f'Неизвестное действие: {method} {action}'}

    status_code = 200 if result.get('success') else (403 if 'прав' in result.get('error', '') else 400)
    return {
        'statusCode': status_code,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False, default=str)
    }
