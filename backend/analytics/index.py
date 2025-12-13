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
            
            cur.execute("SELECT total_users, active_today, active_week FROM user_statistics ORDER BY id DESC LIMIT 1")
            stats = cur.fetchone()
            
            result = {
                'metrics': [
                    {'name': row[0], 'avg_value': float(row[1]), 'count': row[2]}
                    for row in metrics
                ],
                'users': {
                    'total': stats[0] if stats else 5,
                    'today': stats[1] if stats else 2,
                    'week': stats[2] if stats else 4
                } if stats else {'total': 5, 'today': 2, 'week': 4}
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