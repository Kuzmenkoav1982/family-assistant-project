import json
import os
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    """Отправка уведомлений о заявках клиентов в Telegram"""
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        service = body.get('service', 'Не указано')
        name = body.get('name', 'Не указано')
        phone = body.get('phone', 'Не указано')
        message_text = body.get('message', '')
        chat_id = body.get('chat_id') or os.environ.get('TELEGRAM_ADMIN_CHAT_ID')
        
        if not chat_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'chat_id не найден - добавьте TELEGRAM_ADMIN_CHAT_ID в секреты'})
            }
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Bot token not configured'})
            }
        
        notification = f"🔔 Новая заявка!\n\n📋 Услуга: {service}\n👤 Имя: {name}\n📞 Телефон: {phone}"
        
        if message_text:
            notification += f"\n💬 Сообщение: {message_text}"
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': str(chat_id),
            'text': notification
        }).encode('utf-8')
        
        req = urllib.request.Request(url, data=data)
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Уведомление отправлено'})
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Telegram API error', 'details': result})
                }
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }