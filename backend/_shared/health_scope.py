"""
health_scope — проверки доступа для ресурсов, привязанных к health_profiles.

КАНОНИЧЕСКИЙ ИСТОЧНИК: backend/_shared/health_scope.py
Синхронизация: python3 backend/_shared/sync_auth_guard.py

Модель данных health-модуля единообразна:
    <resource>.profile_id → health_profiles.id
    health_profiles.user_id → family_members.id     (аномалия KE-health)
    family_members.family_id → families.id

Отсюда две проверки, нужные каждому health-эндпоинту:
    guard_profile(...)   — операция над профилем и его дочерними записями
    guard_resource(...)  — операция над конкретной записью по её id

Обе вызываются ДО чтения содержимого и ДО любой записи. Это закрывает IDOR:
раньше PUT/DELETE по известному id срабатывали без проверки семьи.
"""

import os
from typing import Any, Dict, Optional

import psycopg2

from auth_guard import (
    AuthContext,
    AuthError,
    accessible_subject_ids,
    require_same_family,
    require_subject_access,
)

SCHEMA = 't_p5815085_family_assistant_pro'


def connect():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))


def profile_scope(cursor, profile_id: str) -> Optional[Dict[str, Any]]:
    cursor.execute(
        f"""
        SELECT hp.id, hp.user_id AS subject_member_id, fm.family_id::text AS family_id
        FROM health_profiles hp
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE hp.id = %s
        """,
        (profile_id,),
    )
    row = cursor.fetchone()
    return {'profile_id': row[0], 'subject_member_id': row[1], 'family_id': row[2]} if row else None


def resource_scope(cursor, table: str, resource_id: str) -> Optional[Dict[str, Any]]:
    """
    table — имя таблицы с колонкой profile_id. Значение приходит из кода
    функции (константа), не из клиентского ввода.
    """
    if table not in ALLOWED_TABLES:
        raise ValueError(f'health_scope: table {table} is not whitelisted')
    cursor.execute(
        f"""
        SELECT r.id, r.profile_id, hp.user_id AS subject_member_id,
               fm.family_id::text AS family_id
        FROM {table} r
        JOIN health_profiles hp ON hp.id = r.profile_id
        LEFT JOIN {SCHEMA}.family_members fm ON fm.id::text = hp.user_id
        WHERE r.id = %s
        """,
        (resource_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None
    return {'resource_id': row[0], 'profile_id': row[1],
            'subject_member_id': row[2], 'family_id': row[3]}


# Белый список таблиц: имя таблицы подставляется в SQL, поэтому оно
# не может приходить из запроса ни при каких обстоятельствах.
ALLOWED_TABLES = frozenset({
    'health_records',
    'vital_records',
    'vaccinations',
    'insurance_policies',
    'telemedicine_sessions',
    'medications',
    'medication_intakes',
})


def guard_profile(ctx: AuthContext, cursor, profile_id: str,
                  module: str, resource_type: str) -> Dict[str, Any]:
    """Профиль существует, принадлежит моей семье, и субъект мне доступен."""
    scope = profile_scope(cursor, profile_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], resource_type, profile_id)
    require_subject_access(ctx, scope['subject_member_id'], module,
                           resource_type=resource_type, resource_id=profile_id)
    return scope


def guard_resource(ctx: AuthContext, cursor, table: str, resource_id: str,
                   module: str, resource_type: str) -> Dict[str, Any]:
    """Конкретная запись существует и относится к доступному мне субъекту."""
    scope = resource_scope(cursor, table, resource_id)
    if not scope:
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
    require_same_family(ctx, scope['family_id'], resource_type, resource_id)
    require_subject_access(ctx, scope['subject_member_id'], module,
                           resource_type=resource_type, resource_id=resource_id)
    return scope


def accessible_profile_ids(ctx: AuthContext, cursor, module: str = 'health'):
    """
    id профилей, чьи данные актор вправе видеть. Для массовых списков:
    вместо `WHERE hp.user_id = <клиентский заголовок>` — фильтр по
    подтверждённому серверу набору субъектов.
    """
    subjects = accessible_subject_ids(ctx, module)
    if not subjects:
        return []
    cursor.execute('SELECT id FROM health_profiles WHERE user_id = ANY(%s)', (subjects,))
    return [r[0] for r in cursor.fetchall()]
