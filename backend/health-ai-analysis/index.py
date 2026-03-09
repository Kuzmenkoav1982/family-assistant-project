import json
import os
import requests
import base64
from datetime import datetime

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
    
    # Убираем data URL префикс если есть
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    gpt_api_key = os.environ.get('YANDEX_GPT_API_KEY')
    vision_api_key = os.environ.get('YANDEX_CLOUD_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', 'b1gaglg8i7v2i32nvism')
    
    print(f'[DEBUG] Starting AI analysis, type: {analysis_type}, folder_id: {folder_id}')
    
    system_prompts = {
        'blood_test': 'Ты медицинский ассистент. Проанализируй результаты общего анализа крови. Выдели показатели, укажи норму и отклонения. Дай краткую интерпретацию на русском языке.',
        'biochemistry': 'Ты медицинский ассистент. Проанализируй биохимический анализ крови. Выдели ключевые показатели, сравни с нормой. Ответ на русском языке.',
        'urine_test': 'Ты медицинский ассистент. Проанализируй анализ мочи. Выдели показатели, укажи норму. Ответ на русском языке.',
        'general': 'Ты медицинский ассистент. Распознай и проанализируй медицинские результаты на изображении. Выдели ключевые показатели и дай краткую интерпретацию на русском языке.'
    }
    
    system_prompt = system_prompts.get(analysis_type, system_prompts['general'])
    
    ocr_text = ''
    
    # Пробуем Yandex Vision OCR для распознавания текста
    if vision_api_key:
        vision_payload = {
            'folderId': folder_id,
            'analyze_specs': [{
                'content': image_base64,
                'features': [{
                    'type': 'TEXT_DETECTION',
                    'text_detection_config': {
                        'language_codes': ['ru', 'en']
                    }
                }]
            }]
        }
        
        try:
            vision_response = requests.post(
                'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze',
                headers={
                    'Authorization': f'Api-Key {vision_api_key}',
                    'Content-Type': 'application/json'
                },
                json=vision_payload,
                timeout=30
            )
            
            print(f'[DEBUG] Vision OCR response status: {vision_response.status_code}')
            
            if vision_response.status_code == 200:
                vision_result = vision_response.json()
                try:
                    pages = vision_result['results'][0]['results'][0]['textDetection']['pages']
                    for page in pages:
                        for block in page.get('blocks', []):
                            for line in block.get('lines', []):
                                words = [word['text'] for word in line.get('words', [])]
                                ocr_text += ' '.join(words) + '\n'
                    print(f'[DEBUG] OCR extracted {len(ocr_text)} chars')
                except (KeyError, IndexError) as e:
                    print(f'[WARN] Failed to parse OCR result: {e}')
            else:
                print(f'[WARN] Vision OCR error {vision_response.status_code}: {vision_response.text[:200]}')
        except Exception as e:
            print(f'[WARN] Vision OCR exception: {e}')
    else:
        print('[WARN] YANDEX_CLOUD_API_KEY not set, skipping OCR')
    
    # Если OCR не дал результата — анализируем через GPT с изображением напрямую
    if not ocr_text.strip():
        print('[DEBUG] OCR text empty, sending image description request to GPT')
        if not gpt_api_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сервис анализа временно недоступен'}),
                'isBase64Encoded': False
            }
        
        # Просим GPT описать что на изображении (без OCR)
        fallback_payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt',
            'completionOptions': {
                'stream': False,
                'temperature': 0.3,
                'maxTokens': 1500
            },
            'messages': [
                {
                    'role': 'system',
                    'text': 'Ты медицинский ассистент. Пользователь загрузил медицинский документ (анализы). К сожалению, автоматическое распознавание текста не сработало. Сообщи об этом пользователю и попроси загрузить более чёткое фото документа с хорошим освещением. Добавь совет как правильно сфотографировать анализы.'
                },
                {
                    'role': 'user',
                    'text': 'Не удалось распознать текст на изображении медицинского документа.'
                }
            ]
        }
        
        try:
            fallback_response = requests.post(
                'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
                headers={
                    'Authorization': f'Api-Key {gpt_api_key}',
                    'Content-Type': 'application/json'
                },
                json=fallback_payload,
                timeout=30
            )
            
            if fallback_response.status_code == 200:
                fb_data = fallback_response.json()
                fb_text = fb_data['result']['alternatives'][0]['message']['text']
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': 'Текст не распознан',
                        'hint': fb_text
                    }, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        except Exception as e:
            print(f'[WARN] Fallback GPT failed: {e}')
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': 'На изображении не найдено текста. Попробуйте загрузить более чёткое фото документа при хорошем освещении.'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    # Анализируем распознанный текст через YandexGPT
    if not gpt_api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'GPT API key not configured'}),
            'isBase64Encoded': False
        }
    
    yandex_payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt',
        'completionOptions': {
            'stream': False,
            'temperature': 0.3,
            'maxTokens': 2000
        },
        'messages': [
            {
                'role': 'system',
                'text': system_prompt
            },
            {
                'role': 'user',
                'text': f'Распознанный текст с медицинского документа:\n\n{ocr_text}\n\nПроанализируй результаты и дай подробную интерпретацию.'
            }
        ]
    }
    
    yandex_response = requests.post(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        headers={
            'Authorization': f'Api-Key {gpt_api_key}',
            'Content-Type': 'application/json'
        },
        json=yandex_payload,
        timeout=30
    )
    
    print(f'[DEBUG] YandexGPT response status: {yandex_response.status_code}')
    
    if yandex_response.status_code != 200:
        print(f'[ERROR] YandexGPT error: {yandex_response.text[:300]}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка ИИ-анализа. Попробуйте позже.'}),
            'isBase64Encoded': False
        }
    
    ai_response = yandex_response.json()
    interpretation = ai_response['result']['alternatives'][0]['message']['text']
    
    # Извлекаем показатели и предупреждения
    ocr_lower = ocr_text.lower()
    interp_lower = interpretation.lower()
    
    extracted_values = []
    known_markers = [
        ('гемоглобин', 'hb'), ('лейкоциты', 'wbc'), ('эритроциты', 'rbc'),
        ('тромбоциты', 'plt'), ('глюкоза', 'glucose'), ('холестерин', 'cholesterol'),
        ('билирубин', 'bilirubin'), ('креатинин', 'creatinine'), ('мочевина', 'urea'),
        ('алт', 'alt'), ('аст', 'ast'), ('соэ', 'esr'), ('гематокрит', 'hct')
    ]
    for ru_name, en_name in known_markers:
        if ru_name in ocr_lower or en_name in ocr_lower:
            extracted_values.append(ru_name.capitalize())
    
    warnings = []
    if 'выше нормы' in interp_lower or 'повышен' in interp_lower or 'превышает' in interp_lower:
        warnings.append('Обнаружены повышенные показатели')
    if 'ниже нормы' in interp_lower or 'понижен' in interp_lower or 'снижен' in interp_lower:
        warnings.append('Обнаружены пониженные показатели')
    if 'обратитесь' in interp_lower or 'консультац' in interp_lower or 'врач' in interp_lower:
        warnings.append('Рекомендована консультация врача')
    
    result = {
        'status': 'completed',
        'extractedText': ocr_text[:800],
        'interpretation': interpretation,
        'extractedValues': extracted_values,
        'warnings': warnings,
        'fullResponse': interpretation,
        'processedAt': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result, ensure_ascii=False),
        'isBase64Encoded': False
    }
