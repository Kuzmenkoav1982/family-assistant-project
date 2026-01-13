import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

def handler(event: dict, context) -> dict:
    '''API для отправки push-уведомлений о выходе из геозон'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
        }
    
    if method == 'POST':
        return check_and_send_notifications()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def check_and_send_notifications() -> dict:
    '''Проверка новых событий выхода из зон и отправка уведомлений'''
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Получаем события выхода за последние 5 минут
            cur.execute('''
                SELECT ge.id, ge.member_id, ge.geofence_id, g.name as zone_name, ge.timestamp
                FROM geofence_events ge
                JOIN geofences g ON ge.geofence_id = g.id
                WHERE ge.event_type = 'exit'
                  AND ge.timestamp > NOW() - INTERVAL '5 minutes'
                  AND (ge.notified = FALSE OR ge.notified IS NULL)
                ORDER BY ge.timestamp DESC
            ''')
            
            exit_events = cur.fetchall()
            
            if not exit_events:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'No new exit events', 'sent': 0})
                }
            
            sent_count = 0
            vapid_private_key = os.environ.get('VAPID_PRIVATE_KEY')
            vapid_public_key = os.environ.get('VAPID_PUBLIC_KEY')
            
            for event in exit_events:
                member_id = event['member_id']
                zone_name = event['zone_name']
                member_name = f'Член семьи #{member_id}'
                
                # Получаем подписки для родителей (кроме самого пользователя)
                cur.execute('''
                    SELECT ps.endpoint, ps.p256dh, ps.auth
                    FROM push_subscriptions ps
                    JOIN users u ON ps.user_id = u.id
                    WHERE u.id::text != %s
                      AND ps.active = TRUE
                ''', (member_id,))
                
                subscriptions = cur.fetchall()
                
                for sub in subscriptions:
                    try:
                        subscription_info = {
                            'endpoint': sub['endpoint'],
                            'keys': {
                                'p256dh': sub['p256dh'],
                                'auth': sub['auth']
                            }
                        }
                        
                        payload = json.dumps({
                            'title': f'⚠️ {member_name} вышел из зоны',
                            'body': f'Покинул безопасную зону "{zone_name}"',
                            'url': '/family-tracker'
                        })
                        
                        webpush(
                            subscription_info=subscription_info,
                            data=payload,
                            vapid_private_key=vapid_private_key,
                            vapid_claims={'sub': 'mailto:support@family-assistant.ru'}
                        )
                        
                        sent_count += 1
                        
                    except WebPushException as e:
                        print(f'Push notification failed: {e}')
                        if e.response and e.response.status_code == 410:
                            # Подписка истекла - удаляем
                            cur.execute('UPDATE push_subscriptions SET active = FALSE WHERE endpoint = %s', 
                                      (sub['endpoint'],))
                
                # Помечаем событие как обработанное
                cur.execute('UPDATE geofence_events SET notified = TRUE WHERE id = %s', (event['id'],))
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'events_processed': len(exit_events),
                    'notifications_sent': sent_count
                })
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        conn.close()