import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для получения списка членов семьи для трекера'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Получение токена авторизации
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
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
            # Получаем user_id по токену
            cur.execute('''
                SELECT user_id FROM auth_tokens 
                WHERE token = %s AND expires_at > NOW()
            ''', (auth_token,))
            
            auth_result = cur.fetchone()
            if not auth_result:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Недействительный токен'})
                }
            
            user_id = auth_result['user_id']
            
            # Получаем family_id
            cur.execute('''
                SELECT family_id FROM family_members 
                WHERE user_id = %s LIMIT 1
            ''', (user_id,))
            
            family_result = cur.fetchone()
            if not family_result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Семья не найдена'})
                }
            
            family_id = family_result['family_id']
            
            # Получаем всех членов семьи с подтвержденными аккаунтами
            cur.execute('''
                SELECT 
                    u.id,
                    u.full_name as name,
                    u.avatar as avatar_url,
                    fm.role
                FROM family_members fm
                JOIN users u ON fm.user_id = u.id
                WHERE fm.family_id = %s
                  AND fm.status = 'active'
                ORDER BY u.full_name
            ''', (family_id,))
            
            members = cur.fetchall()
            
            # Генерируем стабильные цвета для каждого пользователя
            colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16']
            
            result = []
            for idx, member in enumerate(members):
                result.append({
                    'id': str(member['id']),
                    'name': member['name'],
                    'avatar_url': member['avatar_url'],
                    'role': member['role'],
                    'color': colors[idx % len(colors)]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'members': result
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
