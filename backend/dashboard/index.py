"""
Business: Дашборд семейной экосистемы — 11 хабов, разделы, прогресс пользователя (авто/ручной режим).
Args: event с httpMethod (GET/POST), headers (X-User-Id), body (для POST с step_id|section_id, completed|mode)
Returns: hubs со статистикой и прогрессом пользователя
"""
import json
import os
from typing import Any, Dict
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

ALLOWED_AUTO_TABLES = {
    'family_members', 'family_tree', 'family_invitations', 'health_records',
    'medications', 'health_profiles', 'vital_records', 'family_meal_plans',
    'recipes', 'shopping_items_v2', 'diet_plans', 'family_values', 'traditions',
    'faith_events', 'family_album', 'calendar_events', 'votings', 'tasks_v2',
    'tasks', 'family_goals', 'finance_budgets', 'finance_goals', 'finance_debts',
    'finance_transactions', 'finance_recurring', 'finance_categories',
    'family_wallet', 'wallet_transactions', 'garage_vehicles', 'purchases', 'trips',
    'trip_wishlist', 'leisure_activities', 'family_location_tracking',
    'fin_edu_progress', 'children_profiles', 'life_events', 'life_goals', 'pets',
    'pet_health_metrics', 'pet_food', 'pet_grooming', 'children_medications',
    'children_doctor_visits',
}
ALLOWED_USER_FIELDS = {'user_id', 'family_id'}


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _get_user_id(event: Dict[str, Any]) -> str:
    headers = event.get('headers') or {}
    raw = headers.get('X-User-Id') or headers.get('x-user-id') or ''
    return str(raw).strip()[:128]


def _esc(s: str) -> str:
    return s.replace("'", "''")


def _resolve_family_id(cur, user_id: str) -> str:
    """Находит family_id пользователя через family_members."""
    try:
        cur.execute(
            f"SELECT family_id::text AS fid FROM {SCHEMA}.family_members "
            f"WHERE user_id::text = '{_esc(user_id)}' LIMIT 1"
        )
        row = cur.fetchone()
        if row:
            if isinstance(row, dict):
                return str(row.get('fid') or '')
            return str(row[0] or '')
    except Exception:
        pass
    return ''


def _count_auto(cur, table: str, field: str, user_id: str, family_id: str, errors: list) -> int:
    if table not in ALLOWED_AUTO_TABLES or field not in ALLOWED_USER_FIELDS:
        errors.append(f"{table}.{field}: not in allowlist")
        return 0
    value = family_id if field == 'family_id' else user_id
    if not value:
        errors.append(f"{table}.{field}: empty value (family_id={family_id})")
        return 0
    try:
        cur.execute(
            f"SELECT COUNT(*) AS c FROM {SCHEMA}.{table} "
            f"WHERE {field}::text = '{_esc(value)}'"
        )
        row = cur.fetchone()
        if row is None:
            return 0
        if isinstance(row, dict):
            return int(row.get('c', 0) or 0)
        return int(row[0] or 0)
    except Exception as e:
        errors.append(f"{table}.{field}: {type(e).__name__}: {str(e)[:100]}")
        return 0


def _load_dashboard(user_id: str) -> Dict[str, Any]:
    uid = _esc(user_id)
    with _conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Резолвим family_id заранее, чтобы использовать в запросах ниже
            family_id = ''
            try:
                cur.execute(
                    f"SELECT family_id::text AS fid FROM {SCHEMA}.family_members "
                    f"WHERE user_id::text = '{uid}' LIMIT 1"
                )
                row = cur.fetchone()
                if row:
                    family_id = str(row.get('fid') or '')
            except Exception:
                family_id = ''
            fid = _esc(family_id)

            cur.execute(f"""
                SELECT id, slug, title, icon, color, route, position,
                       COALESCE(scope, 'family') AS scope
                FROM {SCHEMA}.dashboard_hubs
                ORDER BY position
            """)
            hubs = [dict(r) for r in cur.fetchall()]
            hub_scope_by_id = {h['id']: h.get('scope', 'family') for h in hubs}

            # Режим: для family-хабов берём из dashboard_family_settings, для personal — из dashboard_user_settings
            cur.execute(f"""
                SELECT s.id, s.hub_id, s.slug, s.title, s.icon, s.route, s.position,
                       s.auto_table, s.auto_user_field, s.auto_min_count,
                       s.auto_logic, s.auto_supported,
                       COALESCE(h.scope, 'family') AS hub_scope,
                       COALESCE(
                         CASE WHEN COALESCE(h.scope, 'family') = 'family'
                              THEN fs.mode ELSE us.mode END,
                         'manual'
                       ) AS mode
                FROM {SCHEMA}.dashboard_sections s
                JOIN {SCHEMA}.dashboard_hubs h ON h.id = s.hub_id
                LEFT JOIN {SCHEMA}.dashboard_user_settings us
                  ON us.section_id = s.id AND us.user_id = '{uid}'
                LEFT JOIN {SCHEMA}.dashboard_family_settings fs
                  ON fs.section_id = s.id AND fs.family_id = '{fid}'
                ORDER BY s.hub_id, s.position
            """)
            sections = [dict(r) for r in cur.fetchall()]

            # Шаги: для family-хабов из dashboard_family_progress, для personal — из dashboard_user_progress
            cur.execute(f"""
                SELECT st.id, st.section_id, st.slug, st.title, st.position,
                       COALESCE(h.scope, 'family') AS hub_scope,
                       COALESCE(
                         CASE WHEN COALESCE(h.scope, 'family') = 'family'
                              THEN fp.completed ELSE p.completed END,
                         FALSE
                       ) AS completed
                FROM {SCHEMA}.dashboard_steps st
                JOIN {SCHEMA}.dashboard_sections s ON s.id = st.section_id
                JOIN {SCHEMA}.dashboard_hubs h ON h.id = s.hub_id
                LEFT JOIN {SCHEMA}.dashboard_user_progress p
                  ON p.step_id = st.id AND p.user_id = '{uid}'
                LEFT JOIN {SCHEMA}.dashboard_family_progress fp
                  ON fp.step_id = st.id AND fp.family_id = '{fid}'
                ORDER BY st.section_id, st.position
            """)
            steps = [dict(r) for r in cur.fetchall()]

            steps_by_section: Dict[int, list] = {}
            for st in steps:
                steps_by_section.setdefault(st['section_id'], []).append(st)

            debug_errors: list = []
            with conn.cursor() as ccur:
                debug_family_id = family_id
                for s in sections:
                    s_steps = steps_by_section.get(s['id'], [])
                    s['steps'] = s_steps
                    s['total_steps'] = len(s_steps)
                    s['auto_count'] = 0
                    s['auto_target'] = int(s.get('auto_min_count') or 1)

                    if s.get('mode') == 'auto' and s.get('auto_supported') and s.get('auto_table'):
                        cnt = _count_auto(
                            ccur,
                            s['auto_table'],
                            s.get('auto_user_field') or 'user_id',
                            user_id,
                            family_id,
                            debug_errors,
                        )
                        s['auto_count'] = cnt
                        target = max(1, int(s.get('auto_min_count') or 1))
                        progress = min(100, round(cnt / target * 100))
                        s['progress'] = progress
                        s['completed_steps'] = min(s['total_steps'], int(progress / 100 * s['total_steps']))
                    else:
                        done = sum(1 for x in s_steps if x['completed'])
                        s['completed_steps'] = done
                        s['progress'] = round(done / s['total_steps'] * 100) if s['total_steps'] else 0

    sections_by_hub: Dict[int, list] = {}
    for s in sections:
        sections_by_hub.setdefault(s['hub_id'], []).append(s)

    total_sections = 0
    completed_sections = 0
    active_hubs = 0
    overall_progress_sum = 0
    overall_count = 0

    for h in hubs:
        h_sections = sections_by_hub.get(h['id'], [])
        h['sections'] = h_sections
        if h_sections:
            avg = sum(s['progress'] for s in h_sections) / len(h_sections)
            h['progress'] = round(avg)
            h['total_sections'] = len(h_sections)
            h['completed_sections'] = sum(1 for s in h_sections if s['progress'] == 100)
            total_sections += len(h_sections)
            completed_sections += h['completed_sections']
            overall_progress_sum += avg
            overall_count += 1
            if h['progress'] > 0:
                active_hubs += 1
        else:
            h['progress'] = 0
            h['total_sections'] = 0
            h['completed_sections'] = 0

    overall = round(overall_progress_sum / overall_count) if overall_count else 0

    # Обновляем снимок прогресса семьи для рейтинга
    if family_id:
        try:
            with _conn() as conn2:
                with conn2.cursor() as scur:
                    scur.execute(
                        f"SELECT COUNT(*)::int AS c FROM {SCHEMA}.family_members "
                        f"WHERE family_id::text = '{_esc(family_id)}'"
                    )
                    mrow = scur.fetchone()
                    members_count = int(mrow[0]) if mrow else 1
                    activity = overall * max(1, members_count)
                    scur.execute(f"""
                        INSERT INTO {SCHEMA}.family_dashboard_snapshot
                          (family_id, overall_progress, active_hubs, completed_sections, members_count, activity_score, updated_at)
                        VALUES ('{_esc(family_id)}', {int(overall)}, {int(active_hubs)}, {int(completed_sections)},
                                {int(members_count)}, {int(activity)}, CURRENT_TIMESTAMP)
                        ON CONFLICT (family_id) DO UPDATE SET
                          overall_progress = EXCLUDED.overall_progress,
                          active_hubs = EXCLUDED.active_hubs,
                          completed_sections = EXCLUDED.completed_sections,
                          members_count = EXCLUDED.members_count,
                          activity_score = EXCLUDED.activity_score,
                          updated_at = CURRENT_TIMESTAMP
                    """)
                    conn2.commit()
        except Exception:
            pass

    _ = (debug_family_id, debug_errors, hub_scope_by_id)
    return {
        'hubs': hubs,
        'family_id': family_id,
        'stats': {
            'overall_progress': overall,
            'active_hubs': active_hubs,
            'total_hubs': len(hubs),
            'completed_sections': completed_sections,
            'total_sections': total_sections,
        },
    }


def _scope_for_step(cur, step_id: int) -> str:
    cur.execute(f"""
        SELECT COALESCE(h.scope, 'family') AS scope
        FROM {SCHEMA}.dashboard_steps st
        JOIN {SCHEMA}.dashboard_sections s ON s.id = st.section_id
        JOIN {SCHEMA}.dashboard_hubs h ON h.id = s.hub_id
        WHERE st.id = {int(step_id)}
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return 'family'
    return str(row[0] if not isinstance(row, dict) else row.get('scope', 'family'))


def _scope_for_section(cur, section_id: int) -> str:
    cur.execute(f"""
        SELECT COALESCE(h.scope, 'family') AS scope
        FROM {SCHEMA}.dashboard_sections s
        JOIN {SCHEMA}.dashboard_hubs h ON h.id = s.hub_id
        WHERE s.id = {int(section_id)}
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return 'family'
    return str(row[0] if not isinstance(row, dict) else row.get('scope', 'family'))


def _toggle_step(user_id: str, step_id: int, completed: bool) -> Dict[str, Any]:
    uid = _esc(user_id)
    with _conn() as conn:
        with conn.cursor() as cur:
            scope = _scope_for_step(cur, step_id)
            if scope == 'family':
                family_id = _resolve_family_id(cur, user_id)
                if not family_id:
                    # Фолбэк — пишем как user_progress
                    scope = 'personal'
                else:
                    fid = _esc(family_id)
                    if completed:
                        cur.execute(f"""
                            INSERT INTO {SCHEMA}.dashboard_family_progress
                              (family_id, step_id, completed, completed_at, completed_by, updated_at)
                            VALUES ('{fid}', {int(step_id)}, TRUE, CURRENT_TIMESTAMP, '{uid}', CURRENT_TIMESTAMP)
                            ON CONFLICT (family_id, step_id) DO UPDATE
                              SET completed = TRUE, completed_at = CURRENT_TIMESTAMP,
                                  completed_by = '{uid}', updated_at = CURRENT_TIMESTAMP
                        """)
                    else:
                        cur.execute(f"""
                            INSERT INTO {SCHEMA}.dashboard_family_progress
                              (family_id, step_id, completed, updated_at)
                            VALUES ('{fid}', {int(step_id)}, FALSE, CURRENT_TIMESTAMP)
                            ON CONFLICT (family_id, step_id) DO UPDATE
                              SET completed = FALSE, updated_at = CURRENT_TIMESTAMP
                        """)
            if scope == 'personal':
                if completed:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.dashboard_user_progress (user_id, step_id, completed, completed_at, updated_at)
                        VALUES ('{uid}', {int(step_id)}, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT (user_id, step_id) DO UPDATE
                          SET completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    """)
                else:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.dashboard_user_progress (user_id, step_id, completed, updated_at)
                        VALUES ('{uid}', {int(step_id)}, FALSE, CURRENT_TIMESTAMP)
                        ON CONFLICT (user_id, step_id) DO UPDATE
                          SET completed = FALSE, updated_at = CURRENT_TIMESTAMP
                    """)
            conn.commit()
    return {'ok': True, 'step_id': step_id, 'completed': completed, 'scope': scope}


def _set_mode(user_id: str, section_id: int, mode: str) -> Dict[str, Any]:
    if mode not in ('auto', 'manual'):
        mode = 'manual'
    uid = _esc(user_id)
    with _conn() as conn:
        with conn.cursor() as cur:
            scope = _scope_for_section(cur, section_id)
            if scope == 'family':
                family_id = _resolve_family_id(cur, user_id)
                if family_id:
                    fid = _esc(family_id)
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.dashboard_family_settings (family_id, section_id, mode, updated_at)
                        VALUES ('{fid}', {int(section_id)}, '{mode}', CURRENT_TIMESTAMP)
                        ON CONFLICT (family_id, section_id) DO UPDATE
                          SET mode = '{mode}', updated_at = CURRENT_TIMESTAMP
                    """)
                else:
                    scope = 'personal'
            if scope == 'personal':
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.dashboard_user_settings (user_id, section_id, mode, updated_at)
                    VALUES ('{uid}', {int(section_id)}, '{mode}', CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, section_id) DO UPDATE
                      SET mode = '{mode}', updated_at = CURRENT_TIMESTAMP
                """)
            conn.commit()
    return {'ok': True, 'section_id': section_id, 'mode': mode, 'scope': scope}


def _set_mode_bulk(user_id: str, section_ids: list, mode: str) -> Dict[str, Any]:
    if mode not in ('auto', 'manual'):
        mode = 'manual'
    ids = [int(x) for x in section_ids if str(x).isdigit()]
    if not ids:
        return {'ok': True, 'count': 0}
    uid = _esc(user_id)
    with _conn() as conn:
        with conn.cursor() as cur:
            # Разбиваем секции по scope
            cur.execute(f"""
                SELECT s.id, COALESCE(h.scope, 'family') AS scope
                FROM {SCHEMA}.dashboard_sections s
                JOIN {SCHEMA}.dashboard_hubs h ON h.id = s.hub_id
                WHERE s.id IN ({','.join(str(i) for i in ids)})
            """)
            rows = cur.fetchall()
            family_ids = [int(r[0]) for r in rows if str(r[1]) == 'family']
            personal_ids = [int(r[0]) for r in rows if str(r[1]) != 'family']

            family_id = _resolve_family_id(cur, user_id) if family_ids else ''
            if family_ids and family_id:
                fid = _esc(family_id)
                values = ", ".join(
                    f"('{fid}', {sid}, '{mode}', CURRENT_TIMESTAMP)" for sid in family_ids
                )
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.dashboard_family_settings (family_id, section_id, mode, updated_at)
                    VALUES {values}
                    ON CONFLICT (family_id, section_id) DO UPDATE
                      SET mode = EXCLUDED.mode, updated_at = CURRENT_TIMESTAMP
                """)
            elif family_ids and not family_id:
                personal_ids = personal_ids + family_ids
            if personal_ids:
                values = ", ".join(
                    f"('{uid}', {sid}, '{mode}', CURRENT_TIMESTAMP)" for sid in personal_ids
                )
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.dashboard_user_settings (user_id, section_id, mode, updated_at)
                    VALUES {values}
                    ON CONFLICT (user_id, section_id) DO UPDATE
                      SET mode = EXCLUDED.mode, updated_at = CURRENT_TIMESTAMP
                """)
            conn.commit()
    return {'ok': True, 'count': len(ids), 'mode': mode}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    user_id = _get_user_id(event)

    try:
        if method == 'GET':
            data = _load_dashboard(user_id)
            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps(data, ensure_ascii=False, default=str),
            }

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            action = body.get('action', 'toggle')

            if action == 'mode':
                section_id = int(body.get('section_id', 0))
                mode = str(body.get('mode', 'manual'))
                if not section_id or not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'user_id and section_id required'}),
                    }
                data = _set_mode(user_id, section_id, mode)
                return {
                    'statusCode': 200,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps(data, ensure_ascii=False),
                }

            if action == 'mode_bulk':
                section_ids = body.get('section_ids') or []
                mode = str(body.get('mode', 'manual'))
                if not user_id or not isinstance(section_ids, list):
                    return {
                        'statusCode': 400,
                        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'user_id and section_ids required'}),
                    }
                data = _set_mode_bulk(user_id, section_ids, mode)
                return {
                    'statusCode': 200,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps(data, ensure_ascii=False),
                }

            step_id = int(body.get('step_id', 0))
            completed = bool(body.get('completed', False))
            if not step_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'user_id and step_id required'}),
                }
            data = _toggle_step(user_id, step_id, completed)
            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
                'body': json.dumps(data, ensure_ascii=False),
            }

        return {
            'statusCode': 405,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'method not allowed'}),
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
        }