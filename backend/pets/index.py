"""Управление питомцами семьи: профили, прививки, ветеринар, лекарства, питание, груминг, активность, расходы, здоровье, вещи, ответственные, фото"""

import json
import os
import uuid
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


def uuid_or_null(value: Any) -> str:
    if not value:
        return 'NULL'
    return f"{esc(value)}::uuid"


def verify_token(token: str) -> Optional[str]:
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = {esc(token)} AND expires_at > CURRENT_TIMESTAMP"
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['user_id']) if row else None


def get_family_id(user_id: str) -> Optional[str]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"SELECT family_id FROM {SCHEMA}.family_members WHERE user_id::text = {esc(user_id)} LIMIT 1"
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return str(row['family_id']) if row and row['family_id'] else None


def pet_belongs_to_family(pet_id: str, family_id: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT 1 FROM {SCHEMA}.pets WHERE id::text = {esc(pet_id)} AND family_id::text = {esc(family_id)}"
    )
    ok = cur.fetchone() is not None
    cur.close()
    conn.close()
    return ok


# --- PETS ---

def list_pets(family_id: str) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"SELECT * FROM {SCHEMA}.pets WHERE family_id::text = {esc(family_id)} ORDER BY created_at DESC"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def create_pet(family_id: str, data: Dict) -> Dict:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    pid = str(uuid.uuid4())
    cur.execute(f"""
        INSERT INTO {SCHEMA}.pets (id, family_id, name, species, breed, gender, birth_date, weight, color, chip_number, photo_url, notes, allergies, responsible_member_id)
        VALUES (
            {esc(pid)}::uuid,
            {esc(family_id)}::uuid,
            {esc(data.get('name', ''))},
            {esc(data.get('species'))},
            {esc(data.get('breed'))},
            {esc(data.get('gender'))},
            {esc(data.get('birth_date')) if data.get('birth_date') else 'NULL'}::date,
            {esc(data.get('weight')) if data.get('weight') not in (None, '') else 'NULL'},
            {esc(data.get('color'))},
            {esc(data.get('chip_number'))},
            {esc(data.get('photo_url'))},
            {esc(data.get('notes'))},
            {esc(data.get('allergies'))},
            {uuid_or_null(data.get('responsible_member_id'))}
        ) RETURNING *
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {}


def update_pet(pet_id: str, family_id: str, data: Dict) -> Dict:
    allowed = ['name', 'species', 'breed', 'gender', 'color', 'chip_number', 'photo_url', 'notes', 'allergies']
    sets = [f"{f} = {esc(data[f])}" for f in allowed if f in data]
    if 'birth_date' in data:
        v = data['birth_date']
        sets.append(f"birth_date = {esc(v) + '::date' if v else 'NULL'}")
    if 'weight' in data:
        v = data['weight']
        sets.append(f"weight = {esc(v) if v not in (None, '') else 'NULL'}")
    if 'responsible_member_id' in data:
        sets.append(f"responsible_member_id = {uuid_or_null(data['responsible_member_id'])}")
    if not sets:
        return {'error': 'Нет данных для обновления'}
    sets.append("updated_at = CURRENT_TIMESTAMP")
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"UPDATE {SCHEMA}.pets SET {', '.join(sets)} "
        f"WHERE id::text = {esc(pet_id)} AND family_id::text = {esc(family_id)} RETURNING *"
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {'error': 'Питомец не найден'}


def delete_pet(pet_id: str, family_id: str) -> Dict:
    conn = get_conn()
    cur = conn.cursor()
    # удаляем все связанные сущности
    for t in ['pet_vaccines', 'pet_vet_visits', 'pet_medications', 'pet_food', 'pet_grooming',
              'pet_activities', 'pet_expenses', 'pet_health_metrics', 'pet_items',
              'pet_responsibilities', 'pet_photos']:
        cur.execute(f"DELETE FROM {SCHEMA}.{t} WHERE pet_id::text = {esc(pet_id)} AND family_id::text = {esc(family_id)}")
    cur.execute(f"DELETE FROM {SCHEMA}.pets WHERE id::text = {esc(pet_id)} AND family_id::text = {esc(family_id)}")
    cur.close()
    conn.close()
    return {'success': True}


# --- Универсальные CRUD для подтаблиц ---

SUB_CONFIG = {
    'vaccines': {
        'table': 'pet_vaccines',
        'text': ['vaccine_name', 'clinic', 'vet_name', 'notes'],
        'dates': ['vaccination_date', 'next_date'],
        'nums': [],
        'order': 'vaccination_date DESC NULLS LAST, created_at DESC',
    },
    'vet': {
        'table': 'pet_vet_visits',
        'text': ['clinic', 'vet_name', 'reason', 'diagnosis', 'recommendations'],
        'dates': ['visit_date', 'next_visit'],
        'nums': ['cost'],
        'order': 'visit_date DESC NULLS LAST, created_at DESC',
    },
    'medications': {
        'table': 'pet_medications',
        'text': ['name', 'dosage', 'frequency', 'notes'],
        'dates': ['start_date', 'end_date'],
        'nums': [],
        'bools': ['is_active'],
        'order': 'is_active DESC, created_at DESC',
    },
    'food': {
        'table': 'pet_food',
        'text': ['food_name', 'food_type', 'brand', 'portion', 'feeding_time', 'notes'],
        'dates': [],
        'nums': ['meals_per_day'],
        'order': 'created_at DESC',
    },
    'grooming': {
        'table': 'pet_grooming',
        'text': ['procedure_type', 'salon', 'notes'],
        'dates': ['procedure_date', 'next_date'],
        'nums': ['cost'],
        'order': 'procedure_date DESC NULLS LAST, created_at DESC',
    },
    'activities': {
        'table': 'pet_activities',
        'text': ['activity_type', 'location', 'notes'],
        'dates': ['activity_date'],
        'nums': ['duration_minutes', 'distance_km'],
        'uuids': ['member_id'],
        'order': 'activity_date DESC NULLS LAST, created_at DESC',
    },
    'expenses': {
        'table': 'pet_expenses',
        'text': ['category', 'title', 'notes'],
        'dates': ['expense_date'],
        'nums': ['amount'],
        'order': 'expense_date DESC NULLS LAST, created_at DESC',
    },
    'health': {
        'table': 'pet_health_metrics',
        'text': ['mood', 'appetite', 'notes'],
        'dates': ['measured_at'],
        'nums': ['weight', 'temperature', 'pulse'],
        'order': 'measured_at DESC NULLS LAST, created_at DESC',
    },
    'items': {
        'table': 'pet_items',
        'text': ['item_name', 'category', 'notes'],
        'dates': ['purchased_at'],
        'nums': ['quantity', 'cost'],
        'order': 'created_at DESC',
    },
    'responsibilities': {
        'table': 'pet_responsibilities',
        'text': ['member_name', 'responsibility', 'schedule', 'notes'],
        'dates': [],
        'nums': [],
        'uuids': ['member_id'],
        'order': 'created_at DESC',
    },
    'photos': {
        'table': 'pet_photos',
        'text': ['photo_url', 'caption'],
        'dates': ['photo_date'],
        'nums': [],
        'order': 'photo_date DESC NULLS LAST, created_at DESC',
    },
}


def list_sub(kind: str, family_id: str, pet_id: Optional[str]) -> List[Dict]:
    cfg = SUB_CONFIG[kind]
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    where = f"family_id::text = {esc(family_id)}"
    if pet_id:
        where += f" AND pet_id::text = {esc(pet_id)}"
    cur.execute(f"SELECT * FROM {SCHEMA}.{cfg['table']} WHERE {where} ORDER BY {cfg['order']}")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def build_insert(kind: str, family_id: str, data: Dict) -> str:
    cfg = SUB_CONFIG[kind]
    rid = str(uuid.uuid4())
    cols = ['id', 'pet_id', 'family_id']
    vals = [f"{esc(rid)}::uuid", f"{esc(data.get('pet_id'))}::uuid", f"{esc(family_id)}::uuid"]
    for f in cfg.get('text', []):
        if f in data:
            cols.append(f)
            vals.append(esc(data.get(f)))
    for f in cfg.get('dates', []):
        if f in data:
            cols.append(f)
            v = data.get(f)
            vals.append(f"{esc(v)}::date" if v else 'NULL')
    for f in cfg.get('nums', []):
        if f in data:
            cols.append(f)
            v = data.get(f)
            vals.append(esc(v) if v not in (None, '') else 'NULL')
    for f in cfg.get('bools', []):
        if f in data:
            cols.append(f)
            vals.append('TRUE' if data.get(f) else 'FALSE')
    for f in cfg.get('uuids', []):
        if f in data:
            cols.append(f)
            vals.append(uuid_or_null(data.get(f)))
    return f"INSERT INTO {SCHEMA}.{cfg['table']} ({', '.join(cols)}) VALUES ({', '.join(vals)}) RETURNING *"


def create_sub(kind: str, family_id: str, data: Dict) -> Dict:
    if not data.get('pet_id'):
        return {'error': 'pet_id обязателен'}
    if not pet_belongs_to_family(data['pet_id'], family_id):
        return {'error': 'Питомец не найден'}
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(build_insert(kind, family_id, data))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {}


def update_sub(kind: str, family_id: str, data: Dict) -> Dict:
    cfg = SUB_CONFIG[kind]
    rid = data.get('id')
    if not rid:
        return {'error': 'id обязателен'}
    sets = []
    for f in cfg.get('text', []):
        if f in data:
            sets.append(f"{f} = {esc(data.get(f))}")
    for f in cfg.get('dates', []):
        if f in data:
            v = data.get(f)
            sets.append(f"{f} = {esc(v) + '::date' if v else 'NULL'}")
    for f in cfg.get('nums', []):
        if f in data:
            v = data.get(f)
            sets.append(f"{f} = {esc(v) if v not in (None, '') else 'NULL'}")
    for f in cfg.get('bools', []):
        if f in data:
            sets.append(f"{f} = {'TRUE' if data.get(f) else 'FALSE'}")
    for f in cfg.get('uuids', []):
        if f in data:
            sets.append(f"{f} = {uuid_or_null(data.get(f))}")
    if not sets:
        return {'error': 'Нет данных для обновления'}
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        f"UPDATE {SCHEMA}.{cfg['table']} SET {', '.join(sets)} "
        f"WHERE id::text = {esc(rid)} AND family_id::text = {esc(family_id)} RETURNING *"
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {'error': 'Запись не найдена'}


def delete_sub(kind: str, family_id: str, rid: str) -> Dict:
    cfg = SUB_CONFIG[kind]
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"DELETE FROM {SCHEMA}.{cfg['table']} WHERE id::text = {esc(rid)} AND family_id::text = {esc(family_id)}"
    )
    cur.close()
    conn.close()
    return {'success': True}


def compute_stats(family_id: str, pet_id: Optional[str]) -> Dict:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    pet_where = f" AND pet_id::text = {esc(pet_id)}" if pet_id else ''
    cur.execute(f"SELECT COUNT(*)::int AS c FROM {SCHEMA}.pets WHERE family_id::text = {esc(family_id)}" + (f" AND id::text = {esc(pet_id)}" if pet_id else ''))
    pets_count = cur.fetchone()['c']
    cur.execute(f"SELECT COALESCE(SUM(amount),0)::float AS s FROM {SCHEMA}.pet_expenses WHERE family_id::text = {esc(family_id)}{pet_where}")
    total_expenses = cur.fetchone()['s']
    cur.execute(
        f"SELECT COALESCE(SUM(amount),0)::float AS s FROM {SCHEMA}.pet_expenses "
        f"WHERE family_id::text = {esc(family_id)}{pet_where} AND expense_date >= date_trunc('month', CURRENT_DATE)"
    )
    month_expenses = cur.fetchone()['s']
    cur.execute(
        f"SELECT COUNT(*)::int AS c FROM {SCHEMA}.pet_vaccines "
        f"WHERE family_id::text = {esc(family_id)}{pet_where} AND next_date IS NOT NULL AND next_date <= CURRENT_DATE + INTERVAL '30 days'"
    )
    upcoming_vaccines = cur.fetchone()['c']
    cur.execute(
        f"SELECT COUNT(*)::int AS c FROM {SCHEMA}.pet_medications "
        f"WHERE family_id::text = {esc(family_id)}{pet_where} AND is_active = TRUE"
    )
    active_meds = cur.fetchone()['c']
    cur.close()
    conn.close()
    return {
        'pets_count': pets_count,
        'total_expenses': total_expenses,
        'month_expenses': month_expenses,
        'upcoming_vaccines': upcoming_vaccines,
        'active_medications': active_meds,
    }


def handler(event: Dict[str, Any], context: Any) -> Dict:
    """
    Роутер: action определяет что делать.
    Actions: list_pets, create_pet, update_pet, delete_pet, stats,
             list_<kind>, create_<kind>, update_<kind>, delete_<kind>
             где kind ∈ vaccines|vet|medications|food|grooming|activities|expenses|health|items|responsibilities|photos
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    user_id = verify_token(token)
    if not user_id:
        return respond(401, {'error': 'Требуется авторизация'})
    family_id = get_family_id(user_id)
    if not family_id:
        return respond(403, {'error': 'Семья не найдена'})

    qs = event.get('queryStringParameters') or {}
    method = event.get('httpMethod', 'GET')
    body: Dict = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    action = qs.get('action') or body.get('action') or ''

    try:
        if action == 'list_pets' or (method == 'GET' and not action):
            return respond(200, {'pets': list_pets(family_id)})

        if action == 'stats':
            return respond(200, {'stats': compute_stats(family_id, qs.get('pet_id'))})

        if action == 'create_pet':
            return respond(200, {'pet': create_pet(family_id, body)})

        if action == 'update_pet':
            return respond(200, {'pet': update_pet(body.get('id', ''), family_id, body)})

        if action == 'delete_pet':
            return respond(200, delete_pet(body.get('id', ''), family_id))

        # подсущности
        for kind in SUB_CONFIG.keys():
            if action == f'list_{kind}':
                return respond(200, {'items': list_sub(kind, family_id, qs.get('pet_id'))})
            if action == f'create_{kind}':
                return respond(200, {'item': create_sub(kind, family_id, body)})
            if action == f'update_{kind}':
                return respond(200, {'item': update_sub(kind, family_id, body)})
            if action == f'delete_{kind}':
                return respond(200, delete_sub(kind, family_id, body.get('id', '')))

        return respond(400, {'error': f'Неизвестное действие: {action}'})
    except Exception as e:
        return respond(500, {'error': str(e)})
