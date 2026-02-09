import json
import os
import uuid
import base64
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.request import urlopen, Request

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'
YOOKASSA_SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
YOOKASSA_SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', '')

PLAN_PRICES = {
    'free_2026': 0,
    'premium_1m': 299,
    'premium_3m': 799,
    'premium_6m': 1499,
    'premium_12m': 2699
}

PLAN_MONTHS = {
    'free_2026': 0,
    'premium_1m': 1,
    'premium_3m': 3,
    'premium_6m': 6,
    'premium_12m': 12
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def create_recurring_payment(subscription_id: str, payment_token: str, amount: float, description: str, user_email: str) -> Dict[str, Any]:
    '''Создаёт рекуррентный платёж через сохранённый payment_method'''
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {
            'value': f'{amount:.2f}',
            'currency': 'RUB'
        },
        'capture': True,
        'description': description,
        'payment_method_id': payment_token,
        'receipt': {
            'customer': {
                'email': user_email
            },
            'items': [
                {
                    'description': description,
                    'quantity': '1',
                    'amount': {
                        'value': f'{amount:.2f}',
                        'currency': 'RUB'
                    },
                    'vat_code': 1,
                    'payment_mode': 'full_payment',
                    'payment_subject': 'service'
                }
            ]
        },
        'metadata': {
            'subscription_id': subscription_id,
            'recurring': 'true'
        }
    }
    
    auth_string = f'{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}'
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    req = Request(
        'https://api.yookassa.ru/v3/payments',
        data=json.dumps(payment_data).encode('utf-8'),
        headers={
            'Authorization': f'Basic {auth_b64}',
            'Idempotence-Key': idempotence_key,
            'Content-Type': 'application/json'
        }
    )
    
    try:
        response = urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        return {
            'success': True,
            'payment_id': result['id'],
            'status': result['status']
        }
    except Exception as e:
        return {'error': f'Ошибка рекуррентного платежа: {str(e)}'}

def process_expiring_subscriptions():
    '''Проверяет подписки, истекающие в ближайшие 3 дня, и создаёт рекуррентные платежи'''
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(f"""
            SELECT 
                s.id as subscription_id,
                s.family_id,
                s.plan_type,
                s.amount,
                s.end_date,
                s.payment_token,
                u.email as user_email,
                u.id as user_id
            FROM {SCHEMA}.subscriptions s
            JOIN {SCHEMA}.family_members fm ON s.family_id = fm.family_id AND fm.access_role = 'admin'
            JOIN {SCHEMA}.users u ON fm.user_id = u.id
            WHERE s.status = 'active'
              AND s.auto_renew = true
              AND s.payment_token IS NOT NULL
              AND s.payment_token != ''
              AND s.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
            ORDER BY s.end_date ASC
        """)
        
        expiring = cur.fetchall()
        results = []
        
        for sub in expiring:
            plan_type = sub['plan_type']
            amount = PLAN_PRICES.get(plan_type, sub['amount'])
            months = PLAN_MONTHS.get(plan_type, 1)
            
            payment_result = create_recurring_payment(
                str(sub['subscription_id']),
                sub['payment_token'],
                amount,
                f"Автопродление подписки {plan_type}",
                sub['user_email']
            )
            
            if 'error' not in payment_result:
                new_end_date = sub['end_date'] + timedelta(days=30 * months)
                cur.execute(f"""
                    UPDATE {SCHEMA}.subscriptions
                    SET 
                        end_date = '{new_end_date.strftime('%Y-%m-%d %H:%M:%S')}',
                        last_payment_date = CURRENT_TIMESTAMP,
                        yookassa_payment_id = '{payment_result["payment_id"]}'
                    WHERE id = '{sub["subscription_id"]}'
                """)
                conn.commit()
                results.append({
                    'subscription_id': str(sub['subscription_id']),
                    'status': 'renewed',
                    'new_end_date': new_end_date.isoformat()
                })
            else:
                cur.execute(f"""
                    UPDATE {SCHEMA}.subscriptions
                    SET auto_renew = false
                    WHERE id = '{sub["subscription_id"]}'
                """)
                conn.commit()
                results.append({
                    'subscription_id': str(sub['subscription_id']),
                    'status': 'failed',
                    'error': payment_result['error']
                })
        
        cur.close()
        conn.close()
        return {'success': True, 'processed': len(results), 'results': results}
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}
