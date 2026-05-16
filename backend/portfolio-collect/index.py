"""
Business: Pull-коллектор метрик портфолио. Ходит по таблицам хабов (здоровье, настроение, задачи, финансы и т.д.) и заливает агрегированные значения в member_portfolio_metrics. Вызывается перед aggregate.
Args: event с httpMethod, queryStringParameters (member_id, family_id опционально)
Returns: JSON {collected: int, by_source: {...}}
"""

import json
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta, timezone
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

ACTIVITY_TO_SPHERE = {
    'sport': 'body', 'спорт': 'body', 'физ': 'body',
    'art': 'creativity', 'творч': 'creativity', 'муз': 'creativity', 'рисов': 'creativity',
    'lang': 'intellect', 'язык': 'intellect', 'математ': 'intellect', 'школ': 'intellect',
    'social': 'social', 'театр': 'creativity',
}

SKILL_CATEGORY_TO_SPHERE = {
    'cognitive': 'intellect', 'speech': 'intellect', 'language': 'intellect',
    'motor': 'body', 'physical': 'body',
    'social': 'social', 'communication': 'social',
    'emotional': 'emotions', 'emotion': 'emotions',
    'creative': 'creativity', 'art': 'creativity',
    'self_care': 'life_skills', 'independence': 'life_skills',
    'finance': 'finance', 'money': 'finance',
    'values': 'values', 'morals': 'values',
}

SKILL_LEVEL_SCORES = {
    'не освоен': 20, 'не_освоен': 20, 'low': 20, 'beginner': 20,
    'осваивает': 50, 'осваивается': 50, 'medium': 50, 'middle': 50,
    'освоен': 80, 'good': 80, 'high': 80, 'advanced': 80,
    'мастер': 95, 'отлично': 95, 'excellent': 95, 'highest': 95,
}

MOOD_SCORES = {
    'sad': 20, 'грустно': 20, 'плохо': 20,
    'tired': 35, 'устал': 35,
    'neutral': 50, 'нормально': 50,
    'happy': 80, 'хорошо': 80, 'радость': 80,
    'excited': 95, 'отлично': 95, 'супер': 95,
}


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


def esc(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def upsert_metric(
    cur,
    member_id: str,
    sphere: str,
    metric_key: str,
    value: float,
    unit: str,
    source_type: str,
    source_id: str,
    measured_at: str,
    raw_value: Optional[str] = None,
) -> None:
    """Идемпотентный upsert по (member_id, source_type, source_id, metric_key)."""
    cur.execute(f"""
        DELETE FROM {SCHEMA}.member_portfolio_metrics
        WHERE member_id = {esc(member_id)}::uuid
          AND source_type = {esc(source_type)}
          AND source_id = {esc(source_id)}
          AND metric_key = {esc(metric_key)}
    """)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.member_portfolio_metrics
            (member_id, sphere_key, metric_key, metric_value, metric_unit,
             source_type, source_id, measured_at, raw_value)
        VALUES (
            {esc(member_id)}::uuid,
            {esc(sphere)},
            {esc(metric_key)},
            {value},
            {esc(unit)},
            {esc(source_type)},
            {esc(source_id)},
            {esc(measured_at)}::timestamp,
            {esc(raw_value) if raw_value else 'NULL'}
        )
    """)


def collect_vaccinations(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, date, vaccine FROM {SCHEMA}.children_vaccinations
        WHERE member_id = {esc(member_id)}
        ORDER BY date DESC LIMIT 50
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    count = len(rows)
    last_date = rows[0]['date']
    upsert_metric(
        cur, member_id, 'body', 'vaccinations', float(count), 'count',
        'children_vaccinations', f'agg_{member_id}',
        str(last_date), f'{count} прививок',
    )
    return 1


def collect_doctor_visits(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, date, doctor, specialty FROM {SCHEMA}.children_doctor_visits
        WHERE member_id = {esc(member_id)}
        ORDER BY date DESC LIMIT 50
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    count = len(rows)
    last_date = rows[0]['date']
    upsert_metric(
        cur, member_id, 'body', 'doctor_visits', float(count), 'count',
        'children_doctor_visits', f'agg_{member_id}',
        str(last_date), f'{count} визитов',
    )
    return 1


def collect_vitals(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, type, value, unit, date FROM {SCHEMA}.vital_records
        WHERE profile_id = {esc(member_id)}
        ORDER BY date DESC LIMIT 100
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    by_type: Dict[str, List[Any]] = {}
    for r in rows:
        by_type.setdefault(r['type'], []).append(r)
    written = 0
    for t, items in by_type.items():
        if t in ('height', 'weight'):
            last = items[0]
            try:
                val = float(last['value'])
            except (ValueError, TypeError):
                continue
            unit = last.get('unit') or ('см' if t == 'height' else 'кг')
            upsert_metric(
                cur, member_id, 'body', f'vital_{t}', val, unit,
                'vital_records', str(last['id']),
                str(last['date']), f'{last["value"]}{unit}',
            )
            written += 1
        else:
            count = len(items)
            upsert_metric(
                cur, member_id, 'body', f'vital_{t}_count', float(count), 'count',
                'vital_records', f'agg_{t}_{member_id}',
                str(items[0]['date']), f'{count} замеров',
            )
            written += 1
    return written


def collect_mood(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, mood, entry_date FROM {SCHEMA}.children_mood_entries
        WHERE member_id = {esc(member_id)}::uuid
          AND entry_date >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY entry_date DESC LIMIT 200
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    scores = []
    for r in rows:
        m = (r.get('mood') or '').lower().strip()
        if m in MOOD_SCORES:
            scores.append(MOOD_SCORES[m])
    written = 0
    if scores:
        avg = sum(scores) / len(scores)
        upsert_metric(
            cur, member_id, 'emotions', 'mood_average', round(avg, 1), 'score',
            'children_mood_entries', f'agg_{member_id}',
            str(rows[0]['entry_date']), f'{len(scores)} записей',
        )
        written += 1
    upsert_metric(
        cur, member_id, 'emotions', 'mood_diary_count', float(len(rows)), 'count',
        'children_mood_entries', f'agg_count_{member_id}',
        str(rows[0]['entry_date']), f'{len(rows)} записей',
    )
    written += 1
    return written


def collect_skills(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT s.id, s.category, s.skill_name, s.skill_level, s.created_at, a.assessment_date
        FROM {SCHEMA}.child_skills s
        JOIN {SCHEMA}.child_development_assessments a ON s.assessment_id = a.id
        WHERE a.child_id = {esc(member_id)}
        ORDER BY a.assessment_date DESC LIMIT 200
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    by_sphere: Dict[str, List[int]] = {}
    for r in rows:
        cat = (r.get('category') or '').lower().strip()
        sphere = SKILL_CATEGORY_TO_SPHERE.get(cat)
        if not sphere:
            for k, v in SKILL_CATEGORY_TO_SPHERE.items():
                if k in cat:
                    sphere = v
                    break
        if not sphere:
            continue
        lvl = (r.get('skill_level') or '').lower().strip()
        score = SKILL_LEVEL_SCORES.get(lvl)
        if score is None:
            for k, v in SKILL_LEVEL_SCORES.items():
                if k in lvl:
                    score = v
                    break
        if score is None:
            continue
        by_sphere.setdefault(sphere, []).append(score)

    written = 0
    last_date = str(rows[0].get('assessment_date') or rows[0].get('created_at'))
    for sphere, scores in by_sphere.items():
        avg = sum(scores) / len(scores)
        upsert_metric(
            cur, member_id, sphere, 'skills_average', round(avg, 1), 'score',
            'child_skills', f'agg_{sphere}_{member_id}',
            last_date, f'{len(scores)} навыков',
        )
        written += 1
    return written


def collect_activities(cur, member_id: str) -> int:
    """Через children_development → children_activities."""
    cur.execute(f"""
        SELECT a.id, a.type, a.name, a.status, a.created_at, d.area
        FROM {SCHEMA}.children_activities a
        JOIN {SCHEMA}.children_development d ON a.development_id = d.id
        WHERE d.member_id = {esc(member_id)}
          AND COALESCE(a.status, '') NOT IN ('cancelled', 'отменено')
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    by_sphere: Dict[str, int] = {}
    for r in rows:
        text = ((r.get('type') or '') + ' ' + (r.get('name') or '') + ' ' + (r.get('area') or '')).lower()
        sphere = None
        for key, sph in ACTIVITY_TO_SPHERE.items():
            if key in text:
                sphere = sph
                break
        if not sphere:
            sphere = 'creativity'
        by_sphere[sphere] = by_sphere.get(sphere, 0) + 1
    written = 0
    last_date = str(rows[0].get('created_at') or datetime.now())
    for sphere, count in by_sphere.items():
        upsert_metric(
            cur, member_id, sphere, 'activities', float(count), 'count',
            'children_activities', f'agg_{sphere}_{member_id}',
            last_date, f'{count} занятий',
        )
        written += 1
    return written


def collect_tasks(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, completed, points, completed_date, created_at
        FROM {SCHEMA}.tasks_v2
        WHERE assignee_id = {esc(member_id)}::uuid
          AND completed = TRUE
          AND COALESCE(completed_date, created_at) >= CURRENT_DATE - INTERVAL '90 days'
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    count = len(rows)
    total_points = sum(int(r.get('points') or 0) for r in rows)
    last_date = rows[0].get('completed_date') or rows[0].get('created_at')
    upsert_metric(
        cur, member_id, 'life_skills', 'household_tasks', float(count), 'count',
        'tasks_v2', f'agg_count_{member_id}',
        str(last_date), f'{count} задач',
    )
    if total_points > 0:
        upsert_metric(
            cur, member_id, 'life_skills', 'task_points', float(total_points), 'score',
            'tasks_v2', f'agg_points_{member_id}',
            str(last_date), f'{total_points} баллов',
        )
        return 2
    return 1


def collect_finance(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, balance FROM {SCHEMA}.children_piggybank
        WHERE member_id = {esc(member_id)} LIMIT 1
    """)
    pb = cur.fetchone()
    if not pb:
        return 0
    written = 0
    upsert_metric(
        cur, member_id, 'finance', 'piggybank_balance', float(pb['balance'] or 0), 'score',
        'children_piggybank', str(pb['id']),
        datetime.now(timezone.utc).isoformat(),
        f"{pb['balance']} ₽",
    )
    written += 1
    cur.execute(f"""
        SELECT id, type, amount, date FROM {SCHEMA}.children_transactions
        WHERE piggybank_id = {esc(pb['id'])}
        ORDER BY date DESC LIMIT 50
    """)
    txs = cur.fetchall()
    if txs:
        upsert_metric(
            cur, member_id, 'finance', 'piggybank_transactions', float(len(txs)), 'count',
            'children_transactions', f'agg_{member_id}',
            str(txs[0]['date']), f'{len(txs)} операций',
        )
        written += 1
    return written


def collect_calendar_events(cur, member_id: str) -> int:
    cur.execute(f"""
        SELECT id, date FROM {SCHEMA}.calendar_events
        WHERE child_id = {esc(member_id)}::uuid
          AND date >= CURRENT_DATE - INTERVAL '90 days'
          AND date <= CURRENT_DATE + INTERVAL '30 days'
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    upsert_metric(
        cur, member_id, 'social', 'calendar_events', float(len(rows)), 'count',
        'calendar_events', f'agg_{member_id}',
        str(rows[0]['date']), f'{len(rows)} событий',
    )
    return 1


def collect_traditions(cur, member_id: str) -> int:
    """Семейные традиции — общие на семью, привязываем по family_uuid участника."""
    cur.execute(f"""
        SELECT family_id FROM {SCHEMA}.family_members
        WHERE id = {esc(member_id)}::uuid LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return 0
    family_id = str(row['family_id'])
    cur.execute(f"""
        SELECT id, created_at FROM {SCHEMA}.traditions
        WHERE family_uuid = {esc(family_id)}::uuid AND is_active = TRUE
    """)
    rows = cur.fetchall()
    if not rows:
        return 0
    count = len(rows)
    last_date = max((r.get('created_at') for r in rows if r.get('created_at')), default=datetime.now())
    upsert_metric(
        cur, member_id, 'values', 'family_rituals', float(count), 'count',
        'traditions', f'agg_{family_id}',
        str(last_date), f'{count} традиций',
    )
    return 1


COLLECTORS = [
    ('vital_records', collect_vitals),
    ('children_vaccinations', collect_vaccinations),
    ('children_doctor_visits', collect_doctor_visits),
    ('children_mood_entries', collect_mood),
    ('child_skills', collect_skills),
    ('children_activities', collect_activities),
    ('tasks_v2', collect_tasks),
    ('children_piggybank', collect_finance),
    ('calendar_events', collect_calendar_events),
    ('traditions', collect_traditions),
]


def collect_for_member(member_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    by_source: Dict[str, int] = {}
    errors: Dict[str, str] = {}
    total = 0
    try:
        for source_name, fn in COLLECTORS:
            try:
                n = fn(cur, member_id)
                by_source[source_name] = n
                total += n
            except Exception as e:
                errors[source_name] = str(e)[:200]
        return {'collected': total, 'by_source': by_source, 'errors': errors}
    finally:
        cur.close()
        conn.close()


def collect_for_family(family_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    members = []
    try:
        cur.execute(f"""
            SELECT id FROM {SCHEMA}.family_members
            WHERE family_id = {esc(family_id)}::uuid
        """)
        members = [str(r['id']) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()

    results = {}
    total = 0
    for mid in members:
        r = collect_for_member(mid)
        results[mid] = r
        total += r.get('collected', 0)
    return {'collected': total, 'members': len(members), 'details': results}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Pull-коллектор метрик портфолио из всех хабов."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
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