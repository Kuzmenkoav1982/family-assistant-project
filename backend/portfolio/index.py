"""
Business: Модуль Портфолио — агрегатор развития, snapshot, инсайты, достижения.
Действия (action в query): aggregate | get | snapshot | insights | achievements | list
Args: event с httpMethod, queryStringParameters (action, member_id, family_id)
Returns: JSON с данными портфолио или ошибкой
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


def aggregate(member_id: str) -> Dict[str, Any]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        member = fetch_member(cur, member_id)
        if not member:
            return {'error': 'Member not found'}

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


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Главный обработчик. Действия:
    - aggregate: пересчитать портфолио (POST/GET, member_id)
    - get: получить текущее портфолио (GET, member_id)
    - list: список портфолио всей семьи (GET, family_id)
    - snapshot: создать исторический snapshot (POST, member_id)
    - insights: rule-based инсайты (GET, member_id)
    - achievements: стена достижений (GET, member_id)
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'get')
    member_id = params.get('member_id')
    family_id = params.get('family_id')

    try:
        if action == 'list':
            if not family_id:
                return {'statusCode': 400, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'family_id required'})}
            data = list_family_portfolios(family_id)
        elif action == 'aggregate':
            if not member_id:
                return {'statusCode': 400, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'member_id required'})}
            data = aggregate(member_id)
        elif action == 'get':
            if not member_id:
                return {'statusCode': 400, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'member_id required'})}
            data = get_portfolio(member_id)
        elif action == 'snapshot':
            if not member_id:
                return {'statusCode': 400, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'member_id required'})}
            trigger = params.get('trigger', 'manual')
            data = create_snapshot(member_id, trigger)
        elif action == 'insights':
            if not member_id:
                return {'statusCode': 400, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'member_id required'})}
            data = gen_insights(member_id)
        elif action == 'achievements':
            if not member_id:
                return {'statusCode': 400, 'headers': cors_headers(),
                        'body': json.dumps({'error': 'member_id required'})}
            data = list_achievements(member_id)
        else:
            return {'statusCode': 400, 'headers': cors_headers(),
                    'body': json.dumps({'error': f'Unknown action: {action}'})}

        if isinstance(data, dict) and data.get('error'):
            return {'statusCode': 404, 'headers': cors_headers(),
                    'body': json.dumps(data, ensure_ascii=False, default=str)}

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps(data, ensure_ascii=False, default=str),
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
