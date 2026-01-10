"""
Backend функция для обработки донатов Домового.
Управление уровнями, донатами и настройками пользователя.
"""

import json
import os
import uuid
import base64
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from urllib.request import urlopen, Request


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработка запросов для системы донатов Домового
    
    GET /domovoy-donations - получить уровень и настройки
    POST /domovoy-donations?action=donate - создать донат
    POST /domovoy-donations?action=update-settings - обновить настройки ассистента
    POST /domovoy-donations?action=webhook - webhook от ЮКассы
    """
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    # CORS preflight
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
    
    # Webhook от ЮКассы (без авторизации)
    if method == 'POST' and action == 'webhook':
        dsn = os.environ.get('DATABASE_URL')
        try:
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            body = json.loads(event.get('body', '{}'))
            result = handle_webhook(cursor, conn, body)
            cursor.close()
            conn.close()
            return result
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    # Все остальные запросы требуют авторизации
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    # Подключение к БД
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'DATABASE_URL не настроен'})
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Получаем user_id по токену
        cursor.execute(
            "SELECT user_id FROM t_p5815085_family_assistant_pro.sessions WHERE token = %s AND expires_at > NOW()",
            (auth_token,)
        )
        session = cursor.fetchone()
        
        if not session:
            cursor.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Недействительный токен'})
            }
        
        user_id = session['user_id']
        
        if method == 'GET':
            result = handle_get(cursor, user_id)
            cursor.close()
            conn.close()
            return result
        
        elif method == 'POST':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', '')
            body_str = event.get('body', '{}')
            body = json.loads(body_str) if body_str else {}
            
            if action == 'donate':
                result = handle_donate(cursor, conn, user_id, body)
            elif action == 'update-settings':
                result = handle_update_settings(cursor, conn, user_id, body)
            else:
                result = {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
            
            cursor.close()
            conn.close()
            return result
        
        else:
            cursor.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }


def handle_get(cursor, user_id: str) -> Dict[str, Any]:
    """Получить текущий уровень и настройки пользователя"""
    
    # Получаем уровень Домового
    cursor.execute(
        "SELECT current_level, total_donated FROM t_p5815085_family_assistant_pro.domovoy_levels WHERE user_id = %s",
        (user_id,)
    )
    level_data = cursor.fetchone()
    
    if not level_data:
        # Создаем запись с начальным уровнем
        cursor.execute(
            "INSERT INTO t_p5815085_family_assistant_pro.domovoy_levels (user_id, current_level, total_donated) VALUES (%s, 1, 0) "
            "ON CONFLICT (user_id) DO NOTHING RETURNING current_level, total_donated",
            (user_id,)
        )
        level_data = cursor.fetchone() or {'current_level': 1, 'total_donated': 0}
    
    # Получаем настройки ассистента
    cursor.execute(
        "SELECT assistant_type, assistant_name, assistant_role, assistant_level FROM t_p5815085_family_assistant_pro.assistant_settings WHERE user_id = %s",
        (user_id,)
    )
    settings_data = cursor.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'level': level_data['current_level'],
            'total_donated': level_data['total_donated'],
            'settings': dict(settings_data) if settings_data else None
        })
    }


def create_yookassa_payment(amount: int, user_id: str, user_email: str) -> Dict[str, Any]:
    """Создаёт платёж доната в ЮКассе"""
    yookassa_shop_id = os.environ.get('YOOKASSA_SHOP_ID', '')
    yookassa_secret = os.environ.get('YOOKASSA_SECRET_KEY', '')
    
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
        'confirmation': {
            'type': 'redirect',
            'return_url': 'https://preview--family-assistant-project.poehali.dev/'
        },
        'capture': True,
        'description': f'Угощение Домового - {amount}₽',
        'metadata': {
            'user_id': user_id,
            'donation_type': 'domovoy',
            'amount': amount
        },
        'receipt': {
            'customer': {'email': user_email},
            'items': [{
                'description': f'Угощение Домового - повышение уровня',
                'quantity': '1',
                'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
                'vat_code': 1,
                'payment_mode': 'full_payment',
                'payment_subject': 'service'
            }]
        }
    }
    
    auth_string = f'{yookassa_shop_id}:{yookassa_secret}'
    auth_b64 = base64.b64encode(auth_string.encode('utf-8')).decode('ascii')
    
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
        
        # Проверяем наличие всех необходимых полей
        if 'id' not in result:
            return {'success': False, 'error': f'ЮКасса не вернула payment_id. Ответ: {result}'}
        
        if 'confirmation' not in result or 'confirmation_url' not in result['confirmation']:
            return {'success': False, 'error': f'ЮКасса не вернула confirmation_url. Ответ: {result}'}
        
        return {
            'success': True,
            'payment_id': result['id'],
            'confirmation_url': result['confirmation']['confirmation_url']
        }
    except Exception as e:
        import traceback
        return {'success': False, 'error': f'Ошибка запроса к ЮКасса: {str(e)}', 'trace': traceback.format_exc()}


def handle_donate(cursor, conn, user_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Создание платежа доната через ЮКассу"""
    
    try:
        amount = body.get('amount')
        payment_method = body.get('payment_method')
        
        print(f"[DONATE] user_id={user_id}, amount={amount}, payment_method={payment_method}")
        
        if not amount or not payment_method:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Укажите amount и payment_method'})
            }
        
        if amount < 100:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Минимальная сумма - 100₽'})
            }
        
        # Получаем email пользователя
        cursor.execute(
            "SELECT email FROM t_p5815085_family_assistant_pro.users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        user_email = user['email'] if user and user['email'] else 'support@nasha-semiya.ru'
        
        print(f"[DONATE] user_email={user_email}")
        
        # Создаём платёж в ЮКассе
        payment_result = create_yookassa_payment(amount, user_id, user_email)
        
        print(f"[DONATE] payment_result={payment_result}")
        
        if not payment_result.get('success'):
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': payment_result.get('error', 'Ошибка создания платежа'), 'details': payment_result})
            }
        
        # Получаем текущий уровень для записи в донат
        cursor.execute(
            "SELECT current_level FROM t_p5815085_family_assistant_pro.domovoy_levels WHERE user_id = %s",
            (user_id,)
        )
        level_row = cursor.fetchone()
        current_level = level_row['current_level'] if level_row else 1
        
        # Рассчитываем будущий уровень (каждые 500₽ = +1 уровень, максимум 10)
        levels_to_add = amount // 500 + 1
        future_level = min(10, current_level + levels_to_add)
        
        print(f"[DONATE] current_level={current_level}, future_level={future_level}")
        
        # Сохраняем информацию о платеже
        cursor.execute(
            """INSERT INTO t_p5815085_family_assistant_pro.domovoy_donations 
               (user_id, amount, payment_method, payment_id, payment_status, level_before, level_after) 
               VALUES (%s, %s, %s, %s, 'pending', %s, %s)
               RETURNING id""",
            (user_id, amount, payment_method, payment_result['payment_id'], current_level, future_level)
        )
        conn.commit()
        
    except Exception as e:
        import traceback
        print(f"[DONATE ERROR] {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': f'Ошибка обработки доната: {str(e)}'})
        }
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'payment_url': payment_result['confirmation_url'],
            'payment_id': payment_result['payment_id']
        })
    }


def handle_webhook(cursor, conn, body: Dict[str, Any]) -> Dict[str, Any]:
    """Обработка webhook от ЮКассы после оплаты"""
    event_type = body.get('event')
    payment_obj = body.get('object', {})
    payment_id = payment_obj.get('id')
    metadata = payment_obj.get('metadata', {})
    
    if event_type != 'payment.succeeded' or not payment_id:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'received': True})
        }
    
    # Проверяем, что это донат Домового
    if metadata.get('donation_type') != 'domovoy':
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'received': True})
        }
    
    user_id = metadata.get('user_id')
    amount = int(metadata.get('amount', 0))
    
    if not user_id or amount < 100:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid metadata'})
        }
    
    # Получаем текущий уровень
    cursor.execute(
        "SELECT current_level, total_donated FROM t_p5815085_family_assistant_pro.domovoy_levels WHERE user_id = %s",
        (user_id,)
    )
    level_data = cursor.fetchone()
    
    if not level_data:
        cursor.execute(
            "INSERT INTO t_p5815085_family_assistant_pro.domovoy_levels (user_id, current_level, total_donated) VALUES (%s, 1, 0) RETURNING current_level, total_donated",
            (user_id,)
        )
        level_data = cursor.fetchone()
    
    current_level = level_data['current_level']
    total_donated = level_data['total_donated']
    
    # Рассчитываем новый уровень (каждые 500₽ = +1 уровень, максимум 10)
    levels_to_add = amount // 500 + 1
    new_level = min(10, current_level + levels_to_add)
    new_total = total_donated + amount
    
    # Обновляем уровень
    cursor.execute(
        "UPDATE t_p5815085_family_assistant_pro.domovoy_levels SET current_level = %s, total_donated = %s, updated_at = NOW() WHERE user_id = %s",
        (new_level, new_total, user_id)
    )
    
    # Обновляем статус доната
    cursor.execute(
        """UPDATE t_p5815085_family_assistant_pro.domovoy_donations 
           SET payment_status = 'completed', level_before = %s, level_after = %s, paid_at = NOW()
           WHERE payment_id = %s""",
        (current_level, new_level, payment_id)
    )
    
    # Обновляем assistant_level в настройках
    cursor.execute(
        """INSERT INTO t_p5815085_family_assistant_pro.assistant_settings (user_id, assistant_type, assistant_level) 
           VALUES (%s, 'domovoy', %s) 
           ON CONFLICT (user_id) DO UPDATE SET assistant_level = %s, updated_at = NOW()""",
        (user_id, new_level, new_level)
    )
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'received': True,
            'activated': True,
            'new_level': new_level
        })
    }


def handle_update_settings(cursor, conn, user_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Обновление настроек ассистента"""
    
    assistant_type = body.get('assistant_type')
    assistant_name = body.get('assistant_name')
    assistant_role = body.get('assistant_role')
    
    if not assistant_type:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите assistant_type'})
        }
    
    # Получаем текущий уровень
    cursor.execute("SELECT current_level FROM t_p5815085_family_assistant_pro.domovoy_levels WHERE user_id = %s", (user_id,))
    level_data = cursor.fetchone()
    level = level_data['current_level'] if level_data else 1
    
    # Обновляем или создаем настройки
    cursor.execute(
        """INSERT INTO t_p5815085_family_assistant_pro.assistant_settings 
           (user_id, assistant_type, assistant_name, assistant_role, assistant_level) 
           VALUES (%s, %s, %s, %s, %s)
           ON CONFLICT (user_id) DO UPDATE 
           SET assistant_type = EXCLUDED.assistant_type,
               assistant_name = EXCLUDED.assistant_name,
               assistant_role = EXCLUDED.assistant_role,
               updated_at = NOW()""",
        (user_id, assistant_type, assistant_name, assistant_role, level)
    )
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'settings': {
                'assistant_type': assistant_type,
                'assistant_name': assistant_name,
                'assistant_role': assistant_role,
                'assistant_level': level
            }
        })
    }