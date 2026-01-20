import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Функция для сбора и получения статистики Web Vitals и пользователей
    Поддерживает POST (отправка метрик) и GET (получение статистики)
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    try:
        if method == 'POST':
            body = event.get('body') or '{}'
            body_data = json.loads(body) if body else {}
            
            metric_name = body_data.get('name')
            metric_value = body_data.get('value')
            rating = body_data.get('rating', 'unknown')
            
            headers = event.get('headers', {})
            user_agent = headers.get('user-agent', '')
            
            cur.execute(
                "INSERT INTO analytics_metrics (metric_name, metric_value, rating, user_agent) VALUES (%s, %s, %s, %s)",
                (metric_name, metric_value, rating, user_agent)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            cur.execute("""
                SELECT 
                    metric_name,
                    AVG(metric_value) as avg_value,
                    COUNT(*) as count
                FROM analytics_metrics 
                WHERE created_at > NOW() - INTERVAL '24 hours'
                GROUP BY metric_name
            """)
            metrics = cur.fetchall()
            
            cur.execute("SELECT COUNT(*) FROM families")
            total_families = cur.fetchone()[0]
            
            cur.execute("""
                SELECT COUNT(DISTINCT family_id) 
                FROM calendar_events 
                WHERE created_at > NOW() - INTERVAL '1 day'
            """)
            active_today = cur.fetchone()[0]
            
            cur.execute("""
                SELECT COUNT(DISTINCT family_id) 
                FROM calendar_events 
                WHERE created_at > NOW() - INTERVAL '7 days'
            """)
            active_week = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM tasks WHERE created_at > NOW() - INTERVAL '7 days'")
            tasks_week = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM calendar_events WHERE created_at > NOW() - INTERVAL '7 days'")
            events_week = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM shopping_items_v2 WHERE created_at > NOW() - INTERVAL '7 days'")
            shopping_week = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM children_development WHERE created_at > NOW() - INTERVAL '30 days'")
            children_month = cur.fetchone()[0]
            
            result = {
                'metrics': [
                    {'name': row[0], 'avg_value': float(row[1]), 'count': row[2]}
                    for row in metrics
                ],
                'users': {
                    'total': total_families,
                    'today': active_today,
                    'week': active_week
                },
                'activity': {
                    'tasks_week': tasks_week,
                    'events_week': events_week,
                    'shopping_week': shopping_week,
                    'children_month': children_month
                }
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()