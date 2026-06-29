"""
Business: Фиксация и проверка согласия пользователя на обработку ПДн (152-ФЗ).
Args: event с httpMethod (GET/POST/OPTIONS), headers (X-Auth-Token), body (policy_version).
Returns: GET — текущий статус согласия; POST — фиксация согласия (user_id, версия, дата, IP, user-agent).
"""
import json
import os
import psycopg2

SCHEMA = 't_p5815085_family_assistant_pro'
CURRENT_POLICY_VERSION = '2026-06-30'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
}


def _resp(status, body):
    return {'statusCode': status, 'headers': CORS, 'isBase64Encoded': False,
            'body': json.dumps(body, ensure_ascii=False, default=str)}


def _get_user_id(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
            (token,),
        )
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def _client_ip(event):
    rc = event.get('requestContext') or {}
    ident = rc.get('identity') or {}
    return ident.get('sourceIp') or ''


def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'isBase64Encoded': False, 'body': ''}

    user_id = _get_user_id(event)
    if not user_id:
        return _resp(401, {'error': 'Не авторизован'})

    if method == 'GET':
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            cur = conn.cursor()
            cur.execute(
                f"""SELECT policy_version, accepted_at FROM {SCHEMA}.user_consents
                    WHERE user_id = %s AND consent_type = 'privacy_policy'
                      AND policy_version = %s
                    ORDER BY accepted_at DESC LIMIT 1""",
                (str(user_id), CURRENT_POLICY_VERSION),
            )
            row = cur.fetchone()
            return _resp(200, {
                'currentVersion': CURRENT_POLICY_VERSION,
                'accepted': bool(row),
                'acceptedAt': row[1] if row else None,
            })
        finally:
            conn.close()

    if method == 'POST':
        body = json.loads(event.get('body', '{}') or '{}')
        version = body.get('policyVersion') or CURRENT_POLICY_VERSION
        headers = event.get('headers', {})
        user_agent = headers.get('User-Agent') or headers.get('user-agent', '')
        ip = _client_ip(event)
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            cur = conn.cursor()
            cur.execute(
                f"""INSERT INTO {SCHEMA}.user_consents
                    (user_id, consent_type, policy_version, ip_address, user_agent)
                    VALUES (%s, 'privacy_policy', %s, %s, %s)
                    RETURNING id, accepted_at""",
                (str(user_id), version, ip[:64], user_agent),
            )
            row = cur.fetchone()
            conn.commit()
            return _resp(200, {'success': True, 'consentId': row[0], 'acceptedAt': row[1],
                               'policyVersion': version})
        finally:
            conn.close()

    return _resp(405, {'error': 'Method not allowed'})
