# ============================================================
# АВТОСГЕНЕРИРОВАННАЯ КОПИЯ — НЕ РЕДАКТИРОВАТЬ
# Источник: backend/_shared/auth_guard.py
# Обновление: python3 backend/_shared/sync_auth_guard.py
# ============================================================
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

POLICY_VERSION = '2026-09-11.2'

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
        # Геолокация НЕ даётся по названию роли: только свои координаты
        # и координаты тех, на кого есть подтверждённая связь со scope
        # 'geolocation'. См. can_access_subject / LOCATION_MODULES.
        'geolocation':     ['read_own', 'read_assigned', 'update'],
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
        # Роль 'parent' в этой БД смешивает отношение и полномочие (V0376
        # выдала её 12-летнему участнику). Автодоступ к чужим координатам
        # по роли закрыт — нужна адресная подтверждённая связь.
        'geolocation':     ['read_own', 'read_assigned', 'update'],
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
        'geolocation':     ['read_own', 'read_assigned'],
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

# Необратимые операции над пространством. Требуют не просто владельца,
# а ПОДТВЕРЖДЁННОГО владельца: 1 семья получила owner_user_id правилом
# «самый ранний admin» (V0376) — это технический fallback, а не
# доказательство владения.
IRREVERSIBLE_OWNER_ACTIONS = frozenset({
    'family.delete',
    'family.transfer_ownership',
    'family.full_export',
    'family.purge_members',
    'family.change_consents',
})

# Состояния участника, при которых он не является актором и не может
# быть субъектом чувствительных данных.
NON_PARTICIPATING_MEMBER_STATUSES = frozenset({
    'revoked',
    'pending',
    'duplicate_review',
})

# Состояния пространства, в которых работа через API запрещена.
NON_OPERATIONAL_SPACE_STATUSES = frozenset({
    'abandoned_empty',
    'archived',
})

# Что даёт связь опекунства, созданная миграцией и ещё не подтверждённая
# человеком: НИЧЕГО, кроме факта «требуется подтверждение».
#
# Раньше здесь было исключение — pending-связь давала read по
# health/medications/children. Это неверно: родство, выведенное из роли
# и возраста, — гипотеза, а не право. Гипотеза не открывает медданные
# несовершеннолетнего даже на чтение. Пустой набор оставлен явным
# (а не удалён), чтобы попытка вернуть исключение была видна в diff.
PENDING_GUARDIANSHIP_SCOPES: frozenset = frozenset()
PENDING_GUARDIANSHIP_ACTIONS: frozenset = frozenset()

# Единственное, что доступно до подтверждения: узнать, что подтверждение
# требуется, и запросить его. Никаких данных субъекта.
PENDING_ALLOWED_ACTIONS = frozenset({
    'guardianship.show_pending',
    'guardianship.request_confirmation',
})

# Модули с раздельными правами чтения и записи. Подтверждённая связь
# несёт scopes вида 'health:read' / 'health:write'; для совместимости
# с выданными ранее связями принимается и голое имя модуля.
SCOPED_MODULES = frozenset({
    'health', 'medications', 'calendar', 'children',
    'documents', 'portfolio', 'geolocation', 'export', 'finance',
})

WRITE_ACTIONS = frozenset({'create', 'update', 'delete', 'manage', 'export'})

# Геолокация — отдельный scope, который НИКОГДА не подразумевается другими.
# 'all' его не покрывает: согласие на здоровье ребёнка не есть согласие
# на слежение за его перемещениями.
LOCATION_MODULES = frozenset({'geolocation'})


# ============================================================
# ВЫКЛЮЧАТЕЛЬ ГЕОЛОКАЦИИ (SEC-2026-001)
# ============================================================
# Уязвимости закрыты, но геолокация остаётся выключенной до появления
# отдельного согласия на перемещения и интерфейса управления доступом.
# Модель данных согласия готова (member_guardianships.location_consent_*),
# UI — нет. Пока человек не может увидеть и отозвать доступ к своим
# перемещениям, собирать их мы не вправе.
#
# Выключатель живёт в БД (feature_flags), а не в коде фронта: тот, кто
# соберёт фронт заново, не должен случайно включить сбор координат.
# Проверка стоит внутри guard-а, то есть на единственном законном входе
# к геоданным — обойти её, забыв про флаг в новой функции, нельзя.

GEO_COLLECTION_FLAG = 'geolocation_collection_enabled'
GEO_HISTORY_FLAG = 'geolocation_history_enabled'

# Кеш на процесс: флаг меняется решением человека, а не в ходе запроса.
_geo_flag_cache: Dict[str, bool] = {}


def geo_flag_enabled(flag_key: str) -> bool:
    """
    Отсутствие флага, ошибка БД или пустой ответ трактуются как ВЫКЛЮЧЕНО.
    Fail-closed здесь обязателен: недоступность базы не должна быть
    способом снова включить сбор координат.
    """
    if flag_key in _geo_flag_cache:
        return _geo_flag_cache[flag_key]
    enabled = False
    try:
        conn = _connect()
        try:
            cur = conn.cursor()
            cur.execute(
                f'SELECT is_enabled FROM {SCHEMA}.feature_flags WHERE flag_key = %s',
                (flag_key,),
            )
            row = cur.fetchone()
            enabled = bool(row[0]) if row else False
        finally:
            conn.close()
    except Exception as exc:  # noqa: BLE001
        print(f'[auth_guard] geo flag {flag_key} unreadable, '
              f'treating as disabled: {type(exc).__name__}')
        enabled = False
    _geo_flag_cache[flag_key] = enabled
    return enabled


def require_geo_enabled(flag_key: str = GEO_COLLECTION_FLAG) -> None:
    """Отказ 503, а не 403: это не «вам нельзя», а «функция приостановлена»."""
    if not geo_flag_enabled(flag_key):
        raise AuthError(503, 'GEOLOCATION_DISABLED')


# ============================================================
# СОГЛАСИЕ НА ОБРАБОТКУ ГЕОДАННЫХ (152-ФЗ)
# ============================================================
# Согласие и доступ — РАЗНЫЕ вещи, и путать их нельзя:
#
#   согласие субъекта   → системе разрешено СОБИРАТЬ его местоположение
#   scope 'geolocation' → конкретному человеку разрешено его СМОТРЕТЬ
#
# Согласие без получателя не открывает координаты никому. Наличие scope
# без согласия субъекта — тоже отказ: право смотреть не создаёт права
# собирать.
#
# ВОЗРАСТНАЯ МОДЕЛЬ (требует утверждения юристом):
#   младше 14  — согласие даёт ПОДТВЕРЖДЁННЫЙ законный представитель;
#   14 и старше — только сам субъект, представитель может лишь запросить;
#   возраст неизвестен — сбор не начинается вообще.
#
# Почему не доверяем роли: access_role в этой БД смешивает семейное
# отношение и полномочие — V0376 выдала роль 'parent' 12-летнему
# участнику. Поэтому законное представительство подтверждается отдельной
# записью в legal_representatives, а не выводится из строки роли.

SELF_CONSENT_AGE = 14

# Операции над геоданными, требующие согласия.
GEO_OP_COLLECT = 'collect'   # записать новую точку
GEO_OP_VIEW = 'view'         # посмотреть положение/историю


def _member_age(member: Optional[Dict[str, Any]]) -> Optional[int]:
    """
    Возраст по birth_date, иначе по полю age. None = возраст неизвестен.

    Неизвестный возраст — не повод «считать взрослым»: именно так
    ребёнок и получает режим взрослого. Вызывающий код обязан
    трактовать None как запрет.
    """
    if not member:
        return None
    bd = member.get('birth_date')
    if bd:
        try:
            today = datetime.now(timezone.utc).date()
            return today.year - bd.year - ((today.month, today.day) < (bd.month, bd.day))
        except (AttributeError, TypeError, ValueError):
            pass
    age = member.get('age')
    try:
        return int(age) if age is not None else None
    except (TypeError, ValueError):
        return None


def load_active_location_consent(subject_member_id: str) -> Optional[Dict[str, Any]]:
    """Действующее согласие субъекта вместе со списком получателей."""
    if not _is_uuid(subject_member_id):
        return None
    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT id, family_id, subject_member_id, consent_role,
                       subject_age_at_grant, text_version, retention_days,
                       update_interval_seconds, data_scope, granted_at
                FROM {SCHEMA}.location_consents
                WHERE subject_member_id = %s AND status = 'active'
                LIMIT 1""",
            (str(subject_member_id),),
        )
        consent = cur.fetchone()
        if not consent:
            cur.close()
            return None
        consent = dict(consent)
        cur.execute(
            f"""SELECT recipient_member_id
                FROM {SCHEMA}.location_consent_recipients
                WHERE consent_id = %s AND revoked_at IS NULL""",
            (consent['id'],),
        )
        consent['recipients'] = [str(r['recipient_member_id']) for r in cur.fetchall()]
        cur.close()
        return consent
    finally:
        conn.close()


def _consent_still_valid(consent: Dict[str, Any], subject: Optional[Dict[str, Any]]) -> Tuple[bool, str]:
    """
    Согласие могло устареть по существу, оставаясь 'active' в БД.

    Главный случай: ребёнку исполнилось 14. Согласие, выданное за него
    представителем, с этого момента прекращает действие — решение должен
    принять он сам. Проверяем на каждом обращении, а не раз в сутки
    по расписанию: иначе между днём рождения и запуском задачи данные
    собирались бы без действующего основания.
    """
    age = _member_age(subject)
    if age is None:
        return False, 'LOCATION_AGE_UNKNOWN'
    if consent.get('consent_role') == 'legal_representative' and age >= SELF_CONSENT_AGE:
        return False, 'LOCATION_CONSENT_AGE_OUTGROWN'
    return True, 'CONSENT_VALID'


def require_location_consent(ctx: 'AuthContext', subject_member_id: Optional[str],
                             operation: str = GEO_OP_VIEW) -> Dict[str, Any]:
    """
    Проверяет, что на обработку геоданных субъекта есть действующее согласие.

    Вызывается ВНУТРИ require_location_access, то есть на единственном
    законном входе к геоданным. Новая гео-функция не может обойти
    согласие, просто забыв о нём.

    operation:
        GEO_OP_COLLECT — записать новую точку. Достаточно согласия субъекта.
        GEO_OP_VIEW    — посмотреть. Нужно согласие субъекта И то, что
                         смотрящий указан получателем (или это сам субъект).
    """
    if not subject_member_id:
        raise AuthError(403, 'LOCATION_CONSENT_REQUIRED')
    subject_member_id = str(subject_member_id)

    consent = load_active_location_consent(subject_member_id)
    if not consent:
        _audit(ctx, 'geolocation', operation, 'denied', 'LOCATION_CONSENT_REQUIRED',
               resource_type='location_consent', subject_member_id=subject_member_id,
               http_status=403)
        raise AuthError(403, 'LOCATION_CONSENT_REQUIRED')

    subject = _load_member(subject_member_id)
    valid, reason = _consent_still_valid(consent, subject)
    if not valid:
        _audit(ctx, 'geolocation', operation, 'denied', reason,
               resource_type='location_consent', resource_id=str(consent['id']),
               subject_member_id=subject_member_id, http_status=403)
        raise AuthError(403, reason)

    # Просмотр чужого положения требует, чтобы субъект назвал смотрящего
    # получателем. Согласие «собирать» не равно согласию «показывать всем».
    if operation == GEO_OP_VIEW and ctx.member_id != subject_member_id:
        if ctx.member_id not in (consent.get('recipients') or []):
            _audit(ctx, 'geolocation', operation, 'denied', 'LOCATION_RECIPIENT_NOT_ALLOWED',
                   resource_type='location_consent', resource_id=str(consent['id']),
                   subject_member_id=subject_member_id, http_status=403)
            raise AuthError(403, 'LOCATION_RECIPIENT_NOT_ALLOWED')

    return consent


def consent_eligibility(subject: Optional[Dict[str, Any]],
                        actor_member_id: Optional[str]) -> Dict[str, Any]:
    """
    Кто вправе дать согласие за этого субъекта. Используется UI и API
    выдачи согласия, чтобы решение принималось на сервере, а не на клиенте.

    Возвращает: allowed (bool), required_role, reason.
    """
    age = _member_age(subject)
    if age is None:
        return {'allowed': False, 'required_role': None,
                'reason': 'LOCATION_AGE_UNKNOWN'}

    subject_id = str(subject.get('id')) if subject else None
    is_self = actor_member_id is not None and actor_member_id == subject_id

    if age >= SELF_CONSENT_AGE:
        # С 14 лет решает только сам субъект. Родитель может прислать
        # запрос, но не подтвердить его за подростка.
        return {'allowed': is_self, 'required_role': 'self',
                'reason': 'SELF_CONSENT_ONLY' if not is_self else 'OK'}

    # Младше 14: нужен ПОДТВЕРЖДЁННЫЙ законный представитель.
    if is_self:
        return {'allowed': False, 'required_role': 'legal_representative',
                'reason': 'REPRESENTATIVE_CONSENT_REQUIRED'}
    if not actor_member_id or not subject_id:
        return {'allowed': False, 'required_role': 'legal_representative',
                'reason': 'REPRESENTATIVE_CONSENT_REQUIRED'}

    conn = _connect()
    try:
        cur = conn.cursor()
        cur.execute(
            f"""SELECT 1 FROM {SCHEMA}.legal_representatives
                WHERE representative_member_id = %s
                  AND dependent_member_id = %s
                  AND status = 'confirmed'
                  AND revoked_at IS NULL""",
            (actor_member_id, subject_id),
        )
        confirmed = cur.fetchone() is not None
        cur.close()
    finally:
        conn.close()

    return {'allowed': confirmed, 'required_role': 'legal_representative',
            'reason': 'OK' if confirmed else 'LEGAL_REPRESENTATIVE_NOT_CONFIRMED'}


def log_consent_event(ctx: Optional['AuthContext'], action: str,
                      consent_id: Optional[str] = None,
                      subject_member_id: Optional[str] = None,
                      text_version: Optional[str] = None,
                      details: Optional[Dict[str, Any]] = None) -> None:
    """
    Журнал решений по согласию. Пишется всегда, включая отказы —
    именно он отвечает на вопрос «докажите, что согласие было».
    """
    try:
        conn = _connect()
        try:
            cur = conn.cursor()
            cur.execute(
                f"""INSERT INTO {SCHEMA}.location_consent_events
                        (consent_id, subject_member_id, family_id, action,
                         actor_user_id, actor_member_id, actor_role,
                         text_version, details, request_id, ip_hash,
                         user_agent_family)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (consent_id, subject_member_id,
                 ctx.family_id if ctx else None, action,
                 ctx.user_id if ctx else None,
                 ctx.member_id if ctx else None,
                 ctx.role if ctx else None,
                 text_version, json.dumps(details or {}),
                 ctx.request_id if ctx else None,
                 ctx.ip_hash if ctx else None,
                 ctx.user_agent_family if ctx else None),
            )
            cur.close()
        finally:
            conn.close()
    except Exception as exc:  # noqa: BLE001 — журнал не должен ломать запрос
        print(f'[location-consent] event log failed: {type(exc).__name__}')


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
    'OWNERSHIP_UNCONFIRMED': 'Ownership must be confirmed before this action',
    'SPACE_NOT_OPERATIONAL': 'This family space is not operational',
    'SUBJECT_NOT_ACTIVE': 'Member record is not active',
    'SUBJECT_SCOPE_DENIED': 'No access to this data category',
    'GUARDIANSHIP_PENDING_SCOPE': 'Guardianship is not confirmed for this module',
    'GUARDIANSHIP_PENDING_READONLY': 'Unconfirmed guardianship allows read only',
    'GUARDIANSHIP_NOT_CONFIRMED': 'Guardianship must be confirmed before any access',
    'LOCATION_SCOPE_REQUIRED': 'Explicit location scope is required',
    'GEOLOCATION_DISABLED': 'Geolocation is temporarily disabled',
    'LOCATION_CONSENT_REQUIRED': 'Location consent is required',
    'LOCATION_RECIPIENT_NOT_ALLOWED': 'You are not a recipient of this location consent',
    'LOCATION_AGE_UNKNOWN': 'Subject age is unknown, location cannot be enabled',
    'LOCATION_CONSENT_AGE_OUTGROWN': 'Consent given by representative expired: subject is now old enough to decide',
    'LEGAL_REPRESENTATIVE_NOT_CONFIRMED': 'Legal representative is not confirmed',
    'SELF_CONSENT_ONLY': 'Only the subject can give this consent',
    'DUPLICATE_UNDER_REVIEW': 'Record is under duplicate review',
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
                 'is_owner', 'ownership_confirmed', 'space_status',
                 'member_status', 'request_id', 'ip_hash',
                 'user_agent_family', '_guardian_scopes')

    def __init__(self, session_id, user_id, family_id, member_id, role,
                 is_owner, member_status, request_id, ip_hash, user_agent_family,
                 ownership_confirmed=False, space_status='active'):
        object.__setattr__(self, 'session_id', session_id)
        object.__setattr__(self, 'user_id', user_id)
        object.__setattr__(self, 'family_id', family_id)
        object.__setattr__(self, 'member_id', member_id)
        object.__setattr__(self, 'role', role)
        object.__setattr__(self, 'is_owner', is_owner)
        object.__setattr__(self, 'ownership_confirmed', ownership_confirmed)
        object.__setattr__(self, 'space_status', space_status)
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
        """
        Права для UI. Фронт использует только для отображения и обязан
        показывать ровно то, что backend реально применит: неподтверждённый
        владелец не получает необратимые действия в списке возможностей.
        """
        caps = {m: list(a) for m, a in ROLE_POLICY.get(self.role, {}).items()}
        if self.is_owner:
            owner_caps = set(OWNER_ONLY_ACTIONS)
            if not self.ownership_confirmed:
                owner_caps -= IRREVERSIBLE_OWNER_ACTIONS
            caps['family_owner'] = sorted(owner_caps)
        return caps

    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'family_id': self.family_id,
            'member_id': self.member_id,
            'role': self.role,
            'is_owner': self.is_owner,
            'ownership_confirmed': self.ownership_confirmed,
            'space_status': self.space_status,
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
                   (f.owner_user_id = s.user_id) AS is_owner,
                   COALESCE(f.ownership_confirmed, FALSE) AS ownership_confirmed,
                   COALESCE(f.space_status, 'active')     AS space_status
            FROM {SCHEMA}.sessions s
            LEFT JOIN {SCHEMA}.family_members fm
                   ON fm.user_id = s.user_id
                  AND COALESCE(fm.member_status, 'active') = 'active'
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
    if row.get('member_id') and status in NON_PARTICIPATING_MEMBER_STATUSES:
        # Сюда попасть штатно нельзя — JOIN отбирает только active,
        # но проверка оставлена как второй барьер: изменится запрос —
        # отказ всё равно сработает (default deny).
        _audit_denial(str(row['user_id']), None, None, None, 'auth', 'authenticate',
                      'MEMBER_INACTIVE', 403, request_id, ip_hash, ua_family)
        raise AuthError(403, 'MEMBER_INACTIVE')

    space_status = row.get('space_status') or 'active'
    if row.get('family_id') and space_status in NON_OPERATIONAL_SPACE_STATUSES:
        _audit_denial(str(row['user_id']), None, str(row['family_id']), None,
                      'auth', 'authenticate', 'SPACE_NOT_OPERATIONAL', 403,
                      request_id, ip_hash, ua_family)
        raise AuthError(403, 'SPACE_NOT_OPERATIONAL')

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
        ownership_confirmed=bool(row.get('ownership_confirmed')),
        space_status=space_status,
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
    """
    Владелец пространства — свойство семьи, а не роль участника.

    Дополнительно: владелец, назначенный миграцией по правилу «самый ранний
    admin», технически управляет семьёй, но не доказал владение. Пока
    families.ownership_confirmed = FALSE, ему закрыты необратимые операции:
    удаление семьи, передача владения, полный экспорт, массовое удаление
    участников, изменение ключевых согласий.
    """
    if not ctx.is_owner:
        _audit(ctx, 'family', action, 'denied', 'OWNER_REQUIRED', http_status=403)
        raise AuthError(403, 'OWNER_REQUIRED')

    if action in IRREVERSIBLE_OWNER_ACTIONS and not ctx.ownership_confirmed:
        _audit(ctx, 'family', action, 'denied', 'OWNERSHIP_UNCONFIRMED', http_status=403)
        raise AuthError(403, 'OWNERSHIP_UNCONFIRMED')


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

def _load_guardian_scopes(ctx: AuthContext) -> Dict[str, Dict[str, Any]]:
    """
    dependent_member_id -> {'scopes': [...], 'status': ..., 'source': ...}.
    Кешируется на время запроса.

    Отбираются только связи, где подопечный — действующий участник:
    запись в duplicate_review / revoked субъектом быть не может, даже
    если связь на неё формально осталась.
    """
    cached = object.__getattribute__(ctx, '_guardian_scopes')
    if cached is not None:
        return cached
    scopes: Dict[str, Dict[str, Any]] = {}
    if ctx.member_id:
        conn = _connect()
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                f"""
                SELECT g.dependent_member_id,
                       g.scopes,
                       COALESCE(g.status, 'confirmed') AS status,
                       COALESCE(g.source, 'explicit')  AS source
                FROM {SCHEMA}.member_guardianships g
                JOIN {SCHEMA}.family_members dm ON dm.id = g.dependent_member_id
                WHERE g.guardian_member_id = %s
                  AND g.family_id = %s
                  AND g.revoked_at IS NULL
                  AND COALESCE(dm.member_status, 'active') = 'active'
                """,
                (ctx.member_id, ctx.family_id),
            )
            for r in cur.fetchall():
                scopes[str(r['dependent_member_id'])] = {
                    'scopes': list(r['scopes'] or []),
                    'status': r['status'],
                    'source': r['source'],
                }
            cur.close()
        finally:
            conn.close()
    object.__setattr__(ctx, '_guardian_scopes', scopes)
    return scopes


def can_access_subject(ctx: AuthContext, subject_member_id: Optional[str],
                       module: str = 'health',
                       action: str = 'read') -> Tuple[bool, str]:
    """
    Возвращает (разрешено, reason_code).

    Правила по чувствительным модулям:
      - свои данные — всегда;
      - подтверждённая связь опекунства с нужным scope — да;
      - НЕподтверждённая связь (созданная миграцией) — НЕТ, ничего,
        даже чтения: это гипотеза о родстве, а не право;
      - admin БЕЗ явной связи — нет (администрирование ≠ доступ к содержимому);
      - parent БЕЗ явной связи — нет (см. ниже);
      - viewer / child к чужим данным — нет;
      - субъект не в состоянии 'active' — нет.

    ПОЧЕМУ РОЛЬ 'parent' НЕ ОТКРЫВАЕТ ДЕТЕЙ СЕМЬИ АВТОМАТИЧЕСКИ.
    access_role в этой БД исторически смешивает семейное ОТНОШЕНИЕ и
    ПОЛНОМОЧИЕ. Миграция editor -> parent (V0376) выдала роль 'parent'
    в том числе 12-летнему участнику с role='Сын' — он получил бы доступ
    к медданным младшего брата. Родство нельзя выводить из строки роли.

    ПОЧЕМУ BACKFILL-СВЯЗЬ НЕ РАВНА ПОДТВЕРЖДЁННОЙ.
    V0377 создала 29 связей по признакам «взрослый + admin/parent + та же
    семья». Это операционная догадка: она покрывает сводные семьи, бывших
    участников и неверно классифицированных взрослых. Такая связь
    (status='pending_confirmation') не даёт НИЧЕГО до подтверждения —
    ни чтения, ни записи. Раньше здесь было послабление (read по
    health/medications/children); оно снято: гипотеза о родстве не должна
    открывать медданные ребёнка ни на каком уровне.
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
        if (subject.get('member_status') or 'active') != 'active':
            return False, 'SUBJECT_NOT_ACTIVE'
        return True, 'NON_SENSITIVE_MODULE'

    link = _load_guardian_scopes(ctx).get(subject_member_id)
    if not link:
        return False, 'SUBJECT_ACCESS_DENIED'

    # Неподтверждённая связь не даёт данных вообще — проверяем до scopes,
    # чтобы никакой набор scopes_requested не мог её «оживить».
    if link.get('status') != 'confirmed':
        return False, 'GUARDIANSHIP_NOT_CONFIRMED'

    if not _scope_grants(link.get('scopes') or [], module, action):
        return False, 'SUBJECT_SCOPE_DENIED'

    return True, 'ASSIGNED_GUARDIAN'


def _scope_grants(scopes: List[str], module: str, action: str) -> bool:
    """
    Проверяет, покрывает ли набор scopes связи модуль и действие.

    Формы scope:
        'health:read'   — чтение конкретного модуля
        'health:write'  — чтение + запись
        'health'        — legacy-форма, равна 'health:write'
        'all'           — всё, КРОМЕ геолокации

    Почему 'all' не включает геолокацию: подтверждая опекунство над
    ребёнком, человек соглашается вести его здоровье и календарь. Точные
    перемещения — отдельное решение с отдельным согласием, и оно должно
    быть видно в наборе scopes явно, иначе аудит не отличит «разрешили
    слежение» от «разрешили всё остальное».
    """
    scopes = [str(s) for s in scopes]
    is_write = action in WRITE_ACTIONS

    if module in LOCATION_MODULES:
        candidates = [s for s in scopes if s == module or s.startswith(module + ':')]
    else:
        if 'all' in scopes:
            return True
        candidates = [s for s in scopes if s == module or s.startswith(module + ':')]

    if not candidates:
        return False
    if not is_write:
        return True
    # Запись: нужен ':write' либо legacy-форма без уточнения.
    return any(s == module or s.endswith(':write') for s in candidates)


def require_subject_access(ctx: AuthContext, subject_member_id: Optional[str],
                           module: str = 'health',
                           resource_type: Optional[str] = None,
                           resource_id: Optional[str] = None,
                           action: str = 'read') -> str:
    allowed, reason = can_access_subject(ctx, subject_member_id, module, action)
    if not allowed:
        _audit(ctx, module, action, 'denied', reason,
               resource_type=resource_type, resource_id=resource_id,
               subject_member_id=subject_member_id if _is_uuid(subject_member_id) else None,
               http_status=403)
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')
    return reason


def require_location_access(ctx: AuthContext, subject_member_id: Optional[str],
                            resource_type: str = 'location',
                            resource_id: Optional[str] = None,
                            action: str = 'read') -> str:
    """
    Единственный законный вход к точным координатам человека.

    Полный набор условий (все обязательны):
        1. действующая серверная сессия        — require_session выше;
        2. субъект в той же семье              — require_same_family;
        3. субъект активен                     — member_status='active';
        4. это я сам ИЛИ подтверждённая связь
           с явным scope 'geolocation'         — can_access_subject;
        5. просмотр записан в аудит.

    Роль (owner/admin/parent) сама по себе НЕ проходит: в этой БД роль
    смешивает отношение и полномочие, а координаты ребёнка — та цена
    ошибки, которую нельзя платить за историческую неточность модели.

    Каждый успешный просмотр чужой геолокации журналируется всегда,
    а не по усмотрению вызывающей функции: без этого нельзя ответить
    на вопрос «кто смотрел, где был мой ребёнок».

    SEC-2026-001: до условия 1 добавлено условие 0 — функция геолокации
    вообще включена. Проверка стоит здесь, а не в каждой geo-функции,
    чтобы новая функция не могла получить доступ к координатам, просто
    забыв спросить про флаг.

    152-ФЗ: добавлено условие 0.5 — на обработку геоданных субъекта есть
    действующее согласие, а смотрящий указан в нём получателем. Право
    смотреть (scope) не заменяет основания обрабатывать (согласие):
    это разные вещи, и наличие одного не создаёт второго.
    """
    require_geo_enabled(GEO_HISTORY_FLAG)
    require_location_consent(ctx, subject_member_id, operation=GEO_OP_VIEW)

    allowed, reason = can_access_subject(ctx, subject_member_id,
                                         module='geolocation', action=action)
    if not allowed:
        code = ('LOCATION_SCOPE_REQUIRED'
                if reason == 'SUBJECT_SCOPE_DENIED' else reason)
        _audit(ctx, 'geolocation', action, 'denied', code,
               resource_type=resource_type, resource_id=resource_id,
               subject_member_id=subject_member_id if _is_uuid(subject_member_id) else None,
               http_status=403)
        raise AuthError(403, 'SUBJECT_ACCESS_DENIED')

    if reason != 'SELF':
        _audit(ctx, 'geolocation', action, 'allowed', reason,
               resource_type=resource_type, resource_id=resource_id,
               subject_member_id=subject_member_id, http_status=200)
    return reason


def accessible_subject_ids(ctx: AuthContext, module: str = 'health',
                           action: str = 'read') -> List[str]:
    """
    Для массовых списков: набор member_id, чьи данные актор вправе видеть.
    Так list-эндпоинты не возвращают чужие записи.

    Набор зависит от действия: для записи неподтверждённые связи
    в список не попадают, иначе «прочитать нельзя, а изменить можно»
    разошлись бы между одиночным и массовым путём.
    """
    result = set()
    if ctx.member_id:
        result.add(ctx.member_id)
    for dep, link in _load_guardian_scopes(ctx).items():
        if link.get('status') != 'confirmed':
            continue
        if not _scope_grants(link.get('scopes') or [], module, action):
            continue
        result.add(dep)
    # Роль 'parent' НЕ расширяет набор субъектов: см. can_access_subject.
    # Список строится только из себя + адресных опекунств, поэтому
    # list-эндпоинты физически не могут вернуть чужого ребёнка.

    # Геолокация: сверх scope нужно действующее согласие субъекта,
    # в котором актор назван получателем. Без этой фильтрации списковый
    # путь отдавал бы координаты тех, кто согласия не давал, — то есть
    # расходился бы с одиночным путём (require_location_access).
    if module in LOCATION_MODULES:
        allowed = set()
        for member_id in result:
            consent = load_active_location_consent(member_id)
            if not consent:
                continue
            if not _consent_still_valid(consent, _load_member(member_id))[0]:
                continue
            if member_id == ctx.member_id or ctx.member_id in (consent.get('recipients') or []):
                allowed.add(member_id)
        return sorted(allowed)

    return sorted(result)


def _load_member(member_id: str) -> Optional[Dict[str, Any]]:
    if not _is_uuid(member_id):
        return None
    conn = _connect()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"""SELECT id, family_id, user_id, access_role, account_type,
                       member_status, birth_date, age, name
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

    # Запись на разборе дубликатов или отозванный участник не может быть
    # ни актором, ни адресатом действия.
    if (subject.get('member_status') or 'active') != 'active':
        _audit(ctx, module, 'impersonate', 'denied', 'SUBJECT_NOT_ACTIVE', http_status=403)
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


def audit_denied(ctx: AuthContext, module: str, action: str, reason_code: str,
                 resource_type: Optional[str] = None, resource_id: Optional[str] = None,
                 subject_member_id: Optional[str] = None,
                 http_status: int = 403) -> None:
    """
    Журналирование отказа, принятого прикладной логикой функции,
    а не самим guard-ом (попытка задать серверное поле, самоповышение,
    отзыв владельца). Пишутся только коды и идентификаторы — без данных.
    """
    _audit(ctx, module, action, 'denied', reason_code,
           resource_type=resource_type, resource_id=resource_id,
           subject_member_id=subject_member_id, http_status=http_status)


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