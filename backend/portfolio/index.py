"""
Business: Модуль Портфолио — агрегатор развития, snapshot, инсайты, достижения.
Действия (action в query): aggregate | get | snapshot | insights | achievements | list | achievement_create
Args: event с httpMethod, queryStringParameters (action, member_id, family_id)
Returns: JSON с данными портфолио или ошибкой

# Release note — Stage 3 hardening (stage-3-frozen-secured)
#  - Все actor-protected actions требуют X-User-Id (401 если нет).
#  - Family-scope проверки: assert_family_match, assert_member_in_actor_family,
#    assert_plan_in_actor_family. Политика 401/403/404 зафиксирована в комментарии
#    блока auth-helpers.
#  - Cron-only path защищён CRON_SECRET, не пересекается с actor flow.
#  - Frontend (src/services/portfolioApi.ts) шлёт канонический X-User-Id = users.id
#    (userData.id из login response), member_id больше не используется как actor-id.
#  - Backend regression: 20/20 в tests.json (unauth/cross-family/happy).
#  - Frontend regression runner: scripts/test-actor-user-id.mjs (14 кейсов, self-contained).
#
# Follow-up (P1, не блокер для roadmap):
#  - Реально прогнать `node scripts/test-actor-user-id.mjs` и зафиксировать вывод.
#  - Manual browser-smoke по чек-листу (portfolio member/family page, history/insights/
#    achievements, plan CRUD, achievement create/attach/reverse), проверить что
#    X-User-Id === userData.id во всех запросах.
"""

import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

SPHERE_KEYS = ['intellect', 'emotions', 'body', 'creativity', 'social', 'finance', 'values', 'life_skills']

SPHERE_LABELS_ADULT = {
    'intellect': 'Интеллект',
    'emotions': 'Эмоциональная сфера',
    'body': 'Тело и здоровье',
    'creativity': 'Творчество',
    'social': 'Социальные навыки',
    'finance': 'Финансовые навыки',
    'values': 'Ценности и характер',
    'life_skills': 'Самостоятельность',
}

SPHERE_LABELS_CHILD = {
    'intellect': 'Ум и знания',
    'emotions': 'Чувства',
    'body': 'Здоровье и спорт',
    'creativity': 'Творчество',
    'social': 'Дружба и общение',
    'finance': 'Деньги',
    'values': 'Что важно',
    'life_skills': 'Самостоятельность',
}

SPHERE_ICONS = {
    'intellect': 'Brain',
    'emotions': 'Heart',
    'body': 'Activity',
    'creativity': 'Palette',
    'social': 'Users',
    'finance': 'Coins',
    'values': 'Star',
    'life_skills': 'Target',
}


def cors_headers() -> Dict[str, str]:
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    if isinstance(value, (list, dict)):
        return "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"


# ============= Auth-context helpers (Portfolio hardening) =============
# Принцип: actor_user_id берётся ТОЛЬКО из заголовков (X-User-Id), это users.id.
# family_id actor-а вычисляется на сервере через family_members.user_id.
# Любой member_id/family_id/plan_id из клиента проверяется на принадлежность
# семье actor-а. Никакого "trust client".
#
# Контракт по http-статусам (зафиксировано):
#   401  — нет X-User-Id вообще.
#   403  — actor есть, но:
#            • у actor нет семьи (action имеет смысл только для семейного контекста),
#            • family_id в URL указан и не совпадает с семьёй actor (cross-family explicit).
#   404  — id-сущность (member_id, plan_id):
#            • не существует, ИЛИ существует но в чужой семье.
#          Намеренно одна и та же ошибка — не раскрываем существование чужих сущностей.


class AuthError(Exception):
    """Доменные ошибки auth — мапятся на HTTP 401/403/404 в handler."""
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def get_actor_user_id(event: Dict[str, Any]) -> str:
    """Достаёт X-User-Id из заголовков. Иначе 401."""
    headers = event.get('headers') or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    uid = headers_lower.get('x-user-id') or headers_lower.get('x-authorization')
    if not uid:
        raise AuthError(401, 'unauthorized: X-User-Id required')
    return str(uid).strip()


def resolve_actor_family_id(actor_user_id: str) -> str:
    """user_id → family_id. Если у actor нет семьи — 403."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members
            WHERE user_id = {esc(actor_user_id)}::uuid LIMIT 1
        """)
        row = cur.fetchone()
        if not row or not row.get('family_id'):
            raise AuthError(403, 'forbidden: actor has no family')
        return str(row['family_id'])
    finally:
        cur.close()
        conn.close()


def get_member_family_id(member_id: str) -> Optional[str]:
    """Семья члена. None если member не существует."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members
            WHERE id = {esc(member_id)}::uuid LIMIT 1
        """)
        row = cur.fetchone()
        return str(row['family_id']) if row and row.get('family_id') else None
    finally:
        cur.close()
        conn.close()


def assert_member_in_actor_family(member_id: str, actor_family_id: str) -> None:
    """member должен принадлежать семье actor. Иначе 404 (не раскрываем, что чужой существует)."""
    mf = get_member_family_id(member_id)
    if mf is None:
        raise AuthError(404, 'member not found')
    if mf != actor_family_id:
        raise AuthError(404, 'member not found')  # умышленно как 404


def assert_family_match(family_id: str, actor_family_id: str) -> None:
    """family_id из клиента должен совпасть с семьёй actor. Иначе 403."""
    if family_id != actor_family_id:
        raise AuthError(403, 'forbidden: family scope mismatch')


def get_plan_family_id(plan_id: str) -> Optional[str]:
    """Семья владельца плана (через member). None если план не существует."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT fm.family_id
            FROM {SCHEMA}.member_development_plans p
            JOIN {SCHEMA}.family_members fm ON fm.id = p.member_id
            WHERE p.id = {esc(plan_id)}::uuid LIMIT 1
        """)
        row = cur.fetchone()
        return str(row['family_id']) if row and row.get('family_id') else None
    finally:
        cur.close()
        conn.close()


def assert_plan_in_actor_family(plan_id: str, actor_family_id: str) -> None:
    pf = get_plan_family_id(plan_id)
    if pf is None:
        raise AuthError(404, 'plan not found')
    if pf != actor_family_id:
        raise AuthError(404, 'plan not found')


def age_to_group(age: Optional[int]) -> str:
    if age is None:
        return '18+'
    if age <= 3:
        return '0-3'
    if age <= 6:
        return '4-6'
    if age <= 10:
        return '7-10'
    if age <= 14:
        return '11-14'
    if age <= 17:
        return '15-17'
    return '18+'


def fetch_member(cur, member_id: str) -> Optional[Dict[str, Any]]:
    cur.execute(f"""
        SELECT id, family_id, name, role, age, birth_date, photo_url, avatar
        FROM {SCHEMA}.family_members
        WHERE id = {esc(member_id)}::uuid
        LIMIT 1
    """)
    row = cur.fetchone()
    return dict(row) if row else None


def fetch_rules(cur, age_group: str) -> List[Dict[str, Any]]:
    cur.execute(f"""
        SELECT sphere_key, metric_key, metric_label, metric_group, weight, expected_count
        FROM {SCHEMA}.sphere_metric_rules
        WHERE age_group = {esc(age_group)}
    """)
    return [dict(r) for r in cur.fetchall()]


def fetch_metrics(cur, member_id: str) -> List[Dict[str, Any]]:
    cur.execute(f"""
        SELECT sphere_key, metric_key, metric_value, metric_unit, source_type, source_id, measured_at, raw_value
        FROM {SCHEMA}.member_portfolio_metrics
        WHERE member_id = {esc(member_id)}::uuid
        ORDER BY measured_at DESC
    """)
    return [dict(r) for r in cur.fetchall()]


def calc_sphere(sphere: str, rules: List[Dict[str, Any]], metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Считает score (0-100) и confidence (0-100) для одной сферы.
    Score: взвешенная сумма ТОЛЬКО по доступным группам метрик.
    Confidence: 50% coverage + 30% freshness + 20% diversity.
    """
    sphere_rules = [r for r in rules if r['sphere_key'] == sphere]
    sphere_metrics = [m for m in metrics if m['sphere_key'] == sphere]

    if not sphere_rules:
        return {'score': 0, 'confidence': 0, 'metric_count': 0, 'sources': []}

    # Группируем правила и метрики по metric_group
    groups = {}
    for r in sphere_rules:
        groups.setdefault(r['metric_group'], []).append(r)

    available_groups_weights = []
    available_group_scores = []

    metrics_by_key: Dict[str, List[Dict[str, Any]]] = {}
    for m in sphere_metrics:
        metrics_by_key.setdefault(m['metric_key'], []).append(m)

    expected_metrics_total = 0
    found_metrics_total = 0

    for group_name, group_rules in groups.items():
        group_weight_sum = sum(float(r['weight']) for r in group_rules)
        if group_weight_sum == 0:
            continue

        group_metric_scores = []
        group_has_data = False

        for r in group_rules:
            mkey = r['metric_key']
            expected = max(1, int(r['expected_count']))
            expected_metrics_total += expected

            if mkey in metrics_by_key:
                vals = metrics_by_key[mkey]
                # Берём последние expected значений
                recent = sorted(vals, key=lambda x: x['measured_at'], reverse=True)[:expected]
                if recent:
                    nums = [float(v['metric_value']) for v in recent if v['metric_value'] is not None]
                    if nums:
                        avg = sum(nums) / len(nums)
                        # Учитываем coverage внутри метрики (если меньше ожидаемого — штраф)
                        coverage = min(1.0, len(nums) / expected)
                        group_metric_scores.append(avg * coverage * float(r['weight']))
                        group_has_data = True
                        found_metrics_total += len(nums)

        if group_has_data:
            score_in_group = sum(group_metric_scores) / group_weight_sum
            available_groups_weights.append(group_weight_sum)
            available_group_scores.append(score_in_group * group_weight_sum)

    if available_groups_weights:
        total_w = sum(available_groups_weights)
        score = sum(available_group_scores) / total_w
    else:
        score = 0.0

    # Confidence
    coverage = min(1.0, found_metrics_total / max(1, expected_metrics_total))

    # Freshness — экспоненциальный спад от самого свежего измерения
    freshness = 0.0
    if sphere_metrics:
        most_recent = max(sphere_metrics, key=lambda x: x['measured_at'])
        days_old = (datetime.now(timezone.utc) - most_recent['measured_at'].replace(tzinfo=timezone.utc)).days
        # 90 дней = 0.5
        freshness = max(0.0, min(1.0, 0.5 ** (days_old / 90.0)))

    # Diversity — % уникальных metric_group из 4
    available_groups_count = len(available_groups_weights)
    diversity = available_groups_count / 4.0

    confidence = 0.5 * coverage + 0.3 * freshness + 0.2 * diversity

    return {
        'score': round(min(100, max(0, score)), 1),
        'confidence': round(min(100, max(0, confidence * 100)), 1),
        'metric_count': len(sphere_metrics),
        'sources': list(set(m['source_type'] for m in sphere_metrics)),
    }


def find_strengths_growth(scores: Dict[str, float], confidences: Dict[str, float]) -> Dict[str, List[str]]:
    """Сильные стороны = top-3 сферы со score >= 70 и confidence >= 40%.
    Зоны роста = bottom-2 сферы со score < 60 и confidence >= 40%."""
    items = [
        (s, scores[s], confidences.get(s, 0))
        for s in SPHERE_KEYS
        if confidences.get(s, 0) >= 40
    ]
    strong = sorted([i for i in items if i[1] >= 70], key=lambda x: -x[1])[:3]
    growth = sorted([i for i in items if i[1] < 60], key=lambda x: x[1])[:2]
    return {
        'strengths': [{'sphere': s, 'score': sc, 'label': SPHERE_LABELS_CHILD[s], 'icon': SPHERE_ICONS[s]} for s, sc, _ in strong],
        'growth_zones': [{'sphere': s, 'score': sc, 'label': SPHERE_LABELS_CHILD[s], 'icon': SPHERE_ICONS[s]} for s, sc, _ in growth],
    }


def gen_next_actions(cur, member_id: str, scores: Dict[str, float], confidences: Dict[str, float]) -> List[Dict[str, Any]]:
    """Генерация одного next_step на сферу — берём из активного плана либо rule-based."""
    cur.execute(f"""
        SELECT sphere_key, next_step, title FROM {SCHEMA}.member_development_plans
        WHERE member_id = {esc(member_id)}::uuid AND status = 'active'
    """)
    plans = {row['sphere_key']: dict(row) for row in cur.fetchall()}

    actions = []
    for sphere in SPHERE_KEYS:
        if sphere in plans:
            actions.append({
                'sphere': sphere,
                'sphere_label': SPHERE_LABELS_CHILD[sphere],
                'icon': SPHERE_ICONS[sphere],
                'action': plans[sphere]['next_step'] or plans[sphere]['title'],
                'source': 'plan',
            })
            continue

        # Rule-based
        score = scores.get(sphere, 0)
        conf = confidences.get(sphere, 0)
        if conf < 40:
            actions.append({
                'sphere': sphere,
                'sphere_label': SPHERE_LABELS_CHILD[sphere],
                'icon': SPHERE_ICONS[sphere],
                'action': f'Добавьте данные по сфере «{SPHERE_LABELS_CHILD[sphere]}» — пока недостаточно для анализа',
                'source': 'rule_low_data',
            })
        elif score < 50:
            actions.append({
                'sphere': sphere,
                'sphere_label': SPHERE_LABELS_CHILD[sphere],
                'icon': SPHERE_ICONS[sphere],
                'action': f'Создайте план развития для сферы «{SPHERE_LABELS_CHILD[sphere]}»',
                'source': 'rule_low_score',
            })
    return actions


def calc_completeness(scores: Dict[str, float], confidences: Dict[str, float]) -> int:
    """Заполненность портфолио = средняя confidence по сферам."""
    if not confidences:
        return 0
    avg_conf = sum(confidences.values()) / len(confidences)
    return round(avg_conf)


# =========================================================================
# PULL-COLLECTOR: подтягиваем метрики из реальных таблиц хабов
# =========================================================================

_ACTIVITY_TO_SPHERE = {
    'sport': 'body', 'спорт': 'body', 'физ': 'body',
    'art': 'creativity', 'творч': 'creativity', 'муз': 'creativity', 'рисов': 'creativity', 'театр': 'creativity',
    'lang': 'intellect', 'язык': 'intellect', 'математ': 'intellect', 'школ': 'intellect',
    'social': 'social',
}

_SKILL_CATEGORY_TO_SPHERE = {
    'cognitive': 'intellect', 'speech': 'intellect', 'language': 'intellect',
    'motor': 'body', 'physical': 'body',
    'social': 'social', 'communication': 'social',
    'emotional': 'emotions', 'emotion': 'emotions',
    'creative': 'creativity', 'art': 'creativity',
    'self_care': 'life_skills', 'independence': 'life_skills',
    'finance': 'finance', 'money': 'finance',
    'values': 'values', 'morals': 'values',
}

_SKILL_LEVEL_SCORES = {
    'не освоен': 20, 'не_освоен': 20, 'low': 20, 'beginner': 20,
    'осваивает': 50, 'осваивается': 50, 'medium': 50, 'middle': 50,
    'освоен': 80, 'good': 80, 'high': 80, 'advanced': 80,
    'мастер': 95, 'отлично': 95, 'excellent': 95, 'highest': 95,
}

_MOOD_SCORES = {
    'sad': 20, 'грустно': 20, 'плохо': 20,
    'tired': 35, 'устал': 35,
    'neutral': 50, 'нормально': 50,
    'happy': 80, 'хорошо': 80, 'радость': 80,
    'excited': 95, 'отлично': 95, 'супер': 95,
}


def _upsert_metric(cur, member_id, sphere, metric_key, value, unit, source_type, source_id, measured_at, raw_value=None):
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
            {esc(member_id)}::uuid, {esc(sphere)}, {esc(metric_key)},
            {value}, {esc(unit)}, {esc(source_type)}, {esc(source_id)},
            {esc(measured_at)}::timestamp,
            {esc(raw_value) if raw_value else 'NULL'}
        )
    """)


def collect_metrics_inline(cur, member_id: str) -> None:
    """Подтягиваем метрики из реальных таблиц хабов в member_portfolio_metrics."""

    # Vitals (рост, вес, прочее)
    try:
        cur.execute(f"""
            SELECT id, type, value, unit, date FROM {SCHEMA}.vital_records
            WHERE profile_id = {esc(member_id)}
            ORDER BY date DESC LIMIT 100
        """)
        rows = cur.fetchall()
        by_type: Dict[str, List[Any]] = {}
        for r in rows:
            by_type.setdefault(r['type'], []).append(r)
        for t, items in by_type.items():
            if t in ('height', 'weight'):
                last = items[0]
                try:
                    val = float(last['value'])
                    unit = last.get('unit') or ('см' if t == 'height' else 'кг')
                    _upsert_metric(cur, member_id, 'body', f'vital_{t}', val, unit,
                                   'vital_records', str(last['id']),
                                   str(last['date']), f'{last["value"]}{unit}')
                except (ValueError, TypeError):
                    continue
            else:
                _upsert_metric(cur, member_id, 'body', f'vital_{t}_count', float(len(items)), 'count',
                               'vital_records', f'agg_{t}_{member_id}',
                               str(items[0]['date']), f'{len(items)} замеров')
    except Exception:
        pass

    # Прививки
    try:
        cur.execute(f"""
            SELECT id, date, vaccine FROM {SCHEMA}.children_vaccinations
            WHERE member_id = {esc(member_id)}
            ORDER BY date DESC LIMIT 50
        """)
        rows = cur.fetchall()
        if rows:
            _upsert_metric(cur, member_id, 'body', 'vaccinations', float(len(rows)), 'count',
                           'children_vaccinations', f'agg_{member_id}',
                           str(rows[0]['date']), f'{len(rows)} прививок')
    except Exception:
        pass

    # Визиты к врачу
    try:
        cur.execute(f"""
            SELECT id, date, doctor FROM {SCHEMA}.children_doctor_visits
            WHERE member_id = {esc(member_id)}
            ORDER BY date DESC LIMIT 50
        """)
        rows = cur.fetchall()
        if rows:
            _upsert_metric(cur, member_id, 'body', 'doctor_visits', float(len(rows)), 'count',
                           'children_doctor_visits', f'agg_{member_id}',
                           str(rows[0]['date']), f'{len(rows)} визитов')
    except Exception:
        pass

    # Дневник настроения
    try:
        cur.execute(f"""
            SELECT id, mood, entry_date FROM {SCHEMA}.children_mood_entries
            WHERE member_id = {esc(member_id)}::uuid
              AND entry_date >= CURRENT_DATE - INTERVAL '90 days'
            ORDER BY entry_date DESC LIMIT 200
        """)
        rows = cur.fetchall()
        if rows:
            scores = []
            for r in rows:
                m = (r.get('mood') or '').lower().strip()
                if m in _MOOD_SCORES:
                    scores.append(_MOOD_SCORES[m])
            if scores:
                avg = sum(scores) / len(scores)
                _upsert_metric(cur, member_id, 'emotions', 'mood_average', round(avg, 1), 'score',
                               'children_mood_entries', f'agg_{member_id}',
                               str(rows[0]['entry_date']), f'{len(scores)} записей')
            _upsert_metric(cur, member_id, 'emotions', 'mood_diary_count', float(len(rows)), 'count',
                           'children_mood_entries', f'agg_count_{member_id}',
                           str(rows[0]['entry_date']), f'{len(rows)} записей')
    except Exception:
        pass

    # Навыки из child_skills
    try:
        cur.execute(f"""
            SELECT s.id, s.category, s.skill_level, s.created_at, a.assessment_date
            FROM {SCHEMA}.child_skills s
            JOIN {SCHEMA}.child_development_assessments a ON s.assessment_id = a.id
            WHERE a.child_id = {esc(member_id)}
            ORDER BY a.assessment_date DESC LIMIT 200
        """)
        rows = cur.fetchall()
        if rows:
            by_sphere: Dict[str, List[int]] = {}
            for r in rows:
                cat = (r.get('category') or '').lower().strip()
                sphere = _SKILL_CATEGORY_TO_SPHERE.get(cat)
                if not sphere:
                    for k, v in _SKILL_CATEGORY_TO_SPHERE.items():
                        if k in cat:
                            sphere = v; break
                if not sphere:
                    continue
                lvl = (r.get('skill_level') or '').lower().strip()
                score = _SKILL_LEVEL_SCORES.get(lvl)
                if score is None:
                    for k, v in _SKILL_LEVEL_SCORES.items():
                        if k in lvl:
                            score = v; break
                if score is None:
                    continue
                by_sphere.setdefault(sphere, []).append(score)
            last_date = str(rows[0].get('assessment_date') or rows[0].get('created_at'))
            for sphere, sc in by_sphere.items():
                avg = sum(sc) / len(sc)
                _upsert_metric(cur, member_id, sphere, 'skills_average', round(avg, 1), 'score',
                               'child_skills', f'agg_{sphere}_{member_id}',
                               last_date, f'{len(sc)} навыков')
    except Exception:
        pass

    # Активности (кружки)
    try:
        cur.execute(f"""
            SELECT a.id, a.type, a.name, a.created_at, d.area
            FROM {SCHEMA}.children_activities a
            JOIN {SCHEMA}.children_development d ON a.development_id = d.id
            WHERE d.member_id = {esc(member_id)}
              AND COALESCE(a.status, '') NOT IN ('cancelled', 'отменено')
        """)
        rows = cur.fetchall()
        if rows:
            by_sphere: Dict[str, int] = {}
            for r in rows:
                text = ((r.get('type') or '') + ' ' + (r.get('name') or '') + ' ' + (r.get('area') or '')).lower()
                sphere = None
                for key, sph in _ACTIVITY_TO_SPHERE.items():
                    if key in text:
                        sphere = sph; break
                if not sphere:
                    sphere = 'creativity'
                by_sphere[sphere] = by_sphere.get(sphere, 0) + 1
            last_date = str(rows[0].get('created_at') or datetime.now())
            for sphere, count in by_sphere.items():
                _upsert_metric(cur, member_id, sphere, 'activities', float(count), 'count',
                               'children_activities', f'agg_{sphere}_{member_id}',
                               last_date, f'{count} занятий')
    except Exception:
        pass

    # Задачи tasks_v2
    try:
        cur.execute(f"""
            SELECT id, points, completed_date, created_at FROM {SCHEMA}.tasks_v2
            WHERE assignee_id = {esc(member_id)}::uuid
              AND completed = TRUE
              AND COALESCE(completed_date, created_at) >= CURRENT_DATE - INTERVAL '90 days'
        """)
        rows = cur.fetchall()
        if rows:
            count = len(rows)
            total_points = sum(int(r.get('points') or 0) for r in rows)
            last_date = rows[0].get('completed_date') or rows[0].get('created_at')
            _upsert_metric(cur, member_id, 'life_skills', 'household_tasks', float(count), 'count',
                           'tasks_v2', f'agg_count_{member_id}',
                           str(last_date), f'{count} задач')
            if total_points > 0:
                _upsert_metric(cur, member_id, 'life_skills', 'task_points', float(total_points), 'score',
                               'tasks_v2', f'agg_points_{member_id}',
                               str(last_date), f'{total_points} баллов')
    except Exception:
        pass

    # Финансы — копилка
    try:
        cur.execute(f"""
            SELECT id, balance FROM {SCHEMA}.children_piggybank
            WHERE member_id = {esc(member_id)} LIMIT 1
        """)
        pb = cur.fetchone()
        if pb:
            _upsert_metric(cur, member_id, 'finance', 'piggybank_balance', float(pb['balance'] or 0), 'score',
                           'children_piggybank', str(pb['id']),
                           datetime.now(timezone.utc).isoformat(), f"{pb['balance']} ₽")
            cur.execute(f"""
                SELECT id, date FROM {SCHEMA}.children_transactions
                WHERE piggybank_id = {esc(pb['id'])}
                ORDER BY date DESC LIMIT 50
            """)
            txs = cur.fetchall()
            if txs:
                _upsert_metric(cur, member_id, 'finance', 'piggybank_transactions', float(len(txs)), 'count',
                               'children_transactions', f'agg_{member_id}',
                               str(txs[0]['date']), f'{len(txs)} операций')
    except Exception:
        pass

    # Календарь (события ребёнка → social)
    try:
        cur.execute(f"""
            SELECT id, date FROM {SCHEMA}.calendar_events
            WHERE child_id = {esc(member_id)}::uuid
              AND date >= CURRENT_DATE - INTERVAL '90 days'
              AND date <= CURRENT_DATE + INTERVAL '30 days'
        """)
        rows = cur.fetchall()
        if rows:
            _upsert_metric(cur, member_id, 'social', 'calendar_events', float(len(rows)), 'count',
                           'calendar_events', f'agg_{member_id}',
                           str(rows[0]['date']), f'{len(rows)} событий')
    except Exception:
        pass

    # Семейные традиции (общие на семью → values)
    try:
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members
            WHERE id = {esc(member_id)}::uuid LIMIT 1
        """)
        row = cur.fetchone()
        if row:
            family_id = str(row['family_id'])
            cur.execute(f"""
                SELECT id, created_at FROM {SCHEMA}.traditions
                WHERE family_id::text = {esc(family_id)}
            """)
            rows = cur.fetchall()
            if rows:
                last_date = max((r.get('created_at') for r in rows if r.get('created_at')), default=datetime.now())
                _upsert_metric(cur, member_id, 'values', 'family_rituals', float(len(rows)), 'count',
                               'traditions', f'agg_{family_id}',
                               str(last_date), f'{len(rows)} традиций')
    except Exception:
        pass


    # Оценки (grades) — через children_school → children_grades
    try:
        cur.execute(f"""
            SELECT g.id, g.subject, g.grade, g.date, g.created_at
            FROM {SCHEMA}.children_grades g
            JOIN {SCHEMA}.children_school s ON s.id = g.school_id
            WHERE s.member_id = {esc(member_id)}
            ORDER BY g.date DESC LIMIT 200
        """)
        rows = cur.fetchall()
        if rows:
            grades_scores = [float(r['grade']) for r in rows if r.get('grade') is not None]
            avg_grade = round(sum(grades_scores) / len(grades_scores), 1) if grades_scores else None
            last_date = str(rows[0].get('date') or rows[0].get('created_at'))
            _upsert_metric(cur, member_id, 'intellect', 'grades_count', float(len(rows)), 'count',
                           'children_grades', f'agg_{member_id}',
                           last_date, f'{len(rows)} оценок')
            if avg_grade is not None:
                _upsert_metric(cur, member_id, 'intellect', 'grades_average', avg_grade, 'score',
                               'children_grades', f'agg_avg_{member_id}',
                               last_date, f'Средний балл {avg_grade}')
    except Exception:
        pass

    # Мечты / цели ребёнка
    try:
        cur.execute(f"""
            SELECT id, title, achieved, created_at, created_date
            FROM {SCHEMA}.children_dreams
            WHERE member_id = {esc(member_id)}
            ORDER BY created_at DESC LIMIT 100
        """)
        rows = cur.fetchall()
        if rows:
            last_date = str(rows[0].get('created_at') or rows[0].get('created_date'))
            _upsert_metric(cur, member_id, 'values', 'dreams_count', float(len(rows)), 'count',
                           'children_dreams', f'agg_{member_id}',
                           last_date, f'{len(rows)} мечт')
            achieved = [r for r in rows if r.get('achieved')]
            if achieved:
                _upsert_metric(cur, member_id, 'values', 'dreams_achieved', float(len(achieved)), 'count',
                               'children_dreams', f'agg_achieved_{member_id}',
                               last_date, f'{len(achieved)} исполнено')
    except Exception:
        pass

    # Лекарства / назначения ребёнка
    try:
        cur.execute(f"""
            SELECT id, name, start_date, end_date, created_at
            FROM {SCHEMA}.children_medications
            WHERE member_id = {esc(member_id)}
            ORDER BY created_at DESC LIMIT 100
        """)
        rows = cur.fetchall()
        if rows:
            last_date = str(rows[0].get('created_at') or rows[0].get('start_date'))
            _upsert_metric(cur, member_id, 'body', 'medications_count', float(len(rows)), 'count',
                           'children_medications', f'agg_{member_id}',
                           last_date, f'{len(rows)} назначений')
    except Exception:
        pass


def aggregate(member_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        member = fetch_member(cur, member_id)
        if not member:
            return {'error': 'Member not found'}

        # Pull-коллектор: подтягиваем актуальные данные из хабов перед расчётом
        try:
            collect_metrics_inline(cur, member_id)
        except Exception:
            pass

        age_group = age_to_group(member.get('age'))
        rules = fetch_rules(cur, age_group)
        metrics = fetch_metrics(cur, member_id)

        scores = {}
        confidences = {}
        sphere_details = {}
        for sphere in SPHERE_KEYS:
            res = calc_sphere(sphere, rules, metrics)
            scores[sphere] = res['score']
            confidences[sphere] = res['confidence']
            sphere_details[sphere] = res

        sg = find_strengths_growth(scores, confidences)
        next_actions = gen_next_actions(cur, member_id, scores, confidences)
        completeness = calc_completeness(scores, confidences)

        # Сохраняем агрегат
        cur.execute(f"""
            INSERT INTO {SCHEMA}.member_portfolios
                (member_id, family_id, age_group, current_scores, confidence_scores,
                 strengths, growth_zones, next_actions, completeness, last_aggregated_at)
            VALUES (
                {esc(str(member['id']))}::uuid,
                {esc(str(member['family_id']))}::uuid,
                {esc(age_group)},
                {esc(scores)}::jsonb,
                {esc(confidences)}::jsonb,
                {esc(sg['strengths'])}::jsonb,
                {esc(sg['growth_zones'])}::jsonb,
                {esc(next_actions)}::jsonb,
                {completeness},
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (member_id) DO UPDATE SET
                age_group = EXCLUDED.age_group,
                current_scores = EXCLUDED.current_scores,
                confidence_scores = EXCLUDED.confidence_scores,
                strengths = EXCLUDED.strengths,
                growth_zones = EXCLUDED.growth_zones,
                next_actions = EXCLUDED.next_actions,
                completeness = EXCLUDED.completeness,
                last_aggregated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        """)

        result = {
            'member': {
                'id': str(member['id']),
                'name': member['name'],
                'role': member['role'],
                'age': member['age'],
                'photo_url': member.get('photo_url'),
                'avatar': member.get('avatar'),
                'birth_date': str(member['birth_date']) if member.get('birth_date') else None,
            },
            'age_group': age_group,
            'scores': scores,
            'confidence': confidences,
            'sphere_details': sphere_details,
            'strengths': sg['strengths'],
            'growth_zones': sg['growth_zones'],
            'next_actions': next_actions,
            'completeness': completeness,
            'aggregated_at': datetime.now(timezone.utc).isoformat(),
        }
    finally:
        cur.close()
        conn.close()

    try:
        auto_generate_badges(member_id)
    except Exception:
        pass
    return result


def get_portfolio(member_id: str) -> Dict[str, Any]:
    """Получить текущее портфолио + предыдущий snapshot для динамики."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        member = fetch_member(cur, member_id)
        if not member:
            return {'error': 'Member not found'}

        # Текущее состояние
        cur.execute(f"""
            SELECT * FROM {SCHEMA}.member_portfolios
            WHERE member_id = {esc(member_id)}::uuid LIMIT 1
        """)
        portfolio_row = cur.fetchone()

        # Если нет — пересчитываем
        if not portfolio_row:
            cur.close()
            conn.close()
            return aggregate(member_id)

        # Предыдущий snapshot 60-120 дней назад
        cur.execute(f"""
            SELECT scores, snapshot_date, summary
            FROM {SCHEMA}.member_portfolio_snapshots
            WHERE member_id = {esc(member_id)}::uuid
              AND snapshot_date < CURRENT_DATE - INTERVAL '60 days'
            ORDER BY snapshot_date DESC LIMIT 1
        """)
        prev_row = cur.fetchone()

        # Достижения
        cur.execute(f"""
            SELECT id, badge_key, title, description, icon, sphere_key, category, earned_at
            FROM {SCHEMA}.member_achievements
            WHERE member_id = {esc(member_id)}::uuid
            ORDER BY earned_at DESC LIMIT 30
        """)
        achievements = [
            {**dict(r), 'id': str(r['id']), 'earned_at': r['earned_at'].isoformat()}
            for r in cur.fetchall()
        ]

        # Активные планы развития
        cur.execute(f"""
            SELECT id, sphere_key, title, description, milestone, target_date, status, progress, next_step
            FROM {SCHEMA}.member_development_plans
            WHERE member_id = {esc(member_id)}::uuid AND status = 'active'
            ORDER BY progress DESC LIMIT 10
        """)
        plans = [
            {**dict(r), 'id': str(r['id']),
             'target_date': str(r['target_date']) if r['target_date'] else None}
            for r in cur.fetchall()
        ]

        # Метрики (для drawer)
        recent_metrics = fetch_metrics(cur, member_id)[:50]

        portfolio = dict(portfolio_row)
        scores = portfolio['current_scores']
        confidence = portfolio['confidence_scores']
        prev_scores = prev_row['scores'] if prev_row else None

        # Считаем динамику
        deltas = {}
        if prev_scores:
            for s in SPHERE_KEYS:
                cur_v = float(scores.get(s, 0))
                prev_v = float(prev_scores.get(s, 0))
                deltas[s] = round(cur_v - prev_v, 1)

        return {
            'member': {
                'id': str(member['id']),
                'name': member['name'],
                'role': member['role'],
                'age': member['age'],
                'photo_url': member.get('photo_url'),
                'avatar': member.get('avatar'),
                'birth_date': str(member['birth_date']) if member.get('birth_date') else None,
            },
            'age_group': portfolio['age_group'],
            'scores': scores,
            'confidence': confidence,
            'deltas': deltas,
            'previous_scores': prev_scores,
            'previous_snapshot_date': str(prev_row['snapshot_date']) if prev_row else None,
            'strengths': portfolio['strengths'],
            'growth_zones': portfolio['growth_zones'],
            'next_actions': portfolio['next_actions'],
            'completeness': portfolio['completeness'],
            'achievements': achievements,
            'plans': plans,
            'recent_metrics': [
                {**{k: v for k, v in m.items() if k != 'measured_at'},
                 'measured_at': m['measured_at'].isoformat(),
                 'metric_value': float(m['metric_value']) if m['metric_value'] is not None else None}
                for m in recent_metrics
            ],
            'sphere_labels_adult': SPHERE_LABELS_ADULT,
            'sphere_labels_child': SPHERE_LABELS_CHILD,
            'sphere_icons': SPHERE_ICONS,
            'last_aggregated_at': portfolio['last_aggregated_at'].isoformat(),
        }
    finally:
        cur.close()
        conn.close()


def list_family_portfolios(family_id: str) -> Dict[str, Any]:
    """Список портфолио всех членов семьи (для главной страницы /portfolio)."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT fm.id, fm.name, fm.role, fm.age, fm.photo_url, fm.avatar, fm.birth_date,
                   mp.current_scores, mp.confidence_scores, mp.completeness,
                   mp.strengths, mp.growth_zones, mp.last_aggregated_at
            FROM {SCHEMA}.family_members fm
            LEFT JOIN {SCHEMA}.member_portfolios mp ON mp.member_id = fm.id
            WHERE fm.family_id = {esc(family_id)}::uuid
              AND fm.member_status = 'active'
            ORDER BY fm.age DESC NULLS LAST
        """)
        rows = cur.fetchall()
        members = []
        for r in rows:
            d = dict(r)
            members.append({
                'id': str(d['id']),
                'name': d['name'],
                'role': d['role'],
                'age': d['age'],
                'photo_url': d.get('photo_url'),
                'avatar': d.get('avatar'),
                'birth_date': str(d['birth_date']) if d.get('birth_date') else None,
                'has_portfolio': d['current_scores'] is not None,
                'scores': d['current_scores'] or {},
                'confidence': d['confidence_scores'] or {},
                'completeness': d['completeness'] or 0,
                'strengths': d['strengths'] or [],
                'growth_zones': d['growth_zones'] or [],
                'last_aggregated_at': d['last_aggregated_at'].isoformat() if d.get('last_aggregated_at') else None,
            })
        return {'family_id': family_id, 'members': members}
    finally:
        cur.close()
        conn.close()


def create_snapshot(member_id: str, trigger_event: str = 'manual') -> Dict[str, Any]:
    """Создаёт исторический snapshot."""
    agg = aggregate(member_id)
    if 'error' in agg:
        return agg

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members WHERE id = {esc(member_id)}::uuid
        """)
        fm = cur.fetchone()
        if not fm:
            return {'error': 'Member not found'}

        summary = {
            'strengths': [s['label'] for s in agg['strengths']],
            'growth_zones': [g['label'] for g in agg['growth_zones']],
            'completeness': agg['completeness'],
        }

        source_count = sum(d['metric_count'] for d in agg['sphere_details'].values())

        cur.execute(f"""
            INSERT INTO {SCHEMA}.member_portfolio_snapshots
                (member_id, family_id, snapshot_date, snapshot_type, age_group,
                 scores, confidence, summary, source_count, trigger_event)
            VALUES (
                {esc(member_id)}::uuid,
                {esc(str(fm['family_id']))}::uuid,
                CURRENT_DATE,
                'milestone',
                {esc(agg['age_group'])},
                {esc(agg['scores'])}::jsonb,
                {esc(agg['confidence'])}::jsonb,
                {esc(summary)}::jsonb,
                {source_count},
                {esc(trigger_event)}
            )
            RETURNING id
        """)
        row = cur.fetchone()
        return {'snapshot_id': str(row['id']), 'trigger_event': trigger_event}
    finally:
        cur.close()
        conn.close()


def gen_insights(member_id: str) -> Dict[str, Any]:
    """Rule-based инсайты на основе текущего состояния."""
    agg = aggregate(member_id)
    if 'error' in agg:
        return agg

    insights: List[Dict[str, Any]] = []

    for sphere in SPHERE_KEYS:
        score = agg['scores'].get(sphere, 0)
        conf = agg['confidence'].get(sphere, 0)
        delta = 0  # В первой версии без delta

        # Правило 1: низкая полнота данных
        if conf < 40:
            insights.append({
                'sphere': sphere,
                'sphere_label': SPHERE_LABELS_CHILD[sphere],
                'severity': 'warning',
                'rule_key': 'low_data',
                'title': f'Мало данных по сфере «{SPHERE_LABELS_CHILD[sphere]}»',
                'text': 'Чтобы получить точную картину, добавьте больше информации.',
                'suggestion': 'Заполните соответствующий хаб платформы.',
            })
            continue

        # Правило 2: сфера сильно просела (low score, high confidence)
        if score < 50 and conf >= 60:
            insights.append({
                'sphere': sphere,
                'sphere_label': SPHERE_LABELS_CHILD[sphere],
                'severity': 'info',
                'rule_key': 'growth_zone',
                'title': f'Зона роста: {SPHERE_LABELS_CHILD[sphere]}',
                'text': f'Текущий уровень {score}/100 — ниже среднего для возраста.',
                'suggestion': 'Создайте план развития для этой сферы.',
            })

        # Правило 3: сильная сторона
        if score >= 80 and conf >= 60:
            insights.append({
                'sphere': sphere,
                'sphere_label': SPHERE_LABELS_CHILD[sphere],
                'severity': 'success',
                'rule_key': 'strength',
                'title': f'Сильная сторона: {SPHERE_LABELS_CHILD[sphere]}',
                'text': f'Уровень {score}/100 — это здорово!',
                'suggestion': 'Поддерживайте интерес и развивайте дальше.',
            })

    # Правило 4: общая активность
    if agg['completeness'] < 40:
        insights.append({
            'sphere': None,
            'sphere_label': 'Портфолио',
            'severity': 'warning',
            'rule_key': 'low_completeness',
            'title': 'Портфолио заполнено мало',
            'text': f'Заполненность {agg["completeness"]}%.',
            'suggestion': 'Добавьте данные по разным сферам для точного анализа.',
        })

    return {'insights': insights, 'count': len(insights)}


def list_achievements(member_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT id, badge_key, title, description, icon, sphere_key, category, earned_at
            FROM {SCHEMA}.member_achievements
            WHERE member_id = {esc(member_id)}::uuid
            ORDER BY earned_at DESC
        """)
        achievements = [
            {**dict(r), 'id': str(r['id']), 'earned_at': r['earned_at'].isoformat()}
            for r in cur.fetchall()
        ]
        return {'achievements': achievements, 'count': len(achievements)}
    finally:
        cur.close()
        conn.close()


def gen_ai_insights(member_id: str) -> Dict[str, Any]:
    """AI-инсайты через YandexGPT на основе текущего состояния портфолио."""
    import urllib.request
    import urllib.error

    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    if not api_key or not folder_id:
        return {'insights': [], 'count': 0, 'note': 'AI not configured'}

    agg = aggregate(member_id)
    if 'error' in agg:
        return agg

    member = agg['member']
    age = member.get('age')
    name = member.get('name', 'Ребёнок')

    # Готовим компактную сводку для LLM
    summary_lines = [f'Возраст: {age} лет' if age else 'Возраст: не указан']
    for sphere, label in SPHERE_LABELS_CHILD.items():
        score = round(agg['scores'].get(sphere, 0))
        conf = round(agg['confidence'].get(sphere, 0))
        summary_lines.append(f'- {label}: {score}/100 (достоверность {conf}%)')
    summary = '\n'.join(summary_lines)

    prompt = (
        f'Ты — детский психолог и педагог. Проанализируй портфолио развития ребёнка по имени {name}. '
        f'Дай 3 коротких практичных наблюдения (по 1-2 предложения). Тон — добрый, без алармизма. '
        f'Формат ответа: строго JSON-массив объектов вида '
        f'[{{"title":"короткий заголовок","text":"наблюдение","suggestion":"что сделать","severity":"info|success|warning"}}]. '
        f'Без лишнего текста вокруг JSON.\n\nПортфолио:\n{summary}'
    )

    payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
        'completionOptions': {'stream': False, 'temperature': 0.4, 'maxTokens': 800},
        'messages': [
            {'role': 'system', 'text': 'Ты эксперт по развитию детей. Отвечай только JSON.'},
            {'role': 'user', 'text': prompt},
        ],
    }
    req = urllib.request.Request(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Api-Key {api_key}',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        return {'insights': [], 'count': 0, 'error': f'AI request failed: {str(e)[:200]}'}

    text = ''
    try:
        text = data['result']['alternatives'][0]['message']['text']
    except (KeyError, IndexError):
        return {'insights': [], 'count': 0, 'error': 'Invalid AI response'}

    text = text.strip()
    if text.startswith('```'):
        text = text.strip('`').strip()
        if text.startswith('json'):
            text = text[4:].strip()

    try:
        parsed = json.loads(text)
        if not isinstance(parsed, list):
            parsed = []
    except json.JSONDecodeError:
        # Попытка достать JSON из произвольного текста
        start = text.find('[')
        end = text.rfind(']')
        if start >= 0 and end > start:
            try:
                parsed = json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                parsed = []
        else:
            parsed = []

    insights = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        sev = item.get('severity', 'info')
        if sev not in ('info', 'success', 'warning'):
            sev = 'info'
        insights.append({
            'sphere': None,
            'sphere_label': 'AI-наблюдение',
            'severity': sev,
            'rule_key': 'ai',
            'title': str(item.get('title', ''))[:120],
            'text': str(item.get('text', ''))[:400],
            'suggestion': str(item.get('suggestion', ''))[:300] if item.get('suggestion') else None,
        })

    # Сохраняем в portfolio_insights
    if insights:
        try:
            conn = get_conn()
            cur = conn.cursor()
            try:
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.portfolio_insights
                    WHERE member_id = {esc(member_id)}::uuid AND generated_by = 'ai'
                """)
                for ins in insights:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.portfolio_insights
                            (member_id, insight_type, severity, rule_key, title, text, suggestion, generated_by, created_at)
                        VALUES (
                            {esc(member_id)}::uuid,
                            'ai_observation',
                            {esc(ins['severity'])},
                            'ai',
                            {esc(ins['title'])},
                            {esc(ins['text'])},
                            {esc(ins['suggestion']) if ins['suggestion'] else 'NULL'},
                            'ai',
                            CURRENT_TIMESTAMP
                        )
                    """)
            finally:
                cur.close()
                conn.close()
        except Exception:
            pass

    return {'insights': insights, 'count': len(insights), 'generated_by': 'ai'}


def _notify_family_owners(cur, family_id: str, member_name: str, badge_title: str) -> None:
    """Создаёт push-уведомление всем владельцам/взрослым семьи о новом бейдже."""
    try:
        cur.execute(f"""
            SELECT DISTINCT user_id FROM {SCHEMA}.family_members
            WHERE family_id = {esc(family_id)}::uuid
              AND user_id IS NOT NULL
              AND COALESCE(account_type, 'full') = 'full'
        """)
        owner_ids = [str(r['user_id']) for r in cur.fetchall()]
        for uid in owner_ids:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.notifications
                    (user_id, family_id, type, title, message, target_url, channel, status, sent_at, created_at)
                VALUES (
                    {esc(uid)}::uuid,
                    {esc(family_id)},
                    'achievement',
                    {esc('Новое достижение: ' + badge_title)},
                    {esc(member_name + ' получил(а) бейдж «' + badge_title + '» в портфолио развития.')},
                    '/portfolio',
                    'push',
                    'sent',
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
            """)
    except Exception:
        pass


def auto_generate_badges(member_id: str) -> Dict[str, Any]:
    """Создаёт бейджи на основе текущего состояния портфолио."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    created: List[Dict[str, Any]] = []
    try:
        cur.execute(f"""
            SELECT mp.current_scores, mp.confidence_scores, mp.completeness, fm.family_id, fm.name AS member_name
            FROM {SCHEMA}.member_portfolios mp
            JOIN {SCHEMA}.family_members fm ON fm.id = mp.member_id
            WHERE mp.member_id = {esc(member_id)}::uuid LIMIT 1
        """)
        row = cur.fetchone()
        if not row:
            return {'error': 'Portfolio not found'}
        scores = row.get('current_scores') or {}
        confs = row.get('confidence_scores') or {}
        completeness = int(row.get('completeness') or 0)
        family_id = str(row['family_id'])
        member_name = row.get('member_name') or 'Участник'

        rules = [
            ('first_data', 'Первые данные', 'Sparkles', 'milestone', None,
             lambda: completeness >= 10),
            ('completeness_50', 'Половина пути', 'Hourglass', 'path', None,
             lambda: completeness >= 50),
            ('completeness_80', 'Полный профиль', 'CheckCircle2', 'milestone', None,
             lambda: completeness >= 80),
        ]
        for sphere in SPHERE_KEYS:
            score = float(scores.get(sphere, 0))
            conf = float(confs.get(sphere, 0))
            label = SPHERE_LABELS_CHILD[sphere]
            rules.append((
                f'{sphere}_strong', f'Сильная сфера: {label}', SPHERE_ICONS[sphere], 'milestone', sphere,
                lambda s=score, c=conf: s >= 80 and c >= 60,
            ))
            rules.append((
                f'{sphere}_growing', f'Растёт: {label}', 'TrendingUp', 'path', sphere,
                lambda s=score, c=conf: s >= 60 and c >= 50,
            ))

        cur.execute(f"""
            SELECT badge_key FROM {SCHEMA}.member_achievements
            WHERE member_id = {esc(member_id)}::uuid
        """)
        existing = {r['badge_key'] for r in cur.fetchall()}

        for badge_key, title, icon, category, sphere, predicate in rules:
            if badge_key in existing:
                continue
            try:
                if not predicate():
                    continue
            except Exception:
                continue
            cur.execute(f"""
                INSERT INTO {SCHEMA}.member_achievements
                    (member_id, family_id, badge_key, title, icon, sphere_key, category, earned_at)
                VALUES (
                    {esc(member_id)}::uuid,
                    {esc(family_id)}::uuid,
                    {esc(badge_key)},
                    {esc(title)},
                    {esc(icon)},
                    {esc(sphere) if sphere else 'NULL'},
                    {esc(category)},
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (member_id, badge_key) DO NOTHING
            """)
            created.append({'badge_key': badge_key, 'title': title})
            _notify_family_owners(cur, family_id, member_name, title)
        return {'created': len(created), 'badges': created}
    finally:
        cur.close()
        conn.close()


ALLOWED_CATEGORIES = {'milestone', 'path', 'rhythm'}


def achievement_create(
    member_id: str,
    body: Dict[str, Any],
    actor_user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Этап 3.4.1: ручное создание достижения (manual handoff из цели).

    Security-invariant (Stage 3 hardening):
      1) actor_user_id обязателен — иначе 401.
      2) Семья текущего пользователя (по user_id из family_members) ДОЛЖНА совпадать
         с семьёй member_id, для которого создаётся достижение. Иначе 403.
      Только после этого мы доверяем member_id и пишем в БД.

    Поля body:
      title (req), description, icon (def Award), sphere_key, category (def milestone),
      earned_at (ISO date, def CURRENT_TIMESTAMP),
      badge_key (если не задан — генерируем уникальный manual_<ts>).
    """
    if not actor_user_id:
        return {'error': 'unauthorized', '__http_status': 401}

    title = (body.get('title') or '').strip()
    if not title:
        return {'error': 'title required'}
    category = body.get('category') or 'milestone'
    if category not in ALLOWED_CATEGORIES:
        return {'error': f'invalid category. Allowed: {sorted(ALLOWED_CATEGORIES)}'}
    sphere = body.get('sphere_key') or None
    if sphere is not None and sphere not in SPHERE_KEYS:
        return {'error': f'invalid sphere_key. Allowed: {SPHERE_KEYS}'}
    icon = body.get('icon') or 'Award'
    description = body.get('description') or None
    earned_at = body.get('earned_at') or None  # ISO 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'
    # badge_key: если клиент не дал — собираем уникальный.
    badge_key = body.get('badge_key') or f'manual_{int(datetime.now(timezone.utc).timestamp() * 1000)}'

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # 1) Семья текущего пользователя (actor) — источник истины.
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members
            WHERE user_id = {esc(actor_user_id)}::uuid LIMIT 1
        """)
        actor_row = cur.fetchone()
        if not actor_row or not actor_row.get('family_id'):
            return {'error': 'actor has no family', '__http_status': 403}
        actor_family_id = str(actor_row['family_id'])

        # 2) Семья члена-получателя.
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members
            WHERE id = {esc(member_id)}::uuid LIMIT 1
        """)
        row = cur.fetchone()
        if not row:
            return {'error': 'member not found'}
        member_family_id = str(row['family_id'])

        # 3) Жёсткое сравнение — никакого «trust client family_id».
        if member_family_id != actor_family_id:
            return {'error': 'forbidden: member belongs to another family', '__http_status': 403}

        family_id = member_family_id

        earned_sql = (
            f"{esc(earned_at)}::timestamp" if earned_at else 'CURRENT_TIMESTAMP'
        )
        cur.execute(f"""
            INSERT INTO {SCHEMA}.member_achievements
                (member_id, family_id, badge_key, title, description, icon, sphere_key, category, earned_at, source_type, metadata)
            VALUES (
                {esc(member_id)}::uuid,
                {esc(family_id)}::uuid,
                {esc(badge_key)},
                {esc(title)},
                {esc(description) if description else 'NULL'},
                {esc(icon)},
                {esc(sphere) if sphere else 'NULL'},
                {esc(category)},
                {earned_sql},
                'manual',
                {esc(json.dumps(body.get('metadata') or {}))}::jsonb
            )
            ON CONFLICT (member_id, badge_key) DO NOTHING
            RETURNING id, member_id, family_id, badge_key, title, description, icon, sphere_key, category, earned_at
        """)
        new_row = cur.fetchone()
        if not new_row:
            # ON CONFLICT не вернул RETURNING — значит badge_key уже занят.
            return {'error': 'badge_key already exists for this member'}
        return {
            'id': str(new_row['id']),
            'memberId': str(new_row['member_id']),
            'familyId': str(new_row['family_id']),
            'badgeKey': new_row['badge_key'],
            'title': new_row['title'],
            'description': new_row.get('description'),
            'icon': new_row['icon'],
            'sphereKey': new_row.get('sphere_key'),
            'category': new_row['category'],
            'earnedAt': str(new_row['earned_at']) if new_row.get('earned_at') else None,
        }
    finally:
        cur.close()
        conn.close()


def compare_members(family_id: str) -> Dict[str, Any]:
    """Сравнение всех членов семьи: scores по сферам в одном объекте."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT fm.id, fm.name, fm.role, fm.age, fm.photo_url, fm.avatar,
                   mp.current_scores, mp.confidence_scores, mp.completeness
            FROM {SCHEMA}.family_members fm
            LEFT JOIN {SCHEMA}.member_portfolios mp ON mp.member_id = fm.id
            WHERE fm.family_id = {esc(family_id)}::uuid
            ORDER BY fm.age DESC NULLS LAST, fm.name
        """)
        rows = cur.fetchall()
        members = []
        for r in rows:
            scores = r.get('current_scores') or {}
            confs = r.get('confidence_scores') or {}
            members.append({
                'id': str(r['id']),
                'name': r['name'],
                'role': r.get('role'),
                'age': r.get('age'),
                'photo_url': r.get('photo_url'),
                'avatar': r.get('avatar'),
                'completeness': int(r.get('completeness') or 0),
                'scores': {k: float(scores.get(k, 0)) for k in SPHERE_KEYS},
                'confidence': {k: float(confs.get(k, 0)) for k in SPHERE_KEYS},
                'has_portfolio': r.get('current_scores') is not None,
            })
        return {
            'family_id': family_id,
            'members': members,
            'sphere_labels_child': SPHERE_LABELS_CHILD,
            'sphere_icons': SPHERE_ICONS,
        }
    finally:
        cur.close()
        conn.close()


def plan_create(member_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    sphere = body.get('sphere_key')
    title = body.get('title')
    if not sphere or not title:
        return {'error': 'sphere_key and title required'}
    description = body.get('description')
    milestone = body.get('milestone')
    target_date = body.get('target_date')
    next_step = body.get('next_step')
    progress = int(body.get('progress') or 0)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT family_id FROM {SCHEMA}.family_members WHERE id = {esc(member_id)}::uuid
        """)
        fm = cur.fetchone()
        if not fm:
            return {'error': 'Member not found'}
        cur.execute(f"""
            INSERT INTO {SCHEMA}.member_development_plans
                (member_id, family_id, sphere_key, title, description, milestone,
                 target_date, status, progress, next_step)
            VALUES (
                {esc(member_id)}::uuid,
                {esc(str(fm['family_id']))}::uuid,
                {esc(sphere)},
                {esc(title)},
                {esc(description) if description else 'NULL'},
                {esc(milestone) if milestone else 'NULL'},
                {esc(target_date) + '::date' if target_date else 'NULL'},
                'active',
                {progress},
                {esc(next_step) if next_step else 'NULL'}
            )
            RETURNING id
        """)
        new = cur.fetchone()
        return {'id': str(new['id']), 'status': 'created'}
    finally:
        cur.close()
        conn.close()


def plan_update(plan_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    fields = []
    for k in ('title', 'description', 'milestone', 'next_step', 'status'):
        if k in body and body[k] is not None:
            fields.append(f"{k} = {esc(body[k])}")
    if 'progress' in body and body['progress'] is not None:
        fields.append(f"progress = {int(body['progress'])}")
    if 'sphere_key' in body and body['sphere_key']:
        fields.append(f"sphere_key = {esc(body['sphere_key'])}")
    if 'target_date' in body:
        td = body['target_date']
        fields.append(f"target_date = {esc(td) + '::date' if td else 'NULL'}")
    if not fields:
        return {'error': 'no fields to update'}
    fields.append('updated_at = CURRENT_TIMESTAMP')
    if body.get('status') == 'completed':
        fields.append('completed_at = CURRENT_TIMESTAMP')
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            UPDATE {SCHEMA}.member_development_plans
            SET {', '.join(fields)}
            WHERE id = {esc(plan_id)}::uuid
            RETURNING id
        """)
        row = cur.fetchone()
        if not row:
            return {'error': 'Plan not found'}
        return {'id': str(row['id']), 'status': 'updated'}
    finally:
        cur.close()
        conn.close()


def plan_delete(plan_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            DELETE FROM {SCHEMA}.member_development_plans
            WHERE id = {esc(plan_id)}::uuid
            RETURNING id
        """)
        row = cur.fetchone()
        if not row:
            return {'error': 'Plan not found'}
        return {'id': str(row['id']), 'status': 'deleted'}
    finally:
        cur.close()
        conn.close()


def get_history(member_id: str, limit: int = 12) -> Dict[str, Any]:
    """Полная история snapshots для построения графика динамики."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT id, snapshot_date, snapshot_type, scores, confidence, summary, source_count, trigger_event
            FROM {SCHEMA}.member_portfolio_snapshots
            WHERE member_id = {esc(member_id)}::uuid
            ORDER BY snapshot_date DESC
            LIMIT {int(limit)}
        """)
        rows = cur.fetchall()
        history = []
        for r in rows:
            history.append({
                'id': str(r['id']),
                'date': str(r['snapshot_date']),
                'type': r.get('snapshot_type'),
                'scores': r.get('scores') or {},
                'confidence': r.get('confidence') or {},
                'summary': r.get('summary') or {},
                'source_count': r.get('source_count'),
                'trigger': r.get('trigger_event'),
            })
        history.reverse()  # от старого к новому
        return {'history': history, 'count': len(history)}
    finally:
        cur.close()
        conn.close()


def cron_snapshot_all() -> Dict[str, Any]:
    """Cron: создаёт snapshot для всех участников, у кого последний > 25 дней назад."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT mp.member_id
            FROM {SCHEMA}.member_portfolios mp
            LEFT JOIN (
                SELECT member_id, MAX(snapshot_date) AS last_snap
                FROM {SCHEMA}.member_portfolio_snapshots
                GROUP BY member_id
            ) s ON s.member_id = mp.member_id
            WHERE s.last_snap IS NULL OR s.last_snap < CURRENT_DATE - INTERVAL '25 days'
        """)
        member_ids = [str(r['member_id']) for r in cur.fetchall()]
    finally:
        cur.close()
        conn.close()

    created = 0
    errors = []
    for mid in member_ids:
        try:
            r = create_snapshot(mid, trigger_event='cron_monthly')
            if 'error' not in r:
                created += 1
        except Exception as e:
            errors.append({'member_id': mid, 'error': str(e)[:200]})
    return {'created': created, 'total_candidates': len(member_ids), 'errors': errors}


def _err(status: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': cors_headers(),
        'body': json.dumps({'error': message}, ensure_ascii=False),
    }


# Какие actions требуют actor auth + family scope.
# Cron — единственный системный, защищён CRON_SECRET.
# Все остальные требуют X-User-Id и проверку семьи.
ACTOR_PROTECTED_ACTIONS = {
    'list', 'aggregate', 'get', 'snapshot', 'insights', 'achievements',
    'history', 'plan_create', 'plan_update', 'plan_delete',
    'auto_badges', 'ai_insights', 'compare', 'achievement_create',
}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Главный обработчик. Действия:
    - aggregate, get, snapshot, insights, achievements, history,
      ai_insights, auto_badges, achievement_create — по member (member_id);
    - list, compare — по семье (family_id);
    - plan_create — по member; plan_update/plan_delete — по plan_id;
    - cron_snapshot — системный (CRON_SECRET).

    Stage-3 hardening: для всех ACTOR_PROTECTED_ACTIONS обязательно:
      1) X-User-Id (401 если нет);
      2) у actor есть семья (403);
      3) member_id/plan_id принадлежит семье actor (404 если нет);
      4) family_id (если передан) совпадает с семьёй actor (403).
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'get')
    member_id = params.get('member_id')
    family_id = params.get('family_id')
    plan_id = params.get('plan_id')

    try:
        # ===== Системный action: cron =====
        if action == 'cron_snapshot':
            secret = params.get('secret') or event.get('headers', {}).get('X-Cron-Secret')
            expected = os.environ.get('CRON_SECRET')
            if expected and secret != expected:
                return _err(403, 'forbidden')
            data = cron_snapshot_all()
            return {'statusCode': 200, 'headers': cors_headers(),
                    'body': json.dumps(data, ensure_ascii=False, default=str)}

        # ===== Все остальные actions — actor-protected =====
        if action not in ACTOR_PROTECTED_ACTIONS:
            return _err(400, f'Unknown action: {action}')

        # 1) auth + actor family — обязательно для всех
        actor_user_id = get_actor_user_id(event)
        actor_family_id = resolve_actor_family_id(actor_user_id)

        # 2) Валидация обязательных query-параметров + family-scope checks
        if action in ('list', 'compare'):
            if not family_id:
                return _err(400, 'family_id required')
            assert_family_match(family_id, actor_family_id)
        elif action in ('plan_update', 'plan_delete'):
            if not plan_id:
                return _err(400, 'plan_id required')
            assert_plan_in_actor_family(plan_id, actor_family_id)
        else:
            # member_id-based actions
            if not member_id:
                return _err(400, 'member_id required')
            assert_member_in_actor_family(member_id, actor_family_id)

        # 3) Диспетчер бизнес-логики
        if action == 'list':
            data = list_family_portfolios(family_id)
        elif action == 'aggregate':
            data = aggregate(member_id)
        elif action == 'get':
            data = get_portfolio(member_id)
        elif action == 'snapshot':
            trigger = params.get('trigger', 'manual')
            data = create_snapshot(member_id, trigger)
        elif action == 'insights':
            data = gen_insights(member_id)
        elif action == 'achievements':
            data = list_achievements(member_id)
        elif action == 'history':
            limit = int(params.get('limit', '12'))
            data = get_history(member_id, limit)
        elif action == 'plan_create':
            body_str = event.get('body') or '{}'
            body = json.loads(body_str) if body_str else {}
            data = plan_create(member_id, body)
        elif action == 'plan_update':
            body_str = event.get('body') or '{}'
            body = json.loads(body_str) if body_str else {}
            data = plan_update(plan_id, body)
        elif action == 'plan_delete':
            data = plan_delete(plan_id)
        elif action == 'auto_badges':
            data = auto_generate_badges(member_id)
        elif action == 'ai_insights':
            data = gen_ai_insights(member_id)
        elif action == 'compare':
            data = compare_members(family_id)
        elif action == 'achievement_create':
            body_str = event.get('body') or '{}'
            body = json.loads(body_str) if body_str else {}
            # Передаём проверенный actor_user_id — внутри функции тоже не доверяем.
            data = achievement_create(member_id, body, actor_user_id=actor_user_id)
            if isinstance(data, dict) and data.get('__http_status'):
                status_code = int(data.pop('__http_status'))
                return {'statusCode': status_code, 'headers': cors_headers(),
                        'body': json.dumps(data, ensure_ascii=False, default=str)}
        else:
            return _err(400, f'Unknown action: {action}')

        if isinstance(data, dict) and data.get('error'):
            return {'statusCode': 404, 'headers': cors_headers(),
                    'body': json.dumps(data, ensure_ascii=False, default=str)}

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False, default=str),
        }
    except AuthError as ae:
        return _err(ae.status, ae.message)
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }