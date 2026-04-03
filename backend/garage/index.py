"""Управление гаражом семьи: автомобили, ТО, расходы, напоминания, заметки"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = {esc(token)} AND expires_at > CURRENT_TIMESTAMP")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['user_id']) if row else None


def get_family_id(user_id: str) -> Optional[str]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT family_id FROM {SCHEMA}.family_members WHERE user_id::text = {esc(user_id)} LIMIT 1")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['family_id']) if row and row['family_id'] else None


def get_member_name(user_id: str) -> str:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT name FROM {SCHEMA}.family_members WHERE user_id::text = {esc(user_id)} LIMIT 1")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row['name'] if row else 'Неизвестно'


# --- VEHICLES ---

def list_vehicles(family_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT v.*,
            (SELECT COUNT(*) FROM {SCHEMA}.garage_reminders r WHERE r.vehicle_id = v.id AND r.is_completed = FALSE AND r.due_date <= CURRENT_DATE + INTERVAL '7 days') AS urgent_reminders,
            (SELECT COALESCE(SUM(e.amount), 0) FROM {SCHEMA}.garage_expenses e WHERE e.vehicle_id = v.id) AS total_expenses
        FROM {SCHEMA}.garage_vehicles v
        WHERE v.family_id::text = {esc(family_id)}
        ORDER BY v.created_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def get_vehicle(family_id: str, vehicle_id: str) -> Optional[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT * FROM {SCHEMA}.garage_vehicles WHERE id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


DEFAULT_REMINDERS = [
    {'reminder_type': 'oil_change', 'title': 'Замена масла', 'description': 'Рекомендуется каждые 10 000 км или раз в год'},
    {'reminder_type': 'tire_change', 'title': 'Сезонная замена шин', 'description': 'Весна (март-апрель) и осень (октябрь-ноябрь)'},
    {'reminder_type': 'insurance', 'title': 'Продление ОСАГО', 'description': 'Проверьте срок действия полиса'},
    {'reminder_type': 'inspection', 'title': 'Техосмотр', 'description': 'Проверьте срок действия диагностической карты'},
    {'reminder_type': 'maintenance', 'title': 'Плановое ТО', 'description': 'Согласно регламенту производителя'},
]


def create_default_reminders(conn, family_id: str, vehicle_id: str):
    cur = conn.cursor()
    for r in DEFAULT_REMINDERS:
        rid = str(uuid.uuid4())
        cur.execute(f"""
            INSERT INTO {SCHEMA}.garage_reminders (id, vehicle_id, family_id, reminder_type, title, description)
            VALUES ({esc(rid)}::uuid, {esc(vehicle_id)}::uuid, {esc(family_id)}::uuid,
                    {esc(r['reminder_type'])}, {esc(r['title'])}, {esc(r['description'])})
        """)
    cur.close()


def create_vehicle(family_id: str, data: Dict) -> Dict:
    vid = str(uuid.uuid4())
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.garage_vehicles (id, family_id, name, make, model, year, color, license_plate, vin, mileage, photo_url, responsible_member_id, notes)
        VALUES ({esc(vid)}::uuid, {esc(family_id)}::uuid, {esc(data.get('name'))}, {esc(data.get('make'))}, {esc(data.get('model'))},
                {esc(data.get('year'))}, {esc(data.get('color'))}, {esc(data.get('license_plate'))}, {esc(data.get('vin'))},
                {esc(data.get('mileage', 0))}, {esc(data.get('photo_url'))},
                {'%s::uuid' % esc(data.get('responsible_member_id')) if data.get('responsible_member_id') else 'NULL'},
                {esc(data.get('notes'))})
        RETURNING *
    """)
    row = cur.fetchone()
    create_default_reminders(conn, family_id, vid)
    cur.close()
    conn.close()
    return dict(row)


def update_vehicle(family_id: str, vehicle_id: str, data: Dict) -> Dict:
    fields = []
    for f in ['name', 'make', 'model', 'year', 'color', 'license_plate', 'vin', 'mileage', 'photo_url', 'notes']:
        if f in data:
            fields.append(f"{f} = {esc(data[f])}")
    if 'responsible_member_id' in data:
        val = data['responsible_member_id']
        fields.append(f"responsible_member_id = {esc(val)}::uuid" if val else "responsible_member_id = NULL")
    if not fields:
        return {'error': 'Нет данных для обновления'}
    fields.append("updated_at = CURRENT_TIMESTAMP")
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.garage_vehicles SET {', '.join(fields)}
        WHERE id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)} RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {'error': 'Автомобиль не найден'}


def delete_vehicle(family_id: str, vehicle_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.garage_notes WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}")
    cur.execute(f"DELETE FROM {SCHEMA}.garage_reminders WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}")
    cur.execute(f"DELETE FROM {SCHEMA}.garage_expenses WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}")
    cur.execute(f"DELETE FROM {SCHEMA}.garage_service_records WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}")
    cur.execute(f"DELETE FROM {SCHEMA}.garage_vehicles WHERE id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}")
    cur.close()
    conn.close()
    return {'success': True}


# --- SERVICE RECORDS ---

def list_services(family_id: str, vehicle_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.garage_service_records
        WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}
        ORDER BY date DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def create_service(family_id: str, vehicle_id: str, user_id: str, data: Dict) -> Dict:
    sid = str(uuid.uuid4())
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.garage_service_records (id, vehicle_id, family_id, service_type, title, description, date, mileage, cost, service_station, parts_replaced, created_by)
        VALUES ({esc(sid)}::uuid, {esc(vehicle_id)}::uuid, {esc(family_id)}::uuid,
                {esc(data.get('service_type', 'maintenance'))}, {esc(data.get('title'))}, {esc(data.get('description'))},
                {esc(data.get('date'))}, {esc(data.get('mileage'))}, {esc(data.get('cost', 0))},
                {esc(data.get('service_station'))}, {esc(data.get('parts_replaced'))}, {esc(user_id)}::uuid)
        RETURNING *
    """)
    row = cur.fetchone()
    mileage = data.get('mileage')
    if mileage and int(mileage) > 0:
        cur.execute(f"""
            UPDATE {SCHEMA}.garage_vehicles SET mileage = GREATEST(COALESCE(mileage, 0), {int(mileage)}), updated_at = CURRENT_TIMESTAMP
            WHERE id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}
        """)
    cur.close()
    conn.close()
    return dict(row)


def delete_service(family_id: str, service_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.garage_service_records WHERE id::text = {esc(service_id)} AND family_id::text = {esc(family_id)}")
    cur.close()
    conn.close()
    return {'success': True}


# --- EXPENSES ---

def list_expenses(family_id: str, vehicle_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.garage_expenses
        WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}
        ORDER BY date DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def create_expense(family_id: str, vehicle_id: str, user_id: str, data: Dict) -> Dict:
    eid = str(uuid.uuid4())
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.garage_expenses (id, vehicle_id, family_id, category, title, amount, date, notes, created_by)
        VALUES ({esc(eid)}::uuid, {esc(vehicle_id)}::uuid, {esc(family_id)}::uuid,
                {esc(data.get('category', 'other'))}, {esc(data.get('title'))}, {esc(data.get('amount', 0))},
                {esc(data.get('date'))}, {esc(data.get('notes'))}, {esc(user_id)}::uuid)
        RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row)


def delete_expense(family_id: str, expense_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.garage_expenses WHERE id::text = {esc(expense_id)} AND family_id::text = {esc(family_id)}")
    cur.close()
    conn.close()
    return {'success': True}


# --- REMINDERS ---

def list_reminders(family_id: str, vehicle_id: Optional[str] = None) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    where = f"family_id::text = {esc(family_id)}"
    if vehicle_id:
        where += f" AND vehicle_id::text = {esc(vehicle_id)}"
    cur.execute(f"SELECT * FROM {SCHEMA}.garage_reminders WHERE {where} ORDER BY is_completed ASC, due_date ASC NULLS LAST")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def create_reminder(family_id: str, vehicle_id: str, data: Dict) -> Dict:
    rid = str(uuid.uuid4())
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.garage_reminders (id, vehicle_id, family_id, reminder_type, title, description, due_date, due_mileage)
        VALUES ({esc(rid)}::uuid, {esc(vehicle_id)}::uuid, {esc(family_id)}::uuid,
                {esc(data.get('reminder_type', 'custom'))}, {esc(data.get('title'))}, {esc(data.get('description'))},
                {esc(data.get('due_date'))}, {esc(data.get('due_mileage'))})
        RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row)


def toggle_reminder(family_id: str, reminder_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.garage_reminders
        SET is_completed = NOT is_completed, completed_at = CASE WHEN is_completed THEN NULL ELSE CURRENT_TIMESTAMP END
        WHERE id::text = {esc(reminder_id)} AND family_id::text = {esc(family_id)} RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {'error': 'Напоминание не найдено'}


def delete_reminder(family_id: str, reminder_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.garage_reminders WHERE id::text = {esc(reminder_id)} AND family_id::text = {esc(family_id)}")
    cur.close()
    conn.close()
    return {'success': True}


# --- NOTES ---

def list_notes(family_id: str, vehicle_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.garage_notes
        WHERE vehicle_id::text = {esc(vehicle_id)} AND family_id::text = {esc(family_id)}
        ORDER BY is_resolved ASC, created_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def create_note(family_id: str, vehicle_id: str, user_id: str, data: Dict) -> Dict:
    nid = str(uuid.uuid4())
    author = get_member_name(user_id)
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.garage_notes (id, vehicle_id, family_id, author_name, text, priority)
        VALUES ({esc(nid)}::uuid, {esc(vehicle_id)}::uuid, {esc(family_id)}::uuid,
                {esc(author)}, {esc(data.get('text'))}, {esc(data.get('priority', 'normal'))})
        RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row)


def toggle_note(family_id: str, note_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.garage_notes SET is_resolved = NOT is_resolved
        WHERE id::text = {esc(note_id)} AND family_id::text = {esc(family_id)} RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {'error': 'Заметка не найдена'}


def delete_note(family_id: str, note_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.garage_notes WHERE id::text = {esc(note_id)} AND family_id::text = {esc(family_id)}")
    cur.close()
    conn.close()
    return {'success': True}


# --- STATS ---

def get_stats(family_id: str, vehicle_id: Optional[str] = None) -> Dict:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    vw = f"AND vehicle_id::text = {esc(vehicle_id)}" if vehicle_id else ""

    cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.garage_vehicles WHERE family_id::text = {esc(family_id)}")
    vehicle_count = cur.fetchone()['cnt']

    cur.execute(f"SELECT COALESCE(SUM(amount), 0) as total FROM {SCHEMA}.garage_expenses WHERE family_id::text = {esc(family_id)} {vw}")
    total_expenses = cur.fetchone()['total']

    cur.execute(f"SELECT COALESCE(SUM(amount), 0) as total FROM {SCHEMA}.garage_expenses WHERE family_id::text = {esc(family_id)} {vw} AND date >= DATE_TRUNC('month', CURRENT_DATE)")
    month_expenses = cur.fetchone()['total']

    cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.garage_reminders WHERE family_id::text = {esc(family_id)} {vw} AND is_completed = FALSE")
    active_reminders = cur.fetchone()['cnt']

    cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.garage_reminders WHERE family_id::text = {esc(family_id)} {vw} AND is_completed = FALSE AND due_date <= CURRENT_DATE + INTERVAL '7 days' AND due_date IS NOT NULL")
    urgent_reminders = cur.fetchone()['cnt']

    cur.execute(f"""
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM {SCHEMA}.garage_expenses WHERE family_id::text = {esc(family_id)} {vw}
        GROUP BY category ORDER BY total DESC
    """)
    by_category = [dict(r) for r in cur.fetchall()]

    cur.close()
    conn.close()
    return {
        'vehicle_count': vehicle_count,
        'total_expenses': float(total_expenses),
        'month_expenses': float(month_expenses),
        'active_reminders': active_reminders,
        'urgent_reminders': urgent_reminders,
        'expenses_by_category': by_category,
    }


# --- HANDLER ---

def handler(event: Dict[str, Any], context: Any) -> Dict:
    if event.get('httpMethod') == 'OPTIONS':
        return respond(200, '')

    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token', '') or headers.get('x-auth-token', '')
    user_id = verify_token(token)
    if not user_id:
        return respond(401, {'error': 'Необходима авторизация'})

    family_id = get_family_id(user_id)
    if not family_id:
        return respond(403, {'error': 'Семья не найдена'})

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    action = params.get('action') or body.get('action', '')

    if method == 'GET':
        if action == 'list':
            return respond(200, {'success': True, 'vehicles': list_vehicles(family_id)})
        if action == 'detail':
            v = get_vehicle(family_id, params.get('vehicle_id', ''))
            if not v:
                return respond(404, {'error': 'Автомобиль не найден'})
            return respond(200, {'success': True, 'vehicle': v})
        if action == 'services':
            return respond(200, {'success': True, 'services': list_services(family_id, params.get('vehicle_id', ''))})
        if action == 'expenses':
            return respond(200, {'success': True, 'expenses': list_expenses(family_id, params.get('vehicle_id', ''))})
        if action == 'reminders':
            return respond(200, {'success': True, 'reminders': list_reminders(family_id, params.get('vehicle_id'))})
        if action == 'notes':
            return respond(200, {'success': True, 'notes': list_notes(family_id, params.get('vehicle_id', ''))})
        if action == 'stats':
            return respond(200, {'success': True, 'stats': get_stats(family_id, params.get('vehicle_id'))})
        return respond(200, {'success': True, 'vehicles': list_vehicles(family_id)})

    if method == 'POST':
        if action == 'create_vehicle':
            return respond(200, {'success': True, 'vehicle': create_vehicle(family_id, body)})
        if action == 'update_vehicle':
            return respond(200, {'success': True, 'vehicle': update_vehicle(family_id, body.get('vehicle_id', ''), body)})
        if action == 'delete_vehicle':
            return respond(200, delete_vehicle(family_id, body.get('vehicle_id', '')))
        if action == 'create_service':
            return respond(200, {'success': True, 'service': create_service(family_id, body.get('vehicle_id', ''), user_id, body)})
        if action == 'delete_service':
            return respond(200, delete_service(family_id, body.get('service_id', '')))
        if action == 'create_expense':
            return respond(200, {'success': True, 'expense': create_expense(family_id, body.get('vehicle_id', ''), user_id, body)})
        if action == 'delete_expense':
            return respond(200, delete_expense(family_id, body.get('expense_id', '')))
        if action == 'create_reminder':
            return respond(200, {'success': True, 'reminder': create_reminder(family_id, body.get('vehicle_id', ''), body)})
        if action == 'toggle_reminder':
            return respond(200, {'success': True, 'reminder': toggle_reminder(family_id, body.get('reminder_id', ''))})
        if action == 'delete_reminder':
            return respond(200, delete_reminder(family_id, body.get('reminder_id', '')))
        if action == 'create_note':
            return respond(200, {'success': True, 'note': create_note(family_id, body.get('vehicle_id', ''), user_id, body)})
        if action == 'toggle_note':
            return respond(200, {'success': True, 'note': toggle_note(family_id, body.get('note_id', ''))})
        if action == 'delete_note':
            return respond(200, delete_note(family_id, body.get('note_id', '')))
        return respond(400, {'error': f'Неизвестное действие: {action}'})

    return respond(405, {'error': 'Метод не поддерживается'})