"""Получение, отправка и модерация отзывов пользователей"""

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def escape_string(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Token',
        'Content-Type': 'application/json'
    }


def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(body, default=str, ensure_ascii=False)
    }


def is_admin(event):
    headers = event.get('headers') or {}
    token = headers.get('x-admin-token') or headers.get('X-Admin-Token')
    return token == 'admin_authenticated'


def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        return get_feedback(event)
    elif method == 'POST':
        return create_feedback(event)
    elif method == 'PUT':
        return update_feedback(event)
    elif method == 'DELETE':
        return delete_feedback(event)

    return response(405, {'error': 'Method not allowed'})


def get_feedback(event):
    params = event.get('queryStringParameters') or {}
    feedback_type = params.get('type', 'review')
    all_statuses = params.get('all_statuses', 'false') == 'true'

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if all_statuses and is_admin(event):
        cur.execute(f"""
            SELECT id, type, user_name, user_email, title, description, rating, status, created_at, user_id
            FROM {SCHEMA}.feedback
            WHERE type = {escape_string(feedback_type)}
            ORDER BY created_at DESC
        """)
    else:
        cur.execute(f"""
            SELECT id, user_name, title, description, rating, created_at
            FROM {SCHEMA}.feedback
            WHERE type = {escape_string(feedback_type)} AND status = 'new'
            ORDER BY created_at DESC
        """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return response(200, {'items': [dict(r) for r in rows]})


def create_feedback(event):
    body = json.loads(event.get('body', '{}'))

    required = ['title', 'description']
    for field in required:
        if not body.get(field):
            return response(400, {'error': f'Поле {field} обязательно'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.feedback (type, user_name, user_email, title, description, rating, user_id)
        VALUES (
            {escape_string(body.get('type', 'review'))},
            {escape_string(body.get('user_name', 'Гость'))},
            {escape_string(body.get('user_email', ''))},
            {escape_string(body.get('title'))},
            {escape_string(body.get('description'))},
            {escape_string(body.get('rating', 5))},
            {escape_string(body.get('user_id', 'guest'))}
        )
        RETURNING id, user_name, title, description, rating, created_at
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    return response(201, dict(row))


def update_feedback(event):
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})

    body = json.loads(event.get('body', '{}'))
    feedback_id = body.get('id')
    new_status = body.get('status')

    if not feedback_id or not new_status:
        return response(400, {'error': 'Укажите id и status'})

    if new_status not in ('new', 'in_progress', 'resolved'):
        return response(400, {'error': 'Некорректный статус'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.feedback
        SET status = {escape_string(new_status)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = {int(feedback_id)}
        RETURNING id, status
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return response(404, {'error': 'Отзыв не найден'})

    return response(200, dict(row))


def delete_feedback(event):
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})

    params = event.get('queryStringParameters') or {}
    feedback_id = params.get('id')

    if not feedback_id:
        return response(400, {'error': 'Укажите id'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.feedback
        SET status = 'resolved', updated_at = CURRENT_TIMESTAMP
        WHERE id = {int(feedback_id)}
        RETURNING id
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return response(404, {'error': 'Отзыв не найден'})

    return response(200, {'success': True})
