import json
import os
import base64
from datetime import datetime
import psycopg2
import boto3
import requests

YANDEX_FOLDER_ID = 'b1gaglg8i7v2i32nvism'

COACH_SYSTEM_PROMPT = (
    "Ты — Домовой, тёплый и мудрый ИИ-наставник по жизненному пути семьи в приложении 'Наша Семья'. "
    "Твоя задача — помогать пользователю осмыслить «Дорогу жизни», поставить и достичь цели. "
    "Ты опираешься на проверенные методики: SMART, Колесо баланса, Икигай, 7 навыков высокоэффективных людей Кови. "
    "Говори по-русски, на ты, мягко и по-человечески. Не давай медицинских и юридических советов. "
    "Отвечай кратко (3–6 коротких абзацев или маркированный список), конкретно и с примером первого шага."
)

def handler(event: dict, context) -> dict:
    '''
    Управление Дорогой жизни: события (life_events), цели (life_goals) и колесо баланса (life_balance_wheel)
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
        if resource == 'balance':
            return _handle_balance(method, cur, conn, family_id, user_id, event)
        if resource == 'photo':
            return _handle_photo(method, family_id, event)
        if resource == 'coach':
            return _handle_coach(method, cur, family_id, event)

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
    }


def _handle_goals(method, cur, conn, family_id, user_id, item_id, event):
    if method == 'GET':
        cur.execute('''
            SELECT id, family_id, owner_id, title, description, sphere, framework,
                   deadline, status, progress, steps, ai_insights, created_at, updated_at
            FROM life_goals
            WHERE family_id = %s
            ORDER BY created_at DESC
        ''', (family_id,))
        return _resp(200, [_goal_to_dict(r) for r in cur.fetchall()])

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        cur.execute('''
            INSERT INTO life_goals
            (family_id, owner_id, title, description, sphere, framework, deadline, status, progress, steps, ai_insights)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb)
            RETURNING id, family_id, owner_id, title, description, sphere, framework,
                      deadline, status, progress, steps, ai_insights, created_at, updated_at
        ''', (
            family_id,
            body.get('ownerId') or user_id,
            body.get('title'),
            body.get('description'),
            body.get('sphere', 'personal'),
            body.get('framework'),
            body.get('deadline'),
            body.get('status', 'active'),
            int(body.get('progress', 0)),
            json.dumps(body.get('steps', [])),
            json.dumps(body.get('aiInsights', {})),
        ))
        new_row = cur.fetchone()
        conn.commit()
        return _resp(201, _goal_to_dict(new_row))

    if method == 'PUT':
        gid = item_id or body.get('id')
        if not gid:
            return _resp(400, {'error': 'id required'})
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
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND family_id = %s
            RETURNING id, family_id, owner_id, title, description, sphere, framework,
                      deadline, status, progress, steps, ai_insights, created_at, updated_at
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
            gid, family_id,
        ))
        upd = cur.fetchone()
        conn.commit()
        if not upd:
            return _resp(404, {'error': 'Goal not found'})
        return _resp(200, _goal_to_dict(upd))

    if method == 'DELETE':
        gid = item_id or body.get('id')
        if not gid:
            return _resp(400, {'error': 'id required'})
        cur.execute('DELETE FROM life_goals WHERE id = %s AND family_id = %s', (gid, family_id))
        conn.commit()
        return _resp(200, {'success': True})

    return _resp(405, {'error': 'Method not allowed'})


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


def _handle_coach(method, cur, family_id, event):
    if method != 'POST':
        return _resp(405, {'error': 'Method not allowed'})

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