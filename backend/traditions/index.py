'''
Business: API для управления семейными традициями
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с традициями
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

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
            # Get all traditions
            cursor.execute('''
                SELECT id, family_id, title, description, frequency, 
                       icon, participants, created_at, updated_at
                FROM traditions
                ORDER BY created_at DESC
            ''')
            traditions = cursor.fetchall()
            
            # Convert to JSON-serializable format
            result = []
            for tradition in traditions:
                tradition_dict = dict(tradition)
                if tradition_dict.get('created_at'):
                    tradition_dict['created_at'] = tradition_dict['created_at'].isoformat()
                if tradition_dict.get('updated_at'):
                    tradition_dict['updated_at'] = tradition_dict['updated_at'].isoformat()
                result.append(tradition_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'traditions': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Create new tradition
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO traditions 
                (family_id, title, description, frequency, icon, participants)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, family_id, title, description, frequency, 
                          icon, participants, created_at
            ''', (
                body.get('family_id') or None,
                body.get('title') or 'Tradition',
                body.get('description') or '',
                body.get('frequency') or 'once',
                body.get('icon') or '⭐',
                body.get('participants', [])
            ))
            
            new_tradition = cursor.fetchone()
            conn.commit()
            
            # Convert to JSON-serializable
            result = dict(new_tradition)
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tradition': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update tradition
            body = json.loads(event.get('body', '{}'))
            tradition_id = body.get('id')
            
            if not tradition_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tradition ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE traditions
                SET title = %s, description = %s, frequency = %s,
                    icon = %s, participants = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, family_id, title, description, frequency,
                          icon, participants, updated_at
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('frequency'),
                body.get('icon'),
                body.get('participants', []),
                tradition_id
            ))
            
            updated_tradition = cursor.fetchone()
            conn.commit()
            
            if not updated_tradition:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tradition not found'}),
                    'isBase64Encoded': False
                }
            
            # Convert to JSON-serializable
            result = dict(updated_tradition)
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tradition': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Delete tradition
            params = event.get('queryStringParameters', {})
            tradition_id = params.get('id')
            
            if not tradition_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tradition ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id FROM traditions WHERE id = %s', (tradition_id,))
            existing = cursor.fetchone()
            
            if not existing:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tradition not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE traditions SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (tradition_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': tradition_id}),
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