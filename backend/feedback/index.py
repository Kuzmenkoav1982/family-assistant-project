"""Обработка обратной связи от пользователей"""
import json
import os
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        feedback_type = body.get('type', 'support')
        user_id = body.get('user_id', 'guest')
        user_name = body.get('user_name', 'Гость')
        user_email = body.get('user_email', '')
        title = body.get('title', '')
        description = body.get('description', '')
        rating = body.get('rating')
        
        if not user_email or not title or not description:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Заполните все обязательные поля'})
            }
        
        # Формируем email
        subject = f"[{feedback_type.upper()}] {title}"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">
                        Новое обращение от пользователя
                    </h2>
                    
                    <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <p><strong>Тип:</strong> {feedback_type}</p>
                        <p><strong>Пользователь:</strong> {user_name}</p>
                        <p><strong>Email:</strong> {user_email}</p>
                        <p><strong>User ID:</strong> {user_id}</p>
                        {f"<p><strong>Оценка:</strong> {rating}/5</p>" if rating else ""}
                        <p><strong>Время:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #ff6b35; margin-top: 0;">Тема обращения:</h3>
                        <p style="font-weight: bold;">{title}</p>
                        
                        <h3 style="color: #ff6b35;">Описание:</h3>
                        <p style="white-space: pre-wrap;">{description}</p>
                    </div>
                    
                    <div style="background: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4caf50;">
                        <p style="margin: 0;"><strong>Ответьте пользователю на:</strong> {user_email}</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Отправляем email
        try:
            send_email(
                to_email='support@nasha-semiya.ru',
                subject=subject,
                html_body=html_body
            )
        except Exception as e:
            print(f'[ERROR] Email send failed: {str(e)}')
            # Не блокируем ответ, если email не отправился
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Обращение успешно отправлено'
            })
        }
        
    except Exception as e:
        print(f'[ERROR] Handler error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Ошибка сервера',
                'details': str(e)
            })
        }


def send_email(to_email: str, subject: str, html_body: str):
    """Отправка email через SMTP"""
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.yandex.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    
    if not smtp_user or not smtp_password:
        print('[WARNING] SMTP credentials not configured')
        return
    
    msg = MIMEMultipart('alternative')
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = subject
    
    html_part = MIMEText(html_body, 'html', 'utf-8')
    msg.attach(html_part)
    
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
