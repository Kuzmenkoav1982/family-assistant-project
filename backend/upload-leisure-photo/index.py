import json
import os
import base64
import boto3
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from s3_limit_utils import check_and_track_storage

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')


def handler(event: dict, context) -> dict:
    '''Загрузка фотографий для досуговых активностей в S3'''
    
    method = event.get('httpMethod', 'POST')
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        activity_id = body.get('activity_id')
        photo_base64 = body.get('photo')
        filename = body.get('filename', f'photo_{datetime.now().timestamp()}.jpg')
        
        if not activity_id or not photo_base64:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'activity_id and photo are required'}),
                'isBase64Encoded': False
            }
        
        photo_data = base64.b64decode(photo_base64)

        if len(photo_data) > MAX_FILE_SIZE_BYTES:
            return {
                'statusCode': 413,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Файл слишком большой. Максимум 10 МБ'}, ensure_ascii=False)
            }

        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        
        key = f'leisure-photos/{activity_id}/{filename}'
        s3.put_object(
            Bucket='files',
            Key=key,
            Body=photo_data,
            ContentType='image/jpeg'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)

        # Проверка лимита S3 на семью (через family_id из activity)
        family_id = (event.get('headers') or {}).get('X-Family-Id') or (event.get('headers') or {}).get('x-family-id')
        if not family_id:
            # Получить family_id из leisure_activities
            with conn.cursor() as cur:
                cur.execute(f"SELECT family_id FROM {SCHEMA}.leisure_activities WHERE id = %s", (activity_id,))
                row = cur.fetchone()
                if row:
                    family_id = str(row[0])

        if family_id:
            ok, err = check_and_track_storage(conn, SCHEMA, family_id, len(photo_data))
            if not ok:
                conn.close()
                return err

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE leisure_activities 
                SET photos = array_append(COALESCE(photos, ARRAY[]::TEXT[]), %s)
                WHERE id = %s
                RETURNING photos
                """,
                (cdn_url, activity_id)
            )
            result = cur.fetchone()
            conn.commit()

        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'url': cdn_url,
                'photos': result['photos'] if result else []
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }