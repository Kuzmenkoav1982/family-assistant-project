"""
Business: Pull-коллектор метрик портфолио.
Ходит по таблицам хабов и заливает агрегированные значения в member_portfolio_metrics.
Вся бизнес-логика коллекторов — в portfolio/shared_collectors.py (единственный источник правды).

Args: event с httpMethod, queryStringParameters (member_id | family_id)
Returns: JSON {collected: int, by_source: {source: n_metrics}}
"""

import json
import os
from typing import Dict, Any

import psycopg2
from psycopg2.extras import RealDictCursor

from shared_collectors import collect_all, COLLECTORS

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
    }


def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def _esc(value: Any) -> str:
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def collect_for_member(member_id: str) -> Dict[str, Any]:
    """Запускает полный pipeline для одного участника."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        by_source = collect_all(cur, SCHEMA, member_id)
        # -1 в by_source означает ошибку в конкретном коллекторе
        errors = {k: 'collector error' for k, v in by_source.items() if v == -1}
        clean = {k: v for k, v in by_source.items() if v >= 0}
        total = sum(clean.values())
        result: Dict[str, Any] = {'collected': total, 'by_source': clean}
        if errors:
            result['errors'] = errors
        return result
    finally:
        cur.close()
        conn.close()


def collect_for_family(family_id: str) -> Dict[str, Any]:
    """Запускает pipeline для всех участников семьи."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    members = []
    try:
        cur.execute(f"""
            SELECT id FROM {SCHEMA}.family_members
            WHERE family_id = {_esc(family_id)}::uuid
        """)
        members = [str(r['id']) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()

    results: Dict[str, Any] = {}
    total = 0
    for mid in members:
        r = collect_for_member(mid)
        results[mid] = r
        total += r.get('collected', 0)
    return {'collected': total, 'members': len(members), 'details': results}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Pull-коллектор метрик портфолио из всех хабов."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    member_id = params.get('member_id')
    family_id = params.get('family_id')

    try:
        if member_id:
            result = collect_for_member(member_id)
        elif family_id:
            result = collect_for_family(family_id)
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'member_id or family_id required'}),
            }
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(result, ensure_ascii=False, default=str),
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }