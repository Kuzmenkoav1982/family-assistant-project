'''
Business: API для управления блогом/заметками семьи
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с постами блога
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # CORS OPTIONS handling
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Database connection
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            # Get all blog posts
            cursor.execute('''
                SELECT id, family_id, title, author_id, author_name, 
                       category, excerpt, content, likes, comments_count,
                       created_at, updated_at
                FROM blog_posts
                ORDER BY created_at DESC
            ''')
            posts = cursor.fetchall()
            
            # Convert to JSON-serializable format
            result = []
            for post in posts:
                post_dict = dict(post)
                if post_dict.get('created_at'):
                    post_dict['created_at'] = post_dict['created_at'].isoformat()
                if post_dict.get('updated_at'):
                    post_dict['updated_at'] = post_dict['updated_at'].isoformat()
                # Convert date to string for compatibility
                post_dict['date'] = post_dict.get('created_at', '')
                # Rename author_name to author for compatibility
                post_dict['author'] = post_dict.get('author_name', '')
                # Rename comments_count to comments
                post_dict['comments'] = post_dict.get('comments_count', 0)
                result.append(post_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'posts': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Create new blog post
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO blog_posts 
                (family_id, title, author_id, author_name, category, 
                 excerpt, content, likes, comments_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, family_id, title, author_id, author_name,
                          category, excerpt, content, likes, comments_count, created_at
            ''', (
                body.get('family_id') or None,
                body.get('title') or 'Untitled',
                body.get('author_id') or None,
                body.get('author') or 'Anonymous',
                body.get('category') or 'general',
                body.get('excerpt') or '',
                body.get('content') or '',
                body.get('likes', 0),
                body.get('comments', 0)
            ))
            
            new_post = cursor.fetchone()
            conn.commit()
            
            # Convert to JSON-serializable
            result = dict(new_post)
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
                result['date'] = result['created_at']
            result['author'] = result.get('author_name', '')
            result['comments'] = result.get('comments_count', 0)
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'post': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update blog post
            body = json.loads(event.get('body', '{}'))
            post_id = body.get('id')
            
            if not post_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Post ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE blog_posts
                SET title = %s, category = %s, excerpt = %s, content = %s,
                    likes = %s, comments_count = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, family_id, title, author_id, author_name,
                          category, excerpt, content, likes, comments_count, updated_at
            ''', (
                body.get('title'),
                body.get('category'),
                body.get('excerpt'),
                body.get('content'),
                body.get('likes'),
                body.get('comments'),
                post_id
            ))
            
            updated_post = cursor.fetchone()
            conn.commit()
            
            if not updated_post:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Post not found'}),
                    'isBase64Encoded': False
                }
            
            # Convert to JSON-serializable
            result = dict(updated_post)
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            result['author'] = result.get('author_name', '')
            result['comments'] = result.get('comments_count', 0)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'post': result}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Delete blog post
            params = event.get('queryStringParameters', {})
            post_id = params.get('id')
            
            if not post_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Post ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id FROM blog_posts WHERE id = %s', (post_id,))
            existing = cursor.fetchone()
            
            if not existing:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Post not found'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('UPDATE blog_posts SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (post_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': post_id}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()