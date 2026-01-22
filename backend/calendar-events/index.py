"""
API для управления событиями календаря с синхронизацией между устройствами
"""

import json
import os
from datetime import datetime, date
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor, Json

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT s.user_id, fm.family_id, fm.id as member_id, fm.name as member_name, fm.avatar
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.family_members fm ON s.user_id = fm.user_id
        WHERE s.token = %s AND s.expires_at > CURRENT_TIMESTAMP
        LIMIT 1
        """,
        (token,)
    )
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return dict(session) if session else None

def get_events(family_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT 
            id, family_id, title, description, date, time, duration, location, 
            category, created_by, assigned_to, visibility, color, reminder_time,
            attendees, child_id, completed, created_by_name, created_by_avatar,
            reminder_enabled, reminder_days, reminder_date,
            is_recurring, recurring_frequency, recurring_interval, recurring_end_date, recurring_days_of_week,
            created_at, updated_at
        FROM {SCHEMA}.calendar_events
        WHERE family_id = %s
        ORDER BY date DESC, time DESC
        """,
        (family_id,)
    )
    events = cur.fetchall()
    cur.close()
    conn.close()
    
    result = []
    for e in events:
        event_dict = dict(e)
        if event_dict.get('date'):
            event_dict['date'] = event_dict['date'].isoformat()
        if event_dict.get('reminder_date'):
            event_dict['reminder_date'] = event_dict['reminder_date'].isoformat()
        if event_dict.get('recurring_end_date'):
            event_dict['recurring_end_date'] = event_dict['recurring_end_date'].isoformat()
        result.append(event_dict)
    
    return result

def create_event(family_id: int, member_name: str, member_avatar: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    assigned_to_array = None
    if event_data.get('assignedTo'):
        if event_data['assignedTo'] == 'all':
            assigned_to_array = None
        else:
            assigned_to_array = [event_data['assignedTo']]
    
    attendees_json = None
    if event_data.get('attendees') and isinstance(event_data['attendees'], list):
        attendees_json = Json(event_data['attendees'])
    
    recurring_days = None
    if event_data.get('recurringDaysOfWeek') and isinstance(event_data['recurringDaysOfWeek'], list):
        recurring_days = event_data['recurringDaysOfWeek']
    
    reminder_date = event_data.get('reminderDate') or None
    if reminder_date == '':
        reminder_date = None
    
    recurring_end_date = event_data.get('recurringEndDate') or None
    if recurring_end_date == '':
        recurring_end_date = None
    
    cur.execute(
        f"""
        INSERT INTO {SCHEMA}.calendar_events 
        (family_id, title, description, date, time, duration, location, category, 
         visibility, color, reminder_time, assigned_to, attendees, created_by_name, created_by_avatar,
         reminder_enabled, reminder_days, reminder_date,
         is_recurring, recurring_frequency, recurring_interval, recurring_end_date, recurring_days_of_week)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, date, created_at
        """,
        (
            family_id,
            event_data.get('title', ''),
            event_data.get('description', ''),
            event_data.get('date'),
            event_data.get('time'),
            event_data.get('duration'),
            event_data.get('location'),
            event_data.get('category', 'personal'),
            event_data.get('visibility', 'family'),
            event_data.get('color', '#3b82f6'),
            event_data.get('reminderTime'),
            assigned_to_array,
            attendees_json,
            member_name,
            member_avatar,
            event_data.get('reminderEnabled', True),
            event_data.get('reminderDays'),
            reminder_date,
            event_data.get('isRecurring', False),
            event_data.get('recurringFrequency'),
            event_data.get('recurringInterval', 1),
            recurring_end_date,
            recurring_days
        )
    )
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return dict(result) if result else {}

def update_event(event_id: int, family_id: int, event_data: Dict[str, Any]) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    
    assigned_to_array = None
    if event_data.get('assignedTo'):
        if event_data['assignedTo'] == 'all':
            assigned_to_array = None
        else:
            assigned_to_array = [event_data['assignedTo']]
    
    attendees_json = None
    if event_data.get('attendees') and isinstance(event_data['attendees'], list):
        attendees_json = Json(event_data['attendees'])
    
    recurring_days = None
    if event_data.get('recurringDaysOfWeek') and isinstance(event_data['recurringDaysOfWeek'], list):
        recurring_days = event_data['recurringDaysOfWeek']
    
    reminder_date = event_data.get('reminderDate') or None
    if reminder_date == '':
        reminder_date = None
    
    recurring_end_date = event_data.get('recurringEndDate') or None
    if recurring_end_date == '':
        recurring_end_date = None
    
    cur.execute(
        f"""
        UPDATE {SCHEMA}.calendar_events
        SET title = %s, description = %s, date = %s, time = %s, duration = %s,
            location = %s, category = %s, visibility = %s, color = %s,
            reminder_time = %s, assigned_to = %s, attendees = %s,
            reminder_enabled = %s, reminder_days = %s, reminder_date = %s,
            is_recurring = %s, recurring_frequency = %s, recurring_interval = %s,
            recurring_end_date = %s, recurring_days_of_week = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND family_id = %s
        """,
        (
            event_data.get('title'),
            event_data.get('description'),
            event_data.get('date'),
            event_data.get('time'),
            event_data.get('duration'),
            event_data.get('location'),
            event_data.get('category'),
            event_data.get('visibility'),
            event_data.get('color'),
            event_data.get('reminderTime'),
            assigned_to_array,
            attendees_json,
            event_data.get('reminderEnabled'),
            event_data.get('reminderDays'),
            reminder_date,
            event_data.get('isRecurring'),
            event_data.get('recurringFrequency'),
            event_data.get('recurringInterval'),
            recurring_end_date,
            recurring_days,
            event_id,
            family_id
        )
    )
    success = cur.rowcount > 0
    conn.commit()
    cur.close()
    conn.close()
    
    return success

def delete_event(event_id: int, family_id: int) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        f"DELETE FROM {SCHEMA}.calendar_events WHERE id = %s AND family_id = %s",
        (event_id, family_id)
    )
    success = cur.rowcount > 0
    conn.commit()
    cur.close()
    conn.close()
    
    return success

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_data = verify_token(token)
        
        if not user_data:
            return {
                'statusCode': 401,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': 'Не авторизован'}),
                'isBase64Encoded': False
            }
        
        family_id = user_data['family_id']
        member_name = user_data['member_name']
        member_avatar = user_data['avatar']
        
        if method == 'GET':
            events = get_events(family_id)
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'events': events}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create':
                result = create_event(family_id, member_name, member_avatar, body)
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'event': result}),
                    'isBase64Encoded': False
                }
            
            if action == 'update':
                event_id = body.get('id')
                if not event_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Event ID required'}),
                        'isBase64Encoded': False
                    }
                
                success = update_event(event_id, family_id, body)
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': success}),
                    'isBase64Encoded': False
                }
            
            if action == 'delete':
                event_id = body.get('id')
                if not event_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Event ID required'}),
                        'isBase64Encoded': False
                    }
                
                success = delete_event(event_id, family_id)
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': success}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] Calendar events error: {str(e)}')
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка сервера: {str(e)}'
            }),
            'isBase64Encoded': False
        }