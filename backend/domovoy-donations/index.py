"""
Backend функция для обработки донатов Домового.
Управление уровнями, донатами и настройками пользователя.
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработка запросов для системы донатов Домового
    
    GET /domovoy-donations - получить уровень и настройки
    POST /domovoy-donations?action=donate - создать донат
    POST /domovoy-donations?action=update-settings - обновить настройки ассистента
    """
    method = event.get('httpMethod', 'GET')
    
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
    
    # Получаем токен пользователя
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


def handle_donate(cursor, conn, user_id: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Обработка доната"""
    
    amount = body.get('amount')
    payment_method = body.get('payment_method')
    
    if not amount or not payment_method:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите amount и payment_method'})
        }
    
    if amount < 100:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Минимальная сумма - 100₽'})
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
    
    # Записываем донат
    cursor.execute(
        """INSERT INTO t_p5815085_family_assistant_pro.domovoy_donations 
           (user_id, amount, payment_method, level_before, level_after, payment_status) 
           VALUES (%s, %s, %s, %s, %s, 'completed')""",
        (user_id, amount, payment_method, current_level, new_level)
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
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'level_before': current_level,
            'level_after': new_level,
            'amount': amount,
            'total_donated': new_total
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