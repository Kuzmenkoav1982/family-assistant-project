import json
import os
from datetime import datetime, date
import psycopg2


def handler(event: dict, context) -> dict:
    """
    Альбом поколений — управление семейной памятью.

    Ресурсы:
    - entries : карточки памяти (CRUD)
    - albums  : ручные тематические альбомы (CRUD)
    - assets  : фото внутри карточки (add / reorder / remove)
    - persons : привязка людей из древа к карточке (replace set)
    - album-links : положить / убрать карточку из альбома

    GET    /?resource=entries[&id=<uuid>|&event_id=<uuid>|&member_id=<int>|&album_id=<uuid>]
    POST   /?resource=entries           body: {title, caption?, story?, memory_date?, ..., member_ids?:[...]}
    PUT    /?resource=entries&id=<uuid> body: поля для обновления
    POST   /?resource=entries/archive&id=<uuid>   (soft archive)

    GET    /?resource=albums[&id=<uuid>]
    POST   /?resource=albums            body: {title, description?, cover_asset_id?}
    PUT    /?resource=albums&id=<uuid>
    POST   /?resource=albums/archive&id=<uuid>

    POST   /?resource=assets&entry_id=<uuid>  body: {file_url, sort_order?, width?, height?, mime_type?}
    PUT    /?resource=assets&id=<uuid>        body: {sort_order?}
    POST   /?resource=assets/remove&id=<uuid>

    POST   /?resource=persons&entry_id=<uuid>  body: {member_ids:[...]}  — полная замена набора
    POST   /?resource=album-links              body: {album_id, memory_entry_id, sort_order?}
    POST   /?resource=album-links/remove       body: {album_id, memory_entry_id}
    """
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': '', 'isBase64Encoded': False}

    headers = event.get('headers', {}) or {}
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    if not user_id:
        return _resp(401, {'error': 'User ID required'})

    qp = event.get('queryStringParameters') or {}
    resource = (qp.get('resource') or 'entries').lower()
    item_id = qp.get('id')
    body = _parse_body(event)

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    try:
        cur.execute('SELECT family_id FROM family_members WHERE id = %s', (user_id,))
        row = cur.fetchone()
        if not row:
            return _resp(404, {'error': 'Family not found'})
        family_id = row[0]

        if resource == 'entries':
            return _handle_entries(cur, conn, method, family_id, user_id, item_id, qp, body)
        if resource == 'entries/archive':
            return _archive_entry(cur, conn, family_id, item_id)
        if resource == 'entries/publish':
            return _publish_entry(cur, conn, family_id, item_id)
        if resource == 'entries/discard':
            return _discard_draft(cur, conn, family_id, item_id)

        if resource == 'albums':
            return _handle_albums(cur, conn, method, family_id, user_id, item_id, body)
        if resource == 'albums/archive':
            return _archive_album(cur, conn, family_id, item_id)

        if resource == 'assets':
            return _handle_assets(cur, conn, method, family_id, item_id, qp, body)
        if resource == 'assets/remove':
            return _remove_asset(cur, conn, family_id, item_id)

        if resource == 'persons':
            return _set_persons(cur, conn, family_id, qp.get('entry_id'), body)
        if resource == 'persons/add':
            return _add_person_link(cur, conn, family_id, body)

        if resource == 'album-links':
            return _add_album_link(cur, conn, family_id, body)
        if resource == 'album-links/remove':
            return _remove_album_link(cur, conn, family_id, body)
        if resource == 'album-links/set':
            return _set_album_links(cur, conn, family_id, body)

        return _resp(400, {'error': f'Unknown resource: {resource}'})
    except Exception as exc:
        conn.rollback()
        return _resp(500, {'error': str(exc)})
    finally:
        cur.close()
        conn.close()


# ============================================================
# ENTRIES
# ============================================================

def _handle_entries(cur, conn, method, family_id, user_id, item_id, qp, body):
    if method == 'GET':
        include_drafts = qp.get('include_drafts') in ('1', 'true', 'yes')
        if item_id:
            entry = _entry_full(cur, family_id, item_id, include_drafts=True)
            if not entry:
                return _resp(404, {'error': 'not found'})
            return _resp(200, entry)
        return _resp(
            200,
            {
                'entries': _list_entries(
                    cur,
                    family_id,
                    event_id=qp.get('event_id'),
                    member_id=qp.get('member_id'),
                    album_id=qp.get('album_id'),
                    q=qp.get('q'),
                    year=qp.get('year'),
                    sort=qp.get('sort'),
                    include_drafts=include_drafts,
                ),
            },
        )

    if method == 'POST':
        title = (body.get('title') or '').strip()
        # Новый flow: статус по умолчанию draft (UI сам публикует через entries/publish при сохранении).
        # Если явно указан status — используем его (для одношагового create+publish).
        status = (body.get('status') or 'draft').strip()
        if status not in ('draft', 'published'):
            return _resp(400, {'error': 'invalid status'})
        if not title:
            # для черновика разрешаем пустой/служебный title, но всё равно нужен какой-то текст
            title = 'Черновик'
        cur.execute(
            '''INSERT INTO memory_entries
               (family_id, title, caption, story, memory_date, memory_period_label,
                location_label, event_id, created_by, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING id''',
            (family_id, title, body.get('caption'), body.get('story'),
             body.get('memory_date') or None, body.get('memory_period_label'),
             body.get('location_label'), body.get('event_id') or None, user_id, status),
        )
        new_id = cur.fetchone()[0]
        for mid in (body.get('member_ids') or []):
            cur.execute(
                'INSERT INTO memory_person_links (memory_entry_id, member_id) VALUES (%s, %s) ON CONFLICT DO NOTHING',
                (new_id, int(mid)),
            )
        conn.commit()
        return _resp(200, _entry_full(cur, family_id, str(new_id), include_drafts=True))

    if method == 'PUT':
        if not item_id:
            return _resp(400, {'error': 'id required'})
        fields = []
        values = []
        for col in ('title', 'caption', 'story', 'memory_date', 'memory_period_label',
                    'location_label', 'event_id', 'cover_asset_id'):
            if col in body:
                fields.append(f'{col} = %s')
                values.append(body[col] or None if col in ('memory_date', 'event_id', 'cover_asset_id') else body[col])
        if not fields and 'member_ids' not in body:
            return _resp(400, {'error': 'no fields to update'})
        if fields:
            fields.append('updated_at = CURRENT_TIMESTAMP')
            values.extend([item_id, family_id])
            cur.execute(
                f"UPDATE memory_entries SET {', '.join(fields)} WHERE id = %s AND family_id = %s",
                values,
            )
        if 'member_ids' in body:
            cur.execute('DELETE FROM memory_person_links WHERE memory_entry_id = %s', (item_id,))
            for mid in (body.get('member_ids') or []):
                cur.execute(
                    'INSERT INTO memory_person_links (memory_entry_id, member_id) VALUES (%s, %s) ON CONFLICT DO NOTHING',
                    (item_id, int(mid)),
                )
        conn.commit()
        return _resp(200, _entry_full(cur, family_id, item_id, include_drafts=True))

    return _resp(405, {'error': 'method not allowed'})


SORT_WHITELIST = {
    'memory_date_desc': 'ORDER BY COALESCE(e.memory_date, e.created_at::date) DESC, e.created_at DESC',
    'memory_date_asc':  'ORDER BY COALESCE(e.memory_date, e.created_at::date) ASC, e.created_at ASC',
    'created_at_desc':  'ORDER BY e.created_at DESC',
    'created_at_asc':   'ORDER BY e.created_at ASC',
}


def _list_entries(
    cur, family_id,
    event_id=None, member_id=None, album_id=None,
    q=None, year=None, sort=None,
    include_drafts=False,
):
    sql = '''SELECT e.id, e.title, e.caption, e.story, e.memory_date, e.memory_period_label,
                    e.location_label, e.event_id, e.cover_asset_id, e.created_at, e.updated_at,
                    e.status
             FROM memory_entries e'''
    where = ['e.family_id = %s', 'e.archived_at IS NULL']
    params = [family_id]
    if not include_drafts:
        where.append("e.status = 'published'")
    if event_id:
        where.append('e.event_id = %s')
        params.append(event_id)
    if member_id:
        sql += ' JOIN memory_person_links pl ON pl.memory_entry_id = e.id'
        where.append('pl.member_id = %s')
        params.append(int(member_id))
    if album_id:
        sql += ' JOIN memory_album_links al ON al.memory_entry_id = e.id'
        where.append('al.album_id = %s')
        params.append(album_id)
    if q:
        q_trimmed = str(q).strip()
        if q_trimmed:
            pattern = f'%{q_trimmed}%'
            where.append(
                "(e.title ILIKE %s OR e.caption ILIKE %s OR e.story ILIKE %s "
                "OR e.location_label ILIKE %s OR e.memory_period_label ILIKE %s)"
            )
            params.extend([pattern, pattern, pattern, pattern, pattern])
    if year:
        try:
            year_int = int(year)
            where.append(
                "(EXTRACT(YEAR FROM e.memory_date)::int = %s "
                "OR (e.memory_date IS NULL AND e.memory_period_label ILIKE %s))"
            )
            params.append(year_int)
            params.append(f'%{year_int}%')
        except (TypeError, ValueError):
            pass
    order_by = SORT_WHITELIST.get((sort or 'memory_date_desc').strip(), SORT_WHITELIST['memory_date_desc'])
    sql += ' WHERE ' + ' AND '.join(where) + ' ' + order_by
    cur.execute(sql, params)
    rows = cur.fetchall()
    return [_row_to_entry(cur, r) for r in rows]


def _row_to_entry(cur, r):
    return {
        'id': str(r[0]),
        'title': r[1],
        'caption': r[2],
        'story': r[3],
        'memory_date': r[4].isoformat() if r[4] else None,
        'memory_period_label': r[5],
        'location_label': r[6],
        'event_id': str(r[7]) if r[7] else None,
        'cover_asset_id': str(r[8]) if r[8] else None,
        'created_at': r[9].isoformat() if r[9] else None,
        'updated_at': r[10].isoformat() if r[10] else None,
        'status': r[11] if len(r) > 11 else 'published',
        'assets': _assets_for(cur, r[0]),
        'member_ids': _member_ids_for(cur, r[0]),
        'album_ids': _album_ids_for(cur, r[0]),
    }


def _entry_full(cur, family_id, entry_id, include_drafts=False):
    sql = '''SELECT id, title, caption, story, memory_date, memory_period_label,
                    location_label, event_id, cover_asset_id, created_at, updated_at, status
             FROM memory_entries
             WHERE id = %s AND family_id = %s AND archived_at IS NULL'''
    if not include_drafts:
        sql += " AND status = 'published'"
    cur.execute(sql, (entry_id, family_id))
    r = cur.fetchone()
    if not r:
        return None
    return _row_to_entry(cur, r)


def _publish_entry(cur, conn, family_id, entry_id):
    if not entry_id:
        return _resp(400, {'error': 'id required'})
    cur.execute(
        '''UPDATE memory_entries
           SET status = 'published', updated_at = CURRENT_TIMESTAMP
           WHERE id = %s AND family_id = %s AND archived_at IS NULL''',
        (entry_id, family_id),
    )
    conn.commit()
    return _resp(200, _entry_full(cur, family_id, entry_id, include_drafts=True))


def _discard_draft(cur, conn, family_id, entry_id):
    """
    Безопасно гасит черновик: переводит status='archived' и проставляет archived_at.
    Сработает только если запись действительно draft (защита от случайного архива опубликованной).
    Каскадно убирает связи с альбомами и людьми, чтобы не висели орфаны.
    """
    if not entry_id:
        return _resp(400, {'error': 'id required'})
    cur.execute(
        '''UPDATE memory_entries
           SET status = 'archived', archived_at = CURRENT_TIMESTAMP
           WHERE id = %s AND family_id = %s AND status = 'draft' AND archived_at IS NULL''',
        (entry_id, family_id),
    )
    affected = cur.rowcount
    if affected > 0:
        cur.execute('DELETE FROM memory_album_links WHERE memory_entry_id = %s', (entry_id,))
        cur.execute('DELETE FROM memory_person_links WHERE memory_entry_id = %s', (entry_id,))
    conn.commit()
    return _resp(200, {'ok': True, 'discarded': bool(affected)})


def _assets_for(cur, entry_id):
    cur.execute(
        '''SELECT id, file_url, sort_order, width, height, mime_type
           FROM memory_assets WHERE memory_entry_id = %s ORDER BY sort_order, created_at''',
        (entry_id,),
    )
    return [
        {
            'id': str(a[0]),
            'file_url': a[1],
            'sort_order': a[2],
            'width': a[3],
            'height': a[4],
            'mime_type': a[5],
        }
        for a in cur.fetchall()
    ]


def _member_ids_for(cur, entry_id):
    cur.execute(
        'SELECT member_id FROM memory_person_links WHERE memory_entry_id = %s ORDER BY member_id',
        (entry_id,),
    )
    return [int(x[0]) for x in cur.fetchall()]


def _album_ids_for(cur, entry_id):
    cur.execute(
        '''SELECT al.album_id FROM memory_album_links al
           JOIN memory_albums a ON a.id = al.album_id
           WHERE al.memory_entry_id = %s AND a.archived_at IS NULL
           ORDER BY al.added_at''',
        (entry_id,),
    )
    return [str(x[0]) for x in cur.fetchall()]


def _archive_entry(cur, conn, family_id, entry_id):
    if not entry_id:
        return _resp(400, {'error': 'id required'})
    cur.execute(
        '''UPDATE memory_entries
           SET archived_at = CURRENT_TIMESTAMP, status = 'archived'
           WHERE id = %s AND family_id = %s''',
        (entry_id, family_id),
    )
    conn.commit()
    return _resp(200, {'ok': True})


# ============================================================
# ALBUMS
# ============================================================

def _handle_albums(cur, conn, method, family_id, user_id, item_id, body):
    if method == 'GET':
        if item_id:
            full = _album_full(cur, family_id, item_id)
            if not full:
                return _resp(404, {'error': 'not found'})
            return _resp(200, full)
        cur.execute(
            '''SELECT id, title, description, cover_asset_id, created_at, updated_at
               FROM memory_albums
               WHERE family_id = %s AND archived_at IS NULL
               ORDER BY updated_at DESC''',
            (family_id,),
        )
        albums = []
        for r in cur.fetchall():
            cur.execute(
                'SELECT COUNT(*) FROM memory_album_links WHERE album_id = %s',
                (r[0],),
            )
            count = cur.fetchone()[0]
            albums.append({
                'id': str(r[0]),
                'title': r[1],
                'description': r[2],
                'cover_asset_id': str(r[3]) if r[3] else None,
                'created_at': r[4].isoformat() if r[4] else None,
                'updated_at': r[5].isoformat() if r[5] else None,
                'entries_count': int(count),
            })
        return _resp(200, {'albums': albums})

    if method == 'POST':
        title = (body.get('title') or '').strip()
        if not title:
            return _resp(400, {'error': 'title required'})
        cur.execute(
            '''INSERT INTO memory_albums (family_id, title, description, cover_asset_id, created_by)
               VALUES (%s, %s, %s, %s, %s) RETURNING id''',
            (family_id, title, body.get('description'), body.get('cover_asset_id'), user_id),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return _resp(200, _album_full(cur, family_id, str(new_id)))

    if method == 'PUT':
        if not item_id:
            return _resp(400, {'error': 'id required'})
        fields = []
        values = []
        for col in ('title', 'description', 'cover_asset_id'):
            if col in body:
                fields.append(f'{col} = %s')
                values.append(body[col])
        if not fields:
            return _resp(400, {'error': 'no fields'})
        fields.append('updated_at = CURRENT_TIMESTAMP')
        values.extend([item_id, family_id])
        cur.execute(
            f"UPDATE memory_albums SET {', '.join(fields)} WHERE id = %s AND family_id = %s",
            values,
        )
        conn.commit()
        return _resp(200, _album_full(cur, family_id, item_id))

    return _resp(405, {'error': 'method not allowed'})


def _album_full(cur, family_id, album_id):
    cur.execute(
        '''SELECT id, title, description, cover_asset_id, created_at, updated_at
           FROM memory_albums WHERE id = %s AND family_id = %s AND archived_at IS NULL''',
        (album_id, family_id),
    )
    r = cur.fetchone()
    if not r:
        return None
    return {
        'id': str(r[0]),
        'title': r[1],
        'description': r[2],
        'cover_asset_id': str(r[3]) if r[3] else None,
        'created_at': r[4].isoformat() if r[4] else None,
        'updated_at': r[5].isoformat() if r[5] else None,
        'entries': _list_entries(cur, family_id, album_id=album_id),
    }


def _archive_album(cur, conn, family_id, album_id):
    if not album_id:
        return _resp(400, {'error': 'id required'})
    cur.execute(
        'UPDATE memory_albums SET archived_at = CURRENT_TIMESTAMP WHERE id = %s AND family_id = %s',
        (album_id, family_id),
    )
    conn.commit()
    return _resp(200, {'ok': True})


# ============================================================
# ASSETS
# ============================================================

def _handle_assets(cur, conn, method, family_id, item_id, qp, body):
    if method == 'POST':
        entry_id = qp.get('entry_id')
        if not entry_id:
            return _resp(400, {'error': 'entry_id required'})
        file_url = body.get('file_url')
        if not file_url:
            return _resp(400, {'error': 'file_url required'})
        cur.execute(
            'SELECT 1 FROM memory_entries WHERE id = %s AND family_id = %s',
            (entry_id, family_id),
        )
        if not cur.fetchone():
            return _resp(404, {'error': 'entry not found'})
        cur.execute('SELECT COUNT(*) FROM memory_assets WHERE memory_entry_id = %s', (entry_id,))
        if cur.fetchone()[0] >= 10:
            return _resp(400, {'error': 'limit 10 photos per memory'})
        cur.execute(
            '''INSERT INTO memory_assets (memory_entry_id, file_url, sort_order, width, height, mime_type)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id''',
            (entry_id, file_url, body.get('sort_order', 0),
             body.get('width'), body.get('height'), body.get('mime_type')),
        )
        new_id = cur.fetchone()[0]
        cur.execute(
            '''UPDATE memory_entries SET cover_asset_id = %s
               WHERE id = %s AND cover_asset_id IS NULL''',
            (new_id, entry_id),
        )
        conn.commit()
        return _resp(200, {'id': str(new_id), 'entry': _entry_full(cur, family_id, entry_id, include_drafts=True)})

    if method == 'PUT':
        if not item_id:
            return _resp(400, {'error': 'id required'})
        if 'sort_order' in body:
            cur.execute(
                '''UPDATE memory_assets SET sort_order = %s
                   WHERE id = %s AND memory_entry_id IN (
                       SELECT id FROM memory_entries WHERE family_id = %s
                   )''',
                (body['sort_order'], item_id, family_id),
            )
            conn.commit()
        return _resp(200, {'ok': True})

    return _resp(405, {'error': 'method not allowed'})


def _remove_asset(cur, conn, family_id, asset_id):
    if not asset_id:
        return _resp(400, {'error': 'id required'})
    cur.execute(
        '''SELECT a.memory_entry_id FROM memory_assets a
           JOIN memory_entries e ON e.id = a.memory_entry_id
           WHERE a.id = %s AND e.family_id = %s''',
        (asset_id, family_id),
    )
    row = cur.fetchone()
    if not row:
        return _resp(404, {'error': 'asset not found'})
    entry_id = row[0]
    cur.execute(
        '''UPDATE memory_entries SET cover_asset_id = NULL
           WHERE id = %s AND cover_asset_id = %s''',
        (entry_id, asset_id),
    )
    cur.execute('DELETE FROM memory_assets WHERE id = %s', (asset_id,))
    conn.commit()
    return _resp(200, {'ok': True, 'entry': _entry_full(cur, family_id, str(entry_id), include_drafts=True)})


# ============================================================
# PERSON LINKS
# ============================================================

def _set_persons(cur, conn, family_id, entry_id, body):
    if not entry_id:
        return _resp(400, {'error': 'entry_id required'})
    cur.execute(
        'SELECT 1 FROM memory_entries WHERE id = %s AND family_id = %s',
        (entry_id, family_id),
    )
    if not cur.fetchone():
        return _resp(404, {'error': 'entry not found'})
    member_ids = [int(m) for m in (body.get('member_ids') or [])]
    cur.execute('DELETE FROM memory_person_links WHERE memory_entry_id = %s', (entry_id,))
    for mid in member_ids:
        cur.execute(
            'INSERT INTO memory_person_links (memory_entry_id, member_id) VALUES (%s, %s) ON CONFLICT DO NOTHING',
            (entry_id, mid),
        )
    conn.commit()
    return _resp(200, {'entry': _entry_full(cur, family_id, entry_id, include_drafts=True)})


def _add_person_link(cur, conn, family_id, body):
    """
    Идемпотентно привязывает одного человека к памяти.
    body: { entry_id, member_id }
    Симметрично album-links. Защищён от lost update — ничего не пересоздаёт целиком.
    """
    entry_id = body.get('entry_id') or body.get('memory_entry_id')
    raw_member = body.get('member_id')
    if not entry_id or raw_member is None:
        return _resp(400, {'error': 'entry_id and member_id required'})
    try:
        member_id = int(raw_member)
    except (TypeError, ValueError):
        return _resp(400, {'error': 'invalid member_id'})
    cur.execute(
        'SELECT 1 FROM memory_entries WHERE id = %s AND family_id = %s',
        (entry_id, family_id),
    )
    if not cur.fetchone():
        return _resp(404, {'error': 'entry not found'})
    cur.execute(
        '''INSERT INTO memory_person_links (memory_entry_id, member_id)
           VALUES (%s, %s) ON CONFLICT DO NOTHING''',
        (entry_id, member_id),
    )
    conn.commit()
    return _resp(200, {'ok': True})


# ============================================================
# ALBUM LINKS
# ============================================================

def _add_album_link(cur, conn, family_id, body):
    album_id = body.get('album_id')
    entry_id = body.get('memory_entry_id')
    if not album_id or not entry_id:
        return _resp(400, {'error': 'album_id and memory_entry_id required'})
    cur.execute(
        'SELECT 1 FROM memory_albums WHERE id = %s AND family_id = %s',
        (album_id, family_id),
    )
    if not cur.fetchone():
        return _resp(404, {'error': 'album not found'})
    cur.execute(
        'SELECT 1 FROM memory_entries WHERE id = %s AND family_id = %s',
        (entry_id, family_id),
    )
    if not cur.fetchone():
        return _resp(404, {'error': 'entry not found'})
    cur.execute(
        '''INSERT INTO memory_album_links (album_id, memory_entry_id, sort_order)
           VALUES (%s, %s, %s) ON CONFLICT DO NOTHING''',
        (album_id, entry_id, body.get('sort_order', 0)),
    )
    conn.commit()
    return _resp(200, {'ok': True})


def _remove_album_link(cur, conn, family_id, body):
    album_id = body.get('album_id')
    entry_id = body.get('memory_entry_id')
    if not album_id or not entry_id:
        return _resp(400, {'error': 'album_id and memory_entry_id required'})
    cur.execute(
        '''DELETE FROM memory_album_links
           WHERE album_id = %s AND memory_entry_id = %s
             AND album_id IN (SELECT id FROM memory_albums WHERE family_id = %s)''',
        (album_id, entry_id, family_id),
    )
    conn.commit()
    return _resp(200, {'ok': True})


def _set_album_links(cur, conn, family_id, body):
    """
    Полная синхронизация связей памяти с альбомами.
    body: { entry_id, album_ids: [uuid, ...] }
    Работает и для draft (entry проверяется только по family_id).

    Edge: если из памяти удаляется связь с альбомом, у которого cover_asset_id
    указывал на asset этой памяти — обложка альбома сбрасывается на null
    (auto-fallback). Возвращает список затронутых album_ids в reset_covers.
    """
    entry_id = body.get('entry_id') or body.get('memory_entry_id')
    raw_ids = body.get('album_ids')
    if not entry_id or raw_ids is None:
        return _resp(400, {'error': 'entry_id and album_ids required'})

    cur.execute(
        'SELECT 1 FROM memory_entries WHERE id = %s AND family_id = %s',
        (entry_id, family_id),
    )
    if not cur.fetchone():
        return _resp(404, {'error': 'entry not found'})

    desired = set(str(a) for a in raw_ids if a)

    # фильтруем — оставляем только альбомы этой семьи
    if desired:
        cur.execute(
            'SELECT id FROM memory_albums WHERE family_id = %s AND id = ANY(%s) AND archived_at IS NULL',
            (family_id, list(desired)),
        )
        desired = {str(r[0]) for r in cur.fetchall()}

    # текущие
    cur.execute(
        '''SELECT al.album_id FROM memory_album_links al
           JOIN memory_albums a ON a.id = al.album_id
           WHERE al.memory_entry_id = %s AND a.family_id = %s''',
        (entry_id, family_id),
    )
    current = {str(r[0]) for r in cur.fetchall()}

    to_add = desired - current
    to_remove = current - desired

    # ассеты текущей памяти (для guard висячей обложки)
    asset_ids: list[str] = []
    if to_remove:
        cur.execute('SELECT id FROM memory_assets WHERE memory_entry_id = %s', (entry_id,))
        asset_ids = [str(r[0]) for r in cur.fetchall()]

    reset_covers: list[str] = []
    for album_id in to_remove:
        cur.execute(
            'DELETE FROM memory_album_links WHERE album_id = %s AND memory_entry_id = %s',
            (album_id, entry_id),
        )
        if asset_ids:
            cur.execute(
                '''UPDATE memory_albums SET cover_asset_id = NULL
                   WHERE id = %s AND family_id = %s AND cover_asset_id = ANY(%s)''',
                (album_id, family_id, asset_ids),
            )
            if cur.rowcount > 0:
                reset_covers.append(album_id)

    for album_id in to_add:
        cur.execute(
            '''INSERT INTO memory_album_links (album_id, memory_entry_id, sort_order)
               VALUES (%s, %s, 0) ON CONFLICT DO NOTHING''',
            (album_id, entry_id),
        )

    conn.commit()
    return _resp(200, {
        'ok': True,
        'added': sorted(to_add),
        'removed': sorted(to_remove),
        'reset_covers': reset_covers,
    })


# ============================================================
# HELPERS
# ============================================================

def _parse_body(event):
    raw = event.get('body') or ''
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}


def _resp(status, payload):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        'body': json.dumps(payload, ensure_ascii=False, default=_json_default),
        'isBase64Encoded': False,
    }


def _json_default(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return str(obj)