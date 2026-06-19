"""
Статистика воронки продукта из таблицы product_events.
Возвращает: карточки событий за период, воронку, топ first-value-action, последние события.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

PERIOD_DAYS = {'24h': 1, '7d': 7, '30d': 30}

FUNNEL_EVENTS = [
    'signup_started',
    'signup_completed',
    'family_created',
    'login_success',
    'task_created',
    'chat_message_sent',
    'ai_request_sent',
]

VALUE_EVENTS = ['task_created', 'chat_message_sent', 'ai_request_sent']


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    period = params.get('period', '7d')
    days = PERIOD_DAYS.get(period, 7)
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # 1. Счётчики по каждому событию
    cur.execute(f"""
        SELECT event_name, COUNT(*) AS cnt,
               COUNT(DISTINCT COALESCE(user_id::text, anonymous_id)) AS uniq
        FROM {SCHEMA}.product_events
        WHERE created_at >= '{since}'
        GROUP BY event_name
        ORDER BY cnt DESC
    """)
    counts_raw = cur.fetchall()
    counts = {r['event_name']: {'cnt': r['cnt'], 'uniq': r['uniq']} for r in counts_raw}

    # 2. Страница_views за период (из page_views — живой контур)
    cur.execute(f"""
        SELECT COUNT(*) AS views, COUNT(DISTINCT session_id) AS sessions
        FROM {SCHEMA}.page_views
        WHERE created_at >= '{since}'
    """)
    pv = cur.fetchone()
    page_views = {'views': pv['views'] or 0, 'sessions': pv['sessions'] or 0}

    # 3. Воронка: visits → signup_started → signup_completed → family_created → first value action
    funnel_steps = [
        {'key': 'page_views',       'label': 'Визиты',          'count': page_views['sessions'], 'source': 'page_views'},
        {'key': 'signup_started',   'label': 'Начали регистрацию', 'count': counts.get('signup_started', {}).get('cnt', 0),   'source': 'product_events'},
        {'key': 'signup_completed', 'label': 'Зарегистрировались', 'count': counts.get('signup_completed', {}).get('cnt', 0), 'source': 'product_events'},
        {'key': 'family_created',   'label': 'Создали семью',    'count': counts.get('family_created', {}).get('cnt', 0),    'source': 'product_events'},
        {'key': 'first_value',      'label': 'Первое действие',  'count': max(
            counts.get('task_created', {}).get('cnt', 0),
            counts.get('chat_message_sent', {}).get('cnt', 0),
            counts.get('ai_request_sent', {}).get('cnt', 0),
        ), 'source': 'product_events'},
    ]

    # Добавляем конверсию к каждому шагу
    for i, step in enumerate(funnel_steps):
        prev = funnel_steps[i - 1]['count'] if i > 0 else step['count']
        step['conv'] = round(step['count'] / prev * 100, 1) if prev > 0 else 0

    # 4. Разбивка first value action
    value_breakdown = [
        {'event': e, 'label': {'task_created': 'Задача', 'chat_message_sent': 'Чат', 'ai_request_sent': 'AI'}[e],
         'count': counts.get(e, {}).get('cnt', 0)}
        for e in VALUE_EVENTS
    ]

    # 5. Последние 30 событий
    cur.execute(f"""
        SELECT created_at, event_name, source,
               LEFT(COALESCE(user_id::text, ''), 8)    AS user_short,
               LEFT(COALESCE(anonymous_id, ''), 16)    AS anon_short,
               LEFT(COALESCE(family_id::text, ''), 8)  AS family_short,
               path, properties
        FROM {SCHEMA}.product_events
        WHERE created_at >= '{since}'
        ORDER BY created_at DESC
        LIMIT 30
    """)
    recent = []
    for r in cur.fetchall():
        row = dict(r)
        row['created_at'] = row['created_at'].isoformat() if row.get('created_at') else None
        row['properties'] = dict(row['properties']) if row.get('properties') else None
        recent.append(row)

    # 6. Динамика по дням (events count per day)
    cur.execute(f"""
        SELECT DATE(created_at) AS day, event_name, COUNT(*) AS cnt
        FROM {SCHEMA}.product_events
        WHERE created_at >= '{since}'
        GROUP BY DATE(created_at), event_name
        ORDER BY day
    """)
    daily_raw = cur.fetchall()
    daily: dict = {}
    for r in daily_raw:
        d = str(r['day'])
        if d not in daily:
            daily[d] = {}
        daily[d][r['event_name']] = r['cnt']
    daily_chart = [{'date': d, **v} for d, v in sorted(daily.items())]

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'period': period,
            'counts': counts,
            'page_views': page_views,
            'funnel': funnel_steps,
            'value_breakdown': value_breakdown,
            'recent': recent,
            'daily_chart': daily_chart,
        }, ensure_ascii=False, default=str),
    }
