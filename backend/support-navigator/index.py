"""
Business: Навигатор мер поддержки семьи — подбирает положенные семье меры по её профилю (регион, дети, статус, доход) и ведёт чек-лист оформления с дедлайнами.
Args: event с httpMethod (GET/POST/PUT/OPTIONS), headers (X-User-Id), queryStringParameters (action), body (профиль семьи, статус меры).
Returns: HTTP-ответ со списком мер, профилем пользователя и пользовательскими статусами оформления.
"""
import json
import os
from typing import Any, Dict, List

import psycopg2
import psycopg2.extras


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
}


def _resp(status: int, payload: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': CORS_HEADERS,
        'isBase64Encoded': False,
        'body': json.dumps(payload, ensure_ascii=False, default=str),
    }


def _get_conn():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def _row_to_measure(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'id': row['id'],
        'code': row['code'],
        'title': row['title'],
        'shortDescription': row['short_description'],
        'fullDescription': row['full_description'],
        'category': row['category'],
        'level': row['level'],
        'amountText': row['amount_text'],
        'frequency': row['frequency'],
        'minChildren': row['min_children'],
        'requiresLowIncome': row['requires_low_income'],
        'requiresManyChildren': row['requires_many_children'],
        'requiresPregnancy': row['requires_pregnancy'],
        'requiresSingleParent': row['requires_single_parent'],
        'requiresDisability': row['requires_disability'],
        'requiresMilitaryFamily': row['requires_military_family'],
        'requiresStudent': row['requires_student'],
        'requiresMortgage': row['requires_mortgage'],
        'childAgeMin': row['child_age_min'],
        'childAgeMax': row['child_age_max'],
        'applyUrl': row['apply_url'],
        'legalSource': row['legal_source'],
        'icon': row['icon'],
        'priority': row['priority'],
        'deadlineText': row['deadline_text'],
    }


def _measure_matches(measure: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    """Возвращает {eligible: bool, score: int, reasons: [str], blockers: [str]}."""
    reasons: List[str] = []
    blockers: List[str] = []

    children_count = profile.get('childrenCount', 0) or 0
    children_ages = profile.get('childrenAges', []) or []
    is_pregnant = bool(profile.get('isPregnant'))
    is_single = bool(profile.get('isSingleParent'))
    is_low_income = bool(profile.get('isLowIncome'))
    has_disability = bool(profile.get('hasDisability'))
    is_military = bool(profile.get('isMilitaryFamily'))
    is_student = bool(profile.get('isStudent'))
    has_mortgage = bool(profile.get('hasMortgage'))

    if measure['minChildren'] and children_count < measure['minChildren'] and not is_pregnant:
        blockers.append(f"Нужно минимум {measure['minChildren']} реб.")
    elif measure['minChildren']:
        reasons.append(f"У вас {children_count} реб.")

    if measure['requiresPregnancy'] and not is_pregnant:
        blockers.append('Только для беременных')
    elif measure['requiresPregnancy']:
        reasons.append('Беременность')

    if measure['requiresLowIncome'] and not is_low_income:
        blockers.append('Доход выше прожиточного минимума')
    elif measure['requiresLowIncome']:
        reasons.append('Малообеспеченная семья')

    if measure['requiresManyChildren'] and children_count < 3:
        blockers.append('Только многодетным (3+ детей)')
    elif measure['requiresManyChildren']:
        reasons.append('Многодетная семья')

    if measure['requiresSingleParent'] and not is_single:
        blockers.append('Только для единственного родителя')
    elif measure['requiresSingleParent']:
        reasons.append('Единственный родитель')

    if measure['requiresDisability'] and not has_disability:
        blockers.append('Нужна инвалидность ребёнка')
    elif measure['requiresDisability']:
        reasons.append('Инвалидность ребёнка')

    if measure['requiresMilitaryFamily'] and not is_military:
        blockers.append('Только семьям участников СВО')
    elif measure['requiresMilitaryFamily']:
        reasons.append('Семья участника СВО')

    if measure['requiresStudent'] and not is_student:
        blockers.append('Только студенческим семьям')
    elif measure['requiresStudent']:
        reasons.append('Студенческая семья')

    if measure['requiresMortgage'] and not has_mortgage:
        blockers.append('Нужна ипотека')
    elif measure['requiresMortgage']:
        reasons.append('Есть ипотека')

    age_min = measure.get('childAgeMin')
    age_max = measure.get('childAgeMax')
    if age_min is not None and age_max is not None and children_ages:
        in_range = any(age_min <= int(a) <= age_max for a in children_ages if str(a).isdigit() or isinstance(a, int))
        if not in_range and not is_pregnant:
            blockers.append(f"Возраст ребёнка {age_min}–{age_max}")
        elif in_range:
            reasons.append(f"Возраст ребёнка подходит ({age_min}–{age_max})")

    eligible = not blockers
    score = (measure.get('priority') or 50) + len(reasons) * 5
    if not eligible:
        score = score // 4
    return {'eligible': eligible, 'score': score, 'reasons': reasons, 'blockers': blockers}


def _get_profile(conn, user_id: int) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM support_navigator_profiles WHERE user_id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return {
                'userId': user_id,
                'regionCode': '77',
                'childrenCount': 0,
                'childrenAges': [],
                'isPregnant': False,
                'isSingleParent': False,
                'isLowIncome': False,
                'hasDisability': False,
                'isMilitaryFamily': False,
                'isStudent': False,
                'hasMortgage': False,
                'monthlyIncomePerCapita': None,
                'parentAge': None,
            }
        return {
            'userId': row['user_id'],
            'regionCode': row['region_code'],
            'childrenCount': row['children_count'],
            'childrenAges': row['children_ages'] or [],
            'isPregnant': row['is_pregnant'],
            'isSingleParent': row['is_single_parent'],
            'isLowIncome': row['is_low_income'],
            'hasDisability': row['has_disability'],
            'isMilitaryFamily': row['is_military_family'],
            'isStudent': row['is_student'],
            'hasMortgage': row['has_mortgage'],
            'monthlyIncomePerCapita': row['monthly_income_per_capita'],
            'parentAge': row['parent_age'],
        }


def _save_profile(conn, user_id: int, profile: Dict[str, Any]) -> None:
    region = profile.get('regionCode') or '77'
    children_count = int(profile.get('childrenCount') or 0)
    children_ages_json = json.dumps(profile.get('childrenAges') or [])
    is_pregnant = bool(profile.get('isPregnant'))
    is_single = bool(profile.get('isSingleParent'))
    is_low_income = bool(profile.get('isLowIncome'))
    has_disability = bool(profile.get('hasDisability'))
    is_military = bool(profile.get('isMilitaryFamily'))
    is_student = bool(profile.get('isStudent'))
    has_mortgage = bool(profile.get('hasMortgage'))
    income = profile.get('monthlyIncomePerCapita')
    parent_age = profile.get('parentAge')

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO support_navigator_profiles
                (user_id, region_code, children_count, children_ages, is_pregnant,
                 is_single_parent, is_low_income, has_disability, is_military_family,
                 is_student, has_mortgage, monthly_income_per_capita, parent_age, updated_at)
            VALUES (%s, %s, %s, %s::jsonb, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO UPDATE SET
                region_code = EXCLUDED.region_code,
                children_count = EXCLUDED.children_count,
                children_ages = EXCLUDED.children_ages,
                is_pregnant = EXCLUDED.is_pregnant,
                is_single_parent = EXCLUDED.is_single_parent,
                is_low_income = EXCLUDED.is_low_income,
                has_disability = EXCLUDED.has_disability,
                is_military_family = EXCLUDED.is_military_family,
                is_student = EXCLUDED.is_student,
                has_mortgage = EXCLUDED.has_mortgage,
                monthly_income_per_capita = EXCLUDED.monthly_income_per_capita,
                parent_age = EXCLUDED.parent_age,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                user_id, region, children_count, children_ages_json, is_pregnant,
                is_single, is_low_income, has_disability, is_military,
                is_student, has_mortgage, income, parent_age,
            ),
        )
        conn.commit()


def _list_measures(conn) -> List[Dict[str, Any]]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT * FROM support_measures WHERE is_active = TRUE ORDER BY priority DESC, id ASC")
        return [_row_to_measure(r) for r in cur.fetchall()]


def _list_user_statuses(conn, user_id: int) -> Dict[int, Dict[str, Any]]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            "SELECT measure_id, status, note, deadline_at FROM support_user_measures WHERE user_id = %s",
            (user_id,),
        )
        result: Dict[int, Dict[str, Any]] = {}
        for row in cur.fetchall():
            result[row['measure_id']] = {
                'status': row['status'],
                'note': row['note'],
                'deadlineAt': row['deadline_at'].isoformat() if row['deadline_at'] else None,
            }
        return result


def _set_user_status(conn, user_id: int, measure_id: int, status: str, note: str, deadline_at: Any) -> None:
    safe_status = status if status in ('pending', 'planned', 'in_progress', 'done', 'rejected', 'skipped') else 'pending'
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO support_user_measures (user_id, measure_id, status, note, deadline_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, measure_id) DO UPDATE SET
                status = EXCLUDED.status,
                note = EXCLUDED.note,
                deadline_at = EXCLUDED.deadline_at,
                updated_at = CURRENT_TIMESTAMP
            """,
            (user_id, measure_id, safe_status, note, deadline_at),
        )
        conn.commit()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    user_id_raw = headers.get('X-User-Id') or headers.get('x-user-id') or '0'
    try:
        user_id = int(user_id_raw)
    except (TypeError, ValueError):
        user_id = 0

    qs = event.get('queryStringParameters') or {}
    action = (qs.get('action') or '').strip()

    body_raw = event.get('body') or ''
    body: Dict[str, Any] = {}
    if body_raw:
        try:
            body = json.loads(body_raw)
        except json.JSONDecodeError:
            body = {}

    conn = _get_conn()
    try:
        if method == 'GET' and action == 'measures':
            measures = _list_measures(conn)
            return _resp(200, {'measures': measures})

        if method == 'GET' and action == 'profile':
            if not user_id:
                return _resp(401, {'error': 'unauthorized'})
            profile = _get_profile(conn, user_id)
            return _resp(200, {'profile': profile})

        if method == 'GET' and action == 'recommend':
            measures = _list_measures(conn)
            profile = _get_profile(conn, user_id) if user_id else {}
            user_statuses = _list_user_statuses(conn, user_id) if user_id else {}
            recommended: List[Dict[str, Any]] = []
            for m in measures:
                match = _measure_matches(m, profile)
                user_state = user_statuses.get(m['id'], {'status': 'pending', 'note': None, 'deadlineAt': None})
                recommended.append({**m, 'match': match, 'user': user_state})
            recommended.sort(key=lambda x: (-int(x['match']['eligible']), -x['match']['score']))
            return _resp(200, {'measures': recommended, 'profile': profile})

        if method == 'POST' and action == 'profile':
            if not user_id:
                return _resp(401, {'error': 'unauthorized'})
            _save_profile(conn, user_id, body or {})
            profile = _get_profile(conn, user_id)
            return _resp(200, {'profile': profile, 'saved': True})

        if method == 'POST' and action == 'status':
            if not user_id:
                return _resp(401, {'error': 'unauthorized'})
            measure_id = int(body.get('measureId') or 0)
            status = str(body.get('status') or 'pending')
            note = body.get('note')
            deadline = body.get('deadlineAt')
            if not measure_id:
                return _resp(400, {'error': 'measureId required'})
            _set_user_status(conn, user_id, measure_id, status, note, deadline)
            return _resp(200, {'saved': True})

        return _resp(400, {'error': 'unknown action', 'action': action, 'method': method})
    finally:
        conn.close()
