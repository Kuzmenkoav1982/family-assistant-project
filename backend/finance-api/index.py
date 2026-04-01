"""Финансовый API: транзакции, бюджеты, долги, счета, цели, категории, имущество"""

import json
import os
import psycopg2
import urllib.request


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


OWNER_ONLY_SECTIONS = {'budgets', 'debts', 'debt_payments', 'accounts', 'recurring', 'assets', 'dashboard', 'transactions', 'categories', 'financial_analysis'}
OWNER_ONLY_ACTIONS = {
    'add_transaction', 'delete_transaction', 'update_transaction', 'confirm_planned',
    'add_category', 'delete_category',
    'set_budget', 'delete_budget',
    'add_debt', 'update_debt', 'delete_debt', 'add_debt_payment',
    'add_account', 'update_account', 'delete_account',
    'add_recurring', 'update_recurring', 'delete_recurring',
    'add_asset', 'update_asset', 'delete_asset',
    'ai_advice', 'ai_smart_advice',
}


def get_user_and_family(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None, None, None
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT s.user_id FROM sessions s WHERE s.token = '%s' AND s.expires_at > NOW()"
            % token.replace("'", "''")
        )
        row = cur.fetchone()
        if not row:
            return None, None, None
        user_id = row[0]
        cur.execute(
            "SELECT family_id, access_role FROM family_members WHERE user_id = '%s' LIMIT 1"
            % str(user_id)
        )
        fm = cur.fetchone()
        if not fm:
            return user_id, None, None
        family_id = fm[0]
        access_role = fm[1] or 'viewer'
        return user_id, family_id, access_role
    finally:
        conn.close()


def is_owner(access_role):
    return access_role in ('admin', 'parent')


def handler(event, context):
    """Финансовый API семьи: транзакции, бюджеты, долги, счета, цели"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    user_id, family_id, access_role = get_user_and_family(event)
    if not user_id:
        return respond(401, {'error': 'Не авторизован'})
    if not family_id:
        return respond(400, {'error': 'Семья не найдена'})

    params = event.get('queryStringParameters') or {}
    section = params.get('section', '')

    if method == 'GET':
        if section in OWNER_ONLY_SECTIONS and not is_owner(access_role):
            return respond(403, {'error': 'Этот раздел доступен только владельцу семьи'})
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
        elif section == 'assets':
            return get_assets(family_id)
        elif section == 'financial_analysis':
            return get_financial_analysis(family_id, params)
        elif section == 'loyalty_cards':
            return get_loyalty_cards(family_id)

    if method == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        action = body.get('action', '')

        if action in OWNER_ONLY_ACTIONS and not is_owner(access_role):
            return respond(403, {'error': 'Это действие доступно только владельцу семьи'})

        if action == 'add_transaction':
            return add_transaction(user_id, family_id, body)
        elif action == 'delete_transaction':
            return delete_transaction(family_id, body)
        elif action == 'update_transaction':
            return update_transaction(family_id, body)
        elif action == 'confirm_planned':
            return confirm_planned(user_id, family_id, body)
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
        elif action == 'ai_advice':
            return ai_advice(family_id, body)
        elif action == 'ai_smart_advice':
            return ai_smart_advice(family_id, body)
        elif action == 'add_asset':
            return add_asset(family_id, body)
        elif action == 'update_asset':
            return update_asset(family_id, body)
        elif action == 'delete_asset':
            return delete_asset(family_id, body)
        elif action == 'add_loyalty_card':
            return add_loyalty_card(family_id, body)
        elif action == 'update_loyalty_card':
            return update_loyalty_card(family_id, body)
        elif action == 'delete_loyalty_card':
            return delete_loyalty_card(family_id, body)

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

        planned = []
        plan_income = 0
        plan_expense = 0
        if month:
            year_m = safe(month)
            yr, mo = year_m.split('-')
            mo = int(mo)

            cur.execute("""
                SELECT fr.id, fr.amount, fr.transaction_type, fr.description,
                       fr.day_of_month, fr.frequency,
                       fc.name, fc.icon, fc.color, fa.name
                FROM finance_recurring fr
                LEFT JOIN finance_categories fc ON fr.category_id = fc.id
                LEFT JOIN finance_accounts fa ON fr.account_id = fa.id
                WHERE fr.family_id = '%s' AND fr.is_active = true
            """ % fid)
            for r in cur.fetchall():
                freq = r[5] or 'monthly'
                include = False
                if freq == 'monthly':
                    include = True
                elif freq == 'weekly':
                    include = True
                elif freq == 'quarterly' and mo in (1, 4, 7, 10):
                    include = True
                elif freq == 'yearly' and mo == 1:
                    include = True
                if not include:
                    continue
                day = r[4] or 1
                if day > 28:
                    day = 28
                plan_date = '%s-%02d-%02d' % (yr, mo, day)
                already = any(
                    t['is_recurring'] and t['description'] == r[3]
                    and abs(t['amount'] - float(r[1])) < 0.01
                    for t in items
                )
                if already:
                    continue
                amt = float(r[1])
                p = {
                    'id': 'recurring_' + str(r[0]),
                    'source_id': str(r[0]),
                    'source': 'recurring',
                    'amount': amt,
                    'type': r[2],
                    'description': r[3] or '',
                    'date': plan_date,
                    'is_planned': True,
                    'category_name': r[6], 'category_icon': r[7], 'category_color': r[8],
                    'account_name': r[9]
                }
                planned.append(p)
                if r[2] == 'income':
                    plan_income += amt
                else:
                    plan_expense += amt

            cur.execute("""
                SELECT id, name, monthly_payment, debt_type, bank_name, next_payment_date
                FROM finance_debts
                WHERE family_id = '%s' AND status = 'active' AND show_in_budget = true
                  AND monthly_payment IS NOT NULL AND monthly_payment > 0
            """ % fid)
            for r in cur.fetchall():
                day = 15
                if r[5]:
                    try:
                        day = int(str(r[5]).split('-')[2])
                    except Exception:
                        pass
                if day > 28:
                    day = 28
                plan_date = '%s-%02d-%02d' % (yr, mo, day)
                amt = float(r[2])
                desc = r[1] or 'Платёж по долгу'
                already = any(
                    t['description'] == desc and abs(t['amount'] - amt) < 0.01
                    for t in items
                )
                if already:
                    continue
                p = {
                    'id': 'debt_' + str(r[0]),
                    'source_id': str(r[0]),
                    'source': 'debt',
                    'amount': amt,
                    'type': 'expense',
                    'description': desc,
                    'date': plan_date,
                    'is_planned': True,
                    'debt_type': r[3],
                    'bank_name': r[4],
                    'category_name': None, 'category_icon': None, 'category_color': None,
                    'account_name': None
                }
                planned.append(p)
                plan_expense += amt

        return respond(200, {
            'transactions': items,
            'planned': planned,
            'total': total,
            'sum_income': float(sr[0]),
            'sum_expense': float(sr[1]),
            'plan_income': plan_income,
            'plan_expense': plan_expense
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


def confirm_planned(user_id, family_id, body):
    """Подтвердить запланированную операцию — создать реальную транзакцию"""
    source = body.get('source', '')
    source_id = body.get('source_id', '')
    amount = body.get('amount')
    tx_type = body.get('type', 'expense')
    description = body.get('description', '')
    date = body.get('date', '')

    if not amount or float(amount) <= 0:
        return respond(400, {'error': 'Сумма должна быть больше 0'})

    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        cat_id = 'NULL'
        acc_id = 'NULL'
        is_recurring = 'false'
        recurring_id = 'NULL'

        if source == 'recurring' and source_id:
            cur.execute(
                "SELECT category_id, account_id FROM finance_recurring WHERE id = '%s' AND family_id = '%s'"
                % (safe(source_id), fid)
            )
            rr = cur.fetchone()
            if rr:
                if rr[0]:
                    cat_id = "'%s'" % str(rr[0])
                if rr[1]:
                    acc_id = "'%s'" % str(rr[1])
            is_recurring = 'true'
            recurring_id = "'%s'" % safe(source_id)

        cur.execute("""
            INSERT INTO finance_transactions
            (family_id, account_id, category_id, amount, transaction_type, description, transaction_date, member_id, is_recurring, recurring_id)
            VALUES ('%s', %s, %s, %s, '%s', '%s', '%s', NULL, %s, %s)
            RETURNING id
        """ % (
            fid, acc_id, cat_id, float(amount),
            safe(tx_type), safe(description), safe(date),
            is_recurring, recurring_id
        ))
        new_id = str(cur.fetchone()[0])

        if acc_id != 'NULL':
            sign = 1 if tx_type == 'income' else -1
            cur.execute(
                "UPDATE finance_accounts SET balance = balance + %s, updated_at = NOW() WHERE id = %s AND family_id = '%s'"
                % (float(amount) * sign, acc_id, fid)
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


def update_transaction(family_id, body):
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
        old = cur.fetchone()
        if not old:
            return respond(404, {'error': 'Транзакция не найдена'})
        sets = []
        if 'amount' in body:
            sets.append("amount = %s" % float(body['amount']))
        if 'description' in body:
            sets.append("description = '%s'" % safe(body['description']))
        if 'category_id' in body:
            if body['category_id']:
                sets.append("category_id = '%s'" % safe(body['category_id']))
            else:
                sets.append("category_id = NULL")
        if 'date' in body:
            sets.append("transaction_date = '%s'" % safe(body['date']))
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        sets.append("updated_at = NOW()")
        cur.execute(
            "UPDATE finance_transactions SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(tid), fid)
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
                   status, notes, account_id,
                   credit_limit, grace_period_days, grace_period_end, grace_amount,
                   min_payment_pct, bank_name, show_in_budget
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
                'account_id': str(r[13]) if r[13] else None,
                'credit_limit': float(r[14]) if r[14] else None,
                'grace_period_days': int(r[15]) if r[15] else None,
                'grace_period_end': str(r[16]) if r[16] else None,
                'grace_amount': float(r[17]) if r[17] else None,
                'min_payment_pct': float(r[18]) if r[18] else None,
                'bank_name': r[19],
                'show_in_budget': r[20]
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


def clamp_numeric(val, max_digits=13, scale=2):
    if val is None:
        return None
    v = float(val)
    max_val = 10 ** (max_digits - scale) - 10 ** (-scale)
    if v > max_val:
        return max_val
    if v < -max_val:
        return -max_val
    return round(v, scale)


def clamp_pct(val):
    if val is None:
        return None
    v = float(val)
    if v < 0:
        return 0.0
    if v > 999.99:
        return 999.99
    return round(v, 2)


def add_debt(family_id, body):
    name = body.get('name', '').strip()
    if not name:
        return respond(400, {'error': 'Укажите название'})
    original = body.get('original_amount')
    if not original or float(original) <= 0:
        return respond(400, {'error': 'Укажите сумму'})

    interest_rate = clamp_pct(body.get('interest_rate', 0))
    min_payment_pct = clamp_pct(body.get('min_payment_pct')) if body.get('min_payment_pct') else None

    conn = get_db()
    try:
        cur = conn.cursor()
        remaining = body.get('remaining_amount', original)
        cur.execute("""
            INSERT INTO finance_debts
            (family_id, debt_type, name, creditor, original_amount, remaining_amount,
             interest_rate, monthly_payment, next_payment_date, start_date, end_date, notes, account_id,
             credit_limit, grace_period_days, grace_period_end, grace_amount, min_payment_pct, bank_name)
            VALUES ('%s', '%s', '%s', '%s', %s, %s, %s, %s, %s, %s, %s, '%s', %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """ % (
            str(family_id),
            safe(body.get('debt_type', 'credit')),
            safe(name),
            safe(body.get('creditor', '')),
            clamp_numeric(original),
            clamp_numeric(remaining),
            interest_rate,
            clamp_numeric(body.get('monthly_payment', 0)) if body.get('monthly_payment') else 'NULL',
            "'%s'" % safe(body['next_payment_date']) if body.get('next_payment_date') else 'NULL',
            "'%s'" % safe(body['start_date']) if body.get('start_date') else 'NULL',
            "'%s'" % safe(body['end_date']) if body.get('end_date') else 'NULL',
            safe(body.get('notes', '')),
            "'%s'" % safe(body['account_id']) if body.get('account_id') else 'NULL',
            clamp_numeric(body['credit_limit']) if body.get('credit_limit') else 'NULL',
            int(body['grace_period_days']) if body.get('grace_period_days') else 'NULL',
            "'%s'" % safe(body['grace_period_end']) if body.get('grace_period_end') else 'NULL',
            clamp_numeric(body['grace_amount']) if body.get('grace_amount') else 'NULL',
            min_payment_pct if min_payment_pct is not None else 'NULL',
            "'%s'" % safe(body['bank_name']) if body.get('bank_name') else 'NULL'
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
        if 'debt_type' in body:
            sets.append("debt_type = '%s'" % safe(body['debt_type']))
        if 'creditor' in body:
            sets.append("creditor = '%s'" % safe(body['creditor']))
        if 'original_amount' in body:
            sets.append("original_amount = %s" % (clamp_numeric(body['original_amount']) if body['original_amount'] else 'NULL'))
        if 'remaining_amount' in body:
            sets.append("remaining_amount = %s" % (clamp_numeric(body['remaining_amount']) if body['remaining_amount'] else 0))
        if 'monthly_payment' in body:
            sets.append("monthly_payment = %s" % (clamp_numeric(body['monthly_payment']) if body['monthly_payment'] else 'NULL'))
        if 'interest_rate' in body:
            sets.append("interest_rate = %s" % (clamp_pct(body['interest_rate']) if body['interest_rate'] else 0))
        if 'next_payment_date' in body:
            sets.append("next_payment_date = %s" % ("'%s'" % safe(body['next_payment_date']) if body['next_payment_date'] else 'NULL'))
        if 'start_date' in body:
            sets.append("start_date = %s" % ("'%s'" % safe(body['start_date']) if body['start_date'] else 'NULL'))
        if 'end_date' in body:
            sets.append("end_date = %s" % ("'%s'" % safe(body['end_date']) if body['end_date'] else 'NULL'))
        if 'status' in body:
            sets.append("status = '%s'" % safe(body['status']))
        if 'notes' in body:
            sets.append("notes = '%s'" % safe(body['notes']))
        if 'credit_limit' in body:
            sets.append("credit_limit = %s" % (clamp_numeric(body['credit_limit']) if body['credit_limit'] else 'NULL'))
        if 'grace_period_days' in body:
            sets.append("grace_period_days = %s" % (int(body['grace_period_days']) if body['grace_period_days'] else 'NULL'))
        if 'grace_period_end' in body:
            sets.append("grace_period_end = %s" % ("'%s'" % safe(body['grace_period_end']) if body['grace_period_end'] else 'NULL'))
        if 'grace_amount' in body:
            sets.append("grace_amount = %s" % (clamp_numeric(body['grace_amount']) if body['grace_amount'] else 'NULL'))
        if 'min_payment_pct' in body:
            sets.append("min_payment_pct = %s" % (clamp_pct(body['min_payment_pct']) if body['min_payment_pct'] else 'NULL'))
        if 'bank_name' in body:
            sets.append("bank_name = %s" % ("'%s'" % safe(body['bank_name']) if body['bank_name'] else 'NULL'))
        if 'show_in_budget' in body:
            sets.append("show_in_budget = %s" % ('true' if body['show_in_budget'] else 'false'))
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
                   fa.name as acc_name, fr.active_months, fr.category_id
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
                'account_name': r[12],
                'active_months': r[13] if r[13] else None,
                'category_id': str(r[14]) if r[14] else None
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
    active_months = body.get('active_months')
    active_months_sql = 'NULL'
    if active_months and isinstance(active_months, list) and len(active_months) > 0:
        months_ints = [str(int(m)) for m in active_months if 1 <= int(m) <= 12]
        if months_ints:
            active_months_sql = "ARRAY[%s]::integer[]" % ','.join(months_ints)
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO finance_recurring
            (family_id, account_id, category_id, amount, transaction_type, description, frequency, day_of_month, next_date, member_id, active_months)
            VALUES ('%s', %s, %s, %s, '%s', '%s', '%s', %s, '%s', %s, %s)
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
            "'%s'" % safe(body['member_id']) if body.get('member_id') else 'NULL',
            active_months_sql
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
        if 'day_of_month' in body:
            if body['day_of_month']:
                sets.append("day_of_month = %s" % int(body['day_of_month']))
            else:
                sets.append("day_of_month = NULL")
        if 'category_id' in body:
            if body['category_id']:
                sets.append("category_id = '%s'" % safe(body['category_id']))
            else:
                sets.append("category_id = NULL")
        if 'type' in body:
            sets.append("transaction_type = '%s'" % safe(body['type']))
        if 'active_months' in body:
            am = body['active_months']
            if am and isinstance(am, list) and len(am) > 0:
                months_ints = [str(int(m)) for m in am if 1 <= int(m) <= 12]
                if months_ints:
                    sets.append("active_months = ARRAY[%s]::integer[]" % ','.join(months_ints))
                else:
                    sets.append("active_months = NULL")
            else:
                sets.append("active_months = NULL")
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


# === FINANCIAL ANALYSIS ENGINE ===

def calc_payoff_schedule(remaining, rate, monthly, extra=0):
    """Calculate month-by-month payoff schedule"""
    if monthly + extra <= 0 or remaining <= 0:
        return []
    monthly_rate = rate / 100 / 12
    balance = remaining
    schedule = []
    total_interest = 0
    month = 0
    while balance > 0.01 and month < 600:
        interest = balance * monthly_rate
        payment = min(monthly + extra, balance + interest)
        principal = payment - interest
        if principal <= 0:
            break
        balance -= principal
        if balance < 0:
            balance = 0
        total_interest += interest
        month += 1
        schedule.append({
            'month': month,
            'payment': round(payment, 2),
            'principal': round(principal, 2),
            'interest': round(interest, 2),
            'balance': round(max(balance, 0), 2),
            'total_interest': round(total_interest, 2)
        })
    return schedule


def calc_strategy_avalanche(debts_data, free_money):
    """Avalanche: pay highest rate first"""
    if not debts_data or free_money <= 0:
        return None
    debts = sorted(debts_data, key=lambda d: -d['rate'])
    return _simulate_strategy(debts, free_money, 'avalanche')


def calc_strategy_snowball(debts_data, free_money):
    """Snowball: pay smallest balance first"""
    if not debts_data or free_money <= 0:
        return None
    debts = sorted(debts_data, key=lambda d: d['remaining'])
    return _simulate_strategy(debts, free_money, 'snowball')


def _simulate_strategy(sorted_debts, free_money, name):
    """Simulate debt payoff with strategy"""
    debts = []
    for d in sorted_debts:
        debts.append({
            'id': d['id'],
            'name': d['name'],
            'remaining': d['remaining'],
            'rate': d['rate'],
            'payment': d['payment'],
            'original_remaining': d['remaining']
        })

    total_min_payments = sum(d['payment'] for d in debts)
    extra_available = free_money
    
    timeline = []
    total_paid = 0
    total_interest = 0
    month = 0
    closed_debts = []
    
    while any(d['remaining'] > 0.01 for d in debts) and month < 600:
        month += 1
        month_extra = extra_available
        freed_payments = 0
        
        for d in debts:
            if d['remaining'] <= 0.01:
                continue
            monthly_rate = d['rate'] / 100 / 12
            interest = d['remaining'] * monthly_rate
            payment = d['payment']
            
            # First debt in priority gets extra
            if d == next((x for x in debts if x['remaining'] > 0.01), None):
                payment += month_extra + freed_payments
            
            payment = min(payment, d['remaining'] + interest)
            principal = payment - interest
            if principal <= 0:
                principal = 0
                payment = interest
            
            d['remaining'] -= principal
            if d['remaining'] < 0.01:
                d['remaining'] = 0
                closed_debts.append({'name': d['name'], 'month': month, 'id': d['id']})
                freed_payments += d['payment']
            
            total_paid += payment
            total_interest += interest
        
        active = [d for d in debts if d['remaining'] > 0.01]
        total_remaining = sum(d['remaining'] for d in active)
        
        if month <= 36 or month % 3 == 0 or not active:
            timeline.append({
                'month': month,
                'total_remaining': round(total_remaining, 0),
                'active_debts': len(active),
                'closed_total': len(closed_debts)
            })
    
    # Calculate baseline (no extra payments)
    baseline_interest = 0
    baseline_months = 0
    for d in sorted_debts:
        if d['payment'] <= 0 or d['remaining'] <= 0:
            continue
        mr = d['rate'] / 100 / 12
        bal = d['remaining']
        m = 0
        while bal > 0.01 and m < 600:
            interest = bal * mr
            princ = d['payment'] - interest
            if princ <= 0:
                m = 600
                break
            bal -= princ
            baseline_interest += interest
            m += 1
        baseline_months = max(baseline_months, m)
    
    return {
        'strategy': name,
        'total_months': month,
        'total_paid': round(total_paid, 0),
        'total_interest': round(total_interest, 0),
        'interest_saved': round(baseline_interest - total_interest, 0),
        'months_saved': baseline_months - month,
        'closed_order': closed_debts,
        'timeline': timeline
    }


def get_financial_analysis(family_id, params):
    """Comprehensive financial analysis: strategies, cashflow, health score"""
    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)
        
        # 1. Get income & expenses for current month
        cur.execute("""
            SELECT
                COALESCE(SUM(CASE WHEN transaction_type='income' THEN amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END), 0)
            FROM finance_transactions
            WHERE family_id = '%s'
              AND date_trunc('month', transaction_date) = date_trunc('month', CURRENT_DATE)
        """ % fid)
        r = cur.fetchone()
        month_income = float(r[0])
        month_expense = float(r[1])
        
        # 2. Get all active debts with full info
        cur.execute("""
            SELECT id, name, debt_type, creditor, original_amount, remaining_amount,
                   interest_rate, monthly_payment, next_payment_date, start_date, end_date,
                   credit_limit, min_payment_pct, bank_name, show_in_budget
            FROM finance_debts
            WHERE family_id = '%s' AND status = 'active'
            ORDER BY interest_rate DESC NULLS LAST
        """ % fid)
        debts = []
        total_debt_payments = 0
        total_remaining = 0
        for r in cur.fetchall():
            mp = float(r[7]) if r[7] else 0
            rem = float(r[5]) if r[5] else 0
            rate = float(r[6]) if r[6] else 0
            debts.append({
                'id': str(r[0]), 'name': r[1], 'debt_type': r[2], 'creditor': r[3],
                'original_amount': float(r[4]) if r[4] else 0,
                'remaining': rem, 'rate': rate, 'payment': mp,
                'next_payment_date': str(r[8]) if r[8] else None,
                'start_date': str(r[9]) if r[9] else None,
                'end_date': str(r[10]) if r[10] else None,
                'credit_limit': float(r[11]) if r[11] else None,
                'min_payment_pct': float(r[12]) if r[12] else None,
                'bank_name': r[13]
            })
            total_debt_payments += mp
            total_remaining += rem
        
        # 3. Get recurring income & expenses
        cur.execute("""
            SELECT amount, transaction_type, description, frequency
            FROM finance_recurring
            WHERE family_id = '%s' AND is_active = true
        """ % fid)
        recurring_income = 0
        recurring_expense = 0
        recurring_items = []
        for r in cur.fetchall():
            amt = float(r[0])
            freq = r[3] or 'monthly'
            monthly_amt = amt
            if freq == 'weekly':
                monthly_amt = amt * 4.33
            elif freq == 'quarterly':
                monthly_amt = amt / 3
            elif freq == 'yearly':
                monthly_amt = amt / 12
            
            if r[1] == 'income':
                recurring_income += monthly_amt
            else:
                recurring_expense += monthly_amt
            recurring_items.append({
                'amount': monthly_amt,
                'type': r[1],
                'description': r[2],
                'frequency': freq
            })
        
        # 4. Accounts balance
        cur.execute(
            "SELECT COALESCE(SUM(balance), 0) FROM finance_accounts WHERE family_id = '%s' AND is_active = true" % fid
        )
        total_balance = float(cur.fetchone()[0])
        
        # 5. Goals
        cur.execute("""
            SELECT name, target_amount, current_amount
            FROM finance_goals WHERE family_id = '%s' AND status = 'active'
        """ % fid)
        goals = [{'name': r[0], 'target': float(r[1]), 'current': float(r[2])} for r in cur.fetchall()]
        
        # 6. Assets
        cur.execute(
            "SELECT COALESCE(SUM(current_value), 0) FROM finance_assets WHERE family_id = '%s' AND status = 'active'" % fid
        )
        total_assets = float(cur.fetchone()[0])
        
        # 7. Budget data
        cur.execute("""
            SELECT fb.planned_amount, fc.name,
                   COALESCE((SELECT SUM(ft.amount) FROM finance_transactions ft
                    WHERE ft.family_id = '%s' AND ft.category_id = fb.category_id
                      AND ft.transaction_type = 'expense'
                      AND date_trunc('month', ft.transaction_date) = date_trunc('month', CURRENT_DATE)), 0)
            FROM finance_budgets fb
            LEFT JOIN finance_categories fc ON fb.category_id = fc.id
            WHERE fb.family_id = '%s'
              AND date_trunc('month', fb.budget_month) = date_trunc('month', CURRENT_DATE)
        """ % (fid, fid))
        budgets = [{'category': r[1] or 'Без категории', 'planned': float(r[0]), 'spent': float(r[2])} for r in cur.fetchall()]
        
        # 8. Last 6 months income/expense history
        cur.execute("""
            SELECT to_char(transaction_date, 'YYYY-MM') as m,
                   COALESCE(SUM(CASE WHEN transaction_type='income' THEN amount ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END), 0)
            FROM finance_transactions
            WHERE family_id = '%s'
              AND transaction_date >= (CURRENT_DATE - INTERVAL '6 months')
            GROUP BY m ORDER BY m
        """ % fid)
        history = [{'month': r[0], 'income': float(r[1]), 'expense': float(r[2])} for r in cur.fetchall()]
        
    finally:
        conn.close()
    
    # === CALCULATIONS ===
    
    # Use max of actual vs recurring for more accurate picture
    effective_income = max(month_income, recurring_income)
    effective_expenses = max(month_expense - total_debt_payments, recurring_expense - total_debt_payments)
    if effective_expenses < 0:
        effective_expenses = 0
    
    # Free money = income - living expenses - debt payments
    free_money = effective_income - effective_expenses - total_debt_payments
    if free_money < 0:
        free_money = 0
    
    # DTI (Debt-to-Income ratio)
    dti = (total_debt_payments / effective_income * 100) if effective_income > 0 else 0
    
    # Net Worth
    net_worth = total_assets + total_balance - total_remaining
    
    # Financial Health Score (0-100)
    health_score = 70  # Base
    if dti > 50:
        health_score -= 30
    elif dti > 40:
        health_score -= 20
    elif dti > 30:
        health_score -= 10
    elif dti < 15:
        health_score += 10
    
    if free_money > effective_income * 0.2:
        health_score += 10
    elif free_money < 0:
        health_score -= 20
    
    emergency_months = total_balance / (effective_expenses + total_debt_payments) if (effective_expenses + total_debt_payments) > 0 else 0
    if emergency_months >= 6:
        health_score += 10
    elif emergency_months < 1:
        health_score -= 10
    
    if total_remaining > effective_income * 60:
        health_score -= 10
    
    any_high_rate = any(d['rate'] > 25 for d in debts)
    if any_high_rate:
        health_score -= 5
    
    health_score = max(5, min(100, health_score))
    
    if health_score >= 75:
        health_status = 'good'
        health_label = 'Хорошее'
    elif health_score >= 50:
        health_status = 'warning'
        health_label = 'Требует внимания'
    else:
        health_status = 'critical'
        health_label = 'Критическое'
    
    # === DEBT STRATEGIES ===
    debts_for_strategy = [d for d in debts if d['payment'] > 0 and d['remaining'] > 0]
    
    avalanche = calc_strategy_avalanche(debts_for_strategy, free_money)
    snowball = calc_strategy_snowball(debts_for_strategy, free_money)
    
    # Determine which is better
    best_strategy = None
    if avalanche and snowball:
        if avalanche['interest_saved'] >= snowball['interest_saved']:
            best_strategy = 'avalanche'
        else:
            best_strategy = 'snowball'
    
    # === CASHFLOW PROJECTION (24 months) ===
    cashflow = []
    projected_debts = []
    for d in debts:
        projected_debts.append({
            'name': d['name'],
            'remaining': d['remaining'],
            'rate': d['rate'],
            'payment': d['payment']
        })
    
    for m in range(1, 25):
        month_debt_payment = 0
        active_debts = 0
        for pd in projected_debts:
            if pd['remaining'] <= 0.01:
                continue
            active_debts += 1
            mr = pd['rate'] / 100 / 12
            interest = pd['remaining'] * mr
            payment = min(pd['payment'], pd['remaining'] + interest)
            principal = payment - interest
            if principal > 0:
                pd['remaining'] -= principal
            month_debt_payment += payment
        
        cf_income = effective_income
        cf_expense = effective_expenses + month_debt_payment
        cf_free = cf_income - cf_expense
        
        cashflow.append({
            'month': m,
            'income': round(cf_income, 0),
            'expenses': round(effective_expenses, 0),
            'debt_payments': round(month_debt_payment, 0),
            'free_money': round(cf_free, 0),
            'active_debts': active_debts,
            'total_remaining': round(sum(max(pd['remaining'], 0) for pd in projected_debts), 0)
        })
    
    # === WHAT'S MISSING (proactive suggestions) ===
    missing = []
    if not budgets:
        missing.append({'type': 'budgets', 'icon': 'PieChart', 'text': 'Установите лимиты бюджета по категориям для контроля расходов'})
    if recurring_income == 0 and month_income > 0:
        missing.append({'type': 'recurring_income', 'icon': 'RefreshCw', 'text': 'Добавьте регулярные доходы (зарплата) для точного прогноза кэш-флоу'})
    if recurring_expense == 0 and month_expense > 0:
        missing.append({'type': 'recurring_expense', 'icon': 'Calendar', 'text': 'Добавьте обязательные расходы (ЖКХ, продукты, транспорт) для точного расчёта свободных средств'})
    if not goals:
        missing.append({'type': 'goals', 'icon': 'Target', 'text': 'Создайте финансовые цели — система рассчитает сколько откладывать в месяц'})
    if total_balance == 0:
        missing.append({'type': 'accounts', 'icon': 'CreditCard', 'text': 'Добавьте счета с балансами для расчёта подушки безопасности'})
    
    # Survival budget check
    essential_categories = ['ЖКХ', 'Продукты', 'Транспорт', 'Здоровье', 'Жильё', 'Коммунальные']
    has_essentials = any(b['category'] in essential_categories for b in budgets)
    if not has_essentials and budgets:
        missing.append({'type': 'essential_expenses', 'icon': 'AlertTriangle', 'text': 'Добавьте категории обязательных расходов: ЖКХ, продукты, транспорт — для расчёта минимального бюджета'})
    
    # === TOP RECOMMENDATIONS ===
    recommendations = []
    
    # High-rate debt alert
    high_rate_debts = [d for d in debts if d['rate'] > 25]
    if high_rate_debts:
        d = high_rate_debts[0]
        monthly_interest = d['remaining'] * d['rate'] / 100 / 12
        recommendations.append({
            'priority': 'critical',
            'icon': 'AlertTriangle',
            'title': 'Критическая ставка: %s (%.1f%%)' % (d['name'], d['rate']),
            'text': 'Ежемесячно %s руб. уходит только на проценты. Направьте максимум свободных средств на досрочное погашение.' % int(monthly_interest),
            'action': 'pay_debt',
            'debt_id': d['id'],
            'potential_savings': int(monthly_interest * 12)
        })
    
    # Free money recommendation
    if free_money > 0 and debts:
        best_debt = max(debts, key=lambda d: d['rate']) if debts else None
        if best_debt:
            extra_monthly = min(free_money * 0.5, best_debt['remaining'])
            schedule_without = calc_payoff_schedule(best_debt['remaining'], best_debt['rate'], best_debt['payment'])
            schedule_with = calc_payoff_schedule(best_debt['remaining'], best_debt['rate'], best_debt['payment'], extra_monthly)
            
            months_saved = len(schedule_without) - len(schedule_with)
            interest_saved = 0
            if schedule_without and schedule_with:
                interest_saved = schedule_without[-1]['total_interest'] - schedule_with[-1]['total_interest']
            
            if months_saved > 0 and interest_saved > 0:
                recommendations.append({
                    'priority': 'high',
                    'icon': 'TrendingDown',
                    'title': 'Досрочное погашение %s' % best_debt['name'],
                    'text': 'Направляя %s руб./мес дополнительно, закроете на %d мес. раньше. Экономия на процентах: %s руб.' % (
                        int(extra_monthly), months_saved, int(interest_saved)
                    ),
                    'action': 'extra_payment',
                    'debt_id': best_debt['id'],
                    'extra_amount': int(extra_monthly),
                    'months_saved': months_saved,
                    'interest_saved': int(interest_saved)
                })
    
    # Emergency fund check
    if emergency_months < 3:
        target_emergency = (effective_expenses + total_debt_payments) * 3
        need = target_emergency - total_balance
        if need > 0:
            recommendations.append({
                'priority': 'high',
                'icon': 'Shield',
                'title': 'Подушка безопасности: %.1f мес.' % emergency_months,
                'text': 'Рекомендуется иметь запас на 3-6 месяцев. Нужно накопить ещё %s руб.' % int(need),
                'action': 'save',
                'target_amount': int(need)
            })
    
    # DTI warning
    if dti > 40:
        recommendations.append({
            'priority': 'critical',
            'icon': 'AlertOctagon',
            'title': 'Высокая долговая нагрузка: %.1f%%' % dti,
            'text': 'Более 40%% дохода уходит на кредиты. Критический уровень — риск дефолта при потере дохода.',
            'action': 'reduce_debt'
        })
    elif dti > 30:
        recommendations.append({
            'priority': 'medium',
            'icon': 'AlertTriangle',
            'title': 'Долговая нагрузка: %.1f%%' % dti,
            'text': 'Более 30%% дохода на кредиты — повышенный уровень. Рекомендуется снизить до 25%%.',
            'action': 'reduce_debt'
        })
    
    # Freedom date
    freedom_date = None
    if avalanche and avalanche['total_months'] < 600:
        from datetime import datetime, timedelta
        now = datetime.now()
        free_date = now + timedelta(days=avalanche['total_months'] * 30.44)
        freedom_date = free_date.strftime('%Y-%m')
    
    return respond(200, {
        'summary': {
            'month_income': round(effective_income, 0),
            'month_expenses': round(effective_expenses, 0),
            'debt_payments': round(total_debt_payments, 0),
            'free_money': round(free_money, 0),
            'total_balance': round(total_balance, 0),
            'total_debt': round(total_remaining, 0),
            'total_assets': round(total_assets, 0),
            'net_worth': round(net_worth, 0),
            'dti': round(dti, 1),
            'emergency_months': round(emergency_months, 1),
            'freedom_date': freedom_date
        },
        'health': {
            'score': health_score,
            'status': health_status,
            'label': health_label
        },
        'strategies': {
            'avalanche': avalanche,
            'snowball': snowball,
            'recommended': best_strategy
        },
        'cashflow': cashflow,
        'recommendations': sorted(recommendations, key=lambda r: {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}.get(r['priority'], 4)),
        'missing_data': missing,
        'debts_detail': debts,
        'history': history,
        'budgets': budgets,
        'goals': goals
    })


# === AI FINANCIAL ADVISOR ===

def ai_advice(family_id, body):
    """ИИ-финансовый советник на Яндекс GPT"""
    question = body.get('question', '')
    api_key = os.environ.get('YANDEX_GPT_API_KEY', '')
    folder_id = os.environ.get('YANDEX_FOLDER_ID', 'b1gaglg8i7v2i32nvism')
    if not api_key:
        return respond(500, {'error': 'ИИ не настроен'})

    conn = get_db()
    try:
        cur = conn.cursor()
        fid = str(family_id)

        cur.execute("""
            SELECT
                COALESCE(SUM(CASE WHEN transaction_type='income' THEN amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END), 0)
            FROM finance_transactions
            WHERE family_id = '%s'
              AND date_trunc('month', transaction_date) = date_trunc('month', CURRENT_DATE)
        """ % fid)
        r = cur.fetchone()
        month_income = float(r[0])
        month_expense = float(r[1])

        cur.execute("""
            SELECT fc.name, SUM(ft.amount) as total
            FROM finance_transactions ft
            LEFT JOIN finance_categories fc ON ft.category_id = fc.id
            WHERE ft.family_id = '%s' AND ft.transaction_type = 'expense'
              AND date_trunc('month', ft.transaction_date) = date_trunc('month', CURRENT_DATE)
            GROUP BY fc.name ORDER BY total DESC LIMIT 8
        """ % fid)
        top_expenses = [{'category': r[0] or 'Прочее', 'amount': float(r[1])} for r in cur.fetchall()]

        cur.execute(
            "SELECT COALESCE(SUM(balance), 0) FROM finance_accounts WHERE family_id = '%s' AND is_active = true" % fid
        )
        total_balance = float(cur.fetchone()[0])

        cur.execute("""
            SELECT name, remaining_amount, interest_rate, monthly_payment, debt_type
            FROM finance_debts WHERE family_id = '%s' AND status = 'active'
            ORDER BY interest_rate DESC
        """ % fid)
        debts = [
            {'name': r[0], 'remaining': float(r[1]), 'rate': float(r[2]) if r[2] else 0, 'payment': float(r[3]) if r[3] else 0, 'type': r[4]}
            for r in cur.fetchall()
        ]

        cur.execute("""
            SELECT name, target_amount, current_amount
            FROM finance_goals WHERE family_id = '%s' AND status = 'active'
        """ % fid)
        goals = [
            {'name': r[0], 'target': float(r[1]), 'current': float(r[2])}
            for r in cur.fetchall()
        ]

        cur.execute("""
            SELECT fb.planned_amount, fc.name,
                   COALESCE((SELECT SUM(ft.amount) FROM finance_transactions ft
                    WHERE ft.family_id = '%s' AND ft.category_id = fb.category_id
                      AND ft.transaction_type = 'expense'
                      AND date_trunc('month', ft.transaction_date) = date_trunc('month', CURRENT_DATE)), 0) as spent
            FROM finance_budgets fb
            LEFT JOIN finance_categories fc ON fb.category_id = fc.id
            WHERE fb.family_id = '%s'
              AND date_trunc('month', fb.budget_month) = date_trunc('month', CURRENT_DATE)
        """ % (fid, fid))
        budget_limits = [
            {'category': r[1] or 'Без категории', 'limit': float(r[0]), 'spent': float(r[2])}
            for r in cur.fetchall()
        ]

        # Get recurring for more accurate picture
        cur.execute("""
            SELECT amount, transaction_type, description, frequency
            FROM finance_recurring WHERE family_id = '%s' AND is_active = true
        """ % fid)
        recurring_income = 0
        recurring_expense = 0
        recurring_items = []
        for r in cur.fetchall():
            amt = float(r[0])
            freq = r[3] or 'monthly'
            monthly_amt = amt
            if freq == 'weekly': monthly_amt = amt * 4.33
            elif freq == 'quarterly': monthly_amt = amt / 3
            elif freq == 'yearly': monthly_amt = amt / 12
            if r[1] == 'income':
                recurring_income += monthly_amt
            else:
                recurring_expense += monthly_amt
            recurring_items.append({'amount': round(monthly_amt), 'type': r[1], 'desc': r[2]})

        # Assets
        cur.execute(
            "SELECT COALESCE(SUM(current_value), 0) FROM finance_assets WHERE family_id = '%s' AND status = 'active'" % fid
        )
        total_assets = float(cur.fetchone()[0])

    finally:
        conn.close()

    total_debt_payments = sum(d['payment'] for d in debts)
    total_remaining = sum(d['remaining'] for d in debts)
    effective_income = max(month_income, recurring_income)
    free_money = effective_income - (month_expense if month_expense > recurring_expense else recurring_expense)
    dti = (total_debt_payments / effective_income * 100) if effective_income > 0 else 0
    net_worth = total_assets + total_balance - total_remaining
    emergency_months = total_balance / (month_expense if month_expense > 0 else 1)

    context_parts = []
    context_parts.append("=== ПОЛНАЯ ФИНАНСОВАЯ КАРТИНА СЕМЬИ ===")
    context_parts.append("Доходы за текущий месяц: %s руб." % int(month_income))
    context_parts.append("Регулярный доход (в месяц): %s руб." % int(recurring_income))
    context_parts.append("Расходы за текущий месяц (без кредитов): %s руб." % int(month_expense - total_debt_payments))
    context_parts.append("Регулярные расходы (в месяц): %s руб." % int(recurring_expense))
    context_parts.append("Платежи по кредитам: %s руб./мес" % int(total_debt_payments))
    context_parts.append("Свободные средства: %s руб./мес" % int(free_money))
    context_parts.append("Баланс на счетах: %s руб." % int(total_balance))
    context_parts.append("Общий долг: %s руб." % int(total_remaining))
    context_parts.append("Стоимость имущества: %s руб." % int(total_assets))
    context_parts.append("Чистая стоимость (net worth): %s руб." % int(net_worth))
    context_parts.append("Долговая нагрузка (DTI): %.1f%%" % dti)
    context_parts.append("Подушка безопасности: %.1f мес." % emergency_months)

    if top_expenses:
        lines = ["%s: %s руб." % (e['category'], int(e['amount'])) for e in top_expenses]
        context_parts.append("\nТоп расходов: " + "; ".join(lines))

    if debts:
        context_parts.append("\n=== КРЕДИТЫ И ДОЛГИ ===")
        for i, d in enumerate(debts, 1):
            interest_per_month = d['remaining'] * d['rate'] / 100 / 12
            context_parts.append("%d. %s (%s): остаток %s руб., ставка %.1f%%, платёж %s руб./мес, проценты %s руб./мес" % (
                i, d['name'], d['type'], int(d['remaining']), d['rate'], int(d['payment']), int(interest_per_month)
            ))

    if recurring_items:
        context_parts.append("\n=== РЕГУЛЯРНЫЕ ПЛАТЕЖИ ===")
        for r in recurring_items:
            context_parts.append("%s: %s руб./мес (%s)" % (r['desc'], int(r['amount']), 'доход' if r['type'] == 'income' else 'расход'))

    if goals:
        lines = ["%s: %s из %s руб." % (g['name'], int(g['current']), int(g['target'])) for g in goals]
        context_parts.append("\nФинансовые цели: " + "; ".join(lines))

    if budget_limits:
        over = [bl for bl in budget_limits if bl['spent'] > bl['limit']]
        if over:
            lines = ["%s: потрачено %s из %s руб." % (bl['category'], int(bl['spent']), int(bl['limit'])) for bl in over]
            context_parts.append("\nПревышены лимиты: " + "; ".join(lines))

    # Note missing data
    missing = []
    if recurring_income == 0 and month_income > 0:
        missing.append("регулярные доходы не указаны")
    if recurring_expense == 0:
        missing.append("обязательные расходы (ЖКХ, продукты, транспорт) не указаны")
    if not budget_limits:
        missing.append("лимиты бюджета не установлены")
    if total_balance == 0:
        missing.append("балансы счетов не указаны")
    if missing:
        context_parts.append("\n⚠ НЕДОСТАЮЩИЕ ДАННЫЕ для более точного анализа: " + "; ".join(missing))

    financial_context = "\n".join(context_parts)

    system_prompt = """Ты — эксперт-финансовый аналитик для семьи. Ты ПРОАКТИВЕН: не ждёшь вопросов, а сам анализируешь и предлагаешь действия.

ВАЖНЫЕ ПРАВИЛА:
- Отвечай на русском, структурированно, с заголовками и списками
- Давай КОНКРЕТНЫЕ цифры: суммы, сроки, экономию в рублях
- Для кредитов рассчитывай: 1) порядок досрочного погашения (сначала самые дорогие по ставке), 2) конкретную сумму досрочного платежа, 3) экономию от досрочного погашения
- Если данных не хватает — СКАЖИ какие именно данные нужны и ЗАЧЕМ
- Если свободные средства > 0 — предложи ТОЧНЫЙ план распределения: X руб. на подушку, Y руб. на досрочное погашение, Z руб. на цели
- Рассчитывай "Дату финансовой свободы" — когда все долги будут закрыты
- Предупреждай о рисках: потеря дохода, рост ставок, кассовые разрывы
- Используй формат: сначала ДИАГНОЗ (2-3 предложения), затем ПЛАН ДЕЙСТВИЙ (нумерованный список), затем ЭФФЕКТ (что это даст в цифрах)
- Не рекомендуй конкретные банки
- Максимум 700 слов

%s""" % financial_context

    user_msg = question if question else "Сделай полный финансовый анализ моей семьи. Дай диагноз, конкретный план действий для выхода из долговой нагрузки, и рассчитай когда я стану свободен от долгов. Если чего-то не хватает для анализа — скажи что нужно добавить."

    payload = {
        'modelUri': 'gpt://%s/yandexgpt-lite' % folder_id,
        'completionOptions': {
            'stream': False,
            'temperature': 0.4,
            'maxTokens': 4000
        },
        'messages': [
            {'role': 'system', 'text': system_prompt},
            {'role': 'user', 'text': user_msg}
        ]
    }

    try:
        req = urllib.request.Request(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Authorization': 'Api-Key %s' % api_key,
                'Content-Type': 'application/json'
            }
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            text = data.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
            if not text:
                return respond(500, {'error': 'ИИ не дал ответ'})
            return respond(200, {
                'advice': text,
                'context': {
                    'month_income': month_income,
                    'month_expense': month_expense,
                    'total_balance': total_balance,
                    'debts_count': len(debts),
                    'goals_count': len(goals),
                    'dti': round(dti, 1),
                    'free_money': round(free_money, 0),
                    'net_worth': round(net_worth, 0)
                }
            })
    except Exception as e:
        return respond(500, {'error': 'Ошибка ИИ: %s' % str(e)[:200]})


def ai_smart_advice(family_id, body):
    """Продвинутый ИИ-советник с конкретным вопросом и контекстом"""
    return ai_advice(family_id, body)


# === ASSETS ===

def get_assets(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, asset_type, purchase_date, purchase_price, current_value,
                   description, location, icon, color, status
            FROM finance_assets WHERE family_id = '%s'
            ORDER BY status, current_value DESC NULLS LAST
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'name': r[1], 'asset_type': r[2],
                'purchase_date': str(r[3]) if r[3] else None,
                'purchase_price': float(r[4]) if r[4] else None,
                'current_value': float(r[5]) if r[5] else None,
                'description': r[6], 'location': r[7],
                'icon': r[8], 'color': r[9], 'status': r[10]
            }
            for r in cur.fetchall()
        ]
        total = sum(i['current_value'] or 0 for i in items if i['status'] == 'active')
        return respond(200, {'assets': items, 'total_value': total})
    finally:
        conn.close()


def add_asset(family_id, body):
    name = body.get('name', '').strip()
    if not name:
        return respond(400, {'error': 'Укажите название'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO finance_assets
            (family_id, name, asset_type, purchase_date, purchase_price, current_value, description, location, icon, color)
            VALUES ('%s', '%s', '%s', %s, %s, %s, '%s', '%s', '%s', '%s')
            RETURNING id
        """ % (
            str(family_id), safe(name), safe(body.get('asset_type', 'property')),
            "'%s'" % safe(body['purchase_date']) if body.get('purchase_date') else 'NULL',
            float(body['purchase_price']) if body.get('purchase_price') else 'NULL',
            float(body['current_value']) if body.get('current_value') else 'NULL',
            safe(body.get('description', '')), safe(body.get('location', '')),
            safe(body.get('icon', 'Package')), safe(body.get('color', '#3B82F6'))
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def update_asset(family_id, body):
    aid = body.get('id')
    if not aid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        sets = []
        if 'name' in body: sets.append("name = '%s'" % safe(body['name']))
        if 'current_value' in body: sets.append("current_value = %s" % float(body['current_value']))
        if 'description' in body: sets.append("description = '%s'" % safe(body['description']))
        if 'location' in body: sets.append("location = '%s'" % safe(body['location']))
        if 'status' in body: sets.append("status = '%s'" % safe(body['status']))
        if 'icon' in body: sets.append("icon = '%s'" % safe(body['icon']))
        if 'color' in body: sets.append("color = '%s'" % safe(body['color']))
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        sets.append("updated_at = NOW()")
        cur.execute(
            "UPDATE finance_assets SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(aid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def delete_asset(family_id, body):
    aid = body.get('id')
    if not aid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM finance_assets WHERE id = '%s' AND family_id = '%s'" % (safe(aid), str(family_id)))
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


# === LOYALTY CARDS ===

def get_loyalty_cards(family_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT lc.id, lc.name, lc.store_name, lc.card_number, lc.barcode_data, lc.barcode_type,
                   lc.category, lc.discount_percent, lc.cashback_percent, lc.points_balance,
                   lc.member_id, lc.icon, lc.color, lc.notes, lc.is_active,
                   u.name as member_name
            FROM loyalty_cards lc
            LEFT JOIN users u ON lc.member_id = u.id
            WHERE lc.family_id = '%s'
            ORDER BY lc.is_active DESC, lc.store_name
        """ % str(family_id))
        items = [
            {
                'id': str(r[0]), 'name': r[1], 'store_name': r[2],
                'card_number': r[3], 'barcode_data': r[4], 'barcode_type': r[5],
                'category': r[6],
                'discount_percent': float(r[7]) if r[7] else None,
                'cashback_percent': float(r[8]) if r[8] else None,
                'points_balance': float(r[9]) if r[9] else 0,
                'member_id': str(r[10]) if r[10] else None,
                'icon': r[11], 'color': r[12], 'notes': r[13], 'is_active': r[14],
                'member_name': r[15]
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'cards': items})
    finally:
        conn.close()


def add_loyalty_card(family_id, body):
    name = body.get('name', '').strip()
    if not name:
        return respond(400, {'error': 'Укажите название'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO loyalty_cards
            (family_id, name, store_name, card_number, barcode_data, barcode_type, category,
             discount_percent, cashback_percent, points_balance, member_id, icon, color, notes)
            VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', %s, %s, %s, %s, '%s', '%s', '%s')
            RETURNING id
        """ % (
            str(family_id), safe(name), safe(body.get('store_name', '')),
            safe(body.get('card_number', '')), safe(body.get('barcode_data', '')),
            safe(body.get('barcode_type', 'ean13')), safe(body.get('category', 'other')),
            float(body['discount_percent']) if body.get('discount_percent') else 'NULL',
            float(body['cashback_percent']) if body.get('cashback_percent') else 'NULL',
            float(body.get('points_balance', 0)),
            "'%s'" % safe(body['member_id']) if body.get('member_id') else 'NULL',
            safe(body.get('icon', 'CreditCard')), safe(body.get('color', '#8B5CF6')),
            safe(body.get('notes', ''))
        ))
        new_id = str(cur.fetchone()[0])
        conn.commit()
        return respond(201, {'id': new_id, 'success': True})
    finally:
        conn.close()


def update_loyalty_card(family_id, body):
    cid = body.get('id')
    if not cid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        sets = []
        for field in ['name', 'store_name', 'card_number', 'barcode_data', 'category', 'icon', 'color', 'notes']:
            if field in body: sets.append("%s = '%s'" % (field, safe(body[field])))
        if 'discount_percent' in body: sets.append("discount_percent = %s" % (float(body['discount_percent']) if body['discount_percent'] else 'NULL'))
        if 'cashback_percent' in body: sets.append("cashback_percent = %s" % (float(body['cashback_percent']) if body['cashback_percent'] else 'NULL'))
        if 'points_balance' in body: sets.append("points_balance = %s" % float(body['points_balance']))
        if 'is_active' in body: sets.append("is_active = %s" % body['is_active'])
        if not sets:
            return respond(400, {'error': 'Нечего обновлять'})
        sets.append("updated_at = NOW()")
        cur.execute(
            "UPDATE loyalty_cards SET %s WHERE id = '%s' AND family_id = '%s'"
            % (', '.join(sets), safe(cid), str(family_id))
        )
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def delete_loyalty_card(family_id, body):
    cid = body.get('id')
    if not cid:
        return respond(400, {'error': 'Укажите id'})
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM loyalty_cards WHERE id = '%s' AND family_id = '%s'" % (safe(cid), str(family_id)))
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()