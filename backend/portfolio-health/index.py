"""
Business: Внутренний health-dashboard для модуля Портфолио.
Доступ ТОЛЬКО для staff (по STAFF_EMAILS из env). Возвращает 403 всем остальным.
Args: GET event с X-Auth-Token; query: range=24h|7d
Returns: JSON с операционными метриками
"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

STAFF_EMAILS_RAW = os.environ.get('STAFF_EMAILS', '')
STAFF_EMAILS = {e.strip().lower() for e in STAFF_EMAILS_RAW.split(',') if e.strip()}


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def get_user_email(token: Optional[str]) -> Optional[str]:
    if not token:
        return None
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        token_safe = str(token).replace("'", "''")
        cur.execute(f"""
            SELECT u.email
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = '{token_safe}' AND s.expires_at > NOW()
            LIMIT 1
        """)
        row = cur.fetchone()
        return (row['email'] or '').strip().lower() if row and row.get('email') else None
    finally:
        cur.close()
        conn.close()


def collect_metrics(range_hours: int) -> Dict[str, Any]:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Общие счётчики
        cur.execute(f"SELECT COUNT(*)::int AS n FROM {SCHEMA}.member_portfolios")
        total_portfolios = cur.fetchone()['n']

        cur.execute(f"""
            SELECT COUNT(*)::int AS n FROM {SCHEMA}.member_portfolios
            WHERE last_aggregated_at >= NOW() - INTERVAL '{range_hours} hours'
        """)
        recent_aggregates = cur.fetchone()['n']

        cur.execute(f"""
            SELECT COUNT(*)::int AS n FROM {SCHEMA}.member_portfolio_snapshots
            WHERE created_at >= NOW() - INTERVAL '{range_hours} hours'
        """)
        recent_snapshots = cur.fetchone()['n']

        # AI-инсайты
        cur.execute(f"""
            SELECT COUNT(*)::int AS n FROM {SCHEMA}.portfolio_insights
            WHERE generated_by = 'ai' AND created_at >= NOW() - INTERVAL '{range_hours} hours'
        """)
        ai_insights_recent = cur.fetchone()['n']

        # Профили без snapshot > 25 дней
        cur.execute(f"""
            SELECT COUNT(*)::int AS n
            FROM {SCHEMA}.member_portfolios mp
            LEFT JOIN (
                SELECT member_id, MAX(snapshot_date) AS last_snap
                FROM {SCHEMA}.member_portfolio_snapshots
                GROUP BY member_id
            ) s ON s.member_id = mp.member_id
            WHERE s.last_snap IS NULL OR s.last_snap < CURRENT_DATE - INTERVAL '25 days'
        """)
        snapshot_overdue = cur.fetchone()['n']

        # Профили с completeness < 40
        cur.execute(f"""
            SELECT COUNT(*)::int AS n FROM {SCHEMA}.member_portfolios
            WHERE completeness < 40
        """)
        low_completeness = cur.fetchone()['n']

        # Распределение completeness по бакетам
        cur.execute(f"""
            SELECT
              SUM(CASE WHEN completeness >= 80 THEN 1 ELSE 0 END)::int AS b80,
              SUM(CASE WHEN completeness >= 60 AND completeness < 80 THEN 1 ELSE 0 END)::int AS b60,
              SUM(CASE WHEN completeness >= 40 AND completeness < 60 THEN 1 ELSE 0 END)::int AS b40,
              SUM(CASE WHEN completeness >= 20 AND completeness < 40 THEN 1 ELSE 0 END)::int AS b20,
              SUM(CASE WHEN completeness < 20 THEN 1 ELSE 0 END)::int AS b0
            FROM {SCHEMA}.member_portfolios
        """)
        buckets = cur.fetchone() or {}

        # Топ пустых сфер: считаем сколько профилей с current_scores->>sphere IS NULL или 0
        spheres = ['intellect', 'emotions', 'body', 'creativity', 'social', 'finance', 'values', 'life_skills']
        empty_spheres = []
        for sp in spheres:
            cur.execute(f"""
                SELECT COUNT(*)::int AS n FROM {SCHEMA}.member_portfolios
                WHERE COALESCE((current_scores->>'{sp}')::float, 0) < 10
            """)
            empty_spheres.append({'sphere': sp, 'empty_count': cur.fetchone()['n']})
        empty_spheres.sort(key=lambda x: x['empty_count'], reverse=True)

        # Достижения
        cur.execute(f"""
            SELECT COUNT(*)::int AS n FROM {SCHEMA}.member_achievements
            WHERE earned_at >= NOW() - INTERVAL '{range_hours} hours'
        """)
        new_badges = cur.fetchone()['n']

        # Планы
        cur.execute(f"""
            SELECT
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)::int AS active,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int AS completed
            FROM {SCHEMA}.member_development_plans
        """)
        plans = cur.fetchone() or {}

        # Аналитика — топ-события за период (если таблица есть)
        try:
            cur.execute(f"""
                SELECT event_name, COUNT(*)::int AS n
                FROM {SCHEMA}.analytics_events
                WHERE created_at >= NOW() - INTERVAL '{range_hours} hours'
                GROUP BY event_name
                ORDER BY n DESC
                LIMIT 20
            """)
            top_events = [dict(r) for r in cur.fetchall()]
        except Exception:
            top_events = []

        return {
            'range_hours': range_hours,
            'totals': {
                'portfolios': total_portfolios,
                'snapshot_overdue': snapshot_overdue,
                'low_completeness': low_completeness,
            },
            'recent': {
                'aggregates': recent_aggregates,
                'snapshots': recent_snapshots,
                'ai_insights': ai_insights_recent,
                'new_badges': new_badges,
            },
            'completeness_buckets': {
                '80+': buckets.get('b80') or 0,
                '60-79': buckets.get('b60') or 0,
                '40-59': buckets.get('b40') or 0,
                '20-39': buckets.get('b20') or 0,
                '0-19': buckets.get('b0') or 0,
            },
            'empty_spheres': empty_spheres,
            'plans': {
                'active': plans.get('active') or 0,
                'completed': plans.get('completed') or 0,
            },
            'top_events': top_events,
        }
    finally:
        cur.close()
        conn.close()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Health-dashboard для модуля Портфолио. Только для staff."""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    if method != 'GET':
        return {'statusCode': 405, 'headers': cors_headers(),
                'body': json.dumps({'error': 'method not allowed'})}

    headers_in = event.get('headers') or {}
    auth_token = headers_in.get('X-Auth-Token') or headers_in.get('x-auth-token')

    email = get_user_email(auth_token)
    if not email or email not in STAFF_EMAILS:
        return {
            'statusCode': 403,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'forbidden', 'code': 'staff_only'}, ensure_ascii=False),
        }

    params = event.get('queryStringParameters') or {}
    rng = (params.get('range') or '24h').lower()
    range_hours = 168 if rng == '7d' else 24

    try:
        data = collect_metrics(range_hours)
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)[:300]}),
        }

    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }
