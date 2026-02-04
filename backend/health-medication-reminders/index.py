"""
Система автоматических напоминаний о приёме лекарств из раздела Здоровье.
Генерирует расписание и отправляет push-уведомления в нужное время.
"""

import json
import os
import psycopg2
from datetime import datetime, timedelta, time as dt_time
from typing import List, Dict, Any
from pywebpush import webpush, WebPushException


def handler(event: dict, context) -> dict:
    """
    Проверяет расписание лекарств и отправляет напоминания пользователям
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    vapid_private_key = os.environ.get('VAPID_PRIVATE_KEY')
    
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            current_time = datetime.now()
            window_start = current_time - timedelta(minutes=5)
            window_end = current_time + timedelta(minutes=30)
            
            cursor.execute('''
                SELECT 
                    m.id,
                    m.user_id,
                    m.profile_id,
                    m.name,
                    m.dosage,
                    m.frequency,
                    m.time_of_day,
                    m.start_date,
                    m.end_date,
                    m.is_active,
                    hp.user_name,
                    hp.photo_url
                FROM health_medications m
                JOIN health_profiles hp ON m.profile_id = hp.id
                WHERE m.is_active = true
                AND m.time_of_day IS NOT NULL
                AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
            ''')
            
            medications = cursor.fetchall()
            notifications_sent = 0
            reminders = []
            
            for med in medications:
                med_id, user_id, profile_id, name, dosage, frequency, time_of_day, start_date, end_date, is_active, user_name, photo_url = med
                
                if not time_of_day:
                    continue
                
                times = parse_time_of_day(time_of_day)
                
                for remind_time in times:
                    remind_datetime = datetime.combine(current_time.date(), remind_time)
                    
                    if window_start <= remind_datetime <= window_end:
                        cursor.execute('''
                            SELECT id FROM medication_intakes
                            WHERE medication_id = %s
                            AND scheduled_date = CURRENT_DATE
                            AND scheduled_time = %s
                        ''', (med_id, remind_time))
                        
                        existing = cursor.fetchone()
                        
                        if not existing:
                            cursor.execute('''
                                INSERT INTO medication_intakes 
                                (id, medication_id, scheduled_time, scheduled_date, status, created_at)
                                VALUES (gen_random_uuid()::text, %s, %s, CURRENT_DATE, 'pending', NOW())
                                RETURNING id
                            ''', (med_id, remind_time))
                            
                            intake_id = cursor.fetchone()[0]
                            conn.commit()
                            
                            cursor.execute('''
                                SELECT endpoint, p256dh_key, auth_key
                                FROM push_subscriptions
                                WHERE user_id = %s AND is_active = true
                            ''', (user_id,))
                            
                            subscriptions = cursor.fetchall()
                            
                            for sub in subscriptions:
                                endpoint, p256dh, auth = sub
                                
                                if vapid_private_key:
                                    success = send_push_notification(
                                        {
                                            'endpoint': endpoint,
                                            'keys': {'p256dh': p256dh, 'auth': auth}
                                        },
                                        f'💊 Время принять лекарство',
                                        f'{name} ({dosage}) для {user_name}',
                                        vapid_private_key
                                    )
                                    
                                    if success:
                                        notifications_sent += 1
                            
                            reminders.append({
                                'intakeId': intake_id,
                                'medicationId': med_id,
                                'medicationName': name,
                                'dosage': dosage,
                                'profileName': user_name,
                                'scheduledTime': remind_time.isoformat()
                            })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Reminders processed',
                    'notificationsSent': notifications_sent,
                    'reminders': reminders
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'mark_taken':
                intake_id = body.get('intakeId')
                
                if not intake_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Intake ID required'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute('''
                    UPDATE medication_intakes
                    SET status = 'taken', actual_time = NOW()
                    WHERE id = %s
                ''', (intake_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Intake marked as taken'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'snooze':
                intake_id = body.get('intakeId')
                minutes = body.get('minutes', 15)
                
                if not intake_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Intake ID required'}),
                        'isBase64Encoded': False
                    }
                
                new_time = (datetime.now() + timedelta(minutes=minutes)).time()
                
                cursor.execute('''
                    UPDATE medication_intakes
                    SET scheduled_time = %s, status = 'snoozed'
                    WHERE id = %s
                ''', (new_time, intake_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'message': 'Reminder snoozed',
                        'newTime': new_time.isoformat()
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()


def parse_time_of_day(time_str: str) -> List[dt_time]:
    """
    Парсит строку времени приёма в список time объектов
    Примеры: '08:00', '08:00,14:00,20:00', 'утро', 'вечер'
    """
    times = []
    
    if not time_str:
        return times
    
    presets = {
        'утро': [dt_time(8, 0)],
        'день': [dt_time(14, 0)],
        'вечер': [dt_time(20, 0)],
        'утро+вечер': [dt_time(8, 0), dt_time(20, 0)],
        'утро+день+вечер': [dt_time(8, 0), dt_time(14, 0), dt_time(20, 0)]
    }
    
    if time_str.lower() in presets:
        return presets[time_str.lower()]
    
    parts = time_str.split(',')
    
    for part in parts:
        part = part.strip()
        try:
            if ':' in part:
                hour, minute = map(int, part.split(':'))
                times.append(dt_time(hour, minute))
        except ValueError:
            continue
    
    return times


def send_push_notification(subscription_data: dict, title: str, message: str, vapid_private_key: str) -> bool:
    """Отправка push-уведомления"""
    try:
        webpush(
            subscription_info=subscription_data,
            data=json.dumps({
                'title': title,
                'body': message,
                'icon': '/icon-192.png',
                'badge': '/badge-72.png',
                'tag': 'medication-reminder',
                'requireInteraction': True,
                'actions': [
                    {'action': 'taken', 'title': 'Принял'},
                    {'action': 'snooze', 'title': 'Напомнить через 15 мин'}
                ]
            }),
            vapid_private_key=vapid_private_key,
            vapid_claims={
                'sub': 'mailto:support@nasha-semiya.ru'
            }
        )
        return True
    except WebPushException as e:
        print(f"[ERROR] WebPush failed: {str(e)}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        return False
