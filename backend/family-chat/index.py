"""API семейного чата: общий чат + тет-а-тет, опрос новых сообщений, реакции, уведомления в колокольчик и MAX-бот"""

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

SCHEMA = 't_p5815085_family_assistant_pro'
MESSAGES_TABLE = 'family_chat_messages'
MAX_API_BASE = 'https://platform-api.max.ru'


def send_max_message(chat_id: int, text: str) -> bool:
    """Отправить сообщение пользователю в MAX от имени бота"""
    token = os.environ.get('MAX_BOT_TOKEN')
    if not token or not chat_id:
        return False
    try:
        resp = requests.post(
            f'{MAX_API_BASE}/messages?access_token={token}&chat_id={int(chat_id)}',
            headers={'Content-Type': 'application/json'},
            json={'text': text},
            timeout=5,
        )
        return resp.status_code == 200
    except Exception as e:
        print(f"[max-bot] send error: {e}")
        return False


def escape(value: Any) -> str:
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")


def cors_headers() -> dict:
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
    }


def resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': cors_headers(),
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def get_user_context(cur, token: str) -> Optional[dict]:
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = '{escape(token)}' AND expires_at > NOW()"
    )
    session = cur.fetchone()
    if not session:
        return None
    user_id = str(session['user_id'])
    cur.execute(
        f"SELECT id, family_id, name, photo_url, avatar FROM {SCHEMA}.family_members "
        f"WHERE user_id = '{escape(user_id)}' LIMIT 1"
    )
    member = cur.fetchone()
    if not member or not member['family_id']:
        return None
    return {
        'user_id': user_id,
        'family_id': str(member['family_id']),
        'member_id': str(member['id']),
        'member_name': member['name'],
        'member_photo': member['photo_url'],
        'member_avatar': member['avatar'],
    }


def ensure_family_chat(cur, family_id: str) -> str:
    cur.execute(
        f"SELECT id FROM {SCHEMA}.chat_conversations "
        f"WHERE family_id = '{escape(family_id)}' AND kind = 'family' LIMIT 1"
    )
    row = cur.fetchone()
    if row:
        return str(row['id'])
    cur.execute(
        f"INSERT INTO {SCHEMA}.chat_conversations(family_id, kind) "
        f"VALUES ('{escape(family_id)}', 'family') RETURNING id"
    )
    return str(cur.fetchone()['id'])


def ensure_dm_chat(cur, family_id: str, me_id: str, other_id: str) -> str:
    a, b = sorted([me_id, other_id])
    cur.execute(
        f"SELECT id FROM {SCHEMA}.chat_conversations "
        f"WHERE family_id = '{escape(family_id)}' AND kind = 'dm' "
        f"AND member_a_id = '{escape(a)}' AND member_b_id = '{escape(b)}' LIMIT 1"
    )
    row = cur.fetchone()
    if row:
        return str(row['id'])
    cur.execute(
        f"INSERT INTO {SCHEMA}.chat_conversations(family_id, kind, member_a_id, member_b_id) "
        f"VALUES ('{escape(family_id)}', 'dm', '{escape(a)}', '{escape(b)}') RETURNING id"
    )
    return str(cur.fetchone()['id'])


def check_access(cur, conversation_id: str, family_id: str, member_id: str) -> Optional[dict]:
    cur.execute(
        f"SELECT id, family_id, kind, member_a_id, member_b_id "
        f"FROM {SCHEMA}.chat_conversations WHERE id = '{escape(conversation_id)}' LIMIT 1"
    )
    conv = cur.fetchone()
    if not conv:
        return None
    if str(conv['family_id']) != family_id:
        return None
    if conv['kind'] == 'dm':
        a = str(conv['member_a_id']) if conv['member_a_id'] else ''
        b = str(conv['member_b_id']) if conv['member_b_id'] else ''
        if member_id not in (a, b):
            return None
    return dict(conv)


def get_recipients(cur, conv: dict, sender_id: str, family_id: str) -> list:
    """Список member_id, кому слать уведомление (без отправителя)"""
    if conv['kind'] == 'family':
        cur.execute(
            f"SELECT id FROM {SCHEMA}.family_members "
            f"WHERE family_id = '{escape(family_id)}' AND id != '{escape(sender_id)}'"
        )
        return [str(r['id']) for r in cur.fetchall()]
    a = str(conv['member_a_id']) if conv['member_a_id'] else ''
    b = str(conv['member_b_id']) if conv['member_b_id'] else ''
    return [m for m in (a, b) if m and m != sender_id]


def create_chat_notifications(cur, recipient_member_ids: list, sender_name: str, content: str, conv_kind: str):
    """Создаёт уведомления в колокольчике + отправляет в MAX-бот, у кого привязан"""
    if not recipient_member_ids:
        return
    preview = content[:160] + ('…' if len(content) > 160 else '')
    short_preview = content[:80] + ('…' if len(content) > 80 else '')
    title = f'Сообщение от {sender_name}'
    if conv_kind == 'family':
        title = f'{sender_name} в чате семьи'

    max_targets = []  # (max_chat_id, text)

    for mid in recipient_member_ids:
        cur.execute(
            f"SELECT fm.user_id, u.max_chat_id "
            f"FROM {SCHEMA}.family_members fm "
            f"LEFT JOIN {SCHEMA}.users u ON u.id = fm.user_id "
            f"WHERE fm.id = '{escape(mid)}' LIMIT 1"
        )
        row = cur.fetchone()
        if not row or not row['user_id']:
            continue
        target_user_id = str(row['user_id'])

        # Уведомление в колокольчик
        cur.execute(
            f"INSERT INTO {SCHEMA}.notifications(user_id, type, title, message, target_url, channel, status) "
            f"VALUES ('{escape(target_user_id)}', 'chat', '{escape(title)}', '{escape(short_preview)}', '/family-chat', 'push', 'sent')"
        )

        # Если у пользователя привязан MAX — добавим в очередь отправки
        max_chat_id = row.get('max_chat_id')
        if max_chat_id:
            text = f"💬 {title}\n\n{preview}\n\nОткрыть чат: https://nasha-semiya.ru/family-chat"
            max_targets.append((int(max_chat_id), text))

    # Отправляем в MAX после коммита БД-операций (вне цикла INSERT, чтобы не блокировать транзакцию долгими HTTP)
    return max_targets


def serialize_message(row: dict) -> dict:
    reactions = row.get('reactions') or {}
    if isinstance(reactions, str):
        try:
            reactions = json.loads(reactions)
        except Exception:
            reactions = {}
    return {
        'id': str(row['id']),
        'conversation_id': str(row['conversation_id']),
        'sender_member_id': str(row['sender_member_id']),
        'sender_name': row.get('sender_name'),
        'sender_photo': row.get('sender_photo'),
        'sender_avatar': row.get('sender_avatar'),
        'content': row['content'],
        'reactions': reactions,
        'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Семейный чат: список диалогов, сообщения, отправка, реакции, прочтения"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': '', 'isBase64Encoded': False}

    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return resp(401, {'error': 'Требуется авторизация'})

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return resp(500, {'error': 'DB not configured'})

    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        ctx = get_user_context(cur, token)
        if not ctx:
            return resp(401, {'error': 'Недействительная сессия или нет семьи'})

        family_id = ctx['family_id']
        me_id = ctx['member_id']

        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'list')

            if action == 'list':
                # Список чатов: общий + тет-а-тет с каждым членом семьи
                family_chat_id = ensure_family_chat(cur, family_id)
                conn.commit()

                cur.execute(
                    f"SELECT id, name, role, photo_url, avatar FROM {SCHEMA}.family_members "
                    f"WHERE family_id = '{escape(family_id)}' ORDER BY created_at"
                )
                members = cur.fetchall()

                chats = [{
                    'id': family_chat_id,
                    'kind': 'family',
                    'title': 'Чат семьи',
                    'subtitle': 'Общий чат',
                    'member_id': None,
                    'photo_url': None,
                    'avatar': None,
                }]

                for m in members:
                    if str(m['id']) == me_id:
                        continue
                    dm_id = ensure_dm_chat(cur, family_id, me_id, str(m['id']))
                    chats.append({
                        'id': dm_id,
                        'kind': 'dm',
                        'title': m['name'],
                        'subtitle': m.get('role') or 'Член семьи',
                        'member_id': str(m['id']),
                        'photo_url': m.get('photo_url'),
                        'avatar': m.get('avatar'),
                    })
                conn.commit()

                # Подсчёт непрочитанных по каждому чату
                for chat in chats:
                    cur.execute(
                        f"SELECT last_read_at FROM {SCHEMA}.chat_reads "
                        f"WHERE conversation_id = '{escape(chat['id'])}' AND member_id = '{escape(me_id)}'"
                    )
                    r = cur.fetchone()
                    if r:
                        cur.execute(
                            f"SELECT COUNT(*) AS c FROM {SCHEMA}.{MESSAGES_TABLE} "
                            f"WHERE conversation_id = '{escape(chat['id'])}' "
                            f"AND created_at > '{escape(r['last_read_at'])}' "
                            f"AND sender_member_id != '{escape(me_id)}'"
                        )
                    else:
                        cur.execute(
                            f"SELECT COUNT(*) AS c FROM {SCHEMA}.{MESSAGES_TABLE} "
                            f"WHERE conversation_id = '{escape(chat['id'])}' "
                            f"AND sender_member_id != '{escape(me_id)}'"
                        )
                    chat['unread'] = cur.fetchone()['c']

                return resp(200, {
                    'success': True,
                    'me': {
                        'member_id': me_id,
                        'name': ctx['member_name'],
                        'photo_url': ctx['member_photo'],
                        'avatar': ctx['member_avatar'],
                    },
                    'chats': chats,
                })

            if action == 'messages':
                conv_id = params.get('conversation_id')
                if not conv_id:
                    return resp(400, {'error': 'conversation_id required'})
                conv = check_access(cur, conv_id, family_id, me_id)
                if not conv:
                    return resp(403, {'error': 'Нет доступа к чату'})

                after = params.get('after')  # ISO timestamp для polling
                limit = min(int(params.get('limit', '200')), 500)

                where_extra = ''
                if after:
                    where_extra = f"AND m.created_at > '{escape(after)}'"

                cur.execute(
                    f"SELECT m.id, m.conversation_id, m.sender_member_id, m.content, m.reactions, m.created_at, "
                    f"fm.name AS sender_name, fm.photo_url AS sender_photo, fm.avatar AS sender_avatar "
                    f"FROM {SCHEMA}.{MESSAGES_TABLE} m "
                    f"LEFT JOIN {SCHEMA}.family_members fm ON fm.id = m.sender_member_id "
                    f"WHERE m.conversation_id = '{escape(conv_id)}' {where_extra} "
                    f"ORDER BY m.created_at ASC LIMIT {limit}"
                )
                rows = cur.fetchall()
                messages = [serialize_message(dict(r)) for r in rows]

                return resp(200, {'success': True, 'messages': messages})

            return resp(400, {'error': 'Unknown action'})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            action = body.get('action', 'send')

            if action == 'send':
                conv_id = body.get('conversation_id')
                content = (body.get('content') or '').strip()
                if not conv_id or not content:
                    return resp(400, {'error': 'conversation_id и content обязательны'})
                if len(content) > 4000:
                    return resp(400, {'error': 'Слишком длинное сообщение'})

                conv = check_access(cur, conv_id, family_id, me_id)
                if not conv:
                    return resp(403, {'error': 'Нет доступа'})

                cur.execute(
                    f"INSERT INTO {SCHEMA}.{MESSAGES_TABLE}(conversation_id, sender_member_id, content) "
                    f"VALUES ('{escape(conv_id)}', '{escape(me_id)}', '{escape(content)}') "
                    f"RETURNING id, conversation_id, sender_member_id, content, reactions, created_at"
                )
                msg_row = cur.fetchone()

                cur.execute(
                    f"UPDATE {SCHEMA}.chat_conversations SET updated_at = NOW() "
                    f"WHERE id = '{escape(conv_id)}'"
                )

                # Авто-прочтение для отправителя
                cur.execute(
                    f"INSERT INTO {SCHEMA}.chat_reads(conversation_id, member_id, last_read_at) "
                    f"VALUES ('{escape(conv_id)}', '{escape(me_id)}', NOW()) "
                    f"ON CONFLICT (conversation_id, member_id) DO UPDATE SET last_read_at = NOW()"
                )

                # Уведомления в колокольчик + сбор целей для MAX
                recipients = get_recipients(cur, conv, me_id, family_id)
                max_targets = create_chat_notifications(cur, recipients, ctx['member_name'], content, conv['kind']) or []

                conn.commit()

                # Отправка в MAX-бот после коммита БД (best-effort)
                for max_chat_id, max_text in max_targets:
                    try:
                        send_max_message(max_chat_id, max_text)
                    except Exception as e:
                        print(f"[max-bot] notify failed: {e}")

                msg_dict = dict(msg_row)
                msg_dict['sender_name'] = ctx['member_name']
                msg_dict['sender_photo'] = ctx['member_photo']
                msg_dict['sender_avatar'] = ctx['member_avatar']

                return resp(200, {'success': True, 'message': serialize_message(msg_dict)})

            if action == 'react':
                conv_id = body.get('conversation_id')
                msg_id = body.get('message_id')
                emoji = body.get('emoji')
                if not conv_id or not msg_id or not emoji:
                    return resp(400, {'error': 'conversation_id, message_id, emoji обязательны'})
                conv = check_access(cur, conv_id, family_id, me_id)
                if not conv:
                    return resp(403, {'error': 'Нет доступа'})

                cur.execute(
                    f"SELECT reactions FROM {SCHEMA}.{MESSAGES_TABLE} "
                    f"WHERE id = '{escape(msg_id)}' AND conversation_id = '{escape(conv_id)}'"
                )
                row = cur.fetchone()
                if not row:
                    return resp(404, {'error': 'Сообщение не найдено'})
                reactions = row['reactions'] or {}
                if isinstance(reactions, str):
                    try:
                        reactions = json.loads(reactions)
                    except Exception:
                        reactions = {}
                reactions[emoji] = int(reactions.get(emoji, 0)) + 1

                cur.execute(
                    f"UPDATE {SCHEMA}.{MESSAGES_TABLE} SET reactions = '{escape(json.dumps(reactions))}'::jsonb "
                    f"WHERE id = '{escape(msg_id)}'"
                )
                conn.commit()
                return resp(200, {'success': True, 'reactions': reactions})

            if action == 'mark_read':
                conv_id = body.get('conversation_id')
                if not conv_id:
                    return resp(400, {'error': 'conversation_id required'})
                conv = check_access(cur, conv_id, family_id, me_id)
                if not conv:
                    return resp(403, {'error': 'Нет доступа'})
                cur.execute(
                    f"INSERT INTO {SCHEMA}.chat_reads(conversation_id, member_id, last_read_at) "
                    f"VALUES ('{escape(conv_id)}', '{escape(me_id)}', NOW()) "
                    f"ON CONFLICT (conversation_id, member_id) DO UPDATE SET last_read_at = NOW()"
                )
                conn.commit()
                return resp(200, {'success': True})

            return resp(400, {'error': 'Unknown action'})

        return resp(405, {'error': 'Method not allowed'})

    except Exception as e:
        conn.rollback()
        return resp(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()