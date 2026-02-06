import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для сбора и анализа статистики кликов по разделам велком-страницы'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database configuration missing'})
            }
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'track_click':
                section_index = body.get('section_index')
                section_title = body.get('section_title')
                session_id = body.get('session_id')
                user_agent = body.get('user_agent', '')
                
                # Проверка дублирования: если в последние 10 секунд уже был клик по этому разделу в этой сессии
                cursor.execute(f'''
                    SELECT COUNT(*) FROM {schema}.welcome_section_clicks
                    WHERE session_id = %s 
                    AND section_index = %s 
                    AND clicked_at > %s
                ''', (session_id, section_index, datetime.utcnow() - timedelta(seconds=10)))
                
                if cursor.fetchone()[0] > 0:
                    # Дубликат - не записываем
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'duplicate': True})
                    }
                
                cursor.execute(f'''
                    INSERT INTO {schema}.welcome_section_clicks 
                    (section_index, section_title, session_id, user_agent, clicked_at)
                    VALUES (%s, %s, %s, %s, %s)
                ''', (section_index, section_title, session_id, user_agent, datetime.utcnow()))
                
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'stats')
            
            if action == 'stats':
                now = datetime.utcnow()
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                week_start = now - timedelta(days=7)
                month_start = now - timedelta(days=30)
                
                # Общая статистика по всем разделам
                cursor.execute(f'''
                    SELECT 
                        section_index,
                        section_title,
                        COUNT(*) as total_clicks,
                        COUNT(DISTINCT session_id) as unique_sessions
                    FROM {schema}.welcome_section_clicks
                    GROUP BY section_index, section_title
                    ORDER BY section_index
                ''')
                
                total_stats = []
                for row in cursor.fetchall():
                    total_stats.append({
                        'section_index': row[0],
                        'section_title': row[1],
                        'total_clicks': row[2],
                        'unique_sessions': row[3]
                    })
                
                # Статистика за день
                cursor.execute(f'''
                    SELECT 
                        section_index,
                        section_title,
                        COUNT(*) as clicks,
                        COUNT(DISTINCT session_id) as sessions
                    FROM {schema}.welcome_section_clicks
                    WHERE clicked_at >= %s
                    GROUP BY section_index, section_title
                    ORDER BY section_index
                ''', (today_start,))
                
                today_stats = []
                for row in cursor.fetchall():
                    today_stats.append({
                        'section_index': row[0],
                        'section_title': row[1],
                        'clicks': row[2],
                        'sessions': row[3]
                    })
                
                # Статистика за неделю
                cursor.execute(f'''
                    SELECT 
                        section_index,
                        section_title,
                        COUNT(*) as clicks,
                        COUNT(DISTINCT session_id) as sessions
                    FROM {schema}.welcome_section_clicks
                    WHERE clicked_at >= %s
                    GROUP BY section_index, section_title
                    ORDER BY section_index
                ''', (week_start,))
                
                week_stats = []
                for row in cursor.fetchall():
                    week_stats.append({
                        'section_index': row[0],
                        'section_title': row[1],
                        'clicks': row[2],
                        'sessions': row[3]
                    })
                
                # Статистика за месяц
                cursor.execute(f'''
                    SELECT 
                        section_index,
                        section_title,
                        COUNT(*) as clicks,
                        COUNT(DISTINCT session_id) as sessions
                    FROM {schema}.welcome_section_clicks
                    WHERE clicked_at >= %s
                    GROUP BY section_index, section_title
                    ORDER BY section_index
                ''', (month_start,))
                
                month_stats = []
                for row in cursor.fetchall():
                    month_stats.append({
                        'section_index': row[0],
                        'section_title': row[1],
                        'clicks': row[2],
                        'sessions': row[3]
                    })
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'total': total_stats,
                        'today': today_stats,
                        'week': week_stats,
                        'month': month_stats
                    })
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }