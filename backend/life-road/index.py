import json
import os
import base64
from datetime import datetime
import psycopg2
import boto3
import requests

YANDEX_FOLDER_ID = 'b1gaglg8i7v2i32nvism'

COACH_SYSTEM_PROMPT = (
    "Ты — Домовой, тёплый и мудрый ИИ-наставник в разделе «Мастерская жизни» приложения 'Наша Семья'. "
    "Пользователь — мастер своей жизни. Ты помогаешь ему рассмотреть пройденный путь, найти точку «Я сейчас» "
    "и осознанно собрать будущее из целей, привычек и мечт. "
    "Ты видишь события пользователя, его цели и последнее Колесо баланса — используй этот контекст в ответах. "
    "Опирайся на проверенные методики: SMART, Колесо баланса, Икигай, 7 навыков Кови, OKR. "
    "Говори по-русски, на ты, мягко и по-человечески, без канцелярита. Не давай медицинских и юридических советов. "
    "Структура ответа: сначала одно тёплое наблюдение (1–2 строки), затем 3–5 конкретных пунктов или шагов, "
    "в конце — один первый маленький шаг, который можно сделать сегодня или на этой неделе."
)

def handler(event: dict, context) -> dict:
    '''
    Управление Мастерской жизни: события (life_events), цели (life_goals) и колесо баланса (life_balance_wheel)
    GET    /?resource=events|goals|balance
    POST   /?resource=events|goals|balance
    PUT    /?resource=events|goals  (id в body или query)
    DELETE /?resource=events|goals&id=<uuid>
    '''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': '', 'isBase64Encoded': False}

    headers = event.get('headers', {}) or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    if not user_id:
        return _resp(401, {'error': 'User ID required'})

    qp = event.get('queryStringParameters') or {}
    resource = (qp.get('resource') or 'events').lower()
    item_id = qp.get('id')

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    try:
        cur.execute('SELECT family_id FROM family_members WHERE id = %s', (user_id,))
        row = cur.fetchone()
        if not row:
            return _resp(404, {'error': 'Family not found'})
        family_id = row[0]

        if resource == 'events':
            return _handle_events(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'goals':
            return _handle_goals(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'milestones':
            return _handle_milestones(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'keyresults':
            return _handle_keyresults(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'checkins':
            return _handle_checkins(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'links':
            return _handle_links(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'portfolio-links':
            return _handle_portfolio_links(method, cur, conn, family_id, user_id, item_id, event)
        if resource == 'portfolio-picker':
            return _handle_portfolio_picker(method, cur, conn, family_id, event)
        if resource == 'cache-backfill':
            # Защита: backfill — служебная операция, требует X-Admin-Token.
            admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token')
            expected = os.environ.get('ADMIN_TOKEN') or ''
            if not expected or admin_token != expected:
                return _resp(403, {'error': 'admin_only'})
            return _handle_cache_backfill(method, cur, conn, family_id)
        if resource == 'balance':
            return _handle_balance(method, cur, conn, family_id, user_id, event)
        if resource == 'photo':
            return _handle_photo(method, family_id, event)
        if resource == 'coach':
            return _handle_coach(method, cur, family_id, user_id, event)

        return _resp(400, {'error': 'Unknown resource'})
    finally:
        cur.close()
        conn.close()


def _resp(status: int, payload) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(payload, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


# ============================================================
# Goal execution cache (Этап 2.4)
# ------------------------------------------------------------
# ИНВАРИАНТЫ (паритет с src/lib/goals/progress.ts):
#  • execution_progress в БД — только CACHE, не источник истины.
#  • SMART  → ТОЛЬКО frameworkState (start/current/target).
#  • OKR    → ТОЛЬКО goal_key_results (веса нормализуем).
#  • Wheel  → ТОЛЬКО frameworkState (currentScores vs targetScores).
#  • Generic→ goal_milestones (если есть) → steps → 0.
#  • Check-ins НЕ влияют на cache. Links НЕ влияют на cache.
#  • При insufficient data → NULL (а не фиктивный 0).
#  • clamp 0..100 для UI-значения. Overshoot не кэшируем.
#  • При ошибке пересчёта основная запись НЕ откатывается:
#    выставляем NULL и логируем — лучше null, чем устаревший кэш.
# Фикстуры в src/lib/goals/__fixtures__/progress.fixtures.json
# используются для parity-проверки.
# ============================================================

def _num_or_none(v):
    if v is None or v == '':
        return None
    try:
        n = float(v)
        if n != n:  # NaN
            return None
        return n
    except (TypeError, ValueError):
        return None


def _clamp_pct(v):
    if v is None:
        return None
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    if n != n:  # NaN
        return None
    return max(0, min(100, int(round(n))))


def _compute_smart(framework_state):
    """SMART: только метрика. Возвращает (value|None, insufficient: bool)."""
    fs = framework_state or {}
    start = _num_or_none(fs.get('startValue'))
    current = _num_or_none(fs.get('currentValue'))
    target = _num_or_none(fs.get('targetValue'))
    if target is None:
        return None, True
    start_safe = 0.0 if start is None else start
    if start_safe == target:
        return None, True
    base = start_safe if current is None else current
    span = target - start_safe
    ratio = (base - start_safe) / span
    return ratio * 100.0, False


def _compute_okr(cur, goal_id):
    """OKR: считаем из goal_key_results. Веса нормализуем (0/null→1)."""
    cur.execute(
        '''
        SELECT start_value, current_value, target_value, weight, status, metric_type
        FROM goal_key_results WHERE goal_id = %s
        ''',
        (goal_id,),
    )
    rows = cur.fetchall()
    if not rows:
        return None, True
    weights = []
    for r in rows:
        w = r[3]
        weights.append(w if (w is not None and float(w) > 0) else 1.0)
    total_w = sum(weights)
    if total_w == 0:
        return None, True
    acc = 0.0
    for i, r in enumerate(rows):
        start_v = float(r[0]) if r[0] is not None else 0.0
        current_v = float(r[1]) if r[1] is not None else 0.0
        target_v = float(r[2]) if r[2] is not None else 0.0
        status = r[4]
        span = target_v - start_v
        if span == 0:
            kr_ratio = 1.0 if status == 'done' else 0.0
        else:
            kr_ratio = (current_v - start_v) / span
        clamped = max(0.0, min(1.0, kr_ratio))
        w_norm = float(weights[i]) / float(total_w)
        acc += w_norm * clamped
    return acc * 100.0, False


def _compute_wheel(framework_state, linked_sphere_ids):
    """Wheel: только scores. Пропускаем сферы без baseline/target и span<=0."""
    fs = framework_state or {}
    linked = linked_sphere_ids or []
    if not linked:
        return None, True
    baseline = fs.get('baselineScores') or {}
    target = fs.get('targetScores') or {}
    current = fs.get('currentScores') or {}
    total_delta = 0.0
    achieved = 0.0
    measured = 0
    for sid in linked:
        b = _num_or_none(baseline.get(sid))
        t = _num_or_none(target.get(sid))
        c = _num_or_none(current.get(sid))
        if b is None or t is None:
            continue
        measured += 1
        span = t - b
        if span <= 0:
            continue
        cur_v = b if c is None else c
        delta = cur_v - b
        total_delta += span
        achieved += max(0.0, delta)
    if measured == 0 or total_delta == 0:
        return None, True
    return (achieved / total_delta) * 100.0, False


def _compute_generic(cur, goal_id, steps_json):
    """Generic: milestones → steps → None."""
    cur.execute(
        'SELECT weight, status FROM goal_milestones WHERE goal_id = %s',
        (goal_id,),
    )
    rows = cur.fetchall()
    if rows:
        weights = []
        done_w = 0.0
        for w, status in rows:
            wv = float(w) if (w is not None and float(w) > 0) else 1.0
            weights.append(wv)
            if status == 'done':
                done_w += wv
        total = sum(weights)
        if total == 0:
            return None, True
        return (done_w / total) * 100.0, False
    # Steps fallback
    steps = steps_json or []
    if isinstance(steps, list) and steps:
        done = sum(1 for s in steps if isinstance(s, dict) and s.get('done'))
        return (done / len(steps)) * 100.0, False
    return None, True


def recompute_goal_execution_cache(cur, conn, goal_id) -> dict:
    """
    Пересчитывает и сохраняет life_goals.execution_progress.
    Возвращает {goalId, executionProgress, source, error|None}.
    При insufficient data → ставит NULL.
    При ошибке — НЕ откатывает основную операцию, возвращает error.
    """
    try:
        cur.execute(
            '''
            SELECT framework_type, framework_state, linked_sphere_ids, steps
            FROM life_goals WHERE id = %s
            ''',
            (goal_id,),
        )
        row = cur.fetchone()
        if not row:
            return {'goalId': str(goal_id), 'executionProgress': None, 'source': None, 'error': 'goal_not_found'}
        framework_type = (row[0] or 'generic')
        framework_state = row[1] or {}
        linked = row[2] or []
        steps_json = row[3] or []

        raw_value = None
        insufficient = False
        source = 'manual'

        if framework_type == 'smart':
            raw_value, insufficient = _compute_smart(framework_state)
            source = 'smart'
        elif framework_type == 'okr':
            raw_value, insufficient = _compute_okr(cur, goal_id)
            source = 'keyResults'
        elif framework_type == 'wheel':
            raw_value, insufficient = _compute_wheel(framework_state, linked)
            source = 'wheel'
        else:
            raw_value, insufficient = _compute_generic(cur, goal_id, steps_json)
            source = 'milestones' if raw_value is not None else 'manual'

        # При insufficient data → NULL (правило 5.5 ТЗ)
        final = None if insufficient else _clamp_pct(raw_value)

        cur.execute(
            'UPDATE life_goals SET execution_progress = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
            (final, goal_id),
        )
        conn.commit()
        return {
            'goalId': str(goal_id),
            'executionProgress': final,
            'source': source,
            'error': None,
        }
    except Exception as e:
        # НЕ ломаем основную запись: пытаемся выставить NULL, логируем.
        try:
            cur.execute(
                'UPDATE life_goals SET execution_progress = NULL WHERE id = %s',
                (goal_id,),
            )
            conn.commit()
        except Exception:
            try:
                conn.rollback()
            except Exception:
                pass
        print(f'[life-road] recompute_goal_execution_cache failed for {goal_id}: {e}')
        return {'goalId': str(goal_id), 'executionProgress': None, 'source': None, 'error': str(e)}


def _safe_recompute(cur, conn, goal_id):
    """Тихий вариант для write-paths: вызвать, ошибку проглотить — не ломать ответ клиенту."""
    try:
        recompute_goal_execution_cache(cur, conn, goal_id)
    except Exception as e:
        print(f'[life-road] safe recompute failed for {goal_id}: {e}')


def _event_to_dict(r) -> dict:
    return {
        'id': str(r[0]),
        'familyId': str(r[1]),
        'createdBy': str(r[2]) if r[2] else None,
        'date': r[3].isoformat() if r[3] else None,
        'title': r[4],
        'description': r[5],
        'category': r[6],
        'importance': r[7],
        'participants': r[8] or [],
        'photos': r[9] or [],
        'isFuture': bool(r[10]),
        'mood': r[11],
        'quote': r[12],
        'createdAt': r[13].isoformat() if r[13] else None,
        'updatedAt': r[14].isoformat() if r[14] else None,
    }


def _handle_events(method, cur, conn, family_id, user_id, item_id, event):
    if method == 'GET':
        cur.execute('''
            SELECT id, family_id, created_by, event_date, title, description, category,
                   importance, participants, photos, is_future, mood, quote, created_at, updated_at
            FROM life_events
            WHERE family_id = %s
            ORDER BY event_date ASC
        ''', (family_id,))
        return _resp(200, [_event_to_dict(r) for r in cur.fetchall()])

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        cur.execute('''
            INSERT INTO life_events
            (family_id, created_by, event_date, title, description, category, importance,
             participants, photos, is_future, mood, quote)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s, %s, %s)
            RETURNING id, family_id, created_by, event_date, title, description, category,
                      importance, participants, photos, is_future, mood, quote, created_at, updated_at
        ''', (
            family_id, user_id,
            body.get('date'),
            body.get('title'),
            body.get('description'),
            body.get('category', 'other'),
            body.get('importance', 'medium'),
            json.dumps(body.get('participants', [])),
            json.dumps(body.get('photos', [])),
            bool(body.get('isFuture', False)),
            body.get('mood'),
            body.get('quote'),
        ))
        new_row = cur.fetchone()
        conn.commit()
        return _resp(201, _event_to_dict(new_row))

    if method == 'PUT':
        eid = item_id or body.get('id')
        if not eid:
            return _resp(400, {'error': 'id required'})
        cur.execute('''
            UPDATE life_events
            SET event_date = COALESCE(%s, event_date),
                title = COALESCE(%s, title),
                description = COALESCE(%s, description),
                category = COALESCE(%s, category),
                importance = COALESCE(%s, importance),
                participants = COALESCE(%s::jsonb, participants),
                photos = COALESCE(%s::jsonb, photos),
                is_future = COALESCE(%s, is_future),
                mood = COALESCE(%s, mood),
                quote = COALESCE(%s, quote),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND family_id = %s
            RETURNING id, family_id, created_by, event_date, title, description, category,
                      importance, participants, photos, is_future, mood, quote, created_at, updated_at
        ''', (
            body.get('date'),
            body.get('title'),
            body.get('description'),
            body.get('category'),
            body.get('importance'),
            json.dumps(body['participants']) if 'participants' in body else None,
            json.dumps(body['photos']) if 'photos' in body else None,
            body.get('isFuture'),
            body.get('mood'),
            body.get('quote'),
            eid, family_id,
        ))
        upd = cur.fetchone()
        conn.commit()
        if not upd:
            return _resp(404, {'error': 'Event not found'})
        return _resp(200, _event_to_dict(upd))

    if method == 'DELETE':
        eid = item_id or body.get('id')
        if not eid:
            return _resp(400, {'error': 'id required'})
        cur.execute('DELETE FROM life_events WHERE id = %s AND family_id = %s', (eid, family_id))
        conn.commit()
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


GOAL_SELECT = '''
    SELECT id, family_id, owner_id, title, description, sphere, framework,
           deadline, status, progress, steps, ai_insights, created_at, updated_at,
           framework_type, framework_state, scope, horizon, season, why_text,
           linked_sphere_ids, created_from, source_context, execution_progress, outcome_signal
'''

ALLOWED_FRAMEWORK_TYPES = {'generic', 'smart', 'okr', 'wheel'}
ALLOWED_SCOPES = {'personal', 'family'}
ALLOWED_HORIZONS = {'quarter', 'season', 'year', 'long'}


def _goal_to_dict(r) -> dict:
    return {
        'id': str(r[0]),
        'familyId': str(r[1]),
        'ownerId': str(r[2]) if r[2] else None,
        'title': r[3],
        'description': r[4],
        'sphere': r[5],
        'framework': r[6],
        'deadline': r[7].isoformat() if r[7] else None,
        'status': r[8],
        'progress': r[9] or 0,
        'steps': r[10] or [],
        'aiInsights': r[11] or {},
        'createdAt': r[12].isoformat() if r[12] else None,
        'updatedAt': r[13].isoformat() if r[13] else None,
        # Canonical triada v1
        'frameworkType': r[14] or 'generic',
        'frameworkState': r[15] or {},
        'scope': r[16] or 'personal',
        'horizon': r[17],
        'season': r[18],
        'whyText': r[19],
        'linkedSphereIds': r[20] or [],
        'createdFrom': r[21],
        'sourceContext': r[22],
        'executionProgress': r[23],
        'outcomeSignal': r[24],
    }


def _validate_goal_payload(body: dict) -> dict | None:
    """Возвращает None если ок, иначе dict с error."""
    ft = body.get('frameworkType')
    if ft is not None and ft not in ALLOWED_FRAMEWORK_TYPES:
        return {'error': 'invalid_framework_type', 'allowed': sorted(ALLOWED_FRAMEWORK_TYPES)}
    sc = body.get('scope')
    if sc is not None and sc not in ALLOWED_SCOPES:
        return {'error': 'invalid_scope', 'allowed': sorted(ALLOWED_SCOPES)}
    hz = body.get('horizon')
    if hz is not None and hz not in ALLOWED_HORIZONS:
        return {'error': 'invalid_horizon', 'allowed': sorted(ALLOWED_HORIZONS)}
    return None


def _handle_goals(method, cur, conn, family_id, user_id, item_id, event):
    if method == 'GET':
        cur.execute(GOAL_SELECT + '''
            FROM life_goals
            WHERE family_id = %s
            ORDER BY created_at DESC
        ''', (family_id,))
        return _resp(200, [_goal_to_dict(r) for r in cur.fetchall()])

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        err = _validate_goal_payload(body)
        if err:
            return _resp(400, err)
        framework_type = body.get('frameworkType') or body.get('framework') or 'generic'
        if framework_type not in ALLOWED_FRAMEWORK_TYPES:
            framework_type = 'generic'
        scope_val = body.get('scope')
        if not scope_val:
            scope_val = 'personal' if (body.get('ownerId') or user_id) else 'family'
        cur.execute('''
            INSERT INTO life_goals
            (family_id, owner_id, title, description, sphere, framework, deadline, status, progress, steps, ai_insights,
             framework_type, framework_state, scope, horizon, season, why_text, linked_sphere_ids,
             created_from, source_context)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb,
                    %s, %s::jsonb, %s, %s, %s, %s, %s::jsonb,
                    %s, %s::jsonb)
            RETURNING id, family_id, owner_id, title, description, sphere, framework,
                      deadline, status, progress, steps, ai_insights, created_at, updated_at,
                      framework_type, framework_state, scope, horizon, season, why_text,
                      linked_sphere_ids, created_from, source_context, execution_progress, outcome_signal
        ''', (
            family_id,
            body.get('ownerId') or user_id,
            body.get('title'),
            body.get('description'),
            body.get('sphere', 'personal'),
            body.get('framework') or framework_type,
            body.get('deadline'),
            body.get('status', 'active'),
            int(body.get('progress', 0)),
            json.dumps(body.get('steps', [])),
            json.dumps(body.get('aiInsights', {})),
            framework_type,
            json.dumps(body.get('frameworkState', {})),
            scope_val,
            body.get('horizon'),
            body.get('season'),
            body.get('whyText'),
            json.dumps(body.get('linkedSphereIds', [])),
            body.get('createdFrom'),
            json.dumps(body['sourceContext']) if body.get('sourceContext') is not None else None,
        ))
        new_row = cur.fetchone()
        conn.commit()
        # Этап 2.4: пересчёт кэша после создания (frameworkState/linkedSphereIds могут влиять)
        _safe_recompute(cur, conn, new_row[0])
        # Перечитываем goal, чтобы вернуть актуальный execution_progress
        cur.execute(GOAL_SELECT + ' FROM life_goals WHERE id = %s', (new_row[0],))
        refreshed = cur.fetchone() or new_row
        return _resp(201, _goal_to_dict(refreshed))

    if method == 'PUT':
        gid = item_id or body.get('id')
        if not gid:
            return _resp(400, {'error': 'id required'})
        err = _validate_goal_payload(body)
        if err:
            return _resp(400, err)
        cur.execute('''
            UPDATE life_goals
            SET title = COALESCE(%s, title),
                description = COALESCE(%s, description),
                sphere = COALESCE(%s, sphere),
                framework = COALESCE(%s, framework),
                deadline = COALESCE(%s, deadline),
                status = COALESCE(%s, status),
                progress = COALESCE(%s, progress),
                steps = COALESCE(%s::jsonb, steps),
                ai_insights = COALESCE(%s::jsonb, ai_insights),
                framework_type = COALESCE(%s, framework_type),
                framework_state = COALESCE(%s::jsonb, framework_state),
                scope = COALESCE(%s, scope),
                horizon = COALESCE(%s, horizon),
                season = COALESCE(%s, season),
                why_text = COALESCE(%s, why_text),
                linked_sphere_ids = COALESCE(%s::jsonb, linked_sphere_ids),
                created_from = COALESCE(%s, created_from),
                source_context = COALESCE(%s::jsonb, source_context),
                execution_progress = COALESCE(%s, execution_progress),
                outcome_signal = COALESCE(%s::jsonb, outcome_signal),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND family_id = %s
            RETURNING id, family_id, owner_id, title, description, sphere, framework,
                      deadline, status, progress, steps, ai_insights, created_at, updated_at,
                      framework_type, framework_state, scope, horizon, season, why_text,
                      linked_sphere_ids, created_from, source_context, execution_progress, outcome_signal
        ''', (
            body.get('title'),
            body.get('description'),
            body.get('sphere'),
            body.get('framework'),
            body.get('deadline'),
            body.get('status'),
            body.get('progress'),
            json.dumps(body['steps']) if 'steps' in body else None,
            json.dumps(body['aiInsights']) if 'aiInsights' in body else None,
            body.get('frameworkType'),
            json.dumps(body['frameworkState']) if 'frameworkState' in body else None,
            body.get('scope'),
            body.get('horizon'),
            body.get('season'),
            body.get('whyText'),
            json.dumps(body['linkedSphereIds']) if 'linkedSphereIds' in body else None,
            body.get('createdFrom'),
            json.dumps(body['sourceContext']) if 'sourceContext' in body else None,
            body.get('executionProgress'),
            json.dumps(body['outcomeSignal']) if 'outcomeSignal' in body else None,
            gid, family_id,
        ))
        upd = cur.fetchone()
        conn.commit()
        if not upd:
            return _resp(404, {'error': 'Goal not found'})
        # Этап 2.4: пересчёт кэша после изменения goal
        _safe_recompute(cur, conn, upd[0])
        cur.execute(GOAL_SELECT + ' FROM life_goals WHERE id = %s', (upd[0],))
        refreshed = cur.fetchone() or upd
        return _resp(200, _goal_to_dict(refreshed))

    if method == 'DELETE':
        gid = item_id or body.get('id')
        if not gid:
            return _resp(400, {'error': 'id required'})
        # Проверяем что цель действительно наша.
        cur.execute('SELECT id FROM life_goals WHERE id = %s AND family_id = %s', (gid, family_id))
        if not cur.fetchone():
            return _resp(404, {'error': 'Goal not found'})
        # Этап 3.3.2 follow-up: cleanup связей до удаления самой цели (нет CASCADE).
        # Порядок важен: сначала чистим зависимости, потом саму цель.
        cur.execute('DELETE FROM goal_portfolio_links WHERE goal_id = %s', (gid,))
        cur.execute('DELETE FROM goal_action_links WHERE goal_id = %s', (gid,))
        cur.execute('DELETE FROM goal_checkins WHERE goal_id = %s', (gid,))
        cur.execute('DELETE FROM goal_key_results WHERE goal_id = %s', (gid,))
        cur.execute('DELETE FROM goal_milestones WHERE goal_id = %s', (gid,))
        cur.execute('DELETE FROM life_goals WHERE id = %s AND family_id = %s', (gid, family_id))
        conn.commit()
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


# ============= Milestones / KR / Checkins / Action Links =============

def _milestone_to_dict(r) -> dict:
    return {
        'id': str(r[0]),
        'goalId': str(r[1]),
        'title': r[2],
        'description': r[3],
        'dueDate': r[4].isoformat() if r[4] else None,
        'weight': r[5] or 1,
        'status': r[6],
        'order': r[7] or 0,
        'completedAt': r[8].isoformat() if r[8] else None,
        'createdAt': r[9].isoformat() if r[9] else None,
        'updatedAt': r[10].isoformat() if r[10] else None,
    }


def _assert_goal_owned(cur, gid, family_id) -> bool:
    cur.execute('SELECT 1 FROM life_goals WHERE id = %s AND family_id = %s', (gid, family_id))
    return cur.fetchone() is not None


def _handle_milestones(method, cur, conn, family_id, user_id, item_id, event):
    qp = event.get('queryStringParameters') or {}
    goal_id = qp.get('goalId') or (json.loads(event.get('body') or '{}').get('goalId'))
    if method == 'GET':
        if not goal_id:
            return _resp(400, {'error': 'goalId required'})
        if not _assert_goal_owned(cur, goal_id, family_id):
            return _resp(404, {'error': 'Goal not found'})
        cur.execute('''
            SELECT id, goal_id, title, description, due_date, weight, status, order_index,
                   completed_at, created_at, updated_at
            FROM goal_milestones WHERE goal_id = %s
            ORDER BY order_index ASC, created_at ASC
        ''', (goal_id,))
        return _resp(200, [_milestone_to_dict(r) for r in cur.fetchall()])

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        gid = body.get('goalId')
        if not gid or not _assert_goal_owned(cur, gid, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        cur.execute('''
            INSERT INTO goal_milestones (goal_id, title, description, due_date, weight, status, order_index)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, goal_id, title, description, due_date, weight, status, order_index,
                      completed_at, created_at, updated_at
        ''', (
            gid,
            body.get('title') or 'Без названия',
            body.get('description'),
            body.get('dueDate'),
            int(body.get('weight', 1)),
            body.get('status', 'pending'),
            int(body.get('order', 0)),
        ))
        conn.commit()
        created = cur.fetchone()
        # Этап 2.4: для generic — пересчёт кэша; для smart/okr/wheel — milestones не влияют, но helper это знает
        _safe_recompute(cur, conn, gid)
        return _resp(201, _milestone_to_dict(created))

    if method == 'PUT':
        mid = item_id or body.get('id')
        if not mid:
            return _resp(400, {'error': 'id required'})
        cur.execute('''
            UPDATE goal_milestones m
            SET title = COALESCE(%s, title),
                description = COALESCE(%s, description),
                due_date = COALESCE(%s, due_date),
                weight = COALESCE(%s, weight),
                status = COALESCE(%s, status),
                order_index = COALESCE(%s, order_index),
                completed_at = CASE
                    WHEN %s = 'done' AND m.completed_at IS NULL THEN CURRENT_TIMESTAMP
                    WHEN %s IS NOT NULL AND %s <> 'done' THEN NULL
                    ELSE m.completed_at
                END,
                updated_at = CURRENT_TIMESTAMP
            FROM life_goals g
            WHERE m.id = %s AND m.goal_id = g.id AND g.family_id = %s
            RETURNING m.id, m.goal_id, m.title, m.description, m.due_date, m.weight, m.status, m.order_index,
                      m.completed_at, m.created_at, m.updated_at
        ''', (
            body.get('title'),
            body.get('description'),
            body.get('dueDate'),
            body.get('weight'),
            body.get('status'),
            body.get('order'),
            body.get('status'),
            body.get('status'),
            body.get('status'),
            mid, family_id,
        ))
        upd = cur.fetchone()
        conn.commit()
        if not upd:
            return _resp(404, {'error': 'Milestone not found'})
        # Этап 2.4: пересчёт после обновления milestone
        _safe_recompute(cur, conn, upd[1])
        return _resp(200, _milestone_to_dict(upd))

    if method == 'DELETE':
        mid = item_id or body.get('id')
        if not mid:
            return _resp(400, {'error': 'id required'})
        # Сначала вытащим goal_id, потом удалим — чтобы пересчитать кэш
        cur.execute(
            '''
            SELECT m.goal_id FROM goal_milestones m JOIN life_goals g ON g.id = m.goal_id
            WHERE m.id = %s AND g.family_id = %s
            ''',
            (mid, family_id),
        )
        owner = cur.fetchone()
        cur.execute('''
            DELETE FROM goal_milestones m USING life_goals g
            WHERE m.id = %s AND m.goal_id = g.id AND g.family_id = %s
        ''', (mid, family_id))
        conn.commit()
        if owner:
            _safe_recompute(cur, conn, owner[0])
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


def _kr_to_dict(r) -> dict:
    return {
        'id': str(r[0]),
        'goalId': str(r[1]),
        'title': r[2],
        'metricType': r[3],
        'unit': r[4],
        'startValue': float(r[5]) if r[5] is not None else 0,
        'currentValue': float(r[6]) if r[6] is not None else 0,
        'targetValue': float(r[7]) if r[7] is not None else 0,
        'dueDate': r[8].isoformat() if r[8] else None,
        'weight': r[9] or 1,
        'status': r[10],
        'order': r[11] or 0,
        'createdAt': r[12].isoformat() if r[12] else None,
        'updatedAt': r[13].isoformat() if r[13] else None,
    }


def _handle_keyresults(method, cur, conn, family_id, user_id, item_id, event):
    qp = event.get('queryStringParameters') or {}
    goal_id = qp.get('goalId') or (json.loads(event.get('body') or '{}').get('goalId'))
    if method == 'GET':
        if not goal_id:
            return _resp(400, {'error': 'goalId required'})
        if not _assert_goal_owned(cur, goal_id, family_id):
            return _resp(404, {'error': 'Goal not found'})
        cur.execute('''
            SELECT id, goal_id, title, metric_type, unit, start_value, current_value, target_value,
                   due_date, weight, status, order_index, created_at, updated_at
            FROM goal_key_results WHERE goal_id = %s
            ORDER BY order_index ASC, created_at ASC
        ''', (goal_id,))
        return _resp(200, [_kr_to_dict(r) for r in cur.fetchall()])

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        gid = body.get('goalId')
        if not gid or not _assert_goal_owned(cur, gid, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        cur.execute('''
            INSERT INTO goal_key_results
            (goal_id, title, metric_type, unit, start_value, current_value, target_value,
             due_date, weight, status, order_index)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, goal_id, title, metric_type, unit, start_value, current_value, target_value,
                      due_date, weight, status, order_index, created_at, updated_at
        ''', (
            gid,
            body.get('title') or 'Без названия',
            body.get('metricType', 'number'),
            body.get('unit'),
            float(body.get('startValue', 0)),
            float(body.get('currentValue', body.get('startValue', 0))),
            float(body.get('targetValue', 0)),
            body.get('dueDate'),
            int(body.get('weight', 1)),
            body.get('status', 'active'),
            int(body.get('order', 0)),
        ))
        conn.commit()
        created = cur.fetchone()
        # Этап 2.4: пересчёт кэша после создания KR
        _safe_recompute(cur, conn, gid)
        return _resp(201, _kr_to_dict(created))

    if method == 'PUT':
        kid = item_id or body.get('id')
        if not kid:
            return _resp(400, {'error': 'id required'})
        cur.execute('''
            UPDATE goal_key_results k
            SET title = COALESCE(%s, title),
                metric_type = COALESCE(%s, metric_type),
                unit = COALESCE(%s, unit),
                start_value = COALESCE(%s, start_value),
                current_value = COALESCE(%s, current_value),
                target_value = COALESCE(%s, target_value),
                due_date = COALESCE(%s, due_date),
                weight = COALESCE(%s, weight),
                status = COALESCE(%s, status),
                order_index = COALESCE(%s, order_index),
                updated_at = CURRENT_TIMESTAMP
            FROM life_goals g
            WHERE k.id = %s AND k.goal_id = g.id AND g.family_id = %s
            RETURNING k.id, k.goal_id, k.title, k.metric_type, k.unit, k.start_value, k.current_value, k.target_value,
                      k.due_date, k.weight, k.status, k.order_index, k.created_at, k.updated_at
        ''', (
            body.get('title'),
            body.get('metricType'),
            body.get('unit'),
            body.get('startValue'),
            body.get('currentValue'),
            body.get('targetValue'),
            body.get('dueDate'),
            body.get('weight'),
            body.get('status'),
            body.get('order'),
            kid, family_id,
        ))
        upd = cur.fetchone()
        conn.commit()
        if not upd:
            return _resp(404, {'error': 'KeyResult not found'})
        # Этап 2.4: пересчёт после обновления KR
        _safe_recompute(cur, conn, upd[1])
        return _resp(200, _kr_to_dict(upd))

    if method == 'DELETE':
        kid = item_id or body.get('id')
        if not kid:
            return _resp(400, {'error': 'id required'})
        cur.execute(
            '''
            SELECT k.goal_id FROM goal_key_results k JOIN life_goals g ON g.id = k.goal_id
            WHERE k.id = %s AND g.family_id = %s
            ''',
            (kid, family_id),
        )
        owner = cur.fetchone()
        cur.execute('''
            DELETE FROM goal_key_results k USING life_goals g
            WHERE k.id = %s AND k.goal_id = g.id AND g.family_id = %s
        ''', (kid, family_id))
        conn.commit()
        if owner:
            _safe_recompute(cur, conn, owner[0])
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


def _checkin_to_dict(r) -> dict:
    return {
        'id': str(r[0]),
        'goalId': str(r[1]),
        'authorId': str(r[2]) if r[2] else None,
        'periodStart': r[3].isoformat() if r[3] else None,
        'periodEnd': r[4].isoformat() if r[4] else None,
        'summary': r[5],
        'blockers': r[6],
        'nextStep': r[7],
        'selfAssessment': r[8],
        'data': r[9],
        'createdAt': r[10].isoformat() if r[10] else None,
    }


def _handle_checkins(method, cur, conn, family_id, user_id, item_id, event):
    qp = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    goal_id = qp.get('goalId') or body.get('goalId')

    if method == 'GET':
        if not goal_id or not _assert_goal_owned(cur, goal_id, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        cur.execute('''
            SELECT id, goal_id, author_id, period_start, period_end, summary, blockers,
                   next_step, self_assessment, data, created_at
            FROM goal_checkins WHERE goal_id = %s
            ORDER BY created_at DESC LIMIT 100
        ''', (goal_id,))
        return _resp(200, [_checkin_to_dict(r) for r in cur.fetchall()])

    if method == 'POST':
        if not goal_id or not _assert_goal_owned(cur, goal_id, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        cur.execute('''
            INSERT INTO goal_checkins
            (goal_id, author_id, period_start, period_end, summary, blockers, next_step, self_assessment, data)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
            RETURNING id, goal_id, author_id, period_start, period_end, summary, blockers,
                      next_step, self_assessment, data, created_at
        ''', (
            goal_id,
            user_id,
            body.get('periodStart'),
            body.get('periodEnd'),
            body.get('summary'),
            body.get('blockers'),
            body.get('nextStep'),
            body.get('selfAssessment'),
            json.dumps(body['data']) if body.get('data') is not None else None,
        ))
        conn.commit()
        return _resp(201, _checkin_to_dict(cur.fetchone()))

    return _resp(405, {'error': 'Method not allowed'})


def _link_to_dict(r) -> dict:
    return {
        'id': str(r[0]),
        'goalId': str(r[1]),
        'entityType': r[2],
        'entityId': r[3],
        'milestoneId': str(r[4]) if r[4] else None,
        'keyResultId': str(r[5]) if r[5] else None,
        'meta': r[6],
        'createdAt': r[7].isoformat() if r[7] else None,
    }


def _handle_links(method, cur, conn, family_id, user_id, item_id, event):
    qp = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    goal_id = qp.get('goalId') or body.get('goalId')
    # Этап 3.2.1: обратный поиск origin links по сущности.
    # GET /links?entityType=task&entityId=<id> — для Planning UI.
    entity_type = qp.get('entityType')
    entity_id = qp.get('entityId')

    if method == 'GET' and entity_type and entity_id:
        if entity_type not in {'task', 'habit', 'ritual', 'event'}:
            return _resp(400, {'error': 'invalid entityType'})
        # Только связи в рамках семьи: JOIN на life_goals + проверка family_id
        cur.execute(
            '''
            SELECT l.id, l.goal_id, l.entity_type, l.entity_id, l.milestone_id, l.key_result_id, l.meta, l.created_at,
                   g.title AS goal_title, g.status AS goal_status, g.framework_type AS goal_framework_type
            FROM goal_action_links l
            JOIN life_goals g ON g.id = l.goal_id
            WHERE l.entity_type = %s AND l.entity_id = %s AND g.family_id = %s
            ORDER BY l.created_at DESC
            ''',
            (entity_type, str(entity_id), family_id),
        )
        rows = cur.fetchall()
        # Подтягиваем заголовки milestone/KR, если есть, чтобы UI не дёргал ещё ручки
        result = []
        for r in rows:
            base = _link_to_dict(r)
            base['goalTitle'] = r[8]
            base['goalStatus'] = r[9]
            base['goalFrameworkType'] = r[10] or 'generic'
            base['milestoneTitle'] = None
            base['keyResultTitle'] = None
            if r[4]:
                cur.execute('SELECT title FROM goal_milestones WHERE id = %s', (r[4],))
                row_m = cur.fetchone()
                base['milestoneTitle'] = row_m[0] if row_m else None
            if r[5]:
                cur.execute('SELECT title FROM goal_key_results WHERE id = %s', (r[5],))
                row_k = cur.fetchone()
                base['keyResultTitle'] = row_k[0] if row_k else None
            result.append(base)
        return _resp(200, result)

    if method == 'GET':
        if not goal_id or not _assert_goal_owned(cur, goal_id, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        cur.execute('''
            SELECT id, goal_id, entity_type, entity_id, milestone_id, key_result_id, meta, created_at
            FROM goal_action_links WHERE goal_id = %s
            ORDER BY created_at DESC
        ''', (goal_id,))
        return _resp(200, [_link_to_dict(r) for r in cur.fetchall()])

    if method == 'POST':
        if not goal_id or not _assert_goal_owned(cur, goal_id, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        et = body.get('entityType')
        eid = body.get('entityId')
        if not et or not eid:
            return _resp(400, {'error': 'entityType and entityId required'})
        # Этап 3.1.1: семантика связи. Допустимые типы фиксированы.
        if et not in {'task', 'habit', 'ritual', 'event'}:
            return _resp(400, {'error': 'invalid entityType', 'allowed': ['task', 'habit', 'ritual', 'event']})
        # КОНТРАКТ Этапа 3.1: UNIQUE (goal_id, entity_type, entity_id).
        # Внутри одной цели у одной задачи может быть только ОДИН origin-слой
        # (или goal, или milestone, или KR — не одновременно).
        # Между разными целями одна и та же задача может иметь несколько связей.
        cur.execute('''
            INSERT INTO goal_action_links (goal_id, entity_type, entity_id, milestone_id, key_result_id, meta)
            VALUES (%s, %s, %s, %s, %s, %s::jsonb)
            ON CONFLICT (goal_id, entity_type, entity_id) DO UPDATE
                SET milestone_id = EXCLUDED.milestone_id,
                    key_result_id = EXCLUDED.key_result_id,
                    meta = EXCLUDED.meta
            RETURNING id, goal_id, entity_type, entity_id, milestone_id, key_result_id, meta, created_at
        ''', (
            goal_id, et, str(eid),
            body.get('milestoneId'),
            body.get('keyResultId'),
            json.dumps(body['meta']) if body.get('meta') is not None else None,
        ))
        conn.commit()
        return _resp(201, _link_to_dict(cur.fetchone()))

    if method == 'DELETE':
        lid = item_id or body.get('id')
        if not lid:
            return _resp(400, {'error': 'id required'})
        cur.execute('''
            DELETE FROM goal_action_links l USING life_goals g
            WHERE l.id = %s AND l.goal_id = g.id AND g.family_id = %s
        ''', (lid, family_id))
        conn.commit()
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


def _handle_cache_backfill(method, cur, conn, family_id):
    """Этап 2.4.5: однократный backfill execution_progress для всех целей семьи.
    POST /?resource=cache-backfill — пересчитать кэш для каждой цели семьи.
    Возвращает summary с количествами и списком ошибок.
    """
    if method != 'POST':
        return _resp(405, {'error': 'Method not allowed'})
    cur.execute('SELECT id FROM life_goals WHERE family_id = %s', (family_id,))
    ids = [r[0] for r in cur.fetchall()]
    results = {'total': len(ids), 'updated': 0, 'nulled': 0, 'failed': 0, 'errors': []}
    for gid in ids:
        r = recompute_goal_execution_cache(cur, conn, gid)
        if r.get('error'):
            results['failed'] += 1
            results['errors'].append({'goalId': r.get('goalId'), 'error': r['error']})
        elif r.get('executionProgress') is None:
            results['nulled'] += 1
        else:
            results['updated'] += 1
    return _resp(200, results)


def _portfolio_link_row_to_dict(r):
    """Mapper для goal_portfolio_links row.
    Поля r[0..7]: id, goal_id, item_type, item_id, meta, linked_by, linked_at,
    + опционально r[8]=item_title, r[9]=item_sphere, r[10]=item_icon, r[11]=item_member_id.
    """
    base = {
        'id': str(r[0]),
        'goalId': str(r[1]),
        'itemType': r[2],
        'itemId': str(r[3]),
        'meta': r[4] or {},
        'linkedBy': str(r[5]) if r[5] else None,
        'linkedAt': r[6].isoformat() if r[6] else None,
    }
    if len(r) > 7:
        # Расширенные поля для UI (могут быть None если item удалён — broken state).
        base['itemTitle'] = r[7] if len(r) > 7 else None
        base['itemSphere'] = r[8] if len(r) > 8 else None
        base['itemIcon'] = r[9] if len(r) > 9 else None
        base['itemMemberId'] = str(r[10]) if len(r) > 10 and r[10] else None
        base['itemEarnedAt'] = r[11].isoformat() if len(r) > 11 and r[11] else None
    return base


def _assert_goal_owned_simple(cur, goal_id, family_id):
    """Локальный helper если основной _assert_goal_owned недоступен."""
    cur.execute('SELECT 1 FROM life_goals WHERE id = %s AND family_id = %s', (goal_id, family_id))
    return cur.fetchone() is not None


def _handle_portfolio_links(method, cur, conn, family_id, user_id, item_id, event):
    """Этап 3.3.1: связь Workshop goal <-> Portfolio item (manual attach).
    Контракт: справочная связь, НЕ меняет progress цели и НЕ меняет portfolio item.
    GET    /?resource=portfolio-links&goalId=...      — список связей цели
    POST   /?resource=portfolio-links   body: {goalId, itemType, itemId}
    DELETE /?resource=portfolio-links&id=...          — отвязать
    """
    qp = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    goal_id = qp.get('goalId') or body.get('goalId')
    # Этап 3.3.2: обратный поиск связей по item (для Portfolio UI).
    item_type_q = qp.get('itemType')
    item_id_q = qp.get('itemId')

    if method == 'GET' and item_type_q and item_id_q:
        if item_type_q != 'achievement':
            return _resp(400, {'error': 'invalid itemType'})
        # Family-safe: возвращаем только связи, у которых goal в нашей семье.
        # Подтягиваем title/status цели для UI.
        cur.execute(
            '''
            SELECT l.id, l.goal_id, l.item_type, l.item_id, l.meta, l.linked_by, l.linked_at,
                   g.title AS goal_title, g.status AS goal_status, g.framework_type AS goal_framework_type
            FROM goal_portfolio_links l
            JOIN life_goals g ON g.id = l.goal_id
            WHERE l.item_type = %s AND l.item_id = %s AND g.family_id = %s
            ORDER BY l.linked_at DESC
            ''',
            (item_type_q, item_id_q, family_id),
        )
        rows = cur.fetchall()
        result = []
        for r in rows:
            base = {
                'id': str(r[0]),
                'goalId': str(r[1]),
                'itemType': r[2],
                'itemId': str(r[3]),
                'meta': r[4] or {},
                'linkedBy': str(r[5]) if r[5] else None,
                'linkedAt': r[6].isoformat() if r[6] else None,
                'goalTitle': r[7],
                'goalStatus': r[8],
                'goalFrameworkType': r[9] or 'generic',
            }
            result.append(base)
        return _resp(200, result)

    if method == 'GET':
        if not goal_id or not _assert_goal_owned_simple(cur, goal_id, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        # JOIN на member_achievements — подтянем title/sphere/icon/earnedAt.
        # LEFT JOIN, чтобы битые ссылки тоже приходили (UI покажет broken-state).
        cur.execute(
            '''
            SELECT l.id, l.goal_id, l.item_type, l.item_id, l.meta, l.linked_by, l.linked_at,
                   a.title, a.sphere_key, a.icon, a.member_id, a.earned_at
            FROM goal_portfolio_links l
            LEFT JOIN member_achievements a
              ON l.item_type = 'achievement' AND a.id = l.item_id AND a.family_id = %s
            WHERE l.goal_id = %s
            ORDER BY l.linked_at DESC
            ''',
            (family_id, goal_id),
        )
        return _resp(200, [_portfolio_link_row_to_dict(r) for r in cur.fetchall()])

    if method == 'POST':
        if not goal_id or not _assert_goal_owned_simple(cur, goal_id, family_id):
            return _resp(400, {'error': 'invalid goalId'})
        item_type = body.get('itemType') or 'achievement'
        body_item_id = body.get('itemId')
        # Этап 3.3.2 (Variant A): пока поддерживаем только achievement.
        if item_type != 'achievement':
            return _resp(400, {'error': 'invalid itemType', 'allowed': ['achievement']})
        if not body_item_id:
            return _resp(400, {'error': 'itemId required'})

        # Family-safe: item должен принадлежать той же семье.
        cur.execute(
            'SELECT id, title FROM member_achievements WHERE id = %s AND family_id = %s',
            (body_item_id, family_id),
        )
        row = cur.fetchone()
        if not row:
            return _resp(404, {'error': 'item not found or not in your family'})

        snapshot_title = row[1]
        meta = body.get('meta') or {}
        meta.setdefault('source', 'manual')
        meta.setdefault('sourceTitle', snapshot_title)

        cur.execute(
            '''
            INSERT INTO goal_portfolio_links (goal_id, item_type, item_id, meta, linked_by)
            VALUES (%s, %s, %s, %s::jsonb, %s)
            ON CONFLICT (goal_id, item_type, item_id) DO UPDATE
                SET meta = EXCLUDED.meta
            RETURNING id, goal_id, item_type, item_id, meta, linked_by, linked_at
            ''',
            (goal_id, item_type, body_item_id, json.dumps(meta), user_id),
        )
        conn.commit()
        return _resp(200, _portfolio_link_row_to_dict(cur.fetchone()))

    if method == 'DELETE':
        link_id = qp.get('id') or item_id
        if not link_id:
            return _resp(400, {'error': 'id required'})
        # Подтверждаем принадлежность семье через JOIN на goal.
        cur.execute(
            '''
            DELETE FROM goal_portfolio_links l
            USING life_goals g
            WHERE l.id = %s AND l.goal_id = g.id AND g.family_id = %s
            ''',
            (link_id, family_id),
        )
        conn.commit()
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


def _handle_portfolio_picker(method, cur, conn, family_id, event):
    """Этап 3.3.1: picker списка Portfolio items для attach-диалога.
    GET /?resource=portfolio-picker&itemType=achievement&q=...&excludeGoalId=...&limit=50
    Только items текущей семьи. Можно исключить уже привязанные к данной цели.
    """
    if method != 'GET':
        return _resp(405, {'error': 'Method not allowed'})
    qp = event.get('queryStringParameters') or {}
    item_type = qp.get('itemType') or 'achievement'
    # Variant A: только achievement до полной поддержки других типов.
    if item_type != 'achievement':
        return _resp(400, {'error': 'invalid itemType', 'allowed': ['achievement']})
    q = (qp.get('q') or '').strip()
    exclude_goal_id = qp.get('excludeGoalId')
    try:
        limit = max(1, min(100, int(qp.get('limit') or 50)))
    except ValueError:
        limit = 50

    sql = (
        'SELECT a.id, a.title, a.description, a.sphere_key, a.icon, a.category, '
        'a.member_id, a.earned_at, a.badge_key '
        'FROM member_achievements a WHERE a.family_id = %s'
    )
    params: list = [family_id]
    if q:
        sql += ' AND (a.title ILIKE %s OR a.description ILIKE %s OR a.badge_key ILIKE %s)'
        like = f'%{q}%'
        params += [like, like, like]
    if exclude_goal_id:
        sql += (
            ' AND a.id NOT IN ('
            "SELECT l.item_id FROM goal_portfolio_links l "
            "WHERE l.goal_id = %s AND l.item_type = 'achievement'"
            ')'
        )
        params.append(exclude_goal_id)
    sql += ' ORDER BY a.earned_at DESC NULLS LAST, a.created_at DESC LIMIT %s'
    params.append(limit)
    cur.execute(sql, tuple(params))
    rows = cur.fetchall()
    result = [
        {
            'id': str(r[0]),
            'itemType': 'achievement',
            'title': r[1],
            'description': r[2],
            'sphereKey': r[3],
            'icon': r[4],
            'category': r[5],
            'memberId': str(r[6]) if r[6] else None,
            'earnedAt': r[7].isoformat() if r[7] else None,
            'badgeKey': r[8],
        }
        for r in rows
    ]
    return _resp(200, result)


def _handle_photo(method, family_id, event):
    if method != 'POST':
        return _resp(405, {'error': 'Method not allowed'})
    body = json.loads(event.get('body') or '{}')
    photo_b64 = body.get('photo')
    filename = body.get('filename') or f'photo_{int(datetime.now().timestamp() * 1000)}.jpg'
    if not photo_b64:
        return _resp(400, {'error': 'photo (base64) required'})
    if ',' in photo_b64 and photo_b64.startswith('data:'):
        photo_b64 = photo_b64.split(',', 1)[1]
    try:
        data = base64.b64decode(photo_b64)
    except Exception as e:
        return _resp(400, {'error': f'Invalid base64: {e}'})

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    safe_name = filename.replace('/', '_').replace('\\', '_')
    key = f'life-road/{family_id}/{safe_name}'
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=body.get('contentType', 'image/jpeg'))
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return _resp(200, {'url': cdn_url})


def _handle_balance(method, cur, conn, family_id, user_id, event):
    if method == 'GET':
        cur.execute('''
            SELECT id, family_id, owner_id, scores, notes, created_at
            FROM life_balance_wheel
            WHERE family_id = %s
            ORDER BY created_at DESC
            LIMIT 30
        ''', (family_id,))
        rows = cur.fetchall()
        return _resp(200, [{
            'id': str(r[0]),
            'familyId': str(r[1]),
            'ownerId': str(r[2]) if r[2] else None,
            'scores': r[3] or {},
            'notes': r[4],
            'createdAt': r[5].isoformat() if r[5] else None,
        } for r in rows])

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        cur.execute('''
            INSERT INTO life_balance_wheel (family_id, owner_id, scores, notes)
            VALUES (%s, %s, %s::jsonb, %s)
            RETURNING id, family_id, owner_id, scores, notes, created_at
        ''', (
            family_id,
            body.get('ownerId') or user_id,
            json.dumps(body.get('scores', {})),
            body.get('notes'),
        ))
        r = cur.fetchone()
        conn.commit()
        return _resp(201, {
            'id': str(r[0]),
            'familyId': str(r[1]),
            'ownerId': str(r[2]) if r[2] else None,
            'scores': r[3] or {},
            'notes': r[4],
            'createdAt': r[5].isoformat() if r[5] else None,
        })

    return _resp(405, {'error': 'Method not allowed'})


COACH_PRICE = 3
COACH_REASON = 'ai_life_coach'
COACH_DESCRIPTION = 'Домовой (наставник)'


def _wallet_spend(family_id, user_id, amount, reason, description):
    """Списание средств с семейного кошелька. Возвращает dict с success/error."""
    if not family_id:
        return {'error': 'no_family'}
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    try:
        c = conn.cursor()
        safe_fid = str(family_id).replace("'", "''")
        c.execute("SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % safe_fid)
        row = c.fetchone()
        if not row:
            c.execute(
                "INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub"
                % safe_fid
            )
            row = c.fetchone()
            conn.commit()
        wallet_id, balance = row[0], float(row[1])
        if balance < amount:
            return {'error': 'insufficient_funds', 'balance': balance, 'required': amount}
        c.execute(
            "UPDATE family_wallet SET balance_rub = balance_rub - %s, updated_at = NOW() WHERE id = %d"
            % (amount, wallet_id)
        )
        safe_desc = description.replace("'", "''")
        # user_id из X-User-Id это id из family_members. wallet_transactions.user_id ссылается на users(id).
        # Берём реальный users.id через JOIN, иначе пишем NULL чтобы избежать FK violation.
        real_user_sql = "NULL"
        if user_id:
            safe_uid = str(user_id).replace("'", "''")
            c.execute(
                "SELECT u.id FROM family_members fm "
                "LEFT JOIN users u ON u.id = fm.user_id "
                "WHERE fm.id = '%s' AND u.id IS NOT NULL "
                "UNION ALL SELECT id FROM users WHERE id = '%s' LIMIT 1"
                % (safe_uid, safe_uid)
            )
            ru = c.fetchone()
            if ru and ru[0]:
                real_user_sql = "'%s'" % str(ru[0]).replace("'", "''")
        c.execute(
            "INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id) "
            "VALUES (%d, 'spend', %s, '%s', '%s', %s)"
            % (wallet_id, amount, reason, safe_desc, real_user_sql)
        )
        conn.commit()
        return {'success': True, 'new_balance': round(balance - amount, 2)}
    except Exception as e:
        conn.rollback()
        return {'error': 'db_error', 'details': str(e)}
    finally:
        conn.close()


def _handle_coach(method, cur, family_id, user_id, event):
    if method != 'POST':
        return _resp(405, {'error': 'Method not allowed'})

    spend_result = _wallet_spend(family_id, user_id, COACH_PRICE, COACH_REASON, COACH_DESCRIPTION)
    if spend_result.get('error') == 'insufficient_funds':
        return _resp(402, {
            'error': 'insufficient_funds',
            'message': 'Недостаточно средств на семейном кошельке для Домового.',
            'balance': spend_result.get('balance', 0),
            'required': COACH_PRICE,
        })
    if spend_result.get('error') and spend_result.get('error') != 'no_family':
        return _resp(500, {
            'error': 'wallet_error',
            'message': 'Не удалось списать монеты за совет Домового. Попробуйте позже.',
            'details': spend_result.get('error'),
        })

    body = json.loads(event.get('body') or '{}')
    mode = (body.get('mode') or 'general').lower()
    user_question = (body.get('question') or '').strip()
    framework = body.get('framework')
    goal_title = body.get('goalTitle')
    goal_description = body.get('goalDescription')

    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    if not api_key:
        return _resp(500, {'error': 'YANDEX_GPT_API_KEY not set'})

    cur.execute('''
        SELECT event_date, title, category, importance, is_future
        FROM life_events WHERE family_id = %s ORDER BY event_date ASC LIMIT 60
    ''', (family_id,))
    events_rows = cur.fetchall()

    cur.execute('''
        SELECT title, sphere, framework, deadline, status, progress
        FROM life_goals WHERE family_id = %s ORDER BY created_at DESC LIMIT 30
    ''', (family_id,))
    goals_rows = cur.fetchall()

    cur.execute('''
        SELECT scores, created_at FROM life_balance_wheel
        WHERE family_id = %s ORDER BY created_at DESC LIMIT 1
    ''', (family_id,))
    balance_row = cur.fetchone()

    context_lines = []
    if events_rows:
        context_lines.append('События пользователя (дата · название · категория · важность):')
        for r in events_rows[-25:]:
            tag = ' [план]' if r[4] else ''
            context_lines.append(f'- {r[0]} · {r[1]} · {r[2]} · {r[3]}{tag}')
    if goals_rows:
        context_lines.append('\nТекущие цели:')
        for r in goals_rows:
            context_lines.append(f'- {r[0]} (сфера {r[1]}, методика {r[2] or "—"}, статус {r[4]}, прогресс {r[5]}%)')
    if balance_row and isinstance(balance_row[0], dict):
        context_lines.append('\nПоследнее Колесо баланса (1–10):')
        for sphere, score in balance_row[0].items():
            context_lines.append(f'- {sphere}: {score}')

    context_text = '\n'.join(context_lines) if context_lines else 'Контекст пуст: пользователь только начинает.'

    if mode == 'goal-suggest':
        user_text = (
            f"Пользователь добавляет цель «{goal_title or '—'}» (методика {framework or 'не выбрана'}).\n"
            f"Описание: {goal_description or '—'}.\n"
            "Дай 1–2 коротких подсказки по этой методике + первый конкретный шаг на эту неделю.\n\n"
            f"Контекст:\n{context_text}"
        )
    elif mode == 'reflect-past':
        user_text = (
            "Помоги отрефлексировать прошлое: какие сильные паттерны, что повторяется, "
            "что можно усилить. 3–5 коротких наблюдений и одно практическое задание.\n\n"
            f"Контекст:\n{context_text}"
        )
    elif mode == 'plan-future':
        user_text = (
            "Предложи реалистичный план на ближайший год по методике 7 навыков Кови с учётом колеса баланса. "
            "Сначала укажи 2 сферы, где сейчас просадка. Затем 3 цели по SMART, по одной на квартал.\n\n"
            f"Контекст:\n{context_text}"
        )
    elif mode == 'ikigai':
        user_text = (
            "Помоги нащупать Икигай через 4 вопроса (что любишь, в чём силён, что нужно миру, "
            "за что могут платить) — кратко, по 1–2 наводящих вопроса под каждый.\n\n"
            f"Контекст:\n{context_text}"
        )
    elif mode == 'balance-check':
        user_text = (
            "Посмотри на Колесо баланса и скажи: 2 сферы сейчас в просадке и почему это важно. "
            "Предложи по 1 простому действию на эту неделю для каждой сферы.\n\n"
            f"Контекст:\n{context_text}"
        )
    elif mode == 'next-step':
        user_text = (
            "Пользователь хочет двигаться, но не знает с чего начать. Посмотри его события, цели и баланс. "
            "Сформулируй ОДИН маленький, конкретный и достижимый шаг на ближайшие 3 дня. "
            "Объясни, почему именно этот шаг, и как он продвинет его дальше.\n\n"
            f"Контекст:\n{context_text}"
        )
    elif mode == 'blockers':
        user_text = (
            "Что сейчас может тормозить пользователя на пути? Найди 2–3 возможных блока "
            "(страхи, противоречия между целями, перегрузка сфер, отсутствие опор) — мягко, без осуждения. "
            "Предложи для каждого один простой способ сдвинуться с места.\n\n"
            f"Контекст:\n{context_text}"
        )
    else:
        if not user_question:
            return _resp(400, {'error': 'question required for general mode'})
        user_text = f"Вопрос пользователя: {user_question}\n\nКонтекст:\n{context_text}"

    payload = {
        'modelUri': f'gpt://{YANDEX_FOLDER_ID}/yandexgpt-lite',
        'completionOptions': {'stream': False, 'temperature': 0.6, 'maxTokens': 1500},
        'messages': [
            {'role': 'system', 'text': COACH_SYSTEM_PROMPT},
            {'role': 'user', 'text': user_text},
        ],
    }

    try:
        r = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'},
            json=payload,
            timeout=30,
        )
    except Exception as e:
        return _resp(502, {'error': f'YandexGPT request failed: {e}'})

    if r.status_code != 200:
        return _resp(502, {'error': 'YandexGPT bad status', 'status': r.status_code, 'details': r.text[:300]})

    data = r.json()
    text = (
        data.get('result', {})
        .get('alternatives', [{}])[0]
        .get('message', {})
        .get('text', '')
    )
    return _resp(200, {'response': text or 'Не удалось получить ответ.', 'mode': mode})