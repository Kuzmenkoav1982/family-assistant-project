import json
import os
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Проверка лимитов подписки: AI-запросы (5/день на Free), фото (10 на Free), члены семьи (2 на Free)'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Family-Id'
            },
            'body': ''
        }
    
    try:
        family_id = event.get('headers', {}).get('X-Family-Id') or event.get('headers', {}).get('x-family-id')
        limit_type = event.get('queryStringParameters', {}).get('type', 'ai_requests')
        
        if not family_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Family ID обязателен'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT s.plan_type, s.status, s.end_date, 
                   su.ai_requests_used, su.ai_requests_reset_date,
                   su.photos_used, su.family_members_count
            FROM t_p5815085_family_assistant_pro.subscriptions s
            LEFT JOIN t_p5815085_family_assistant_pro.subscription_usage su ON s.family_id = su.family_id
            WHERE s.family_id = %s AND s.status = 'active'
            ORDER BY s.end_date DESC LIMIT 1
        """, (family_id,))
        
        subscription = cur.fetchone()
        
        if not subscription:
            cur.execute("""
                INSERT INTO t_p5815085_family_assistant_pro.subscription_usage 
                (family_id, ai_requests_used, photos_used, family_members_count)
                VALUES (%s, 0, 0, 0)
                ON CONFLICT (family_id) DO NOTHING
            """, (family_id,))
            conn.commit()
            
            subscription = {
                'plan_type': 'free_2026',
                'status': 'active',
                'ai_requests_used': 0,
                'ai_requests_reset_date': str(date.today()),
                'photos_used': 0,
                'family_members_count': 0
            }
        
        plan_type = subscription['plan_type']
        is_premium = plan_type.startswith('premium_')
        
        if subscription.get('ai_requests_reset_date') and str(subscription['ai_requests_reset_date']) < str(date.today()):
            cur.execute("""
                UPDATE t_p5815085_family_assistant_pro.subscription_usage
                SET ai_requests_used = 0, ai_requests_reset_date = CURRENT_DATE
                WHERE family_id = %s
            """, (family_id,))
            conn.commit()
            subscription['ai_requests_used'] = 0
        
        limits = {
            'ai_requests': {
                'used': subscription.get('ai_requests_used', 0),
                'limit': None if is_premium else 5,
                'allowed': is_premium or (subscription.get('ai_requests_used', 0) < 5),
                'reset_date': str(subscription.get('ai_requests_reset_date', date.today()))
            },
            'photos': {
                'used': subscription.get('photos_used', 0),
                'limit': None if is_premium else 10,
                'allowed': is_premium or (subscription.get('photos_used', 0) < 10)
            },
            'family_members': {
                'used': subscription.get('family_members_count', 0),
                'limit': None if is_premium else 2,
                'allowed': is_premium or (subscription.get('family_members_count', 0) < 2)
            }
        }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            increment_type = body.get('type', limit_type)
            
            if increment_type == 'ai_requests' and limits['ai_requests']['allowed']:
                cur.execute("""
                    UPDATE t_p5815085_family_assistant_pro.subscription_usage
                    SET ai_requests_used = ai_requests_used + 1
                    WHERE family_id = %s
                    RETURNING ai_requests_used
                """, (family_id,))
                result = cur.fetchone()
                conn.commit()
                limits['ai_requests']['used'] = result['ai_requests_used']
                limits['ai_requests']['allowed'] = is_premium or (result['ai_requests_used'] < 5)
            
            elif increment_type == 'photos' and limits['photos']['allowed']:
                cur.execute("""
                    UPDATE t_p5815085_family_assistant_pro.subscription_usage
                    SET photos_used = photos_used + 1
                    WHERE family_id = %s
                    RETURNING photos_used
                """, (family_id,))
                result = cur.fetchone()
                conn.commit()
                limits['photos']['used'] = result['photos_used']
                limits['photos']['allowed'] = is_premium or (result['photos_used'] < 10)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'plan_type': plan_type,
                'is_premium': is_premium,
                'limits': limits
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
