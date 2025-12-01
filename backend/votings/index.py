"""
Business: Управление системой голосований (создание, голосование, получение результатов)
Args: event с httpMethod, body, headers с X-Auth-Token
Returns: JSON с данными голосований или результатом операции
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn

def escape_string(value: Any) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

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

def get_member_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    cur.execute(query)
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['id']) if member else None

def get_votings(family_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    where_clause = f"WHERE family_id::text = {escape_string(family_id)}"
    if status:
        where_clause += f" AND status = {escape_string(status)}"
    
    query = f"""
        SELECT id, family_id, title, description, voting_type, end_date, status, created_by, created_at, updated_at
        FROM {SCHEMA}.votings
        {where_clause}
        ORDER BY created_at DESC
    """
    cur.execute(query)
    votings = cur.fetchall()
    
    result = []
    for voting in votings:
        voting_dict = dict(voting)
        
        options_query = f"""
            SELECT id, option_text, description
            FROM {SCHEMA}.voting_options
            WHERE voting_id::text = {escape_string(str(voting['id']))}
        """
        cur.execute(options_query)
        options = cur.fetchall()
        
        voting_dict['options'] = []
        for option in options:
            votes_query = f"""
                SELECT COUNT(*) as total_votes,
                       SUM(CASE WHEN vote_value = TRUE THEN 1 ELSE 0 END) as yes_votes,
                       SUM(CASE WHEN vote_value = FALSE THEN 1 ELSE 0 END) as no_votes
                FROM {SCHEMA}.votes
                WHERE option_id::text = {escape_string(str(option['id']))}
            """
            cur.execute(votes_query)
            vote_stats = cur.fetchone()
            
            votes_list_query = f"""
                SELECT member_id::text as member_id, vote_value, created_at
                FROM {SCHEMA}.votes
                WHERE option_id::text = {escape_string(str(option['id']))}
            """
            cur.execute(votes_list_query)
            votes_list = cur.fetchall()
            
            voting_dict['options'].append({
                'id': str(option['id']),
                'option_text': option['option_text'],
                'description': option['description'],
                'total_votes': int(vote_stats['total_votes']) if vote_stats and vote_stats['total_votes'] is not None else 0,
                'yes_votes': int(vote_stats['yes_votes']) if vote_stats and vote_stats['yes_votes'] is not None else 0,
                'no_votes': int(vote_stats['no_votes']) if vote_stats and vote_stats['no_votes'] is not None else 0,
                'votes': [{'member_id': v['member_id'], 'vote_value': v['vote_value'], 'created_at': str(v['created_at'])} for v in votes_list]
            })
        
        result.append(voting_dict)
    
    cur.close()
    conn.close()
    return result

def create_voting(family_id: str, member_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        voting_query = f"""
            INSERT INTO {SCHEMA}.votings
            (family_id, title, description, voting_type, end_date, created_by)
            VALUES (
                {escape_string(family_id)},
                {escape_string(data.get('title', ''))},
                {escape_string(data.get('description', ''))},
                {escape_string(data.get('voting_type', 'general'))},
                {escape_string(data.get('end_date', ''))},
                {escape_string(member_id)}
            )
            RETURNING id
        """
        cur.execute(voting_query)
        voting = cur.fetchone()
        voting_id = str(voting['id'])
        
        if 'options' in data and data['options']:
            for option in data['options']:
                option_query = f"""
                    INSERT INTO {SCHEMA}.voting_options
                    (voting_id, option_text, description)
                    VALUES (
                        {escape_string(voting_id)},
                        {escape_string(option.get('text', ''))},
                        {escape_string(option.get('description', ''))}
                    )
                """
                cur.execute(option_query)
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'voting_id': voting_id,
            'message': 'Голосование создано успешно'
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def cast_vote(member_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        voting_id = data.get('voting_id')
        option_id = data.get('option_id')
        vote_value = data.get('vote_value')
        
        check_query = f"""
            SELECT id FROM {SCHEMA}.votes 
            WHERE voting_id::text = {escape_string(voting_id)} 
            AND member_id::text = {escape_string(member_id)}
            AND option_id::text = {escape_string(option_id)}
        """
        cur.execute(check_query)
        existing_vote = cur.fetchone()
        
        if existing_vote:
            update_query = f"""
                UPDATE {SCHEMA}.votes
                SET vote_value = {escape_string(vote_value)}
                WHERE id::text = {escape_string(str(existing_vote['id']))}
            """
            cur.execute(update_query)
            message = 'Голос обновлён'
        else:
            insert_query = f"""
                INSERT INTO {SCHEMA}.votes
                (voting_id, option_id, member_id, vote_value)
                VALUES (
                    {escape_string(voting_id)},
                    {escape_string(option_id)},
                    {escape_string(member_id)},
                    {escape_string(vote_value)}
                )
            """
            cur.execute(insert_query)
            message = 'Голос учтён'
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': message
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def get_feature_votes(section_id: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if section_id:
            query = f"""
                SELECT 
                    section_id,
                    COUNT(*) FILTER (WHERE vote_type = 'up') as up_votes,
                    COUNT(*) FILTER (WHERE vote_type = 'down') as down_votes
                FROM {SCHEMA}.feature_votes
                WHERE section_id = {escape_string(section_id)}
                GROUP BY section_id
            """
            cur.execute(query)
            result = cur.fetchone()
            
            if result:
                votes_data = {
                    'section_id': result['section_id'],
                    'up': int(result['up_votes']),
                    'down': int(result['down_votes'])
                }
            else:
                votes_data = {'section_id': section_id, 'up': 0, 'down': 0}
            
            cur.close()
            conn.close()
            return votes_data
        else:
            query = f"""
                SELECT 
                    section_id,
                    COUNT(*) FILTER (WHERE vote_type = 'up') as up_votes,
                    COUNT(*) FILTER (WHERE vote_type = 'down') as down_votes
                FROM {SCHEMA}.feature_votes
                GROUP BY section_id
            """
            cur.execute(query)
            results = cur.fetchall()
            
            votes_map = {}
            for row in results:
                votes_map[row['section_id']] = {
                    'up': int(row['up_votes']),
                    'down': int(row['down_votes'])
                }
            
            cur.close()
            conn.close()
            return votes_map
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def cast_feature_vote(user_id: str, section_id: str, vote_type: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = f"""
            INSERT INTO {SCHEMA}.feature_votes 
                (section_id, user_id, vote_type)
            VALUES ({escape_string(section_id)}, {escape_string(user_id)}, {escape_string(vote_type)})
            ON CONFLICT (section_id, user_id) 
            DO UPDATE SET vote_type = EXCLUDED.vote_type, updated_at = CURRENT_TIMESTAMP
        """
        cur.execute(query)
        
        stats_query = f"""
            SELECT 
                section_id,
                COUNT(*) FILTER (WHERE vote_type = 'up') as up_votes,
                COUNT(*) FILTER (WHERE vote_type = 'down') as down_votes
            FROM {SCHEMA}.feature_votes
            WHERE section_id = {escape_string(section_id)}
            GROUP BY section_id
        """
        cur.execute(stats_query)
        result = cur.fetchone()
        
        votes_data = {
            'section_id': section_id,
            'up': int(result['up_votes']) if result else 0,
            'down': int(result['down_votes']) if result else 0
        }
        
        cur.close()
        conn.close()
        
        return {
            'success': True,
            'message': 'Голос учтён',
            'votes': votes_data
        }
    except Exception as e:
        cur.close()
        conn.close()
        return {'error': str(e)}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if '/feature-votes' in path or event.get('queryStringParameters', {}).get('type') == 'feature':
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            section_id = query_params.get('section_id')
            
            votes_data = get_feature_votes(section_id)
            
            if 'error' in votes_data:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(votes_data)
                }
            
            if section_id:
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'votes': votes_data})
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True, 'votes': votes_data})
                }
        
        elif method == 'POST':
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'User authentication required'})
                }
            
            try:
                body = json.loads(event.get('body', '{}'))
                section_id = body.get('section_id')
                vote_type = body.get('vote_type')
                
                if not section_id or vote_type not in ['up', 'down']:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Invalid section_id or vote_type'})
                    }
                
                result = cast_feature_vote(user_id, section_id, vote_type)
                
                if 'error' in result:
                    return {
                        'statusCode': 500,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps(result)
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(result)
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': str(e)})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    user_id = verify_token(token)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный токен'})
        }
    
    family_id = get_user_family_id(user_id)
    if not family_id:
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Семья не найдена'})
        }
    
    member_id = get_member_id(user_id)
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        status = query_params.get('status')
        
        votings = get_votings(family_id, status)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'votings': votings
            }, default=str)
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')
            
            if action == 'create':
                result = create_voting(family_id, member_id, body)
            elif action == 'vote':
                result = cast_vote(member_id, body)
            else:
                result = {'error': 'Неизвестное действие'}
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(result)
                }
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps(result, default=str)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }