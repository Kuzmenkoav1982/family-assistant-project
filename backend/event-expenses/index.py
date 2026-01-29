import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''
    Управление расходами на праздник
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            event_id = event.get('queryStringParameters', {}).get('eventId') if event.get('queryStringParameters') else None
            
            if not event_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Event ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT id, event_id, category, title, amount, paid_by, receipt_url,
                       paid_at, created_at
                FROM event_expenses
                WHERE event_id = %s
                ORDER BY paid_at DESC
            ''', (event_id,))
            
            rows = cursor.fetchall()
            expenses = []
            
            for row in rows:
                expenses.append({
                    'id': row[0],
                    'eventId': row[1],
                    'category': row[2],
                    'title': row[3],
                    'amount': float(row[4]),
                    'paidBy': row[5],
                    'receiptUrl': row[6],
                    'paidAt': row[7].isoformat() if row[7] else None,
                    'createdAt': row[8].isoformat() if row[8] else None
                })
            
            cursor.execute('''
                SELECT COALESCE(SUM(amount), 0) as total
                FROM event_expenses
                WHERE event_id = %s
            ''', (event_id,))
            
            total = float(cursor.fetchone()[0])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'expenses': expenses, 'total': total}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO event_expenses 
                (id, event_id, category, title, amount, paid_by, receipt_url, paid_at, created_at)
                VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            ''', (
                body.get('eventId'),
                body.get('category', 'other'),
                body.get('title'),
                body.get('amount'),
                body.get('paidBy'),
                body.get('receiptUrl')
            ))
            
            expense_id = cursor.fetchone()[0]
            
            cursor.execute('''
                UPDATE family_events
                SET spent = (
                    SELECT COALESCE(SUM(amount), 0)
                    FROM event_expenses
                    WHERE event_id = %s
                )
                WHERE id = %s
            ''', (body.get('eventId'), body.get('eventId')))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': expense_id, 'message': 'Expense added'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            expense_id = body.get('id')
            
            if not expense_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Expense ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE event_expenses
                SET category = %s, title = %s, amount = %s, paid_by = %s, receipt_url = %s
                WHERE id = %s
                RETURNING event_id
            ''', (
                body.get('category'),
                body.get('title'),
                body.get('amount'),
                body.get('paidBy'),
                body.get('receiptUrl'),
                expense_id
            ))
            
            event_id_row = cursor.fetchone()
            if event_id_row:
                cursor.execute('''
                    UPDATE family_events
                    SET spent = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM event_expenses
                        WHERE event_id = %s
                    )
                    WHERE id = %s
                ''', (event_id_row[0], event_id_row[0]))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Expense updated'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        print(f'[ERROR] {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cursor.close()
        conn.close()
