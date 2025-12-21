"""
Управление персональными календарями детей

Обеспечивает CRUD операции для событий календаря, привязанных к конкретному ребёнку.
Поддерживает фильтрацию, категоризацию и напоминания.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов для персонального календаря ребёнка
    
    Args:
        event: HTTP запрос с action, familyId, childId, eventId, event
        context: Контекст выполнения
        
    Returns:
        HTTP ответ с результатом операции
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        family_id = body.get('familyId')
        child_id = body.get('childId')
        
        if not action:
            return error_response('Action is required', 400)
        
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            return error_response('Database configuration error', 500)
        
        conn = psycopg2.connect(db_url)
        
        if action == 'get_child_events':
            result = get_child_events(conn, family_id, child_id)
        elif action == 'add_child_event':
            result = add_child_event(conn, family_id, child_id, body.get('event', {}))
        elif action == 'update_child_event':
            result = update_child_event(conn, body.get('eventId'), body.get('event', {}))
        elif action == 'delete_child_event':
            result = delete_child_event(conn, body.get('eventId'))
        else:
            conn.close()
            return error_response(f'Unknown action: {action}', 400)
        
        conn.close()
        return success_response(result)
        
    except json.JSONDecodeError:
        return error_response('Invalid JSON', 400)
    except Exception as e:
        return error_response(f'Server error: {str(e)}', 500)


def get_child_events(conn, family_id: str, child_id: str) -> Dict:
    """Получить все события ребёнка"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute("""
        SELECT 
            id::text,
            child_id::text,
            title,
            description,
            date::text,
            time,
            category,
            color,
            reminder_time,
            completed,
            created_at::text,
            updated_at::text
        FROM t_p5815085_family_assistant_pro.calendar_events
        WHERE family_id = %s AND child_id = %s
        ORDER BY date ASC, time ASC NULLS LAST
    """, (family_id, child_id))
    
    events = cursor.fetchall()
    cursor.close()
    
    return {
        'events': [
            {
                'id': e['id'],
                'child_id': e['child_id'],
                'title': e['title'],
                'description': e['description'],
                'date': e['date'],
                'time': e['time'],
                'category': e['category'] or 'other',
                'color': e['color'],
                'reminder_enabled': e['reminder_time'] is not None,
                'completed': e.get('completed', False),
                'created_at': e['created_at'],
                'updated_at': e['updated_at']
            }
            for e in events
        ]
    }


def add_child_event(conn, family_id: str, child_id: str, event_data: Dict) -> Dict:
    """Добавить событие в календарь ребёнка"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    title = event_data.get('title')
    description = event_data.get('description')
    date = event_data.get('date')
    time = event_data.get('time')
    category = event_data.get('category', 'other')
    color = event_data.get('color')
    reminder_enabled = event_data.get('reminder_enabled', False)
    
    if not title or not date:
        cursor.close()
        raise ValueError('Title and date are required')
    
    reminder_time = '09:00' if reminder_enabled else None
    
    cursor.execute("""
        INSERT INTO t_p5815085_family_assistant_pro.calendar_events
        (family_id, child_id, title, description, date, time, category, color, 
         reminder_time, visibility, completed, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'family', false, NOW(), NOW())
        RETURNING id::text
    """, (family_id, child_id, title, description, date, time, category, color, reminder_time))
    
    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    
    return {'success': True, 'eventId': result['id'], 'message': 'Event added successfully'}


def update_child_event(conn, event_id: str, event_data: Dict) -> Dict:
    """Обновить событие в календаре"""
    cursor = conn.cursor()
    
    fields = []
    values = []
    
    if 'title' in event_data:
        fields.append('title = %s')
        values.append(event_data['title'])
    
    if 'description' in event_data:
        fields.append('description = %s')
        values.append(event_data['description'])
    
    if 'date' in event_data:
        fields.append('date = %s')
        values.append(event_data['date'])
    
    if 'time' in event_data:
        fields.append('time = %s')
        values.append(event_data['time'])
    
    if 'category' in event_data:
        fields.append('category = %s')
        values.append(event_data['category'])
    
    if 'color' in event_data:
        fields.append('color = %s')
        values.append(event_data['color'])
    
    if 'reminder_enabled' in event_data:
        reminder_time = '09:00' if event_data['reminder_enabled'] else None
        fields.append('reminder_time = %s')
        values.append(reminder_time)
    
    if 'completed' in event_data:
        fields.append('completed = %s')
        values.append(event_data['completed'])
    
    fields.append('updated_at = NOW()')
    values.append(event_id)
    
    query = f"""
        UPDATE t_p5815085_family_assistant_pro.calendar_events
        SET {', '.join(fields)}
        WHERE id = %s
    """
    
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    
    return {'success': True, 'message': 'Event updated successfully'}


def delete_child_event(conn, event_id: str) -> Dict:
    """Удалить событие из календаря"""
    cursor = conn.cursor()
    
    cursor.execute("""
        DELETE FROM t_p5815085_family_assistant_pro.calendar_events
        WHERE id = %s
    """, (event_id,))
    
    conn.commit()
    cursor.close()
    
    return {'success': True, 'message': 'Event deleted successfully'}


def success_response(data: Dict, status_code: int = 200) -> Dict:
    """Успешный HTTP ответ"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False
    }


def error_response(message: str, status_code: int = 500) -> Dict:
    """HTTP ответ с ошибкой"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}, ensure_ascii=False),
        'isBase64Encoded': False
    }
