import json
import os
import urllib.request
import urllib.error

YANDEX_GPT_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'

def handler(event: dict, context) -> dict:
    '''
    ИИ-помощник для генерации идей и рекомендаций по организации праздников
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        event_type = body.get('eventType', 'birthday')
        age = body.get('age')
        budget = body.get('budget')
        theme = body.get('theme', '')
        request_type = body.get('requestType', 'general')
        
        prompt = build_prompt(event_type, age, budget, theme, request_type)
        
        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')
        
        if not api_key or not folder_id:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'AI service not configured'}),
                'isBase64Encoded': False
            }
        
        yandex_request = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
            'completionOptions': {
                'stream': False,
                'temperature': 0.7,
                'maxTokens': 2000
            },
            'messages': [
                {
                    'role': 'system',
                    'text': 'Ты - эксперт по организации праздников. Даёшь конкретные, практичные советы и идеи.'
                },
                {
                    'role': 'user',
                    'text': prompt
                }
            ]
        }
        
        print(f'[DEBUG] YandexGPT request: {json.dumps(yandex_request, ensure_ascii=False)}')
        
        req = urllib.request.Request(
            YANDEX_GPT_URL,
            data=json.dumps(yandex_request).encode('utf-8'),
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                response_text = response.read().decode('utf-8')
                print(f'[DEBUG] YandexGPT response: {response_text}')
                data = json.loads(response_text)
                
                if data.get('result') and data['result'].get('alternatives'):
                    text = data['result']['alternatives'][0]['message']['text']
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'ideas': text}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                else:
                    raise Exception('Invalid response from Yandex GPT')
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f'[ERROR] YandexGPT HTTP {e.code}: {error_body}')
            raise Exception(f'YandexGPT API error: {error_body}')
        
    except Exception as e:
        print(f'[ERROR] {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def build_prompt(event_type: str, age: int, budget: float, theme: str, request_type: str) -> str:
    event_labels = {
        'birthday': 'день рождения',
        'anniversary': 'юбилей',
        'holiday': 'праздник',
        'custom': 'мероприятие'
    }
    
    event_name = event_labels.get(event_type, 'праздник')
    
    if request_type == 'theme':
        if age and age <= 12:
            return f'Предложи 5 креативных тем для детского дня рождения ({age} лет). Для каждой темы укажи: название, краткое описание, идеи декора (2-3 пункта), активности и конкурсы (3-4 пункта).'
        elif age and age <= 18:
            return f'Предложи 5 современных тем для подросткового дня рождения ({age} лет). Для каждой темы: название, описание, оформление, развлечения.'
        else:
            return f'Предложи 5 стильных тем для взрослого праздника ({event_name}). Для каждой: название, концепция, атмосфера, примеры оформления.'
    
    elif request_type == 'menu':
        if age and age <= 12:
            return f'Составь детское меню для праздника на {age} лет. Включи: закуски (3-4), горячее (2 варианта), десерты (2-3), напитки. Учти детские вкусы и аллергии.'
        else:
            return f'Предложи меню для праздника ({event_name}). Закуски, основное, десерты, напитки. Универсальные варианты, учитывающие разные вкусы.'
    
    elif request_type == 'activities':
        if age and age <= 6:
            return f'Придумай 7-10 простых игр и активностей для детей {age} лет на празднике. Для каждой: название, суть, что понадобится, длительность (5-15 минут).'
        elif age and age <= 12:
            return f'Предложи 7-10 интересных конкурсов и игр для детей {age} лет. Разнообразие: подвижные, интеллектуальные, творческие.'
        elif age and age <= 18:
            return f'Придумай 7-10 развлечений для подростков {age} лет. Современные, крутые активности без детских игр.'
        else:
            return f'Предложи 5-7 активностей и развлечений для взрослого праздника. Не банальные, интересные варианты.'
    
    elif request_type == 'budget':
        budget_str = f'{int(budget):,} ₽'.replace(',', ' ') if budget else 'средний'
        return f'Распредели бюджет {budget_str} для организации праздника ({event_name}). Дай таблицу со статьями расходов: место, кейтеринг, развлечения, декор, подарки, прочее. Укажи примерные суммы и процент от бюджета.'
    
    else:
        base = f'Помоги организовать {event_name}'
        if age:
            base += f' для {age} лет'
        if theme:
            base += f' в стиле "{theme}"'
        if budget:
            base += f', бюджет {int(budget):,} ₽'.replace(',', ' ')
        
        base += '. Дай краткие рекомендации: 1) Тематика и оформление (3-4 пункта), 2) Активности и развлечения (3-4 пункта), 3) Особенности меню (2-3 пункта), 4) Советы по организации (2-3 пункта).'
        
        return base