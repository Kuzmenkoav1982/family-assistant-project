"""
Обработка донатов через Сбер для поддержки платформы
Разовые платежи на развитие проекта и "Угостить Домового"
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')

# Варианты донатов
DONATION_PRESETS = [
    {'id': 'espresso', 'name': '☕ Эспрессо', 'amount': 50, 'emoji': '☕'},
    {'id': 'cappuccino', 'name': '☕ Капучино', 'amount': 150, 'emoji': '☕'},
    {'id': 'latte', 'name': '☕ Большой латте', 'amount': 300, 'emoji': '☕'},
    {'id': 'friend', 'name': '💚 Друг проекта', 'amount': 500, 'emoji': '💚'},
    {'id': 'partner', 'name': '🤝 Партнёр развития', 'amount': 1000, 'emoji': '🤝'},
    {'id': 'investor', 'name': '🏆 Инвестор', 'amount': 3000, 'emoji': '🏆'}
]

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Проверка токена и возврат информации о пользователе"""
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_token = token.replace("'", "''")
    cur.execute(
        f"""
        SELECT s.user_id, u.email, u.full_name 
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON s.user_id = u.id
        WHERE s.token = '{safe_token}' AND s.expires_at > CURRENT_TIMESTAMP
        """
    )
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if result:
        return {
            'user_id': str(result['user_id']),
            'email': result['email'],
            'full_name': result['full_name']
        }
    return None

def get_user_family_id(user_id: str) -> Optional[str]:
    """Получение ID семьи пользователя"""
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

def create_donation(user_id: str, amount: float, preset_id: Optional[str], message: Optional[str]) -> Dict[str, Any]:
    """
    Создание записи о донате и возврат инструкций по оплате через Сбер
    """
    
    # Ищем информацию о пресете
    preset_info = next((p for p in DONATION_PRESETS if p['id'] == preset_id), None)
    preset_name = preset_info['name'] if preset_info else 'Произвольная сумма'
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        donation_id = str(uuid.uuid4())
        safe_donation_id = donation_id.replace("'", "''")
        safe_user_id = user_id.replace("'", "''")
        safe_preset_id = (preset_id or '').replace("'", "''")
        safe_message = (message or '').replace("'", "''")
        
        # Сохраняем донат в domovoy_donations
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.domovoy_donations
            (id, user_id, amount, preset_id, message, status, created_at)
            VALUES ('{safe_donation_id}', '{safe_user_id}', {amount}, 
                    '{safe_preset_id}', '{safe_message}', 'pending', CURRENT_TIMESTAMP)
            RETURNING id
            """
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Возвращаем инструкции по оплате
        return {
            'success': True,
            'donation_id': donation_id,
            'amount': amount,
            'preset_name': preset_name,
            'status': 'pending',
            'payment_instructions': {
                'method': 'manual_transfer',
                'bank_name': 'ПАО Сбербанк',
                'bik': '044525225',
                'correspondent_account': '30101 810 4 0000 0000225',
                'recipient': 'ИП Кузьменко Анастасия Вячеславовна',
                'recipient_inn': '231805288780',
                'recipient_ogrn': '325774600908955',
                'recipient_account': '40802 810 3 3872 0055836',
                'amount': amount,
                'purpose': f'Добровольное пожертвование на развитие платформы "Наша семья". {message or ""}',
                'qr_image': 'https://cdn.poehali.dev/files/Сбер.JPG'
            },
            'thank_you_message': f'Спасибо за поддержку! 💚 Твой вклад поможет сделать платформу лучше!',
            'next_steps': [
                'Переведите указанную сумму по реквизитам Сбербанка',
                'В назначении платежа можно добавить своё сообщение',
                'После получения платежа мы активируем бонусы (если применимо)'
            ]
        }
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': f'Ошибка создания доната: {str(e)}'}

def get_donation_stats() -> Dict[str, Any]:
    """Получение статистики донатов (публичная информация)"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            f"""
            SELECT 
                COUNT(*) as total_donations,
                COALESCE(SUM(amount), 0) as total_amount,
                COUNT(DISTINCT user_id) as unique_donors
            FROM {SCHEMA}.domovoy_donations
            WHERE status = 'completed'
            """
        )
        stats = cur.fetchone()
        
        # Топ-донатеры (анонимно)
        cur.execute(
            f"""
            SELECT 
                u.full_name,
                SUM(d.amount) as total_donated,
                COUNT(*) as donation_count
            FROM {SCHEMA}.domovoy_donations d
            JOIN {SCHEMA}.users u ON d.user_id = u.id
            WHERE d.status = 'completed'
            GROUP BY u.id, u.full_name
            ORDER BY total_donated DESC
            LIMIT 10
            """
        )
        top_donors = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'total_donations': int(stats['total_donations']),
            'total_amount': float(stats['total_amount']),
            'unique_donors': int(stats['unique_donors']),
            'top_donors': [
                {
                    'name': donor['full_name'],
                    'total_donated': float(donor['total_donated']),
                    'donation_count': int(donor['donation_count'])
                }
                for donor in top_donors
            ]
        }
    except Exception as e:
        return {'error': str(e)}

def get_user_donations(user_id: str) -> Dict[str, Any]:
    """Получение истории донатов пользователя"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_user_id = user_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT id, amount, preset_id, message, status, created_at, completed_at
        FROM {SCHEMA}.domovoy_donations
        WHERE user_id = '{safe_user_id}'
        ORDER BY created_at DESC
        LIMIT 50
        """
    )
    donations = cur.fetchall()
    
    cur.close()
    conn.close()
    
    result = []
    for donation in donations:
        preset_info = next((p for p in DONATION_PRESETS if p['id'] == donation['preset_id']), None)
        result.append({
            'id': donation['id'],
            'amount': float(donation['amount']),
            'preset_name': preset_info['name'] if preset_info else 'Произвольная сумма',
            'message': donation['message'],
            'status': donation['status'],
            'created_at': donation['created_at'].isoformat() if donation['created_at'] else None,
            'completed_at': donation['completed_at'].isoformat() if donation['completed_at'] else None
        })
    
    return {'donations': result}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        
        # GET ?action=presets - список вариантов донатов (публичный)
        if method == 'GET' and action == 'presets':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'presets': DONATION_PRESETS,
                    'custom_allowed': True,
                    'min_amount': 50,
                    'message': 'Выберите сумму или укажите свою'
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # GET ?action=stats - публичная статистика
        if method == 'GET' and action == 'stats':
            stats = get_donation_stats()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(stats, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Для остальных методов — авторизация
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_info = verify_token(token)
        
        if not user_info:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        user_id = user_info['user_id']
        
        # GET ?action=my - история донатов пользователя
        if method == 'GET' and action == 'my':
            result = get_user_donations(user_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # POST - создание доната
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            amount = body.get('amount')
            preset_id = body.get('preset_id')
            message = body.get('message', '')
            
            if not amount or amount < 50:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'error': 'Минимальная сумма доната — 50₽'
                    }, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            result = create_donation(user_id, amount, preset_id, message)
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }