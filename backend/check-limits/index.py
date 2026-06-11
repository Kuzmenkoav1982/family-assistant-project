import json
import os
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Family-Id, X-Auth-Token',
}

def respond(status, body):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', **CORS}, 'body': json.dumps(body, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    """Проверка и списание AI-кредитов. GET — статус, POST — списание кредитов. v1.2: кредитная система."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    family_id = (event.get('headers') or {}).get('X-Family-Id') or (event.get('headers') or {}).get('x-family-id')

    if not family_id:
        return respond(400, {'error': 'X-Family-Id обязателен'})

    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    today = date.today()
    month_start = today.replace(day=1)

    # ── 1. Получить подписку и usage ────────────────────────────────────────
    cur.execute(f"""
        SELECT
            COALESCE(s.plan_type, 'free_2026') AS plan_type,
            su.ai_requests_used,
            su.ai_credits_used,
            su.ai_credits_limit,
            su.ai_credits_reset_date,
            su.ai_credits_daily_used,
            su.ai_credits_daily_reset,
            su.file_storage_used_mb,
            su.family_id AS su_family_id
        FROM (
            SELECT family_id, plan_type FROM {schema}.subscriptions
            WHERE family_id = %s AND status = 'active' AND end_date > CURRENT_TIMESTAMP
            ORDER BY end_date DESC LIMIT 1
        ) s
        RIGHT JOIN {schema}.subscription_usage su ON su.family_id = %s
        LIMIT 1
    """, (family_id, family_id))

    row = cur.fetchone()

    if not row:
        cur.execute(f"""
            INSERT INTO {schema}.subscription_usage
              (family_id, ai_requests_used, photos_used, family_members_count,
               ai_credits_used, ai_credits_reset_date,
               ai_credits_daily_used, ai_credits_daily_reset, file_storage_used_mb)
            VALUES (%s, 0, 0, 0, 0, %s, 0, %s, 0)
            ON CONFLICT (family_id) DO NOTHING
        """, (family_id, month_start, today))
        conn.commit()
        row = {
            'plan_type': 'free_2026', 'ai_requests_used': 0,
            'ai_credits_used': 0, 'ai_credits_limit': None,
            'ai_credits_reset_date': month_start, 'ai_credits_daily_used': 0,
            'ai_credits_daily_reset': today, 'file_storage_used_mb': 0,
            'su_family_id': family_id,
        }

    plan_type = row['plan_type'] or 'free_2026'

    # ── 2. Получить лимиты по тарифу из БД ──────────────────────────────────
    cur.execute(f"""
        SELECT monthly_credits, daily_credits
        FROM {schema}.plan_ai_limits
        WHERE plan_type = %s
    """, (plan_type,))
    plan_limits = cur.fetchone()

    if not plan_limits:
        is_premium = plan_type.startswith('premium_') or plan_type in ('ai_assistant', 'full', 'bank_partner')
        monthly_credits = None if is_premium else 15
        daily_credits = None if is_premium else 3
    else:
        monthly_credits = plan_limits['monthly_credits']
        daily_credits = plan_limits['daily_credits']

    # ── 3. Авто-сброс месячного счётчика ────────────────────────────────────
    reset_date = row['ai_credits_reset_date']
    if reset_date and reset_date < month_start:
        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET ai_credits_used = 0, ai_credits_reset_date = %s
            WHERE family_id = %s
        """, (month_start, family_id))
        conn.commit()
        row['ai_credits_used'] = 0

    # ── 4. Авто-сброс дневного счётчика ─────────────────────────────────────
    daily_reset = row['ai_credits_daily_reset']
    if daily_reset and daily_reset < today:
        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET ai_credits_daily_used = 0, ai_credits_daily_reset = %s
            WHERE family_id = %s
        """, (today, family_id))
        conn.commit()
        row['ai_credits_daily_used'] = 0

    credits_used_monthly = row['ai_credits_used'] or 0
    credits_used_daily = row['ai_credits_daily_used'] or 0

    monthly_ok = (monthly_credits is None) or (credits_used_monthly < monthly_credits)
    daily_ok = (daily_credits is None) or (credits_used_daily < daily_credits)
    allowed = monthly_ok and daily_ok

    # ── 5. POST — списание кредитов ──────────────────────────────────────────
    spend_result = None
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        function_name = body.get('function_name', 'ai_assistant')
        credits_to_spend = body.get('credits', 1)

        # Получить вес функции из БД
        cur.execute(f"""
            SELECT credits FROM {schema}.ai_credit_weights WHERE function_name = %s
        """, (function_name,))
        w = cur.fetchone()
        if w:
            credits_to_spend = w['credits']

        if not allowed:
            cur.close()
            conn.close()
            return respond(429, {
                'error': 'Лимит AI-кредитов исчерпан',
                'monthly_used': credits_used_monthly,
                'monthly_limit': monthly_credits,
                'daily_used': credits_used_daily,
                'daily_limit': daily_credits,
                'reset_date': str(month_start.replace(month=month_start.month % 12 + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)),
            })

        # Дополнительная проверка: хватит ли кредитов на этот запрос
        if monthly_credits is not None and (credits_used_monthly + credits_to_spend) > monthly_credits:
            cur.close()
            conn.close()
            return respond(429, {
                'error': f'Не хватает кредитов: нужно {credits_to_spend}, доступно {monthly_credits - credits_used_monthly}',
                'credits_needed': credits_to_spend,
                'credits_available': monthly_credits - credits_used_monthly,
            })

        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET
                ai_credits_used = ai_credits_used + %s,
                ai_credits_daily_used = ai_credits_daily_used + %s,
                ai_requests_used = ai_requests_used + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE family_id = %s
            RETURNING ai_credits_used, ai_credits_daily_used
        """, (credits_to_spend, credits_to_spend, family_id))
        upd = cur.fetchone()
        conn.commit()

        credits_used_monthly = upd['ai_credits_used']
        credits_used_daily = upd['ai_credits_daily_used']
        spend_result = {'spent': credits_to_spend, 'function': function_name}

    cur.close()
    conn.close()

    result = {
        'plan_type': plan_type,
        'ai_credits': {
            'monthly_used': credits_used_monthly,
            'monthly_limit': monthly_credits,
            'daily_used': credits_used_daily,
            'daily_limit': daily_credits,
            'allowed': allowed,
            'reset_month': str(month_start),
        },
        'file_storage_used_mb': float(row.get('file_storage_used_mb') or 0),
    }
    if spend_result:
        result['spend'] = spend_result

    return respond(200, result)
