import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для отслеживания посещаемости и активности пользователей
    POST - записать просмотр страницы
    GET ?action=stats - получить статистику посещаемости
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if method == 'POST':
            body = event.get('body') or '{}'
            data = json.loads(body) if body else {}
            
            page_path = data.get('page_path', '/')
            page_title = data.get('page_title', '')
            referrer = data.get('referrer', '')
            session_id = data.get('session_id', '')
            
            request_context = event.get('requestContext', {})
            user_agent = event.get('headers', {}).get('user-agent', '')
            ip_address = request_context.get('identity', {}).get('sourceIp', '')
            
            cur.execute("""
                INSERT INTO page_views 
                (page_path, page_title, referrer, session_id, user_agent, ip_address)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (page_path, page_title, referrer, session_id, user_agent, ip_address))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'stats')
            
            if action == 'stats':
                cur.execute("""
                    SELECT 
                        COUNT(*) as total_views,
                        COUNT(DISTINCT session_id) as unique_sessions,
                        COUNT(DISTINCT DATE(created_at)) as active_days
                    FROM page_views
                """)
                total_stats = cur.fetchone()
                
                cur.execute("""
                    SELECT 
                        COUNT(*) as today_views,
                        COUNT(DISTINCT session_id) as today_sessions
                    FROM page_views
                    WHERE created_at >= CURRENT_DATE
                """)
                today_stats = cur.fetchone()
                
                cur.execute("""
                    SELECT 
                        COUNT(*) as week_views,
                        COUNT(DISTINCT session_id) as week_sessions
                    FROM page_views
                    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
                """)
                week_stats = cur.fetchone()
                
                cur.execute("""
                    SELECT 
                        page_path,
                        COUNT(*) as views
                    FROM page_views
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY page_path
                    ORDER BY views DESC
                    LIMIT 10
                """)
                top_pages = cur.fetchall()
                
                cur.execute("""
                    SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as views,
                        COUNT(DISTINCT session_id) as sessions
                    FROM page_views
                    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC
                """)
                daily_stats = cur.fetchall()
                
                result = {
                    'total': {
                        'views': total_stats[0],
                        'sessions': total_stats[1],
                        'active_days': total_stats[2]
                    },
                    'today': {
                        'views': today_stats[0],
                        'sessions': today_stats[1]
                    },
                    'week': {
                        'views': week_stats[0],
                        'sessions': week_stats[1]
                    },
                    'top_pages': [
                        {'path': row[0], 'views': row[1]}
                        for row in top_pages
                    ],
                    'daily_chart': [
                        {'date': str(row[0]), 'views': row[1], 'sessions': row[2]}
                        for row in daily_stats
                    ]
                }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
