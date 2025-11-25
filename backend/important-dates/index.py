'''
Business: API для управления важными датами семьи
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с важными датами
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # CORS OPTIONS handling
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Database connection
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            # Get all important dates with days left calculation
            cursor.execute('''
                SELECT id, family_id, title, date, type, description, recurring,
                       created_at, updated_at
                FROM important_dates
                ORDER BY date ASC
            ''')
            dates = cursor.fetchall()
            
            # Convert to JSON-serializable format and calculate days left
            result = []
            today = date.today()
            
            for date_item in dates:
                date_dict = dict(date_item)
                event_date = date_dict.get('date')
                
                if event_date:
                    date_dict['date'] = event_date.isoformat()
                    # Calculate days left
                    delta = event_date - today
                    date_dict['daysLeft'] = delta.days
                
                if date_dict.get('created_at'):
                    date_dict['created_at'] = date_dict['created_at'].isoformat()
                if date_dict.get('updated_at'):
                    date_dict['updated_at'] = date_dict['updated_at'].isoformat()
                
                result.append(date_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'dates': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Create new important date
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO important_dates 
                (family_id, title, date, type, description, recurring)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, family_id, title, date, type, description, 
                          recurring, created_at
            ''', (
                body.get('family_id'),
                body.get('title'),
                body.get('date'),
                body.get('type'),
                body.get('description'),
                body.get('recurring', False)
            ))
            
            new_date = cursor.fetchone()
            conn.commit()
            
            # Convert to JSON-serializable
            result = dict(new_date)
            if result.get('date'):
                event_date = result['date']
                result['date'] = event_date.isoformat()
                delta = event_date - date.today()
                result['daysLeft'] = delta.days
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'date': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update important date
            body = json.loads(event.get('body', '{}'))
            date_id = body.get('id')
            
            if not date_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Date ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE important_dates
                SET title = %s, date = %s, type = %s, 
                    description = %s, recurring = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, family_id, title, date, type, description,
                          recurring, updated_at
            ''', (
                body.get('title'),
                body.get('date'),
                body.get('type'),
                body.get('description'),
                body.get('recurring'),
                date_id
            ))
            
            updated_date = cursor.fetchone()
            conn.commit()
            
            if not updated_date:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Date not found'}),
                    'isBase64Encoded': False
                }
            
            # Convert to JSON-serializable
            result = dict(updated_date)
            if result.get('date'):
                event_date = result['date']
                result['date'] = event_date.isoformat()
                delta = event_date - date.today()
                result['daysLeft'] = delta.days
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'date': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Delete important date
            params = event.get('queryStringParameters', {})
            date_id = params.get('id')
            
            if not date_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Date ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id FROM important_dates WHERE id = %s', (date_id,))
            existing = cursor.fetchone()
            
            if not existing:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Date not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE important_dates SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (date_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': date_id}),
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
        cursor.close()
        conn.close()
