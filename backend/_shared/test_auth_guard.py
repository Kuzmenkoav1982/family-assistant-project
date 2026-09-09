#!/usr/bin/env python3
"""
Тесты решений авторизации. Запуск: python3 backend/_shared/test_auth_guard.py

Проверяются именно ОТКАЗЫ — позитивные сценарии сами по себе ничего не
доказывают. Матрица негативных случаев:

  без токена                        → 401
  просроченный/неверный токен       → 401
  только X-User-Id, без сессии      → 401
  подмена X-User-Id на чужого       → 403
  чужая семья по UUID ресурса       → 404 (не подтверждаем существование)
  viewer пытается изменить          → 403
  child запрашивает чужие данные    → 403
  guardian без связи с субъектом    → 403
  admin к здоровью без опекунства   → 403
  обычный admin удаляет семью       → 403
  admin передаёт владение           → 403

БД не нужна: подменяем _connect() на фейковый курсор.
"""

import sys
import types
from datetime import datetime, timedelta

sys.path.insert(0, __file__.rsplit('/', 1)[0])

# Заглушка psycopg2 до импорта auth_guard.
fake_pg = types.ModuleType('psycopg2')
fake_extras = types.ModuleType('psycopg2.extras')


class RealDictCursor:
    pass


fake_extras.RealDictCursor = RealDictCursor
fake_pg.extras = fake_extras
fake_pg.connect = lambda *a, **k: None
sys.modules.setdefault('psycopg2', fake_pg)
sys.modules.setdefault('psycopg2.extras', fake_extras)

import auth_guard as ag  # noqa: E402

FAMILY_A = '11111111-1111-1111-1111-111111111111'
FAMILY_B = '22222222-2222-2222-2222-222222222222'
MEMBER_SELF = 'aaaaaaaa-0000-0000-0000-000000000001'
MEMBER_CHILD = 'aaaaaaaa-0000-0000-0000-000000000002'
MEMBER_OTHER_ADULT = 'aaaaaaaa-0000-0000-0000-000000000003'
MEMBER_FOREIGN = 'bbbbbbbb-0000-0000-0000-000000000009'
USER_SELF = 'cccccccc-0000-0000-0000-000000000001'

# Сессии: token -> строка результата require_session-запроса
SESSIONS = {}
# Участники: member_id -> запись family_members
MEMBERS = {}
# Опекунства: (guardian_member_id) -> [(dependent, scopes)]
GUARDIANSHIPS = {}

AUDIT = []


class FakeCursor:
    def __init__(self):
        self._rows = []
        self.rowcount = 0

    def execute(self, query, params=None):
        q = ' '.join(query.split())
        params = params or ()

        if 'FROM t_p5815085_family_assistant_pro.sessions' in q:
            self._rows = [SESSIONS[params[0]]] if params[0] in SESSIONS else []
        elif 'FROM t_p5815085_family_assistant_pro.member_guardianships' in q:
            pairs = GUARDIANSHIPS.get(params[0], [])
            self._rows = [{'dependent_member_id': d, 'scopes': s} for d, s in pairs]
        elif 'FROM t_p5815085_family_assistant_pro.family_members WHERE id =' in q:
            rec = MEMBERS.get(params[0])
            self._rows = [rec] if rec else []
        elif 'INSERT INTO t_p5815085_family_assistant_pro.authz_audit_log' in q:
            AUDIT.append(params)
            self._rows = []
        else:
            self._rows = []
        self.rowcount = len(self._rows)

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return list(self._rows)

    def close(self):
        pass


class FakeConn:
    def cursor(self, cursor_factory=None):
        return FakeCursor()

    def close(self):
        pass

    def rollback(self):
        pass


ag._connect = lambda: FakeConn()


def make_session(token, role, family_id=FAMILY_A, member_id=MEMBER_SELF,
                 is_owner=False, status='active'):
    SESSIONS[token] = {
        'session_id': 'sess-' + token,
        'user_id': USER_SELF,
        'member_id': member_id,
        'family_id': family_id,
        'role': role,
        'member_status': status,
        'is_owner': is_owner,
    }


def setup():
    make_session('tok-admin', 'admin', is_owner=False)
    make_session('tok-owner', 'admin', is_owner=True)
    make_session('tok-parent', 'parent')
    make_session('tok-guardian', 'guardian')
    make_session('tok-viewer', 'viewer')
    make_session('tok-child', 'child')
    make_session('tok-guardian-assigned', 'guardian')

    MEMBERS[MEMBER_SELF] = {'id': MEMBER_SELF, 'family_id': FAMILY_A, 'user_id': USER_SELF,
                            'access_role': 'admin', 'account_type': 'full',
                            'member_status': 'active'}
    MEMBERS[MEMBER_CHILD] = {'id': MEMBER_CHILD, 'family_id': FAMILY_A, 'user_id': None,
                             'access_role': 'child', 'account_type': 'child_profile',
                             'member_status': 'active'}
    MEMBERS[MEMBER_OTHER_ADULT] = {'id': MEMBER_OTHER_ADULT, 'family_id': FAMILY_A,
                                   'user_id': 'other-user', 'access_role': 'parent',
                                   'account_type': 'full', 'member_status': 'active'}
    MEMBERS[MEMBER_FOREIGN] = {'id': MEMBER_FOREIGN, 'family_id': FAMILY_B,
                               'user_id': 'foreign-user', 'access_role': 'admin',
                               'account_type': 'full', 'member_status': 'active'}

    GUARDIANSHIPS[MEMBER_SELF] = []


results = []


def check(name, fn, expect_status=None):
    """expect_status=None означает 'должно пройти без исключения'."""
    try:
        fn()
        if expect_status is None:
            results.append((True, name, 'allowed'))
        else:
            results.append((False, name, f'ожидался {expect_status}, но доступ разрешён'))
    except ag.AuthError as exc:
        if expect_status == exc.status:
            results.append((True, name, f'{exc.status} {exc.reason_code}'))
        elif expect_status is None:
            results.append((False, name, f'ожидался allow, получен {exc.status} {exc.reason_code}'))
        else:
            results.append((False, name, f'ожидался {expect_status}, получен {exc.status} {exc.reason_code}'))
    except Exception as exc:  # noqa: BLE001
        results.append((False, name, f'неожиданная ошибка: {type(exc).__name__}: {exc}'))


def ctx_for(token, module_headers=None):
    event = {'headers': dict(module_headers or {}, **{'X-Auth-Token': token})}
    return ag.require_session(event), event


def main():
    setup()

    # ---------- АУТЕНТИФИКАЦИЯ ----------
    check('без токена → 401',
          lambda: ag.require_session({'headers': {}}), 401)

    check('неверный токен → 401',
          lambda: ag.require_session({'headers': {'X-Auth-Token': 'garbage'}}), 401)

    check('только X-User-Id без сессии → 401',
          lambda: ag.require_session({'headers': {'X-User-Id': MEMBER_SELF}}), 401)

    check('Bearer-токен неверный → 401',
          lambda: ag.require_session({'headers': {'Authorization': 'Bearer nope'}}), 401)

    check('действительная сессия → allow',
          lambda: ag.require_session({'headers': {'X-Auth-Token': 'tok-admin'}}), None)

    # ---------- ПОДМЕНА X-User-Id ----------
    admin_ctx, _ = ctx_for('tok-admin')

    check('X-User-Id указывает на участника чужой семьи → 403',
          lambda: ag.resolve_requested_member(
              {'headers': {'X-Auth-Token': 'tok-admin', 'X-User-Id': MEMBER_FOREIGN}},
              admin_ctx, 'health'), 403)

    check('X-User-Id = мусор → 403',
          lambda: ag.resolve_requested_member(
              {'headers': {'X-Auth-Token': 'tok-admin', 'X-User-Id': 'not-a-uuid'}},
              admin_ctx, 'health'), 403)

    check('X-User-Id = свой member_id → allow',
          lambda: ag.resolve_requested_member(
              {'headers': {'X-Auth-Token': 'tok-admin', 'X-User-Id': MEMBER_SELF}},
              admin_ctx, 'health'), None)

    check('нет X-User-Id → свой member_id из сессии',
          lambda: ag.resolve_requested_member(
              {'headers': {'X-Auth-Token': 'tok-admin'}}, admin_ctx, 'health'), None)

    # ---------- RESOURCE SCOPE (IDOR/BOLA) ----------
    check('ресурс чужой семьи → 404',
          lambda: ag.require_same_family(admin_ctx, FAMILY_B, 'health_profile', 'res-1'), 404)

    check('family_id отсутствует у ресурса → 404',
          lambda: ag.require_same_family(admin_ctx, None, 'health_profile', 'res-1'), 404)

    check('ресурс своей семьи → allow',
          lambda: ag.require_same_family(admin_ctx, FAMILY_A, 'health_profile', 'res-1'), None)

    # ---------- RBAC ----------
    viewer_ctx, _ = ctx_for('tok-viewer')
    check('viewer пытается создать событие → 403',
          lambda: ag.require_permission(viewer_ctx, 'events', 'create'), 403)
    check('viewer пытается изменить память → 403',
          lambda: ag.require_permission(viewer_ctx, 'memory', 'update'), 403)
    check('viewer читает память → allow',
          lambda: ag.require_permission(viewer_ctx, 'memory', 'read'), None)
    check('viewer к финансам → 403',
          lambda: ag.require_permission(viewer_ctx, 'finance', 'read_own'), 403)
    check('viewer экспортирует данные → 403',
          lambda: ag.require_permission(viewer_ctx, 'export', 'export'), 403)

    guardian_ctx, _ = ctx_for('tok-guardian')
    check('guardian к финансам → 403',
          lambda: ag.require_permission(guardian_ctx, 'finance', 'read_own'), 403)
    check('guardian экспортирует данные → 403',
          lambda: ag.require_permission(guardian_ctx, 'export', 'export'), 403)
    check('guardian удаляет память → 403',
          lambda: ag.require_permission(guardian_ctx, 'memory', 'delete'), 403)

    child_ctx, _ = ctx_for('tok-child')
    check('child к финансам → 403',
          lambda: ag.require_permission(child_ctx, 'finance', 'read_own'), 403)
    check('child к геолокации → 403',
          lambda: ag.require_permission(child_ctx, 'geolocation', 'read'), 403)
    check('child управляет участниками → 403',
          lambda: ag.require_permission(child_ctx, 'family_members', 'manage_roles'), 403)

    # ---------- ВЛАДЕНИЕ ----------
    check('обычный admin удаляет семью → 403',
          lambda: ag.require_owner(admin_ctx, 'family.delete'), 403)
    check('обычный admin передаёт владение → 403',
          lambda: ag.require_owner(admin_ctx, 'family.transfer_ownership'), 403)

    owner_ctx, _ = ctx_for('tok-owner')
    check('owner удаляет семью → allow',
          lambda: ag.require_owner(owner_ctx, 'family.delete'), None)
    check('owner проходит require_admin → allow',
          lambda: ag.require_admin(owner_ctx), None)
    check('viewer как админ → 403',
          lambda: ag.require_admin(viewer_ctx), 403)

    # ---------- RELATIONSHIP / ABAC ----------
    check('admin к здоровью другого взрослого без опекунства → 403',
          lambda: ag.require_subject_access(admin_ctx, MEMBER_OTHER_ADULT, 'health'), 403)

    check('admin к здоровью ребёнка без опекунства → 403',
          lambda: ag.require_subject_access(admin_ctx, MEMBER_CHILD, 'health'), 403)

    check('admin к своему здоровью → allow',
          lambda: ag.require_subject_access(admin_ctx, MEMBER_SELF, 'health'), None)

    check('guardian без связи с субъектом → 403',
          lambda: ag.require_subject_access(guardian_ctx, MEMBER_CHILD, 'health'), 403)

    parent_ctx, _ = ctx_for('tok-parent')
    check('parent к здоровью ребёнка своей семьи → allow',
          lambda: ag.require_subject_access(parent_ctx, MEMBER_CHILD, 'health'), None)
    check('parent к здоровью другого взрослого → 403',
          lambda: ag.require_subject_access(parent_ctx, MEMBER_OTHER_ADULT, 'health'), 403)
    check('parent к участнику чужой семьи → 403',
          lambda: ag.require_subject_access(parent_ctx, MEMBER_FOREIGN, 'health'), 403)

    check('child к здоровью другого участника → 403',
          lambda: ag.require_subject_access(child_ctx, MEMBER_OTHER_ADULT, 'health'), 403)
    check('viewer к здоровью другого участника → 403',
          lambda: ag.require_subject_access(viewer_ctx, MEMBER_OTHER_ADULT, 'health'), 403)

    # Назначенный опекун со scope health
    GUARDIANSHIPS[MEMBER_SELF] = [(MEMBER_CHILD, ['health'])]
    assigned_ctx, _ = ctx_for('tok-guardian-assigned')
    check('назначенный guardian к здоровью подопечного → allow',
          lambda: ag.require_subject_access(assigned_ctx, MEMBER_CHILD, 'health'), None)

    assigned_ctx2, _ = ctx_for('tok-guardian-assigned')
    check('назначенный на health guardian к финансам подопечного → 403',
          lambda: ag.require_subject_access(assigned_ctx2, MEMBER_CHILD, 'finance'), 403)

    assigned_ctx3, _ = ctx_for('tok-guardian-assigned')
    check('guardian к не-подопечному взрослому → 403',
          lambda: ag.require_subject_access(assigned_ctx3, MEMBER_OTHER_ADULT, 'health'), 403)

    # ---------- МАССОВЫЕ СПИСКИ ----------
    GUARDIANSHIPS[MEMBER_SELF] = [(MEMBER_CHILD, ['health'])]
    subj_ctx, _ = ctx_for('tok-guardian-assigned')
    subjects = ag.accessible_subject_ids(subj_ctx, 'health')
    ok = MEMBER_OTHER_ADULT not in subjects and MEMBER_FOREIGN not in subjects \
        and MEMBER_SELF in subjects and MEMBER_CHILD in subjects
    results.append((ok, 'массовый список: только свои + подопечные',
                    f'{len(subjects)} субъектов' if ok else f'утечка: {subjects}'))

    # ---------- CAPABILITIES ----------
    caps_viewer = viewer_ctx.capabilities()
    ok = caps_viewer.get('finance') == [] and 'family_owner' not in caps_viewer
    results.append((ok, 'capabilities viewer без finance и без owner-прав',
                    'ok' if ok else str(caps_viewer)))

    caps_owner = owner_ctx.capabilities()
    ok = 'family_owner' in caps_owner and 'family.delete' in caps_owner['family_owner']
    results.append((ok, 'capabilities owner содержат family.delete',
                    'ok' if ok else str(caps_owner.get('family_owner'))))

    # ---------- НЕИЗМЕНЯЕМОСТЬ КОНТЕКСТА ----------
    def mutate():
        admin_ctx.role = 'owner'
    try:
        mutate()
        results.append((False, 'AuthContext неизменяем', 'удалось подменить role!'))
    except AttributeError:
        results.append((True, 'AuthContext неизменяем', 'ok'))

    # ---------- АУДИТ НЕ СОДЕРЖИТ СОДЕРЖИМОГО ----------
    # Ищем именно значения секретов и содержимого, а не имена reason_code
    # (в 'NO_SESSION_TOKEN' слово token — часть кода причины, не утечка).
    secrets = [t for t in SESSIONS] + ['garbage', 'nope']
    leak = [(v, s) for p in AUDIT for v in p if isinstance(v, str)
            for s in secrets if s in v]
    forbidden_content = ('diagnos', 'password', 'allerg', 'requestbody')
    leak += [(v, f) for p in AUDIT for v in p if isinstance(v, str)
             for f in forbidden_content if f in v.lower()]
    results.append((not leak, 'аудит без значений токенов и содержимого данных',
                    'ok' if not leak else str(leak[:3])))

    # ---------- ОТЧЁТ ----------
    passed = sum(1 for ok, _, _ in results if ok)
    total = len(results)
    print()
    for ok, name, detail in results:
        print(f'  {"PASS" if ok else "FAIL"}  {name}  [{detail}]')
    print(f'\n{passed}/{total} проверок пройдено')
    print(f'записано audit-событий: {len(AUDIT)}')
    return 0 if passed == total else 1


if __name__ == '__main__':
    sys.exit(main())