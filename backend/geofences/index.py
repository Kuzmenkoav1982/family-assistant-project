"""
Business: геозоны семьи и настройки уведомлений о входе/выходе
Args: event с httpMethod GET/POST/PUT/DELETE
Returns: JSON со списком геозон и настроек оповещения

Авторизация: backend/_shared/auth_guard.py.

Было (инцидент SEC-2026-001):
  - GET отдавал 200 без токена: список всех геозон ВСЕХ семей —
    домашние адреса, школы и детские сады в виде координат с названиями;
  - POST создавал геозону без сессии и без family_id — зона попадала
    в общий список и видна всем;
  - DELETE удалял любую зону по числовому id без всякой проверки:
    полный перебор 1..N стирал геозоны всех семей.
  - таблица geofences не фильтровалась по family_id вообще.

Стало: сессия обязательна на всех методах, зоны читаются и пишутся
только в пределах своей семьи, создание и удаление — право admin/owner.
"""

import json
from typing import Any, Dict, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

MAX_NAME_LEN = 100
MIN_RADIUS_M = 20
MAX_RADIUS_M = 50_000


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    try:
        ctx = ag.require_session(event)
        ag.require_family_member(ctx)

        conn = psycopg2.connect(ag.DATABASE_URL)
        conn.autocommit = True
        try:
            if method == 'GET':
                ag.require_permission(ctx, 'geolocation', 'read_own')
                return _list_geofences(conn, ctx, event)
            if method == 'POST':
                ag.require_admin(ctx, 'geofence.create')
                return _create_geofence(conn, ctx, event)
            if method == 'PUT':
                ag.require_admin(ctx, 'geofence.alert_settings')
                return _update_alert_settings(conn, ctx, event)
            if method == 'DELETE':
                ag.require_admin(ctx, 'geofence.delete')
                return _delete_geofence(conn, ctx, event)
            return ag.json_response({'error': 'Method not allowed'},
                                    status=405, event=event)
        finally:
            conn.close()

    except AuthError as exc:
        return ag.error_response(exc, event)
    except Exception:
        return ag.json_response({'error': 'Внутренняя ошибка'},
                                status=500, event=event)


def _list_geofences(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """Только зоны своей семьи. Зоны без family_id (наследие) не выдаются
    никому: неизвестно, чей это адрес, поэтому показать его нельзя."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""SELECT id, name, center_lat, center_lng, radius, color, created_at
                FROM {SCHEMA}.geofences
                WHERE family_id = %s
                ORDER BY created_at DESC""",
            (ctx.family_id,),
        )
        geofences = [dict(r) for r in cur.fetchall()]

        cur.execute(
            f"""SELECT member_id, alerts_enabled, notify_members
                FROM {SCHEMA}.geofence_alert_settings
                WHERE family_id = %s""",
            (ctx.family_id,),
        )
        alert_settings = [dict(r) for r in cur.fetchall()]

    return ag.json_response({'geofences': geofences,
                             'alert_settings': alert_settings}, event=event)


def _body(event: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return json.loads(event.get('body') or '{}')
    except (ValueError, TypeError):
        return {}


def _num(value: Any, lo: float, hi: float) -> Optional[float]:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    return v if lo <= v <= hi else None


def _create_geofence(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    data = _body(event)
    name = str(data.get('name') or '').strip()[:MAX_NAME_LEN]
    lat = _num(data.get('center_lat'), -90, 90)
    lng = _num(data.get('center_lng'), -180, 180)
    radius = _num(data.get('radius', 500), MIN_RADIUS_M, MAX_RADIUS_M)
    color = str(data.get('color') or '#9333EA')[:20]

    if not name or lat is None or lng is None or radius is None:
        return ag.json_response({'error': 'Invalid or missing fields'},
                                status=400, event=event)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"""INSERT INTO {SCHEMA}.geofences
                    (name, center_lat, center_lng, radius, color,
                     family_id, created_by_member_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, center_lat, center_lng, radius, color, created_at""",
            (name, lat, lng, int(radius), color, ctx.family_id, ctx.member_id),
        )
        new_zone = dict(cur.fetchone())

    ag.audit_allowed(ctx, 'geolocation', 'create', 'GEOFENCE_CREATED',
                     resource_type='geofence', resource_id=new_zone['id'])
    return ag.json_response(new_zone, event=event)


def _update_alert_settings(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """family_id берётся из сессии, а не из тела: иначе настройки
    оповещения можно было бы переписать чужой семье."""
    settings = _body(event).get('settings') or []
    if not isinstance(settings, list):
        return ag.json_response({'error': 'Invalid settings'}, status=400, event=event)

    applied = 0
    with conn.cursor() as cur:
        for item in settings:
            if not isinstance(item, dict):
                continue
            member_id = item.get('member_id')
            if not member_id or not ag._is_uuid(member_id):
                continue

            # Настройка касается конкретного участника — он обязан быть
            # из нашей семьи, иначе это запись в чужое пространство.
            cur.execute(
                f"""SELECT family_id FROM {SCHEMA}.family_members
                    WHERE id = %s AND COALESCE(member_status,'active') = 'active'""",
                (str(member_id),),
            )
            row = cur.fetchone()
            if not row or str(row[0]) != ctx.family_id:
                ag.audit_denied(ctx, 'geolocation', 'update',
                                'CROSS_FAMILY_ACCESS', resource_type='geofence_alert',
                                resource_id=str(member_id))
                continue

            notify = item.get('notify_members') or []
            if not isinstance(notify, list):
                notify = []
            # Оповещать можно только участников своей семьи.
            notify = [str(m) for m in notify if ag._is_uuid(m)]
            if notify:
                cur.execute(
                    f"""SELECT id FROM {SCHEMA}.family_members
                        WHERE family_id = %s AND id = ANY(%s::uuid[])""",
                    (ctx.family_id, notify),
                )
                notify = [str(r[0]) for r in cur.fetchall()]

            cur.execute(
                f"""INSERT INTO {SCHEMA}.geofence_alert_settings
                        (family_id, member_id, alerts_enabled, notify_members, updated_at)
                    VALUES (%s, %s, %s, %s::jsonb, NOW())
                    ON CONFLICT (family_id, member_id) DO UPDATE
                    SET alerts_enabled = EXCLUDED.alerts_enabled,
                        notify_members = EXCLUDED.notify_members,
                        updated_at     = NOW()""",
                (ctx.family_id, str(member_id),
                 bool(item.get('alerts_enabled', True)), json.dumps(notify)),
            )
            applied += 1

    return ag.json_response({'success': True, 'applied': applied}, event=event)


def _delete_geofence(conn, ctx: ag.AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    """Удаление с обязательным условием family_id в самом UPDATE/DELETE:
    проверка «сначала прочитали, потом удалили» оставляет окно гонки."""
    zone_id = (event.get('queryStringParameters') or {}).get('id')
    if not zone_id or not str(zone_id).isdigit():
        return ag.json_response({'error': 'Missing or invalid zone id'},
                                status=400, event=event)

    with conn.cursor() as cur:
        cur.execute(
            f"""DELETE FROM {SCHEMA}.geofences
                WHERE id = %s AND family_id = %s""",
            (int(zone_id), ctx.family_id),
        )
        deleted = cur.rowcount

    if not deleted:
        # Чужая и несуществующая зона неотличимы — иначе перебор id
        # раскрывает, у каких семей есть геозоны.
        ag.audit_denied(ctx, 'geolocation', 'delete', 'CROSS_FAMILY_ACCESS',
                        resource_type='geofence', resource_id=str(zone_id),
                        http_status=404)
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

    ag.audit_allowed(ctx, 'geolocation', 'delete', 'GEOFENCE_DELETED',
                     resource_type='geofence', resource_id=str(zone_id))
    return ag.json_response({'success': True}, event=event)
