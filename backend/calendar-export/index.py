"""
Business: Экспорт событий календаря в форматы iCal/Google Calendar
Args: event с httpMethod, queryStringParameters (format: ical), headers с X-Auth-Token
Returns: файл .ics для импорта в Google Calendar, Apple Calendar, Outlook
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = %s AND expires_at > CURRENT_TIMESTAMP
        """,
        (token,)
    )
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_calendar_events(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT fm.family_id
        FROM {SCHEMA}.family_members fm
        WHERE fm.user_id = %s LIMIT 1
        """,
        (user_id,)
    )
    family_info = cur.fetchone()
    
    if not family_info:
        cur.close()
        conn.close()
        return []
    
    family_id = family_info['family_id']
    
    cur.execute(
        f"""
        SELECT id, title, description, date, time, location, category, all_day, recurring, color
        FROM {SCHEMA}.calendar_events
        WHERE family_id = %s
        ORDER BY date, time
        """,
        (family_id,)
    )
    events = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return [dict(e) for e in events]

def escape_ical_text(text: str) -> str:
    """Экранирует специальные символы для iCal формата"""
    if not text:
        return ''
    return text.replace('\\', '\\\\').replace(',', '\\,').replace(';', '\\;').replace('\n', '\\n')

def format_ical_datetime(date_obj, time_obj=None, all_day=False) -> str:
    """Форматирует дату/время в формат iCal"""
    if all_day:
        return date_obj.strftime('%Y%m%d')
    
    if time_obj:
        dt = datetime.combine(date_obj, time_obj)
    else:
        dt = datetime.combine(date_obj, datetime.min.time())
    
    return dt.strftime('%Y%m%dT%H%M%S')

def generate_ical(events: List[Dict[str, Any]], family_name: str = 'Семья') -> str:
    """Генерирует iCal файл из событий"""
    
    lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Семейный Органайзер//poehali.dev//RU',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        f'X-WR-CALNAME:{escape_ical_text(family_name)}',
        'X-WR-TIMEZONE:Europe/Moscow',
        'X-WR-CALDESC:События из Семейного Органайзера'
    ]
    
    for event in events:
        event_id = str(event['id'])
        title = escape_ical_text(event.get('title', 'Без названия'))
        description = escape_ical_text(event.get('description', ''))
        location = escape_ical_text(event.get('location', ''))
        category = event.get('category', 'general')
        all_day = event.get('all_day', False)
        
        date = event.get('date')
        time = event.get('time')
        
        if not date:
            continue
        
        # Форматируем даты
        dtstart = format_ical_datetime(date, time, all_day)
        
        # Для событий на весь день добавляем +1 день к DTEND
        if all_day:
            dtend_date = date + timedelta(days=1)
            dtend = format_ical_datetime(dtend_date, None, True)
        else:
            # По умолчанию событие длится 1 час
            if time:
                end_dt = datetime.combine(date, time) + timedelta(hours=1)
            else:
                end_dt = datetime.combine(date, datetime.min.time()) + timedelta(hours=1)
            dtend = end_dt.strftime('%Y%m%dT%H%M%S')
        
        # Timestamp создания
        dtstamp = datetime.now().strftime('%Y%m%dT%H%M%SZ')
        
        lines.extend([
            'BEGIN:VEVENT',
            f'UID:{event_id}@family-organizer.poehali.dev',
            f'DTSTAMP:{dtstamp}',
            f'DTSTART{"" if not all_day else ";VALUE=DATE"}:{dtstart}',
            f'DTEND{"" if not all_day else ";VALUE=DATE"}:{dtend}',
            f'SUMMARY:{title}',
        ])
        
        if description:
            lines.append(f'DESCRIPTION:{description}')
        
        if location:
            lines.append(f'LOCATION:{location}')
        
        # Категории для фильтрации
        category_map = {
            'birthday': 'День рождения',
            'health': 'Здоровье',
            'education': 'Образование',
            'sport': 'Спорт',
            'meeting': 'Встреча',
            'general': 'Общее'
        }
        category_name = category_map.get(category, 'Общее')
        lines.append(f'CATEGORIES:{category_name}')
        
        # Цвет события (поддерживается Apple Calendar)
        color = event.get('color', '#3b82f6')
        lines.append(f'X-APPLE-CALENDAR-COLOR:{color}')
        
        # Повторяющееся событие
        if event.get('recurring'):
            lines.append('RRULE:FREQ=YEARLY')
        
        lines.append('END:VEVENT')
    
    lines.append('END:VCALENDAR')
    
    return '\r\n'.join(lines)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': 'Не авторизован'}),
                'isBase64Encoded': False
            }
        
        # Получаем события
        events = get_calendar_events(user_id)
        
        if not events:
            return {
                'statusCode': 404,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': 'Нет событий для экспорта'}),
                'isBase64Encoded': False
            }
        
        # Генерируем iCal
        ical_content = generate_ical(events, 'Семейный Органайзер')
        
        filename = f'family_calendar_{datetime.now().strftime("%Y%m%d")}.ics'
        
        return {
            'statusCode': 200,
            'headers': {
                **cors_headers,
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': f'attachment; filename="{filename}"'
            },
            'body': ical_content,
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f'[ERROR] Calendar export error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Ошибка экспорта: {str(e)}'
            }),
            'isBase64Encoded': False
        }
