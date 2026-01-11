"""AI-помощник для рекомендаций мест в поездках"""
import json
import os
import requests
from typing import Optional, Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('POSTGRES_SCHEMA', 't_p5815085_family_assistant_pro')
YANDEX_GPT_API_KEY = os.environ.get('YANDEX_GPT_API_KEY', '')
YANDEX_FOLDER_ID = os.environ.get('YANDEX_FOLDER_ID', '')

def get_db_connection():
    """Создаёт подключение к БД"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_token(token: str) -> Optional[str]:
    """Проверяет токен и возвращает user_id"""
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    safe_token = token.replace("'", "''")
    
    cur.execute(f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = '{safe_token}' AND expires_at > CURRENT_TIMESTAMP
    """)
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_trip_info(trip_id: int) -> Optional[Dict[str, Any]]:
    """Получает информацию о поездке"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT title, destination, country, start_date, end_date, description
        FROM {SCHEMA}.trips
        WHERE id = {trip_id}
    """)
    
    trip = cur.fetchone()
    cur.close()
    conn.close()
    
    if not trip:
        return None
    
    return {
        'title': trip['title'],
        'destination': trip['destination'],
        'country': trip['country'],
        'start_date': trip['start_date'].isoformat() if trip['start_date'] else None,
        'end_date': trip['end_date'].isoformat() if trip['end_date'] else None,
        'description': trip['description']
    }

def call_yandex_gpt(prompt: str) -> str:
    """Вызывает YandexGPT для генерации рекомендаций"""
    
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Api-Key {YANDEX_GPT_API_KEY}"
    }
    
    payload = {
        "modelUri": f"gpt://{YANDEX_FOLDER_ID}/yandexgpt-lite/latest",
        "completionOptions": {
            "stream": False,
            "temperature": 0.7,
            "maxTokens": 2000
        },
        "messages": [
            {
                "role": "system",
                "text": "Ты — эксперт по путешествиям, который помогает планировать поездки и рекомендует интересные места для посещения. Твои рекомендации должны быть конкретными, с указанием названий мест, их особенностей и примерной стоимости посещения."
            },
            {
                "role": "user",
                "text": prompt
            }
        ]
    }
    
    print(f'[DEBUG] YandexGPT request payload: {payload}')
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f'[DEBUG] YandexGPT response status: {response.status_code}')
        print(f'[DEBUG] YandexGPT response body: {response.text}')
        
        response.raise_for_status()
        
        result = response.json()
        return result['result']['alternatives'][0]['message']['text']
    
    except Exception as e:
        print(f'[ERROR] YandexGPT API error: {str(e)}')
        return f"Ошибка при получении рекомендаций: {str(e)}"

def parse_ai_recommendations(ai_response: str, trip_info: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Парсит ответ AI и формирует структурированные рекомендации"""
    
    recommendations = []
    lines = ai_response.split('\n')
    
    current_place = None
    
    for line in lines:
        line = line.strip()
        
        if not line or line.startswith('#'):
            continue
        
        # Ищем название места (обычно начинается с цифры и точки или с "**")
        if line[0].isdigit() or line.startswith('**'):
            # Сохраняем предыдущее место
            if current_place:
                recommendations.append(current_place)
            
            # Очищаем название от форматирования
            place_name = line.replace('**', '').strip()
            place_name = place_name.split('. ', 1)[-1] if '. ' in place_name else place_name
            place_name = place_name.split('— ')[0].strip()
            
            current_place = {
                'place_name': place_name,
                'description': '',
                'place_type': 'attraction',
                'priority': 'medium',
                'ai_recommended': True
            }
        
        # Добавляем описание к текущему месту
        elif current_place and line:
            if current_place['description']:
                current_place['description'] += ' ' + line
            else:
                current_place['description'] = line
    
    # Добавляем последнее место
    if current_place:
        recommendations.append(current_place)
    
    # Ограничиваем до 10 рекомендаций
    return recommendations[:10]

def get_ai_recommendations(trip_id: int, preferences: Optional[str] = None) -> Dict[str, Any]:
    """Получает AI-рекомендации мест для посещения"""
    
    trip_info = get_trip_info(trip_id)
    
    if not trip_info:
        return {
            'success': False,
            'error': 'Поездка не найдена'
        }
    
    # Формируем промпт для AI
    prompt = f"""
Помоги спланировать поездку в {trip_info['destination']}, {trip_info['country']}.

Информация о поездке:
- Место: {trip_info['destination']}, {trip_info['country']}
- Даты: с {trip_info['start_date']} по {trip_info['end_date']}
"""
    
    if trip_info['description']:
        prompt += f"- Описание: {trip_info['description']}\n"
    
    if preferences:
        prompt += f"- Предпочтения: {preferences}\n"
    
    prompt += """
Порекомендуй 7-10 самых интересных мест для посещения. Для каждого места укажи:
1. Название места
2. Краткое описание (2-3 предложения) с указанием почему это место стоит посетить
3. Примерную стоимость посещения (если применимо)

Формат ответа:
1. **Название места** — краткое описание, особенности, стоимость посещения

Сосредоточься на самых популярных достопримечательностях, музеях, парках и уникальных местах города.
"""
    
    # Получаем ответ от AI
    ai_response = call_yandex_gpt(prompt)
    
    # Парсим рекомендации
    recommendations = parse_ai_recommendations(ai_response, trip_info)
    
    return {
        'success': True,
        'trip_info': trip_info,
        'raw_response': ai_response,
        'recommendations': recommendations
    }

def save_recommendations_to_trip(trip_id: int, user_id: int, recommendations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Сохраняет рекомендованные места в поездку"""
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    saved_count = 0
    
    for rec in recommendations:
        place_name = rec['place_name'].replace("'", "''")
        description = rec.get('description', '').replace("'", "''")
        place_type = rec.get('place_type', 'attraction').replace("'", "''")
        priority = rec.get('priority', 'medium').replace("'", "''")
        
        try:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.trip_places
                (trip_id, place_name, description, place_type, priority, 
                 ai_recommended, ai_description, added_by)
                VALUES ({trip_id}, '{place_name}', '{description}', '{place_type}',
                        '{priority}', TRUE, '{description}', {user_id})
            """)
            saved_count += 1
        except Exception as e:
            print(f'[ERROR] Failed to save place {place_name}: {str(e)}')
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'success': True,
        'saved_count': saved_count
    }

def handler(event: dict, context) -> dict:
    """Обрабатывает запросы к AI-рекомендациям"""
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
    }
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        # Аутентификация (прокси маппит Authorization → X-Authorization)
        headers = event.get('headers', {})
        token = headers.get('x-authorization', headers.get('X-Authorization', '')).replace('Bearer ', '')
        
        # Также проверяем X-Auth-Token если используется
        if not token:
            token = headers.get('x-auth-token', headers.get('X-Auth-Token', ''))
        
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        query_params = event.get('queryStringParameters') or {}
        
        # Получаем trip_id из query параметров
        trip_id_str = query_params.get('trip_id')
        
        if not trip_id_str:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'trip_id parameter is required'}),
                'isBase64Encoded': False
            }
        
        try:
            trip_id = int(trip_id_str)
        except ValueError:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'trip_id must be a number'}),
                'isBase64Encoded': False
            }
        
        # GET ?trip_id=X - получить рекомендации
        if method == 'GET':
            preferences = query_params.get('preferences')
            result = get_ai_recommendations(trip_id, preferences)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        # POST ?trip_id=X&action=save - сохранить рекомендации
        if method == 'POST' and query_params.get('action') == 'save':
            body = json.loads(event.get('body', '{}'))
            recommendations = body.get('recommendations', [])
            
            result = save_recommendations_to_trip(trip_id, int(user_id), recommendations)
            
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 404,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Endpoint not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] {str(e)}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }