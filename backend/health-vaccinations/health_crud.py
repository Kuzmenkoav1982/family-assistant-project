# ============================================================
# АВТОСГЕНЕРИРОВАННАЯ КОПИЯ — НЕ РЕДАКТИРОВАТЬ
# Источник: backend/_shared/health_crud.py
# Обновление: python3 backend/_shared/sync_auth_guard.py
# ============================================================
"""
health_crud — типовой защищённый CRUD для health-ресурсов вида <table>.profile_id.

КАНОНИЧЕСКИЙ ИСТОЧНИК: backend/_shared/health_crud.py
Синхронизация: python3 backend/_shared/sync_auth_guard.py

Четыре функции (vitals, vaccinations, insurance, telemedicine) имели
идентичную структуру и одну и ту же уязвимость: actor из X-User-Id, а
PUT/DELETE по id без проверки принадлежности. Вместо четырёх копий правок —
один обработчик с описанием полей, чтобы проверки нельзя было забыть
в одной из функций.

Гарантии, встроенные в run_crud():
  - actor только из require_session();
  - GET списка ограничен accessible_profile_ids() — чужие записи не выдаются;
  - GET/POST по profileId проходит guard_profile();
  - PUT/DELETE по id проходит guard_resource() — same_family + subject access;
  - имена таблиц и колонок берутся из описания в коде, не из запроса;
  - в аудит попадает только факт доступа, без значений показателей.
"""

import json
from typing import Any, Callable, Dict, List, Optional

from auth_guard import (
    AuthContext,
    AuthError,
    audit_allowed,
    error_response,
    json_response,
    preflight,
    require_permission,
    require_session,
)
from health_scope import accessible_profile_ids, connect, guard_profile, guard_resource


class CrudSpec:
    """
    Описание ресурса.

    table          — имя таблицы (должно быть в health_scope.ALLOWED_TABLES)
    module         — модуль политики: 'health' | 'medications'
    resource_type  — тип для аудита
    select_columns — список колонок для SELECT (первая — id, вторая — profile_id)
    serialize      — row -> dict
    insert_columns — колонки INSERT (без id/profile_id/created_at)
    insert_values  — body -> tuple значений для insert_columns
    update_columns — колонки UPDATE
    update_values  — body -> tuple значений для update_columns
    order_by       — SQL-фрагмент сортировки (константа в коде)
    limit          — ограничение выборки
    validate_write — (ctx, cursor, body) -> None; дополнительная проверка
                     связанных объектов из body (например doctor_id должен
                     принадлежать актору). Бросает AuthError при отказе.
    postprocess    — (cursor, item) -> item; дообогащение записи после SELECT
    """

    def __init__(self, table: str, module: str, resource_type: str,
                 select_columns: List[str], serialize: Callable[[Any], Dict[str, Any]],
                 insert_columns: List[str], insert_values: Callable[[Dict], tuple],
                 update_columns: List[str], update_values: Callable[[Dict], tuple],
                 order_by: str = 'created_at DESC', limit: Optional[int] = None,
                 validate_write: Optional[Callable] = None,
                 postprocess: Optional[Callable] = None):
        self.validate_write = validate_write
        self.postprocess = postprocess
        self.table = table
        self.module = module
        self.resource_type = resource_type
        self.select_columns = select_columns
        self.serialize = serialize
        self.insert_columns = insert_columns
        self.insert_values = insert_values
        self.update_columns = update_columns
        self.update_values = update_values
        self.order_by = order_by
        self.limit = limit


def _select_sql(spec: CrudSpec, where: str) -> str:
    cols = ', '.join(spec.select_columns)
    sql = f'SELECT {cols} FROM {spec.table} WHERE {where} ORDER BY {spec.order_by}'
    if spec.limit:
        sql += f' LIMIT {int(spec.limit)}'
    return sql


def _handle_get(event, ctx: AuthContext, cursor, spec: CrudSpec) -> Dict[str, Any]:
    require_permission(ctx, spec.module, 'read_own')
    qs = event.get('queryStringParameters') or {}
    profile_id = qs.get('profileId')

    if profile_id:
        scope = guard_profile(ctx, cursor, profile_id, spec.module, spec.resource_type)
        cursor.execute(_select_sql(spec, 'profile_id = %s'), (profile_id,))
        subject = scope['subject_member_id']
    else:
        profiles = accessible_profile_ids(ctx, cursor, spec.module)
        if not profiles:
            return json_response([], 200, event)
        cursor.execute(_select_sql(spec, 'profile_id = ANY(%s)'), (profiles,))
        subject = None

    items = [spec.serialize(row) for row in cursor.fetchall()]
    if spec.postprocess:
        items = [spec.postprocess(cursor, item) for item in items]
    audit_allowed(ctx, spec.module, 'read', 'POLICY_ALLOW',
                  resource_type=spec.resource_type, resource_id=profile_id,
                  subject_member_id=subject)
    return json_response(items, 200, event)


def _handle_post(event, ctx: AuthContext, cursor, conn, spec: CrudSpec) -> Dict[str, Any]:
    require_permission(ctx, spec.module, 'create')
    body = json.loads(event.get('body') or '{}')
    profile_id = body.get('profileId')
    if not profile_id:
        return json_response({'error': 'profileId required'}, 400, event)

    scope = guard_profile(ctx, cursor, profile_id, spec.module, spec.resource_type)
    if spec.validate_write:
        spec.validate_write(ctx, cursor, body)

    cols = ', '.join(['id', 'profile_id'] + spec.insert_columns + ['created_at'])
    placeholders = ', '.join(['%s'] * (len(spec.insert_columns) + 1))
    cursor.execute(
        f"""INSERT INTO {spec.table} ({cols})
            VALUES (gen_random_uuid()::text, {placeholders}, NOW())
            RETURNING id""",
        (profile_id,) + tuple(spec.insert_values(body)),
    )
    new_id = cursor.fetchone()[0]
    conn.commit()

    audit_allowed(ctx, spec.module, 'create', 'POLICY_ALLOW',
                  resource_type=spec.resource_type, resource_id=new_id,
                  subject_member_id=scope['subject_member_id'])
    return json_response({'id': new_id, 'message': 'Created'}, 201, event)


def _handle_put(event, ctx: AuthContext, cursor, conn, spec: CrudSpec) -> Dict[str, Any]:
    require_permission(ctx, spec.module, 'update')
    body = json.loads(event.get('body') or '{}')
    resource_id = body.get('id')
    if not resource_id:
        return json_response({'error': 'id required'}, 400, event)

    scope = guard_resource(ctx, cursor, spec.table, resource_id,
                           spec.module, spec.resource_type)

    assignments = ', '.join(f'{c} = %s' for c in spec.update_columns)
    cursor.execute(
        f'UPDATE {spec.table} SET {assignments} WHERE id = %s',
        tuple(spec.update_values(body)) + (resource_id,),
    )
    conn.commit()

    audit_allowed(ctx, spec.module, 'update', 'POLICY_ALLOW',
                  resource_type=spec.resource_type, resource_id=resource_id,
                  subject_member_id=scope['subject_member_id'])
    return json_response({'message': 'Updated'}, 200, event)


def _handle_delete(event, ctx: AuthContext, cursor, conn, spec: CrudSpec) -> Dict[str, Any]:
    require_permission(ctx, spec.module, 'update')
    qs = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    resource_id = body.get('id') or qs.get('id')
    if not resource_id:
        return json_response({'error': 'id required'}, 400, event)

    scope = guard_resource(ctx, cursor, spec.table, resource_id,
                           spec.module, spec.resource_type)

    cursor.execute(f'DELETE FROM {spec.table} WHERE id = %s', (resource_id,))
    conn.commit()

    audit_allowed(ctx, spec.module, 'delete', 'POLICY_ALLOW',
                  resource_type=spec.resource_type, resource_id=resource_id,
                  subject_member_id=scope['subject_member_id'])
    return json_response({'message': 'Deleted'}, 200, event)


def run_crud(event: Dict[str, Any], spec: CrudSpec,
             extra_get: Optional[Callable] = None) -> Dict[str, Any]:
    """
    Единая точка входа. extra_get — обработчик публичных GET-подпутей
    (например справочник /schedule), вызывается ДО require_session только
    если он сам не требует персональных данных.
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return preflight(event)

    try:
        ctx = require_session(event)
    except AuthError as exc:
        return error_response(exc, event)

    conn = None
    try:
        conn = connect()
        cursor = conn.cursor()

        if method == 'GET' and extra_get is not None:
            handled = extra_get(event, ctx, cursor)
            if handled is not None:
                return handled

        if method == 'GET':
            return _handle_get(event, ctx, cursor, spec)
        if method == 'POST':
            return _handle_post(event, ctx, cursor, conn, spec)
        if method == 'PUT':
            return _handle_put(event, ctx, cursor, conn, spec)
        if method == 'DELETE':
            return _handle_delete(event, ctx, cursor, conn, spec)

        return json_response({'error': 'Method not allowed'}, 405, event)

    except AuthError as exc:
        if conn:
            conn.rollback()
        return error_response(exc, event)
    except Exception as exc:
        if conn:
            conn.rollback()
        print(f'[ERROR] {spec.table}: {exc}')
        return json_response({'error': 'Internal error'}, 500, event)
    finally:
        if conn:
            conn.close()