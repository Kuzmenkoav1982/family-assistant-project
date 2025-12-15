"""
Backend: Admin API для управления донатами Домового, статистикой и настройками
Args: event с httpMethod, queryStringParameters, headers с X-Admin-Token
Returns: JSON с данными дашборда, донатов, настроек платежей или отчётов
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

ADMIN_TOKEN = 'admin_authenticated'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Admin API для управления донатами Домового
    
    GET ?action=dashboard - статистика
    GET ?action=donations - список всех донатов
    GET ?action=payment-settings - настройки платежей
    POST ?action=update-payment-settings - обновить реквизиты
    GET ?action=export - экспорт в Excel
    """
    method = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Проверка админ-токена
    headers = event.get('headers', {})
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token')
    
    if admin_token != ADMIN_TOKEN:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Требуется авторизация администратора'})
        }
    
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
        
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'dashboard')
        
        if method == 'GET':
            if action == 'dashboard':
                result = get_dashboard(cursor)
            elif action == 'donations':
                result = get_donations(cursor, params)
            elif action == 'payment-settings':
                result = get_payment_settings(cursor)
            elif action == 'export':
                result = export_donations(cursor, params)
            else:
                result = {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
        
        elif method == 'POST':
            body_str = event.get('body', '{}')
            body = json.loads(body_str) if body_str else {}
            
            if action == 'update-payment-settings':
                result = update_payment_settings(cursor, conn, body)
            else:
                result = {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Неизвестное действие'})
                }
        else:
            result = {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
        
        cursor.close()
        conn.close()
        return result
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }


def get_dashboard(cursor) -> Dict[str, Any]:
    """Получить статистику для дашборда"""
    
    # Общая статистика
    cursor.execute("""
        SELECT 
            COUNT(*) as total_donations,
            COUNT(DISTINCT user_id) as unique_users,
            SUM(amount) as total_revenue,
            AVG(amount) as avg_donation
        FROM domovoy_donations
        WHERE payment_status = 'completed'
    """)
    stats = cursor.fetchone()
    
    # Статистика по методам оплаты
    cursor.execute("""
        SELECT 
            payment_method,
            COUNT(*) as count,
            SUM(amount) as revenue
        FROM domovoy_donations
        WHERE payment_status = 'completed'
        GROUP BY payment_method
    """)
    payment_methods = cursor.fetchall()
    
    # Динамика по дням (последние 30 дней)
    cursor.execute("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as donations_count,
            SUM(amount) as daily_revenue
        FROM domovoy_donations
        WHERE payment_status = 'completed'
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
    """)
    daily_stats = cursor.fetchall()
    
    # Топ пользователей по донатам
    cursor.execute("""
        SELECT 
            user_id,
            COUNT(*) as donations_count,
            SUM(amount) as total_donated,
            MAX(level_after) as current_level
        FROM domovoy_donations
        WHERE payment_status = 'completed'
        GROUP BY user_id
        ORDER BY total_donated DESC
        LIMIT 10
    """)
    top_users = cursor.fetchall()
    
    # Распределение по уровням
    cursor.execute("""
        SELECT 
            current_level,
            COUNT(*) as users_count
        FROM domovoy_levels
        GROUP BY current_level
        ORDER BY current_level
    """)
    level_distribution = cursor.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'stats': dict(stats) if stats else {},
            'payment_methods': [dict(pm) for pm in payment_methods],
            'daily_stats': [dict(ds) for ds in daily_stats],
            'top_users': [dict(u) for u in top_users],
            'level_distribution': [dict(ld) for ld in level_distribution]
        }, default=str)
    }


def get_donations(cursor, params: Dict[str, Any]) -> Dict[str, Any]:
    """Получить список донатов с фильтрацией"""
    
    limit = int(params.get('limit', 100))
    offset = int(params.get('offset', 0))
    status = params.get('status')
    payment_method = params.get('payment_method')
    
    # Базовый запрос
    query = """
        SELECT 
            d.*,
            COALESCE(us.email, 'unknown') as user_email
        FROM domovoy_donations d
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN user_sessions us ON d.user_id = us.user_id
        WHERE 1=1
    """
    
    conditions = []
    if status:
        conditions.append(f"d.payment_status = '{status}'")
    if payment_method:
        conditions.append(f"d.payment_method = '{payment_method}'")
    
    if conditions:
        query += " AND " + " AND ".join(conditions)
    
    query += f" ORDER BY d.created_at DESC LIMIT {limit} OFFSET {offset}"
    
    cursor.execute(query)
    donations = cursor.fetchall()
    
    # Подсчет общего количества
    count_query = "SELECT COUNT(*) as total FROM domovoy_donations WHERE 1=1"
    if conditions:
        count_query += " AND " + " AND ".join(conditions)
    
    cursor.execute(count_query)
    total = cursor.fetchone()['total']
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'donations': [dict(d) for d in donations],
            'total': total,
            'limit': limit,
            'offset': offset
        }, default=str)
    }


def get_payment_settings(cursor) -> Dict[str, Any]:
    """Получить настройки платежных реквизитов"""
    
    cursor.execute("""
        SELECT payment_method, is_active, account_number, qr_code_url, description
        FROM payment_settings
        ORDER BY payment_method
    """)
    settings = cursor.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'settings': [dict(s) for s in settings]
        })
    }


def update_payment_settings(cursor, conn, body: Dict[str, Any]) -> Dict[str, Any]:
    """Обновить платежные реквизиты"""
    
    payment_method = body.get('payment_method')
    is_active = body.get('is_active')
    account_number = body.get('account_number')
    qr_code_url = body.get('qr_code_url')
    description = body.get('description')
    
    if not payment_method:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите payment_method'})
        }
    
    cursor.execute("""
        UPDATE payment_settings
        SET is_active = %s,
            account_number = %s,
            qr_code_url = %s,
            description = %s,
            updated_at = NOW()
        WHERE payment_method = %s
    """, (is_active, account_number, qr_code_url, description, payment_method))
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'message': 'Настройки обновлены'
        })
    }


def export_donations(cursor, params: Dict[str, Any]) -> Dict[str, Any]:
    """Экспорт донатов в CSV формат"""
    
    cursor.execute("""
        SELECT 
            d.id,
            d.user_id,
            d.amount,
            d.payment_method,
            d.level_before,
            d.level_after,
            d.payment_status,
            d.created_at
        FROM domovoy_donations d
        ORDER BY d.created_at DESC
    """)
    donations = cursor.fetchall()
    
    # Формируем CSV
    csv_lines = ['id,user_id,amount,payment_method,level_before,level_after,status,created_at']
    for d in donations:
        csv_lines.append(
            f"{d['id']},{d['user_id']},{d['amount']},{d['payment_method']},"
            f"{d['level_before']},{d['level_after']},{d['payment_status']},{d['created_at']}"
        )
    
    csv_content = '\n'.join(csv_lines)
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="domovoy-donations.csv"'
        },
        'isBase64Encoded': False,
        'body': csv_content
    }
