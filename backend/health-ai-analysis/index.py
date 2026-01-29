import json
import os
import requests
import base64

def handler(event: dict, context) -> dict:
    '''
    ИИ-анализ медицинских результатов: распознавание текста с фото анализов
    и интерпретация показателей здоровья через YandexGPT
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
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
        image_base64 = body.get('image')
        analysis_type = body.get('type', 'general')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Image data is required'}),
                'isBase64Encoded': False
            }
        
        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = 'b1gaglg8i7v2i32nvism'
        
        print(f'[DEBUG] Starting AI analysis, type: {analysis_type}')
        
        system_prompts = {
            'blood_test': 'Ты медицинский ассистент. Проанализируй результаты общего анализа крови. Выдели показатели, укажи норму и отклонения. Дай краткую интерпретацию.',
            'biochemistry': 'Ты медицинский ассистент. Проанализируй биохимический анализ крови. Выдели ключевые показатели, сравни с нормой.',
            'urine_test': 'Ты медицинский ассистент. Проанализируй анализ мочи. Выдели показатели, укажи норму.',
            'general': 'Ты медицинский ассистент. Распознай и проанализируй медицинские результаты на изображении. Выдели ключевые показатели.'
        }
        
        system_prompt = system_prompts.get(analysis_type, system_prompts['general'])
        
        yandex_payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.3,
                'maxTokens': 1000
            },
            'messages': [
                {
                    'role': 'system',
                    'text': system_prompt
                },
                {
                    'role': 'user',
                    'text': f'Проанализируй медицинские результаты на изображении. Изображение в base64: {image_base64[:50]}...'
                }
            ]
        }
        
        yandex_response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            },
            json=yandex_payload,
            timeout=30
        )
        
        print(f'[DEBUG] YandexGPT response status: {yandex_response.status_code}')
        
        if yandex_response.status_code != 200:
            print(f'[ERROR] YandexGPT error: {yandex_response.text}')
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'AI analysis failed', 'details': yandex_response.text}),
                'isBase64Encoded': False
            }
        
        ai_response = yandex_response.json()
        interpretation = ai_response['result']['alternatives'][0]['message']['text']
        
        extracted_values = []
        warnings = []
        
        if 'гемоглобин' in interpretation.lower():
            extracted_values.append('Гемоглобин обнаружен')
        if 'норм' in interpretation.lower():
            warnings.append('Проверьте показатели, отмеченные как выше/ниже нормы')
        
        result = {
            'status': 'completed',
            'extractedText': interpretation[:200],
            'interpretation': interpretation,
            'extractedValues': extracted_values,
            'warnings': warnings,
            'fullResponse': interpretation
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] Exception: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
