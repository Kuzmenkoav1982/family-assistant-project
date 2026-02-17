import json
import os
import requests
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime


SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    """Создает подключение к БД"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL не настроен')
    return psycopg2.connect(database_url)


def check_subscription(family_id: str) -> bool:
    """Проверяет, есть ли у семьи активная подписка на AI-помощника"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        safe_family_id = family_id.replace("'", "''")
        query = f"""
            SELECT plan_type FROM {SCHEMA}.subscriptions
            WHERE family_id = '{safe_family_id}'
            AND status = 'active'
            AND end_date > CURRENT_TIMESTAMP
            AND plan_type IN ('ai_assistant', 'full', 'premium_1m', 'premium_3m', 'premium_6m', 'premium_12m')
            LIMIT 1
        """
        cursor.execute(query)
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return result is not None
    except Exception as e:
        print(f'[ERROR] Ошибка проверки подписки: {str(e)}')
        return False


def load_chat_history(family_id: str, limit: int = 10) -> List[Dict[str, str]]:
    """Загружает последние сообщения из истории чата"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        safe_family_id = family_id.replace("'", "''")
        query = f"""
            SELECT role, content 
            FROM {SCHEMA}.chat_messages 
            WHERE family_id::text = '{safe_family_id}' 
            ORDER BY created_at DESC 
            LIMIT {int(limit)}
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Переворачиваем чтобы старые сообщения были первыми
        history = []
        for row in reversed(rows):
            history.append({
                'role': row[0],
                'content': row[1]
            })
        
        return history
    except Exception as e:
        print(f'[ERROR] Ошибка загрузки истории: {str(e)}')
        return []


def save_message(family_id: str, user_id: Optional[int], role: str, content: str):
    """Сохраняет сообщение в БД"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        safe_family_id = family_id.replace("'", "''")
        safe_role = role.replace("'", "''")
        safe_content = content.replace("'", "''")
        user_id_val = f"'{str(user_id)}'" if user_id else "NULL"
        query = f"""
            INSERT INTO {SCHEMA}.chat_messages (family_id, sender_id, role, content, type, created_at)
            VALUES ('{safe_family_id}'::uuid, {user_id_val}, '{safe_role}', '{safe_content}', 'text', NOW())
        """
        cursor.execute(query)
        
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f'[ERROR] Ошибка сохранения сообщения: {str(e)}')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI-ассистент для семьи на базе YandexGPT
    Args: event - dict с httpMethod, body (messages, systemPrompt)
          context - object с request_id
    Returns: HTTP response с ответом от AI
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # CORS для всех запросов
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        # Получаем данные запроса
        body_data = json.loads(event.get('body', '{}'))
        messages: List[Dict[str, str]] = body_data.get('messages', [])
        system_prompt: Optional[str] = body_data.get('systemPrompt')
        family_id: Optional[str] = body_data.get('familyId')
        user_id: Optional[int] = body_data.get('userId')
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указаны сообщения'}),
                'isBase64Encoded': False
            }
        
        # Проверяем подписку, если указан family_id
        if family_id:
            has_subscription = check_subscription(family_id)
            if not has_subscription:
                return {
                    'statusCode': 403,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'error': 'subscription_required',
                        'message': 'Для использования AI-помощника требуется подписка'
                    }),
                    'isBase64Encoded': False
                }
        
        # Получаем credentials
        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')
        
        if not api_key or not folder_id:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не настроены ключи YandexGPT'}),
                'isBase64Encoded': False
            }
        
        # Формируем запрос к YandexGPT
        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        
        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Загружаем историю из БД, если есть family_id
        history_messages = []
        if family_id:
            history_messages = load_chat_history(family_id, limit=10)
        
        # Подготавливаем сообщения для YandexGPT
        yandex_messages = []
        
        # Добавляем системный промпт, если есть
        if system_prompt:
            yandex_messages.append({
                'role': 'system',
                'text': system_prompt
            })
        
        # Добавляем историю из БД
        for msg in history_messages:
            yandex_messages.append({
                'role': msg['role'],
                'text': msg['content']
            })
        
        # Добавляем текущие сообщения пользователя
        user_message_content = ''
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            # Сохраняем последнее сообщение пользователя для записи в БД
            if role == 'user':
                user_message_content = content
            
            # YandexGPT использует 'user' и 'assistant'
            if role in ['user', 'assistant']:
                yandex_messages.append({
                    'role': role,
                    'text': content
                })
        
        # Используем правильный folder_id (из сервисного аккаунта)
        correct_folder_id = 'b1gaglg8i7v2i32nvism'
        
        payload = {
            'modelUri': f'gpt://{correct_folder_id}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 2000
            },
            'messages': yandex_messages
        }
        
        # Отправляем запрос к YandexGPT
        print(f'[DEBUG] Отправка запроса к YandexGPT. ModelUri: gpt://{correct_folder_id}/yandexgpt-lite')
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            error_text = response.text
            print(f'[ERROR] YandexGPT вернул {response.status_code}: {error_text}')
            return {
                'statusCode': response.status_code,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': f'Ошибка YandexGPT: {error_text}'
                }),
                'isBase64Encoded': False
            }
        
        # Парсим ответ
        result = response.json()
        alternatives = result.get('result', {}).get('alternatives', [])
        
        if not alternatives:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Пустой ответ от YandexGPT'}),
                'isBase64Encoded': False
            }
        
        # Получаем текст ответа
        ai_response = alternatives[0].get('message', {}).get('text', '')
        
        # Сохраняем сообщения в БД, если есть family_id
        if family_id and user_message_content:
            save_message(family_id, user_id, 'user', user_message_content)
            save_message(family_id, user_id, 'assistant', ai_response)
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'response': ai_response,
                'model': 'yandexgpt-lite',
                'timestamp': datetime.now().isoformat()
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный формат JSON'}),
            'isBase64Encoded': False
        }
    except requests.Timeout:
        return {
            'statusCode': 504,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Превышено время ожидания ответа от YandexGPT'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}),
            'isBase64Encoded': False
        }