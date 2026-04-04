"""
Управление семейным древом — получение, добавление, редактирование, удаление членов рода
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def escape_string(value: Any) -> str:
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
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Family-Id',
        'Content-Type': 'application/json'
    }


def response(status_code: int, body: Any) -> dict:
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(body, default=str, ensure_ascii=False)
    }


def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = {escape_string(token)} AND expires_at > CURRENT_TIMESTAMP
    """)
    session = cur.fetchone()
    cur.close()
    conn.close()
    return str(session['user_id']) if session else None


def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """)
    member = cur.fetchone()
    cur.close()
    conn.close()
    return str(member['family_id']) if member and member['family_id'] else None


def get_tree(family_id: str) -> List[Dict]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT id, family_id, name, relation, birth_year, death_year, 
               bio, photo_url, parent_id, spouse_id, gender, 
               birth_date, death_date, occupation, avatar,
               created_at, updated_at
        FROM {SCHEMA}.family_tree
        WHERE family_id::text = {escape_string(family_id)}
        ORDER BY COALESCE(birth_year, 9999), created_at
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def add_member(family_id: str, data: Dict) -> Dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.family_tree 
            (family_id, name, relation, birth_year, death_year, bio, photo_url, 
             parent_id, spouse_id, gender, birth_date, death_date, occupation, avatar)
        VALUES (
            {escape_string(family_id)},
            {escape_string(data.get('name'))},
            {escape_string(data.get('relation'))},
            {escape_string(data.get('birth_year'))},
            {escape_string(data.get('death_year'))},
            {escape_string(data.get('bio'))},
            {escape_string(data.get('photo_url'))},
            {escape_string(data.get('parent_id'))},
            {escape_string(data.get('spouse_id'))},
            {escape_string(data.get('gender'))},
            {escape_string(data.get('birth_date'))},
            {escape_string(data.get('death_date'))},
            {escape_string(data.get('occupation'))},
            {escape_string(data.get('avatar', '👤'))}
        )
        RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row)


def update_member(family_id: str, member_id: str, data: Dict) -> Optional[Dict]:
    fields = []
    allowed = ['name', 'relation', 'birth_year', 'death_year', 'bio', 'photo_url',
               'parent_id', 'spouse_id', 'gender', 'birth_date', 'death_date', 'occupation', 'avatar']
    for key in allowed:
        if key in data:
            fields.append(f"{key} = {escape_string(data[key])}")
    
    if not fields:
        return None
    
    fields.append("updated_at = CURRENT_TIMESTAMP")
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.family_tree 
        SET {', '.join(fields)}
        WHERE id::text = {escape_string(member_id)} 
          AND family_id::text = {escape_string(family_id)}
        RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


def delete_member(family_id: str, member_id: str) -> bool:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.family_tree SET parent_id = NULL 
        WHERE parent_id::text = {escape_string(member_id)} 
          AND family_id::text = {escape_string(family_id)}
    """)
    cur.execute(f"""
        UPDATE {SCHEMA}.family_tree SET spouse_id = NULL 
        WHERE spouse_id::text = {escape_string(member_id)} 
          AND family_id::text = {escape_string(family_id)}
    """)
    cur.execute(f"""
        DELETE FROM {SCHEMA}.family_tree 
        WHERE id::text = {escape_string(member_id)} 
          AND family_id::text = {escape_string(family_id)}
    """)
    deleted = cur.rowcount > 0
    cur.close()
    conn.close()
    return deleted


def handler(event: dict, context) -> dict:
    """Управление семейным древом — CRUD операции с членами рода"""
    
    if event.get('httpMethod') == 'OPTIONS':
        return response(200, '')

    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    if not token:
        return response(401, {'error': 'Требуется авторизация'})

    user_id = verify_token(token)
    if not user_id:
        return response(401, {'error': 'Недействительный токен'})

    family_id = get_user_family_id(user_id)
    if not family_id:
        return response(404, {'error': 'Семья не найдена'})

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        tree = get_tree(family_id)
        return response(200, {'members': tree, 'total': len(tree)})

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        if not body.get('name'):
            return response(400, {'error': 'Имя обязательно'})
        member = add_member(family_id, body)
        return response(201, {'member': member})

    if method == 'PUT':
        member_id = params.get('id')
        if not member_id:
            return response(400, {'error': 'Не указан id члена'})
        body = json.loads(event.get('body', '{}'))
        member = update_member(family_id, member_id, body)
        if not member:
            return response(404, {'error': 'Член древа не найден'})
        return response(200, {'member': member})

    if method == 'DELETE':
        member_id = params.get('id')
        if not member_id:
            return response(400, {'error': 'Не указан id члена'})
        deleted = delete_member(family_id, member_id)
        if not deleted:
            return response(404, {'error': 'Член древа не найден'})
        return response(200, {'success': True})

    return response(405, {'error': 'Метод не поддерживается'})
