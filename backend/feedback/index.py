import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle feedback, suggestions, and support requests
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with statusCode, headers, body
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            feedback_type = params.get('type', 'review')
            
            query = '''
                SELECT id, type, user_name, title, description, rating, created_at
                FROM feedback
                WHERE type = %s
                ORDER BY created_at DESC
                LIMIT 100
            '''
            cursor.execute(query, (feedback_type,))
            items = [dict(row) for row in cursor.fetchall()]
            
            for item in items:
                if item['created_at']:
                    item['created_at'] = item['created_at'].isoformat()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'items': items})
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            feedback_type = body_data.get('type')
            user_id = body_data.get('user_id')
            user_name = body_data.get('user_name')
            user_email = body_data.get('user_email')
            title = body_data.get('title')
            description = body_data.get('description')
            rating = body_data.get('rating')
            
            if not feedback_type or not user_name or not description:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            query = '''
                INSERT INTO feedback (type, user_id, user_name, user_email, title, description, rating, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id
            '''
            cursor.execute(query, (
                feedback_type,
                user_id,
                user_name,
                user_email,
                title,
                description,
                rating,
                'new'
            ))
            conn.commit()
            result = cursor.fetchone()
            
            if feedback_type == 'support':
                send_support_email(user_name, user_email, title, description)
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'id': str(result['id']), 'message': 'Feedback submitted successfully'})
            }
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }


def send_support_email(user_name: str, user_email: str, title: str, description: str):
    '''Send support request to admin email'''
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASSWORD')
    admin_email = os.environ.get('ADMIN_EMAIL')
    
    if not all([smtp_user, smtp_pass, admin_email]):
        return
    
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = admin_email
    msg['Subject'] = f'Техподдержка: {title}'
    
    body = f'''
Новое обращение в техподдержку

От: {user_name}
Email: {user_email or 'не указан'}
Тема: {title}

Описание проблемы:
{description}
'''
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f'Email sending failed: {e}')
