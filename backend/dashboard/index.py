"""
Business: Дашборд семейной экосистемы — 11 хабов, разделы, прогресс пользователя.
Args: event с httpMethod (GET/POST), headers (X-User-Id), body (для POST с step_id, completed)
Returns: hubs со статистикой и прогрессом пользователя по чек-листам
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


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _get_user_id(event: Dict[str, Any]) -> int:
    headers = event.get('headers') or {}
    raw = headers.get('X-User-Id') or headers.get('x-user-id') or '0'
    try:
        return int(raw)
    except (TypeError, ValueError):
        return 0


def _load_dashboard(user_id: int) -> Dict[str, Any]:
    with _conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"""
                SELECT h.id, h.slug, h.title, h.icon, h.color, h.route, h.position
                FROM {SCHEMA}.dashboard_hubs h
                ORDER BY h.position
            """)
            hubs = [dict(r) for r in cur.fetchall()]

            cur.execute(f"""
                SELECT s.id, s.hub_id, s.slug, s.title, s.icon, s.route, s.position
                FROM {SCHEMA}.dashboard_sections s
                ORDER BY s.hub_id, s.position
            """)
            sections = [dict(r) for r in cur.fetchall()]

            cur.execute(f"""
                SELECT st.id, st.section_id, st.slug, st.title, st.position,
                       COALESCE(p.completed, FALSE) AS completed
                FROM {SCHEMA}.dashboard_steps st
                LEFT JOIN {SCHEMA}.dashboard_user_progress p
                  ON p.step_id = st.id AND p.user_id = {int(user_id)}
                ORDER BY st.section_id, st.position
            """)
            steps = [dict(r) for r in cur.fetchall()]

    steps_by_section: Dict[int, list] = {}
    for st in steps:
        steps_by_section.setdefault(st['section_id'], []).append(st)

    sections_by_hub: Dict[int, list] = {}
    for s in sections:
        s_steps = steps_by_section.get(s['id'], [])
        total = len(s_steps)
        done = sum(1 for x in s_steps if x['completed'])
        s['steps'] = s_steps
        s['progress'] = round(done / total * 100) if total else 0
        s['completed_steps'] = done
        s['total_steps'] = total
        sections_by_hub.setdefault(s['hub_id'], []).append(s)

    total_sections = 0
    completed_sections = 0
    active_hubs = 0
    overall_done = 0
    overall_total = 0

    for h in hubs:
        h_sections = sections_by_hub.get(h['id'], [])
        h['sections'] = h_sections
        if h_sections:
            h_done = sum(s['completed_steps'] for s in h_sections)
            h_total = sum(s['total_steps'] for s in h_sections)
            h['progress'] = round(h_done / h_total * 100) if h_total else 0
            h['total_sections'] = len(h_sections)
            h['completed_sections'] = sum(1 for s in h_sections if s['progress'] == 100)
            overall_done += h_done
            overall_total += h_total
            total_sections += len(h_sections)
            completed_sections += sum(1 for s in h_sections if s['progress'] == 100)
            if h['progress'] > 0:
                active_hubs += 1
        else:
            h['progress'] = 0
            h['total_sections'] = 0
            h['completed_sections'] = 0

    overall = round(overall_done / overall_total * 100) if overall_total else 0

    return {
        'hubs': hubs,
        'stats': {
            'overall_progress': overall,
            'active_hubs': active_hubs,
            'total_hubs': len(hubs),
            'completed_sections': completed_sections,
            'total_sections': total_sections,
        },
    }


def _toggle_step(user_id: int, step_id: int, completed: bool) -> Dict[str, Any]:
    with _conn() as conn:
        with conn.cursor() as cur:
            if completed:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.dashboard_user_progress (user_id, step_id, completed, completed_at, updated_at)
                    VALUES ({int(user_id)}, {int(step_id)}, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, step_id) DO UPDATE
                      SET completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                """)
            else:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.dashboard_user_progress (user_id, step_id, completed, updated_at)
                    VALUES ({int(user_id)}, {int(step_id)}, FALSE, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, step_id) DO UPDATE
                      SET completed = FALSE, updated_at = CURRENT_TIMESTAMP
                """)
            conn.commit()
    return {'ok': True, 'step_id': step_id, 'completed': completed}


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
