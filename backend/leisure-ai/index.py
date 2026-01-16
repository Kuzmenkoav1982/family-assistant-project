import json
import os
import requests
from typing import Optional

def handler(event: dict, context) -> dict:
    '''ИИ-помощник для поиска и рекомендации мест для семейного досуга'''
    
    method = event.get('httpMethod', 'GET')
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'recommend':
                return handle_recommend(body, headers)
            elif action == 'search_places':
                return handle_search_places(body, headers)
            else:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Unknown action'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
            'isBase64Encoded': False
        }


def handle_recommend(body: dict, headers: dict) -> dict:
    '''ИИ рекомендации мест на основе интересов семьи'''
    
    city = body.get('city', 'Москва')
    interests = body.get('interests', [])
    age_groups = body.get('age_groups', [])
    budget = body.get('budget')
    weather = body.get('weather')
    
    # Формируем строгие требования к категориям
    category_filter = ""
    if interests:
        categories_map = {
            'культура': 'музеи, театры, выставки, культурные центры',
            'развлечения': 'развлекательные центры, аттракционы, игровые зоны',
            'спорт': 'спортивные комплексы, бассейны, фитнес-центры, скалодромы',
            'еда': 'рестораны, кафе, столовые',
            'природа': 'парки, скверы, природные заповедники, ботанические сады',
            'образование': 'музеи науки, планетарии, обучающие центры, мастер-классы'
        }
        allowed_types = [categories_map.get(i, i) for i in interests]
        category_filter = f"\n\nОБЯЗАТЕЛЬНО: Рекомендуй ТОЛЬКО места из следующих категорий: {', '.join(allowed_types)}. НЕ предлагай места других типов!"
    
    # Формируем строгие требования к возрасту
    age_filter = ""
    if age_groups:
        age_filter = f"\n\nОБЯЗАТЕЛЬНО: Места должны быть подходящими для возрастных групп: {', '.join(age_groups)}. НЕ предлагай места для других возрастов!"
    
    # Формируем требования к бюджету
    budget_filter = ""
    if budget and budget != 'не ограничен':
        budget_map = {
            'низкий': 'бесплатные или до 500 рублей на человека',
            'средний': 'от 500 до 2000 рублей на человека',
            'высокий': 'от 2000 рублей на человека'
        }
        budget_desc = budget_map.get(budget, budget)
        budget_filter = f"\n\nБюджет: {budget_desc}"
    
    prompt = f"""Ты - эксперт по семейному досугу в городе {city}. 
Порекомендуй 5-7 конкретных реальных мест для отдыха.{category_filter}{age_filter}{budget_filter}

Для каждого места укажи:
1. Название (конкретное название реального места)
2. Категория (ресторан/музей/парк/развлечение/культура/спорт)
3. Краткое описание (1-2 предложения)
4. Примерная стоимость посещения
5. Для какого возраста подходит
6. Адрес (конкретный адрес в городе {city})

ВАЖНО: Верни ТОЛЬКО валидный JSON массив без дополнительного текста и markdown разметки.
Формат: [{{"title": "название", "category": "категория", "description": "описание", "price_range": "цена", "age_suitable": "возраст", "address": "адрес"}}]"""

    yandex_api_key = os.environ.get('YANDEX_GPT_API_KEY')
    yandex_folder_id = 'b1gaglg8i7v2i32nvism'
    
    if not yandex_api_key:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'YANDEX_GPT_API_KEY not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={
                'Authorization': f'Api-Key {yandex_api_key}',
                'Content-Type': 'application/json',
                'x-folder-id': yandex_folder_id
            },
            json={
                'modelUri': f'gpt://{yandex_folder_id}/yandexgpt-lite',
                'completionOptions': {
                    'temperature': 0.7,
                    'maxTokens': 2000
                },
                'messages': [
                    {
                        'role': 'user',
                        'text': prompt
                    }
                ]
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': headers,
                'body': json.dumps({'error': 'YandexGPT API error', 'details': response.text}),
                'isBase64Encoded': False
            }
        
        result = response.json()
        text_response = result['result']['alternatives'][0]['message']['text']
        
        text_clean = text_response.strip()
        if text_clean.startswith('```json'):
            text_clean = text_clean[7:]
        elif text_clean.startswith('```'):
            text_clean = text_clean[3:]
        if text_clean.endswith('```'):
            text_clean = text_clean[:-3]
        text_clean = text_clean.strip()
        
        try:
            recommendations = json.loads(text_clean)
        except:
            recommendations = [{'title': 'Ошибка парсинга', 'description': text_clean[:500]}]
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'recommendations': recommendations}),
            'isBase64Encoded': False
        }
        
    except requests.exceptions.Timeout:
        return {
            'statusCode': 504,
            'headers': headers,
            'body': json.dumps({'error': 'YandexGPT request timeout'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_search_places(body: dict, headers: dict) -> dict:
    '''Поиск мест через Yandex Geocoder API'''
    
    query = body.get('query')
    city = body.get('city', 'Москва')
    
    if not query:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Query is required'}),
            'isBase64Encoded': False
        }
    
    yandex_maps_key = os.environ.get('YANDEX_MAPS_API_KEY')
    
    if not yandex_maps_key:
        mock_places = [
            {
                'name': f'{query} в {city} - Пример 1',
                'description': 'Демо место (API ключ не настроен)',
                'address': f'{city}, улица Примерная, д. 1',
                'categories': ['развлечения'],
                'coordinates': {'lat': 55.7558, 'lon': 37.6173}
            },
            {
                'name': f'{query} в {city} - Пример 2',
                'description': 'Демо место (API ключ не настроен)',
                'address': f'{city}, улица Тестовая, д. 5',
                'categories': ['культура'],
                'coordinates': {'lat': 55.7539, 'lon': 37.6208}
            }
        ]
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'places': mock_places, 'total': 2, 'is_demo': True}),
            'isBase64Encoded': False
        }
    
    try:
        # Используем Yandex Search API для поиска организаций
        search_text = f"{query} {city}"
        
        params = {
            'apikey': yandex_maps_key,
            'text': search_text,
            'lang': 'ru_RU',
            'results': 10,
            'type': 'biz'  # Поиск организаций (business)
        }
        
        response = requests.get(
            'https://search-maps.yandex.ru/v1/',
            params=params,
            timeout=10
        )
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': headers,
                'body': json.dumps({'error': 'Yandex Search API error', 'details': response.text}),
                'isBase64Encoded': False
            }
        
        data = response.json()
        places = []
        
        features = data.get('features', [])
        
        for feature in features:
            props = feature.get('properties', {})
            company_meta = props.get('CompanyMetaData', {})
            
            name = props.get('name', '')
            description = props.get('description', '')
            address = company_meta.get('address', '')
            categories = company_meta.get('Categories', [])
            category_names = [cat.get('name', '') for cat in categories]
            
            # Координаты в формате GeoJSON: [lon, lat]
            coords = feature.get('geometry', {}).get('coordinates', [])
            
            if len(coords) >= 2:
                place = {
                    'name': name,
                    'description': description,
                    'address': address,
                    'categories': category_names,
                    'coordinates': {'lat': coords[1], 'lon': coords[0]},
                    'phone': company_meta.get('Phones', [{}])[0].get('formatted', '') if company_meta.get('Phones') else '',
                    'url': company_meta.get('url', '')
                }
                places.append(place)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'places': places, 'total': len(places)}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }