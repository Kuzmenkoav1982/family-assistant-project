"""
Business: CRUD семейных традиций. GET — список традиций семьи, PUT /sync — полная замена списка.
После sync запускает portfolio-collect для всех участников семьи.
Args: X-User-Id header для определения family_id
Returns: JSON {traditions: [...]} или {synced: int}
"""

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def esc(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def ok(body: Any, status: int = 200) -> Dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps(body, ensure_ascii=False, default=str)}


def err(status: int, msg: str) -> Dict:
    return {'statusCode': status, 'headers': cors_headers(), 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def get_user_id(event: Dict) -> str:
    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    uid = headers.get('x-user-id') or headers.get('x-authorization')
    return str(uid).strip() if uid else ''


def get_family_id(user_id: str, cur) -> str:
    cur.execute(f"""
        SELECT family_id FROM {SCHEMA}.family_members
        WHERE user_id = {esc(user_id)}::uuid LIMIT 1
    """)
    row = cur.fetchone()
    return str(row['family_id']) if row and row.get('family_id') else ''


def get_family_member_ids(family_id: str, cur) -> List[str]:
    cur.execute(f"""
        SELECT id FROM {SCHEMA}.family_members
        WHERE family_id = {esc(family_id)}::uuid
    """)
    return [str(r['id']) for r in cur.fetchall()]


def row_to_tradition(row: Dict) -> Dict:
    return {
        'id': str(row['id']),
        'name': row.get('title') or '',
        'title': row.get('title') or '',
        'description': row.get('description') or '',
        'icon': row.get('icon') or '✨',
        'frequency': row.get('frequency') or 'monthly',
        'nextDate': row.get('next_date') or '',
        'participants': json.loads(row.get('participants_text') or '[]'),
        'isActive': row.get('is_active', True),
        'createdAt': str(row['created_at']) if row.get('created_at') else '',
    }


def handle_get(family_id: str, cur) -> Dict:
    cur.execute(f"""
        SELECT id, title, description, icon, frequency, next_date, participants_text, is_active, created_at
        FROM {SCHEMA}.traditions
        WHERE family_uuid = {esc(family_id)}::uuid AND is_active = TRUE
        ORDER BY created_at ASC
    """)
    rows = cur.fetchall()
    return ok({'traditions': [row_to_tradition(r) for r in rows]})


def handle_sync(family_id: str, items: List[Dict], cur) -> Dict:
    cur.execute(f"""
        UPDATE {SCHEMA}.traditions
        SET is_active = FALSE, updated_at = NOW()
        WHERE family_uuid = {esc(family_id)}::uuid
    """)

    now = datetime.now(timezone.utc).isoformat()
    synced = 0
    for item in items:
        title = str(item.get('name') or item.get('title') or '').strip()
        if not title:
            continue
        description = str(item.get('description') or '')
        icon = str(item.get('icon') or '✨')
        frequency = str(item.get('frequency') or 'monthly')
        next_date = str(item.get('nextDate') or '')
        participants_raw = item.get('participants') or []
        participants_text = json.dumps(participants_raw, ensure_ascii=False)

        cur.execute(f"""
            INSERT INTO {SCHEMA}.traditions
                (family_uuid, title, description, icon, frequency, next_date, participants_text, is_active, created_at, updated_at)
            VALUES
                ({esc(family_id)}::uuid, {esc(title)}, {esc(description)}, {esc(icon)}, {esc(frequency)},
                 {esc(next_date) if next_date else 'NULL'}, {esc(participants_text)}, TRUE, {esc(now)}, {esc(now)})
        """)
        synced += 1

    return ok({'synced': synced, 'family_id': family_id})


def trigger_portfolio_collect(family_id: str, cur):
    member_ids = get_family_member_ids(family_id, cur)
    cur.execute(f"""
        SELECT id, created_at FROM {SCHEMA}.traditions
        WHERE family_uuid = {esc(family_id)}::uuid AND is_active = TRUE
    """)
    rows = cur.fetchall()
    count = len(rows)
    if count == 0:
        return
    last_date = max(
        (r.get('created_at') for r in rows if r.get('created_at')),
        default=datetime.now(timezone.utc)
    )
    for mid in member_ids:
        try:
            cur.execute(f"""
                DELETE FROM {SCHEMA}.member_portfolio_metrics
                WHERE member_id = {esc(mid)}::uuid
                  AND source_type = 'traditions'
                  AND source_id = {esc('agg_' + family_id)}
                  AND metric_key = 'family_rituals'
            """)
            cur.execute(f"""
                INSERT INTO {SCHEMA}.member_portfolio_metrics
                    (member_id, sphere_key, metric_key, metric_value, metric_unit,
                     source_type, source_id, measured_at, raw_value)
                VALUES
                    ({esc(mid)}::uuid, 'values', 'family_rituals', {float(count)}, 'count',
                     'traditions', {esc('agg_' + family_id)},
                     {esc(str(last_date))}::timestamp, {esc(str(count) + ' традиций')})
            """)
        except Exception:
            pass


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Семейные традиции: GET — список, PUT — полная синхронизация."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    user_id = get_user_id(event)
    if not user_id:
        return err(401, 'X-User-Id required')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        family_id = get_family_id(user_id, cur)
        if not family_id:
            return err(403, 'family not found for user')

        if method == 'GET':
            return handle_get(family_id, cur)

        if method == 'PUT':
            body_raw = event.get('body') or '{}'
            body = json.loads(body_raw) if isinstance(body_raw, str) else body_raw
            items = body.get('items') or []
            result = handle_sync(family_id, items, cur)
            trigger_portfolio_collect(family_id, cur)
            return result

        return err(405, 'method not allowed')
    except Exception as e:
        return err(500, str(e))
    finally:
        cur.close()
        conn.close()