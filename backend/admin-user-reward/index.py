"""
Business: Ручное поощрение пользователя админом — email + персональное уведомление в приложении.
Args: event с httpMethod, body (user_id, to_email, subject, email_html, notif_title, notif_message, notif_target_url)
Returns: HTTP response с результатом отправки email и созданием уведомления
"""

import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any
import psycopg2

DATABASE_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Max-Age': '86400'
}


def respond(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False
    }


def escape_string(value: str) -> str:
    return str(value).replace("'", "''")


def send_email(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    smtp_login = os.environ.get('YANDEX_SMTP_LOGIN', '')
    smtp_password = os.environ.get('YANDEX_SMTP_PASSWORD', '')
    if not smtp_login or not smtp_password:
        return False
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_login
        msg['To'] = to_email
        msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        with smtplib.SMTP_SSL('smtp.yandex.ru', 465) as server:
            server.login(smtp_login, smtp_password)
            server.sendmail(smtp_login, to_email, msg.as_string())
        return True
    except Exception:
        return False


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    if method != 'POST':
        return respond(405, {'error': 'Метод не поддерживается'})

    headers = event.get('headers', {}) or {}
    admin_token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    expected_token = os.environ.get('ADMIN_TOKEN', 'change-me')
    if admin_token != expected_token:
        return respond(401, {'error': 'Unauthorized'})

    body = json.loads(event.get('body') or '{}')
    user_id = body.get('user_id')
    to_email = (body.get('to_email') or '').strip()
    subject = (body.get('subject') or '').strip()
    email_html = body.get('email_html') or ''
    email_text = body.get('email_text') or ''
    notif_title = (body.get('notif_title') or '').strip()
    notif_message = (body.get('notif_message') or '').strip()
    notif_target_url = body.get('notif_target_url') or '/wallet'

    if not user_id or not to_email or not subject or not notif_title or not notif_message:
        return respond(400, {'error': 'Требуются user_id, to_email, subject, notif_title, notif_message'})

    email_sent = send_email(to_email, subject, email_html, email_text or notif_message)

    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.notifications
                (user_id, type, title, message, target_url, channel, status, sent_at, created_at)
            VALUES ('{escape_string(user_id)}'::uuid, 'admin_reward', '{escape_string(notif_title)}',
                    '{escape_string(notif_message)}', '{escape_string(notif_target_url)}',
                    'in_app', 'sent', NOW(), NOW())
            RETURNING id
            """
        )
        notif_id = cur.fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    return respond(200, {
        'success': True,
        'email_sent': email_sent,
        'notification_id': str(notif_id)
    })
