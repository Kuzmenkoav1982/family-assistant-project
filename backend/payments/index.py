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
    'basic': {'name': 'Базовый', 'price': 299, 'months': 1},
    'standard': {'name': 'Стандарт', 'price': 799, 'months': 3},
    'premium': {'name': 'Премиум', 'price': 2499, 'months': 12}
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

def create_yookassa_payment(amount: float, description: str, return_url: str) -> Dict[str, Any]:
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
        'description': description
    }
    
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
        response = urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        return {
            'success': True,
            'payment_id': result['id'],
            'confirmation_url': result['confirmation']['confirmation_url'],
            'status': result['status']
        }
    except Exception as e:
        return {'error': f'Ошибка создания платежа: {str(e)}'}

def create_subscription(family_id: str, user_id: str, plan_type: str, return_url: str) -> Dict[str, Any]:
    if plan_type not in PLANS:
        return {'error': 'Неверный тип подписки'}
    
    plan = PLANS[plan_type]
    
    payment_result = create_yookassa_payment(
        plan['price'],
        f"Подписка {plan['name']} - Семейный Органайзер",
        return_url
    )
    
    if 'error' in payment_result:
        return payment_result
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        end_date = datetime.now() + timedelta(days=30 * plan['months'])
        safe_family_id = family_id.replace("'", "''")
        safe_plan_type = plan_type.replace("'", "''")
        safe_end_date = end_date.strftime('%Y-%m-%d %H:%M:%S')
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.subscriptions
            (family_id, plan_type, status, amount, end_date)
            VALUES ('{safe_family_id}', '{safe_plan_type}', 'pending', {plan['price']}, '{safe_end_date}')
            RETURNING id
            """
        )
        subscription = cur.fetchone()
        
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
            'plan': plan['name'],
            'amount': plan['price']
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def get_subscription_status(family_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_family_id = family_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT id, plan_type, status, amount, start_date, end_date, auto_renew
        FROM {SCHEMA}.subscriptions
        WHERE family_id = '{safe_family_id}' AND status = 'active'
        ORDER BY end_date DESC LIMIT 1
        """
    )
    subscription = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not subscription:
        return {
            'has_subscription': False,
            'message': 'Нет активной подписки'
        }
    
    return {
        'has_subscription': True,
        'plan': PLANS.get(subscription['plan_type'], {}).get('name', 'Неизвестно'),
        'status': subscription['status'],
        'end_date': subscription['end_date'].isoformat(),
        'auto_renew': subscription['auto_renew']
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
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
        
        if method == 'GET':
            result = get_subscription_status(family_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'create':
                plan_type = body.get('plan_type', 'basic')
                return_url = body.get('return_url', 'https://example.com')
                
                result = create_subscription(family_id, user_id, plan_type, return_url)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps(result)
                }
        
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