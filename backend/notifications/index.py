import json
import os
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr, Field


class EmailRequest(BaseModel):
    to: EmailStr = Field(..., description="Email получателя")
    subject: str = Field(..., min_length=1, description="Тема письма")
    body: str = Field(..., min_length=1, description="Текст письма")
    html: Optional[str] = Field(None, description="HTML версия письма")


class SMSRequest(BaseModel):
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{10,14}$', description="Телефон в формате +79001234567")
    message: str = Field(..., min_length=1, max_length=160, description="Текст SMS (до 160 символов)")


def send_email_smtp(to: str, subject: str, body: str, html: Optional[str] = None) -> Dict[str, Any]:
    """Отправка email через Яндекс.Почту SMTP"""
    smtp_login = os.environ.get('YANDEX_SMTP_LOGIN')
    smtp_password = os.environ.get('YANDEX_SMTP_PASSWORD')
    
    if not smtp_login or not smtp_password:
        raise ValueError("YANDEX_SMTP_LOGIN и YANDEX_SMTP_PASSWORD не настроены")
    
    sender_email = smtp_login if '@' in smtp_login else f"{smtp_login}@yandex.ru"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"Family Organizer <{sender_email}>"
    msg['To'] = to
    
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    if html:
        msg.attach(MIMEText(html, 'html', 'utf-8'))
    
    with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
        server.login(sender_email, smtp_password)
        server.send_message(msg)
    
    return {"status": "sent", "to": to, "method": "smtp"}


def send_sms_yandex(phone: str, message: str) -> Dict[str, Any]:
    """Отправка SMS через Yandex Cloud (требует настройки Yandex Cloud Messaging)"""
    api_key = os.environ.get('YANDEX_CLOUD_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    
    if not api_key or not folder_id:
        raise ValueError("YANDEX_CLOUD_API_KEY и YANDEX_FOLDER_ID не настроены")
    
    url = f"https://sms.api.cloud.yandex.net/sms/v1/messages"
    headers = {
        'Authorization': f'Api-Key {api_key}',
        'Content-Type': 'application/json'
    }
    payload = {
        'destination': phone,
        'text': message,
        'folder_id': folder_id
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    response.raise_for_status()
    
    return {"status": "sent", "phone": phone, "response": response.json()}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Отправка email и SMS уведомлений через Яндекс.Облако
    
    POST ?action=email - отправить email
    POST ?action=sms - отправить SMS
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только POST запросы'}),
            'isBase64Encoded': False
        }
    
    query_params = event.get('queryStringParameters') or {}
    action = query_params.get('action', '')
    body_data = json.loads(event.get('body', '{}'))
    
    try:
        if action == 'email':
            email_req = EmailRequest(**body_data)
            result = send_email_smtp(
                to=email_req.to,
                subject=email_req.subject,
                body=email_req.body,
                html=email_req.html
            )
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'sms':
            sms_req = SMSRequest(**body_data)
            result = send_sms_yandex(
                phone=sms_req.phone,
                message=sms_req.message
            )
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Укажите action=email или action=sms в query параметрах'}),
                'isBase64Encoded': False
            }
    
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка отправки: {str(e)}'}),
            'isBase64Encoded': False
        }