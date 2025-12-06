import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управляет планами развития: получение, обновление прогресса, завершение
    Args: event - dict с httpMethod, queryStringParameters, body
          context - объект с атрибутами request_id
    Returns: HTTP response с данными плана
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        child_id = params.get('child_id')
        plan_id = params.get('plan_id')
        status = params.get('status', 'active')
        
        if plan_id:
            cur.execute('''
                SELECT dp.id, dp.assessment_id, dp.child_id, dp.family_id, 
                       dp.plan_data, dp.status, dp.progress, dp.created_at, dp.completed_at,
                       json_agg(json_build_object(
                           'id', pt.id,
                           'category', pt.category,
                           'task_description', pt.task_description,
                           'completed', pt.completed,
                           'completed_at', pt.completed_at
                       )) as tasks
                FROM t_p5815085_family_assistant_pro.development_plans dp
                LEFT JOIN t_p5815085_family_assistant_pro.plan_tasks pt ON pt.plan_id = dp.id
                WHERE dp.id = %s
                GROUP BY dp.id
            ''', (plan_id,))
        elif child_id:
            cur.execute('''
                SELECT dp.id, dp.assessment_id, dp.child_id, dp.family_id, 
                       dp.plan_data, dp.status, dp.progress, dp.created_at, dp.completed_at,
                       json_agg(json_build_object(
                           'id', pt.id,
                           'category', pt.category,
                           'task_description', pt.task_description,
                           'completed', pt.completed,
                           'completed_at', pt.completed_at
                       )) as tasks
                FROM t_p5815085_family_assistant_pro.development_plans dp
                LEFT JOIN t_p5815085_family_assistant_pro.plan_tasks pt ON pt.plan_id = dp.id
                WHERE dp.child_id = %s AND dp.status = %s
                GROUP BY dp.id
                ORDER BY dp.created_at DESC
            ''', (child_id, status))
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'child_id or plan_id required'}),
                'isBase64Encoded': False
            }
        
        rows = cur.fetchall()
        
        if not rows:
            cur.close()
            conn.close()
            # Возвращаем 200 с пустым массивом вместо 404 для GET запросов без plan_id
            if child_id and not plan_id:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([]),
                    'isBase64Encoded': False
                }
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Plan not found'}),
                'isBase64Encoded': False
            }
        
        if plan_id:
            row = rows[0]
            result = {
                'id': row[0],
                'assessment_id': row[1],
                'child_id': row[2],
                'family_id': row[3],
                'plan_data': row[4],
                'status': row[5],
                'progress': row[6],
                'created_at': row[7].isoformat() if row[7] else None,
                'completed_at': row[8].isoformat() if row[8] else None,
                'tasks': row[9] if row[9] else []
            }
        else:
            result = []
            for row in rows:
                result.append({
                    'id': row[0],
                    'assessment_id': row[1],
                    'child_id': row[2],
                    'family_id': row[3],
                    'plan_data': row[4],
                    'status': row[5],
                    'progress': row[6],
                    'created_at': row[7].isoformat() if row[7] else None,
                    'completed_at': row[8].isoformat() if row[8] else None,
                    'tasks': row[9] if row[9] else []
                })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        params = event.get('queryStringParameters', {})
        plan_id = params.get('plan_id')
        
        if not plan_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'plan_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute('DELETE FROM t_p5815085_family_assistant_pro.plan_tasks WHERE plan_id = %s', (plan_id,))
        cur.execute('DELETE FROM t_p5815085_family_assistant_pro.development_plans WHERE id = %s', (plan_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        task_id = body_data.get('task_id')
        completed = body_data.get('completed', False)
        plan_id = body_data.get('plan_id')
        
        if not task_id or plan_id is None:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'task_id and plan_id required'}),
                'isBase64Encoded': False
            }
        
        if completed:
            cur.execute('''
                UPDATE t_p5815085_family_assistant_pro.plan_tasks 
                SET completed = true, completed_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            ''', (task_id,))
        else:
            cur.execute('''
                UPDATE t_p5815085_family_assistant_pro.plan_tasks 
                SET completed = false, completed_at = NULL 
                WHERE id = %s
            ''', (task_id,))
        
        cur.execute('''
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed
            FROM t_p5815085_family_assistant_pro.plan_tasks
            WHERE plan_id = %s
        ''', (plan_id,))
        
        total, completed_count = cur.fetchone()
        progress = int((completed_count / total * 100)) if total > 0 else 0
        
        cur.execute('''
            UPDATE t_p5815085_family_assistant_pro.development_plans 
            SET progress = %s 
            WHERE id = %s
        ''', (progress, plan_id))
        
        if progress == 100:
            cur.execute('''
                UPDATE t_p5815085_family_assistant_pro.development_plans 
                SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            ''', (plan_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'progress': progress}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }