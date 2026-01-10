"""
Business: Управление подписками и платежами через ЮKassa
Args: event с httpMethod, body (action, plan_type), headers с X-Auth-Token
Returns: JSON с URL оплаты или статусом подписки
"""

import json
import os
import uuid
import base64
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.request import urlopen, Request

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'
YOOKASSA_SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
YOOKASSA_SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', '')

PLANS = {
    'ai_assistant': {'name': 'AI-помощник', 'price': 200, 'months': 1},
    'full': {'name': 'Полный пакет', 'price': 500, 'months': 1}
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_token = token.replace("'", "''")
    cur.execute(
        f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = '{safe_token}' AND expires_at > CURRENT_TIMESTAMP
        """
    )
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_user_id = user_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id = '{safe_user_id}' LIMIT 1
        """
    )
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member else None

def get_user_email(user_id: str) -> str:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_user_id = user_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT email FROM {SCHEMA}.users 
        WHERE id = '{safe_user_id}' LIMIT 1
        """
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    return user['email'] if user and user['email'] else 'support@nasha-semiya.ru'

def create_yookassa_payment(amount: float, description: str, return_url: str, metadata: dict = None) -> Dict[str, Any]:
    """Создаёт платёж в ЮКассе через REST API"""
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {
            'value': f'{amount:.2f}',
            'currency': 'RUB'
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': return_url
        },
        'capture': True,
        'description': description,
        'receipt': {
            'customer': {
                'email': metadata.get('user_email', 'support@nasha-semiya.ru') if metadata else 'support@nasha-semiya.ru'
            },
            'items': [
                {
                    'description': description,
                    'quantity': '1',
                    'amount': {
                        'value': f'{amount:.2f}',
                        'currency': 'RUB'
                    },
                    'vat_code': 1,
                    'payment_mode': 'full_payment',
                    'payment_subject': 'service'
                }
            ]
        }
    }
    
    if metadata:
        payment_data['metadata'] = metadata
    
    print(f'[YooKassa] SHOP_ID: {YOOKASSA_SHOP_ID}')
    print(f'[YooKassa] SECRET_KEY exists: {bool(YOOKASSA_SECRET_KEY)}')
    print(f'[YooKassa] Payment data: {payment_data}')
    
    auth_string = f'{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}'
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    req = Request(
        'https://api.yookassa.ru/v3/payments',
        data=json.dumps(payment_data).encode('utf-8'),
        headers={
            'Authorization': f'Basic {auth_b64}',
            'Idempotence-Key': idempotence_key,
            'Content-Type': 'application/json'
        }
    )
    
    try:
        print('[YooKassa] Sending request...')
        response = urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        print(f'[YooKassa] Success! Result: {result}')
        return {
            'success': True,
            'payment_id': result['id'],
            'confirmation_url': result['confirmation']['confirmation_url'],
            'status': result['status']
        }
    except Exception as e:
        print(f'[YooKassa] ERROR: {str(e)}')
        # Попробуем прочитать тело ошибки
        if hasattr(e, 'read'):
            error_body = e.read().decode('utf-8')
            print(f'[YooKassa] Error body: {error_body}')
            return {'error': f'Ошибка создания платежа: {str(e)} | Body: {error_body}'}
        return {'error': f'Ошибка создания платежа: {str(e)}'}

def get_payment_status(payment_id: str) -> Dict[str, Any]:
    """Получает статус платежа из ЮКассы"""
    auth_string = f'{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}'
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    req = Request(
        f'https://api.yookassa.ru/v3/payments/{payment_id}',
        headers={
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/json'
        }
    )
    
    try:
        response = urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        return {
            'success': True,
            'status': result['status'],
            'paid': result.get('paid', False),
            'payment_method': result.get('payment_method', {}).get('type')
        }
    except Exception as e:
        return {'error': f'Ошибка проверки платежа: {str(e)}'}

def create_subscription(family_id: str, user_id: str, plan_type: str, return_url: str, force: bool = False) -> Dict[str, Any]:
    """Создаёт подписку и инициирует платёж. Проверяет наличие активной подписки."""
    print(f'[create_subscription] family_id={family_id}, user_id={user_id}, plan_type={plan_type}, force={force}')
    
    if plan_type not in PLANS:
        print(f'[create_subscription] ERROR: plan_type not in PLANS')
        return {'error': 'Неверный тип подписки'}
    
    # Проверяем наличие активной подписки
    current_subscription = get_subscription_status(family_id)
    if current_subscription['has_subscription'] and not force:
        print(f'[create_subscription] WARN: Active subscription exists')
        return {
            'error': 'active_subscription_exists',
            'message': 'У семьи уже есть активная подписка',
            'current_subscription': current_subscription,
            'upgrade_available': current_subscription['plan'] == 'ai_assistant' and plan_type == 'full',
            'extend_available': current_subscription['plan'] == plan_type
        }
    
    plan = PLANS[plan_type]
    print(f'[create_subscription] Plan: {plan}')
    
    # Получаем email пользователя для чека
    user_email = get_user_email(user_id)
    print(f'[create_subscription] User email: {user_email}')
    
    # Создаём платёж в ЮКассе
    print(f'[create_subscription] Creating YooKassa payment...')
    payment_result = create_yookassa_payment(
        plan['price'],
        f"Подписка {plan['name']} - Семейный Органайзер",
        return_url,
        metadata={
            'family_id': family_id,
            'user_id': user_id,
            'plan_type': plan_type,
            'user_email': user_email
        }
    )
    
    print(f'[create_subscription] YooKassa result: {payment_result}')
    
    if 'error' in payment_result:
        print(f'[create_subscription] ERROR from YooKassa: {payment_result["error"]}')
        return payment_result
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Создаём подписку со статусом pending
        end_date = datetime.now() + timedelta(days=30 * plan['months'])
        safe_family_id = family_id.replace("'", "''")
        safe_plan_type = plan_type.replace("'", "''")
        safe_end_date = end_date.strftime('%Y-%m-%d %H:%M:%S')
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.subscriptions
            (family_id, plan_type, status, amount, end_date, payment_provider)
            VALUES ('{safe_family_id}', '{safe_plan_type}', 'pending', {plan['price']}, '{safe_end_date}', 'yookassa')
            RETURNING id
            """
        )
        subscription = cur.fetchone()
        
        # Сохраняем информацию о платеже
        safe_user_id = user_id.replace("'", "''")
        safe_payment_id = payment_result['payment_id'].replace("'", "''")
        safe_description = f"Подписка {plan['name']}".replace("'", "''")
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.payments
            (subscription_id, family_id, user_id, amount, status, payment_id, description)
            VALUES ('{subscription['id']}', '{safe_family_id}', '{safe_user_id}', {plan['price']}, 'pending', '{safe_payment_id}', '{safe_description}')
            """
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'subscription_id': str(subscription['id']),
            'payment_url': payment_result['confirmation_url'],
            'payment_id': payment_result['payment_id'],
            'plan': plan['name'],
            'amount': plan['price']
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def extend_subscription(family_id: str, user_id: str, return_url: str) -> Dict[str, Any]:
    """Продлевает текущую подписку на месяц"""
    current_subscription = get_subscription_status(family_id)
    
    if not current_subscription['has_subscription']:
        return {'error': 'Нет активной подписки для продления'}
    
    plan_type = current_subscription['plan']
    plan = PLANS[plan_type]
    user_email = get_user_email(user_id)
    
    # Создаём платёж
    payment_result = create_yookassa_payment(
        plan['price'],
        f"Продление подписки {plan['name']} - Семейный Органайзер",
        return_url,
        metadata={
            'family_id': family_id,
            'user_id': user_id,
            'plan_type': plan_type,
            'action': 'extend',
            'user_email': user_email
        }
    )
    
    if 'error' in payment_result:
        return payment_result
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Новая дата окончания = текущая end_date + 30 дней
        safe_family_id = family_id.replace("'", "''")
        safe_plan_type = plan_type.replace("'", "''")
        
        cur.execute(
            f"""
            SELECT end_date FROM {SCHEMA}.subscriptions
            WHERE family_id = '{safe_family_id}' AND status = 'active' AND plan_type = '{safe_plan_type}'
            ORDER BY end_date DESC LIMIT 1
            """
        )
        current = cur.fetchone()
        
        if not current:
            conn.rollback()
            return {'error': 'Активная подписка не найдена'}
        
        new_end_date = current['end_date'] + timedelta(days=30)
        safe_end_date = new_end_date.strftime('%Y-%m-%d %H:%M:%S')
        
        # Создаём новую подписку (продление)
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.subscriptions
            (family_id, plan_type, status, amount, end_date, payment_provider)
            VALUES ('{safe_family_id}', '{safe_plan_type}', 'pending', {plan['price']}, '{safe_end_date}', 'yookassa')
            RETURNING id
            """
        )
        subscription = cur.fetchone()
        
        # Сохраняем платёж
        safe_user_id = user_id.replace("'", "''")
        safe_payment_id = payment_result['payment_id'].replace("'", "''")
        safe_description = f"Продление подписки {plan['name']}".replace("'", "''")
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.payments
            (subscription_id, family_id, user_id, amount, status, payment_id, description)
            VALUES ('{subscription['id']}', '{safe_family_id}', '{safe_user_id}', {plan['price']}, 'pending', '{safe_payment_id}', '{safe_description}')
            """
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'action': 'extend',
            'subscription_id': str(subscription['id']),
            'payment_url': payment_result['confirmation_url'],
            'payment_id': payment_result['payment_id'],
            'new_end_date': new_end_date.isoformat(),
            'plan': plan['name'],
            'amount': plan['price']
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def upgrade_subscription(family_id: str, user_id: str, new_plan_type: str, return_url: str) -> Dict[str, Any]:
    """Апгрейд подписки с ai_assistant на full"""
    current_subscription = get_subscription_status(family_id)
    
    if not current_subscription['has_subscription']:
        return {'error': 'Нет активной подписки для апгрейда'}
    
    current_plan = current_subscription['plan']
    
    if current_plan != 'ai_assistant' or new_plan_type != 'full':
        return {'error': 'Апгрейд доступен только с AI-помощник на Полный пакет'}
    
    # Рассчитываем пропорциональную стоимость
    days_left = current_subscription.get('days_left', 0)
    old_price = PLANS['ai_assistant']['price']
    new_price = PLANS['full']['price']
    
    # Возвращаем пропорцию от старой подписки
    refund = (old_price / 30) * days_left
    upgrade_cost = new_price - refund
    
    plan = PLANS[new_plan_type]
    user_email = get_user_email(user_id)
    
    # Создаём платёж на разницу
    payment_result = create_yookassa_payment(
        upgrade_cost,
        f"Апгрейд подписки до {plan['name']} - Семейный Органайзер",
        return_url,
        metadata={
            'family_id': family_id,
            'user_id': user_id,
            'plan_type': new_plan_type,
            'action': 'upgrade',
            'old_plan': current_plan,
            'user_email': user_email
        }
    )
    
    if 'error' in payment_result:
        return payment_result
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        safe_family_id = family_id.replace("'", "''")
        safe_plan_type = new_plan_type.replace("'", "''")
        
        # Получаем текущую подписку
        cur.execute(
            f"""
            SELECT id, end_date FROM {SCHEMA}.subscriptions
            WHERE family_id = '{safe_family_id}' AND status = 'active' AND plan_type = 'ai_assistant'
            ORDER BY end_date DESC LIMIT 1
            """
        )
        current = cur.fetchone()
        
        if not current:
            conn.rollback()
            return {'error': 'Активная подписка не найдена'}
        
        # Деактивируем старую подписку
        cur.execute(
            f"""
            UPDATE {SCHEMA}.subscriptions
            SET status = 'upgraded', updated_at = CURRENT_TIMESTAMP
            WHERE id = '{current['id']}'
            """
        )
        
        # Создаём новую подписку с тем же сроком окончания
        safe_end_date = current['end_date'].strftime('%Y-%m-%d %H:%M:%S')
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.subscriptions
            (family_id, plan_type, status, amount, end_date, payment_provider)
            VALUES ('{safe_family_id}', '{safe_plan_type}', 'pending', {upgrade_cost}, '{safe_end_date}', 'yookassa')
            RETURNING id
            """
        )
        subscription = cur.fetchone()
        
        # Сохраняем платёж
        safe_user_id = user_id.replace("'", "''")
        safe_payment_id = payment_result['payment_id'].replace("'", "''")
        safe_description = f"Апгрейд до {plan['name']}".replace("'", "''")
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.payments
            (subscription_id, family_id, user_id, amount, status, payment_id, description)
            VALUES ('{subscription['id']}', '{safe_family_id}', '{safe_user_id}', {upgrade_cost}, 'pending', '{safe_payment_id}', '{safe_description}')
            """
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'action': 'upgrade',
            'subscription_id': str(subscription['id']),
            'payment_url': payment_result['confirmation_url'],
            'payment_id': payment_result['payment_id'],
            'plan': plan['name'],
            'amount': upgrade_cost,
            'refund': refund,
            'original_price': new_price
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def check_payment_and_activate(payment_id: str) -> Dict[str, Any]:
    """Проверяет статус платежа и активирует подписку при успехе"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Получаем платёж из БД
        safe_payment_id = payment_id.replace("'", "''")
        cur.execute(
            f"""
            SELECT * FROM {SCHEMA}.payments 
            WHERE payment_id = '{safe_payment_id}'
            """
        )
        payment = cur.fetchone()
        
        if not payment:
            return {'error': 'Платёж не найден'}
        
        # Проверяем статус в ЮКассе
        status_result = get_payment_status(payment_id)
        
        if 'error' in status_result:
            return status_result
        
        # Обновляем статус платежа
        cur.execute(
            f"""
            UPDATE {SCHEMA}.payments 
            SET status = '{status_result["status"]}', payment_method = '{status_result.get("payment_method", "")}'
            WHERE payment_id = '{safe_payment_id}'
            """
        )
        
        # Если платёж успешен, активируем подписку
        if status_result['status'] == 'succeeded' and status_result['paid']:
            cur.execute(
                f"""
                UPDATE {SCHEMA}.subscriptions 
                SET status = 'active', start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = '{payment["subscription_id"]}'
                """
            )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'status': status_result['status'],
            'paid': status_result['paid']
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def handle_webhook(body: dict) -> Dict[str, Any]:
    """Обрабатывает webhook от ЮКассы о статусе платежа"""
    event_type = body.get('event')
    payment_obj = body.get('object', {})
    payment_id = payment_obj.get('id')
    metadata = payment_obj.get('metadata', {})
    
    print(f'[WEBHOOK] Event type: {event_type}')
    print(f'[WEBHOOK] Payment ID: {payment_id}')
    print(f'[WEBHOOK] Metadata: {metadata}')
    
    if event_type != 'payment.succeeded' or not payment_id:
        print(f'[WEBHOOK] Skipping event (not payment.succeeded or no payment_id)')
        return {'received': True}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Обновляем статус платежа
        safe_payment_id = payment_id.replace("'", "''")
        
        print(f'[WEBHOOK] Updating payment status for: {safe_payment_id}')
        
        cur.execute(
            f"""
            UPDATE {SCHEMA}.payments 
            SET status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = 'yookassa'
            WHERE payment_id = '{safe_payment_id}'
            RETURNING subscription_id
            """
        )
        payment = cur.fetchone()
        
        print(f'[WEBHOOK] Payment record: {payment}')
        
        if payment and payment['subscription_id']:
            print(f'[WEBHOOK] Activating subscription: {payment["subscription_id"]}')
            
            # Активируем подписку
            cur.execute(
                f"""
                UPDATE {SCHEMA}.subscriptions 
                SET status = 'active', start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = '{payment["subscription_id"]}'
                """
            )
            
            print(f'[WEBHOOK] Subscription activated successfully')
        else:
            print(f'[WEBHOOK] WARNING: No payment found or no subscription_id')
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f'[WEBHOOK] Success! Payment and subscription updated')
        return {'received': True, 'activated': True}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def get_subscription_status(family_id: str) -> Dict[str, Any]:
    """Получает активную подписку семьи с информацией о покупателе"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_family_id = family_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT s.id, s.plan_type, s.status, s.amount, s.start_date, s.end_date, s.auto_renew,
               p.user_id, u.name as buyer_name, u.email as buyer_email, p.paid_at
        FROM {SCHEMA}.subscriptions s
        LEFT JOIN {SCHEMA}.payments p ON p.subscription_id = s.id AND p.status = 'succeeded'
        LEFT JOIN {SCHEMA}.users u ON u.id = p.user_id
        WHERE s.family_id = '{safe_family_id}' AND s.status = 'active' AND s.end_date > CURRENT_TIMESTAMP
        ORDER BY s.end_date DESC LIMIT 1
        """
    )
    subscription = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not subscription:
        return {
            'has_subscription': False,
            'plan': 'free',
            'message': 'Нет активной подписки'
        }
    
    days_left = (subscription['end_date'] - datetime.now()).days if subscription['end_date'] else 0
    
    return {
        'has_subscription': True,
        'subscription_id': str(subscription['id']),
        'plan': subscription['plan_type'],
        'plan_name': PLANS.get(subscription['plan_type'], {}).get('name', 'Неизвестно'),
        'status': subscription['status'],
        'start_date': subscription['start_date'].isoformat() if subscription['start_date'] else None,
        'end_date': subscription['end_date'].isoformat() if subscription['end_date'] else None,
        'days_left': days_left,
        'auto_renew': subscription['auto_renew'],
        'buyer_name': subscription['buyer_name'],
        'buyer_email': subscription['buyer_email'],
        'purchased_at': subscription['paid_at'].isoformat() if subscription['paid_at'] else None
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        # Webhook от ЮКассы (без авторизации) - определяем по наличию event и object в body
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # Проверяем структуру вебхука ЮКассы
            if 'event' in body and 'object' in body:
                print(f'[WEBHOOK] Received YooKassa webhook: {body.get("event")}')
                result = handle_webhook(body)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
        
        # Все остальные запросы требуют авторизации
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        family_id = get_user_family_id(user_id)
        if not family_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Пользователь не состоит в семье'})
            }
        
        # GET /status - Получить статус подписки
        if method == 'GET':
            result = get_subscription_status(family_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
        
        # POST - Различные действия
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            print(f'[DEBUG] POST body: {body}')
            print(f'[DEBUG] Action: {action}')
            
            # Создать подписку
            if action == 'create':
                plan_type = body.get('plan_type')
                return_url = body.get('return_url', 'https://nasha-semiya.ru/pricing?status=success')
                force = body.get('force', False)
                
                print(f'[DEBUG] plan_type: {plan_type}')
                print(f'[DEBUG] return_url: {return_url}')
                print(f'[DEBUG] family_id: {family_id}')
                print(f'[DEBUG] user_id: {user_id}')
                print(f'[DEBUG] force: {force}')
                
                if not plan_type:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'plan_type обязателен'})
                    }
                
                print('[DEBUG] Calling create_subscription...')
                result = create_subscription(family_id, user_id, plan_type, return_url, force)
                print(f'[DEBUG] create_subscription result: {result}')
                
                if 'error' in result:
                    error_code = result.get('error')
                    status_code = 409 if error_code == 'active_subscription_exists' else 400
                    print(f'[DEBUG] Returning {status_code} with error: {result["error"]}')
                    return {
                        'statusCode': status_code,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            # Продлить подписку
            elif action == 'extend':
                return_url = body.get('return_url', 'https://nasha-semiya.ru/pricing?status=success')
                
                print(f'[DEBUG] Extending subscription for family_id: {family_id}')
                result = extend_subscription(family_id, user_id, return_url)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            # Апгрейд подписки
            elif action == 'upgrade':
                new_plan_type = body.get('plan_type', 'full')
                return_url = body.get('return_url', 'https://nasha-semiya.ru/pricing?status=success')
                
                print(f'[DEBUG] Upgrading subscription to {new_plan_type} for family_id: {family_id}')
                result = upgrade_subscription(family_id, user_id, new_plan_type, return_url)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            # Создать донат
            elif action == 'create_donation':
                amount = body.get('amount')
                return_url = body.get('return_url', 'https://nasha-semiya.ru/pricing?status=success')
                
                if not amount or amount < 50:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Минимальная сумма доната — 50₽'})
                    }
                
                user_email = get_user_email(user_id)
                
                payment_result = create_yookassa_payment(
                    amount,
                    f"Поддержка проекта Семейный Органайзер — {amount}₽",
                    return_url,
                    metadata={
                        'family_id': family_id,
                        'user_id': user_id,
                        'type': 'donation',
                        'user_email': user_email
                    }
                )
                
                if 'error' in payment_result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(payment_result)
                    }
                
                # Сохраняем информацию о донате
                conn = get_db_connection()
                cur = conn.cursor()
                
                try:
                    safe_user_id = user_id.replace("'", "''")
                    safe_payment_id = payment_result['payment_id'].replace("'", "''")
                    
                    cur.execute(
                        f"""
                        INSERT INTO {SCHEMA}.payments
                        (subscription_id, family_id, user_id, amount, payment_id, status, description)
                        VALUES (NULL, '{family_id.replace("'", "''")}', '{safe_user_id}', {amount}, '{safe_payment_id}', 'pending', 'Донат {amount}₽')
                        """
                    )
                    conn.commit()
                    cur.close()
                    conn.close()
                except Exception as e:
                    conn.rollback()
                    cur.close()
                    conn.close()
                    print(f'[ERROR] Failed to save donation: {str(e)}')
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'success': True,
                        'payment_url': payment_result['confirmation_url'],
                        'payment_id': payment_result['payment_id']
                    })
                }
            
            # Проверить статус платежа
            elif action == 'check_payment':
                payment_id = body.get('payment_id')
                
                if not payment_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'payment_id обязателен'})
                    }
                
                result = check_payment_and_activate(payment_id)
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }