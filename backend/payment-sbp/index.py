"""
Business: создание платежей через СБП (ЮKassa) и проверка их статуса
Args: event с httpMethod, body (amount, description, return_url), headers X-Auth-Token (обязательно)
Returns: JSON со ссылкой на оплату или статусом платежа

────────────────────────────────────────────────────────────────────────────
МОДЕЛЬ ДОСТУПА (волна 2, P0)

До этой правки функция вообще не проверяла личность: любой мог создать
платёж от чужого имени, а GET по payment_id раскрывал сумму и статус
чужой оплаты (перебор идентификаторов). Платёжные операции критичны
независимо от объёма данных, поэтому:

  POST — require_session, сумма валидируется по белому списку тарифов,
         платёж записывается в payments с family_id/user_id из СЕССИИ;
  GET  — платёж отдаётся только если он принадлежит семье актора.

Сумма НЕ берётся из тела запроса произвольно: иначе подписку можно
оформить за 1 рубль. Клиент присылает код тарифа, цену определяет сервер.
"""

import json
import os
import uuid
from decimal import Decimal
from typing import Any, Dict

import psycopg2
from psycopg2.extras import RealDictCursor
from yookassa import Configuration, Payment

from auth_guard import (
    AuthContext,
    AuthError,
    audit_allowed,
    error_response,
    json_response,
    preflight,
    require_session,
)

Configuration.account_id = os.environ['YOOKASSA_SHOP_ID']
Configuration.secret_key = os.environ['YOOKASSA_SECRET_KEY']

SCHEMA = 't_p5815085_family_assistant_pro'
MODULE = 'finance'

# Цену определяет сервер. Тело запроса задаёт только КОД тарифа.
PLANS: Dict[str, Dict[str, Any]] = {
    'premium_month': {'amount': Decimal('299'), 'title': 'Премиум — 1 месяц'},
    'premium_year': {'amount': Decimal('2990'), 'title': 'Премиум — 1 год'},
    'family_month': {'amount': Decimal('499'), 'title': 'Семейный — 1 месяц'},
    'family_year': {'amount': Decimal('4990'), 'title': 'Семейный — 1 год'},
}

ALLOWED_RETURN_HOSTS = ('https://nasha-semiya.ru',)


def _connect():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))


def _safe_return_url(candidate: Any) -> str:
    """Открытый редирект: return_url принимаем только на свой домен."""
    if isinstance(candidate, str):
        for host in ALLOWED_RETURN_HOSTS:
            if candidate.startswith(host):
                return candidate
    return 'https://nasha-semiya.ru/'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return preflight(event)

    try:
        ctx = require_session(event)

        if method == 'POST':
            return _create_payment(ctx, event)
        if method == 'GET':
            return _payment_status(ctx, event)

        return json_response({'error': 'Method not allowed'}, 405, event)

    except AuthError as exc:
        return error_response(exc, event)
    except Exception:
        # Наружу не отдаём текст исключения: он может содержать ключи ЮKassa.
        return json_response({'error': 'Ошибка обработки платежа'}, 500, event)


def _create_payment(ctx: AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return json_response({'error': 'Invalid JSON'}, 400, event)

    plan_code = body.get('plan')
    plan = PLANS.get(plan_code) if isinstance(plan_code, str) else None
    if not plan:
        return json_response(
            {'error': 'Неизвестный тариф', 'plans': sorted(PLANS)}, 400, event)

    return_url = _safe_return_url(body.get('return_url'))
    idempotence_key = uuid.uuid4()

    payment = Payment.create({
        'amount': {'value': f"{plan['amount']:.2f}", 'currency': 'RUB'},
        'confirmation': {'type': 'redirect', 'return_url': return_url},
        'capture': True,
        'description': plan['title'],
        'payment_method_data': {'type': 'sbp'},
        'metadata': {'family_id': str(ctx.family_id), 'user_id': str(ctx.user_id)},
    }, idempotence_key)

    conn = _connect()
    try:
        cursor = conn.cursor()
        cursor.execute(
            f"""
            INSERT INTO {SCHEMA}.payments
                (family_id, user_id, amount, currency, status, payment_id,
                 payment_method, description, created_at)
            VALUES (%s, %s, %s, 'RUB', %s, %s, 'sbp', %s, NOW())
            """,
            (ctx.family_id, ctx.user_id, plan['amount'], payment.status,
             payment.id, plan['title']),
        )
        conn.commit()
        cursor.close()
    finally:
        conn.close()

    audit_allowed(ctx, MODULE, 'create', resource_type='payment',
                  resource_id=str(payment.id))

    return json_response({
        'payment_id': payment.id,
        'confirmation_url': payment.confirmation.confirmation_url,
        'status': payment.status,
        'amount': f"{plan['amount']:.2f}",
    }, 200, event)


def _payment_status(ctx: AuthContext, event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    payment_id = params.get('payment_id')

    if not payment_id:
        return json_response({'error': 'Не указан payment_id'}, 400, event)

    # Сначала проверяем принадлежность платежа семье актора — только потом
    # обращаемся к ЮKassa. Иначе перебор payment_id раскрывает чужие суммы.
    conn = _connect()
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            f"""
            SELECT id::text, family_id::text AS family_id, user_id::text AS user_id
            FROM {SCHEMA}.payments
            WHERE payment_id = %s
            """,
            (payment_id,),
        )
        row = cursor.fetchone()
        cursor.close()
    finally:
        conn.close()

    if not row or str(row['family_id']) != str(ctx.family_id):
        # 404 и для чужого, и для несуществующего: не подтверждаем наличие.
        raise AuthError(404, 'RESOURCE_NOT_FOUND')

    payment = Payment.find_one(payment_id)

    audit_allowed(ctx, MODULE, 'read', resource_type='payment',
                  resource_id=str(payment_id))

    return json_response({
        'payment_id': payment.id,
        'status': payment.status,
        'amount': payment.amount.value,
        'paid': payment.paid,
    }, 200, event)

# redeploy marker: wave-3 authz
