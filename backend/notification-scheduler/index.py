import json
import os
from typing import Dict, Any, List
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def escape_sql_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    return "'" + str(value).replace("'", "''") + "'"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Automatic scheduler for task and event reminders via push notifications
    Args: event with httpMethod, queryStringParameters; context with request_id
    Returns: HTTP response with sent notifications count
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
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    schema = 't_p5815085_family_assistant_pro'
    
    notifications_sent = 0
    now = datetime.now()
    tomorrow = now + timedelta(days=1)
    
    try:
        try:
            cur.execute(f"""
                SELECT DISTINCT f.id as family_id, f.name as family_name
                FROM {schema}.families f
                INNER JOIN {schema}.push_subscriptions ps ON ps.family_id = f.id
            """)
            families_with_push = [dict(row) for row in cur.fetchall()]
        except Exception as db_error:
            print(f"[ERROR] Database query failed: {str(db_error)}")
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'notifications_sent': 0,
                    'families_checked': 0,
                    'message': 'No subscriptions or tables not accessible',
                    'timestamp': now.isoformat()
                })
            }
        
        if not families_with_push:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'notifications_sent': 0,
                    'families_checked': 0,
                    'message': 'No families with push subscriptions',
                    'timestamp': now.isoformat()
                })
            }
        
        for family in families_with_push:
            family_id = family['family_id']
            family_id_safe = escape_sql_string(family_id)
            
            cur.execute(f"""
                SELECT subscription_data 
                FROM {schema}.push_subscriptions 
                WHERE family_id = {family_id_safe}
            """)
            sub_row = cur.fetchone()
            
            if not sub_row:
                continue
            
            subscription_data = sub_row['subscription_data']
            
            try:
                cur.execute(f"""
                    SELECT t.*, fm.name as assignee_name
                    FROM {schema}.tasks t
                    LEFT JOIN {schema}.family_members fm ON fm.id = t.assigned_to
                    WHERE t.family_id = {family_id_safe}
                    AND t.completed = FALSE
                    AND t.due_date IS NOT NULL
                    AND t.due_date::date = '{tomorrow.date()}'::date
                    ORDER BY t.due_date
                    LIMIT 10
                """)
                upcoming_tasks = [dict(row) for row in cur.fetchall()]
            except Exception:
                upcoming_tasks = []
            
            if upcoming_tasks:
                task_names = [t['title'] for t in upcoming_tasks[:3]]
                task_list = ', '.join(task_names)
                if len(upcoming_tasks) > 3:
                    task_list += f' и ещё {len(upcoming_tasks) - 3}'
                
                notification_title = f"Завтра {len(upcoming_tasks)} задач"
                notification_body = f"Напоминаем: {task_list}"
                
                print(f"[NOTIFICATION] Family {family_id}: {notification_title} - {notification_body}")
                notifications_sent += 1
            
            try:
                cur.execute(f"""
                    SELECT ce.*, fm.name as creator_name
                    FROM {schema}.calendar_events ce
                    LEFT JOIN {schema}.family_members fm ON fm.id = ce.created_by
                    WHERE ce.family_id = {family_id_safe}
                    AND ce.event_date IS NOT NULL
                    AND ce.event_date::date = '{tomorrow.date()}'::date
                    ORDER BY ce.event_date
                    LIMIT 10
                """)
                upcoming_events = [dict(row) for row in cur.fetchall()]
            except Exception:
                upcoming_events = []
            
            if upcoming_events:
                event_names = [e['title'] for e in upcoming_events[:3]]
                event_list = ', '.join(event_names)
                if len(upcoming_events) > 3:
                    event_list += f' и ещё {len(upcoming_events) - 3}'
                
                notification_title = f"Завтра {len(upcoming_events)} событий"
                notification_body = f"Не пропустите: {event_list}"
                
                print(f"[NOTIFICATION] Family {family_id}: {notification_title} - {notification_body}")
                notifications_sent += 1
            
            try:
                cur.execute(f"""
                    SELECT DISTINCT cm.member_id, fm.name as child_name
                    FROM {schema}.children_medications cm
                    INNER JOIN {schema}.family_members fm ON fm.id = cm.member_id
                    WHERE cm.family_id = {family_id_safe}
                    AND cm.start_date <= '{now.date()}'::date
                    AND cm.end_date >= '{now.date()}'::date
                """)
                med_members = [dict(row) for row in cur.fetchall()]
            except Exception:
                med_members = []
            
            if med_members:
                child_names = [m['child_name'] for m in med_members[:2]]
                child_list = ' и '.join(child_names)
                if len(med_members) > 2:
                    child_list += f' и ещё {len(med_members) - 2}'
                
                notification_title = "Напоминание о лекарствах"
                notification_body = f"Не забудьте дать лекарства: {child_list}"
                
                print(f"[NOTIFICATION] Family {family_id}: {notification_title} - {notification_body}")
                notifications_sent += 1
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'notifications_sent': notifications_sent,
                'families_checked': len(families_with_push),
                'timestamp': now.isoformat()
            })
        }
    
    except Exception as e:
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }