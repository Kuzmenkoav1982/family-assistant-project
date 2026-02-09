import json
import os
import uuid
from yookassa import Configuration, Payment

Configuration.account_id = os.environ['YOOKASSA_SHOP_ID']
Configuration.secret_key = os.environ['YOOKASSA_SECRET_KEY']


def handler(event: dict, context) -> dict:
    """
    API для создания платежей через СБП (Система Быстрых Платежей).
    Пользователь создает платеж, получает ссылку, выбирает банк и оплачивает.
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            amount = body.get('amount')
            description = body.get('description', 'Оплата подписки')
            return_url = body.get('return_url', 'https://nasha-semiya.ru/')

            if not amount or amount <= 0:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Некорректная сумма платежа'}),
                    'isBase64Encoded': False
                }

            # Создаем платеж через ЮKassa с методом СБП
            payment = Payment.create({
                "amount": {
                    "value": str(amount),
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": return_url
                },
                "capture": True,
                "description": description,
                "payment_method_data": {
                    "type": "sbp"
                }
            }, uuid.uuid4())

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'payment_id': payment.id,
                    'confirmation_url': payment.confirmation.confirmation_url,
                    'status': payment.status
                }),
                'isBase64Encoded': False
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ошибка создания платежа: {str(e)}'}),
                'isBase64Encoded': False
            }

    if method == 'GET':
        # Проверка статуса платежа
        payment_id = event.get('queryStringParameters', {}).get('payment_id')

        if not payment_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указан payment_id'}),
                'isBase64Encoded': False
            }

        try:
            payment = Payment.find_one(payment_id)

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'payment_id': payment.id,
                    'status': payment.status,
                    'amount': payment.amount.value,
                    'paid': payment.paid
                }),
                'isBase64Encoded': False
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ошибка получения статуса: {str(e)}'}),
                'isBase64Encoded': False
            }

    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
