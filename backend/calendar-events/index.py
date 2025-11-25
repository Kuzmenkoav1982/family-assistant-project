'''
Business: API для управления событиями календаря семьи
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с событиями календаря
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

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
            # Get all calendar events
            cursor.execute('''
                SELECT id, family_id, title, description, date, time, 
                       created_by, created_by_name, created_by_avatar,
                       visibility, category, color, attendees,
                       created_at, updated_at
                FROM calendar_events
                ORDER BY date DESC, time DESC
            ''')
            events = cursor.fetchall()
            
            # Convert to JSON-serializable format
            result = []
            for event_item in events:
                event_dict = dict(event_item)
                if event_dict.get('date'):
                    event_dict['date'] = event_dict['date'].isoformat()
                if event_dict.get('time'):
                    event_dict['time'] = str(event_dict['time'])
                if event_dict.get('created_at'):
                    event_dict['created_at'] = event_dict['created_at'].isoformat()
                if event_dict.get('updated_at'):
                    event_dict['updated_at'] = event_dict['updated_at'].isoformat()
                result.append(event_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'events': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Create new calendar event
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO calendar_events 
                (family_id, title, description, date, time, created_by, 
                 created_by_name, created_by_avatar, visibility, category, color, attendees)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, family_id, title, description, date, time, 
                          created_by, created_by_name, created_by_avatar,
                          visibility, category, color, attendees, created_at
            ''', (
                body.get('family_id') or None,
                body.get('title') or 'Event',
                body.get('description') or '',
                body.get('date') or None,
                body.get('time') or None,
                body.get('created_by') or None,
                body.get('created_by_name') or 'Unknown',
                body.get('created_by_avatar') or '',
                body.get('visibility', 'family'),
                body.get('category') or 'general',
                body.get('color') or 'blue',
                json.dumps(body.get('attendees', []))
            ))
            
            new_event = cursor.fetchone()
            conn.commit()
            
            # Convert to JSON-serializable
            result = dict(new_event)
            if result.get('date'):
                result['date'] = result['date'].isoformat()
            if result.get('time'):
                result['time'] = str(result['time'])
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'event': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update calendar event
            body = json.loads(event.get('body', '{}'))
            event_id = body.get('id')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE calendar_events
                SET title = %s, description = %s, date = %s, time = %s,
                    visibility = %s, category = %s, color = %s, attendees = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, family_id, title, description, date, time,
                          created_by, created_by_name, created_by_avatar,
                          visibility, category, color, attendees, updated_at
            ''', (
                body.get('title'),
                body.get('description'),
                body.get('date'),
                body.get('time'),
                body.get('visibility'),
                body.get('category'),
                body.get('color'),
                json.dumps(body.get('attendees', [])),
                event_id
            ))
            
            updated_event = cursor.fetchone()
            conn.commit()
            
            if not updated_event:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event not found'}),
                    'isBase64Encoded': False
                }
            
            # Convert to JSON-serializable
            result = dict(updated_event)
            if result.get('date'):
                result['date'] = result['date'].isoformat()
            if result.get('time'):
                result['time'] = str(result['time'])
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'event': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Delete calendar event
            params = event.get('queryStringParameters', {})
            event_id = params.get('id')
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id FROM calendar_events WHERE id = %s', (event_id,))
            existing = cursor.fetchone()
            
            if not existing:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE calendar_events SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (event_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': event_id}),
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