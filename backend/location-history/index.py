"""
Business: История перемещений участника семьи за день
Args: event с httpMethod GET, queryStringParameters member_id и date
Returns: JSON со списком координат

Авторизация: backend/_shared/auth_guard.py.

Было: функция не проверяла НИЧЕГО. Любой человек без токена мог указать
произвольный member_id и получить координаты чужого ребёнка за любой день.
Это худший класс утечки в продукте — местоположение несовершеннолетнего.

Стало: требуется сессия, участник должен быть из своей семьи, и доступ
к геоданным конкретного человека проверяется адресно (require_subject_access),
то есть роль сама по себе чужие перемещения не открывает.
"""

import json
import re
from datetime import date, datetime
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

# Глубина истории: хранить и отдавать перемещения без ограничения срока —
# несоразмерно цели. Более старые данные через этот API не выдаются.
MAX_HISTORY_DAYS = 90

# Свежая история нужна точной («где ребёнок сейчас был»), старая — нет.
# После этого срока координаты округляются: цель «посмотреть маршрут
# прошлого месяца» не требует метровой точности, а утечка такого архива
# требует. 3 знака ≈ 110 м.
PRECISE_WINDOW_DAYS = 14
COARSE_DECIMALS = 3


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    if method != 'GET':
        return ag.json_response({'error': 'Method not allowed'},
                                status=405, event=event)

    try:
        ctx = ag.require_session(event)
        ag.require_family_member(ctx)
        ag.require_permission(ctx, 'geolocation', 'read')

        params = event.get('queryStringParameters') or {}
        member_id = params.get('member_id')
        date_str = params.get('date')

        if not member_id or not date_str:
            return ag.json_response({'error': 'Missing member_id or date'},
                                    status=400, event=event)

        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(date_str)):
            return ag.json_response({'error': 'Invalid date format'},
                                    status=400, event=event)
        try:
            requested_day = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return ag.json_response({'error': 'Invalid date'},
                                    status=400, event=event)

        if (date.today() - requested_day).days > MAX_HISTORY_DAYS:
            return ag.json_response({'error': 'Requested period is too old'},
                                    status=400, event=event)

        member_id = str(member_id)

        conn = psycopg2.connect(ag.DATABASE_URL)
        conn.autocommit = True
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Сначала устанавливаем, чей это участник и активен ли он,
                # и только потом решаем, отдавать ли координаты.
                cur.execute(
                    f"""SELECT id, family_id, member_status
                        FROM {SCHEMA}.family_members WHERE id = %s""",
                    (member_id,),
                )
                subject = cur.fetchone()
                if not subject:
                    # Чужой и несуществующий участник неотличимы.
                    raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

                ag.require_same_family(ctx, str(subject['family_id']),
                                       'location_history', member_id)

                if (subject.get('member_status') or 'active') != 'active':
                    raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')

                # Адресная проверка: сессия + своя семья + активный субъект
                # + явный scope 'geolocation' по подтверждённой связи.
                # Роль сама по себе чужие перемещения не открывает.
                # Просмотр журналируется внутри guard-а.
                ag.require_location_access(ctx, member_id,
                                           resource_type='location_history',
                                           resource_id=member_id, action='read')

                cur.execute(
                    f"""
                    SELECT lt.latitude AS lat, lt.longitude AS lng,
                           lt.accuracy, lt.created_at AS timestamp
                    FROM {SCHEMA}.family_location_tracking lt
                    JOIN {SCHEMA}.family_members fm ON fm.user_id = lt.user_id
                    WHERE fm.id = %s
                      AND fm.family_id = %s
                      AND lt.family_id = %s
                      AND DATE(lt.created_at) = %s
                    ORDER BY lt.created_at ASC
                    """,
                    (member_id, ctx.family_id, ctx.family_id, date_str),
                )
                locations = cur.fetchall()
        finally:
            conn.close()

        coarse = (date.today() - requested_day).days > PRECISE_WINDOW_DAYS

        def coord(value: Any) -> float:
            v = float(value)
            return round(v, COARSE_DECIMALS) if coarse else v

        return ag.json_response({
            'success': True,
            'member_id': member_id,
            'date': date_str,
            'precision': 'coarse' if coarse else 'exact',
            'locations': [
                {
                    'lat': coord(loc['lat']),
                    'lng': coord(loc['lng']),
                    'accuracy': float(loc['accuracy']) if loc['accuracy'] else 0,
                    'timestamp': loc['timestamp'].isoformat() if loc['timestamp'] else None,
                }
                for loc in locations
            ],
            'total_points': len(locations),
        }, event=event)

    except AuthError as exc:
        return ag.error_response(exc, event)
    except Exception:
        # Текст ошибки наружу не отдаём: он раскрывает структуру БД.
        return ag.json_response({'error': 'Внутренняя ошибка'},
                                status=500, event=event)