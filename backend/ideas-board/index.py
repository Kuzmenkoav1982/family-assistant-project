"""
Доска идей пользователей для развития платформы
Создание, просмотр, голосование и комментирование предложений
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')

CATEGORIES = {
    'feature': {'name': 'Новая функция', 'icon': '✨', 'color': 'purple'},
    'improvement': {'name': 'Улучшение', 'icon': '🚀', 'color': 'blue'},
    'bug': {'name': 'Баг', 'icon': '🐛', 'color': 'red'}
}

STATUSES = {
    'new': {'name': 'Новое', 'icon': '🆕', 'color': 'gray'},
    'reviewing': {'name': 'На рассмотрении', 'icon': '👀', 'color': 'yellow'},
    'planned': {'name': 'Запланировано', 'icon': '📋', 'color': 'blue'},
    'in_progress': {'name': 'В разработке', 'icon': '⚙️', 'color': 'orange'},
    'completed': {'name': 'Готово', 'icon': '✅', 'color': 'green'},
    'rejected': {'name': 'Отклонено', 'icon': '❌', 'color': 'red'}
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Проверка токена и возврат информации о пользователе"""
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_token = token.replace("'", "''")
    cur.execute(
        f"""
        SELECT s.user_id, u.email, u.full_name 
        FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON s.user_id = u.id
        WHERE s.token = '{safe_token}' AND s.expires_at > CURRENT_TIMESTAMP
        """
    )
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if result:
        return {
            'user_id': str(result['user_id']),
            'email': result['email'],
            'full_name': result['full_name']
        }
    return None

def create_idea(user_id: str, title: str, description: str, category: str) -> Dict[str, Any]:
    """Создание новой идеи"""
    if category not in CATEGORIES:
        return {'error': 'Неверная категория'}
    
    if not title or len(title) < 10:
        return {'error': 'Заголовок должен быть не менее 10 символов'}
    
    if not description or len(description) < 20:
        return {'error': 'Описание должно быть не менее 20 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        idea_id = str(uuid.uuid4())
        safe_idea_id = idea_id.replace("'", "''")
        safe_user_id = user_id.replace("'", "''")
        safe_title = title.replace("'", "''")
        safe_description = description.replace("'", "''")
        safe_category = category.replace("'", "''")
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.user_ideas
            (id, user_id, title, description, category, status, created_at, updated_at)
            VALUES ('{safe_idea_id}', '{safe_user_id}', '{safe_title}', 
                    '{safe_description}', '{safe_category}', 'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, title, category, status, created_at
            """
        )
        
        idea = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'idea': {
                'id': idea['id'],
                'title': idea['title'],
                'category': idea['category'],
                'status': idea['status'],
                'created_at': idea['created_at'].isoformat()
            },
            'message': 'Спасибо за идею! Мы рассмотрим её в ближайшее время.'
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': f'Ошибка создания идеи: {str(e)}'}

def get_ideas(filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """Получение списка идей с фильтрами"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    filters = filters or {}
    category = filters.get('category')
    status = filters.get('status')
    sort_by = filters.get('sort_by', 'votes')  # votes, created, comments
    limit = min(int(filters.get('limit', 50)), 100)
    offset = int(filters.get('offset', 0))
    
    where_clauses = []
    if category and category in CATEGORIES:
        safe_category = category.replace("'", "''")
        where_clauses.append(f"i.category = '{safe_category}'")
    if status and status in STATUSES:
        safe_status = status.replace("'", "''")
        where_clauses.append(f"i.status = '{safe_status}'")
    
    where_sql = ' AND '.join(where_clauses) if where_clauses else '1=1'
    
    order_by = {
        'votes': 'i.votes_count DESC, i.created_at DESC',
        'created': 'i.created_at DESC',
        'comments': 'i.comments_count DESC, i.created_at DESC'
    }.get(sort_by, 'i.votes_count DESC, i.created_at DESC')
    
    try:
        cur.execute(
            f"""
            SELECT 
                i.id, i.title, i.description, i.category, i.status,
                i.votes_count, i.comments_count, i.created_at, i.updated_at,
                u.full_name as author_name, u.email as author_email
            FROM {SCHEMA}.user_ideas i
            JOIN {SCHEMA}.users u ON i.user_id = u.id
            WHERE {where_sql}
            ORDER BY {order_by}
            LIMIT {limit} OFFSET {offset}
            """
        )
        
        ideas = cur.fetchall()
        
        # Получаем общее количество
        cur.execute(
            f"""
            SELECT COUNT(*) as total
            FROM {SCHEMA}.user_ideas i
            WHERE {where_sql}
            """
        )
        total = cur.fetchone()['total']
        
        cur.close()
        conn.close()
        
        result_ideas = []
        for idea in ideas:
            cat_info = CATEGORIES.get(idea['category'], {})
            status_info = STATUSES.get(idea['status'], {})
            
            result_ideas.append({
                'id': idea['id'],
                'title': idea['title'],
                'description': idea['description'],
                'category': {
                    'id': idea['category'],
                    'name': cat_info.get('name', idea['category']),
                    'icon': cat_info.get('icon', ''),
                    'color': cat_info.get('color', 'gray')
                },
                'status': {
                    'id': idea['status'],
                    'name': status_info.get('name', idea['status']),
                    'icon': status_info.get('icon', ''),
                    'color': status_info.get('color', 'gray')
                },
                'votes_count': idea['votes_count'],
                'comments_count': idea['comments_count'],
                'author': {
                    'name': idea['author_name'],
                    'email': idea['author_email']
                },
                'created_at': idea['created_at'].isoformat() if idea['created_at'] else None,
                'updated_at': idea['updated_at'].isoformat() if idea['updated_at'] else None
            })
        
        return {
            'ideas': result_ideas,
            'total': total,
            'limit': limit,
            'offset': offset
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def get_idea_detail(idea_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Получение детальной информации об идее"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_idea_id = idea_id.replace("'", "''")
    
    try:
        cur.execute(
            f"""
            SELECT 
                i.id, i.title, i.description, i.category, i.status,
                i.votes_count, i.comments_count, i.created_at, i.updated_at,
                u.id as author_id, u.full_name as author_name, u.email as author_email
            FROM {SCHEMA}.user_ideas i
            JOIN {SCHEMA}.users u ON i.user_id = u.id
            WHERE i.id = '{safe_idea_id}'
            """
        )
        
        idea = cur.fetchone()
        
        if not idea:
            cur.close()
            conn.close()
            return {'error': 'Идея не найдена'}
        
        # Проверяем, голосовал ли текущий пользователь
        user_voted = False
        if user_id:
            safe_user_id = user_id.replace("'", "''")
            cur.execute(
                f"""
                SELECT COUNT(*) as count FROM {SCHEMA}.idea_votes
                WHERE idea_id = '{safe_idea_id}' AND user_id = '{safe_user_id}'
                """
            )
            user_voted = cur.fetchone()['count'] > 0
        
        # Получаем комментарии
        cur.execute(
            f"""
            SELECT 
                c.id, c.text, c.is_admin, c.created_at, c.updated_at,
                c.parent_comment_id,
                u.full_name as author_name
            FROM {SCHEMA}.idea_comments c
            JOIN {SCHEMA}.users u ON c.user_id = u.id
            WHERE c.idea_id = '{safe_idea_id}'
            ORDER BY c.created_at ASC
            """
        )
        
        comments = cur.fetchall()
        
        cur.close()
        conn.close()
        
        cat_info = CATEGORIES.get(idea['category'], {})
        status_info = STATUSES.get(idea['status'], {})
        
        return {
            'idea': {
                'id': idea['id'],
                'title': idea['title'],
                'description': idea['description'],
                'category': {
                    'id': idea['category'],
                    'name': cat_info.get('name', idea['category']),
                    'icon': cat_info.get('icon', ''),
                    'color': cat_info.get('color', 'gray')
                },
                'status': {
                    'id': idea['status'],
                    'name': status_info.get('name', idea['status']),
                    'icon': status_info.get('icon', ''),
                    'color': status_info.get('color', 'gray')
                },
                'votes_count': idea['votes_count'],
                'comments_count': idea['comments_count'],
                'author': {
                    'id': idea['author_id'],
                    'name': idea['author_name'],
                    'email': idea['author_email']
                },
                'user_voted': user_voted,
                'created_at': idea['created_at'].isoformat() if idea['created_at'] else None,
                'updated_at': idea['updated_at'].isoformat() if idea['updated_at'] else None
            },
            'comments': [
                {
                    'id': c['id'],
                    'text': c['text'],
                    'is_admin': c['is_admin'],
                    'author_name': c['author_name'],
                    'parent_comment_id': c['parent_comment_id'],
                    'created_at': c['created_at'].isoformat() if c['created_at'] else None
                }
                for c in comments
            ]
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def toggle_vote(idea_id: str, user_id: str) -> Dict[str, Any]:
    """Поставить/снять голос за идею"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_idea_id = idea_id.replace("'", "''")
    safe_user_id = user_id.replace("'", "''")
    
    try:
        # Проверяем существование голоса
        cur.execute(
            f"""
            SELECT id FROM {SCHEMA}.idea_votes
            WHERE idea_id = '{safe_idea_id}' AND user_id = '{safe_user_id}'
            """
        )
        existing_vote = cur.fetchone()
        
        if existing_vote:
            # Убираем голос
            cur.execute(
                f"""
                DELETE FROM {SCHEMA}.idea_votes
                WHERE idea_id = '{safe_idea_id}' AND user_id = '{safe_user_id}'
                """
            )
            cur.execute(
                f"""
                UPDATE {SCHEMA}.user_ideas
                SET votes_count = votes_count - 1
                WHERE id = '{safe_idea_id}'
                RETURNING votes_count
                """
            )
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'success': True,
                'voted': False,
                'votes_count': result['votes_count']
            }
        else:
            # Добавляем голос
            vote_id = str(uuid.uuid4())
            safe_vote_id = vote_id.replace("'", "''")
            
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.idea_votes
                (id, idea_id, user_id, created_at)
                VALUES ('{safe_vote_id}', '{safe_idea_id}', '{safe_user_id}', CURRENT_TIMESTAMP)
                """
            )
            cur.execute(
                f"""
                UPDATE {SCHEMA}.user_ideas
                SET votes_count = votes_count + 1
                WHERE id = '{safe_idea_id}'
                RETURNING votes_count
                """
            )
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'success': True,
                'voted': True,
                'votes_count': result['votes_count']
            }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def add_comment(idea_id: str, user_id: str, text: str, parent_comment_id: Optional[str] = None) -> Dict[str, Any]:
    """Добавить комментарий к идее"""
    if not text or len(text) < 5:
        return {'error': 'Комментарий должен быть не менее 5 символов'}
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        comment_id = str(uuid.uuid4())
        safe_comment_id = comment_id.replace("'", "''")
        safe_idea_id = idea_id.replace("'", "''")
        safe_user_id = user_id.replace("'", "''")
        safe_text = text.replace("'", "''")
        safe_parent = (parent_comment_id or '').replace("'", "''") if parent_comment_id else None
        
        parent_sql = f"'{safe_parent}'" if safe_parent else 'NULL'
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.idea_comments
            (id, idea_id, user_id, parent_comment_id, text, created_at, updated_at)
            VALUES ('{safe_comment_id}', '{safe_idea_id}', '{safe_user_id}', 
                    {parent_sql}, '{safe_text}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, text, created_at
            """
        )
        
        comment = cur.fetchone()
        
        # Обновляем счётчик комментариев
        cur.execute(
            f"""
            UPDATE {SCHEMA}.user_ideas
            SET comments_count = comments_count + 1
            WHERE id = '{safe_idea_id}'
            """
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'comment': {
                'id': comment['id'],
                'text': comment['text'],
                'created_at': comment['created_at'].isoformat()
            }
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        
        # GET ?action=categories - список категорий (публичный)
        if method == 'GET' and action == 'categories':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'categories': [
                        {'id': k, **v} for k, v in CATEGORIES.items()
                    ]
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # GET ?action=statuses - список статусов (публичный)
        if method == 'GET' and action == 'statuses':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'statuses': [
                        {'id': k, **v} for k, v in STATUSES.items()
                    ]
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # GET - список идей (публичный, но с авторизацией видны голоса)
        if method == 'GET' and not action:
            filters = {
                'category': query_params.get('category'),
                'status': query_params.get('status'),
                'sort_by': query_params.get('sort_by', 'votes'),
                'limit': query_params.get('limit', '50'),
                'offset': query_params.get('offset', '0')
            }
            
            result = get_ideas(filters)
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # GET ?action=detail&id=... - детали идеи
        if method == 'GET' and action == 'detail':
            idea_id = query_params.get('id')
            if not idea_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Не указан ID идеи'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            token = event.get('headers', {}).get('X-Auth-Token', '')
            user_info = verify_token(token)
            user_id = user_info['user_id'] if user_info else None
            
            result = get_idea_detail(idea_id, user_id)
            
            if 'error' in result:
                return {
                    'statusCode': 404 if result['error'] == 'Идея не найдена' else 400,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Для остальных действий нужна авторизация
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_info = verify_token(token)
        
        if not user_info:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        user_id = user_info['user_id']
        
        # POST - создание, голосование, комментирование
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            post_action = body.get('action', '')
            
            if post_action == 'create':
                result = create_idea(
                    user_id,
                    body.get('title', ''),
                    body.get('description', ''),
                    body.get('category', '')
                )
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            elif post_action == 'vote':
                idea_id = body.get('idea_id')
                if not idea_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Не указан ID идеи'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                result = toggle_vote(idea_id, user_id)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            elif post_action == 'comment':
                idea_id = body.get('idea_id')
                text = body.get('text', '')
                parent_comment_id = body.get('parent_comment_id')
                
                if not idea_id:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Не указан ID идеи'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                result = add_comment(idea_id, user_id, text, parent_comment_id)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Неизвестное действие'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }