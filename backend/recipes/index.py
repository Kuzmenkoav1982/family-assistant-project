import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List, Optional
import base64
import requests

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = {escape_string(token)} AND expires_at > CURRENT_TIMESTAMP
    """
    cur.execute(query)
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    cur.execute(query)
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member and member['family_id'] else None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage family recipes with OCR support for image recognition
    Args: event with httpMethod, body, queryStringParameters, headers with X-Auth-Token
          context with request_id
    Returns: HTTP response with recipes data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token', '')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Authentication required'}),
            'isBase64Encoded': False
        }
    
    user_id = verify_token(token)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid or expired token'}),
            'isBase64Encoded': False
        }
    
    family_id = get_user_family_id(user_id)
    if not family_id:
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User not in a family'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            recipe_id = params.get('id')
            
            if recipe_id:
                cursor.execute(
                    "SELECT * FROM recipes WHERE id = %s AND family_id = %s",
                    (recipe_id, family_id)
                )
                recipe = cursor.fetchone()
                
                if not recipe:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Recipe not found'}),
                        'isBase64Encoded': False
                    }
                
                recipe_dict = dict(recipe)
                print(f"DEBUG: Recipe {recipe_id} images field: {recipe_dict.get('images')}")
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'recipe': recipe_dict
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            category = params.get('category')
            cuisine = params.get('cuisine')
            search = params.get('search')
            favorites_only = params.get('favorites') == 'true'
            
            query = "SELECT * FROM recipes WHERE family_id = %s"
            query_params: List[Any] = [family_id]
            
            if category and category != 'all':
                query += " AND category = %s"
                query_params.append(category)
            
            if cuisine and cuisine != 'all':
                query += " AND cuisine = %s"
                query_params.append(cuisine)
            
            if favorites_only:
                query += " AND is_favorite = TRUE"
            
            if search:
                query += " AND (name ILIKE %s OR ingredients ILIKE %s OR description ILIKE %s)"
                search_pattern = f"%{search}%"
                query_params.extend([search_pattern, search_pattern, search_pattern])
            
            query += " ORDER BY created_at DESC"
            
            cursor.execute(query, tuple(query_params))
            recipes = cursor.fetchall()
            recipes_list = [dict(r) for r in recipes]
            
            if recipes_list:
                print(f"DEBUG: First recipe images: {recipes_list[0].get('images')}")
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'recipes': recipes_list
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'create')
            
            if action == 'ocr':
                image_url = body_data.get('image_url')
                
                if not image_url:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Image URL required'}),
                        'isBase64Encoded': False
                    }
                
                ocr_key = os.environ.get('YANDEX_VISION_API_KEY')
                folder_id = os.environ.get('YANDEX_FOLDER_ID')
                
                if not ocr_key or not folder_id:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'success': True,
                            'text': 'OCR временно недоступно. Введите рецепт вручную.',
                            'parsed': {
                                'name': '',
                                'ingredients': '',
                                'instructions': ''
                            }
                        }),
                        'isBase64Encoded': False
                    }
                
                response = requests.get(image_url)
                image_base64 = base64.b64encode(response.content).decode('utf-8')
                
                vision_response = requests.post(
                    'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze',
                    headers={
                        'Authorization': f'Api-Key {ocr_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'folderId': folder_id,
                        'analyze_specs': [{
                            'content': image_base64,
                            'features': [{
                                'type': 'TEXT_DETECTION',
                                'text_detection_config': {
                                    'language_codes': ['ru', 'en']
                                }
                            }]
                        }]
                    }
                )
                
                if vision_response.status_code != 200:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'success': True,
                            'text': 'Не удалось распознать текст. Введите рецепт вручную.',
                            'parsed': {
                                'name': '',
                                'ingredients': '',
                                'instructions': ''
                            }
                        }),
                        'isBase64Encoded': False
                    }
                
                vision_data = vision_response.json()
                text_blocks = []
                
                for result in vision_data.get('results', []):
                    for page in result.get('results', []):
                        if page.get('textDetection'):
                            for block in page['textDetection'].get('pages', []):
                                for text_block in block.get('blocks', []):
                                    for line in text_block.get('lines', []):
                                        line_text = ' '.join([word.get('text', '') for word in line.get('words', [])])
                                        text_blocks.append(line_text)
                
                full_text = '\n'.join(text_blocks)
                
                parsed_data = {
                    'name': '',
                    'ingredients': '',
                    'instructions': full_text
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'text': full_text,
                        'parsed': parsed_data
                    }),
                    'isBase64Encoded': False
                }
            
            name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            category = body_data.get('category', 'other')
            cuisine = body_data.get('cuisine', 'russian')
            cooking_time = body_data.get('cooking_time')
            difficulty = body_data.get('difficulty', 'medium')
            servings = body_data.get('servings', 4)
            ingredients = body_data.get('ingredients', '').strip()
            instructions = body_data.get('instructions', '').strip()
            dietary_tags = body_data.get('dietary_tags', [])
            image_url = body_data.get('image_url')
            images = body_data.get('images', [])
            created_by = user_id
            
            if not name or not ingredients or not instructions:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Name, ingredients and instructions are required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """INSERT INTO recipes 
                   (family_id, name, description, category, cuisine, cooking_time, difficulty, 
                    servings, ingredients, instructions, dietary_tags, image_url, images, created_by)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING id""",
                (family_id, name, description, category, cuisine, cooking_time, difficulty,
                 servings, ingredients, instructions, dietary_tags, image_url, images, created_by)
            )
            
            recipe_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'recipe_id': recipe_id,
                    'message': 'Recipe created successfully'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            recipe_id = body_data.get('id')
            
            if not recipe_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Recipe ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "SELECT id FROM recipes WHERE id = %s AND family_id = %s",
                (recipe_id, family_id)
            )
            
            if not cursor.fetchone():
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Recipe not found'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            params = []
            
            if 'name' in body_data:
                updates.append('name = %s')
                params.append(body_data['name'])
            if 'description' in body_data:
                updates.append('description = %s')
                params.append(body_data['description'])
            if 'category' in body_data:
                updates.append('category = %s')
                params.append(body_data['category'])
            if 'cuisine' in body_data:
                updates.append('cuisine = %s')
                params.append(body_data['cuisine'])
            if 'cooking_time' in body_data:
                updates.append('cooking_time = %s')
                params.append(body_data['cooking_time'])
            if 'difficulty' in body_data:
                updates.append('difficulty = %s')
                params.append(body_data['difficulty'])
            if 'servings' in body_data:
                updates.append('servings = %s')
                params.append(body_data['servings'])
            if 'ingredients' in body_data:
                updates.append('ingredients = %s')
                params.append(body_data['ingredients'])
            if 'instructions' in body_data:
                updates.append('instructions = %s')
                params.append(body_data['instructions'])
            if 'dietary_tags' in body_data:
                updates.append('dietary_tags = %s')
                params.append(body_data['dietary_tags'])
            if 'image_url' in body_data:
                updates.append('image_url = %s')
                params.append(body_data['image_url'])
            if 'images' in body_data:
                print(f"DEBUG UPDATE: Saving images: {body_data['images']}")
                updates.append('images = %s')
                params.append(body_data['images'])
            if 'is_favorite' in body_data:
                updates.append('is_favorite = %s')
                params.append(body_data['is_favorite'])
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            
            params.extend([recipe_id, family_id])
            
            cursor.execute(
                f"UPDATE recipes SET {', '.join(updates)} WHERE id = %s AND family_id = %s",
                tuple(params)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Recipe updated successfully'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            recipe_id = body_data.get('id')
            
            if not recipe_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Recipe ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "DELETE FROM recipes WHERE id = %s AND family_id = %s",
                (recipe_id, family_id)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Recipe deleted successfully'
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()