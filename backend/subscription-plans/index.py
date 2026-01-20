import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления тарифными планами
    GET - получить все тарифы и функции
    POST - сохранить изменения тарифа
    PUT - создать новый тариф
    DELETE - удалить тариф
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    admin_token = event.get('headers', {}).get('x-admin-token') or event.get('headers', {}).get('X-Admin-Token')
    if admin_token != 'admin_authenticated':
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'all')
            
            if action == 'all':
                # Для админки - показываем все тарифы
                # Для сайта (public=true) - только активные на текущую дату
                is_public = event.get('queryStringParameters', {}).get('public') == 'true'
                
                active_filter = "AND sp.active_from <= CURRENT_TIMESTAMP" if is_public else ""
                
                cur.execute(f"""
                    SELECT 
                        sp.*,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', pf.id,
                                    'name', pf.name,
                                    'description', pf.description,
                                    'category', pf.category,
                                    'enabled', pfm.enabled
                                ) ORDER BY pf.sort_order
                            ) FILTER (WHERE pf.id IS NOT NULL),
                            '[]'
                        ) as features
                    FROM subscription_plans sp
                    LEFT JOIN plan_feature_mappings pfm ON sp.id = pfm.plan_id
                    LEFT JOIN plan_features pf ON pfm.feature_id = pf.id
                    WHERE 1=1 {active_filter}
                    GROUP BY sp.id
                    ORDER BY sp.sort_order
                """)
                plans = cur.fetchall()
                
                cur.execute("SELECT * FROM plan_features ORDER BY sort_order")
                all_features = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'plans': [dict(p) for p in plans],
                        'available_features': [dict(f) for f in all_features]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'features':
                cur.execute("SELECT * FROM plan_features ORDER BY category, sort_order")
                features = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'features': [dict(f) for f in features]}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            plan_id = body.get('plan_id')
            
            if not plan_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'plan_id is required'}),
                    'isBase64Encoded': False
                }
            
            plan_id_safe = plan_id.replace("'", "''")
            name = body.get('name', '').replace("'", "''")
            price = body.get('price', 0)
            period = body.get('period', '').replace("'", "''")
            period_months = body.get('period_months', 1)
            description = body.get('description', '').replace("'", "''")
            visible = body.get('visible', True)
            popular = body.get('popular', False)
            discount = body.get('discount', 0)
            functions_count = body.get('functions_count', 0)
            active_from = body.get('active_from', 'CURRENT_TIMESTAMP')
            
            # Если active_from - строка даты, оборачиваем в кавычки
            if active_from != 'CURRENT_TIMESTAMP' and active_from:
                active_from_value = f"'{active_from.replace("'", "''")}'"
            else:
                active_from_value = 'CURRENT_TIMESTAMP'
            
            cur.execute(f"""
                UPDATE subscription_plans
                SET 
                    name = '{name}',
                    price = {price},
                    period = '{period}',
                    period_months = {period_months},
                    description = '{description}',
                    visible = {visible},
                    popular = {popular},
                    discount = {discount},
                    functions_count = {functions_count},
                    active_from = {active_from_value},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = '{plan_id_safe}'
                RETURNING *
            """)
            updated_plan = cur.fetchone()
            
            features = body.get('features', [])
            if features:
                cur.execute(f"DELETE FROM plan_feature_mappings WHERE plan_id = '{plan_id_safe}'")
                
                for feature in features:
                    feature_id = feature['id'].replace("'", "''")
                    enabled = feature.get('enabled', True)
                    
                    cur.execute(f"""
                        INSERT INTO plan_feature_mappings (plan_id, feature_id, enabled)
                        VALUES ('{plan_id_safe}', '{feature_id}', {enabled})
                    """)
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'plan': dict(updated_plan) if updated_plan else None
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            
            plan_id = body.get('plan_id', '').replace("'", "''")
            name = body.get('name', '').replace("'", "''")
            price = body.get('price', 0)
            period = body.get('period', '').replace("'", "''")
            period_months = body.get('period_months', 1)
            description = body.get('description', '').replace("'", "''")
            
            cur.execute(f"""
                INSERT INTO subscription_plans (id, name, price, period, period_months, description)
                VALUES ('{plan_id}', '{name}', {price}, '{period}', {period_months}, '{description}')
                RETURNING *
            """)
            new_plan = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'plan': dict(new_plan) if new_plan else None
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            plan_id = query_params.get('plan_id', '').replace("'", "''")
            
            if not plan_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'plan_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"DELETE FROM plan_feature_mappings WHERE plan_id = '{plan_id}'")
            cur.execute(f"DELETE FROM subscription_plans WHERE id = '{plan_id}'")
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()