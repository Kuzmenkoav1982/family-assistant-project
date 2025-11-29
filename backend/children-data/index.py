import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление данными детских профилей (здоровье, развитие, школа, подарки)
    Args: event - dict with httpMethod, body, queryStringParameters, headers
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
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
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    token = event.get('headers', {}).get('X-Auth-Token', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'success': False, 'error': 'Требуется авторизация'})
        }
    
    if method == 'GET':
        child_id = event.get('queryStringParameters', {}).get('child_id')
        data_type = event.get('queryStringParameters', {}).get('type', 'all')
        
        if not child_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Не указан child_id'})
            }
        
        child_data = {
            'health': {
                'vaccinations': [
                    {'id': '1', 'date': '2024-01-15', 'vaccine': 'Грипп', 'notes': 'Переносится хорошо'},
                    {'id': '2', 'date': '2023-09-10', 'vaccine': 'АКДС', 'notes': ''}
                ],
                'prescriptions': [],
                'analyses': [],
                'doctorVisits': [
                    {'id': '1', 'date': '2025-12-15', 'doctor': 'Педиатр Иванова А.И.', 'specialty': 'Педиатр', 'status': 'planned'}
                ],
                'medications': []
            },
            'purchases': [
                {
                    'id': '1',
                    'season': 'winter',
                    'category': 'Одежда',
                    'items': [
                        {'id': '1', 'name': 'Зимняя куртка', 'priority': 'high', 'estimated_cost': 8000, 'purchased': False},
                        {'id': '2', 'name': 'Зимние ботинки', 'priority': 'high', 'estimated_cost': 5000, 'purchased': False}
                    ]
                }
            ],
            'gifts': [
                {'id': '1', 'event': 'День рождения', 'date': '2025-03-15', 'gift': 'Велосипед', 'given': False, 'notes': 'Хочет синий'}
            ],
            'development': [
                {
                    'id': '1',
                    'area': 'sport',
                    'current_level': 65,
                    'target_level': 85,
                    'activities': [
                        {'id': '1', 'type': 'Секция', 'name': 'Футбол', 'schedule': 'Вт, Чт 17:00', 'cost': 5000, 'status': 'active'}
                    ],
                    'tests': []
                }
            ],
            'school': {
                'id': '1',
                'mesh_integration': False,
                'current_grade': '5 класс',
                'grades': [
                    {'subject': 'Математика', 'grade': 5, 'date': '2024-11-20'},
                    {'subject': 'Русский язык', 'grade': 4, 'date': '2024-11-21'}
                ]
            },
            'dreams': [
                {'id': '1', 'title': 'Стать космонавтом', 'description': 'Мечтаю полететь в космос', 'created_date': '2024-11-01', 'achieved': False}
            ],
            'diary': [],
            'piggyBank': {
                'balance': 1500,
                'transactions': [
                    {'id': '1', 'date': '2024-11-15', 'amount': 500, 'type': 'income', 'description': 'За уборку комнаты'}
                ]
            }
        }
        
        if data_type != 'all':
            child_data = {data_type: child_data.get(data_type, {})}
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'data': child_data})
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        child_id = body.get('child_id')
        data_type = body.get('type')
        data = body.get('data')
        
        if not all([action, child_id, data_type, data]):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'success': False, 'error': 'Неполные данные'})
            }
        
        if action == 'add':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': f'{data_type} добавлено', 'id': '123'})
            }
        
        if action == 'update':
            item_id = body.get('item_id')
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': 'Не указан item_id'})
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': f'{data_type} обновлено'})
            }
        
        if action == 'delete':
            item_id = body.get('item_id')
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'success': False, 'error': 'Не указан item_id'})
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': f'{data_type} удалено'})
            }
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'success': False, 'error': 'Метод не поддерживается'})
    }
