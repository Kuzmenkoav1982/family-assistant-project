import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p5815085_family_assistant_pro'

def handler(event: dict, context) -> dict:
    """API для получения истории перемещений члена семьи за день"""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }

    params = event.get('queryStringParameters', {}) or {}
    member_id = params.get('member_id')
    date_str = params.get('date')

    if not member_id or not date_str:
        return {
            'statusCode': 400,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Missing member_id or date'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"""
                SELECT lt.latitude as lat, lt.longitude as lng, lt.accuracy, lt.created_at as timestamp
                FROM {SCHEMA}.family_location_tracking lt
                JOIN {SCHEMA}.family_members fm ON fm.user_id = lt.user_id
                WHERE fm.id = %s
                  AND DATE(lt.created_at) = %s
                ORDER BY lt.created_at ASC
            """, (member_id, date_str))

            locations = cur.fetchall()

            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'member_id': member_id,
                    'date': date_str,
                    'locations': [
                        {
                            'lat': float(loc['lat']),
                            'lng': float(loc['lng']),
                            'accuracy': float(loc['accuracy']) if loc['accuracy'] else 0,
                            'timestamp': loc['timestamp'].isoformat() if loc['timestamp'] else None
                        }
                        for loc in locations
                    ],
                    'total_points': len(locations)
                }, default=str)
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        conn.close()
