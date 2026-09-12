"""
Business: Управление участниками семьи (список, добавление, изменение, отзыв)
Args: event с httpMethod, body, headers с X-Auth-Token
Returns: JSON со списком участников или результатом операции

Авторизация: backend/_shared/auth_guard.py. Клиент не определяет ни свою
личность, ни семью, ни роль, ни владельца ресурса.

Ключевые решения этой функции:
  - ВСЕ запросы параметризованы. Ручное экранирование удалено: оно
    приводит к инъекции при первой же ошибке в одном месте.
  - Роли меняет только admin/owner, и только в пределах разрешённого набора.
    Повышение себя, назначение admin и смена владельца через body запрещены.
  - Участник не удаляется физически: ставится member_status='revoked'.
    DELETE оставлял бы осиротевшие задачи, события и медицинские записи.
  - Записи на разборе дубликатов не выдаются и не изменяются через API.
"""

import json
from typing import Any, Dict, List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

import auth_guard as ag
from auth_guard import AuthError, SCHEMA

# Роли, которые администратор вправе назначить через этот API.
# 'admin' отсутствует намеренно: расширение круга администраторов —
# отдельная операция владельца, а не рядовое редактирование участника.
ASSIGNABLE_ACCESS_ROLES = frozenset({'parent', 'guardian', 'viewer', 'child'})

# Поля, которые клиент может изменить у участника.
# age и birthDate сюда НЕ входят: возраст определяет, кто вправе дать
# согласие на обработку геоданных, поэтому его правка — привилегированное
# действие, а не рядовое редактирование карточки (см. _apply_age_change).
EDITABLE_FIELDS = (
    'name', 'role', 'relationship', 'avatar', 'avatar_type',
    'photo_url', 'points', 'level', 'workload', 'member_color',
)

# Поля, которые клиент не может задать НИКОГДА: они определяют личность,
# принадлежность и полномочия.
FORBIDDEN_INPUT_FIELDS = (
    'id', 'member_id', 'family_id', 'familyId', 'user_id', 'userId',
    'owner_user_id', 'member_status', 'is_admin', 'isAdmin',
)

PROFILE_FIELDS = (
    'achievements', 'responsibilities', 'foodPreferences', 'dreams',
    'piggyBank', 'moodStatus', 'dreamGoal', 'safetyProgress', 'regionProgress',
)


def _connect():
    conn = psycopg2.connect(ag.DATABASE_URL)
    conn.autocommit = False
    return conn


def _reject_forbidden_fields(data: Dict[str, Any], ctx) -> None:
    """
    Клиент, пытающийся задать family_id/user_id/member_status, не ошибается —
    он проверяет границу. Это фиксируется в аудите и отклоняется.
    """
    present = [f for f in FORBIDDEN_INPUT_FIELDS if f in data]
    # id/member_id — легальный способ указать, КОГО правим; он не является
    # заявлением о личности и проверяется отдельно через same_family.
    present = [f for f in present if f not in ('id', 'member_id')]
    if present:
        ag.audit_denied(ctx, 'family_members', 'update', 'CLIENT_SET_PROTECTED_FIELD',
                        http_status=403)
        raise AuthError(403, 'PERMISSION_DENIED',
                        'Fields are server-controlled: ' + ', '.join(present))


def list_members(ctx) -> Dict[str, Any]:
    """
    Список участников своей семьи. family_id берётся из сессии,
    поэтому подставить чужой невозможно.

    Записи в duplicate_review исключаются: они на разборе и не должны
    выглядеть как действующие участники.
    """
    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""
            SELECT id, user_id, name, role, relationship, avatar, avatar_type,
                   photo_url, points, level, workload, age, birth_date, birth_time,
                   account_type, access_role, member_status, profile_data,
                   member_color, tree_node_id, created_at, updated_at
            FROM {SCHEMA}.family_members
            WHERE family_id = %s
              AND COALESCE(member_status, 'active') = 'active'
            ORDER BY CASE WHEN role = 'Владелец' THEN 0 ELSE 1 END, created_at ASC
            """,
            (ctx.family_id,),
        )
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    members: List[Dict[str, Any]] = []
    for row in rows:
        item = dict(row)
        profile = item.get('profile_data') or {}
        for field in PROFILE_FIELDS:
            if field in profile:
                item[field] = profile[field]
        members.append(item)

    return {
        'success': True,
        'family_id': ctx.family_id,
        'current_member_id': ctx.member_id,
        'members': members,
    }


def _validate_tree_node(cur, tree_node_id: int, family_id: str,
                        exclude_member_id: Optional[str] = None) -> Optional[str]:
    cur.execute(
        f"SELECT id FROM {SCHEMA}.family_tree WHERE id = %s AND family_id = %s",
        (tree_node_id, family_id),
    )
    if not cur.fetchone():
        return 'tree_node_id не существует или принадлежит другой семье'

    if exclude_member_id:
        cur.execute(
            f"""SELECT id FROM {SCHEMA}.family_members
                WHERE tree_node_id = %s AND family_id = %s AND id <> %s LIMIT 1""",
            (tree_node_id, family_id, exclude_member_id),
        )
    else:
        cur.execute(
            f"""SELECT id FROM {SCHEMA}.family_members
                WHERE tree_node_id = %s AND family_id = %s LIMIT 1""",
            (tree_node_id, family_id),
        )
    if cur.fetchone():
        return 'tree_node_id уже привязан к другому участнику'
    return None


def add_member(ctx, data: Dict[str, Any]) -> Dict[str, Any]:
    ag.require_permission(ctx, 'family_members', 'create')
    _reject_forbidden_fields(data, ctx)

    tree_node_id = data.get('tree_node_id')
    tree_node_id = int(tree_node_id) if tree_node_id is not None else None

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if tree_node_id is not None:
            err = _validate_tree_node(cur, tree_node_id, ctx.family_id)
            if err:
                conn.rollback()
                return {'error': err}

        # Новый участник создаётся только как профиль без аккаунта.
        # Привязка к users возможна лишь через приглашение, поэтому
        # здесь account_type жёстко 'child_profile', а user_id — NULL.
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.family_members
                (family_id, name, role, relationship, avatar, avatar_type,
                 photo_url, points, level, workload, age, account_type,
                 access_role, member_status, tree_node_id, member_color)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    'child_profile', 'viewer', 'active', %s, %s)
            RETURNING id, name, role, relationship, avatar, points, level,
                      workload, account_type, access_role, tree_node_id, member_color
            """,
            (
                ctx.family_id,
                str(data.get('name', ''))[:255],
                str(data.get('role', 'Член семьи'))[:100],
                str(data.get('relationship', ''))[:100],
                data.get('avatar', '👤'),
                data.get('avatar_type', 'emoji'),
                data.get('photo_url'),
                int(data.get('points', 0) or 0),
                int(data.get('level', 1) or 1),
                int(data.get('workload', 0) or 0),
                data.get('age'),
                tree_node_id,
                data.get('member_color'),
            ),
        )
        member = dict(cur.fetchone())

        # Авто-связь с узлом дерева по имени — только при единственном
        # однозначном совпадении внутри своей семьи.
        if member.get('tree_node_id') is None:
            cur.execute(
                f"""SELECT id FROM {SCHEMA}.family_tree
                    WHERE family_id = %s AND lower(trim(name)) = lower(trim(%s))""",
                (ctx.family_id, member.get('name', '')),
            )
            matches = cur.fetchall()
            if len(matches) == 1:
                cur.execute(
                    f"""UPDATE {SCHEMA}.family_members SET tree_node_id = %s
                        WHERE id = %s AND family_id = %s""",
                    (matches[0]['id'], member['id'], ctx.family_id),
                )
                member['tree_node_id'] = matches[0]['id']

        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    ag.audit_allowed(ctx, 'family_members', 'create',
                     resource_type='family_member', resource_id=str(member['id']))
    return {'success': True, 'member': member}


def update_member(ctx, member_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    _reject_forbidden_fields(data, ctx)

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT id, family_id, user_id, access_role, member_status,
                       profile_data, birth_date, age
                FROM {SCHEMA}.family_members WHERE id = %s""",
            (member_id,),
        )
        target = cur.fetchone()

        # Чужой участник и несуществующий неотличимы: 404 в обоих случаях.
        if not target:
            raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
        ag.require_same_family(ctx, str(target['family_id']),
                               'family_member', member_id)

        if (target.get('member_status') or 'active') != 'active':
            ag.audit_denied(ctx, 'family_members', 'update', 'SUBJECT_NOT_ACTIVE',
                            resource_type='family_member', resource_id=member_id,
                            http_status=403)
            raise AuthError(403, 'SUBJECT_NOT_ACTIVE')

        is_self = bool(ctx.member_id and str(target['id']) == ctx.member_id)
        wants_role_change = 'access_role' in data

        # Обычный участник правит только свою карточку.
        if not is_self:
            ag.require_permission(ctx, 'family_members', 'update')

        fields: List[str] = []
        params: List[Any] = []

        for field in EDITABLE_FIELDS:
            if field in data:
                fields.append(f'{field} = %s')
                params.append(data[field])

        # Возраст и дата рождения: отдельная, защищённая ветка.
        age_change = _apply_age_change(cur, ctx, target, data, fields, params)

        if 'birthTime' in data:
            fields.append('birth_time = %s')
            params.append(data['birthTime'] or None)

        if 'tree_node_id' in data:
            raw = data['tree_node_id']
            if raw is None:
                fields.append('tree_node_id = NULL')
            else:
                node_id = int(raw)
                err = _validate_tree_node(cur, node_id, ctx.family_id,
                                          exclude_member_id=member_id)
                if err:
                    conn.rollback()
                    return {'error': err}
                fields.append('tree_node_id = %s')
                params.append(node_id)

        if wants_role_change:
            new_role = str(data['access_role'])
            ag.require_permission(ctx, 'family_members', 'manage_roles')

            # Самоповышение — самый дешёвый способ эскалации, запрещаем явно.
            if is_self:
                ag.audit_denied(ctx, 'family_members', 'manage_roles',
                                'SELF_ROLE_CHANGE_DENIED',
                                resource_type='family_member', resource_id=member_id,
                                http_status=403)
                raise AuthError(403, 'PERMISSION_DENIED',
                                'Cannot change your own access role')

            if new_role not in ASSIGNABLE_ACCESS_ROLES:
                ag.audit_denied(ctx, 'family_members', 'manage_roles',
                                'ROLE_NOT_ASSIGNABLE',
                                resource_type='family_member', resource_id=member_id,
                                http_status=403)
                raise AuthError(403, 'PERMISSION_DENIED',
                                'This role cannot be assigned via API')

            # Роль владельца и администратора меняет только владелец.
            if target.get('access_role') == 'admin' or _is_owner_member(cur, target):
                ag.require_owner(ctx, 'family.manage_admins')

            fields.append('access_role = %s')
            params.append(new_role)

        # permissions JSONB больше не источник истины для доступа:
        # он сохраняется как пользовательская настройка отображения.
        if 'permissions' in data:
            fields.append('permissions = %s::jsonb')
            params.append(json.dumps(data['permissions']))

        profile = dict(target['profile_data']) if target.get('profile_data') else {}
        profile_changed = False
        for field in PROFILE_FIELDS:
            if field in data:
                profile[field] = data[field]
                profile_changed = True
        if profile_changed:
            fields.append('profile_data = %s::jsonb')
            params.append(json.dumps(profile, ensure_ascii=False))

        if not fields:
            conn.rollback()
            return {'error': 'Нет данных для обновления'}

        fields.append('updated_at = CURRENT_TIMESTAMP')
        params.extend([member_id, ctx.family_id])

        cur.execute(
            f"""UPDATE {SCHEMA}.family_members SET {', '.join(fields)}
                WHERE id = %s AND family_id = %s
                RETURNING id, name, role, relationship, avatar, points, level,
                          workload, age, birth_date, birth_time, account_type,
                          access_role, member_status, permissions, profile_data,
                          member_color""",
            tuple(params),
        )
        member = cur.fetchone()

        # Изменение возраста может выбить почву из-под уже выданного
        # согласия. Делаем это в ТОЙ ЖЕ транзакции: иначе между записью
        # новой даты и приостановкой сбора остаётся окно, в котором
        # данные собираются по основанию, которого больше нет.
        if age_change:
            _revalidate_consent_after_age_change(cur, ctx, member_id,
                                                 target, member, age_change)

        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    ag.audit_allowed(ctx, 'family_members',
                     'manage_roles' if wants_role_change else 'update',
                     resource_type='family_member', resource_id=member_id,
                     subject_member_id=member_id)
    return {'success': True, 'member': dict(member)}


def _age_band(age: Optional[int]) -> str:
    """
    Возрастная категория для модели согласия. Важна не сама дата, а
    переход через границу: до 14 решает представитель, с 14 — сам субъект.
    """
    if age is None:
        return 'unknown'
    if age < ag.SELF_CONSENT_AGE:
        return 'minor'
    if age < ag.ADULT_AGE:
        return 'teen'
    return 'adult'


def _apply_age_change(cur, ctx, target, data: Dict[str, Any],
                      fields: List[str], params: List[Any]) -> Optional[Dict[str, Any]]:
    """
    Правка даты рождения и возраста — привилегированное действие.

    Причина простая: возраст решает, кто вправе дать согласие за этого
    человека. Если взрослый может свободно указать ребёнку «14 лет»,
    правило о представительстве перестаёт что-либо значить, а если он
    может занизить возраст подростку — тот теряет право решать сам.

    Поэтому:
        свою дату правит сам участник;
        чужую — только тот, у кого есть право управлять участниками,
        и только если у участника нет собственного аккаунта.
    Человека с аккаунтом за него «состарить» или «омолодить» нельзя.
    """
    wants_birth_date = 'birthDate' in data
    wants_age = 'age' in data
    if not wants_birth_date and not wants_age:
        return None

    member_id = str(target['id'])
    is_self = bool(ctx.member_id and member_id == ctx.member_id)

    if not is_self:
        ag.require_permission(ctx, 'family_members', 'update')
        # У участника есть свой аккаунт — значит, он субъект решений
        # о себе, и дату рождения за него не переписывают.
        if target.get('user_id'):
            ag.audit_denied(ctx, 'family_members', 'update',
                            'BIRTH_DATE_CHANGE_DENIED',
                            resource_type='family_member', resource_id=member_id,
                            http_status=403)
            raise AuthError(403, 'BIRTH_DATE_CHANGE_DENIED')

    old_age = ag._member_age(dict(target))

    if wants_birth_date:
        fields.append('birth_date = %s')
        params.append(data['birthDate'] or None)
    if wants_age:
        fields.append('age = %s')
        params.append(data['age'])

    return {
        'old_age': old_age,
        'old_birth_date': target.get('birth_date'),
        'is_self': is_self,
    }


def _revalidate_consent_after_age_change(cur, ctx, member_id: str, target,
                                         member, age_change: Dict[str, Any]) -> None:
    """
    После изменения возраста перепроверяем возрастную модель.

    При смене возрастной категории действующее согласие приостанавливается
    (сбор выключается), но НЕ удаляется: запись — доказательство того,
    что согласие было. Возобновление требует нового решения того, кто
    теперь вправе его принять.
    """
    new_age = ag._member_age(dict(member))
    old_band = _age_band(age_change['old_age'])
    new_band = _age_band(new_age)
    band_changed = old_band != new_band

    suspended = False
    if band_changed:
        cur.execute(
            f"""UPDATE {SCHEMA}.location_consents
                   SET collection_enabled = false,
                       collection_disabled_at = NOW(),
                       collection_disabled_by_user_id = %s,
                       collection_disabled_reason = 'age_band_changed'
                 WHERE subject_member_id = %s AND status = 'active'
                   AND collection_enabled = true
             RETURNING id""",
            (ctx.user_id, member_id),
        )
        affected = [str(r['id']) for r in cur.fetchall()]
        suspended = bool(affected)
        for consent_id in affected:
            ag.log_consent_event(
                ctx, 'collection_disabled', consent_id=consent_id,
                subject_member_id=member_id,
                details={'reason': 'age_band_changed',
                         'old_age': age_change['old_age'], 'new_age': new_age,
                         'old_band': old_band, 'new_band': new_band,
                         'new_consent_required': True})

    cur.execute(
        f"""INSERT INTO {SCHEMA}.member_birth_date_changes
                (family_id, member_id, old_birth_date, new_birth_date,
                 old_age, new_age, age_band_changed, consent_suspended,
                 actor_user_id, actor_member_id, request_id, ip_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (ctx.family_id, member_id, age_change['old_birth_date'],
         member.get('birth_date'), age_change['old_age'], new_age,
         band_changed, suspended, ctx.user_id, ctx.member_id,
         ctx.request_id, ctx.ip_hash),
    )


def _is_owner_member(cur, target) -> bool:
    """Участник, привязанный к users.id владельца семьи."""
    if not target.get('user_id'):
        return False
    cur.execute(
        f"SELECT 1 FROM {SCHEMA}.families WHERE id = %s AND owner_user_id = %s",
        (target['family_id'], target['user_id']),
    )
    return cur.fetchone() is not None


def revoke_member(ctx, member_id: str) -> Dict[str, Any]:
    """
    Отзыв участника. Физического удаления нет: на участника ссылаются
    задачи, события, медицинские и финансовые записи. DELETE оставил бы
    осиротевшие данные и уничтожил бы историю.
    """
    ag.require_permission(ctx, 'family_members', 'delete')

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT id, family_id, user_id, access_role, member_status
                FROM {SCHEMA}.family_members WHERE id = %s""",
            (member_id,),
        )
        target = cur.fetchone()
        if not target:
            raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')
        ag.require_same_family(ctx, str(target['family_id']),
                               'family_member', member_id)

        if ctx.member_id and str(target['id']) == ctx.member_id:
            raise AuthError(403, 'PERMISSION_DENIED', 'Cannot revoke yourself')

        # Владельца нельзя отозвать: иначе активная семья останется
        # без владельца, что запрещено инвариантом families.
        if _is_owner_member(cur, target):
            ag.audit_denied(ctx, 'family_members', 'delete', 'OWNER_CANNOT_BE_REVOKED',
                            resource_type='family_member', resource_id=member_id,
                            http_status=403)
            raise AuthError(403, 'PERMISSION_DENIED', 'Family owner cannot be removed')

        # Удаление администратора — операция владельца.
        if target.get('access_role') == 'admin':
            ag.require_owner(ctx, 'family.manage_admins')

        # Нельзя отозвать последнего администратора семьи.
        cur.execute(
            f"""SELECT COUNT(*) AS c FROM {SCHEMA}.family_members
                WHERE family_id = %s AND access_role = 'admin'
                  AND COALESCE(member_status, 'active') = 'active' AND id <> %s""",
            (ctx.family_id, member_id),
        )
        if target.get('access_role') == 'admin' and cur.fetchone()['c'] == 0:
            raise AuthError(403, 'PERMISSION_DENIED',
                            'Cannot revoke the last administrator')

        cur.execute(
            f"""UPDATE {SCHEMA}.family_members
                SET member_status = 'revoked', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND family_id = %s""",
            (member_id, ctx.family_id),
        )

        # Полномочия отозванного участника прекращают действовать сразу.
        cur.execute(
            f"""UPDATE {SCHEMA}.member_guardianships
                SET revoked_at = (NOW() AT TIME ZONE 'UTC'),
                    revoke_reason = 'MEMBER_REVOKED', status = 'rejected'
                WHERE (guardian_member_id = %s OR dependent_member_id = %s)
                  AND revoked_at IS NULL""",
            (member_id, member_id),
        )
        conn.commit()
        cur.close()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    ag.audit_allowed(ctx, 'family_members', 'delete', reason_code='MEMBER_REVOKED',
                     resource_type='family_member', resource_id=member_id,
                     subject_member_id=member_id)
    return {'success': True, 'member_status': 'revoked'}


def get_global_stats() -> Dict[str, Any]:
    """
    Публичный счётчик для лендинга. Отдаёт только агрегаты и исключает
    заброшенные пустые пространства, чтобы статистика не завышалась.
    """
    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""
            SELECT COUNT(DISTINCT m.id)        AS total_users,
                   COUNT(DISTINCT m.family_id) AS total_families
            FROM {SCHEMA}.family_members m
            JOIN {SCHEMA}.families f ON f.id = m.family_id
            WHERE COALESCE(m.member_status, 'active') = 'active'
              AND COALESCE(f.space_status, 'active') = 'active'
            """
        )
        row = cur.fetchone()
        cur.close()
    finally:
        conn.close()
    return {
        'total_users': int(row['total_users']) if row else 0,
        'total_families': int(row['total_families']) if row else 0,
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return ag.preflight(event)

    params = event.get('queryStringParameters') or {}

    # Единственный публичный путь: агрегированная статистика.
    if params.get('action') == 'stats':
        return ag.json_response({'success': True, 'stats': get_global_stats()},
                                event=event)

    try:
        ctx = ag.require_session(event)
        ag.require_family_member(ctx)

        if method == 'GET':
            ag.require_permission(ctx, 'family_members', 'read')
            return ag.json_response(list_members(ctx), event=event)

        body = json.loads(event.get('body') or '{}')

        if method in ('POST', 'PUT'):
            action = body.get('action', 'add' if method == 'POST' else 'update')

            if action in ('update', 'update_permissions'):
                member_id = body.get('member_id') or body.get('id')
                if not member_id:
                    return ag.json_response({'error': 'Требуется ID участника'},
                                            status=400, event=event)
                return ag.json_response(update_member(ctx, str(member_id), body),
                                        event=event)

            if action in ('delete', 'delete_member', 'revoke'):
                member_id = body.get('member_id') or body.get('id')
                if not member_id:
                    return ag.json_response({'error': 'Требуется ID участника'},
                                            status=400, event=event)
                return ag.json_response(revoke_member(ctx, str(member_id)),
                                        event=event)

            if action == 'delete_all_duplicates':
                # Массовое удаление помеченных записей отключено намеренно.
                # Пометка [ДУБЛИКАТ] не доказывает, что запись безопасно
                # удалить: на неё могут ссылаться пользовательские данные.
                # Записи изолированы (member_status='duplicate_review')
                # и разбираются в member_duplicate_review вручную.
                ag.audit_denied(ctx, 'family_members', 'delete',
                                'BULK_DUPLICATE_DELETE_DISABLED', http_status=409)
                return ag.json_response(
                    {'error': 'Массовое удаление дубликатов отключено. '
                              'Записи изолированы и разбираются вручную.',
                     'reason_code': 'BULK_DUPLICATE_DELETE_DISABLED'},
                    status=409, event=event)

            return ag.json_response(add_member(ctx, body), status=201, event=event)

        if method == 'DELETE':
            member_id = params.get('id')
            if not member_id:
                return ag.json_response({'error': 'Требуется ID участника'},
                                        status=400, event=event)
            return ag.json_response(revoke_member(ctx, str(member_id)), event=event)

        return ag.json_response({'error': 'Метод не поддерживается'},
                                status=405, event=event)

    except AuthError as exc:
        return ag.error_response(exc, event)
    except (ValueError, TypeError) as exc:
        return ag.json_response({'error': 'Некорректные данные запроса'},
                                status=400, event=event)
    except Exception:
        # Текст исключения наружу не отдаём: он раскрывает структуру БД.
        return ag.json_response({'error': 'Внутренняя ошибка'},
                                status=500, event=event)

# redeploy marker: wave-3 authz