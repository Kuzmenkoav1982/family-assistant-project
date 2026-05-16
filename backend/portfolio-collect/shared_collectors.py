"""
Shared collector pipeline для портфолио.

Используется из двух точек:
  • portfolio/index.py          — inline при aggregate()
  • portfolio-collect/index.py  — standalone endpoint

Архитектура (три слоя):
  1. _delete_metrics_for_source()  — полный сброс метрик источника
  2. _upsert_metric()              — запись одной метрики
  3. collect_*(cur, member_id)     — каждый источник:
       • собирает данные из БД
       • при rows=[] → удаляет старые метрики (no stale data)
       • при rows>0  → upsert-ит новые
       • возвращает int (кол-во записанных метрик)

COLLECTORS — единый реестр [(source_table, fn), ...].
collect_all(cur, member_id) — запускает весь pipeline.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Callable

# ──────────────────────────────────────────────────────────────────────────────
# Lookup-таблицы
# ──────────────────────────────────────────────────────────────────────────────

ACTIVITY_TO_SPHERE: Dict[str, str] = {
    'sport': 'body', 'спорт': 'body', 'физ': 'body',
    'art': 'creativity', 'творч': 'creativity', 'муз': 'creativity',
    'рисов': 'creativity', 'театр': 'creativity',
    'lang': 'intellect', 'язык': 'intellect', 'математ': 'intellect', 'школ': 'intellect',
    'social': 'social',
}

SKILL_CATEGORY_TO_SPHERE: Dict[str, str] = {
    'cognitive': 'intellect', 'speech': 'intellect', 'language': 'intellect',
    'motor': 'body', 'physical': 'body',
    'social': 'social', 'communication': 'social',
    'emotional': 'emotions', 'emotion': 'emotions',
    'creative': 'creativity', 'art': 'creativity',
    'self_care': 'life_skills', 'independence': 'life_skills',
    'finance': 'finance', 'money': 'finance',
    'values': 'values', 'morals': 'values',
}

SKILL_LEVEL_SCORES: Dict[str, int] = {
    'не освоен': 20, 'не_освоен': 20, 'low': 20, 'beginner': 20,
    'осваивает': 50, 'осваивается': 50, 'medium': 50, 'middle': 50,
    'освоен': 80, 'good': 80, 'high': 80, 'advanced': 80,
    'мастер': 95, 'отлично': 95, 'excellent': 95, 'highest': 95,
}

MOOD_SCORES: Dict[str, int] = {
    'sad': 20, 'грустно': 20, 'плохо': 20,
    'tired': 35, 'устал': 35,
    'neutral': 50, 'нормально': 50,
    'happy': 80, 'хорошо': 80, 'радость': 80,
    'excited': 95, 'отлично': 95, 'супер': 95,
}

# ──────────────────────────────────────────────────────────────────────────────
# Низкоуровневые helper-и
# ──────────────────────────────────────────────────────────────────────────────

def _esc(value: Any) -> str:
    """SQL-экранирование значений (Simple Query Protocol, без параметров)."""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        import json
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"


def _delete_metrics_for_source(cur, schema: str, member_id: str, source_type: str) -> None:
    """Удаляет ВСЕ метрики данного source_type для member.
    Вызывается когда источник вернул пустой результат — гарантирует no stale data.
    """
    cur.execute(f"""
        DELETE FROM {schema}.member_portfolio_metrics
        WHERE member_id = {_esc(member_id)}::uuid
          AND source_type = {_esc(source_type)}
    """)


def _upsert_metric(
    cur,
    schema: str,
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
    """Идемпотентный upsert одной метрики по (member_id, source_type, source_id, metric_key)."""
    cur.execute(f"""
        DELETE FROM {schema}.member_portfolio_metrics
        WHERE member_id = {_esc(member_id)}::uuid
          AND source_type = {_esc(source_type)}
          AND source_id = {_esc(source_id)}
          AND metric_key = {_esc(metric_key)}
    """)
    cur.execute(f"""
        INSERT INTO {schema}.member_portfolio_metrics
            (member_id, sphere_key, metric_key, metric_value, metric_unit,
             source_type, source_id, measured_at, raw_value)
        VALUES (
            {_esc(member_id)}::uuid,
            {_esc(sphere)},
            {_esc(metric_key)},
            {value},
            {_esc(unit)},
            {_esc(source_type)},
            {_esc(source_id)},
            {_esc(measured_at)}::timestamp,
            {_esc(raw_value) if raw_value else 'NULL'}
        )
    """)


# ──────────────────────────────────────────────────────────────────────────────
# Collector-функции (один источник = одна функция)
# Сигнатура: (cur, schema, member_id) -> int  (кол-во записанных метрик)
# ──────────────────────────────────────────────────────────────────────────────

def collect_vitals(cur, schema: str, member_id: str) -> int:
    """Витальные показатели (рост, вес, прочее) → body."""
    cur.execute(f"""
        SELECT id, type, value, unit, date FROM {schema}.vital_records
        WHERE profile_id = {_esc(member_id)}
        ORDER BY date DESC LIMIT 100
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'vital_records')
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
            _upsert_metric(cur, schema, member_id, 'body', f'vital_{t}', val, unit,
                           'vital_records', str(last['id']),
                           str(last['date']), f'{last["value"]}{unit}')
            written += 1
        else:
            count = len(items)
            _upsert_metric(cur, schema, member_id, 'body', f'vital_{t}_count', float(count), 'count',
                           'vital_records', f'agg_{t}_{member_id}',
                           str(items[0]['date']), f'{count} замеров')
            written += 1
    return written


def collect_vaccinations(cur, schema: str, member_id: str) -> int:
    """Прививки → body."""
    cur.execute(f"""
        SELECT id, date, vaccine FROM {schema}.children_vaccinations
        WHERE member_id = {_esc(member_id)}
        ORDER BY date DESC LIMIT 50
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_vaccinations')
        return 0
    count = len(rows)
    _upsert_metric(cur, schema, member_id, 'body', 'vaccinations', float(count), 'count',
                   'children_vaccinations', f'agg_{member_id}',
                   str(rows[0]['date']), f'{count} прививок')
    return 1


def collect_doctor_visits(cur, schema: str, member_id: str) -> int:
    """Визиты к врачу → body."""
    cur.execute(f"""
        SELECT id, date, doctor FROM {schema}.children_doctor_visits
        WHERE member_id = {_esc(member_id)}
        ORDER BY date DESC LIMIT 50
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_doctor_visits')
        return 0
    count = len(rows)
    _upsert_metric(cur, schema, member_id, 'body', 'doctor_visits', float(count), 'count',
                   'children_doctor_visits', f'agg_{member_id}',
                   str(rows[0]['date']), f'{count} визитов')
    return 1


def collect_mood(cur, schema: str, member_id: str) -> int:
    """Дневник настроения → emotions."""
    cur.execute(f"""
        SELECT id, mood, entry_date FROM {schema}.children_mood_entries
        WHERE member_id = {_esc(member_id)}::uuid
          AND entry_date >= CURRENT_DATE - INTERVAL '90 days'
        ORDER BY entry_date DESC LIMIT 200
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_mood_entries')
        return 0
    scores = []
    for r in rows:
        m = (r.get('mood') or '').lower().strip()
        if m in MOOD_SCORES:
            scores.append(MOOD_SCORES[m])
    written = 0
    if scores:
        avg = sum(scores) / len(scores)
        _upsert_metric(cur, schema, member_id, 'emotions', 'mood_average', round(avg, 1), 'score',
                       'children_mood_entries', f'agg_{member_id}',
                       str(rows[0]['entry_date']), f'{len(scores)} записей')
        written += 1
    _upsert_metric(cur, schema, member_id, 'emotions', 'mood_diary_count', float(len(rows)), 'count',
                   'children_mood_entries', f'agg_count_{member_id}',
                   str(rows[0]['entry_date']), f'{len(rows)} записей')
    written += 1
    return written


def collect_skills(cur, schema: str, member_id: str) -> int:
    """Навыки из child_skills → по sphere."""
    cur.execute(f"""
        SELECT s.id, s.category, s.skill_level, s.created_at, a.assessment_date
        FROM {schema}.child_skills s
        JOIN {schema}.child_development_assessments a ON s.assessment_id = a.id
        WHERE a.child_id = {_esc(member_id)}
        ORDER BY a.assessment_date DESC LIMIT 200
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'child_skills')
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
    last_date = str(rows[0].get('assessment_date') or rows[0].get('created_at'))
    written = 0
    for sphere, sc in by_sphere.items():
        avg = sum(sc) / len(sc)
        _upsert_metric(cur, schema, member_id, sphere, 'skills_average', round(avg, 1), 'score',
                       'child_skills', f'agg_{sphere}_{member_id}',
                       last_date, f'{len(sc)} навыков')
        written += 1
    return written


def collect_activities(cur, schema: str, member_id: str) -> int:
    """Кружки и активности → creativity / body / social / intellect."""
    cur.execute(f"""
        SELECT a.id, a.type, a.name, a.created_at, d.area
        FROM {schema}.children_activities a
        JOIN {schema}.children_development d ON a.development_id = d.id
        WHERE d.member_id = {_esc(member_id)}
          AND COALESCE(a.status, '') NOT IN ('cancelled', 'отменено')
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_activities')
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
    last_date = str(rows[0].get('created_at') or datetime.now())
    written = 0
    for sphere, count in by_sphere.items():
        _upsert_metric(cur, schema, member_id, sphere, 'activities', float(count), 'count',
                       'children_activities', f'agg_{sphere}_{member_id}',
                       last_date, f'{count} занятий')
        written += 1
    return written


def collect_tasks(cur, schema: str, member_id: str) -> int:
    """Выполненные задачи (tasks_v2) → life_skills."""
    cur.execute(f"""
        SELECT id, points, completed_date, created_at FROM {schema}.tasks_v2
        WHERE assignee_id = {_esc(member_id)}::uuid
          AND completed = TRUE
          AND COALESCE(completed_date, created_at) >= CURRENT_DATE - INTERVAL '90 days'
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'tasks_v2')
        return 0
    count = len(rows)
    total_points = sum(int(r.get('points') or 0) for r in rows)
    last_date = str(rows[0].get('completed_date') or rows[0].get('created_at'))
    _upsert_metric(cur, schema, member_id, 'life_skills', 'household_tasks', float(count), 'count',
                   'tasks_v2', f'agg_count_{member_id}',
                   last_date, f'{count} задач')
    written = 1
    if total_points > 0:
        _upsert_metric(cur, schema, member_id, 'life_skills', 'task_points', float(total_points), 'score',
                       'tasks_v2', f'agg_points_{member_id}',
                       last_date, f'{total_points} баллов')
        written += 1
    return written


def collect_finance(cur, schema: str, member_id: str) -> int:
    """Копилка + транзакции → finance."""
    cur.execute(f"""
        SELECT id, balance FROM {schema}.children_piggybank
        WHERE member_id = {_esc(member_id)} LIMIT 1
    """)
    pb = cur.fetchone()
    if not pb:
        _delete_metrics_for_source(cur, schema, member_id, 'children_piggybank')
        _delete_metrics_for_source(cur, schema, member_id, 'children_transactions')
        return 0
    _upsert_metric(cur, schema, member_id, 'finance', 'piggybank_balance',
                   float(pb['balance'] or 0), 'score',
                   'children_piggybank', str(pb['id']),
                   datetime.now(timezone.utc).isoformat(), f"{pb['balance']} ₽")
    written = 1
    cur.execute(f"""
        SELECT id, date FROM {schema}.children_transactions
        WHERE piggybank_id = {_esc(pb['id'])}
        ORDER BY date DESC LIMIT 50
    """)
    txs = cur.fetchall()
    if txs:
        _upsert_metric(cur, schema, member_id, 'finance', 'piggybank_transactions',
                       float(len(txs)), 'count',
                       'children_transactions', f'agg_{member_id}',
                       str(txs[0]['date']), f'{len(txs)} операций')
        written += 1
    return written


def collect_calendar_events(cur, schema: str, member_id: str) -> int:
    """События календаря ребёнка → social."""
    cur.execute(f"""
        SELECT id, date FROM {schema}.calendar_events
        WHERE child_id = {_esc(member_id)}::uuid
          AND date >= CURRENT_DATE - INTERVAL '90 days'
          AND date <= CURRENT_DATE + INTERVAL '30 days'
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'calendar_events')
        return 0
    _upsert_metric(cur, schema, member_id, 'social', 'calendar_events', float(len(rows)), 'count',
                   'calendar_events', f'agg_{member_id}',
                   str(rows[0]['date']), f'{len(rows)} событий')
    return 1


def collect_traditions(cur, schema: str, member_id: str) -> int:
    """Семейные традиции (общие на семью) → values."""
    cur.execute(f"""
        SELECT family_id FROM {schema}.family_members
        WHERE id = {_esc(member_id)}::uuid LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return 0
    family_id = str(row['family_id'])
    cur.execute(f"""
        SELECT id, created_at FROM {schema}.traditions
        WHERE family_uuid = {_esc(family_id)}::uuid AND is_active = TRUE
    """)
    rows = cur.fetchall()
    if not rows:
        # Удаляем только агрегат для этой семьи
        cur.execute(f"""
            DELETE FROM {schema}.member_portfolio_metrics
            WHERE member_id = {_esc(member_id)}::uuid
              AND source_type = 'traditions'
              AND source_id = {_esc(f'agg_{family_id}')}
        """)
        return 0
    count = len(rows)
    last_date = max((r.get('created_at') for r in rows if r.get('created_at')), default=datetime.now())
    _upsert_metric(cur, schema, member_id, 'values', 'family_rituals', float(count), 'count',
                   'traditions', f'agg_{family_id}',
                   str(last_date), f'{count} традиций')
    return 1


def collect_grades(cur, schema: str, member_id: str) -> int:
    """Школьные оценки → intellect."""
    cur.execute(f"""
        SELECT g.id, g.subject, g.grade, g.date, g.created_at
        FROM {schema}.children_grades g
        JOIN {schema}.children_school s ON s.id = g.school_id
        WHERE s.member_id = {_esc(member_id)}
        ORDER BY g.date DESC LIMIT 200
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_grades')
        return 0
    last_date = str(rows[0].get('date') or rows[0].get('created_at'))
    _upsert_metric(cur, schema, member_id, 'intellect', 'grades_count', float(len(rows)), 'count',
                   'children_grades', f'agg_{member_id}',
                   last_date, f'{len(rows)} оценок')
    written = 1
    grades_scores = [float(r['grade']) for r in rows if r.get('grade') is not None]
    if grades_scores:
        avg_grade = round(sum(grades_scores) / len(grades_scores), 1)
        _upsert_metric(cur, schema, member_id, 'intellect', 'grades_average', avg_grade, 'score',
                       'children_grades', f'agg_avg_{member_id}',
                       last_date, f'Средний балл {avg_grade}')
        written += 1
    return written


def collect_dreams(cur, schema: str, member_id: str) -> int:
    """Мечты / цели ребёнка → values."""
    cur.execute(f"""
        SELECT id, title, achieved, created_at, created_date
        FROM {schema}.children_dreams
        WHERE member_id = {_esc(member_id)}
        ORDER BY created_at DESC LIMIT 100
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_dreams')
        return 0
    last_date = str(rows[0].get('created_at') or rows[0].get('created_date'))
    _upsert_metric(cur, schema, member_id, 'values', 'dreams_count', float(len(rows)), 'count',
                   'children_dreams', f'agg_{member_id}',
                   last_date, f'{len(rows)} мечт')
    written = 1
    achieved = [r for r in rows if r.get('achieved')]
    if achieved:
        _upsert_metric(cur, schema, member_id, 'values', 'dreams_achieved', float(len(achieved)), 'count',
                       'children_dreams', f'agg_achieved_{member_id}',
                       last_date, f'{len(achieved)} исполнено')
        written += 1
    return written


def collect_medications(cur, schema: str, member_id: str) -> int:
    """Лекарства / назначения → body."""
    cur.execute(f"""
        SELECT id, name, start_date, end_date, created_at
        FROM {schema}.children_medications
        WHERE member_id = {_esc(member_id)}
        ORDER BY created_at DESC LIMIT 100
    """)
    rows = cur.fetchall()
    if not rows:
        _delete_metrics_for_source(cur, schema, member_id, 'children_medications')
        return 0
    last_date = str(rows[0].get('created_at') or rows[0].get('start_date'))
    _upsert_metric(cur, schema, member_id, 'body', 'medications_count', float(len(rows)), 'count',
                   'children_medications', f'agg_{member_id}',
                   last_date, f'{len(rows)} назначений')
    return 1


# ──────────────────────────────────────────────────────────────────────────────
# Единый реестр — единственный источник правды по составу pipeline
# ──────────────────────────────────────────────────────────────────────────────

COLLECTORS: List[Tuple[str, Callable]] = [
    ('vital_records',          collect_vitals),
    ('children_vaccinations',  collect_vaccinations),
    ('children_doctor_visits', collect_doctor_visits),
    ('children_mood_entries',  collect_mood),
    ('child_skills',           collect_skills),
    ('children_activities',    collect_activities),
    ('tasks_v2',               collect_tasks),
    ('children_piggybank',     collect_finance),
    ('calendar_events',        collect_calendar_events),
    ('traditions',             collect_traditions),
    ('children_grades',        collect_grades),
    ('children_dreams',        collect_dreams),
    ('children_medications',   collect_medications),
]


def collect_all(cur, schema: str, member_id: str) -> Dict[str, int]:
    """Запускает весь pipeline. Возвращает {source: n_metrics_written}.
    Каждый коллектор защищён try/except — ошибка одного не валит остальные.
    """
    results: Dict[str, int] = {}
    for source_name, fn in COLLECTORS:
        try:
            results[source_name] = fn(cur, schema, member_id)
        except Exception:
            results[source_name] = -1  # -1 = ошибка в коллекторе, не валим остальные
    return results