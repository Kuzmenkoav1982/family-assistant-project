import json
import os
import boto3
from botocore.exceptions import ClientError


def handler(event: dict, context) -> dict:
    '''Подсчёт использованного места в хранилище рецептов'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Authorization'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        total_size = 0
        photo_count = 0
        
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket='files', Prefix='recipes/')
        
        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    total_size += obj['Size']
                    photo_count += 1
        
        total_size_mb = round(total_size / (1024 * 1024), 2)
        
        free_limit_mb = 500
        free_limit_photos = 100
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'total_size_bytes': total_size,
                'total_size_mb': total_size_mb,
                'photo_count': photo_count,
                'limits': {
                    'free_size_mb': free_limit_mb,
                    'free_photos': free_limit_photos
                },
                'usage_percent': {
                    'size': round((total_size_mb / free_limit_mb) * 100, 1),
                    'photos': round((photo_count / free_limit_photos) * 100, 1)
                },
                'is_limit_reached': total_size_mb >= free_limit_mb or photo_count >= free_limit_photos
            })
        }
        
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'S3 error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
