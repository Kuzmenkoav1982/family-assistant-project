"""
Backend для управления привязкой Алисы

Генерация кодов, привязка аккаунтов, проверка статуса, статистика
"""

import json
import os
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов для привязки Алисы
    
    Args:
        event: HTTP запрос с методом и данными
        context: Контекст выполнения
        
    Returns:
        HTTP ответ с данными или ошибкой
    """
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', 'status')
    
    # CORS
    if method == 'OPTIONS':
        return cors_response()
    
    # Авторизация
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not auth_token:
        return error_response('Требуется авторизация', 401)
    
    # Подключение к БД
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return error_response('Ошибка конфигурации', 500)
    
    try:
        conn = psycopg2.connect(db_url)
        
        # Получаем пользователя по токену
        user_info = get_user_by_token(conn, auth_token)
        if not user_info:
            conn.close()
            return error_response('Неверный токен', 401)
        
        family_id = user_info['family_id']
        member_id = user_info['id']
        
        # Роутинг по action
        if method == 'POST' and action == 'generate-code':
            result = generate_linking_code(conn, family_id, member_id)
            conn.close()
            return success_response(result)
        
        elif method == 'GET' and action == 'status':
            result = get_linking_status(conn, family_id, member_id)
            conn.close()
            return success_response(result)
        
        elif method == 'POST' and action == 'unlink':
            result = unlink_alice(conn, family_id, member_id)
            conn.close()
            return success_response(result)
        
        elif method == 'POST' and action == 'verify-code':
            body = json.loads(event.get('body', '{}'))
            code = body.get('code', '')
            yandex_user_id = body.get('yandex_user_id', '')
            result = verify_and_link(conn, code, yandex_user_id, family_id, member_id)
            conn.close()
            return success_response(result)
        
        elif method == 'GET' and action == 'stats':
            # Только для админов
            if not is_admin(user_info):
                conn.close()
                return error_response('Доступ запрещён', 403)
            result = get_alice_stats(conn)
            conn.close()
            return success_response(result)
        
        else:
            conn.close()
            return error_response(f'Неизвестное действие: {action}', 404)
            
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f'ERROR: {error_details}')
        return error_response(f'Ошибка сервера: {str(e)}', 500)


def generate_linking_code(conn, family_id: str, member_id: str) -> Dict:
    """Генерирует код привязки для пользователя"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Проверяем, есть ли уже активный код
    cursor.execute("""
        SELECT linking_code, code_expires_at 
        FROM t_p5815085_family_assistant_pro.alice_users
        WHERE family_id = %s AND member_id = %s 
            AND code_expires_at > NOW()
    """, (family_id, member_id))
    
    existing = cursor.fetchone()
    
    if existing:
        code = existing['linking_code']
        expires_at = existing['code_expires_at']
    else:
        # Генерируем новый код
        part1 = ''.join(random.choices(string.digits, k=4))
        part2 = ''.join(random.choices(string.digits, k=4))
        code = f"{part1}{part2}"  # Храним без дефиса
        
        # Код действует 15 минут
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        # Удаляем старые коды этого пользователя
        cursor.execute("""
            DELETE FROM t_p5815085_family_assistant_pro.alice_users
            WHERE family_id = %s AND member_id = %s
        """, (family_id, member_id))
        
        # Создаём новую запись с кодом (без yandex_user_id пока)
        cursor.execute("""
            INSERT INTO t_p5815085_family_assistant_pro.alice_users 
            (family_id, member_id, linking_code, code_expires_at, yandex_user_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (family_id, member_id, code, expires_at, f'pending_{member_id}'))
        
        conn.commit()
    
    cursor.close()
    
    return {
        'code': f"{code[:4]}-{code[4:]}",  # Возвращаем с дефисом для отображения
        'expires_at': expires_at.isoformat(),
        'expires_in_seconds': int((expires_at - datetime.now(timezone.utc)).total_seconds())
    }


def get_linking_status(conn, family_id: str, member_id: str) -> Dict:
    """Проверяет статус привязки Алисы"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("""
        SELECT yandex_user_id, linked_at, last_interaction
        FROM t_p5815085_family_assistant_pro.alice_users
        WHERE family_id = %s AND member_id = %s
            AND yandex_user_id NOT LIKE 'pending_%'
        ORDER BY linked_at DESC
        LIMIT 1
    """, (family_id, member_id))
    
    link = cursor.fetchone()
    cursor.close()
    
    if link:
        return {
            'linked': True,
            'linked_at': link['linked_at'].isoformat() if link['linked_at'] else None,
            'last_interaction': link['last_interaction'].isoformat() if link['last_interaction'] else None
        }
    else:
        return {'linked': False}


def unlink_alice(conn, family_id: str, member_id: str) -> Dict:
    """Отвязывает Алису от аккаунта"""
    
    cursor = conn.cursor()
    
    cursor.execute("""
        DELETE FROM t_p5815085_family_assistant_pro.alice_users
        WHERE family_id = %s AND member_id = %s
    """, (family_id, member_id))
    
    conn.commit()
    deleted = cursor.rowcount
    cursor.close()
    
    return {'success': True, 'message': 'Алиса отвязана', 'deleted_rows': deleted}


def verify_and_link(conn, code: str, yandex_user_id: str, family_id: str, member_id: str) -> Dict:
    """
    Проверяет код и привязывает Yandex User ID к аккаунту
    (Вызывается из функции alice когда пользователь назвал код)
    """
    
    # Убираем дефис из кода
    code_clean = code.replace('-', '')
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Ищем код
    cursor.execute("""
        SELECT id, family_id, member_id, code_expires_at
        FROM t_p5815085_family_assistant_pro.alice_users
        WHERE linking_code = %s AND code_expires_at > NOW()
    """, (code_clean,))
    
    code_record = cursor.fetchone()
    
    if not code_record:
        cursor.close()
        return {'success': False, 'error': 'Код не найден или истёк'}
    
    # Обновляем запись, привязывая yandex_user_id
    cursor.execute("""
        UPDATE t_p5815085_family_assistant_pro.alice_users
        SET yandex_user_id = %s, linked_at = NOW()
        WHERE id = %s
    """, (yandex_user_id, code_record['id']))
    
    conn.commit()
    cursor.close()
    
    return {
        'success': True, 
        'message': 'Аккаунт успешно привязан',
        'family_id': code_record['family_id'],
        'member_id': code_record['member_id']
    }


def log_command(conn, yandex_user_id: str, family_id: Optional[str], command: str, 
                category: Optional[str], success: bool, error: Optional[str], response_time: int):
    """Логирует команду Алисы для статистики"""
    
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO t_p5815085_family_assistant_pro.alice_commands_log
        (yandex_user_id, family_id, command_text, command_category, success, error_message, response_time_ms)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (yandex_user_id, family_id, command, category, success, error, response_time))
    
    conn.commit()
    cursor.close()


def get_alice_stats(conn) -> Dict:
    """Получить статистику использования Алисы (для админов)"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Всего пользователей
    cursor.execute("""
        SELECT COUNT(*) as total
        FROM t_p5815085_family_assistant_pro.alice_users
        WHERE yandex_user_id NOT LIKE 'pending_%'
    """)
    total_users = cursor.fetchone()['total']
    
    # Активные сегодня
    cursor.execute("""
        SELECT COUNT(*) as active
        FROM t_p5815085_family_assistant_pro.alice_users
        WHERE last_interaction >= CURRENT_DATE
            AND yandex_user_id NOT LIKE 'pending_%'
    """)
    active_today = cursor.fetchone()['active']
    
    # Команд за сегодня
    cursor.execute("""
        SELECT COUNT(*) as today_commands
        FROM t_p5815085_family_assistant_pro.alice_commands_log
        WHERE created_at >= CURRENT_DATE
    """)
    today_commands = cursor.fetchone()['today_commands']
    
    # Всего команд
    cursor.execute("""
        SELECT COUNT(*) as total_commands
        FROM t_p5815085_family_assistant_pro.alice_commands_log
    """)
    total_commands = cursor.fetchone()['total_commands']
    
    # Популярные команды
    cursor.execute("""
        SELECT command_category, COUNT(*) as count
        FROM t_p5815085_family_assistant_pro.alice_commands_log
        WHERE command_category IS NOT NULL
        GROUP BY command_category
        ORDER BY count DESC
        LIMIT 5
    """)
    popular = cursor.fetchall()
    
    # Процент ошибок
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN success = false THEN 1 END) * 100.0 / COUNT(*) as error_rate
        FROM t_p5815085_family_assistant_pro.alice_commands_log
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    """)
    error_rate = cursor.fetchone()['error_rate'] or 0
    
    # Среднее время ответа
    cursor.execute("""
        SELECT AVG(response_time_ms) as avg_time
        FROM t_p5815085_family_assistant_pro.alice_commands_log
        WHERE response_time_ms IS NOT NULL
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    """)
    avg_time = cursor.fetchone()['avg_time'] or 0
    
    cursor.close()
    
    return {
        'total_users': total_users,
        'active_today': active_today,
        'today_commands': today_commands,
        'total_commands': total_commands,
        'popular_commands': [dict(c) for c in popular],
        'error_rate': round(error_rate, 2),
        'avg_response_time': int(avg_time)
    }


# === Вспомогательные функции ===

def get_user_by_token(conn, token: str) -> Optional[Dict]:
    """Получить пользователя по auth токену"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("""
        SELECT fm.id, fm.family_id, fm.name, fm.role, fm.user_id
        FROM t_p5815085_family_assistant_pro.sessions s
        JOIN t_p5815085_family_assistant_pro.family_members fm ON s.user_id = fm.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
        LIMIT 1
    """, (token,))
    
    user = cursor.fetchone()
    cursor.close()
    
    return dict(user) if user else None


def is_admin(user_info: Dict) -> bool:
    """Проверка прав администратора"""
    return user_info.get('role') == 'admin'


def cors_response() -> Dict:
    """CORS ответ для OPTIONS"""
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


def success_response(data: Dict, status_code: int = 200) -> Dict:
    """Успешный ответ"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False
    }


def error_response(message: str, status_code: int = 400) -> Dict:
    """Ответ с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}, ensure_ascii=False),
        'isBase64Encoded': False
    }