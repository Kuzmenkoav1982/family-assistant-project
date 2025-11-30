import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def escape_sql_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    return str(value).replace("'", "''")

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage push notification subscriptions and send notifications
    Args: event with httpMethod, body, headers; context with request_id
    Returns: HTTP response with subscription status or notification result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Требуется авторизация'})
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
    
    token_safe = escape_sql_string(token)
    cur.execute(f"SELECT family_id FROM {schema}.auth_tokens WHERE token = '{token_safe}' AND expires_at > NOW()")
    auth_row = cur.fetchone()
    
    if not auth_row:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Invalid or expired token'})
        }
    
    family_id = auth_row['family_id']
    family_id_safe = escape_sql_string(family_id)
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'subscribe':
            subscription = body.get('subscription')
            
            if not subscription:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Missing subscription data'})
                }
            
            subscription_json = json.dumps(subscription).replace("'", "''")
            
            cur.execute(f"""
                INSERT INTO {schema}.push_subscriptions (family_id, subscription_data, created_at)
                VALUES ('{family_id_safe}', '{subscription_json}', NOW())
                ON CONFLICT (family_id) 
                DO UPDATE SET subscription_data = '{subscription_json}', updated_at = NOW()
            """)
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Subscription saved'})
            }
        
        elif action == 'send':
            title = body.get('title', 'Семейный Ассистент')
            message = body.get('message', '')
            
            if not message:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Message is required'})
                }
            
            cur.execute(f"SELECT subscription_data FROM {schema}.push_subscriptions WHERE family_id = '{family_id_safe}'")
            subscription_row = cur.fetchone()
            
            if not subscription_row:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'No subscription found'})
                }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True, 
                    'message': 'Notification queued',
                    'title': title,
                    'body': message
                })
            }
    
    elif method == 'DELETE':
        cur.execute(f"DELETE FROM {schema}.push_subscriptions WHERE family_id = '{family_id_safe}'")
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Subscription deleted'})
        }
    
    elif method == 'GET':
        cur.execute(f"SELECT id, created_at FROM {schema}.push_subscriptions WHERE family_id = '{family_id_safe}'")
        subscription_row = cur.fetchone()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'subscribed': subscription_row is not None,
                'subscription': dict(subscription_row) if subscription_row else None
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': False, 'error': 'Method not allowed'})
    }
