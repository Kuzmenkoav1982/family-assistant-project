"""Семейный кошелёк: баланс, пополнение, списание, история транзакций."""

import json
import os
import psycopg2
from decimal import Decimal


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Access-Control-Max-Age': '86400'
}


def respond(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_and_family(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None, None
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT s.user_id FROM sessions s WHERE s.token = '%s' AND s.expires_at > NOW()"
            % token.replace("'", "''")
        )
        row = cur.fetchone()
        if not row:
            return None, None
        user_id = row[0]

        cur.execute(
            "SELECT family_id FROM family_members WHERE user_id = '%s' LIMIT 1"
            % str(user_id)
        )
        fm = cur.fetchone()
        family_id = fm[0] if fm else None
        return user_id, family_id
    finally:
        conn.close()


def ensure_wallet(cur, family_id):
    cur.execute(
        "SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'"
        % str(family_id)
    )
    row = cur.fetchone()
    if row:
        return row[0], float(row[1])
    cur.execute(
        "INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id"
        % str(family_id)
    )
    wallet_id = cur.fetchone()[0]
    return wallet_id, 0.0


def handler(event, context):
    """Семейный кошелёк: баланс, пополнение, списание, история"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    user_id, family_id = get_user_and_family(event)
    if not user_id:
        return respond(401, {'error': 'Не авторизован'})
    if not family_id:
        return respond(400, {'error': 'Семья не найдена'})

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'balance')

        if action == 'balance':
            return get_balance(family_id)
        elif action == 'history':
            limit = int(params.get('limit', '50'))
            offset = int(params.get('offset', '0'))
            return get_history(family_id, limit, offset)
        elif action == 'stats':
            return get_stats(family_id)

    if method == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        action = body.get('action', '')

        if action == 'topup':
            return topup(user_id, family_id, body)
        elif action == 'spend':
            return spend(user_id, family_id, body)
        elif action == 'check_balance':
            return check_balance(family_id, body)

    return respond(400, {'error': 'Неизвестное действие'})


def get_balance(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        wallet_id, balance = ensure_wallet(cur, family_id)
        conn.commit()

        cur.execute(
            "SELECT COUNT(*) FROM wallet_transactions WHERE wallet_id = %d" % wallet_id
        )
        tx_count = cur.fetchone()[0]

        return respond(200, {
            'balance': balance,
            'wallet_id': wallet_id,
            'transactions_count': tx_count
        })
    finally:
        conn.close()


def get_history(family_id, limit, offset):
    conn = get_db()
    try:
        cur = conn.cursor()
        wallet_id, balance = ensure_wallet(cur, family_id)
        conn.commit()

        cur.execute("""
            SELECT wt.id, wt.type, wt.amount_rub, wt.reason, wt.description,
                   wt.created_at, u.name as user_name
            FROM wallet_transactions wt
            LEFT JOIN users u ON wt.user_id = u.id
            WHERE wt.wallet_id = %d
            ORDER BY wt.created_at DESC
            LIMIT %d OFFSET %d
        """ % (wallet_id, min(limit, 100), offset))

        transactions = [
            {
                'id': r[0], 'type': r[1], 'amount': float(r[2]),
                'reason': r[3], 'description': r[4],
                'created_at': str(r[5]), 'user_name': r[6]
            }
            for r in cur.fetchall()
        ]

        return respond(200, {
            'balance': balance,
            'transactions': transactions,
            'offset': offset,
            'limit': limit
        })
    finally:
        conn.close()


def get_stats(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        wallet_id, balance = ensure_wallet(cur, family_id)
        conn.commit()

        cur.execute("""
            SELECT
                COALESCE(SUM(CASE WHEN type = 'topup' THEN amount_rub ELSE 0 END), 0) as total_topup,
                COALESCE(SUM(CASE WHEN type = 'spend' THEN amount_rub ELSE 0 END), 0) as total_spent,
                COUNT(*) as total_tx
            FROM wallet_transactions WHERE wallet_id = %d
        """ % wallet_id)
        row = cur.fetchone()

        cur.execute("""
            SELECT reason, SUM(amount_rub) as total
            FROM wallet_transactions
            WHERE wallet_id = %d AND type = 'spend'
            GROUP BY reason ORDER BY total DESC LIMIT 10
        """ % wallet_id)
        spend_by_reason = [
            {'reason': r[0] or 'Другое', 'total': float(r[1])}
            for r in cur.fetchall()
        ]

        return respond(200, {
            'balance': balance,
            'total_topup': float(row[0]),
            'total_spent': float(row[1]),
            'total_transactions': row[2],
            'spend_by_reason': spend_by_reason
        })
    finally:
        conn.close()


def topup(user_id, family_id, body):
    amount = body.get('amount')
    description = body.get('description', '')

    if not amount or float(amount) <= 0:
        return respond(400, {'error': 'Сумма должна быть больше 0'})

    amount_val = round(float(amount), 2)
    if amount_val > 100000:
        return respond(400, {'error': 'Максимальная сумма пополнения: 100 000 руб'})

    conn = get_db()
    try:
        cur = conn.cursor()
        wallet_id, old_balance = ensure_wallet(cur, family_id)

        cur.execute(
            "UPDATE family_wallet SET balance_rub = balance_rub + %s, updated_at = NOW() WHERE id = %d"
            % (amount_val, wallet_id)
        )

        desc_safe = str(description).replace("'", "''")[:200]
        cur.execute("""
            INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
            VALUES (%d, 'topup', %s, 'topup', '%s', '%s')
        """ % (wallet_id, amount_val, desc_safe, str(user_id)))

        conn.commit()

        return respond(200, {
            'success': True,
            'new_balance': round(old_balance + amount_val, 2),
            'message': 'Баланс пополнен на %.2f руб' % amount_val
        })
    finally:
        conn.close()


def spend(user_id, family_id, body):
    amount = body.get('amount')
    reason = body.get('reason', 'manual')
    description = body.get('description', '')

    if not amount or float(amount) <= 0:
        return respond(400, {'error': 'Сумма должна быть больше 0'})

    amount_val = round(float(amount), 2)

    conn = get_db()
    try:
        cur = conn.cursor()
        wallet_id, balance = ensure_wallet(cur, family_id)

        if balance < amount_val:
            return respond(400, {
                'error': 'Недостаточно средств',
                'balance': balance,
                'required': amount_val
            })

        cur.execute(
            "UPDATE family_wallet SET balance_rub = balance_rub - %s, updated_at = NOW() WHERE id = %d"
            % (amount_val, wallet_id)
        )

        reason_safe = str(reason).replace("'", "''")[:100]
        desc_safe = str(description).replace("'", "''")[:200]
        cur.execute("""
            INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
            VALUES (%d, 'spend', %s, '%s', '%s', '%s')
        """ % (wallet_id, amount_val, reason_safe, desc_safe, str(user_id)))

        conn.commit()

        return respond(200, {
            'success': True,
            'new_balance': round(balance - amount_val, 2),
            'message': 'Списано %.2f руб' % amount_val
        })
    finally:
        conn.close()


def check_balance(family_id, body):
    required = body.get('required', 0)
    conn = get_db()
    try:
        cur = conn.cursor()
        wallet_id, balance = ensure_wallet(cur, family_id)
        conn.commit()

        enough = balance >= float(required)
        return respond(200, {
            'enough': enough,
            'balance': balance,
            'required': float(required),
            'deficit': max(0, float(required) - balance)
        })
    finally:
        conn.close()
