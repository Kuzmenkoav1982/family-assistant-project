import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
CORS = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

def handler(event: dict, context) -> dict:
    """API для управления геозонами и настройками уведомлений"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {'statusCode': 500, 'headers': CORS, 'body': json.dumps({'error': 'DATABASE_URL not configured'})}

    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    try:
        family_id = None
        if auth_token:
            family_id = get_family_id(conn, auth_token)

        if method == 'GET':
            return get_geofences(conn, family_id)
        elif method == 'POST':
            return create_geofence(conn, event)
        elif method == 'PUT':
            return update_alert_settings(conn, event, family_id)
        elif method == 'DELETE':
            return delete_geofence(conn, event)
        else:
            return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        conn.close()


def get_family_id(conn, auth_token: str):
    with conn.cursor() as cur:
        cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()", (auth_token,))
        row = cur.fetchone()
        if not row:
            return None
        cur.execute(f"SELECT family_id FROM {SCHEMA}.family_members WHERE user_id = %s LIMIT 1", (str(row[0]),))
        frow = cur.fetchone()
        return str(frow[0]) if frow else None


def get_geofences(conn, family_id: str = None) -> dict:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f'''
            SELECT id, name, center_lat, center_lng, radius, color, created_at
            FROM {SCHEMA}.geofences ORDER BY created_at DESC
        ''')
        geofences = cur.fetchall()

        alert_settings = []
        if family_id:
            cur.execute(f'''
                SELECT member_id, alerts_enabled, notify_members
                FROM {SCHEMA}.geofence_alert_settings
                WHERE family_id = %s
            ''', (family_id,))
            alert_settings = [dict(r) for r in cur.fetchall()]

        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({
                'geofences': [dict(g) for g in geofences],
                'alert_settings': alert_settings
            }, default=str)
        }


def create_geofence(conn, event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    name = data.get('name')
    center_lat = data.get('center_lat')
    center_lng = data.get('center_lng')
    radius = data.get('radius', 500)
    color = data.get('color', '#9333EA')

    if not all([name, center_lat, center_lng]):
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Missing required fields'})}

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(f'''
            INSERT INTO {SCHEMA}.geofences (name, center_lat, center_lng, radius, color)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, name, center_lat, center_lng, radius, color, created_at
        ''', (name, center_lat, center_lng, radius, color))
        new_zone = cur.fetchone()

        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(dict(new_zone), default=str)}


def update_alert_settings(conn, event: dict, family_id: str = None) -> dict:
    if not family_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Требуется авторизация'})}

    data = json.loads(event.get('body', '{}'))
    settings = data.get('settings', [])

    with conn.cursor() as cur:
        for s in settings:
            member_id = s.get('member_id')
            alerts_enabled = s.get('alerts_enabled', True)
            notify_members = json.dumps(s.get('notify_members', []))

            if not member_id:
                continue

            cur.execute(f'''
                INSERT INTO {SCHEMA}.geofence_alert_settings (family_id, member_id, alerts_enabled, notify_members, updated_at)
                VALUES (%s, %s, %s, %s::jsonb, NOW())
                ON CONFLICT (family_id, member_id) 
                DO UPDATE SET alerts_enabled = %s, notify_members = %s::jsonb, updated_at = NOW()
            ''', (family_id, member_id, alerts_enabled, notify_members, alerts_enabled, notify_members))

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'success': True})}


def delete_geofence(conn, event: dict) -> dict:
    zone_id = (event.get('queryStringParameters') or {}).get('id')
    if not zone_id:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Missing zone id'})}

    with conn.cursor() as cur:
        cur.execute(f'DELETE FROM {SCHEMA}.geofences WHERE id = %s', (zone_id,))
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'success': True})}
