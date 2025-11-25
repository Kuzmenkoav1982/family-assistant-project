'''
Business: API для управления списком покупок семьи
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict со списком покупок
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
            # Get all shopping items
            cursor.execute('''
                SELECT id, family_id, name, category, quantity, priority,
                       bought, added_by, added_by_name, added_at,
                       created_at, updated_at
                FROM shopping_items
                ORDER BY bought ASC, priority DESC, created_at DESC
            ''')
            items = cursor.fetchall()
            
            # Convert to JSON-serializable format
            result = []
            for item in items:
                item_dict = dict(item)
                if item_dict.get('added_at'):
                    item_dict['added_at'] = item_dict['added_at'].isoformat()
                if item_dict.get('created_at'):
                    item_dict['created_at'] = item_dict['created_at'].isoformat()
                if item_dict.get('updated_at'):
                    item_dict['updated_at'] = item_dict['updated_at'].isoformat()
                result.append(item_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'items': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Create new shopping item
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO shopping_items 
                (family_id, name, category, quantity, priority, bought, added_by, added_by_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, family_id, name, category, quantity, priority,
                          bought, added_by, added_by_name, added_at, created_at
            ''', (
                body.get('family_id'),
                body.get('name'),
                body.get('category', 'other'),
                body.get('quantity'),
                body.get('priority', 'normal'),
                body.get('bought', False),
                body.get('added_by'),
                body.get('added_by_name')
            ))
            
            new_item = cursor.fetchone()
            conn.commit()
            
            # Convert to JSON-serializable
            result = dict(new_item)
            if result.get('added_at'):
                result['added_at'] = result['added_at'].isoformat()
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'item': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update shopping item
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Item ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE shopping_items
                SET name = %s, category = %s, quantity = %s, 
                    priority = %s, bought = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, family_id, name, category, quantity, priority,
                          bought, added_by, added_by_name, added_at, updated_at
            ''', (
                body.get('name'),
                body.get('category'),
                body.get('quantity'),
                body.get('priority'),
                body.get('bought'),
                item_id
            ))
            
            updated_item = cursor.fetchone()
            conn.commit()
            
            if not updated_item:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Item not found'}),
                    'isBase64Encoded': False
                }
            
            # Convert to JSON-serializable
            result = dict(updated_item)
            if result.get('added_at'):
                result['added_at'] = result['added_at'].isoformat()
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'item': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Delete shopping item
            params = event.get('queryStringParameters', {})
            item_id = params.get('id')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Item ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id FROM shopping_items WHERE id = %s', (item_id,))
            existing = cursor.fetchone()
            
            if not existing:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Item not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE shopping_items SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (item_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': item_id}),
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
