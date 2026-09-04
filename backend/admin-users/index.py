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
- network_functions — каталог сетевых функций семьи с описанием, критичностью и статистикой (GET)
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'


def _verify_session_in_db(token: str) -> bool:
    if not token or not DATABASE_URL:
        return False
    try:
        import hashlib
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            f"SELECT 1 FROM {SCHEMA}.admin_sessions "
            f"WHERE token_hash = %s AND revoked_at IS NULL AND expires_at > now() LIMIT 1",
            (token_hash,),
        )
        row = cur.fetchone()
        if row:
            cur.execute(
                f"UPDATE {SCHEMA}.admin_sessions SET last_used_at = now() WHERE token_hash = %s",
                (token_hash,),
            )
            conn.commit()
        cur.close()
        conn.close()
        return bool(row)
    except Exception:
        return False


def _admin_authorized(event: dict) -> bool:
    headers = event.get('headers') or {}
    for k, v in headers.items():
        if isinstance(k, str) and isinstance(v, str) and k.lower() == 'x-admin-session-token':
            return _verify_session_in_db(v)
    return False


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

        # Реальные уведомления в личный кабинет каждого пользователя из аудитории —
        # без этого admin_broadcasts был только записью статистики, а пользователи
        # ничего не видели в колокольчике.
        cur.execute(f"""
            INSERT INTO {SCHEMA}.notifications
                (user_id, type, title, message, target_url, channel, status, sent_at, created_at)
            SELECT id, 'broadcast', '{title}', '{message}', '/notifications', 'in_app', 'sent', NOW(), NOW()
            FROM {SCHEMA}.users
            {cond}
        """)

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



# ===== NETWORK FUNCTIONS (полный реестр backend-функций платформы) =====
# key, category, description, lang, deployed(bool)
NETWORK_FUNCTIONS_REGISTRY = [
    ('admin-auth', 'Аутентификация и безопасность', 'Единая точка входа админа: логин по email/паролю, выдача сессионного токена', 'python', True),
    ('admin-status-banners', 'Администрирование платформы', 'Управление системными баннерами-объявлениями (создание, вкл/выкл, публикация)', 'python', True),
    ('admin-subscriptions', 'Финансы и платежи', 'Admin API для управления подписками, промокодами и аналитикой', 'python', True),
    ('admin-user-reward', 'Аутентификация и безопасность', 'Ручное поощрение пользователя админом — email + персональное уведомление в приложении.', 'python', True),
    ('admin-users', 'Администрирование платформы', 'Универсальный админский API — роутер по ?resource= параметру.', 'python', True),
    ('ai-assistant', 'ИИ и ассистенты', 'Чат с ИИ-помощником: обработка сообщений, хранение истории диалога', 'python', True),
    ('alice', 'ИИ и ассистенты', 'Яндекс Алиса навык "Наша Семья"', 'python', True),
    ('analytics', 'Администрирование платформы', 'Сбор и агрегация продуктовой аналитики по хабам и разделам приложения', 'python', True),
    ('analytics-events', 'Задачи и календарь', 'Приём продуктовых аналитических событий с фронта.', 'python', True),
    ('analyze-development', 'Развитие детей', 'ИИ-анализ развития ребёнка на основе накопленных данных', 'python', True),
    ('audit-logger', 'Аутентификация и безопасность', 'Универсальная функция журналирования критичных действий (аудит безопасности)', 'python', True),
    ('auth', 'Аутентификация и безопасность', 'Регистрация и авторизация пользователей через телефон + OAuth (Yandex ID)', 'python', True),
    ('blog-api', 'Контент и блог', 'Blog API — публичный SEO-блог "Наша Семья".', 'python', True),
    ('blog-cover-generator', 'ИИ и ассистенты', 'Генератор обложек для блога через модель Alice AI ART (Yandex AI Studio, новый Images API).', 'python', True),
    ('blog-prerender', 'Контент и блог', 'Pre-render для блога — отдаёт SEO-готовый HTML страниц для краулеров.', 'python', True),
    ('calendar-events', 'Задачи и календарь', 'API для управления событиями календаря с синхронизацией между устройствами', 'python', True),
    ('calendar-export', 'Задачи и календарь', 'Экспорт событий календаря в форматы iCal/Google Calendar', 'python', True),
    ('check-limits', 'Аутентификация и безопасность', 'Проверка лимитов тарифного плана перед выполнением действия', 'python', True),
    ('child-assessment', 'Развитие детей', 'Диагностика навыков и развития ребёнка (тесты, оценки)', 'python', True),
    ('child-calendar', 'Семья и профили', 'Управление персональными календарями детей', 'python', True),
    ('child-invite', 'Семья и профили', 'Backend функция для создания инвайт-ссылок для активации детских профилей.', 'python', True),
    ('children-data', 'Развитие детей', 'Хранение данных о детях: дневник, достижения, покупки', 'python', True),
    ('clan-tree', 'Семья и профили', 'Управление общим родом — создание рода, приглашение родственников, принятие/отклонение приглашений', 'python', True),
    ('conflict-ai', 'ИИ и ассистенты', 'ИИ-помощник для разрешения семейных конфликтов и разногласий', 'python', True),
    ('consent', 'Аутентификация и безопасность', 'Фиксация и проверка согласия пользователя на обработку ПДн (152-ФЗ).', 'python', True),
    ('dashboard', 'Администрирование платформы', 'Дашборд семейной экосистемы — 11 хабов, разделы, прогресс пользователя (авто/ручной режим).', 'python', True),
    ('data-cleanup', 'Аутентификация и безопасность', 'Автоматическая очистка устаревших данных согласно политике хранения', 'python', True),
    ('data-export', 'Аутентификация и безопасность', 'Экспорт данных семьи в PDF или Excel для резервных копий', 'python', True),
    ('dev-agent-admin', 'Администрирование платформы', 'Dev Agent Studio — backend. Stage 1, read-only.', 'python', True),
    ('dev-agent-indexer', 'Администрирование платформы', 'Dev Agent Indexer — V1.6.', 'python', True),
    ('development-plan', 'Развитие детей', 'Индивидуальный план развития ребёнка: цели, шаги, прогресс', 'python', True),
    ('diet-progress', 'Здоровье', 'Трекинг прогресса диеты: вес, самочувствие, мотивация, SOS, сохранение/получение планов.', 'python', True),
    ('diet-sync', 'Здоровье', 'Синхронизация диеты с другими разделами: Рецепты, Покупки, Счётчик БЖУ.', 'python', True),
    ('domovoy-context', 'ИИ и ассистенты', 'Агрегатор живого контекста семьи для ИИ-помощника Домового.', 'python', True),
    ('domovoy-donations', 'ИИ и ассистенты', 'Backend функция для обработки донатов Домового.', 'python', True),
    ('domovoy-studio', 'ИИ и ассистенты', 'Domovoy AI Studio backend (Stage 1).', 'python', True),
    ('encryption-helper', 'Аутентификация и безопасность', 'Вспомогательный модуль для шифрования чувствительных данных', 'python', True),
    ('event-ai-ideas', 'Задачи и календарь', 'ИИ-подбор идей для семейных событий и праздников', 'python', True),
    ('event-expenses', 'Задачи и календарь', 'Учёт расходов на организацию семейного события', 'python', True),
    ('event-guests', 'Задачи и календарь', 'Список гостей события: приглашения, RSVP', 'python', True),
    ('event-ideas', 'Задачи и календарь', 'Банк идей для планирования события', 'python', True),
    ('event-share', 'Задачи и календарь', 'Публичный доступ к событию по ссылке для внешних гостей', 'python', True),
    ('event-tasks', 'Задачи и календарь', 'Чек-лист задач по подготовке к событию', 'python', True),
    ('event-wishlist', 'Задачи и календарь', 'Вишлист подарков к событию', 'python', True),
    ('events', 'Задачи и календарь', 'CRUD семейных событий/праздников (отдельно от обычного календаря)', 'python', True),
    ('faith-api', 'Быт и хозяйство', 'Модуль веры: посты, молитвы, именины, чтение', 'python', True),
    ('family-chat', 'Семья и профили', 'API семейного чата: общий чат + тет-а-тет, опрос новых сообщений, реакции, уведомления в колокольчик и MAX-бот', 'python', True),
    ('family-data', 'Семья и профили', 'Синхронизация всех данных семьи (задачи, события, профили детей, тесты, блог, альбом, древо, чат)', 'python', True),
    ('family-invites', 'Семья и профили', 'Управление приглашениями в семью (создание, использование кодов)', 'python', True),
    ('family-members', 'Семья и профили', 'Управление членами семьи (получение, добавление, обновление)', 'python', True),
    ('family-rating', 'Семья и профили', 'Рейтинг семей по заполненности дашборда. Возвращает место конкретной семьи и топ.', 'python', True),
    ('family-settings', 'Семья и профили', 'API для управления настройками семьи (название, логотип, баннер)', 'python', True),
    ('family-tracker', 'Семья и профили', 'Приём координат участников семьи и проверка геозон', 'python', True),
    ('family-tracker-members', 'Семья и профили', 'Список участников, доступных для отслеживания на карте', 'python', True),
    ('family-traditions', 'Семья и профили', 'CRUD семейных традиций. GET — список традиций семьи, PUT /sync — полная замена списка.', 'python', True),
    ('family-tree', 'Семья и профили', 'Управление семейным древом — получение, добавление, редактирование, удаление членов рода и их фотографий', 'python', True),
    ('family-wallet', 'Семья и профили', 'Семейный кошелёк: баланс, пополнение, списание, история транзакций.', 'python', True),
    ('feedback', 'Администрирование платформы', 'Получение, отправка и модерация отзывов и идей пользователей', 'python', True),
    ('finance-api', 'Финансы и платежи', 'Финансовый API: транзакции, бюджеты, долги, счета, цели, категории, имущество', 'python', True),
    ('funnel-stats', 'Администрирование платформы', 'Статистика воронки продукта из таблицы product_events.', 'python', True),
    ('garage', 'Быт и хозяйство', 'Управление гаражом семьи: автомобили, ТО, расходы, напоминания, заметки', 'python', True),
    ('generate-diet-plan', 'Здоровье', 'Генерация персонального плана питания через YandexGPT (асинхронный режим).', 'python', True),
    ('generate-docs-pdf', 'Файлы и документы', 'Генерация PDF эксплуатационной документации ПО «Наша Семья».', 'python', True),
    ('generate-image', 'ИИ и ассистенты', 'Генерация изображений через AI (обложки, аватары)', 'python', True),
    ('generate-itinerary', 'ИИ и ассистенты', 'API для генерации туристических маршрутов с помощью YandexGPT.', 'python', True),
    ('generate-pricing-pdf', 'Файлы и документы', 'Генерация PDF тарифной политики ПО «Наша Семья».', 'python', False),
    ('geofence-notifications', 'Задачи и календарь', 'Отправка уведомлений при входе/выходе из геозоны', 'python', True),
    ('geofences', 'Задачи и календарь', 'CRUD географических зон (дом, школа, работа) для трекера', 'python', True),
    ('global-search', 'Администрирование платформы', 'Global Search v2 — PostgreSQL FTS + pg_trgm + ранжирование.', 'python', True),
    ('guest-gifts', 'Быт и хозяйство', 'Список подарков от гостей на семейное событие', 'python', True),
    ('health-ai-analysis', 'Здоровье', 'ИИ-анализ показателей здоровья и рекомендации', 'python', True),
    ('health-doctors', 'Здоровье', 'Картотека врачей семьи: контакты, специализация', 'python', True),
    ('health-insurance', 'Здоровье', 'Полисы страхования членов семьи', 'python', True),
    ('health-medication-reminders', 'Здоровье', 'Система автоматических напоминаний о приёме лекарств из раздела Здоровье.', 'python', True),
    ('health-medications', 'Здоровье', 'Список лекарств и курсов приёма', 'python', True),
    ('health-profiles', 'Здоровье', 'Медицинские профили членов семьи (группа крови, аллергии и т.д.)', 'python', True),
    ('health-records', 'Здоровье', 'Медицинские записи и результаты анализов', 'python', True),
    ('health-telemedicine', 'Здоровье', 'Запись на онлайн-консультацию с врачом', 'python', True),
    ('health-vaccinations', 'Здоровье', 'История прививок членов семьи', 'python', True),
    ('health-vitals', 'Здоровье', 'Показатели здоровья: давление, пульс, вес и т.д.', 'python', True),
    ('home-module', 'Быт и хозяйство', 'Модуль «Дом» Семейной ОС: квартира, коммуналка, показания счётчиков, ремонты.', 'python', True),
    ('image-optimizer', 'Файлы и документы', 'Оптимизация и сжатие изображений для быстрой загрузки страниц', 'python', True),
    ('leisure-ai', 'ИИ и ассистенты', 'ИИ-подбор досуга и активностей для семьи', 'python', True),
    ('life-road', 'Прочее', 'Жизненный путь: важные вехи и события биографии членов семьи', 'python', True),
    ('location-history', 'Задачи и календарь', 'История перемещений участника трекера за период', 'python', True),
    ('max-bot', 'Контент и блог', 'MAX Bot API — приём вебхуков и отправка уведомлений через platform-api.max.ru', 'python', True),
    ('max-poll-cron', 'Контент и блог', 'Cron-задача — раз в 5 минут опрашивает MAX-канал и зеркалит новые посты в публичный блог.', 'python', True),
    ('meal-plans', 'Быт и хозяйство', 'Управление семейным меню на неделю', 'python', True),
    ('medication-intakes', 'Здоровье', 'Отметки о фактическом приёме лекарств', 'python', True),
    ('member-profile', 'Семья и профили', 'Управление расширенными профилями членов семьи (анкеты с детальной информацией)', 'python', True),
    ('memory', 'Прочее', 'Семейный альбом воспоминаний и фотоленты', 'python', True),
    ('notifications-api', 'Задачи и календарь', 'API центра уведомлений — список, прочитать, счётчик непрочитанных', 'python', True),
    ('nutrition', 'Здоровье', 'Backend функция для работы с питанием и подсчётом калорий.', 'python', True),
    ('page-views', 'Администрирование платформы', 'Логирование просмотров страниц сайта', 'python', True),
    ('password-reset', 'Аутентификация и безопасность', 'Password reset via verification code (SMS/Email via Yandex Cloud)', 'python', True),
    ('payment-sbp', 'Финансы и платежи', 'Приём оплаты через Систему быстрых платежей (СБП)', 'python', True),
    ('payments', 'Финансы и платежи', 'Управление подписками и платежами через ЮKassa', 'python', True),
    ('payments-sber', 'Финансы и платежи', 'Обработка донатов через Сбер для поддержки платформы', 'python', True),
    ('payments-tbank', 'Финансы и платежи', 'Управление подписками через Т-Банк (рекуррентные платежи)', 'python', True),
    ('pets', 'Быт и хозяйство', 'Управление питомцами семьи: профили, прививки, ветеринар, лекарства, питание, груминг, активность, расходы, здоровье, вещи, ответственные, фото', 'python', True),
    ('portfolio', 'Развитие детей', 'Модуль Портфолио — агрегатор развития, snapshot, инсайты, достижения.', 'python', True),
    ('portfolio-collect', 'Развитие детей', 'Pull-коллектор метрик портфолио.', 'python', True),
    ('portfolio-health', 'Развитие детей', 'Внутренний health-dashboard для модуля Портфолио.', 'python', True),
    ('portfolio-worker', 'Развитие детей', 'Portfolio Rebuild Worker — фоновая обработка portfolio_rebuild_queue.', 'python', True),
    ('purchases', 'Быт и хозяйство', 'API для работы с семейными покупками по сезонам', 'python', True),
    ('push-notifications', 'Уведомления', 'Отправка push-уведомлений на устройства пользователей', 'python', True),
    ('rate-limiter', 'Аутентификация и безопасность', 'Rate Limiter - защита от брутфорса и DDoS атак', 'python', True),
    ('rating-campaigns', 'Финансы и платежи', 'Управление рейтинговыми акциями (Семья месяца): создание/редактирование акций, лидерборд, призы, выплаты в кошелёк семьи-победителя.', 'python', True),
    ('rating-cron', 'Финансы и платежи', 'Cron-задача для системы рейтингов и реферальной программы. Раз в час пересчитывает лидерборд всех активных кампаний и проверяет активацию приглашён...', 'python', True),
    ('recipes', 'Быт и хозяйство', 'Библиотека семейных рецептов', 'python', True),
    ('referrals', 'Финансы и платежи', 'Реферальная программа — выдача реф-кодов семьям, отслеживание регистраций по коду, начисление бонусов в кошелёк (за регистрацию, за активацию пригл...', 'python', True),
    ('scheduled-reminders', 'Задачи и календарь', 'Единый крон уведомлений — проверяет ВСЕ источники, сохраняет в notifications, отправляет push/MAX/Telegram', 'python', True),
    ('search-indexer', 'Администрирование платформы', 'Search v2 — индексер.', 'python', True),
    ('shopping', 'Быт и хозяйство', 'CRUD операции для списка покупок семьи с реальным сохранением в БД', 'python', True),
    ('sitemap-blog', 'Контент и блог', 'Sitemap — динамически отдаёт XML.', 'python', True),
    ('status-banners-public', 'Администрирование платформы', 'Public read API для системного StatusBanner.', 'python', True),
    ('storage-stats', 'Файлы и документы', 'Статистика использования файлового хранилища S3', 'python', True),
    ('subscription-notifications', 'Финансы и платежи', 'Автоматические уведомления об истечении подписок (Email + Push)', 'python', True),
    ('support-navigator', 'Администрирование платформы', 'Навигатор мер поддержки семьи — подбирает положенные семье меры по её профилю (регион, дети, статус, доход) и ведёт чек-лист оформления с дедлайнами.', 'python', True),
    ('tasks', 'Задачи и календарь', 'CRUD операции для задач семьи (tasks_v2 без FK constraints)', 'python', True),
    ('track-event', 'Задачи и календарь', 'Endpoint для frontend-событий воронки (signup_started, signup_failed, login_failed и др.).', 'python', True),
    ('tree-link-requests', 'Семья и профили', 'Управление заявками на привязку участника семьи к узлу в семейном древе.', 'python', True),
    ('trips', 'Быт и хозяйство', 'Backend функция для работы с путешествиями.', 'python', True),
    ('trips-ai-recommend', 'ИИ и ассистенты', 'AI-помощник для рекомендаций мест в поездках', 'python', True),
    ('upload-file', 'Файлы и документы', 'Универсальная загрузка файлов в S3', 'python', True),
    ('upload-leisure-photo', 'Файлы и документы', 'Загрузка фото для раздела "Досуг"', 'python', True),
    ('upload-medical-file', 'Файлы и документы', 'Загрузка медицинских документов и снимков', 'python', True),
    ('user-management', 'Аутентификация и безопасность', 'Управление профилем, подтверждение email/SMS, восстановление пароля', 'python', True),
    ('votings', 'Задачи и календарь', 'Управление системой голосований (создание, голосование, получение результатов)', 'python', True),
    ('welcome-analytics', 'Контент и блог', 'Аналитика прохождения приветственного онбординга', 'python', True),
    ('yandex-maps-key', 'Уведомления', 'Выдача ключа Яндекс.Карт для фронтенда', 'python', True),
]

# Соответствие backend-функции и её пользовательского фич-флага (там, где флаг существует)
NETWORK_FUNCTION_FLAG_MAP = {
    'family-tracker': 'family_tracker_enabled',
    'family-tracker-members': 'family_tracker_enabled',
    'geofences': 'family_tracker_enabled',
    'geofence-notifications': 'family_tracker_enabled',
    'location-history': 'family_tracker_enabled',
    'family-chat': 'family_chat_enabled',
    'push-notifications': 'push_notifications_enabled',
    'ai-assistant': 'ai_assistant_enabled',
    'domovoy-context': 'ai_assistant_enabled',
    'domovoy-studio': 'ai_assistant_enabled',
    'domovoy-donations': 'ai_assistant_enabled',
    'alice': 'alice_skill_enabled',
    'max-bot': 'max_bot_enabled',
    'max-poll-cron': 'max_bot_enabled',
    'payments': 'payments_enabled',
    'payments-sber': 'payments_enabled',
    'payments-tbank': 'payments_enabled',
    'payment-sbp': 'payments_enabled',
    'referrals': 'referral_program_enabled',
    'rating-campaigns': 'rating_campaigns_enabled',
    'rating-cron': 'rating_campaigns_enabled',
    'health-telemedicine': 'telemedicine_enabled',
    'data-export': 'data_export_enabled',
    'auth': 'oauth_login_enabled',
    'analytics': 'analytics_tracking_enabled',
    'analytics-events': 'analytics_tracking_enabled',
    'page-views': 'analytics_tracking_enabled',
    'track-event': 'analytics_tracking_enabled',
    'portfolio': 'portfolio_ai_insights',
}

# Примерная оценка использования конкретной функции: таблица БД, ближе всего описывающая её нагрузку
NETWORK_FUNCTION_USAGE_TABLE = {
    'family-tracker': ('family_location_tracking', 'записей координат'),
    'family-tracker-members': ('family_location_tracking', 'записей координат'),
    'geofences': ('geofence_events', 'событий геозон'),
    'geofence-notifications': ('geofence_events', 'событий геозон'),
    'location-history': ('family_location_tracking', 'записей координат'),
    'family-chat': ('family_chat_messages', 'сообщений отправлено'),
    'push-notifications': ('push_subscriptions', 'активных подписок'),
    'ai-assistant': ('ai_assistant_messages', 'сообщений в диалогах'),
    'alice': ('alice_commands_log', 'голосовых команд'),
    'max-bot': ('max_webhook_log', 'вебхуков обработано'),
    'max-poll-cron': ('max_webhook_log', 'вебхуков обработано'),
    'payments': ('payments', 'платежей проведено'),
    'payments-sber': ('payments', 'платежей проведено'),
    'payments-tbank': ('payments', 'платежей проведено'),
    'payment-sbp': ('payments', 'платежей проведено'),
    'referrals': ('referral_invites', 'приглашений отправлено'),
    'rating-campaigns': ('rating_campaigns', 'активных кампаний'),
    'health-telemedicine': ('telemedicine_sessions', 'сессий проведено'),
    'family-wallet': ('wallet_transactions', 'операций с кошельком'),
    'family-tree': ('family_tree', 'узлов древа создано'),
    'calendar-events': ('calendar_events', 'событий в календарях'),
    'events': ('calendar_events', 'событий в календарях'),
    'tasks': ('tasks_v2', 'задач создано'),
    'blog-api': ('blog_posts', 'постов в блоге'),
    'analytics': ('analytics_metrics', 'метрик записано'),
    'analytics-events': ('analytics_events', 'событий зафиксировано'),
    'page-views': ('page_views', 'просмотров страниц'),
    'family-members': ('family_members', 'участников семей'),
    'auth': ('users', 'пользователей зарегистрировано'),
    'user-management': ('users', 'пользователей зарегистрировано'),
}


def network_functions_list():
    """Полный реестр backend-функций платформы: 131 функция, сгруппированные по категориям,
    с привязкой к фич-флагам (где применимо) и статистикой использования из БД."""
    conn = _conn(); cur = conn.cursor()
    try:
        cur.execute(f"SELECT flag_key, is_enabled, updated_at FROM {SCHEMA}.feature_flags")
        flag_rows = {r[0]: {'enabled': bool(r[1]), 'updated_at': r[2].isoformat() if r[2] else None}
                     for r in cur.fetchall()}
    except Exception:
        conn.rollback()
        flag_rows = {}

    usage_cache: Dict[str, int] = {}

    def get_usage(table: str) -> int:
        if table not in usage_cache:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.{table}")
                usage_cache[table] = int(cur.fetchone()[0])
            except Exception:
                conn.rollback()
                usage_cache[table] = 0
        return usage_cache[table]

    out = []
    for key, category, description, lang, deployed in NETWORK_FUNCTIONS_REGISTRY:
        flag_key = NETWORK_FUNCTION_FLAG_MAP.get(key)
        if flag_key and flag_key in flag_rows:
            enabled = flag_rows[flag_key]['enabled']
            updated_at = flag_rows[flag_key]['updated_at']
            toggleable = True
        else:
            enabled = True
            updated_at = None
            toggleable = False

        usage_info = NETWORK_FUNCTION_USAGE_TABLE.get(key)
        if usage_info:
            table, label = usage_info
            usage_count = get_usage(table)
            usage_label = label
        else:
            usage_count = None
            usage_label = None

        out.append({
            'key': key,
            'category': category,
            'description': description,
            'lang': lang,
            'deployed': deployed,
            'flag_key': flag_key,
            'toggleable': toggleable,
            'enabled': enabled,
            'updated_at': updated_at,
            'usage_count': usage_count,
            'usage_label': usage_label,
        })

    cur.close(); conn.close()

    categories: Dict[str, int] = {}
    for item in out:
        categories[item['category']] = categories.get(item['category'], 0) + 1

    return {
        'functions': out,
        'total': len(out),
        'deployed_count': sum(1 for f in out if f['deployed']),
        'toggleable_count': sum(1 for f in out if f['toggleable']),
        'categories': categories,
    }


# ===== HANDLER =====
def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Универсальный админский API. Роутер по ?resource= параметру."""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Session-Token, X-Admin-Actor',
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

        # Публичный read-only эндпоинт — список фич-флагов для клиента
        if resource == 'public_flags' and method == 'GET':
            return _ok(flags_list(), headers)

        if not _admin_authorized(event):
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
            if resource == 'network_functions':
                return _ok(network_functions_list(), headers)
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