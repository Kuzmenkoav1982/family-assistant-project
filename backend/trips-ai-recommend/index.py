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
    
    correct_folder_id = 'b1gaglg8i7v2i32nvism'
    
    payload = {
        "modelUri": f"gpt://{correct_folder_id}/yandexgpt-lite",
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
    
    print(f'[DEBUG] Отправка запроса к YandexGPT. ModelUri: gpt://{correct_folder_id}/yandexgpt-lite')
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            error_text = response.text
            print(f'[ERROR] YandexGPT вернул {response.status_code}: {error_text}')
            return f"Ошибка YandexGPT: {error_text}"
        
        result = response.json()
        alternatives = result.get('result', {}).get('alternatives', [])
        
        if not alternatives:
            return "Пустой ответ от YandexGPT"
        
        return alternatives[0].get('message', {}).get('text', '')
    
    except Exception as e:
        print(f'[ERROR] YandexGPT API error: {str(e)}')
        return f"Ошибка при получении рекомендаций: {str(e)}"

def fetch_place_image(place_name: str, destination: str) -> Optional[str]:
    """Получает изображение места через Wikipedia/Wikimedia Commons"""
    
    try:
        # Ищем статью в Wikipedia
        search_query = f"{place_name} {destination}"
        wiki_search_url = "https://ru.wikipedia.org/w/api.php"
        
        search_params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": search_query,
            "srlimit": 1
        }
        
        search_response = requests.get(wiki_search_url, params=search_params, timeout=10)
        
        if search_response.status_code != 200:
            return None
        
        search_data = search_response.json()
        search_results = search_data.get('query', {}).get('search', [])
        
        if not search_results:
            return None
        
        page_title = search_results[0]['title']
        
        # Получаем изображения страницы
        image_params = {
            "action": "query",
            "format": "json",
            "prop": "pageimages|images",
            "titles": page_title,
            "piprop": "original",
            "imlimit": 1
        }
        
        image_response = requests.get(wiki_search_url, params=image_params, timeout=10)
        
        if image_response.status_code != 200:
            return None
        
        image_data = image_response.json()
        pages = image_data.get('query', {}).get('pages', {})
        
        if not pages:
            return None
        
        page = list(pages.values())[0]
        original_image = page.get('original', {}).get('source')
        
        if original_image:
            return original_image
        
        # Если нет original, пробуем получить первое изображение
        images_list = page.get('images', [])
        if images_list:
            image_title = images_list[0]['title']
            
            # Получаем URL изображения
            image_url_params = {
                "action": "query",
                "format": "json",
                "prop": "imageinfo",
                "titles": image_title,
                "iiprop": "url"
            }
            
            url_response = requests.get(wiki_search_url, params=image_url_params, timeout=10)
            
            if url_response.status_code == 200:
                url_data = url_response.json()
                url_pages = url_data.get('query', {}).get('pages', {})
                
                if url_pages:
                    url_page = list(url_pages.values())[0]
                    image_info = url_page.get('imageinfo', [])
                    
                    if image_info:
                        return image_info[0].get('url')
        
        return None
    
    except Exception as e:
        print(f'[ERROR] Wikipedia API error for {place_name}: {str(e)}')
        return None

def parse_ai_recommendations(ai_response: str, trip_info: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Парсит ответ AI и формирует структурированные рекомендации"""
    
    try:
        # Пытаемся распарсить как JSON
        ai_response = ai_response.strip()
        
        # Убираем markdown форматирование если есть
        if ai_response.startswith('```json'):
            ai_response = ai_response[7:]
        if ai_response.startswith('```'):
            ai_response = ai_response[3:]
        if ai_response.endswith('```'):
            ai_response = ai_response[:-3]
        
        ai_response = ai_response.strip()
        
        recommendations = json.loads(ai_response)
        
        # Добавляем обязательные поля
        for rec in recommendations:
            rec['ai_recommended'] = True
            if 'place_type' not in rec:
                rec['place_type'] = 'attraction'
            if 'priority' not in rec:
                rec['priority'] = 'medium'
        
        # Получаем изображения для каждого места
        destination = trip_info.get('destination', '')
        for rec in recommendations[:10]:
            rec['image_url'] = fetch_place_image(rec['place_name'], destination)
        
        return recommendations[:10]
    
    except json.JSONDecodeError as e:
        print(f'[ERROR] Не удалось распарсить JSON: {str(e)}')
        print(f'[DEBUG] AI response: {ai_response[:500]}')
        
        # Fallback: возвращаем пустой список
        return []

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
Порекомендуй 7-10 самых интересных мест для посещения.

ВАЖНО: Верни ответ ТОЛЬКО в виде JSON массива без дополнительного текста:
[
  {
    "place_name": "Название места",
    "description": "Подробное описание почему стоит посетить (2-3 предложения), особенности, примерная стоимость",
    "place_type": "attraction",
    "priority": "high"
  }
]

Типы мест: attraction, restaurant, hotel, activity, other
Приоритеты: high (обязательно), medium (рекомендуем), low (по желанию)
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