import json
import os
import requests

def handler(event: dict, context) -> dict:
    '''API для подбора изображений приглашений через Unsplash'''
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt', '')

        if not prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Prompt is required'}),
                'isBase64Encoded': False
            }

        api_key = os.environ.get('UNSPLASH_ACCESS_KEY', '')

        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unsplash API key not configured'}),
                'isBase64Encoded': False
            }

        search_terms = []
        if 'birthday' in prompt.lower() or 'день рождения' in prompt.lower():
            search_terms = ['birthday party', 'celebration', 'festive']
        elif 'wedding' in prompt.lower() or 'свадьба' in prompt.lower():
            search_terms = ['wedding', 'marriage', 'celebration']
        else:
            search_terms = ['party', 'celebration', 'event']

        url = f'https://api.unsplash.com/photos/random'
        headers = {'Authorization': f'Client-ID {api_key}'}
        params = {
            'query': ' '.join(search_terms),
            'orientation': 'landscape',
            'content_filter': 'high'
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()
            image_url = data.get('urls', {}).get('regular', '')

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'url': image_url}),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unsplash API error', 'details': response.text}),
                'isBase64Encoded': False
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
