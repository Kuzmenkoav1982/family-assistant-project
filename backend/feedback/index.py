"""Получение, отправка и модерация отзывов и идей пользователей"""

import json
import os
from typing import Optional, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

MAX_BOT_TOKEN = os.environ.get('MAX_BOT_TOKEN', '')
MAX_ADMIN_CHAT_ID = os.environ.get('MAX_ADMIN_CHAT_ID', '')
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_ADMIN_CHAT_ID = os.environ.get('TELEGRAM_ADMIN_CHAT_ID', '')

TYPE_LABELS = {
    'support': '🆘 Поддержка',
    'review': '⭐ Отзыв',
    'suggestion': '💡 Предложение',
}

def notify_support(feedback_type: str, user_name: str, user_email: str, title: str, description: str, feedback_id: str):
    label = TYPE_LABELS.get(feedback_type, feedback_type)
    desk_url = f"https://nasha-semiya.ru/admin/support-desk?id={feedback_id}"
    text = (
        f"{label} — новое обращение #{feedback_id}\n\n"
        f"От: {user_name}"
        + (f" ({user_email})" if user_email else "") + "\n"
        f"Тема: {title}\n"
        f"Текст: {description[:250]}"
        + ("..." if len(description) > 250 else "") + "\n\n"
        f"Открыть карточку: {desk_url}"
    )
    print(f"[NOTIFY] token={'ok' if MAX_BOT_TOKEN else 'MISSING'} chat={'ok' if MAX_ADMIN_CHAT_ID else 'MISSING'} id={feedback_id}")
    if MAX_BOT_TOKEN and MAX_ADMIN_CHAT_ID:
        try:
            resp = requests.post(
                f'https://platform-api.max.ru/messages?chat_id={MAX_ADMIN_CHAT_ID}',
                headers={'Content-Type': 'application/json', 'Authorization': MAX_BOT_TOKEN},
                json={'text': text},
                timeout=5
            )
            print(f"[NOTIFY] MAX status={resp.status_code} body={resp.text[:200]}")
        except Exception as e:
            print(f"[WARN] MAX notify failed: {e}")
    if TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID:
        try:
            resp = requests.post(
                f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage',
                json={'chat_id': TELEGRAM_ADMIN_CHAT_ID, 'text': text},
                timeout=5
            )
            print(f"[NOTIFY] TG status={resp.status_code}")
        except Exception as e:
            print(f"[WARN] TG notify failed: {e}")

IDEA_CATEGORIES = [
    {'id': 'feature', 'name': 'Новая функция', 'icon': 'Sparkles', 'color': 'bg-purple-500'},
    {'id': 'improvement', 'name': 'Улучшение', 'icon': 'TrendingUp', 'color': 'bg-blue-500'},
    {'id': 'bug', 'name': 'Ошибка', 'icon': 'Bug', 'color': 'bg-red-500'},
    {'id': 'design', 'name': 'Дизайн', 'icon': 'Palette', 'color': 'bg-pink-500'},
    {'id': 'other', 'name': 'Другое', 'icon': 'MoreHorizontal', 'color': 'bg-gray-500'},
]

IDEA_STATUSES = [
    {'id': 'new', 'name': 'Новая', 'icon': 'Lightbulb', 'color': 'bg-yellow-500'},
    {'id': 'considering', 'name': 'На рассмотрении', 'icon': 'Eye', 'color': 'bg-blue-500'},
    {'id': 'planned', 'name': 'Запланировано', 'icon': 'Calendar', 'color': 'bg-purple-500'},
    {'id': 'in_progress', 'name': 'В работе', 'icon': 'Loader', 'color': 'bg-orange-500'},
    {'id': 'done', 'name': 'Готово', 'icon': 'CheckCircle', 'color': 'bg-green-500'},
    {'id': 'rejected', 'name': 'Отклонено', 'icon': 'XCircle', 'color': 'bg-gray-500'},
]

IDEA_CAT_MAP = {c['id']: c for c in IDEA_CATEGORIES}
IDEA_STATUS_MAP = {s['id']: s for s in IDEA_STATUSES}


def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def escape_string(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Session-Token, X-Admin-Actor',
        'Content-Type': 'application/json'
    }


def _verify_session_in_db(token: str) -> bool:
    if not token or not DATABASE_URL:
        return False
    try:
        import hashlib
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(
            f"SELECT 1 FROM {SCHEMA}.admin_sessions "
            f"WHERE token_hash = %s AND revoked_at IS NULL AND expires_at > now() LIMIT 1",
            (token_hash,),
        )
        row = cur.fetchone()
        if row:
            cur.execute(
                f"UPDATE {SCHEMA}.admin_sessions SET last_used_at = now() WHERE token_hash = %s",
                (token_hash,),
            )
            conn.commit()
        cur.close()
        conn.close()
        return bool(row)
    except Exception:
        return False


def verify_token(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT s.user_id, u.name, u.email
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON u.id = s.user_id
        WHERE s.token = {escape_string(token)} AND s.expires_at > CURRENT_TIMESTAMP
        LIMIT 1
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None


def get_auth_token(event):
    headers = event.get('headers') or {}
    return headers.get('x-auth-token') or headers.get('X-Auth-Token')


def serialize_idea(row: dict, user_voted: bool = False) -> dict:
    return {
        'id': str(row['id']),
        'title': row['title'],
        'description': row['description'],
        'category': IDEA_CAT_MAP.get(row['category'], {'id': row['category'], 'name': row['category'], 'icon': 'Circle', 'color': 'bg-gray-500'}),
        'status': IDEA_STATUS_MAP.get(row['status'], {'id': row['status'], 'name': row['status'], 'icon': 'Circle', 'color': 'bg-gray-500'}),
        'votes_count': row.get('votes_count') or 0,
        'comments_count': row.get('comments_count') or 0,
        'author': {'name': row.get('author_name') or 'Пользователь', 'email': ''},
        'user_voted': user_voted,
        'created_at': row['created_at'],
        'updated_at': row['updated_at'],
    }


def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(body, default=str, ensure_ascii=False)
    }


def is_admin(event):
    headers = event.get('headers') or {}
    for k, v in headers.items():
        if isinstance(k, str) and isinstance(v, str) and k.lower() == 'x-admin-session-token':
            return _verify_session_in_db(v)
    return False


def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    body_raw = event.get('body') or '{}'
    try:
        body_parsed = json.loads(body_raw) if body_raw else {}
    except Exception:
        body_parsed = {}

    resource = params.get('resource') or body_parsed.get('resource')
    if resource == 'ideas':
        return handle_ideas(event, method, params, body_parsed)

    action = params.get('action') or (json.loads(event.get('body') or '{}').get('action') if method == 'POST' else None)

    if method == 'GET':
        if params.get('id') and params.get('detail') == '1':
            return get_ticket(event)
        return get_feedback(event)
    elif method == 'POST':
        if action == 'reply':
            return reply_feedback(event)
        if action == 'note':
            return add_note(event)
        if action == 'ai_analyze':
            return ai_analyze(event)
        return create_feedback(event)
    elif method == 'PUT':
        return update_feedback(event)
    elif method == 'DELETE':
        return delete_feedback(event)

    return response(405, {'error': 'Method not allowed'})


def handle_ideas(event, method, params, body):
    if method == 'GET':
        action = params.get('action', 'list')
        if action == 'categories':
            return response(200, {'categories': IDEA_CATEGORIES})
        if action == 'statuses':
            return response(200, {'statuses': IDEA_STATUSES})
        if action == 'detail':
            return get_idea_detail(event, params)
        return list_ideas(event, params)

    if method == 'POST':
        action = body.get('action')
        user = verify_token(get_auth_token(event))
        if not user:
            return response(401, {'error': 'Требуется авторизация'})
        if action == 'create':
            return create_idea(user, body)
        if action == 'vote':
            return vote_idea(user, body)
        if action == 'comment':
            return add_idea_comment(user, body)
        return response(400, {'error': 'Неизвестное действие'})

    return response(405, {'error': 'Method not allowed'})


def list_ideas(event, params):
    user = verify_token(get_auth_token(event))
    user_id = user['user_id'] if user else None
    sort_by = params.get('sort_by', 'votes')
    category = params.get('category')
    status = params.get('status')

    where = []
    if category and category != 'all':
        where.append(f"i.category = {escape_string(category)}")
    if status and status != 'all':
        where.append(f"i.status = {escape_string(status)}")
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''

    order_sql = 'ORDER BY i.votes_count DESC, i.created_at DESC'
    if sort_by == 'newest':
        order_sql = 'ORDER BY i.created_at DESC'
    elif sort_by == 'oldest':
        order_sql = 'ORDER BY i.created_at ASC'
    elif sort_by == 'comments':
        order_sql = 'ORDER BY i.comments_count DESC, i.created_at DESC'

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT i.id, i.title, i.description, i.category, i.status,
               i.votes_count, i.comments_count, i.created_at, i.updated_at,
               u.name AS author_name
        FROM {SCHEMA}.user_ideas i
        LEFT JOIN {SCHEMA}.users u ON u.id = i.user_id
        {where_sql}
        {order_sql}
        LIMIT 200
    """)
    rows = cur.fetchall()

    voted_ids = set()
    if user_id and rows:
        ids_sql = ','.join(escape_string(str(r['id'])) for r in rows)
        cur.execute(f"""
            SELECT idea_id FROM {SCHEMA}.idea_votes
            WHERE user_id::text = {escape_string(str(user_id))}
              AND idea_id::text IN ({ids_sql})
        """)
        voted_ids = {str(r['idea_id']) for r in cur.fetchall()}

    cur.close()
    conn.close()

    ideas = [serialize_idea(dict(r), user_voted=(str(r['id']) in voted_ids)) for r in rows]
    return response(200, {'ideas': ideas})


def get_idea_detail(event, params):
    idea_id = params.get('id')
    if not idea_id:
        return response(400, {'error': 'id обязателен'})

    user = verify_token(get_auth_token(event))
    user_id = user['user_id'] if user else None

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT i.id, i.title, i.description, i.category, i.status,
               i.votes_count, i.comments_count, i.created_at, i.updated_at,
               u.name AS author_name
        FROM {SCHEMA}.user_ideas i
        LEFT JOIN {SCHEMA}.users u ON u.id = i.user_id
        WHERE i.id::text = {escape_string(idea_id)}
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return response(404, {'error': 'Идея не найдена'})

    voted = False
    if user_id:
        cur.execute(f"""
            SELECT 1 FROM {SCHEMA}.idea_votes
            WHERE idea_id::text = {escape_string(idea_id)}
              AND user_id::text = {escape_string(str(user_id))}
            LIMIT 1
        """)
        voted = cur.fetchone() is not None

    cur.execute(f"""
        SELECT c.id, c.text, c.is_admin, c.parent_comment_id, c.created_at,
               u.name AS author_name
        FROM {SCHEMA}.idea_comments c
        LEFT JOIN {SCHEMA}.users u ON u.id = c.user_id
        WHERE c.idea_id::text = {escape_string(idea_id)}
        ORDER BY c.created_at ASC
        LIMIT 500
    """)
    comments = [
        {
            'id': str(c['id']),
            'text': c['text'],
            'is_admin': c['is_admin'],
            'parent_comment_id': str(c['parent_comment_id']) if c['parent_comment_id'] else None,
            'author': {'name': c['author_name'] or 'Пользователь'},
            'created_at': c['created_at'],
        }
        for c in cur.fetchall()
    ]
    cur.close()
    conn.close()

    return response(200, {'idea': serialize_idea(dict(row), user_voted=voted), 'comments': comments})


def create_idea(user, body):
    title = (body.get('title') or '').strip()
    description = (body.get('description') or '').strip()
    category = (body.get('category') or '').strip()

    if len(title) < 10:
        return response(400, {'error': 'Заголовок минимум 10 символов'})
    if len(description) < 20:
        return response(400, {'error': 'Описание минимум 20 символов'})
    if category not in IDEA_CAT_MAP:
        return response(400, {'error': 'Некорректная категория'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.user_ideas (user_id, title, description, category, status)
        VALUES (
            {escape_string(str(user['user_id']))}::uuid,
            {escape_string(title)},
            {escape_string(description)},
            {escape_string(category)},
            'new'
        )
        RETURNING id
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return response(200, {'success': True, 'id': str(row['id']), 'message': 'Спасибо за вашу идею!'})


def vote_idea(user, body):
    idea_id = body.get('idea_id')
    if not idea_id:
        return response(400, {'error': 'idea_id обязателен'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"""
        SELECT id FROM {SCHEMA}.idea_votes
        WHERE idea_id::text = {escape_string(str(idea_id))}
          AND user_id::text = {escape_string(str(user['user_id']))}
        LIMIT 1
    """)
    existing = cur.fetchone()

    if existing:
        cur.execute(f"""
            DELETE FROM {SCHEMA}.idea_votes
            WHERE id = {escape_string(str(existing['id']))}::uuid
        """)
        cur.execute(f"""
            UPDATE {SCHEMA}.user_ideas
            SET votes_count = GREATEST(COALESCE(votes_count,0) - 1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE id::text = {escape_string(str(idea_id))}
            RETURNING votes_count
        """)
        res = cur.fetchone()
        voted = False
    else:
        cur.execute(f"""
            INSERT INTO {SCHEMA}.idea_votes (idea_id, user_id)
            VALUES (
                {escape_string(str(idea_id))}::uuid,
                {escape_string(str(user['user_id']))}::uuid
            )
        """)
        cur.execute(f"""
            UPDATE {SCHEMA}.user_ideas
            SET votes_count = COALESCE(votes_count,0) + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id::text = {escape_string(str(idea_id))}
            RETURNING votes_count
        """)
        res = cur.fetchone()
        voted = True

    cur.close()
    conn.close()
    return response(200, {'success': True, 'voted': voted, 'votes_count': res['votes_count'] if res else 0})


def add_idea_comment(user, body):
    idea_id = body.get('idea_id')
    text = (body.get('text') or '').strip()
    parent_id = body.get('parent_comment_id')

    if not idea_id:
        return response(400, {'error': 'idea_id обязателен'})
    if len(text) < 5:
        return response(400, {'error': 'Комментарий минимум 5 символов'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    parent_sql = f"{escape_string(str(parent_id))}::uuid" if parent_id else 'NULL'
    cur.execute(f"""
        INSERT INTO {SCHEMA}.idea_comments (idea_id, user_id, parent_comment_id, text)
        VALUES (
            {escape_string(str(idea_id))}::uuid,
            {escape_string(str(user['user_id']))}::uuid,
            {parent_sql},
            {escape_string(text)}
        )
        RETURNING id
    """)
    row = cur.fetchone()
    cur.execute(f"""
        UPDATE {SCHEMA}.user_ideas
        SET comments_count = COALESCE(comments_count,0) + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id::text = {escape_string(str(idea_id))}
    """)
    cur.close()
    conn.close()
    return response(200, {'success': True, 'id': str(row['id'])})


def get_feedback(event):
    params = event.get('queryStringParameters') or {}
    feedback_type = params.get('type', 'review')
    all_statuses = params.get('all_statuses', 'false') == 'true'

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if all_statuses and is_admin(event):
        cur.execute(f"""
            SELECT id, type, user_name, user_email, title, description, rating, status, created_at, user_id
            FROM {SCHEMA}.feedback
            WHERE type = {escape_string(feedback_type)}
            ORDER BY created_at DESC
        """)
    else:
        cur.execute(f"""
            SELECT id, user_name, title, description, rating, created_at
            FROM {SCHEMA}.feedback
            WHERE type = {escape_string(feedback_type)} AND status = 'new'
            ORDER BY created_at DESC
        """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return response(200, {'items': [dict(r) for r in rows]})


def create_feedback(event):
    body = json.loads(event.get('body', '{}'))

    required = ['title', 'description']
    for field in required:
        if not body.get(field):
            return response(400, {'error': f'Поле {field} обязательно'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.feedback (type, user_name, user_email, title, description, rating, user_id)
        VALUES (
            {escape_string(body.get('type', 'review'))},
            {escape_string(body.get('user_name', 'Гость'))},
            {escape_string(body.get('user_email', ''))},
            {escape_string(body.get('title'))},
            {escape_string(body.get('description'))},
            {escape_string(body.get('rating', 5))},
            {escape_string(body.get('user_id', 'guest'))}
        )
        RETURNING id, user_name, title, description, rating, created_at
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    notify_support(
        feedback_type=body.get('type', 'review'),
        user_name=body.get('user_name', 'Гость'),
        user_email=body.get('user_email', ''),
        title=body.get('title', ''),
        description=body.get('description', ''),
        feedback_id=str(row['id'])
    )

    return response(201, dict(row))


def update_feedback(event):
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})

    body = json.loads(event.get('body', '{}'))
    feedback_id = body.get('id')
    new_status = body.get('status')

    if not feedback_id or not new_status:
        return response(400, {'error': 'Укажите id и status'})

    if new_status not in ('new', 'in_progress', 'resolved'):
        return response(400, {'error': 'Некорректный статус'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.feedback
        SET status = {escape_string(new_status)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = {int(feedback_id)}
        RETURNING id, status
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return response(404, {'error': 'Отзыв не найден'})

    return response(200, dict(row))


def delete_feedback(event):
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})

    params = event.get('queryStringParameters') or {}
    feedback_id = params.get('id')

    if not feedback_id:
        return response(400, {'error': 'Укажите id'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        UPDATE {SCHEMA}.feedback
        SET status = 'resolved', updated_at = CURRENT_TIMESTAMP
        WHERE id = {int(feedback_id)}
        RETURNING id
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return response(404, {'error': 'Отзыв не найден'})

    return response(200, {'success': True})


def get_ticket(event):
    """Получить одну карточку обращения с историей сообщений"""
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})
    params = event.get('queryStringParameters') or {}
    feedback_id = params.get('id')
    if not feedback_id:
        return response(400, {'error': 'Укажите id'})
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT f.id, f.type, f.user_name, f.user_email, f.title, f.description,
               f.rating, f.status, f.priority, f.source,
               f.ai_summary, f.ai_draft, f.ai_category, f.ai_priority,
               f.created_at, f.updated_at, f.user_id, f.family_id
        FROM {SCHEMA}.feedback f
        WHERE f.id = {int(feedback_id)}
    """)
    ticket = cur.fetchone()
    if not ticket:
        cur.close()
        conn.close()
        return response(404, {'error': 'Не найдено'})

    # История сообщений
    cur.execute(f"""
        SELECT id, message_type, body, author, created_at
        FROM {SCHEMA}.feedback_messages
        WHERE feedback_id = {int(feedback_id)}
        ORDER BY created_at ASC
    """)
    messages = [dict(r) for r in cur.fetchall()]

    # Контекст пользователя
    user_context = {}
    if ticket.get('user_id') and ticket['user_id'] != 'guest':
        cur.execute(f"""
            SELECT u.email, u.phone, fm.role, fm.access_role, f.name as family_name,
                   (SELECT COUNT(*) FROM {SCHEMA}.feedback fb WHERE fb.user_id = u.id::text) as total_tickets
            FROM {SCHEMA}.users u
            LEFT JOIN {SCHEMA}.family_members fm ON fm.user_id = u.id
            LEFT JOIN {SCHEMA}.families f ON f.id = fm.family_id
            WHERE u.id::text = {escape_string(str(ticket['user_id']))}
            LIMIT 1
        """)
        u = cur.fetchone()
        if u:
            user_context = dict(u)

    cur.close()
    conn.close()
    return response(200, {'ticket': dict(ticket), 'messages': messages, 'user_context': user_context})


def add_note(event):
    """Добавить внутреннюю заметку к обращению"""
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})
    body = json.loads(event.get('body', '{}'))
    feedback_id = body.get('id')
    note_text = body.get('note', '').strip()
    if not feedback_id or not note_text:
        return response(400, {'error': 'Укажите id и note'})
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        INSERT INTO {SCHEMA}.feedback_messages (feedback_id, message_type, body, author)
        VALUES ({int(feedback_id)}, 'note', {escape_string(note_text)}, 'admin')
        RETURNING id, message_type, body, author, created_at
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()
    return response(201, dict(row))


def ai_analyze(event):
    """AI-анализ обращения: резюме, категория, приоритет, черновик ответа"""
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})
    body = json.loads(event.get('body', '{}'))
    feedback_id = body.get('id')
    if not feedback_id:
        return response(400, {'error': 'Укажите id'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT id, type, user_name, title, description, status, created_at
        FROM {SCHEMA}.feedback WHERE id = {int(feedback_id)}
    """)
    ticket = cur.fetchone()
    if not ticket:
        cur.close()
        conn.close()
        return response(404, {'error': 'Не найдено'})

    api_key = os.environ.get('YANDEX_GPT_API_KEY', '')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', '')
    if not api_key or not folder_id:
        cur.close()
        conn.close()
        return response(500, {'error': 'AI не настроен'})

    type_labels = {'support': 'техподдержка', 'review': 'отзыв', 'suggestion': 'предложение'}
    type_label = type_labels.get(ticket.get('type', ''), 'обращение')

    prompt = f"""Ты — помощник оператора службы поддержки приложения «Наша Семья» (семейный органайзер).

Обращение пользователя:
Тип: {type_label}
Имя: {ticket['user_name']}
Тема: {ticket['title']}
Текст: {ticket['description']}

Выполни следующие задачи и верни JSON строго в формате:
{{
  "summary": "краткое резюме в 1-2 предложения, что хочет пользователь",
  "category": "одна из: auth | payment | bug | feature | content | account | family | other",
  "priority": "одна из: low | medium | high | critical",
  "priority_reason": "почему такой приоритет, 1 предложение",
  "draft_reply": "готовый вежливый ответ пользователю от имени поддержки Наша Семья, 3-5 предложений",
  "operator_hint": "внутренняя подсказка оператору: что проверить, что сделать, 2-3 пункта"
}}"""

    try:
        resp = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'},
            json={
                'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
                'completionOptions': {'stream': False, 'temperature': 0.3, 'maxTokens': 800},
                'messages': [{'role': 'user', 'text': prompt}]
            },
            timeout=20
        )
        raw = resp.json()
        text = raw.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        ai_result = json.loads(json_match.group()) if json_match else {}
    except Exception as e:
        print(f'[ERROR] AI analyze: {e}')
        ai_result = {}

    if ai_result:
        cur.execute(f"""
            UPDATE {SCHEMA}.feedback
            SET ai_summary = {escape_string(ai_result.get('summary', ''))},
                ai_draft = {escape_string(ai_result.get('draft_reply', ''))},
                ai_category = {escape_string(ai_result.get('category', ''))},
                ai_priority = {escape_string(ai_result.get('priority', ''))},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = {int(feedback_id)}
        """)
        cur.execute(f"""
            INSERT INTO {SCHEMA}.feedback_messages (feedback_id, message_type, body, author)
            VALUES ({int(feedback_id)}, 'ai_draft',
                {escape_string(json.dumps(ai_result, ensure_ascii=False))}, 'ai')
        """)

    cur.close()
    conn.close()
    return response(200, {'success': True, 'result': ai_result})


def reply_feedback(event):
    """Отправка email-ответа пользователю на обращение из админки"""
    if not is_admin(event):
        return response(403, {'error': 'Доступ запрещён'})

    body = json.loads(event.get('body', '{}'))
    feedback_id = body.get('id')
    reply_text = body.get('reply_text', '').strip()

    if not feedback_id or not reply_text:
        return response(400, {'error': 'Укажите id и reply_text'})

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"""
        SELECT id, user_name, user_email, title, type, user_id
        FROM {SCHEMA}.feedback
        WHERE id = {int(feedback_id)}
    """)
    ticket = cur.fetchone()

    if not ticket:
        cur.close()
        conn.close()
        return response(404, {'error': 'Обращение не найдено'})

    user_email = ticket.get('user_email') or ''

    # Если email не указан в форме — пробуем взять из профиля пользователя
    if not user_email and ticket.get('user_id') and ticket['user_id'] != 'guest':
        cur.execute(f"""
            SELECT email FROM {SCHEMA}.users
            WHERE id::text = {escape_string(str(ticket['user_id']))}
            LIMIT 1
        """)
        user_row = cur.fetchone()
        if user_row:
            user_email = user_row.get('email') or ''

    if not user_email:
        cur.close()
        conn.close()
        return response(400, {'error': 'У пользователя нет email для ответа'})

    # Сохраняем ответ и меняем статус на resolved
    cur.execute(f"""
        UPDATE {SCHEMA}.feedback
        SET status = 'resolved', updated_at = CURRENT_TIMESTAMP
        WHERE id = {int(feedback_id)}
    """)
    cur.close()
    conn.close()

    # Отправляем письмо пользователю
    smtp_login = os.environ.get('YANDEX_SMTP_LOGIN', '')
    smtp_password = os.environ.get('YANDEX_SMTP_PASSWORD', '')

    if not smtp_login or not smtp_password:
        return response(500, {'error': 'SMTP не настроен'})

    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    type_labels = {'support': 'Техподдержка', 'review': 'Отзыв', 'suggestion': 'Предложение'}
    type_label = type_labels.get(ticket.get('type', ''), 'Обращение')

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Ответ на ваше обращение</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Наша Семья — служба поддержки</p>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <p style="color: #555; margin-bottom: 8px;">Здравствуйте, <strong>{ticket['user_name']}</strong>!</p>
        <p style="color: #555;">Мы получили ваше обращение <em>«{ticket['title']}»</em> и подготовили ответ:</p>
        <div style="background: white; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
          <p style="margin: 0; color: #333; white-space: pre-wrap;">{reply_text}</p>
        </div>
        <p style="color: #888; font-size: 13px;">Если у вас остались вопросы, напишите нам снова через форму на сайте или на <a href="mailto:support@nasha-semiya.ru" style="color: #4f46e5;">support@nasha-semiya.ru</a></p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
        С уважением, команда Наша Семья · nasha-semiya.ru
      </div>
    </div>
    """

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Re: {ticket["title"]} — Наша Семья'
        msg['From'] = f'Поддержка Наша Семья <{smtp_login}>'
        msg['To'] = user_email
        msg.attach(MIMEText(reply_text, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
            server.login(smtp_login, smtp_password)
            server.sendmail(smtp_login, user_email, msg.as_string())

        return response(200, {'success': True, 'sent_to': user_email})
    except Exception as e:
        print(f'[ERROR] reply email: {e}')
        return response(500, {'error': f'Ошибка отправки: {str(e)}'})