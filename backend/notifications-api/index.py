"""API центра уведомлений — список, прочитать, счётчик непрочитанных"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'

def escape(value: Any) -> str:
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def get_user_from_token(cur, token: str) -> dict:
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = '{escape(token)}' AND expires_at > NOW()")
    session = cur.fetchone()
    if not session:
        return None
    user_id = str(session['user_id'])
    cur.execute(f"SELECT family_id FROM {SCHEMA}.family_members WHERE user_id = '{escape(user_id)}' LIMIT 1")
    member = cur.fetchone()
    return {'user_id': user_id, 'family_id': member['family_id'] if member else None}

def resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Центр уведомлений — просмотр, отметка прочитано, счётчик"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return resp(401, {'error': 'Требуется авторизация'})

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return resp(500, {'error': 'Database not configured'})

    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    user = get_user_from_token(cur, token)
    if not user:
        cur.close()
        conn.close()
        return resp(401, {'error': 'Недействительная сессия'})

    user_id = user['user_id']

    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action', 'list')

        if action == 'count':
            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.notifications
                WHERE user_id = '{escape(user_id)}' AND status != 'read'
            """)
            row = cur.fetchone()
            cur.close()
            conn.close()
            return resp(200, {'success': True, 'count': row['cnt']})

        limit = min(int(params.get('limit', '50')), 100)
        offset = int(params.get('offset', '0'))
        n_type = params.get('type')

        type_filter = f"AND type = '{escape(n_type)}'" if n_type else ""

        cur.execute(f"""
            SELECT id, type, title, message, target_url, channel, status, sent_at, read_at, created_at
            FROM {SCHEMA}.notifications
            WHERE user_id = '{escape(user_id)}' {type_filter}
            ORDER BY created_at DESC
            LIMIT {limit} OFFSET {offset}
        """)
        notifications = cur.fetchall()

        cur.execute(f"""
            SELECT COUNT(*) as cnt FROM {SCHEMA}.notifications
            WHERE user_id = '{escape(user_id)}' AND status != 'read'
        """)
        unread = cur.fetchone()['cnt']

        cur.close()
        conn.close()
        return resp(200, {
            'success': True,
            'notifications': [dict(n) for n in notifications],
            'unread_count': unread
        })

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')

        if action == 'mark_read':
            notification_id = body.get('id')
            if notification_id:
                cur.execute(f"""
                    UPDATE {SCHEMA}.notifications SET status = 'read', read_at = NOW()
                    WHERE id = '{escape(notification_id)}' AND user_id = '{escape(user_id)}'
                """)
            conn.commit()
            cur.close()
            conn.close()
            return resp(200, {'success': True})

        if action == 'mark_all_read':
            cur.execute(f"""
                UPDATE {SCHEMA}.notifications SET status = 'read', read_at = NOW()
                WHERE user_id = '{escape(user_id)}' AND status != 'read'
            """)
            conn.commit()
            cur.close()
            conn.close()
            return resp(200, {'success': True})

        cur.close()
        conn.close()
        return resp(400, {'error': 'Unknown action'})

    cur.close()
    conn.close()
    return resp(405, {'error': 'Method not allowed'})
