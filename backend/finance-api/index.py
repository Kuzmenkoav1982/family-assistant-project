"""Финансовый API: транзакции, бюджеты, долги, счета, цели, категории"""

import json
import os
import psycopg2


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


def handler(event, context):
    """Финансовый API семьи: транзакции, бюджеты, долги, счета, цели"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    user_id, family_id = get_user_and_family(event)
    if not user_id:
        return respond(401, {'error': 'Не авторизован'})
    if not family_id:
        return respond(400, {'error': 'Семья не найдена'})

    params = event.get('queryStringParameters') or {}
    section = params.get('section', '')

    if method == 'GET':
        if section == 'dashboard':
            return get_dashboard(family_id)
        elif section == 'transactions':
            return get_transactions(family_id, params)
        elif section == 'categories':
            return get_categories(family_id)
        elif section == 'budgets':
            return get_budgets(family_id, params)
        elif section == 'debts':
            return get_debts(family_id)
        elif section == 'debt_payments':
            return get_debt_payments(params)
        elif section == 'accounts':
            return get_accounts(family_id)
        elif section == 'goals':
            return get_goals(family_id)
        elif section == 'recurring':
            return get_recurring(family_id)
        elif section == 'edu_courses':
            return get_edu_courses()
        elif section == 'edu_course':
            return get_edu_course(params)
        elif section == 'edu_lesson':
            return get_edu_lesson(params)
        elif section == 'edu_test':
            return get_edu_test(params)
        elif section == 'edu_progress':
            return get_edu_progress(family_id, user_id)
        elif section == 'edu_assignments':
            return get_edu_assignments(family_id, user_id)

    if method == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        action = body.get('action', '')

        if action == 'add_transaction':
            return add_transaction(user_id, family_id, body)
        elif action == 'delete_transaction':
            return delete_transaction(family_id, body)
        elif action == 'add_category':
            return add_category(family_id, body)
        elif action == 'delete_category':
            return delete_category(family_id, body)
        elif action == 'set_budget':
            return set_budget(family_id, body)
        elif action == 'delete_budget':
            return delete_budget(family_id, body)
        elif action == 'add_debt':
            return add_debt(family_id, body)
        elif action == 'update_debt':
            return update_debt(family_id, body)
        elif action == 'delete_debt':
            return delete_debt(family_id, body)
        elif action == 'add_debt_payment':
            return add_debt_payment(family_id, body)
        elif action == 'add_account':
            return add_account(user_id, family_id, body)
        elif action == 'update_account':
            return update_account(family_id, body)
        elif action == 'delete_account':
            return delete_account(family_id, body)
        elif action == 'add_goal':
            return add_goal(family_id, body)
        elif action == 'update_goal':
            return update_goal(family_id, body)
        elif action == 'delete_goal':
            return delete_goal(family_id, body)
        elif action == 'contribute_goal':
            return contribute_goal(family_id, body)
        elif action == 'add_recurring':
            return add_recurring(family_id, body)
        elif action == 'update_recurring':
            return update_recurring(family_id, body)
        elif action == 'delete_recurring':
            return delete_recurring(family_id, body)
        elif action == 'complete_lesson':
            return complete_lesson(family_id, user_id, body)
        elif action == 'submit_test':
            return submit_test(family_id, user_id, body)
        elif action == 'assign_edu':
            return assign_edu(family_id, user_id, body)
        elif action == 'update_assignment':
            return update_assignment(family_id, body)

    return respond(400, {'error': 'Неизвестное действие'})


def safe(val):
    if val is None:
        return ''
    return str(val).replace("'", "''")[:500]


# === DASHBOARD ===

def get_dashboard(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)

        cur.execute("""
            SELECT
                COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0)
            FROM finance_transactions
            WHERE family_id = '%s'
              AND date_trunc('month', transaction_date) = date_trunc('month', CURRENT_DATE)
        """ % fid)
        row = cur.fetchone()
        month_income = float(row[0])
        month_expense = float(row[1])

        cur.execute(
            "SELECT COUNT(*) FROM finance_accounts WHERE family_id = '%s' AND is_active = true" % fid
        )
        accounts_count = cur.fetchone()[0]

        cur.execute(
            "SELECT COALESCE(SUM(balance), 0) FROM finance_accounts WHERE family_id = '%s' AND is_active = true" % fid
        )
        total_balance = float(cur.fetchone()[0])

        cur.execute(
            "SELECT COUNT(*), COALESCE(SUM(remaining_amount), 0) FROM finance_debts WHERE family_id = '%s' AND status = 'active'" % fid
        )
        dr = cur.fetchone()
        debts_count = dr[0]
        debts_total = float(dr[1])

        cur.execute(
            "SELECT COUNT(*) FROM finance_goals WHERE family_id = '%s' AND status = 'active'" % fid
        )
        goals_count = cur.fetchone()[0]

        cur.execute("""
            SELECT ft.id, ft.amount, ft.transaction_type, ft.description, ft.transaction_date,
                   fc.name as category_name, fc.icon as category_icon, fc.color as category_color
            FROM finance_transactions ft
            LEFT JOIN finance_categories fc ON ft.category_id = fc.id
            WHERE ft.family_id = '%s'
            ORDER BY ft.transaction_date DESC, ft.created_at DESC
            LIMIT 5
        """ % fid)
        recent = [
            {
                'id': str(r[0]), 'amount': float(r[1]), 'type': r[2],
                'description': r[3], 'date': str(r[4]),
                'category_name': r[5], 'category_icon': r[6], 'category_color': r[7]
            }
            for r in cur.fetchall()
        ]

        return respond(200, {
            'month_income': month_income,
            'month_expense': month_expense,
            'month_balance': month_income - month_expense,
            'total_balance': total_balance,
            'accounts_count': accounts_count,
            'debts_count': debts_count,
            'debts_total': debts_total,
            'goals_count': goals_count,
            'recent_transactions': recent
        })
    finally:
        conn.close()


# === TRANSACTIONS ===

def get_transactions(family_id, params):
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        limit = min(int(params.get('limit', '50')), 200)
        offset = int(params.get('offset', '0'))
        tx_type = params.get('type', '')
        month = params.get('month', '')
        category_id = params.get('category_id', '')

        where = "ft.family_id = '%s'" % fid
        if tx_type:
            where += " AND ft.transaction_type = '%s'" % safe(tx_type)
        if month:
            where += " AND to_char(ft.transaction_date, 'YYYY-MM') = '%s'" % safe(month)
        if category_id:
            where += " AND ft.category_id = '%s'" % safe(category_id)

        cur.execute("""
            SELECT ft.id, ft.amount, ft.transaction_type, ft.description, ft.transaction_date,
                   ft.member_id, ft.account_id, ft.is_recurring,
                   fc.name as cat_name, fc.icon as cat_icon, fc.color as cat_color,
                   fa.name as acc_name
            FROM finance_transactions ft
            LEFT JOIN finance_categories fc ON ft.category_id = fc.id
            LEFT JOIN finance_accounts fa ON ft.account_id = fa.id
            WHERE %s
            ORDER BY ft.transaction_date DESC, ft.created_at DESC
            LIMIT %d OFFSET %d
        """ % (where, limit, offset))

        items = [
            {
                'id': str(r[0]), 'amount': float(r[1]), 'type': r[2],
                'description': r[3], 'date': str(r[4]),
                'member_id': str(r[5]) if r[5] else None,
                'account_id': str(r[6]) if r[6] else None,
                'is_recurring': r[7],
                'category_name': r[8], 'category_icon': r[9], 'category_color': r[10],
                'account_name': r[11]
            }
            for r in cur.fetchall()
        ]

        cur.execute("SELECT COUNT(*) FROM finance_transactions ft WHERE %s" % where)
        total = cur.fetchone()[0]

        cur.execute("""
            SELECT
                COALESCE(SUM(CASE WHEN ft.transaction_type='income' THEN ft.amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN ft.transaction_type='expense' THEN ft.amount ELSE 0 END), 0)
            FROM finance_transactions ft WHERE %s
        """ % where)
        sr = cur.fetchone()

        return respond(200, {
            'transactions': items,
            'total': total,
            'sum_income': float(sr[0]),
            'sum_expense': float(sr[1])
        })
    finally:
        conn.close()


def add_transaction(user_id, family_id, body):
    amount = body.get('amount')
    if not amount or float(amount) <= 0:
        return respond(400, {'error': 'Сумма должна быть больше 0'})

    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        cur.execute("""
            INSERT INTO finance_transactions
            (family_id, account_id, category_id, amount, transaction_type, description, transaction_date, member_id, is_recurring, recurring_id)
            VALUES ('%s', %s, %s, %s, '%s', '%s', '%s', %s, %s, %s)
            RETURNING id
        """ % (
            fid,
            "'%s'" % safe(body.get('account_id')) if body.get('account_id') else 'NULL',
            "'%s'" % safe(body.get('category_id')) if body.get('category_id') else 'NULL',
            float(amount),
            safe(body.get('type', 'expense')),
            safe(body.get('description', '')),
            safe(body.get('date', '')),
            "'%s'" % safe(body.get('member_id')) if body.get('member_id') else 'NULL',
            body.get('is_recurring', False),
            "'%s'" % safe(body.get('recurring_id')) if body.get('recurring_id') else 'NULL'
        ))
        new_id = str(cur.fetchone()[0])

        if body.get('account_id'):
            sign = 1 if body.get('type', 'expense') == 'income' else -1
            cur.execute(
                "UPDATE finance_accounts SET balance = balance + %s, updated_at = NOW() WHERE id = '%s' AND family_id = '%s'"
                % (float(amount) * sign, safe(body['account_id']), fid)
            )

        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def delete_transaction(family_id, body):
    tid = body.get('id')
    if not tid:
        return respond(400, {'error': 'Укажите id'})

    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)

        cur.execute(
            "SELECT amount, transaction_type, account_id FROM finance_transactions WHERE id = '%s' AND family_id = '%s'"
            % (safe(tid), fid)
        )
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'Транзакция не найдена'})

        if row[2]:
            sign = -1 if row[1] == 'income' else 1
            cur.execute(
                "UPDATE finance_accounts SET balance = balance + %s, updated_at = NOW() WHERE id = '%s' AND family_id = '%s'"
                % (float(row[0]) * sign, str(row[2]), fid)
            )

        cur.execute(
            "DELETE FROM finance_transactions WHERE id = '%s' AND family_id = '%s'" % (safe(tid), fid)
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


# === CATEGORIES ===

def get_categories(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, icon, color, category_type, is_system, sort_order
            FROM finance_categories
            WHERE family_id IS NULL OR family_id = '%s'
            ORDER BY category_type, sort_order
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'name': r[1], 'icon': r[2], 'color': r[3],
                'type': r[4], 'is_system': r[5], 'sort_order': r[6]
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'categories': items})
    finally:
        conn.close()


def add_category(family_id, body):
    name = body.get('name', '').strip()
    if not name:
        return respond(400, {'error': 'Укажите название'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO finance_categories (family_id, name, icon, color, category_type, sort_order)
            VALUES ('%s', '%s', '%s', '%s', '%s', 99)
            RETURNING id
        """ % (
            str(family_id), safe(name),
            safe(body.get('icon', 'Tag')),
            safe(body.get('color', '#6B7280')),
            safe(body.get('type', 'expense'))
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def delete_category(family_id, body):
    cid = body.get('id')
    if not cid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT is_system FROM finance_categories WHERE id = '%s'" % safe(cid)
        )
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'Категория не найдена'})
        if row[0]:
            return respond(400, {'error': 'Системные категории нельзя удалять'})
        cur.execute(
            "UPDATE finance_transactions SET category_id = NULL WHERE category_id = '%s' AND family_id = '%s'"
            % (safe(cid), str(family_id))
        )
        cur.execute(
            "DELETE FROM finance_categories WHERE id = '%s' AND family_id = '%s'" % (safe(cid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


# === BUDGETS ===

def get_budgets(family_id, params):
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        month = params.get('month', '')

        where = "fb.family_id = '%s'" % fid
        if month:
            where += " AND to_char(fb.budget_month, 'YYYY-MM') = '%s'" % safe(month)
        else:
            where += " AND date_trunc('month', fb.budget_month) = date_trunc('month', CURRENT_DATE)"

        cur.execute("""
            SELECT fb.id, fb.category_id, fb.budget_month, fb.planned_amount,
                   fc.name, fc.icon, fc.color,
                   COALESCE((
                       SELECT SUM(ft.amount)
                       FROM finance_transactions ft
                       WHERE ft.family_id = '%s'
                         AND ft.category_id = fb.category_id
                         AND ft.transaction_type = 'expense'
                         AND date_trunc('month', ft.transaction_date) = date_trunc('month', fb.budget_month)
                   ), 0) as spent
            FROM finance_budgets fb
            LEFT JOIN finance_categories fc ON fb.category_id = fc.id
            WHERE %s
            ORDER BY fc.sort_order
        """ % (fid, where))

        items = [
            {
                'id': str(r[0]), 'category_id': str(r[1]) if r[1] else None,
                'month': str(r[2]), 'planned': float(r[3]),
                'category_name': r[4], 'category_icon': r[5], 'category_color': r[6],
                'spent': float(r[7])
            }
            for r in cur.fetchall()
        ]

        total_planned = sum(i['planned'] for i in items)
        total_spent = sum(i['spent'] for i in items)

        return respond(200, {
            'budgets': items,
            'total_planned': total_planned,
            'total_spent': total_spent
        })
    finally:
        conn.close()


def set_budget(family_id, body):
    category_id = body.get('category_id')
    planned = body.get('planned_amount')
    month = body.get('month')
    if not category_id or not planned or not month:
        return respond(400, {'error': 'Укажите category_id, planned_amount и month'})

    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)

        cur.execute("""
            SELECT id FROM finance_budgets
            WHERE family_id = '%s' AND category_id = '%s'
              AND to_char(budget_month, 'YYYY-MM') = '%s'
        """ % (fid, safe(category_id), safe(month)))
        existing = cur.fetchone()

        if existing:
            cur.execute(
                "UPDATE finance_budgets SET planned_amount = %s, updated_at = NOW() WHERE id = '%s'"
                % (float(planned), str(existing[0]))
            )
            bid = str(existing[0])
        else:
            cur.execute("""
                INSERT INTO finance_budgets (family_id, category_id, budget_month, planned_amount)
                VALUES ('%s', '%s', '%s-01', %s) RETURNING id
            """ % (fid, safe(category_id), safe(month), float(planned)))
            bid = str(cur.fetchone()[0])

        conn.commit()
        return respond(200, {'id': bid, 'success': True})
    finally:
        conn.close()


def delete_budget(family_id, body):
    bid = body.get('id')
    if not bid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM finance_budgets WHERE id = '%s' AND family_id = '%s'" % (safe(bid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


# === DEBTS ===

def get_debts(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, debt_type, name, creditor, original_amount, remaining_amount,
                   interest_rate, monthly_payment, next_payment_date, start_date, end_date,
                   status, notes, account_id
            FROM finance_debts
            WHERE family_id = '%s'
            ORDER BY status, next_payment_date NULLS LAST
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'debt_type': r[1], 'name': r[2], 'creditor': r[3],
                'original_amount': float(r[4]), 'remaining_amount': float(r[5]),
                'interest_rate': float(r[6]) if r[6] else 0,
                'monthly_payment': float(r[7]) if r[7] else 0,
                'next_payment_date': str(r[8]) if r[8] else None,
                'start_date': str(r[9]) if r[9] else None,
                'end_date': str(r[10]) if r[10] else None,
                'status': r[11], 'notes': r[12],
                'account_id': str(r[13]) if r[13] else None
            }
            for r in cur.fetchall()
        ]

        total_remaining = sum(i['remaining_amount'] for i in items if i['status'] == 'active')
        total_monthly = sum(i['monthly_payment'] for i in items if i['status'] == 'active')

        return respond(200, {
            'debts': items,
            'total_remaining': total_remaining,
            'total_monthly_payment': total_monthly
        })
    finally:
        conn.close()


def add_debt(family_id, body):
    name = body.get('name', '').strip()
    if not name:
        return respond(400, {'error': 'Укажите название'})
    original = body.get('original_amount')
    if not original or float(original) <= 0:
        return respond(400, {'error': 'Укажите сумму'})

    conn = get_db()
    try:
        cur = conn.cursor()
        remaining = body.get('remaining_amount', original)
        cur.execute("""
            INSERT INTO finance_debts
            (family_id, debt_type, name, creditor, original_amount, remaining_amount,
             interest_rate, monthly_payment, next_payment_date, start_date, end_date, notes, account_id)
            VALUES ('%s', '%s', '%s', '%s', %s, %s, %s, %s, %s, %s, %s, '%s', %s)
            RETURNING id
        """ % (
            str(family_id),
            safe(body.get('debt_type', 'credit')),
            safe(name),
            safe(body.get('creditor', '')),
            float(original),
            float(remaining),
            float(body.get('interest_rate', 0)),
            float(body.get('monthly_payment', 0)) if body.get('monthly_payment') else 'NULL',
            "'%s'" % safe(body['next_payment_date']) if body.get('next_payment_date') else 'NULL',
            "'%s'" % safe(body['start_date']) if body.get('start_date') else 'NULL',
            "'%s'" % safe(body['end_date']) if body.get('end_date') else 'NULL',
            safe(body.get('notes', '')),
            "'%s'" % safe(body['account_id']) if body.get('account_id') else 'NULL'
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def update_debt(family_id, body):
    did = body.get('id')
    if not did:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        sets = []
        if 'name' in body:
            sets.append("name = '%s'" % safe(body['name']))
        if 'creditor' in body:
            sets.append("creditor = '%s'" % safe(body['creditor']))
        if 'remaining_amount' in body:
            sets.append("remaining_amount = %s" % float(body['remaining_amount']))
        if 'monthly_payment' in body:
            sets.append("monthly_payment = %s" % float(body['monthly_payment']))
        if 'interest_rate' in body:
            sets.append("interest_rate = %s" % float(body['interest_rate']))
        if 'next_payment_date' in body:
            sets.append("next_payment_date = '%s'" % safe(body['next_payment_date']))
        if 'status' in body:
            sets.append("status = '%s'" % safe(body['status']))
        if 'notes' in body:
            sets.append("notes = '%s'" % safe(body['notes']))
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        sets.append("updated_at = NOW()")
        cur.execute(
            "UPDATE finance_debts SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(did), fid)
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def delete_debt(family_id, body):
    did = body.get('id')
    if not did:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM finance_debt_payments WHERE debt_id = '%s'" % safe(did)
        )
        cur.execute(
            "DELETE FROM finance_debts WHERE id = '%s' AND family_id = '%s'" % (safe(did), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def get_debt_payments(params):
    debt_id = params.get('debt_id')
    if not debt_id:
        return respond(400, {'error': 'Укажите debt_id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, amount, payment_date, is_extra, notes
            FROM finance_debt_payments
            WHERE debt_id = '%s'
            ORDER BY payment_date DESC
        """ % safe(debt_id))
        items = [
            {
                'id': str(r[0]), 'amount': float(r[1]),
                'date': str(r[2]), 'is_extra': r[3], 'notes': r[4]
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'payments': items})
    finally:
        conn.close()


def add_debt_payment(family_id, body):
    debt_id = body.get('debt_id')
    amount = body.get('amount')
    if not debt_id or not amount or float(amount) <= 0:
        return respond(400, {'error': 'Укажите debt_id и amount'})

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT remaining_amount FROM finance_debts WHERE id = '%s' AND family_id = '%s'"
            % (safe(debt_id), str(family_id))
        )
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'Долг не найден'})

        amt = float(amount)
        cur.execute("""
            INSERT INTO finance_debt_payments (debt_id, amount, payment_date, is_extra, notes)
            VALUES ('%s', %s, '%s', %s, '%s') RETURNING id
        """ % (
            safe(debt_id), amt,
            safe(body.get('date', '')),
            body.get('is_extra', False),
            safe(body.get('notes', ''))
        ))
        pid = str(cur.fetchone()[0])

        new_remaining = max(0, float(row[0]) - amt)
        status_update = ", status = 'paid'" if new_remaining <= 0 else ""
        cur.execute(
            "UPDATE finance_debts SET remaining_amount = %s%s, updated_at = NOW() WHERE id = '%s'"
            % (new_remaining, status_update, safe(debt_id))
        )
        conn.commit()
        return respond(201, {'id': pid, 'new_remaining': new_remaining, 'success': True})
    finally:
        conn.close()


# === ACCOUNTS ===

def get_accounts(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, account_type, bank_name, card_number_last4, balance,
                   currency, color, icon, is_active, created_by
            FROM finance_accounts
            WHERE family_id = '%s'
            ORDER BY is_active DESC, name
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'name': r[1], 'account_type': r[2],
                'bank_name': r[3], 'last4': r[4], 'balance': float(r[5]),
                'currency': r[6], 'color': r[7], 'icon': r[8],
                'is_active': r[9], 'created_by': str(r[10]) if r[10] else None
            }
            for r in cur.fetchall()
        ]
        total = sum(i['balance'] for i in items if i['is_active'])
        return respond(200, {'accounts': items, 'total_balance': total})
    finally:
        conn.close()


def add_account(user_id, family_id, body):
    name = body.get('name', '').strip()
    if not name:
        return respond(400, {'error': 'Укажите название'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO finance_accounts
            (family_id, name, account_type, bank_name, card_number_last4, balance, currency, color, icon, created_by)
            VALUES ('%s', '%s', '%s', '%s', '%s', %s, '%s', '%s', '%s', '%s')
            RETURNING id
        """ % (
            str(family_id), safe(name),
            safe(body.get('account_type', 'card')),
            safe(body.get('bank_name', '')),
            safe(body.get('last4', '')),
            float(body.get('balance', 0)),
            safe(body.get('currency', 'RUB')),
            safe(body.get('color', '#3B82F6')),
            safe(body.get('icon', 'CreditCard')),
            str(user_id)
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def update_account(family_id, body):
    aid = body.get('id')
    if not aid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        sets = []
        if 'name' in body:
            sets.append("name = '%s'" % safe(body['name']))
        if 'bank_name' in body:
            sets.append("bank_name = '%s'" % safe(body['bank_name']))
        if 'balance' in body:
            sets.append("balance = %s" % float(body['balance']))
        if 'color' in body:
            sets.append("color = '%s'" % safe(body['color']))
        if 'icon' in body:
            sets.append("icon = '%s'" % safe(body['icon']))
        if 'is_active' in body:
            sets.append("is_active = %s" % body['is_active'])
        if 'last4' in body:
            sets.append("card_number_last4 = '%s'" % safe(body['last4']))
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        sets.append("updated_at = NOW()")
        cur.execute(
            "UPDATE finance_accounts SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(aid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def delete_account(family_id, body):
    aid = body.get('id')
    if not aid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE finance_transactions SET account_id = NULL WHERE account_id = '%s' AND family_id = '%s'"
            % (safe(aid), str(family_id))
        )
        cur.execute(
            "DELETE FROM finance_accounts WHERE id = '%s' AND family_id = '%s'" % (safe(aid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


# === GOALS ===

def get_goals(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, target_amount, current_amount, target_date,
                   icon, color, status, account_id
            FROM finance_goals
            WHERE family_id = '%s'
            ORDER BY status, target_date NULLS LAST
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'name': r[1],
                'target_amount': float(r[2]), 'current_amount': float(r[3]),
                'target_date': str(r[4]) if r[4] else None,
                'icon': r[5], 'color': r[6], 'status': r[7],
                'account_id': str(r[8]) if r[8] else None,
                'progress': round(float(r[3]) / float(r[2]) * 100, 1) if float(r[2]) > 0 else 0
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'goals': items})
    finally:
        conn.close()


def add_goal(family_id, body):
    name = body.get('name', '').strip()
    target = body.get('target_amount')
    if not name or not target or float(target) <= 0:
        return respond(400, {'error': 'Укажите название и целевую сумму'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO finance_goals
            (family_id, name, target_amount, current_amount, target_date, icon, color, account_id)
            VALUES ('%s', '%s', %s, %s, %s, '%s', '%s', %s)
            RETURNING id
        """ % (
            str(family_id), safe(name), float(target),
            float(body.get('current_amount', 0)),
            "'%s'" % safe(body['target_date']) if body.get('target_date') else 'NULL',
            safe(body.get('icon', 'Target')),
            safe(body.get('color', '#3B82F6')),
            "'%s'" % safe(body['account_id']) if body.get('account_id') else 'NULL'
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def update_goal(family_id, body):
    gid = body.get('id')
    if not gid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        sets = []
        if 'name' in body:
            sets.append("name = '%s'" % safe(body['name']))
        if 'target_amount' in body:
            sets.append("target_amount = %s" % float(body['target_amount']))
        if 'current_amount' in body:
            sets.append("current_amount = %s" % float(body['current_amount']))
        if 'target_date' in body:
            sets.append("target_date = '%s'" % safe(body['target_date']))
        if 'icon' in body:
            sets.append("icon = '%s'" % safe(body['icon']))
        if 'color' in body:
            sets.append("color = '%s'" % safe(body['color']))
        if 'status' in body:
            sets.append("status = '%s'" % safe(body['status']))
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        sets.append("updated_at = NOW()")
        cur.execute(
            "UPDATE finance_goals SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(gid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def delete_goal(family_id, body):
    gid = body.get('id')
    if not gid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM finance_goals WHERE id = '%s' AND family_id = '%s'" % (safe(gid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def contribute_goal(family_id, body):
    gid = body.get('id')
    amount = body.get('amount')
    if not gid or not amount or float(amount) <= 0:
        return respond(400, {'error': 'Укажите id и amount'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT current_amount, target_amount FROM finance_goals WHERE id = '%s' AND family_id = '%s'"
            % (safe(gid), str(family_id))
        )
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'Цель не найдена'})

        new_current = float(row[0]) + float(amount)
        status_update = ", status = 'completed'" if new_current >= float(row[1]) else ""
        cur.execute(
            "UPDATE finance_goals SET current_amount = %s%s, updated_at = NOW() WHERE id = '%s'"
            % (new_current, status_update, safe(gid))
        )
        conn.commit()
        return respond(200, {
            'success': True,
            'new_current': new_current,
            'progress': round(new_current / float(row[1]) * 100, 1) if float(row[1]) > 0 else 100
        })
    finally:
        conn.close()


# === RECURRING ===

def get_recurring(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT fr.id, fr.amount, fr.transaction_type, fr.description, fr.frequency,
                   fr.day_of_month, fr.next_date, fr.is_active, fr.member_id,
                   fc.name as cat_name, fc.icon as cat_icon, fc.color as cat_color,
                   fa.name as acc_name
            FROM finance_recurring fr
            LEFT JOIN finance_categories fc ON fr.category_id = fc.id
            LEFT JOIN finance_accounts fa ON fr.account_id = fa.id
            WHERE fr.family_id = '%s'
            ORDER BY fr.is_active DESC, fr.next_date
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'amount': float(r[1]), 'type': r[2],
                'description': r[3], 'frequency': r[4],
                'day_of_month': r[5], 'next_date': str(r[6]) if r[6] else None,
                'is_active': r[7], 'member_id': str(r[8]) if r[8] else None,
                'category_name': r[9], 'category_icon': r[10], 'category_color': r[11],
                'account_name': r[12]
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'recurring': items})
    finally:
        conn.close()


def add_recurring(family_id, body):
    amount = body.get('amount')
    if not amount or float(amount) <= 0:
        return respond(400, {'error': 'Укажите сумму'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO finance_recurring
            (family_id, account_id, category_id, amount, transaction_type, description, frequency, day_of_month, next_date, member_id)
            VALUES ('%s', %s, %s, %s, '%s', '%s', '%s', %s, '%s', %s)
            RETURNING id
        """ % (
            str(family_id),
            "'%s'" % safe(body['account_id']) if body.get('account_id') else 'NULL',
            "'%s'" % safe(body['category_id']) if body.get('category_id') else 'NULL',
            float(amount),
            safe(body.get('type', 'expense')),
            safe(body.get('description', '')),
            safe(body.get('frequency', 'monthly')),
            int(body['day_of_month']) if body.get('day_of_month') else 'NULL',
            safe(body.get('next_date', '')),
            "'%s'" % safe(body['member_id']) if body.get('member_id') else 'NULL'
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def update_recurring(family_id, body):
    rid = body.get('id')
    if not rid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        sets = []
        if 'amount' in body:
            sets.append("amount = %s" % float(body['amount']))
        if 'description' in body:
            sets.append("description = '%s'" % safe(body['description']))
        if 'frequency' in body:
            sets.append("frequency = '%s'" % safe(body['frequency']))
        if 'is_active' in body:
            sets.append("is_active = %s" % body['is_active'])
        if 'next_date' in body:
            sets.append("next_date = '%s'" % safe(body['next_date']))
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        cur.execute(
            "UPDATE finance_recurring SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(rid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def delete_recurring(family_id, body):
    rid = body.get('id')
    if not rid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM finance_recurring WHERE id = '%s' AND family_id = '%s'" % (safe(rid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


# === FINANCIAL EDUCATION ===

def get_edu_courses():
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT c.id, c.title, c.description, c.age_group, c.difficulty,
                   c.icon, c.color, c.lessons_count,
                   (SELECT COUNT(*) FROM fin_edu_tests t WHERE t.course_id = c.id) as tests_count
            FROM fin_edu_courses c
            WHERE c.is_published = true
            ORDER BY c.sort_order
        """)
        items = [
            {
                'id': str(r[0]), 'title': r[1], 'description': r[2],
                'age_group': r[3], 'difficulty': r[4],
                'icon': r[5], 'color': r[6],
                'lessons_count': r[7], 'tests_count': r[8]
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'courses': items})
    finally:
        conn.close()


def get_edu_course(params):
    cid = params.get('course_id')
    if not cid:
        return respond(400, {'error': 'Укажите course_id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, title, description, age_group, difficulty, icon, color, lessons_count "
            "FROM fin_edu_courses WHERE id = '%s'" % safe(cid)
        )
        c = cur.fetchone()
        if not c:
            return respond(404, {'error': 'Курс не найден'})

        cur.execute("""
            SELECT id, title, summary, sort_order, duration_minutes
            FROM fin_edu_lessons WHERE course_id = '%s' ORDER BY sort_order
        """ % safe(cid))
        lessons = [
            {'id': str(r[0]), 'title': r[1], 'summary': r[2], 'sort_order': r[3], 'duration': r[4]}
            for r in cur.fetchall()
        ]

        cur.execute("""
            SELECT id, title, description, pass_threshold, time_limit_minutes
            FROM fin_edu_tests WHERE course_id = '%s' ORDER BY title
        """ % safe(cid))
        tests = [
            {'id': str(r[0]), 'title': r[1], 'description': r[2], 'pass_threshold': r[3], 'time_limit': r[4]}
            for r in cur.fetchall()
        ]

        return respond(200, {
            'course': {
                'id': str(c[0]), 'title': c[1], 'description': c[2],
                'age_group': c[3], 'difficulty': c[4], 'icon': c[5], 'color': c[6]
            },
            'lessons': lessons,
            'tests': tests
        })
    finally:
        conn.close()


def get_edu_lesson(params):
    lid = params.get('lesson_id')
    if not lid:
        return respond(400, {'error': 'Укажите lesson_id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, course_id, title, content, summary, sort_order, duration_minutes "
            "FROM fin_edu_lessons WHERE id = '%s'" % safe(lid)
        )
        r = cur.fetchone()
        if not r:
            return respond(404, {'error': 'Урок не найден'})
        return respond(200, {
            'lesson': {
                'id': str(r[0]), 'course_id': str(r[1]), 'title': r[2],
                'content': r[3], 'summary': r[4], 'sort_order': r[5], 'duration': r[6]
            }
        })
    finally:
        conn.close()


def get_edu_test(params):
    tid = params.get('test_id')
    if not tid:
        return respond(400, {'error': 'Укажите test_id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, title, description, pass_threshold, time_limit_minutes "
            "FROM fin_edu_tests WHERE id = '%s'" % safe(tid)
        )
        t = cur.fetchone()
        if not t:
            return respond(404, {'error': 'Тест не найден'})

        cur.execute("""
            SELECT id, question_text, question_type, options, correct_answer, explanation, points
            FROM fin_edu_questions WHERE test_id = '%s' ORDER BY sort_order
        """ % safe(tid))
        questions = [
            {
                'id': str(r[0]), 'text': r[1], 'type': r[2],
                'options': r[3] if isinstance(r[3], list) else json.loads(r[3]) if r[3] else [],
                'correct': r[4] if isinstance(r[4], (dict, list)) else json.loads(r[4]) if r[4] else None,
                'explanation': r[5], 'points': r[6]
            }
            for r in cur.fetchall()
        ]

        return respond(200, {
            'test': {
                'id': str(t[0]), 'title': t[1], 'description': t[2],
                'pass_threshold': t[3], 'time_limit': t[4]
            },
            'questions': questions
        })
    finally:
        conn.close()


def get_edu_progress(family_id, user_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        uid = str(user_id)

        cur.execute("""
            SELECT lesson_id, completed, completed_at
            FROM fin_edu_progress
            WHERE family_id = '%s' AND member_id = '%s'
        """ % (fid, uid))
        lessons_progress = [
            {'lesson_id': str(r[0]), 'completed': r[1], 'completed_at': str(r[2]) if r[2] else None}
            for r in cur.fetchall()
        ]

        cur.execute("""
            SELECT test_id, score, max_score, passed, completed_at
            FROM fin_edu_test_results
            WHERE family_id = '%s' AND member_id = '%s'
            ORDER BY completed_at DESC
        """ % (fid, uid))
        test_results = [
            {'test_id': str(r[0]), 'score': r[1], 'max_score': r[2], 'passed': r[3], 'completed_at': str(r[4]) if r[4] else None}
            for r in cur.fetchall()
        ]

        return respond(200, {
            'lessons_progress': lessons_progress,
            'test_results': test_results
        })
    finally:
        conn.close()


def get_edu_assignments(family_id, user_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        cur.execute("""
            SELECT a.id, a.assigned_by, a.assigned_to, a.course_id, a.lesson_id, a.test_id,
                   a.deadline, a.status, a.message, a.created_at,
                   c.title as course_title,
                   u1.name as assigned_by_name, u2.name as assigned_to_name
            FROM fin_edu_assignments a
            LEFT JOIN fin_edu_courses c ON a.course_id = c.id
            LEFT JOIN users u1 ON a.assigned_by = u1.id
            LEFT JOIN users u2 ON a.assigned_to = u2.id
            WHERE a.family_id = '%s'
            ORDER BY a.created_at DESC
        """ % fid)
        items = [
            {
                'id': str(r[0]),
                'assigned_by': str(r[1]), 'assigned_to': str(r[2]),
                'course_id': str(r[3]) if r[3] else None,
                'lesson_id': str(r[4]) if r[4] else None,
                'test_id': str(r[5]) if r[5] else None,
                'deadline': str(r[6]) if r[6] else None,
                'status': r[7], 'message': r[8],
                'created_at': str(r[9]),
                'course_title': r[10],
                'assigned_by_name': r[11], 'assigned_to_name': r[12]
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'assignments': items})
    finally:
        conn.close()


def complete_lesson(family_id, user_id, body):
    lid = body.get('lesson_id')
    if not lid:
        return respond(400, {'error': 'Укажите lesson_id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        uid = str(user_id)
        cur.execute("""
            SELECT id FROM fin_edu_progress
            WHERE family_id = '%s' AND member_id = '%s' AND lesson_id = '%s'
        """ % (fid, uid, safe(lid)))
        existing = cur.fetchone()
        if existing:
            cur.execute(
                "UPDATE fin_edu_progress SET completed = true, completed_at = NOW() WHERE id = '%s'"
                % str(existing[0])
            )
        else:
            cur.execute("""
                INSERT INTO fin_edu_progress (family_id, member_id, lesson_id, completed, completed_at)
                VALUES ('%s', '%s', '%s', true, NOW())
            """ % (fid, uid, safe(lid)))
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def submit_test(family_id, user_id, body):
    tid = body.get('test_id')
    answers = body.get('answers', {})
    if not tid:
        return respond(400, {'error': 'Укажите test_id'})

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, correct_answer, points FROM fin_edu_questions WHERE test_id = '%s' ORDER BY sort_order"
            % safe(tid)
        )
        questions = cur.fetchall()
        if not questions:
            return respond(404, {'error': 'Вопросы не найдены'})

        score = 0
        max_score = 0
        for q in questions:
            qid = str(q[0])
            correct = q[1]
            points = q[2] or 1
            max_score += points
            user_answer = answers.get(qid)
            if isinstance(correct, str):
                try:
                    correct = json.loads(correct)
                except:
                    pass
            if user_answer is not None and str(user_answer) == str(correct):
                score += points

        cur.execute(
            "SELECT pass_threshold FROM fin_edu_tests WHERE id = '%s'" % safe(tid)
        )
        test_row = cur.fetchone()
        threshold = test_row[0] if test_row else 70
        pct = (score / max_score * 100) if max_score > 0 else 0
        passed = pct >= threshold

        answers_json = json.dumps(answers, ensure_ascii=False).replace("'", "''")
        cur.execute("""
            INSERT INTO fin_edu_test_results
            (family_id, member_id, test_id, score, max_score, passed, answers, completed_at)
            VALUES ('%s', '%s', '%s', %d, %d, %s, '%s', NOW())
            RETURNING id
        """ % (
            str(family_id), str(user_id), safe(tid),
            score, max_score, passed, answers_json
        ))
        rid = str(cur.fetchone()[0])
        conn.commit()

        return respond(200, {
            'id': rid, 'score': score, 'max_score': max_score,
            'percentage': round(pct, 1), 'passed': passed
        })
    finally:
        conn.close()


def assign_edu(family_id, user_id, body):
    assigned_to = body.get('assigned_to')
    if not assigned_to:
        return respond(400, {'error': 'Укажите assigned_to'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO fin_edu_assignments
            (family_id, assigned_by, assigned_to, course_id, lesson_id, test_id, deadline, message)
            VALUES ('%s', '%s', '%s', %s, %s, %s, %s, '%s')
            RETURNING id
        """ % (
            str(family_id), str(user_id), safe(assigned_to),
            "'%s'" % safe(body['course_id']) if body.get('course_id') else 'NULL',
            "'%s'" % safe(body['lesson_id']) if body.get('lesson_id') else 'NULL',
            "'%s'" % safe(body['test_id']) if body.get('test_id') else 'NULL',
            "'%s'" % safe(body['deadline']) if body.get('deadline') else 'NULL',
            safe(body.get('message', ''))
        ))
        aid = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': aid, 'success': True})
    finally:
        conn.close()


def update_assignment(family_id, body):
    aid = body.get('id')
    status = body.get('status')
    if not aid or not status:
        return respond(400, {'error': 'Укажите id и status'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE fin_edu_assignments SET status = '%s', updated_at = NOW() WHERE id = '%s' AND family_id = '%s'"
            % (safe(status), safe(aid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()