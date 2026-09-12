#!/usr/bin/env python3
"""
QA-сценарии для задачи 12 (см. docs/legal/compliance-checklist.md, Раздел 4
и Раздел 6, сценарий F): управление получателями геоданных
(add_recipient / confirm_recipient / revoke_recipient) через реальный
handler() из backend/location-consent/index.py, а не только через
auth_guard напрямую.

Почему отдельный файл, а не расширение test_auth_guard.py:
test_auth_guard.py проверяет решения авторизации на уровне функций
auth_guard (require_location_access и т.п.), но НЕ вызывает handler()
конкретной backend-функции. Здесь же цель — прогнать именно
_manage_recipient()/_grant() из index.py через HTTP-подобный event,
как это делает реальный вызов PUT /location-consent, включая парсинг
тела запроса, поиск получателя в family_members и запись в
location_consent_events.

БД не нужна: подменяем psycopg2.connect на фейковый курсор, как в
test_auth_guard.py. Тестовые данные соответствуют реальной синтетической
семье из миграции db_migrations/V0354__demo_contour_for_reestr_expertise.sql
(id владельца/семьи/участников совпадают, чтобы сценарий был
представим как QA на этой демо-семье), но полностью изолированы от прода
(фейковая БД в процессе, реальная БД не читается и не пишется).

Запуск: python3 backend/location-consent/test_recipient_scenarios.py
"""

import json
import sys
import types
from datetime import datetime, timezone

HERE = __file__.rsplit('/', 1)[0]
sys.path.insert(0, HERE)
sys.path.insert(0, HERE.rsplit('/', 2)[0] + '/_shared')

# ---- Заглушка psycopg2 (как в test_auth_guard.py) ----
fake_pg = types.ModuleType('psycopg2')
fake_extras = types.ModuleType('psycopg2.extras')


class RealDictCursor:
    pass


fake_extras.RealDictCursor = RealDictCursor
fake_pg.extras = fake_extras
fake_pg.connect = lambda *a, **k: FakeConn()  # noqa: F821 (определён ниже, но нужен на момент вызова)
sys.modules['psycopg2'] = fake_pg
sys.modules['psycopg2.extras'] = fake_extras

# ---- Синтетические ID demo-семьи (см. V0354) ----
FAMILY_ID = 'd0000000-0000-0000-0000-0000000000f1'
FAMILY_FOREIGN = 'd0000000-0000-0000-0000-0000000000f2'
OWNER_MEMBER = 'd0000000-0000-0000-0000-0000000000a1'   # Анна Тестова, admin, 36
PARENT_MEMBER = 'd0000000-0000-0000-0000-0000000000a2'  # Иван Тестов, parent, 38
CHILD_MEMBER = 'd0000000-0000-0000-0000-0000000000a3'   # Ребёнок Тестов, child, 8
FOREIGN_MEMBER = 'd0000000-0000-0000-0000-0000000000f9'  # участник чужой семьи
OWNER_USER = 'd0000000-0000-0000-0000-000000000001'

CONSENT_TEXT_VERSION = '2026-09-12.1'

MEMBERS = {
    OWNER_MEMBER: {'id': OWNER_MEMBER, 'family_id': FAMILY_ID, 'user_id': OWNER_USER,
                   'access_role': 'admin', 'account_type': 'full',
                   'member_status': 'active', 'age': 36, 'name': 'Анна Тестова'},
    PARENT_MEMBER: {'id': PARENT_MEMBER, 'family_id': FAMILY_ID, 'user_id': None,
                    'access_role': 'parent', 'account_type': 'full',
                    'member_status': 'active', 'age': 38, 'name': 'Иван Тестов'},
    CHILD_MEMBER: {'id': CHILD_MEMBER, 'family_id': FAMILY_ID, 'user_id': None,
                   'access_role': 'child', 'account_type': 'full',
                   'member_status': 'active', 'age': 8, 'name': 'Ребёнок Тестов'},
    FOREIGN_MEMBER: {'id': FOREIGN_MEMBER, 'family_id': FAMILY_FOREIGN, 'user_id': None,
                     'access_role': 'admin', 'account_type': 'full',
                     'member_status': 'active', 'age': 40, 'name': 'Чужой'},
}

SESSIONS = {
    'tok-owner': {'session_id': 's-owner', 'user_id': OWNER_USER,
                  'member_id': OWNER_MEMBER, 'family_id': FAMILY_ID,
                  'role': 'admin', 'member_status': 'active',
                  'is_owner': True, 'ownership_confirmed': True,
                  'space_status': 'active'},
    'tok-parent': {'session_id': 's-parent', 'user_id': 'parent-user',
                   'member_id': PARENT_MEMBER, 'family_id': FAMILY_ID,
                   'role': 'parent', 'member_status': 'active',
                   'is_owner': False, 'ownership_confirmed': False,
                   'space_status': 'active'},
}

# Согласия: subject_member_id -> запись location_consents (как в location_consents).
CONSENTS = {}
# consent_id -> {recipient_member_id: {'status':..., 'requested_by':..., ...}}
RECIPIENTS = {}
CONSENT_EVENTS = []
CURRENT_TEXT = {
    'version': CONSENT_TEXT_VERSION,
    'summary': 'Демо-текст согласия для QA',
    'body_md': '...',
    'legal_review_status': 'approved',
}


def _next_recipient_status(consent_id, recipient_id):
    return RECIPIENTS.get(consent_id, {}).get(recipient_id, {}).get('status')


class FakeCursor:
    def __init__(self):
        self._rows = []
        self.rowcount = 0

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def close(self):
        pass

    def execute(self, query, params=None):
        q = ' '.join(query.split())
        params = params or ()
        self._rows = []

        if 'FROM t_p5815085_family_assistant_pro.sessions' in q:
            token = params[0]
            row = SESSIONS.get(token)
            self._rows = [row] if row else []

        # ВАЖНО: более специфичный шаблон (с family_id в WHERE) обязан
        # проверяться РАНЬШЕ общего "family_members WHERE id =", иначе
        # ветка ниже никогда не будет достигнута — подстрока первого
        # шаблона входит и в этот SQL тоже.
        elif ('SELECT 1 FROM t_p5815085_family_assistant_pro.family_members' in q
              and 'WHERE id = %s AND family_id = %s' in q):
            recipient_id, family_id = params
            rec = MEMBERS.get(recipient_id)
            ok = bool(rec and str(rec['family_id']) == str(family_id)
                      and (rec.get('member_status') or 'active') == 'active')
            self._rows = [{'?column?': 1}] if ok else []

        elif 'FROM t_p5815085_family_assistant_pro.family_members WHERE id =' in q:
            rec = MEMBERS.get(params[0])
            self._rows = [rec] if rec else []

        elif 'FROM t_p5815085_family_assistant_pro.location_consent_texts' in q:
            self._rows = [dict(CURRENT_TEXT)]

        elif 'FROM t_p5815085_family_assistant_pro.location_consents' in q and 'SELECT id, family_id' in q:
            subject_id = params[0]
            consent = CONSENTS.get(subject_id)
            if consent and consent.get('status') == 'active':
                self._rows = [dict(consent)]

        elif ('SELECT 1 FROM t_p5815085_family_assistant_pro.location_consents' in q
              and 'granted_by_member_id' in q):
            consent_id, actor_member_id = params
            consent = None
            for c in CONSENTS.values():
                if str(c['id']) == str(consent_id):
                    consent = c
                    break
            ok = bool(consent and str(consent.get('granted_by_member_id')) == str(actor_member_id))
            self._rows = [{'?column?': 1}] if ok else []

        elif ('UPDATE t_p5815085_family_assistant_pro.location_consents' in q
              and "SET status = 'superseded'" in q):
            subject_id = params[0]
            existing = CONSENTS.get(subject_id)
            if existing and existing.get('status') == 'active':
                existing['status'] = 'superseded'
            self._rows = []

        elif ('INSERT INTO t_p5815085_family_assistant_pro.location_consents' in q
              and 'RETURNING id' in q):
            new_id = f'consent-qa-grant-{len(CONSENTS) + 1}'
            subject_id = params[1]
            CONSENTS[subject_id] = {
                'id': new_id,
                'family_id': params[0],
                'subject_member_id': subject_id,
                'granted_by_user_id': params[2],
                'granted_by_member_id': params[3],
                'consent_role': params[4],
                'subject_age_at_grant': params[5],
                'text_version': params[6],
                'data_scope': params[8],
                'retention_days': params[9],
                'update_interval_seconds': params[10],
                'representation_id': params[11],
                'collection_enabled': True,
                'collection_disabled_at': None,
                'next_reminder_at': None,
                'granted_at': datetime.now(timezone.utc),
                'status': 'active',
            }
            RECIPIENTS.setdefault(new_id, {})
            self._rows = [{'id': new_id}]

        elif 'INSERT INTO t_p5815085_family_assistant_pro.location_consent_recipients' in q:
            consent_id, recipient_id, status, requested_by = params[0], params[1], params[2], params[3]
            RECIPIENTS.setdefault(consent_id, {})
            RECIPIENTS[consent_id][recipient_id] = {
                'status': status,
                'requested_by_member_id': requested_by,
                'confirmed_at': datetime.now(timezone.utc) if status == 'active' else None,
                'revoked_at': None,
            }
            self._rows = [{'status': status}]

        elif 'UPDATE t_p5815085_family_assistant_pro.location_consent_recipients' in q and \
                "SET status = 'active'" in q:
            consent_id, recipient_id = params
            entry = RECIPIENTS.get(consent_id, {}).get(recipient_id)
            if entry and entry['status'] == 'pending' and entry['revoked_at'] is None:
                entry['status'] = 'active'
                entry['confirmed_at'] = datetime.now(timezone.utc)
                self.rowcount = 1
            else:
                self.rowcount = 0
            return

        elif 'UPDATE t_p5815085_family_assistant_pro.location_consent_recipients' in q and \
                "SET status = 'revoked'" in q:
            consent_id, recipient_id = params
            entry = RECIPIENTS.get(consent_id, {}).get(recipient_id)
            if entry and entry.get('revoked_at') is None:
                entry['status'] = 'revoked'
                entry['revoked_at'] = datetime.now(timezone.utc)
                self.rowcount = 1
            else:
                self.rowcount = 0
            return

        elif 'INSERT INTO t_p5815085_family_assistant_pro.location_consent_events' in q:
            CONSENT_EVENTS.append({
                'consent_id': params[0], 'subject_member_id': params[1],
                'family_id': params[2], 'action': params[3],
                'actor_user_id': params[4], 'actor_member_id': params[5],
                'actor_role': params[6], 'text_version': params[7],
                'details': json.loads(params[8]) if params[8] else {},
            })
            self._rows = []

        else:
            self._rows = []

        self.rowcount = len(self._rows) if self.rowcount == 0 else self.rowcount

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return list(self._rows)


class FakeConn:
    def cursor(self, cursor_factory=None):
        return FakeCursor()

    def close(self):
        pass

    def rollback(self):
        pass

    autocommit = True


import auth_guard as ag  # noqa: E402
ag._connect = lambda: FakeConn()
ag.psycopg2 = fake_pg  # на случай прямого обращения

import index as location_consent  # noqa: E402
location_consent.psycopg2.connect = lambda *a, **k: FakeConn()


def set_geo_flags(enabled: bool):
    ag._geo_flag_cache[ag.GEO_COLLECTION_FLAG] = enabled
    ag._geo_flag_cache[ag.GEO_HISTORY_FLAG] = enabled
    ag._geo_flag_cache[ag.GEO_ADULT_SELF_FLAG] = enabled
    ag._geo_flag_cache[ag.GEO_MINOR_FLAG] = enabled
    ag._geo_flag_cache[ag.GEO_GEOFENCES_FLAG] = enabled
    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = not enabled


set_geo_flags(True)


def give_consent(subject_id, granted_by_member_id, role='self', consent_id='consent-qa-1'):
    CONSENTS[subject_id] = {
        'id': consent_id,
        'family_id': FAMILY_ID,
        'subject_member_id': subject_id,
        'consent_role': role,
        'subject_age_at_grant': MEMBERS[subject_id].get('age'),
        'text_version': CONSENT_TEXT_VERSION,
        'retention_days': 7,
        'update_interval_seconds': 600,
        'data_scope': {},
        'granted_at': datetime.now(timezone.utc),
        'collection_enabled': True,
        'collection_disabled_at': None,
        'representation_id': None,
        'next_reminder_at': None,
        'granted_by_member_id': granted_by_member_id,
        'status': 'active',
    }
    RECIPIENTS.setdefault(consent_id, {})


def event(method, token, body=None):
    headers = {'X-Auth-Token': token} if token else {}
    return {
        'httpMethod': method,
        'headers': headers,
        'body': json.dumps(body or {}),
        'queryStringParameters': {},
    }


results = []


def check(name, fn, expect_status=None, expect_predicate=None):
    """
    expect_status: если задан — ожидаем именно такой httpStatus в ответе
    (handler отдаёт ответ через ag.json_response/error_response, а не
    бросает исключение наружу — это HTTP-обёртка, а не прямой вызов
    auth_guard). expect_predicate: доп. функция(resp_json) -> bool.
    """
    try:
        resp = fn()
        status = resp.get('statusCode')
        payload = json.loads(resp.get('body') or '{}')
        ok = True
        detail = f'{status}'
        if expect_status is not None and status != expect_status:
            ok = False
            detail = f'ожидался {expect_status}, получен {status} ({payload})'
        if ok and expect_predicate is not None:
            pred_ok = expect_predicate(payload)
            if not pred_ok:
                ok = False
                detail = f'предикат не выполнен: {payload}'
        if ok:
            detail = f'{status} {payload if len(str(payload)) < 120 else ""}'.strip()
        results.append((ok, name, detail))
    except Exception as exc:  # noqa: BLE001
        results.append((False, name, f'неожиданное исключение: {type(exc).__name__}: {exc}'))


def reset_state():
    CONSENTS.clear()
    RECIPIENTS.clear()
    CONSENT_EVENTS.clear()
    set_geo_flags(True)


def main():
    # ================================================================
    # СЦЕНАРИЙ F (chek-лист, Раздел 4/6): add_recipient → pending →
    # confirm_recipient → active → revoke_recipient → revoked,
    # на демо-семье из V0354, через реальный handler().
    # ================================================================

    # --- F1. Владелец (Анна) даёт согласие САМА НА СЕБЯ, получателей
    # пока нет. Получателя добавляет она же (is_self=True) → сразу active.
    reset_state()
    give_consent(OWNER_MEMBER, granted_by_member_id=OWNER_MEMBER, role='self')

    check(
        'F1. add_recipient самим субъектом → сразу active (без pending)',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'add_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=200,
        expect_predicate=lambda p: p.get('status') == 'active' and p.get('awaiting_confirmation') is False,
    )

    ok = RECIPIENTS.get('consent-qa-1', {}).get(PARENT_MEMBER, {}).get('status') == 'active'
    results.append((ok, 'F1b. в фейковой БД получатель действительно active',
                    'ok' if ok else str(RECIPIENTS)))

    ev = [e for e in CONSENT_EVENTS if e['action'] == 'recipient_added']
    ok = len(ev) == 1 and ev[0]['details'].get('status') == 'active'
    results.append((ok, 'F1c. событие recipient_added записано с status=active',
                    'ok' if ok else str(ev)))

    # --- F2. Представитель (Иван) добавляет получателя (себя) для
    # согласия РЕБЁНКА, выданного им же как представителем → должен
    # получить статус 'pending', а не сразу 'active'.
    reset_state()
    give_consent(CHILD_MEMBER, granted_by_member_id=PARENT_MEMBER, role='legal_representative')

    check(
        'F2. add_recipient представителем за ребёнка → pending (не active)',
        lambda: location_consent.handler(
            event('PUT', 'tok-parent', {
                'action': 'add_recipient',
                'subject_member_id': CHILD_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=200,
        expect_predicate=lambda p: p.get('status') == 'pending' and p.get('awaiting_confirmation') is True,
    )

    # --- F3. Пока получатель 'pending', он НЕ входит в load_active_location_consent
    # (это ядро утверждения из чеклиста, раздел 4: "pending не видит координаты").
    consent = ag.load_active_location_consent(CHILD_MEMBER)
    ok = consent is not None and PARENT_MEMBER not in (consent.get('recipients') or [])
    results.append((ok, 'F3. pending-получатель отсутствует в recipients действующего согласия',
                    'ok' if ok else str(consent)))

    # --- F4. Подтвердить может ТОЛЬКО сам субъект (ребёнок), не
    # представитель, даже если это он же добавлял получателя.
    # У ребёнка в этом тесте нет собственной сессии/токена (account_type='full',
    # но токена не заведено) — проверяем отказ 403 при попытке представителя
    # подтвердить за ребёнка.
    check(
        'F4. confirm_recipient представителем (не субъектом) → 403',
        lambda: location_consent.handler(
            event('PUT', 'tok-parent', {
                'action': 'confirm_recipient',
                'subject_member_id': CHILD_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=403,
    )

    # --- F5. revoke_recipient доступен тому, кто выдавал согласие
    # (представителю), без подтверждения второй стороны.
    check(
        'F5. revoke_recipient представителем (granted_by) → 200, status=revoked',
        lambda: location_consent.handler(
            event('PUT', 'tok-parent', {
                'action': 'revoke_recipient',
                'subject_member_id': CHILD_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=200,
        expect_predicate=lambda p: p.get('status') == 'revoked',
    )

    ok = RECIPIENTS.get('consent-qa-1', {}).get(PARENT_MEMBER, {}).get('status') == 'revoked'
    results.append((ok, 'F5b. в фейковой БД получатель действительно revoked',
                    'ok' if ok else str(RECIPIENTS)))

    ev = [e for e in CONSENT_EVENTS if e['action'] == 'recipient_revoked']
    ok = len(ev) == 1
    results.append((ok, 'F5c. событие recipient_revoked записано',
                    'ok' if ok else str(ev)))

    # --- F6. Нельзя добавить получателя без действующего согласия
    # (LOCATION_CONSENT_REQUIRED, 403) — сначала нужно согласие, потом
    # управление получателями.
    reset_state()
    check(
        'F6. add_recipient без действующего согласия → 403 LOCATION_CONSENT_REQUIRED',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'add_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=403,
    )

    # --- F7. Нельзя назначить самого субъекта своим же получателем.
    give_consent(OWNER_MEMBER, granted_by_member_id=OWNER_MEMBER, role='self')
    check(
        'F7. subject == recipient → 400',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'add_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': OWNER_MEMBER,
            }), None),
        expect_status=400,
    )

    # --- F8. Получатель обязан быть активным участником ТОЙ ЖЕ семьи —
    # попытка назначить участника чужой семьи получателем отклоняется.
    check(
        'F8. получатель из чужой семьи → 404 (не подтверждаем существование)',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'add_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': FOREIGN_MEMBER,
            }), None),
        expect_status=404,
    )

    # --- F9. Неизвестное действие в PUT → 400, чёткая ошибка, а не 500.
    check(
        'F9. неизвестное action в PUT → 400',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'do_something_else',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=400,
    )

    # --- F10. Без сессии PUT отклоняется до разбора действия (401),
    # соответствует backend/location-consent/tests.json.
    check(
        'F10. PUT без токена → 401',
        lambda: location_consent.handler(
            event('PUT', None, {
                'action': 'add_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=401,
    )

    # ================================================================
    # СЦЕНАРИЙ G (чеклист, Раздел 6): emergency kill switch.
    #
    # НАЙДЕНО ЭТИМ QA-ПРОГОНОМ (до исправления): kill switch не
    # проверялся в _grant/_set_collection(enable)/_manage_recipient
    # (add/confirm), хотя его описание в БД (feature_flags.description)
    # обещает «блокирует ВСЕ операции с геоданными независимо от
    # остальных geo-флагов». Реального сбора/показа координат это не
    # открывало (family-tracker и geofences свою проверку kill switch
    # имеют), но давало возможность оформлять согласия и расширять круг
    # получателей в обход аварийной остановки — несогласованность между
    # тем, что обещано в БД, и тем, что делал код.
    #
    # ИСПРАВЛЕНО в рамках этого же QA: добавлена явная проверка
    # ag.geo_kill_switch_active() в _grant, в ветке enabled=True
    # _set_collection и в add_recipient/confirm_recipient. GET статуса
    # и revoke_recipient сознательно НЕ блокируются — просмотр своего
    # статуса и отзыв доступа не должны зависеть от аварийной остановки
    # сбора, иначе kill switch сам стал бы препятствием для отзыва.
    # ================================================================
    reset_state()
    give_consent(OWNER_MEMBER, granted_by_member_id=OWNER_MEMBER, role='self')
    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = True

    check(
        'G1. kill switch включён: GET статуса согласия → 200 (просмотр '
        'статуса не блокируется, это не сбор/показ координат)',
        lambda: location_consent.handler(event('GET', 'tok-owner'), None),
        expect_status=200,
    )

    check(
        'G2. kill switch включён: add_recipient → 503 (исправлено)',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'add_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        expect_status=503,
    )

    check(
        'G2b. kill switch включён: revoke_recipient всё же доступен → 200 '
        '(прекращение доступа не блокируется kill switch намеренно)',
        lambda: location_consent.handler(
            event('PUT', 'tok-owner', {
                'action': 'revoke_recipient',
                'subject_member_id': OWNER_MEMBER,
                'recipient_member_id': PARENT_MEMBER,
            }), None),
        # PARENT_MEMBER не был добавлен получателем (G2 отклонён 503),
        # поэтому revoke не находит запись — но это ветка после
        # kill-switch проверки, отвечает статусом 200/"revoked" даже
        # для отсутствующей записи (см. _revoke_recipient: rowcount=0
        # не считается ошибкой). Важно здесь то, что запрос НЕ упал в 503.
        expect_status=200,
    )

    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = False

    # --- G3. Выдача нового согласия (_grant, POST) при kill switch
    # блокируется 503 — проверка добавлена самой первой в функции.
    reset_state()
    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = True
    check(
        'G3. kill switch включён: POST (выдача нового согласия) → 503',
        lambda: location_consent.handler(
            event('POST', 'tok-owner', {
                'subject_member_id': OWNER_MEMBER,
                'text_version': CONSENT_TEXT_VERSION,
                'retention_days': 7,
            }), None),
        expect_status=503,
    )
    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = False

    # --- G4. Возобновление сбора (_set_collection, enabled=true) при
    # kill switch тоже блокируется 503.
    reset_state()
    give_consent(OWNER_MEMBER, granted_by_member_id=OWNER_MEMBER, role='self')
    CONSENTS[OWNER_MEMBER]['collection_enabled'] = False
    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = True
    check(
        'G4. kill switch включён: PATCH collection_enabled=true → 503',
        lambda: location_consent.handler(
            event('PATCH', 'tok-owner', {
                'subject_member_id': OWNER_MEMBER,
                'collection_enabled': True,
            }), None),
        expect_status=503,
    )

    # --- G5. Но ВЫКЛЮЧЕНИЕ сбора (PATCH collection_enabled=false) при
    # kill switch по-прежнему доступно — прекращение обработки не
    # должно требовать, чтобы функция сначала была включена.
    check(
        'G5. kill switch включён: PATCH collection_enabled=false → 200 '
        '(выключить можно всегда)',
        lambda: location_consent.handler(
            event('PATCH', 'tok-owner', {
                'subject_member_id': OWNER_MEMBER,
                'collection_enabled': False,
            }), None),
        expect_status=200,
    )
    ag._geo_flag_cache[ag.GEO_KILL_SWITCH_FLAG] = False

    # ---------- ОТЧЁТ ----------
    passed = sum(1 for ok, _, _ in results if ok)
    total = len(results)
    print()
    for ok, name, detail in results:
        print(f'  {"PASS" if ok else "FAIL"}  {name}  [{detail}]')
    print(f'\n{passed}/{total} проверок пройдено')
    print(f'записано consent-событий: {len(CONSENT_EVENTS)}')
    return 0 if passed == total else 1


if __name__ == '__main__':
    sys.exit(main())