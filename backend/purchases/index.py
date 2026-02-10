"""API для работы с семейными покупками по сезонам"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: dict, context) -> dict:
    """API для управления планом покупок семьи"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    family_id = event.get('headers', {}).get('X-User-Id')
    if not family_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'X-User-Id header required'}),
            'isBase64Encoded': False
        }
    
    db_url = os.environ['DATABASE_URL']
    schema = os.environ['MAIN_DB_SCHEMA']
    
    conn = psycopg2.connect(db_url)
    conn.autocommit = False
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            
            if method == 'GET':
                season = event.get('queryStringParameters', {}).get('season')
                if season:
                    cur.execute(
                        f"SELECT * FROM {schema}.purchases WHERE family_id = %s AND season = %s ORDER BY priority DESC, created_at DESC",
                        (family_id, season)
                    )
                else:
                    cur.execute(
                        f"SELECT * FROM {schema}.purchases WHERE family_id = %s ORDER BY season, priority DESC, created_at DESC",
                        (family_id,)
                    )
                items = [dict(row) for row in cur.fetchall()]
                
                for item in items:
                    if item.get('created_at'):
                        item['created_at'] = item['created_at'].isoformat()
                    if item.get('updated_at'):
                        item['updated_at'] = item['updated_at'].isoformat()
                    if item.get('purchase_date'):
                        item['purchase_date'] = item['purchase_date'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'purchases': items}),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                
                required = ['name', 'season', 'category']
                if not all(k in data for k in required):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Required fields: {required}'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"""
                    INSERT INTO {schema}.purchases (family_id, member_id, season, name, category, estimated_cost, priority)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, family_id, member_id, season, name, category, estimated_cost, priority, purchased, created_at
                """, (
                    family_id,
                    data.get('member_id'),
                    data['season'],
                    data['name'],
                    data['category'],
                    data.get('estimated_cost'),
                    data.get('priority', 'medium')
                ))
                
                new_item = dict(cur.fetchone())
                if new_item.get('created_at'):
                    new_item['created_at'] = new_item['created_at'].isoformat()
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(new_item),
                    'isBase64Encoded': False
                }
            
            elif method == 'PUT':
                item_id = event.get('queryStringParameters', {}).get('id')
                if not item_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'id query parameter required'}),
                        'isBase64Encoded': False
                    }
                
                data = json.loads(event.get('body', '{}'))
                
                cur.execute(f"SELECT id FROM {schema}.purchases WHERE id = %s AND family_id = %s", (item_id, family_id))
                if not cur.fetchone():
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Purchase not found'}),
                        'isBase64Encoded': False
                    }
                
                update_fields = []
                update_values = []
                
                for field in ['name', 'category', 'estimated_cost', 'priority', 'purchased', 'purchase_date', 'member_id']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        update_values.append(data[field])
                
                if not update_fields:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'}),
                        'isBase64Encoded': False
                    }
                
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                update_values.extend([item_id, family_id])
                
                cur.execute(f"""
                    UPDATE {schema}.purchases 
                    SET {', '.join(update_fields)}
                    WHERE id = %s AND family_id = %s
                    RETURNING id, family_id, member_id, season, name, category, estimated_cost, priority, purchased, purchase_date, updated_at
                """, update_values)
                
                updated = dict(cur.fetchone())
                if updated.get('updated_at'):
                    updated['updated_at'] = updated['updated_at'].isoformat()
                if updated.get('purchase_date'):
                    updated['purchase_date'] = updated['purchase_date'].isoformat()
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(updated),
                    'isBase64Encoded': False
                }
            
            elif method == 'DELETE':
                item_id = event.get('queryStringParameters', {}).get('id')
                if not item_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'id query parameter required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"DELETE FROM {schema}.purchases WHERE id = %s AND family_id = %s RETURNING id", (item_id, family_id))
                deleted = cur.fetchone()
                
                if not deleted:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Purchase not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 405,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Method not allowed'}),
                    'isBase64Encoded': False
                }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        conn.close()