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
        
        gpt_api_key = os.environ.get('YANDEX_GPT_API_KEY')
        vision_api_key = os.environ.get('YANDEX_CLOUD_API_KEY')
        vision_folder_id = 'b1g3puef9ud8vnrlbudf'
        gpt_folder_id = 'b1gaglg8i7v2i32nvism'
        
        print(f'[DEBUG] Starting AI analysis, type: {analysis_type}')
        
        system_prompts = {
            'blood_test': 'Ты медицинский ассистент. Проанализируй результаты общего анализа крови. Выдели показатели, укажи норму и отклонения. Дай краткую интерпретацию.',
            'biochemistry': 'Ты медицинский ассистент. Проанализируй биохимический анализ крови. Выдели ключевые показатели, сравни с нормой.',
            'urine_test': 'Ты медицинский ассистент. Проанализируй анализ мочи. Выдели показатели, укажи норму.',
            'general': 'Ты медицинский ассистент. Распознай и проанализируй медицинские результаты на изображении. Выдели ключевые показатели.'
        }
        
        system_prompt = system_prompts.get(analysis_type, system_prompts['general'])
        
        # Используем Yandex Vision OCR для распознавания текста
        vision_payload = {
            'folderId': vision_folder_id,
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
        
        if vision_response.status_code != 200:
            print(f'[ERROR] Vision OCR error: {vision_response.text}')
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не удалось распознать текст', 'details': vision_response.text}),
                'isBase64Encoded': False
            }
        
        vision_result = vision_response.json()
        
        # Извлекаем распознанный текст
        ocr_text = ''
        try:
            pages = vision_result['results'][0]['results'][0]['textDetection']['pages']
            for page in pages:
                for block in page.get('blocks', []):
                    for line in block.get('lines', []):
                        words = [word['text'] for word in line.get('words', [])]
                        ocr_text += ' '.join(words) + '\n'
        except (KeyError, IndexError) as e:
            print(f'[ERROR] Failed to parse OCR result: {e}')
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Текст не распознан на изображении'}),
                'isBase64Encoded': False
            }
        
        if not ocr_text.strip():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'На изображении не найдено текста'}),
                'isBase64Encoded': False
            }
        
        # Теперь анализируем распознанный текст с помощью YandexGPT
        yandex_payload = {
            'modelUri': f'gpt://{gpt_folder_id}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.3,
                'maxTokens': 1500
            },
            'messages': [
                {
                    'role': 'system',
                    'text': system_prompt
                },
                {
                    'role': 'user',
                    'text': f'Распознанный текст с медицинского документа:\n\n{ocr_text}\n\nПроанализируй результаты.'
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
        
        # Извлекаем показатели из распознанного текста
        if 'гемоглобин' in ocr_text.lower() or 'hb' in ocr_text.lower():
            extracted_values.append('Гемоглобин')
        if 'лейкоциты' in ocr_text.lower() or 'wbc' in ocr_text.lower():
            extracted_values.append('Лейкоциты')
        if 'эритроциты' in ocr_text.lower() or 'rbc' in ocr_text.lower():
            extracted_values.append('Эритроциты')
        
        # Ищем предупреждения в интерпретации
        if 'выше нормы' in interpretation.lower() or 'повышен' in interpretation.lower():
            warnings.append('Обнаружены повышенные показатели')
        if 'ниже нормы' in interpretation.lower() or 'понижен' in interpretation.lower():
            warnings.append('Обнаружены пониженные показатели')
        
        result = {
            'status': 'completed',
            'extractedText': ocr_text[:500],
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