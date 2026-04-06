"""Получение и отправка отзывов пользователей"""

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json'
    }


def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(body, default=str, ensure_ascii=False)
    }


def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        return get_feedback(event)
    elif method == 'POST':
        return create_feedback(event)

    return response(405, {'error': 'Method not allowed'})


def get_feedback(event):
    params = event.get('queryStringParameters') or {}
    feedback_type = params.get('type', 'review')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
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
