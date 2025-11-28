"""
Business: Управление голосованием за разделы в разработке (голоса, комментарии, email-уведомления)
Args: event с httpMethod, body, headers
Returns: JSON с результатами голосования или статусом операции
"""

import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'
ADMIN_EMAIL = 'ip.kuzmenkoav@yandex.ru'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def send_email_notification(section_id: str, member_name: str, vote_type: str, comment: str):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Новый голос за раздел: {section_id}'
        msg['From'] = 'noreply@poehali.dev'
        msg['To'] = ADMIN_EMAIL

        html = f"""
        <html>
          <body>
            <h2>Новый голос за раздел в разработке</h2>
            <p><strong>Раздел:</strong> {section_id}</p>
            <p><strong>Пользователь:</strong> {member_name}</p>
            <p><strong>Голос:</strong> {'+1' if vote_type == 'up' else '-1'}</p>
            {f'<p><strong>Комментарий:</strong> {comment}</p>' if comment else ''}
            <p><strong>Время:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html, 'html'))
        
        # В production здесь будет реальная отправка через SMTP
        print(f"[EMAIL] Would send to {ADMIN_EMAIL}: {html}")
        
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {str(e)}")
        return False

def get_section_votes(section_id: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if section_id:
            query = f"""
                SELECT section_id,
                       COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as up_votes,
                       COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as down_votes
                FROM {SCHEMA}.dev_section_votes
                WHERE section_id = {escape_string(section_id)}
                GROUP BY section_id
            """
            cur.execute(query)
            result = cur.fetchone()
            
            comments_query = f"""
                SELECT comment, created_at, member_id
                FROM {SCHEMA}.dev_section_votes
                WHERE section_id = {escape_string(section_id)} AND comment IS NOT NULL
                ORDER BY created_at DESC
            """
            cur.execute(comments_query)
            comments = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'section_id': section_id,
                'up_votes': int(result['up_votes']) if result else 0,
                'down_votes': int(result['down_votes']) if result else 0,
                'comments': [dict(c) for c in comments] if comments else []
            }
        else:
            query = f"""
                SELECT section_id,
                       COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as up_votes,
                       COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as down_votes
                FROM {SCHEMA}.dev_section_votes
                GROUP BY section_id
            """
            cur.execute(query)
            results = cur.fetchall()
            
            cur.close()
            conn.close()
            
            votes_dict = {}
            for row in results:
                votes_dict[row['section_id']] = {
                    'up': int(row['up_votes']),
                    'down': int(row['down_votes'])
                }
            
            return votes_dict
    except Exception as e:
        cur.close()
        conn.close()
        return {}

def cast_section_vote(section_id: str, member_id: Optional[str], vote_type: str, comment: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        member_identifier = member_id if member_id else 'anonymous'
        
        check_query = f"""
            SELECT id, vote_type FROM {SCHEMA}.dev_section_votes
            WHERE section_id = {escape_string(section_id)} 
            AND member_id {'::text = ' + escape_string(member_id) if member_id else 'IS NULL'}
        """
        cur.execute(check_query)
        existing_vote = cur.fetchone()
        
        if existing_vote:
            if existing_vote['vote_type'] == vote_type and not comment:
                cur.close()
                conn.close()
                return {
                    'success': True,
                    'message': 'Голос уже учтён',
                    'votes': get_section_votes(section_id)
                }
            
            update_query = f"""
                UPDATE {SCHEMA}.dev_section_votes
                SET vote_type = {escape_string(vote_type)}
                {', comment = ' + escape_string(comment) if comment else ''}
                WHERE id::text = {escape_string(str(existing_vote['id']))}
            """
            cur.execute(update_query)
            message = 'Голос обновлён'
        else:
            insert_query = f"""
                INSERT INTO {SCHEMA}.dev_section_votes
                (section_id, member_id, vote_type, comment)
                VALUES (
                    {escape_string(section_id)},
                    {escape_string(member_id) if member_id else 'NULL'},
                    {escape_string(vote_type)},
                    {escape_string(comment) if comment else 'NULL'}
                )
            """
            cur.execute(insert_query)
            message = 'Голос учтён'
        
        if comment:
            member_name = 'Anonymous'
            if member_id:
                name_query = f"""
                    SELECT name FROM {SCHEMA}.family_members
                    WHERE id::text = {escape_string(member_id)}
                """
                cur.execute(name_query)
                member_result = cur.fetchone()
                if member_result:
                    member_name = member_result['name']
            
            send_email_notification(section_id, member_name, vote_type, comment)
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': message,
            'votes': get_section_votes(section_id)
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        section_id = query_params.get('section_id')
        
        votes = get_section_votes(section_id)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'votes': votes
            }, default=str)
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            section_id = body.get('section_id')
            vote_type = body.get('vote_type')
            comment = body.get('comment', '').strip() or None
            member_id = body.get('member_id')
            
            if not section_id or not vote_type:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Требуются section_id и vote_type'})
                }
            
            result = cast_section_vote(section_id, member_id, vote_type, comment)
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(result)
                }
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps(result, default=str)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }