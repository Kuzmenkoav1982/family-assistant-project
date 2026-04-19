import json
import os
import base64
from datetime import datetime
import psycopg2
import boto3

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