'''
Business: API для управления целями семьи
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с целями семьи
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
            # Get all family goals
            cursor.execute('''
                SELECT id, family_id, title, description, category, 
                       target_date, progress, status,
                       created_by, created_by_name, created_at, updated_at
                FROM family_goals
                ORDER BY status ASC, target_date ASC
            ''')
            goals = cursor.fetchall()
            
            # Convert to JSON-serializable format
            result = []
            for goal in goals:
                goal_dict = dict(goal)
                if goal_dict.get('target_date'):
                    goal_dict['target_date'] = goal_dict['target_date'].isoformat()
                if goal_dict.get('created_at'):
                    goal_dict['created_at'] = goal_dict['created_at'].isoformat()
                if goal_dict.get('updated_at'):
                    goal_dict['updated_at'] = goal_dict['updated_at'].isoformat()
                result.append(goal_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'goals': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Create new family goal
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO family_goals 
                (family_id, title, description, category, target_date, 
                 progress, status, created_by, created_by_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, family_id, title, description, category,
                          target_date, progress, status, created_by, 
                          created_by_name, created_at
            ''', (
                body.get('family_id'),
                body.get('title'),
                body.get('description'),
                body.get('category'),
                body.get('target_date'),
                body.get('progress', 0),
                body.get('status', 'active'),
                body.get('created_by'),
                body.get('created_by_name')
            ))
            
            new_goal = cursor.fetchone()
            conn.commit()
            
            # Convert to JSON-serializable
            result = dict(new_goal)
            if result.get('target_date'):
                result['target_date'] = result['target_date'].isoformat()
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'goal': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update family goal
            body = json.loads(event.get('body', '{}'))
            goal_id = body.get('id')
            
            if not goal_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Goal ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE family_goals
                SET title = %s, description = %s, category = %s,
                    target_date = %s, progress = %s, status = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, family_id, title, description, category,
                          target_date, progress, status, created_by,
                          created_by_name, updated_at
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('category'),
                body.get('target_date'),
                body.get('progress'),
                body.get('status'),
                goal_id
            ))
            
            updated_goal = cursor.fetchone()
            conn.commit()
            
            if not updated_goal:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Goal not found'}),
                    'isBase64Encoded': False
                }
            
            # Convert to JSON-serializable
            result = dict(updated_goal)
            if result.get('target_date'):
                result['target_date'] = result['target_date'].isoformat()
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'goal': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Delete family goal
            params = event.get('queryStringParameters', {})
            goal_id = params.get('id')
            
            if not goal_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Goal ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id FROM family_goals WHERE id = %s', (goal_id,))
            existing = cursor.fetchone()
            
            if not existing:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Goal not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE family_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (goal_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': goal_id}),
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
