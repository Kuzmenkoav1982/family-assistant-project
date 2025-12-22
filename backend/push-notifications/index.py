import json
import os
import traceback
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from pywebpush import webpush, WebPushException

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
    try:
        print(f"[DEBUG Push] Received event: method={event.get('httpMethod')}, has_body={bool(event.get('body'))}")
        
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
                'body': '',
                'isBase64Encoded': False
            }
        
        token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
        
        print(f"[DEBUG Push] Auth token present: {bool(token)}")
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Требуется авторизация'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        schema = 't_p5815085_family_assistant_pro'
        
        token_safe = escape_sql_string(token)
        cur.execute(f"SELECT user_id FROM {schema}.sessions WHERE token = '{token_safe}' AND expires_at > NOW()")
        session_row = cur.fetchone()
        
        if not session_row:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Invalid or expired token'}),
                'isBase64Encoded': False
            }
        
        user_id = session_row['user_id']
        
        print(f"[DEBUG Push] Authenticated user_id={user_id}")
        
        cur.execute(f"SELECT family_id FROM {schema}.family_members WHERE user_id = '{escape_sql_string(user_id)}' LIMIT 1")
        member_row = cur.fetchone()
        
        if not member_row:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'User not in any family'}),
                'isBase64Encoded': False
            }
        
        family_id = member_row['family_id']
        family_id_safe = escape_sql_string(family_id)
        
        print(f"[DEBUG Push] Found family_id={family_id}")
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            print(f"[DEBUG Push] POST action={action}")
            
            if action == 'subscribe':
                subscription = body.get('subscription')
                
                print(f"[DEBUG Push] Subscribe: has_subscription={bool(subscription)}")
                
                if not subscription:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Missing subscription data'}),
                        'isBase64Encoded': False
                    }
                
                subscription_json = json.dumps(subscription).replace("'", "''")
                
                print(f"[DEBUG Push] Saving subscription to DB...")
                
                cur.execute(f"""
                    INSERT INTO {schema}.push_subscriptions (family_id, subscription_data, created_at)
                    VALUES ('{family_id_safe}', '{subscription_json}', NOW())
                    ON CONFLICT (family_id) 
                    DO UPDATE SET subscription_data = '{subscription_json}', updated_at = NOW()
                """)
                conn.commit()
                
                print(f"[DEBUG Push] Subscription saved successfully!")
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Subscription saved'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'update_settings':
                settings = body.get('settings', {})
                settings_json = json.dumps(settings).replace("'", "''")
                
                cur.execute(f"""
                    UPDATE {schema}.push_subscriptions 
                    SET notification_settings = '{settings_json}'
                    WHERE family_id = '{family_id_safe}'
                """)
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Settings updated'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'send':
                title = body.get('title', 'Семейный Ассистент')
                message = body.get('message', '')
                
                print(f"[DEBUG Push] Sending notification: title={title}, message={message}")
                
                if not message:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Message is required'}),
                        'isBase64Encoded': False
                    }
                
                print(f"[DEBUG Push] Fetching subscription for family_id={family_id}")
                cur.execute(f"SELECT subscription_data FROM {schema}.push_subscriptions WHERE family_id = '{family_id_safe}'")
                subscription_row = cur.fetchone()
                
                if not subscription_row:
                    print(f"[DEBUG Push] No subscription found for family_id={family_id}")
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'No subscription found'}),
                        'isBase64Encoded': False
                    }
                
                subscription_info = subscription_row['subscription_data']
                print(f"[DEBUG Push] Found subscription: {type(subscription_info)}")
                
                vapid_private_key = os.environ.get('VAPID_PRIVATE_KEY')
                print(f"[DEBUG Push] VAPID key present: {bool(vapid_private_key)}")
                
                if not vapid_private_key:
                    print(f"[DEBUG Push] VAPID key is empty!")
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'VAPID key not configured'}),
                        'isBase64Encoded': False
                    }
                
                cur.close()
                conn.close()
                
                try:
                    print(f"[DEBUG Push] Calling webpush...")
                    webpush(
                        subscription_info=subscription_info,
                        data=json.dumps({
                            'title': title,
                            'body': message,
                            'icon': '/icon-192.png',
                            'url': '/'
                        }),
                        vapid_private_key=vapid_private_key,
                        vapid_claims={
                            'sub': 'mailto:support@family-assistant.app'
                        }
                    )
                    
                    print(f"[DEBUG Push] Notification sent successfully!")
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True, 
                            'message': 'Notification sent successfully',
                            'title': title,
                            'body': message
                        }),
                        'isBase64Encoded': False
                    }
                except WebPushException as e:
                    print(f"[ERROR Push] WebPushException: {str(e)}")
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': False,
                            'error': f'Failed to send notification: {str(e)}'
                        }),
                        'isBase64Encoded': False
                    }
                except Exception as e:
                    print(f"[ERROR Push] Unexpected error in webpush: {str(e)}")
                    import traceback
                    print(f"[ERROR Push] Traceback: {traceback.format_exc()}")
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': False,
                            'error': f'Internal error: {str(e)}'
                        }),
                        'isBase64Encoded': False
                    }
        
        elif method == 'DELETE':
            cur.execute(f"DELETE FROM {schema}.push_subscriptions WHERE family_id = '{family_id_safe}'")
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Subscription deleted'}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            action_param = query_params.get('action', '')
            
            if action_param == 'get_settings':
                cur.execute(f"SELECT notification_settings FROM {schema}.push_subscriptions WHERE family_id = '{family_id_safe}'")
                subscription_row = cur.fetchone()
                cur.close()
                conn.close()
                
                settings = subscription_row['notification_settings'] if subscription_row and subscription_row.get('notification_settings') else None
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'settings': settings
                    }),
                    'isBase64Encoded': False
                }
            else:
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
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"[ERROR Push] Unexpected error: {str(e)}")
        print(f"[ERROR Push] Traceback:\n{error_trace}")
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': False,
                'error': f'Internal server error: {str(e)}',
                'trace': error_trace
            })
        }