"""
Универсальный админский API — роутер по ?resource= параметру.
Сохраняет обратную совместимость с AdminUsers (GET без resource = список юзеров).

Поддерживаемые ресурсы:
- users        — список пользователей (legacy)
- families     — список семей с поиском/фильтром
- family       — карточка одной семьи (?family_id=)
- finance      — финансовая сводка платформы
- promo        — промокоды (GET список, POST создать, DELETE удалить)
- broadcasts   — рассылки (GET, POST)
- funnel       — воронка регистрации
- errors       — лента ошибок
- tickets      — обращения пользователей (feedback)
- top          — топ активных семей
- flags        — фич-тумблеры (GET, POST)
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def _conn():
    return psycopg2.connect(DATABASE_URL)


def _ok(body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def _err(status: int, msg: str, headers: Dict[str, str]) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': headers,
        'body': json.dumps({'error': msg}, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _escape(val: str) -> str:
    return (val or '').replace("'", "''")


# ===== USERS (legacy) =====
def get_users_list():
    conn = _conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT u.id, u.email, u.phone, u.name, u.created_at, u.last_login_at,
               u.oauth_provider, u.is_verified,
               COUNT(DISTINCT fm.family_id) as families_count,
               STRING_AGG(DISTINCT f.name, ', ' ORDER BY f.name) as families_names
        FROM {SCHEMA}.users u
        LEFT JOIN {SCHEMA}.family_members fm ON u.id = fm.user_id
        LEFT JOIN {SCHEMA}.families f ON fm.family_id = f.id
        GROUP BY u.id, u.email, u.phone, u.name, u.created_at, u.last_login_at, u.oauth_provider, u.is_verified
        ORDER BY u.created_at DESC
    """)
    users = cur.fetchall()
    out = []
    for u in users:
        out.append({
            'id': str(u['id']),
            'email': u['email'], 'phone': u['phone'], 'name': u['name'],
            'created_at': u['created_at'].isoformat() if u['created_at'] else None,
            'last_login_at': u['last_login_at'].isoformat() if u['last_login_at'] else None,
            'oauth_provider': u['oauth_provider'], 'is_verified': u['is_verified'],
            'families_count': u['families_count'],
            'families_names': u['families_names'],
        })
    cur.close(); conn.close()
    return {'success': True, 'users': out, 'total': len(out)}


# ===== FAMILIES =====
def get_families(params):
    search = _escape((params.get('search') or '').strip()).lower()
    sort = params.get('sort', 'recent')
    limit = min(int(params.get('limit') or 100), 500)
    offset = max(int(params.get('offset') or 0), 0)

    where = ''
    if search:
        where = (
            f" WHERE LOWER(f.name) LIKE '%{search}%' "
            f"OR LOWER(COALESCE(u.email, '')) LIKE '%{search}%' "
            f"OR LOWER(COALESCE(u.name, '')) LIKE '%{search}%' "
        )
    order_by = {'members': ' ORDER BY member_count DESC ',
                'name': ' ORDER BY f.name ASC '}.get(sort, ' ORDER BY f.created_at DESC ')

    conn = _conn(); cur = conn.cursor()
    cur.execute(f"""
        SELECT f.id, f.name, f.created_at, f.logo_url,
            (SELECT COUNT(*) FROM {SCHEMA}.family_members fm WHERE fm.family_id = f.id) AS member_count,
            (SELECT u.email FROM {SCHEMA}.family_members fm
                JOIN {SCHEMA}.users u ON u.id = fm.user_id
                WHERE fm.family_id = f.id AND fm.user_id IS NOT NULL
                ORDER BY fm.created_at ASC LIMIT 1) AS owner_email,
            (SELECT u.name FROM {SCHEMA}.family_members fm
                JOIN {SCHEMA}.users u ON u.id = fm.user_id
                WHERE fm.family_id = f.id AND fm.user_id IS NOT NULL
                ORDER BY fm.created_at ASC LIMIT 1) AS owner_name,
            (SELECT MAX(u.last_login_at) FROM {SCHEMA}.family_members fm
                JOIN {SCHEMA}.users u ON u.id = fm.user_id
                WHERE fm.family_id = f.id) AS last_activity
        FROM {SCHEMA}.families f
        LEFT JOIN {SCHEMA}.family_members fm_j ON fm_j.family_id = f.id
        LEFT JOIN {SCHEMA}.users u ON u.id = fm_j.user_id
        {where}
        GROUP BY f.id, f.name, f.created_at, f.logo_url
        {order_by}
        LIMIT {limit} OFFSET {offset}
    """)
    rows = cur.fetchall()
    families = [{
        'id': str(r[0]), 'name': r[1],
        'created_at': r[2].isoformat() if r[2] else None,
        'logo_url': r[3], 'member_count': int(r[4] or 0),
        'owner_email': r[5], 'owner_name': r[6],
        'last_activity': r[7].isoformat() if r[7] else None,
    } for r in rows]

    cur.execute(f'SELECT COUNT(*) FROM {SCHEMA}.families')
    total = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.families WHERE created_at >= CURRENT_DATE")
    today = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.families WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'")
    week = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.families WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'")
    month = cur.fetchone()[0]
    cur.execute(f"""
        SELECT COUNT(DISTINCT f.id) FROM {SCHEMA}.families f
        JOIN {SCHEMA}.family_members fm ON fm.family_id = f.id
        JOIN {SCHEMA}.users u ON u.id = fm.user_id
        WHERE u.last_login_at >= CURRENT_DATE - INTERVAL '7 days'
    """)
    active_week = cur.fetchone()[0]
    cur.close(); conn.close()

    return {'families': families,
            'summary': {'total': int(total), 'today': int(today),
                        'week': int(week), 'month': int(month),
                        'active_week': int(active_week)}}


def get_family_detail(params):
    family_id = _escape(params.get('family_id') or '')
    if not family_id:
        return None
    conn = _conn(); cur = conn.cursor()
    cur.execute(f"SELECT id, name, created_at, logo_url, banner_url FROM {SCHEMA}.families WHERE id = '{family_id}'")
    fam = cur.fetchone()
    if not fam:
        cur.close(); conn.close()
        return 'not_found'
    cur.execute(f"""
        SELECT fm.id, fm.name, fm.role, fm.relationship, fm.access_role,
               fm.member_status, fm.joined_at, fm.user_id,
               u.email, u.last_login_at, u.oauth_provider, u.is_verified
        FROM {SCHEMA}.family_members fm
        LEFT JOIN {SCHEMA}.users u ON u.id = fm.user_id
        WHERE fm.family_id = '{family_id}'
        ORDER BY fm.created_at ASC
    """)
    members = [{
        'id': str(r[0]), 'name': r[1], 'role': r[2], 'relationship': r[3],
        'access_role': r[4], 'status': r[5],
        'joined_at': r[6].isoformat() if r[6] else None,
        'user_id': str(r[7]) if r[7] else None,
        'email': r[8],
        'last_login_at': r[9].isoformat() if r[9] else None,
        'oauth_provider': r[10],
        'is_verified': bool(r[11]) if r[11] is not None else False,
    } for r in cur.fetchall()]

    activity = {}
    for table, key in [('tasks_v2', 'tasks'), ('calendar_events', 'events'), ('shopping_items', 'shopping')]:
        try:
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.{table} WHERE family_id = '{family_id}'")
            activity[key] = int(cur.fetchone()[0])
        except Exception:
            conn.rollback()
            activity[key] = 0

    cur.close(); conn.close()
    return {
        'family': {
            'id': str(fam[0]), 'name': fam[1],
            'created_at': fam[2].isoformat() if fam[2] else None,
            'logo_url': fam[3], 'banner_url': fam[4],
        },
        'members': members, 'activity': activity,
    }


# ===== FINANCE =====
def get_finance():
    conn = _conn(); cur = conn.cursor()
    result = {'total_revenue': 0, 'today_revenue': 0, 'week_revenue': 0, 'month_revenue': 0,
              'total_payments': 0, 'successful_payments': 0, 'methods': [],
              'recent_payments': [], 'by_day': []}
    try:
        cur.execute(f"""
            SELECT COALESCE(SUM(CASE WHEN status IN ('success','completed','paid') THEN amount ELSE 0 END), 0),
                   COUNT(*),
                   SUM(CASE WHEN status IN ('success','completed','paid') THEN 1 ELSE 0 END)
            FROM {SCHEMA}.payments
        """)
        row = cur.fetchone()
        result['total_revenue'] = float(row[0] or 0)
        result['total_payments'] = int(row[1] or 0)
        result['successful_payments'] = int(row[2] or 0)

        cur.execute(f"""
            SELECT COALESCE(SUM(amount),0) FROM {SCHEMA}.payments
            WHERE status IN ('success','completed','paid') AND created_at >= CURRENT_DATE
        """)
        result['today_revenue'] = float(cur.fetchone()[0] or 0)

        cur.execute(f"""
            SELECT COALESCE(SUM(amount),0) FROM {SCHEMA}.payments
            WHERE status IN ('success','completed','paid') AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        """)
        result['week_revenue'] = float(cur.fetchone()[0] or 0)

        cur.execute(f"""
            SELECT COALESCE(SUM(amount),0) FROM {SCHEMA}.payments
            WHERE status IN ('success','completed','paid') AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        """)
        result['month_revenue'] = float(cur.fetchone()[0] or 0)

        cur.execute(f"""
            SELECT COALESCE(payment_method, 'unknown'), COUNT(*), COALESCE(SUM(amount),0)
            FROM {SCHEMA}.payments
            WHERE status IN ('success','completed','paid')
            GROUP BY payment_method
            ORDER BY SUM(amount) DESC
        """)
        result['methods'] = [{'method': r[0], 'count': int(r[1]), 'amount': float(r[2] or 0)}
                             for r in cur.fetchall()]

        cur.execute(f"""
            SELECT id, user_id, amount, status, payment_method, created_at
            FROM {SCHEMA}.payments
            ORDER BY created_at DESC LIMIT 20
        """)
        result['recent_payments'] = [{
            'id': str(r[0]),
            'user_id': str(r[1]) if r[1] else None,
            'amount': float(r[2] or 0),
            'status': r[3], 'method': r[4],
            'created_at': r[5].isoformat() if r[5] else None,
        } for r in cur.fetchall()]

        cur.execute(f"""
            SELECT DATE(created_at), COALESCE(SUM(amount),0), COUNT(*)
            FROM {SCHEMA}.payments
            WHERE status IN ('success','completed','paid') AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC
        """)
        result['by_day'] = [{'date': str(r[0]), 'amount': float(r[1] or 0), 'count': int(r[2])}
                            for r in cur.fetchall()]
    except Exception as e:
        conn.rollback()
        result['note'] = f'payments table partial: {str(e)[:200]}'
    cur.close(); conn.close()
    return result


# ===== PROMO =====
def promo_list():
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            SELECT id, code, discount_type, discount_value, is_active,
                   max_uses, COALESCE(current_uses, 0), valid_until, created_at
            FROM {SCHEMA}.promo_codes ORDER BY created_at DESC
        """)
        out = [{
            'id': str(r[0]), 'code': r[1],
            'discount_type': r[2], 'discount_value': float(r[3] or 0),
            'is_active': bool(r[4]),
            'max_uses': int(r[5] or 0), 'current_uses': int(r[6] or 0),
            'valid_until': r[7].isoformat() if r[7] else None,
            'created_at': r[8].isoformat() if r[8] else None,
        } for r in cur.fetchall()]
    except Exception:
        conn.rollback()
        out = []
    cur.close(); conn.close()
    return {'promo_codes': out}


def promo_create(data):
    code = _escape((data.get('code') or '').strip().upper())
    discount_type = _escape(data.get('discount_type') or 'percent')
    discount_value = float(data.get('discount_value') or 10)
    max_uses = int(data.get('max_uses') or 100)
    valid_until = _escape(data.get('valid_until') or '')
    if not code:
        return {'error': 'code required'}
    conn = _conn(); cur = conn.cursor()
    try:
        if valid_until:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.promo_codes
                (code, discount_type, discount_value, max_uses, valid_until, is_active, created_by)
                VALUES ('{code}', '{discount_type}', {discount_value}, {max_uses}, '{valid_until}', true, 'admin')
                RETURNING id
            """)
        else:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.promo_codes
                (code, discount_type, discount_value, max_uses, is_active, created_by)
                VALUES ('{code}', '{discount_type}', {discount_value}, {max_uses}, true, 'admin')
                RETURNING id
            """)
        new_id = cur.fetchone()[0]
        conn.commit()
        result = {'success': True, 'id': str(new_id)}
    except Exception as e:
        conn.rollback()
        result = {'error': str(e)[:200]}
    cur.close(); conn.close()
    return result


def promo_delete(data):
    pid = _escape(data.get('id') or '')
    if not pid:
        return {'error': 'id required'}
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"DELETE FROM {SCHEMA}.promo_codes WHERE id = '{pid}'")
        conn.commit()
        result = {'success': True}
    except Exception as e:
        conn.rollback()
        result = {'error': str(e)[:200]}
    cur.close(); conn.close()
    return result


# ===== BROADCASTS =====
def broadcasts_list():
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            SELECT id, title, message, target_audience, sent_count, created_at, status
            FROM {SCHEMA}.admin_broadcasts ORDER BY created_at DESC LIMIT 50
        """)
        out = [{
            'id': str(r[0]), 'title': r[1], 'message': r[2],
            'target': r[3], 'sent_count': int(r[4] or 0),
            'created_at': r[5].isoformat() if r[5] else None,
            'status': r[6],
        } for r in cur.fetchall()]
    except Exception:
        conn.rollback()
        out = []
    cur.close(); conn.close()
    return {'broadcasts': out}


def broadcasts_send(data):
    title = _escape((data.get('title') or '').strip())
    message = _escape((data.get('message') or '').strip())
    target = _escape(data.get('target') or 'all')
    if not title or not message:
        return {'error': 'title and message required'}
    conn = _conn(); cur = conn.cursor()
    try:
        if target == 'verified':
            cond = "WHERE is_verified = true"
        elif target == 'today':
            cond = "WHERE created_at >= CURRENT_DATE"
        else:
            cond = ''
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users {cond}")
        user_count = int(cur.fetchone()[0])

        cur.execute(f"""
            INSERT INTO {SCHEMA}.admin_broadcasts (title, message, target_audience, sent_count, status)
            VALUES ('{title}', '{message}', '{target}', {user_count}, 'sent') RETURNING id
        """)
        new_id = cur.fetchone()[0]
        conn.commit()
        result = {'success': True, 'id': str(new_id), 'sent_to': user_count}
    except Exception as e:
        conn.rollback()
        result = {'error': str(e)[:200]}
    cur.close(); conn.close()
    return result


# ===== FUNNEL =====
def get_funnel():
    conn = _conn(); cur = conn.cursor()
    cur.execute(f"SELECT COUNT(DISTINCT session_id) FROM {SCHEMA}.page_views WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'")
    visitors = int(cur.fetchone()[0] or 0)
    cur.execute(f"SELECT COUNT(DISTINCT session_id) FROM {SCHEMA}.page_views WHERE page_path LIKE '%register%' AND created_at >= CURRENT_DATE - INTERVAL '30 days'")
    registration_page = int(cur.fetchone()[0] or 0)
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'")
    registered = int(cur.fetchone()[0] or 0)
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users WHERE is_verified = true AND created_at >= CURRENT_DATE - INTERVAL '30 days'")
    verified = int(cur.fetchone()[0] or 0)
    cur.execute(f"SELECT COUNT(DISTINCT f.id) FROM {SCHEMA}.families f JOIN {SCHEMA}.family_members fm ON fm.family_id=f.id WHERE f.created_at >= CURRENT_DATE - INTERVAL '30 days'")
    created_family = int(cur.fetchone()[0] or 0)
    cur.close(); conn.close()
    steps = [
        {'name': 'Посетители сайта', 'count': visitors},
        {'name': 'Открыли регистрацию', 'count': registration_page},
        {'name': 'Зарегистрировались', 'count': registered},
        {'name': 'Подтвердили email', 'count': verified},
        {'name': 'Создали семью', 'count': created_family},
    ]
    return {'funnel': steps, 'period_days': 30}


# ===== ERRORS =====
def errors_list():
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            SELECT id, error_message, error_stack, page_path, user_agent, created_at
            FROM {SCHEMA}.client_errors ORDER BY created_at DESC LIMIT 100
        """)
        out = [{
            'id': str(r[0]), 'message': r[1], 'stack': r[2],
            'path': r[3], 'user_agent': r[4],
            'created_at': r[5].isoformat() if r[5] else None,
        } for r in cur.fetchall()]
    except Exception:
        conn.rollback()
        out = []
    cur.close(); conn.close()
    return {'errors': out}


def errors_add(data):
    msg = _escape((data.get('message') or '')[:1000])
    stack = _escape((data.get('stack') or '')[:5000])
    path = _escape((data.get('path') or '')[:500])
    ua = _escape((data.get('user_agent') or '')[:500])
    if not msg:
        return {'error': 'message required'}
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            INSERT INTO {SCHEMA}.client_errors (error_message, error_stack, page_path, user_agent)
            VALUES ('{msg}', '{stack}', '{path}', '{ua}')
        """)
        conn.commit()
        result = {'success': True}
    except Exception as e:
        conn.rollback()
        result = {'error': str(e)[:200]}
    cur.close(); conn.close()
    return result


# ===== TICKETS (feedback) =====
def tickets_list():
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            SELECT id, user_id, type, title, description, status, created_at
            FROM {SCHEMA}.feedback
            ORDER BY created_at DESC LIMIT 100
        """)
        out = [{
            'id': str(r[0]),
            'user_id': str(r[1]) if r[1] else None,
            'type': r[2], 'title': r[3], 'description': r[4], 'status': r[5],
            'created_at': r[6].isoformat() if r[6] else None,
        } for r in cur.fetchall()]
    except Exception:
        conn.rollback()
        out = []
    cur.close(); conn.close()
    return {'tickets': out}


# ===== TOP FAMILIES =====
def get_top_families():
    conn = _conn(); cur = conn.cursor()
    scores = {}
    for table, weight in [('tasks_v2', 1), ('calendar_events', 2), ('shopping_items', 1)]:
        try:
            cur.execute(f"""
                SELECT family_id, COUNT(*) FROM {SCHEMA}.{table}
                WHERE family_id IS NOT NULL
                GROUP BY family_id
            """)
            for r in cur.fetchall():
                fid = str(r[0])
                scores[fid] = scores.get(fid, 0) + int(r[1]) * weight
        except Exception:
            conn.rollback()
    cur.execute(f"SELECT id, name FROM {SCHEMA}.families")
    names = {str(r[0]): r[1] for r in cur.fetchall()}
    cur.close(); conn.close()

    top = sorted(scores.items(), key=lambda x: -x[1])[:20]
    return {'top': [{'family_id': fid, 'name': names.get(fid, 'Без названия'), 'score': score}
                    for fid, score in top]}


# ===== FEATURE FLAGS =====
def flags_list():
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            SELECT flag_key, is_enabled, description, updated_at
            FROM {SCHEMA}.feature_flags ORDER BY flag_key
        """)
        out = [{
            'key': r[0], 'enabled': bool(r[1]),
            'description': r[2],
            'updated_at': r[3].isoformat() if r[3] else None,
        } for r in cur.fetchall()]
    except Exception:
        conn.rollback()
        out = []
    cur.close(); conn.close()
    return {'flags': out}


def flags_set(data):
    key = _escape((data.get('key') or '').strip())
    enabled = bool(data.get('enabled'))
    description = _escape(data.get('description') or '')
    if not key:
        return {'error': 'key required'}
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"""
            INSERT INTO {SCHEMA}.feature_flags (flag_key, is_enabled, description)
            VALUES ('{key}', {enabled}, '{description}')
            ON CONFLICT (flag_key) DO UPDATE
            SET is_enabled = EXCLUDED.is_enabled,
                description = COALESCE(NULLIF(EXCLUDED.description,''), {SCHEMA}.feature_flags.description),
                updated_at = CURRENT_TIMESTAMP
        """)
        conn.commit()
        result = {'success': True}
    except Exception as e:
        conn.rollback()
        result = {'error': str(e)[:200]}
    cur.close(); conn.close()
    return result


# ===== HANDLER =====
def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Универсальный админский API. Роутер по ?resource= параметру."""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': '', 'isBase64Encoded': False}

    headers = {'Content-Type': 'application/json', **cors_headers}

    try:
        params = event.get('queryStringParameters') or {}
        resource = params.get('resource', 'users')

        # Публичный эндпоинт — добавление клиентской ошибки
        if resource == 'errors' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            return _ok(errors_add(body), headers)

        admin_token = (event.get('headers') or {}).get('x-admin-token') or \
                      (event.get('headers') or {}).get('X-Admin-Token')
        if admin_token != 'admin_authenticated':
            return _err(401, 'Требуются права администратора', headers)

        if not DATABASE_URL:
            return _err(500, 'DATABASE_URL не настроен', headers)

        if method == 'GET':
            if resource == 'users':
                return _ok(get_users_list(), headers)
            if resource == 'families':
                return _ok(get_families(params), headers)
            if resource == 'family':
                result = get_family_detail(params)
                if result is None:
                    return _err(400, 'family_id required', headers)
                if result == 'not_found':
                    return _err(404, 'Family not found', headers)
                return _ok(result, headers)
            if resource == 'finance':
                return _ok(get_finance(), headers)
            if resource == 'promo':
                return _ok(promo_list(), headers)
            if resource == 'broadcasts':
                return _ok(broadcasts_list(), headers)
            if resource == 'funnel':
                return _ok(get_funnel(), headers)
            if resource == 'errors':
                return _ok(errors_list(), headers)
            if resource == 'tickets':
                return _ok(tickets_list(), headers)
            if resource == 'top':
                return _ok(get_top_families(), headers)
            if resource == 'flags':
                return _ok(flags_list(), headers)
            return _err(400, f'Unknown resource: {resource}', headers)

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            if resource == 'promo':
                return _ok(promo_create(body), headers)
            if resource == 'broadcasts':
                return _ok(broadcasts_send(body), headers)
            if resource == 'flags':
                return _ok(flags_set(body), headers)
            return _err(400, f'POST not supported for {resource}', headers)

        if method == 'DELETE':
            body = json.loads(event.get('body') or '{}')
            if resource == 'promo':
                return _ok(promo_delete(body), headers)
            return _err(400, f'DELETE not supported for {resource}', headers)

        return _err(405, 'Метод не поддерживается', headers)

    except Exception as e:
        return _err(500, str(e)[:300], headers)