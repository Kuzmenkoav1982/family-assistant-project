import json
import os
import psycopg2
from typing import Dict, Any

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Сбор и получение аналитики: Web Vitals, активность пользователей, статистика хабов.
    POST ?action=hub — трекинг просмотра раздела
    GET ?action=hub_stats&days=7|30|90 — статистика по хабам для админки
    GET (без action) — Web Vitals и общая активность
    '''
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': '', 'isBase64Encoded': False}

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', '')
        headers = event.get('headers', {})
        user_agent = headers.get('user-agent', '')

        # POST: трекинг просмотра хаба
        if method == 'POST':
            body = event.get('body') or '{}'
            body_data = json.loads(body) if body else {}

            if action == 'hub':
                hub = body_data.get('hub', '')
                hub_label = body_data.get('hub_label', hub)
                family_id = body_data.get('family_id', '')
                session_id = body_data.get('session_id', '')

                if hub:
                    cur.execute(
                        "INSERT INTO hub_events (hub, hub_label, family_id, session_id, user_agent) VALUES (%s, %s, %s, %s, %s)",
                        (hub, hub_label, family_id or None, session_id or None, user_agent)
                    )
                    conn.commit()

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }

            # Стандартный Web Vitals POST
            metric_name = body_data.get('name')
            metric_value = body_data.get('value')
            rating = body_data.get('rating', 'unknown')

            cur.execute(
                "INSERT INTO analytics_metrics (metric_name, metric_value, rating, user_agent) VALUES (%s, %s, %s, %s)",
                (metric_name, metric_value, rating, user_agent)
            )
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }

        elif method == 'GET':

            # GET: статистика по хабам для админки
            if action == 'hub_stats':
                days = int(params.get('days', 7))
                if days not in (7, 30, 90):
                    days = 7

                # Топ хабов по просмотрам
                cur.execute("""
                    SELECT
                        hub,
                        hub_label,
                        COUNT(*) AS views,
                        COUNT(DISTINCT family_id) AS unique_families,
                        COUNT(DISTINCT session_id) AS unique_sessions
                    FROM hub_events
                    WHERE created_at > NOW() - INTERVAL '%s days'
                    GROUP BY hub, hub_label
                    ORDER BY views DESC
                    LIMIT 20
                """ % days)
                rows = cur.fetchall()
                hubs = [
                    {
                        'hub': r[0],
                        'label': r[1],
                        'views': r[2],
                        'unique_families': r[3],
                        'unique_sessions': r[4],
                    }
                    for r in rows
                ]

                # Общее количество просмотров за период
                cur.execute(
                    "SELECT COUNT(*), COUNT(DISTINCT family_id) FROM hub_events WHERE created_at > NOW() - INTERVAL '%s days'" % days
                )
                totals = cur.fetchone()
                total_views = totals[0] or 0
                total_families = totals[1] or 0

                # Просмотры по дням (для графика)
                cur.execute("""
                    SELECT
                        DATE(created_at) AS day,
                        COUNT(*) AS views
                    FROM hub_events
                    WHERE created_at > NOW() - INTERVAL '%s days'
                    GROUP BY DATE(created_at)
                    ORDER BY day ASC
                """ % days)
                daily = [{'day': str(r[0]), 'views': r[1]} for r in cur.fetchall()]

                # Средняя глубина: хабов на семью за период
                cur.execute("""
                    SELECT AVG(cnt) FROM (
                        SELECT family_id, COUNT(DISTINCT hub) AS cnt
                        FROM hub_events
                        WHERE created_at > NOW() - INTERVAL '%s days'
                          AND family_id IS NOT NULL
                        GROUP BY family_id
                    ) sub
                """ % days)
                avg_depth_row = cur.fetchone()
                avg_depth = round(float(avg_depth_row[0]), 1) if avg_depth_row and avg_depth_row[0] else 0.0

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'hubs': hubs,
                        'total_views': total_views,
                        'total_families': total_families,
                        'avg_depth': avg_depth,
                        'days': days,
                        'daily': daily,
                    }),
                    'isBase64Encoded': False
                }

            # Стандартный GET — Web Vitals + активность
            cur.execute("""
                SELECT metric_name, AVG(metric_value) as avg_value, COUNT(*) as count
                FROM analytics_metrics
                WHERE created_at > NOW() - INTERVAL '24 hours'
                GROUP BY metric_name
            """)
            metrics = cur.fetchall()

            cur.execute("SELECT COUNT(*) FROM families")
            total_families = cur.fetchone()[0]

            cur.execute("""
                SELECT COUNT(DISTINCT family_id) FROM calendar_events
                WHERE created_at > NOW() - INTERVAL '1 day'
            """)
            active_today = cur.fetchone()[0]

            cur.execute("""
                SELECT COUNT(DISTINCT family_id) FROM calendar_events
                WHERE created_at > NOW() - INTERVAL '7 days'
            """)
            active_week = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM tasks WHERE created_at > NOW() - INTERVAL '7 days'")
            tasks_week = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM calendar_events WHERE created_at > NOW() - INTERVAL '7 days'")
            events_week = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM shopping_items_v2 WHERE created_at > NOW() - INTERVAL '7 days'")
            shopping_week = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM children_development WHERE created_at > NOW() - INTERVAL '30 days'")
            children_month = cur.fetchone()[0]

            result = {
                'metrics': [
                    {'name': row[0], 'avg_value': float(row[1]), 'count': row[2]}
                    for row in metrics
                ],
                'users': {
                    'total': total_families,
                    'today': active_today,
                    'week': active_week
                },
                'activity': {
                    'tasks_week': tasks_week,
                    'events_week': events_week,
                    'shopping_week': shopping_week,
                    'children_month': children_month
                }
            }

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }

        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    finally:
        cur.close()
        conn.close()
