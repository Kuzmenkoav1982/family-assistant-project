"""
Business: Рейтинг семей по заполненности дашборда. Возвращает место конкретной семьи и топ.
Args: event с httpMethod=GET, headers (X-User-Id) — для определения family_id текущего пользователя
Returns: rank, total, percentile, top10
"""
import json
import os
from typing import Any, Dict
import psycopg2

SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def _esc(s: str) -> str:
    return str(s).replace("'", "''")


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _get_user_id(event: Dict[str, Any]) -> str:
    headers = event.get('headers') or {}
    raw = headers.get('X-User-Id') or headers.get('x-user-id') or ''
    return str(raw).strip()[:128]


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'method not allowed'}),
        }

    user_id = _get_user_id(event)
    uid = _esc(user_id)

    try:
        with _conn() as conn:
            with conn.cursor() as cur:
                # family_id текущего пользователя
                cur.execute(
                    f"SELECT family_id::text FROM {SCHEMA}.family_members "
                    f"WHERE user_id::text = '{uid}' LIMIT 1"
                )
                row = cur.fetchone()
                family_id = str(row[0]) if row and row[0] else ''

                # Общее количество семей
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.family_dashboard_snapshot")
                total_row = cur.fetchone()
                total = int(total_row[0]) if total_row else 0

                rank = None
                overall_progress = 0
                activity_score = 0
                if family_id and total > 0:
                    fid = _esc(family_id)
                    cur.execute(f"""
                        SELECT overall_progress, activity_score
                        FROM {SCHEMA}.family_dashboard_snapshot
                        WHERE family_id = '{fid}'
                    """)
                    me = cur.fetchone()
                    if me:
                        overall_progress = int(me[0] or 0)
                        activity_score = int(me[1] or 0)
                        # Считаем сколько семей строго выше по activity_score
                        cur.execute(f"""
                            SELECT COUNT(*)::int
                            FROM {SCHEMA}.family_dashboard_snapshot
                            WHERE activity_score > {activity_score}
                        """)
                        better = cur.fetchone()
                        rank = int(better[0]) + 1 if better else 1

                # Топ-5 семей
                cur.execute(f"""
                    SELECT family_id, family_name, overall_progress, activity_score, members_count
                    FROM {SCHEMA}.family_dashboard_snapshot
                    ORDER BY activity_score DESC, overall_progress DESC
                    LIMIT 5
                """)
                top_rows = cur.fetchall()
                top = [
                    {
                        'family_id': str(r[0]),
                        'family_name': str(r[1] or 'Семья'),
                        'overall_progress': int(r[2] or 0),
                        'activity_score': int(r[3] or 0),
                        'members_count': int(r[4] or 1),
                        'is_me': str(r[0]) == family_id,
                    }
                    for r in top_rows
                ]

        percentile = None
        if rank and total > 0:
            percentile = round((1 - (rank - 1) / total) * 100)

        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'family_id': family_id,
                'rank': rank,
                'total': total,
                'percentile': percentile,
                'overall_progress': overall_progress,
                'activity_score': activity_score,
                'top': top,
            }, ensure_ascii=False),
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
        }
