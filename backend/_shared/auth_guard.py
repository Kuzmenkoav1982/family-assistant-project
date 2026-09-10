"""
auth_guard — единый серверный модуль аутентификации и авторизации.

КАНОНИЧЕСКИЙ ИСТОЧНИК: backend/_shared/auth_guard.py
Копии лежат рядом с каждой функцией (платформа деплоит папку функции целиком).
Синхронизация: python3 backend/_shared/sync_auth_guard.py

────────────────────────────────────────────────────────────────────────────
ГЛАВНЫЙ ПРИНЦИП

Actor определяется ТОЛЬКО из серверно проверенной сессии (sessions.token).
Заголовок X-User-Id НИКОГДА не отвечает на вопрос "кто я".

На переходный период X-User-Id допустим исключительно как requested member —
"от имени какого доступного мне участника выполняется действие" — и всегда
проверяется через require_member_access(). Нет сессии → 401. Заголовок
указывает на недоступного участника → 403 + audit event.

ЗАПРЕЩЁННЫЙ ПАТТЕРН (это grace-period-уязвимость, а не миграция):

    if auth_token:
        actor = resolve_session(auth_token)
    else:
        actor = headers['X-User-Id']       # ← НЕТ

ДОПУСТИМЫЙ ПАТТЕРН:

    ctx = require_session(event)
    subject_member_id = resolve_requested_member(event, ctx)  # проверяет доступ

────────────────────────────────────────────────────────────────────────────
ЧЕТЫРЕ УРОВНЯ ПРОВЕРКИ

1. Authentication  — require_session()            кто выполняет запрос
2. RBAC            — require_permission()         может ли роль в принципе
3. Resource scope  — require_same_family()        объект принадлежит моей семье (IDOR/BOLA)
4. Relationship    — require_subject_access()     доступ к данным именно этого человека

Default deny: если проверка забыта — доступа нет, потому что данные грузятся
только после прохождения guard-а, а не наоборот.
"""

import hashlib
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'
DATABASE_URL = os.environ.get('DATABASE_URL')

# Соль для хеширования IP: PII в аудит не пишем, но нужна корреляция атак.
IP_HASH_SALT = os.environ.get('AUDIT_IP_SALT', 'authz-audit-v1')


# ============================================================
# ПОЛИТИКА ДОСТУПА — версионируемый источник истины в коде
# ============================================================
# Почему в коде, а не в таблице role_permissions:
#   - проходит code review и версионируется вместе с релизом;
#   - нельзя выдать себе права через уязвимый административный API;
#   - нет вопросов кеширования и поведения при недоступности БД;
#   - в инциденте видно, какая политика действовала в конкретном коммите.
# Таблицу вводим позже — когда понадобятся кастомные роли и индивидуальные
# исключения без релиза.
#
# permissions / granular_permissions JSONB как параллельный источник истины
# НЕ используются: только как сужающие индивидуальные ограничения (позже).

POLICY_VERSION = '2026-09-09.1'

# Действия: read | read_assigned | read_own | create | update | delete | export | manage
ROLE_POLICY: Dict[str, Dict[str, List[str]]] = {
    'admin': {
        # Администрирование пространства ≠ доступ к чувствительному содержимому.
        # admin НЕ получает автоматически health/finance всех участников.
        'family_members': ['read', 'create', 'update', 'delete', 'manage_roles'],
        'family_settings': ['read', 'update'],
        'memory':          ['read', 'create', 'update', 'delete'],
        'events':          ['read', 'create', 'update', 'delete'],
        'tasks':           ['read', 'create', 'update', 'delete'],
        'calendar':        ['read', 'create', 'update', 'delete'],
        'health':          ['read_own', 'read_assigned', 'create', 'update'],
        'medications':     ['read_own', 'read_assigned', 'create', 'update'],
        'children':        ['read', 'create', 'update', 'delete'],
        'finance':         ['read_own', 'read_assigned'],
        'geolocation':     ['read', 'update'],
        'documents':       ['read', 'create', 'update', 'delete'],
        'portfolio':       ['read', 'create', 'update'],
        'export':          ['export'],
        'shopping':        ['read', 'create', 'update', 'delete'],
        'trips':           ['read', 'create', 'update', 'delete'],
        'pets':            ['read', 'create', 'update', 'delete'],
        'nutrition':       ['read', 'create', 'update', 'delete'],
    },
    'parent': {
        'family_members': ['read'],
        'family_settings': ['read'],
        'memory':          ['read', 'create', 'update', 'delete'],
        'events':          ['read', 'create', 'update', 'delete'],
        'tasks':           ['read', 'create', 'update', 'delete'],
        'calendar':        ['read', 'create', 'update', 'delete'],
        'health':          ['read_own', 'read_assigned', 'create', 'update'],
        'medications':     ['read_own', 'read_assigned', 'create', 'update'],
        'children':        ['read', 'create', 'update'],
        'finance':         ['read_own', 'read_assigned', 'create', 'update'],
        'geolocation':     ['read', 'update'],
        'documents':       ['read', 'create', 'update'],
        'portfolio':       ['read', 'create', 'update'],
        'export':          ['export'],
        'shopping':        ['read', 'create', 'update', 'delete'],
        'trips':           ['read', 'create', 'update', 'delete'],
        'pets':            ['read', 'create', 'update', 'delete'],
        'nutrition':       ['read', 'create', 'update', 'delete'],
    },
    'guardian': {
        'family_members': ['read'],
        'memory':          ['read', 'create'],
        'events':          ['read', 'create'],
        'tasks':           ['read', 'create', 'update'],
        'calendar':        ['read'],
        # Только назначенный субъект — проверяется require_subject_access().
        'health':          ['read_own', 'read_assigned', 'create', 'update'],
        'medications':     ['read_own', 'read_assigned', 'create', 'update'],
        'children':        ['read'],
        'finance':         [],
        'geolocation':     ['read'],
        'documents':       ['read'],
        'portfolio':       ['read'],
        'export':          [],
        'shopping':        ['read', 'create'],
        'trips':           ['read'],
        'pets':            ['read', 'create', 'update'],
        'nutrition':       ['read'],
    },
    'viewer': {
        'family_members': ['read'],
        'memory':          ['read'],
        'events':          ['read'],
        'tasks':           ['read'],
        'calendar':        ['read'],
        'health':          ['read_own'],
        'medications':     ['read_own'],
        'children':        [],
        'finance':         [],
        'geolocation':     [],
        'documents':       [],
        'portfolio':       ['read'],
        'export':          [],
        'shopping':        ['read'],
        'trips':           ['read'],
        'pets':            ['read'],
        'nutrition':       ['read'],
    },
    'child': {
        'family_members': ['read'],
        'memory':          ['read', 'create_own', 'update_own'],
        'events':          ['read'],
        'tasks':           ['read', 'update_own'],
        'calendar':        ['read'],
        'health':          ['read_own'],
        'medications':     ['read_own'],
        'children':        ['read_own'],
        'finance':         [],
        'geolocation':     [],
        'documents':       [],
        'portfolio':       ['read_own'],
        'export':          [],
        'shopping':        ['read'],
        'trips':           ['read'],
        'pets':            ['read'],
        'nutrition':       ['read'],
    },
}

# Полномочия владельца пространства. Отделены от роли участника:
# владение — свойство семьи (families.owner_user_id), не access_role.
OWNER_ONLY_ACTIONS = frozenset({
    'family.delete',
    'family.transfer_ownership',
    'family.full_export',
    'family.manage_admins',
})

SENSITIVE_MODULES = frozenset({
    'health', 'medications', 'children', 'finance',
    'geolocation', 'documents', 'portfolio', 'export', 'family_members',
})


# ============================================================
# ОШИБКИ
# ============================================================

class AuthError(Exception):
    """Единый формат отказа. status: 401 (не аутентифицирован) / 403 (запрещено)."""

    def __init__(self, status: int, reason_code: str, message: Optional[str] = None):
        self.status = status
        self.reason_code = reason_code
        self.message = message or _DEFAULT_MESSAGES.get(reason_code, 'Access denied')
        super().__init__(self.message)


_DEFAULT_MESSAGES = {
    'NO_SESSION_TOKEN': 'Authentication required',
    'SESSION_INVALID': 'Session expired or invalid',
    'NOT_FAMILY_MEMBER': 'User is not a member of any family',
    'MEMBER_INACTIVE': 'Membership is not active',
    'PERMISSION_DENIED': 'Operation not allowed for your role',
    'CROSS_FAMILY_ACCESS': 'Resource does not belong to your family',
    'SUBJECT_ACCESS_DENIED': 'No access to this person data',
    'IMPERSONATION_DENIED': 'Requested member is not accessible',
    'OWNER_REQUIRED': 'Only family owner can perform this action',
    'ADMIN_REQUIRED': 'Administrator rights required',
}


# ============================================================
# КОНТЕКСТ ЗАПРОСА (неизменяемый)
# ============================================================

class AuthContext:
    """
    Все поля получены из проверенной сессии и актуальных записей БД.
    НИ ОДНО поле не берётся из клиентских family_id / user_id / role.
    """

    __slots__ = ('session_id', 'user_id', 'family_id', 'member_id', 'role',
                 'is_owner', 'member_status', 'request_id', 'ip_hash',
                 'user_agent_family', '_guardian_scopes')

    def __init__(self, session_id, user_id, family_id, member_id, role,
                 is_owner, member_status, request_id, ip_hash, user_agent_family):
        object.__setattr__(self, 'session_id', session_id)
        object.__setattr__(self, 'user_id', user_id)
        object.__setattr__(self, 'family_id', family_id)
        object.__setattr__(self, 'member_id', member_id)
        object.__setattr__(self, 'role', role)
        object.__setattr__(self, 'is_owner', is_owner)
        object.__setattr__(self, 'member_status', member_status)
        object.__setattr__(self, 'request_id', request_id)
        object.__setattr__(self, 'ip_hash', ip_hash)
        object.__setattr__(self, 'user_agent_family', user_agent_family)
        object.__setattr__(self, '_guardian_scopes', None)

    def __setattr__(self, *_):
        raise AttributeError('AuthContext is immutable')

    def __delattr__(self, *_):
        raise AttributeError('AuthContext is immutable')

    def capabilities(self) -> Dict[str, List[str]]:
        """Права для UI. Фронт использует только для отображения."""
        caps = {m: list(a) for m, a in ROLE_POLICY.get(self.role, {}).items()}
        if self.is_owner:
            caps['family_owner'] = sorted(OWNER_ONLY_ACTIONS)
        return caps

    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'family_id': self.family_id,
            'member_id': self.member_id,
            'role': self.role,
            'is_owner': self.is_owner,
            'policy_version': POLICY_VERSION,
            'capabilities': self.capabilities(),
        }


# ============================================================
# ИНФРАСТРУКТУРА
# ============================================================

def _connect():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def _headers_lower(event: Dict[str, Any]) -> Dict[str, str]:
    raw = event.get('headers') or {}
    return {str(k).lower(): v for k, v in raw.items() if v is not None}


def _hash_ip(ip: Optional[str]) -> Optional[str]:
    if not ip:
        return None
    return hashlib.sha256((IP_HASH_SALT + ip).encode()).hexdigest()[:32]


def _ua_family(ua: Optional[str]) -> Optional[str]:
    """Только семейство браузера — не полный User-Agent (это отпечаток)."""
    if not ua:
        return None
    low = ua.lower()
    for name, marker in (('Edge', 'edg/'), ('Chrome', 'chrome'), ('Firefox', 'firefox'),
                         ('Safari', 'safari'), ('Bot', 'bot'), ('Curl', 'curl')):
        if marker in low:
            return name
    return 'Other'


def _is_uuid(value: Any) -> bool:
    try:
        uuid.UUID(str(value))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


# ============================================================
# 1. АУТЕНТИФИКАЦИЯ
# ============================================================

def _extract_token(event: Dict[str, Any]) -> Optional[str]:
    """
    Токен сессии. Порядок: X-Auth-Token → Authorization: Bearer → X-Authorization.
    X-User-Id здесь НЕ рассматривается — это не средство аутентификации.
    """
    h = _headers_lower(event)
    token = h.get('x-auth-token')
    if token:
        return str(token).strip()
    for key in ('authorization', 'x-authorization'):
        raw = h.get(key)
        if raw:
            raw = str(raw).strip()
            return raw[7:].strip() if raw.lower().startswith('bearer ') else raw
    return None


def require_session(event: Dict[str, Any]) -> AuthContext:
    """
    Единственный законный способ узнать, кто выполняет запрос.

    Один SQL-запрос собирает сессию + участника + роль + владение.
    Бросает AuthError(401) если сессии нет или она просрочена.
    """
    h = _headers_lower(event)
    request_id = (h.get('x-request-id') or str(uuid.uuid4()))[:64]
    ip_hash = _hash_ip(h.get('x-forwarded-for', '').split(',')[0].strip() or h.get('x-real-ip'))
    ua_family = _ua_family(h.get('user-agent'))

    token = _extract_token(event)
    if not token:
        _audit_denial(None, None, None, None, 'auth', 'authenticate',
                      'NO_SESSION_TOKEN', 401, request_id, ip_hash, ua_family)
        raise AuthError(401, 'NO_SESSION_TOKEN')

    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""
            SELECT s.id            AS session_id,
                   s.user_id       AS user_id,
                   fm.id           AS member_id,
                   fm.family_id    AS family_id,
                   fm.access_role  AS role,
                   fm.member_status AS member_status,
                   (f.owner_user_id = s.user_id) AS is_owner
            FROM {SCHEMA}.sessions s
            LEFT JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
            LEFT JOIN {SCHEMA}.families f        ON f.id = fm.family_id
            WHERE s.token = %s
              AND s.expires_at > CURRENT_TIMESTAMP
            ORDER BY (fm.access_role = 'admin') DESC, fm.created_at ASC
            LIMIT 1
            """,
            (token,),
        )
        row = cur.fetchone()
        cur.close()
    finally:
        conn.close()

    if not row:
        _audit_denial(None, None, None, None, 'auth', 'authenticate',
                      'SESSION_INVALID', 401, request_id, ip_hash, ua_family)
        raise AuthError(401, 'SESSION_INVALID')

    status = row.get('member_status') or 'active'
    if row.get('member_id') and status not in ('active', None):
        _audit_denial(str(row['user_id']), None, None, None, 'auth', 'authenticate',
                      'MEMBER_INACTIVE', 403, request_id, ip_hash, ua_family)
        raise AuthError(403, 'MEMBER_INACTIVE')

    return AuthContext(
        session_id=str(row['session_id']),
        user_id=str(row['user_id']),
        family_id=str(row['family_id']) if row.get('family_id') else None,
        member_id=str(row['member_id']) if row.get('member_id') else None,
        role=row.get('role') or 'viewer',
        is_owner=bool(row.get('is_owner')),
        member_status=status,
        request_id=request_id,
        ip_hash=ip_hash,
        user_agent_family=ua_family,
    )


def require_family_member(ctx: AuthContext) -> str:
    """Действие требует принадлежности к семье. Возвращает family_id."""
    if not ctx.family_id or not ctx.member_id:
        _audit(ctx, 'family', 'access', 'denied', 'NOT_FAMILY_MEMBER', http_status=403)
        raise AuthError(403, 'NOT_FAMILY_MEMBER')
    return ctx.family_id


# ============================================================
# 2. RBAC
# ============================================================

def has_permission(ctx: AuthContext, module: str, action: str) -> bool:
    allowed = ROLE_POLICY.get(ctx.role, {}).get(module, [])
    if action in allowed:
        return True
    # read покрывается read_own/read_assigned только на уровне субъекта,
    # поэтому здесь никаких неявных расширений: default deny.
    return False


def require_permission(ctx: AuthContext, module: str, action: str) -> None:
    if not has_permission(ctx, module, action):
        _audit(ctx, module, action, 'denied', 'PERMISSION_DENIED', http_status=403)
        raise AuthError(403, 'PERMISSION_DENIED')


def require_owner(ctx: AuthContext, action: str = 'family.manage') -> None:
    """Владелец пространства — свойство семьи, а не роль участника."""
    if not ctx.is_owner:
        _audit(ctx, 'family', action, 'denied', 'OWNER_REQUIRED', http_status=403)
        raise AuthError(403, 'OWNER_REQUIRED')


def require_admin(ctx: AuthContext, action: str = 'family.administer') -> None:
    """Owner всегда проходит: он может одновременно иметь роль admin."""
    if ctx.role != 'admin' and not ctx.is_owner:
        _audit(ctx, 'family', action, 'denied', 'ADMIN_REQUIRED', http_status=403)
        raise AuthError(403, 'ADMIN_REQUIRED')


# ============================================================
# 3. RESOURCE SCOPE — защита от IDOR / BOLA
# ============================================================

def require_same_family(ctx: AuthContext, resource_family_id: Optional[str],
                        resource_type: str = 'resource',
                        resource_id: Optional[str] = None) -> None:
    """
    Главная защита от подмены идентификатора объекта в запросе.
    Вызывается ПОСЛЕ загрузки объекта и ДО отдачи его клиенту.
    """
    family_id = require_family_member(ctx)
    if not resource_family_id or str(resource_family_id) != family_id:
        _audit(ctx, resource_type, 'access', 'denied', 'CROSS_FAMILY_ACCESS',
               resource_type=resource_type, resource_id=resource_id, http_status=404)
        # 404, а не 403: не подтверждаем существование чужого объекта.
        raise AuthError(404, 'CROSS_FAMILY_ACCESS', 'Not found')


# ============================================================
# 4. RELATIONSHIP / ABAC — доступ к данным конкретного человека
# ============================================================

def _load_guardian_scopes(ctx: AuthContext) -> Dict[str, List[str]]:
    """dependent_member_id -> scopes. Кешируется на время запроса."""
    cached = object.__getattribute__(ctx, '_guardian_scopes')
    if cached is not None:
        return cached
    scopes: Dict[str, List[str]] = {}
    if ctx.member_id:
        conn = _connect()
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                f"""
                SELECT dependent_member_id, scopes
                FROM {SCHEMA}.member_guardianships
                WHERE guardian_member_id = %s
                  AND family_id = %s
                  AND revoked_at IS NULL
                """,
                (ctx.member_id, ctx.family_id),
            )
            for r in cur.fetchall():
                scopes[str(r['dependent_member_id'])] = list(r['scopes'] or [])
            cur.close()
        finally:
            conn.close()
    object.__setattr__(ctx, '_guardian_scopes', scopes)
    return scopes


def can_access_subject(ctx: AuthContext, subject_member_id: Optional[str],
                       module: str = 'health') -> Tuple[bool, str]:
    """
    Возвращает (разрешено, reason_code).

    Правила по чувствительным модулям:
      - свои данные — всегда;
      - явная связь опекунства с нужным scope — да;
      - admin БЕЗ явной связи — нет (администрирование ≠ доступ к содержимому);
      - parent БЕЗ явной связи — нет (см. ниже);
      - viewer / child к чужим данным — нет.

    ПОЧЕМУ РОЛЬ 'parent' БОЛЬШЕ НЕ ОТКРЫВАЕТ ДЕТЕЙ СЕМЬИ АВТОМАТИЧЕСКИ.
    access_role в этой БД исторически смешивает семейное ОТНОШЕНИЕ и
    ПОЛНОМОЧИЕ. Миграция editor -> parent (V0376) выдала роль 'parent'
    в том числе 12-летнему участнику с role='Сын' — он получил бы доступ
    к медданным младшего брата. Родство нельзя выводить из строки роли.

    Теперь субъект определяется только адресной записью в
    member_guardianships (V0377 проставила их для реальных родителей).
    Когда появится family_relationships со status='confirmed',
    подтверждённое родство добавится сюда как второй явный источник.
    """
    if not subject_member_id:
        return False, 'SUBJECT_ACCESS_DENIED'
    subject_member_id = str(subject_member_id)

    if ctx.member_id and subject_member_id == ctx.member_id:
        return True, 'SELF'

    if module not in SENSITIVE_MODULES:
        # Не-чувствительный модуль всё равно требует общей семьи:
        # can_access_subject не заменяет require_same_family, но и не должен
        # разрешать субъекта из чужого пространства.
        subject = _load_member(subject_member_id)
        if not subject or str(subject.get('family_id')) != ctx.family_id:
            return False, 'CROSS_FAMILY_SUBJECT'
        return True, 'NON_SENSITIVE_MODULE'

    guardianships = _load_guardian_scopes(ctx)
    scopes = guardianships.get(subject_member_id)
    if scopes is not None and (module in scopes or 'all' in scopes):
        return True, 'ASSIGNED_GUARDIAN'

    return False, 'SUBJECT_ACCESS_DENIED'


def require_subject_access(ctx: AuthContext, subject_member_id: Optional[str],
                           module: str = 'health',
                           resource_type: Optional[str] = None,
                           resource_id: Optional[str] = None) -> str:
    allowed, reason = can_access_subject(ctx, subject_member_id, module)
    if not allowed:
        _audit(ctx, module, 'read', 'denied', reason,
               resource_type=resource_type, resource_id=resource_id,
               subject_member_id=subject_member_id if _is_uuid(subject_member_id) else None,
               http_status=403)
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')
    return reason


def accessible_subject_ids(ctx: AuthContext, module: str = 'health') -> List[str]:
    """
    Для массовых списков: набор member_id, чьи данные актор вправе видеть.
    Так list-эндпоинты не возвращают чужие записи.
    """
    result = set()
    if ctx.member_id:
        result.add(ctx.member_id)
    for dep, scopes in _load_guardian_scopes(ctx).items():
        if module in (scopes or []) or 'all' in (scopes or []):
            result.add(dep)
    # Роль 'parent' НЕ расширяет набор субъектов: см. can_access_subject.
    # Список строится только из себя + адресных опекунств, поэтому
    # list-эндпоинты физически не могут вернуть чужого ребёнка.
    return sorted(result)


def _load_member(member_id: str) -> Optional[Dict[str, Any]]:
    if not _is_uuid(member_id):
        return None
    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT id, family_id, user_id, access_role, account_type, member_status
                FROM {SCHEMA}.family_members WHERE id = %s""",
            (member_id,),
        )
        row = cur.fetchone()
        cur.close()
        return dict(row) if row else None
    finally:
        conn.close()


# ============================================================
# ПЕРЕХОДНЫЙ X-User-Id — только как requested member
# ============================================================

def resolve_requested_member(event: Dict[str, Any], ctx: AuthContext,
                             module: str = 'health') -> str:
    """
    X-User-Id означает "от имени какого доступного мне участника действую",
    и НИКОГДА — "кто я".

    Нет заголовка → собственный member_id из сессии.
    Заголовок указывает на недоступного участника → 403 + audit event.
    После миграции фронта функция и заголовок удаляются целиком.
    """
    h = _headers_lower(event)
    requested = h.get('x-user-id')

    if not requested:
        return require_family_member(ctx) and ctx.member_id

    requested = str(requested).strip()

    # Клиент мог прислать users.id вместо family_members.id — исторический разнобой.
    if ctx.member_id and requested == ctx.user_id:
        return ctx.member_id

    if not _is_uuid(requested):
        _audit(ctx, module, 'impersonate', 'denied', 'IMPERSONATION_DENIED', http_status=403)
        raise AuthError(403, 'IMPERSONATION_DENIED')

    subject = _load_member(requested)
    if not subject or str(subject.get('family_id')) != ctx.family_id:
        _audit(ctx, module, 'impersonate', 'denied', 'CROSS_FAMILY_ACCESS', http_status=403)
        raise AuthError(403, 'IMPERSONATION_DENIED')

    require_subject_access(ctx, requested, module=module)
    return requested


# ============================================================
# АУДИТ — решения авторизации, без содержимого данных
# ============================================================
# Записываем: кто, где, что, результат, причину.
# НЕ записываем: диагнозы, тексты, показатели, реквизиты, токены, тела запросов.

_AUDIT_ENABLED = os.environ.get('AUTHZ_AUDIT_ENABLED', '1') != '0'


def _audit(ctx: Optional[AuthContext], module: str, action: str, result: str,
           reason_code: str, resource_type: Optional[str] = None,
           resource_id: Optional[str] = None, subject_member_id: Optional[str] = None,
           http_status: Optional[int] = None) -> None:
    if not _AUDIT_ENABLED:
        return
    try:
        conn = _connect()
        try:
            cur = conn.cursor()
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.authz_audit_log
                    (occurred_at, request_id, actor_user_id, actor_member_id, family_id,
                     actor_role, module, action, resource_type, resource_id,
                     subject_member_id, result, reason_code, http_status,
                     ip_hash, user_agent_family)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    datetime.now(timezone.utc).replace(tzinfo=None),
                    ctx.request_id if ctx else None,
                    ctx.user_id if ctx else None,
                    ctx.member_id if ctx else None,
                    ctx.family_id if ctx else None,
                    ctx.role if ctx else None,
                    module, action,
                    resource_type, str(resource_id) if resource_id else None,
                    subject_member_id,
                    result, reason_code, http_status,
                    ctx.ip_hash if ctx else None,
                    ctx.user_agent_family if ctx else None,
                ),
            )
            cur.close()
        finally:
            conn.close()
    except Exception as exc:  # аудит не должен ломать запрос
        print(f'[authz-audit] write failed: {exc}')


def _audit_denial(user_id, member_id, family_id, role, module, action,
                  reason_code, http_status, request_id, ip_hash, ua_family) -> None:
    """Отказ до построения контекста (нет сессии)."""
    if not _AUDIT_ENABLED:
        return
    try:
        conn = _connect()
        try:
            cur = conn.cursor()
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.authz_audit_log
                    (occurred_at, request_id, actor_user_id, actor_member_id, family_id,
                     actor_role, module, action, result, reason_code, http_status,
                     ip_hash, user_agent_family)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'denied', %s, %s, %s, %s)
                """,
                (datetime.now(timezone.utc).replace(tzinfo=None), request_id,
                 user_id, member_id, family_id, role, module, action,
                 reason_code, http_status, ip_hash, ua_family),
            )
            cur.close()
        finally:
            conn.close()
    except Exception as exc:
        print(f'[authz-audit] write failed: {exc}')


def audit_allowed(ctx: AuthContext, module: str, action: str, reason_code: str = 'POLICY_ALLOW',
                  resource_type: Optional[str] = None, resource_id: Optional[str] = None,
                  subject_member_id: Optional[str] = None) -> None:
    """
    Явное журналирование разрешённого доступа к чувствительным данным.
    Для нечувствительных модулей не вызываем — иначе журнал растёт быстрее базы.
    """
    if module in SENSITIVE_MODULES:
        _audit(ctx, module, action, 'allowed', reason_code,
               resource_type=resource_type, resource_id=resource_id,
               subject_member_id=subject_member_id, http_status=200)


# ============================================================
# HTTP-ХЕЛПЕРЫ — единый формат ответов
# ============================================================

def cors_headers(event: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
    origin = 'https://nasha-semiya.ru'
    if event:
        h = _headers_lower(event)
        candidate = h.get('origin')
        if candidate and (candidate.endswith('nasha-semiya.ru')
                          or candidate.startswith('http://localhost')
                          or candidate.endswith('.poehali.dev')):
            origin = candidate
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id, Authorization, X-Authorization, X-Request-Id',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin',
    }


def preflight(event: Dict[str, Any]) -> Dict[str, Any]:
    return {'statusCode': 200, 'headers': cors_headers(event), 'body': '', 'isBase64Encoded': False}


def error_response(exc: AuthError, event: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Единый формат 401/403/404. Сообщение не раскрывает существование объектов."""
    return {
        'statusCode': exc.status,
        'headers': cors_headers(event),
        'body': json.dumps({'success': False, 'error': exc.message, 'reason': exc.reason_code}),
        'isBase64Encoded': False,
    }


def json_response(payload: Any, status: int = 200,
                  event: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': cors_headers(event),
        'body': json.dumps(payload, default=str),
        'isBase64Encoded': False,
    }