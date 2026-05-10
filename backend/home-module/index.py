"""Модуль «Дом» Семейной ОС: квартира, коммуналка, показания счётчиков, ремонты."""

import json
import os
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Access-Control-Max-Age': '86400',
}


def respond(status: int, body: Any) -> Dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str, ensure_ascii=False),
    }


def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def esc(value: Any) -> str:
    if value is None or value == '':
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def verify_token(token: str) -> Optional[str]:
    """Возвращает user_id по токену сессии."""
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT user_id FROM {SCHEMA}.sessions "
            f"WHERE token = {esc(token)} AND expires_at > CURRENT_TIMESTAMP"
        )
        row = cur.fetchone()
        return str(row['user_id']) if row else None
    finally:
        cur.close()
        conn.close()


def get_family_id(user_id: str) -> Optional[str]:
    """Возвращает family_id, к которой принадлежит пользователь."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT family_id FROM {SCHEMA}.family_members "
            f"WHERE user_id::text = {esc(user_id)} LIMIT 1"
        )
        row = cur.fetchone()
        return str(row['family_id']) if row and row['family_id'] else None
    finally:
        cur.close()
        conn.close()


# ─────────────────────────────────────────────────────────────
# APARTMENT (одна запись на семью)
# ─────────────────────────────────────────────────────────────

def get_apartment(family_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT family_id, address, area, rooms, ownership, notes, "
            f"created_at, updated_at FROM {SCHEMA}.home_apartment "
            f"WHERE family_id::text = {esc(family_id)}"
        )
        row = cur.fetchone()
        if not row:
            return {
                'address': '', 'area': None, 'rooms': None,
                'ownership': None, 'notes': None,
            }
        return dict(row)
    finally:
        cur.close()
        conn.close()


def upsert_apartment(family_id: str, data: Dict) -> Dict:
    address = data.get('address', '') or ''
    area = data.get('area')
    rooms = data.get('rooms')
    ownership = data.get('ownership') or None
    notes = data.get('notes') or None

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}.home_apartment "
            f"(family_id, address, area, rooms, ownership, notes) "
            f"VALUES ({esc(family_id)}, {esc(address)}, {esc(area)}, "
            f"{esc(rooms)}, {esc(ownership)}, {esc(notes)}) "
            f"ON CONFLICT (family_id) DO UPDATE SET "
            f"address = EXCLUDED.address, area = EXCLUDED.area, "
            f"rooms = EXCLUDED.rooms, ownership = EXCLUDED.ownership, "
            f"notes = EXCLUDED.notes, updated_at = CURRENT_TIMESTAMP "
            f"RETURNING family_id, address, area, rooms, ownership, notes, "
            f"created_at, updated_at"
        )
        row = cur.fetchone()
        return dict(row)
    finally:
        cur.close()
        conn.close()


# ─────────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────────

def list_utilities(family_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT id, name, amount, due_date, paid, created_at, updated_at "
            f"FROM {SCHEMA}.home_utilities "
            f"WHERE family_id::text = {esc(family_id)} "
            f"ORDER BY paid ASC, due_date ASC NULLS LAST, created_at DESC"
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def create_utility(family_id: str, data: Dict) -> Dict:
    name = data.get('name', '').strip()
    if not name:
        raise ValueError('name is required')
    amount = data.get('amount', 0)
    due_date = data.get('due_date') or None
    paid = bool(data.get('paid', False))

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}.home_utilities "
            f"(family_id, name, amount, due_date, paid) "
            f"VALUES ({esc(family_id)}, {esc(name)}, {esc(amount)}, "
            f"{esc(due_date)}, {esc(paid)}) "
            f"RETURNING id, name, amount, due_date, paid, created_at, updated_at"
        )
        return dict(cur.fetchone())
    finally:
        cur.close()
        conn.close()


def update_utility(family_id: str, util_id: str, data: Dict) -> Optional[Dict]:
    fields = []
    if 'name' in data:
        fields.append(f"name = {esc(data['name'])}")
    if 'amount' in data:
        fields.append(f"amount = {esc(data['amount'])}")
    if 'due_date' in data:
        fields.append(f"due_date = {esc(data['due_date'] or None)}")
    if 'paid' in data:
        fields.append(f"paid = {esc(bool(data['paid']))}")
    if not fields:
        return None
    fields.append("updated_at = CURRENT_TIMESTAMP")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"UPDATE {SCHEMA}.home_utilities SET {', '.join(fields)} "
            f"WHERE id::text = {esc(util_id)} AND family_id::text = {esc(family_id)} "
            f"RETURNING id, name, amount, due_date, paid, created_at, updated_at"
        )
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        cur.close()
        conn.close()


def delete_utility(family_id: str, util_id: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            f"DELETE FROM {SCHEMA}.home_utilities "
            f"WHERE id::text = {esc(util_id)} AND family_id::text = {esc(family_id)}"
        )
        return cur.rowcount > 0
    finally:
        cur.close()
        conn.close()


# ─────────────────────────────────────────────────────────────
# METERS
# ─────────────────────────────────────────────────────────────

def list_meters(family_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT id, meter_type, reading_date, value, note, created_at "
            f"FROM {SCHEMA}.home_meters "
            f"WHERE family_id::text = {esc(family_id)} "
            f"ORDER BY reading_date DESC, created_at DESC"
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def create_meter(family_id: str, data: Dict) -> Dict:
    meter_type = data.get('meter_type', '').strip()
    if not meter_type:
        raise ValueError('meter_type is required')
    reading_date = data.get('reading_date')
    if not reading_date:
        raise ValueError('reading_date is required')
    value = data.get('value')
    if value is None:
        raise ValueError('value is required')
    note = data.get('note') or None

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}.home_meters "
            f"(family_id, meter_type, reading_date, value, note) "
            f"VALUES ({esc(family_id)}, {esc(meter_type)}, {esc(reading_date)}, "
            f"{esc(value)}, {esc(note)}) "
            f"RETURNING id, meter_type, reading_date, value, note, created_at"
        )
        return dict(cur.fetchone())
    finally:
        cur.close()
        conn.close()


def delete_meter(family_id: str, meter_id: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            f"DELETE FROM {SCHEMA}.home_meters "
            f"WHERE id::text = {esc(meter_id)} AND family_id::text = {esc(family_id)}"
        )
        return cur.rowcount > 0
    finally:
        cur.close()
        conn.close()


# ─────────────────────────────────────────────────────────────
# REPAIRS
# ─────────────────────────────────────────────────────────────

def list_repairs(family_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT id, title, status, priority, estimate_rub, notes, "
            f"created_at, updated_at FROM {SCHEMA}.home_repairs "
            f"WHERE family_id::text = {esc(family_id)} "
            f"ORDER BY "
            f"CASE status WHEN 'in-progress' THEN 0 WHEN 'planned' THEN 1 ELSE 2 END, "
            f"CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, "
            f"created_at DESC"
        )
        return [dict(r) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()


def create_repair(family_id: str, data: Dict) -> Dict:
    title = data.get('title', '').strip()
    if not title:
        raise ValueError('title is required')
    status = data.get('status', 'planned')
    priority = data.get('priority', 'medium')
    estimate_rub = data.get('estimate_rub')
    notes = data.get('notes') or None

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}.home_repairs "
            f"(family_id, title, status, priority, estimate_rub, notes) "
            f"VALUES ({esc(family_id)}, {esc(title)}, {esc(status)}, "
            f"{esc(priority)}, {esc(estimate_rub)}, {esc(notes)}) "
            f"RETURNING id, title, status, priority, estimate_rub, notes, "
            f"created_at, updated_at"
        )
        return dict(cur.fetchone())
    finally:
        cur.close()
        conn.close()


def update_repair(family_id: str, repair_id: str, data: Dict) -> Optional[Dict]:
    fields = []
    if 'title' in data:
        fields.append(f"title = {esc(data['title'])}")
    if 'status' in data:
        fields.append(f"status = {esc(data['status'])}")
    if 'priority' in data:
        fields.append(f"priority = {esc(data['priority'])}")
    if 'estimate_rub' in data:
        fields.append(f"estimate_rub = {esc(data['estimate_rub'])}")
    if 'notes' in data:
        fields.append(f"notes = {esc(data['notes'])}")
    if not fields:
        return None
    fields.append("updated_at = CURRENT_TIMESTAMP")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"UPDATE {SCHEMA}.home_repairs SET {', '.join(fields)} "
            f"WHERE id::text = {esc(repair_id)} AND family_id::text = {esc(family_id)} "
            f"RETURNING id, title, status, priority, estimate_rub, notes, "
            f"created_at, updated_at"
        )
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        cur.close()
        conn.close()


def delete_repair(family_id: str, repair_id: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            f"DELETE FROM {SCHEMA}.home_repairs "
            f"WHERE id::text = {esc(repair_id)} AND family_id::text = {esc(family_id)}"
        )
        return cur.rowcount > 0
    finally:
        cur.close()
        conn.close()


# ─────────────────────────────────────────────────────────────
# AGGREGATE: всё одним запросом
# ─────────────────────────────────────────────────────────────

def get_all(family_id: str) -> Dict:
    return {
        'apartment': get_apartment(family_id),
        'utilities': list_utilities(family_id),
        'meters': list_meters(family_id),
        'repairs': list_repairs(family_id),
    }


# ─────────────────────────────────────────────────────────────
# HANDLER
# ─────────────────────────────────────────────────────────────

def handler(event: Dict, context) -> Dict:
    """
    Backend модуля «Дом» Семейной ОС.
    Управляет квартирой, коммунальными платежами, показаниями счётчиков и ремонтами.
    Все данные изолированы по family_id (пользователь видит только свою семью).
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    # Поддержка обоих регистров
    token = (
        headers.get('X-Auth-Token')
        or headers.get('x-auth-token')
        or headers.get('X-AUTH-TOKEN')
        or ''
    )

    user_id = verify_token(token)
    if not user_id:
        return respond(401, {'error': 'unauthorized'})

    family_id = get_family_id(user_id)
    if not family_id:
        return respond(403, {'error': 'no family'})

    params = event.get('queryStringParameters') or {}
    resource = (params.get('resource') or 'all').lower()

    try:
        # ───── GET ─────
        if method == 'GET':
            if resource == 'all':
                return respond(200, get_all(family_id))
            if resource == 'apartment':
                return respond(200, get_apartment(family_id))
            if resource == 'utilities':
                return respond(200, {'items': list_utilities(family_id)})
            if resource == 'meters':
                return respond(200, {'items': list_meters(family_id)})
            if resource == 'repairs':
                return respond(200, {'items': list_repairs(family_id)})
            return respond(400, {'error': 'unknown resource'})

        # ───── POST / PUT / DELETE ─────
        body_raw = event.get('body') or '{}'
        try:
            body = json.loads(body_raw) if isinstance(body_raw, str) else body_raw
        except json.JSONDecodeError:
            return respond(400, {'error': 'invalid json'})

        if method == 'POST':
            if resource == 'apartment':
                return respond(200, upsert_apartment(family_id, body))
            if resource == 'utilities':
                return respond(201, create_utility(family_id, body))
            if resource == 'meters':
                return respond(201, create_meter(family_id, body))
            if resource == 'repairs':
                return respond(201, create_repair(family_id, body))
            return respond(400, {'error': 'unknown resource'})

        if method == 'PUT':
            item_id = params.get('id')
            if not item_id:
                return respond(400, {'error': 'id is required'})
            if resource == 'utilities':
                row = update_utility(family_id, item_id, body)
                return respond(200, row) if row else respond(404, {'error': 'not found'})
            if resource == 'repairs':
                row = update_repair(family_id, item_id, body)
                return respond(200, row) if row else respond(404, {'error': 'not found'})
            return respond(400, {'error': 'resource not updatable'})

        if method == 'DELETE':
            item_id = params.get('id')
            if not item_id:
                return respond(400, {'error': 'id is required'})
            if resource == 'utilities':
                ok = delete_utility(family_id, item_id)
                return respond(200, {'success': ok}) if ok else respond(404, {'error': 'not found'})
            if resource == 'meters':
                ok = delete_meter(family_id, item_id)
                return respond(200, {'success': ok}) if ok else respond(404, {'error': 'not found'})
            if resource == 'repairs':
                ok = delete_repair(family_id, item_id)
                return respond(200, {'success': ok}) if ok else respond(404, {'error': 'not found'})
            return respond(400, {'error': 'resource not deletable'})

        return respond(405, {'error': 'method not allowed'})

    except ValueError as e:
        return respond(400, {'error': str(e)})
    except Exception as e:
        return respond(500, {'error': 'server error', 'detail': str(e)})
