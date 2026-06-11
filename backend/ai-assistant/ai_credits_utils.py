"""
Утилита AI-кредитов — используется всеми AI-функциями.
Вызвать ДО AI-запроса: check_and_spend_ai_credits(conn, schema, family_id, function_name)
Возвращает (ok: bool, error_response: dict | None)
"""
import json
from datetime import date

# Веса функций — на случай если БД не отвечает (fallback)
CREDIT_WEIGHTS_FALLBACK = {
    'ai_assistant':        1,
    'event_ai_ideas':      1,
    'leisure_ai':          1,
    'life_road':           1,
    'conflict_ai':         2,
    'health_ai_analysis':  2,
    'diet_plan_7d':        4,
    'diet_plan_14d':       5,
    'diet_plan_30d':       7,
    'diet_recipe':         1,
    'diet_photo':          2,
}

PLAN_LIMITS_FALLBACK = {
    'free_2026':       (15, 3),
    'premium_monthly': (30, 5),
    'premium_3m':      (30, 5),
    'premium_6m':      (30, 5),
    'premium_12m':     (30, 5),
    'ai_assistant':    (30, 5),
    'full':            (30, 5),
    'bank_partner':    (30, 5),
}

CORS = {'Access-Control-Allow-Origin': '*'}

def _respond_error(status, body):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', **CORS},
        'body': json.dumps(body, ensure_ascii=False),
    }


def check_and_spend_ai_credits(conn, schema: str, family_id: str, function_name: str):
    """
    Проверяет месячный и дневной лимит AI-кредитов и списывает.
    Возвращает (True, None) если ok, (False, error_response_dict) если лимит превышен.
    """
    cur = conn.cursor()
    today = date.today()
    month_start = today.replace(day=1)

    # 1. Получить вес функции
    try:
        cur.execute(f"SELECT credits FROM {schema}.ai_credit_weights WHERE function_name = %s", (function_name,))
        w = cur.fetchone()
        credits_to_spend = w[0] if w else CREDIT_WEIGHTS_FALLBACK.get(function_name, 1)
    except Exception:
        credits_to_spend = CREDIT_WEIGHTS_FALLBACK.get(function_name, 1)

    # 2. Получить тариф семьи
    try:
        cur.execute(f"""
            SELECT COALESCE(s.plan_type, 'free_2026') AS plan_type
            FROM {schema}.subscriptions s
            WHERE s.family_id = %s AND s.status = 'active' AND s.end_date > CURRENT_TIMESTAMP
            ORDER BY s.end_date DESC LIMIT 1
        """, (family_id,))
        sub = cur.fetchone()
        plan_type = sub[0] if sub else 'free_2026'
    except Exception:
        plan_type = 'free_2026'

    # 3. Получить лимиты плана
    try:
        cur.execute(f"SELECT monthly_credits, daily_credits FROM {schema}.plan_ai_limits WHERE plan_type = %s", (plan_type,))
        pl = cur.fetchone()
        if pl:
            monthly_limit, daily_limit = pl[0], pl[1]
        else:
            monthly_limit, daily_limit = PLAN_LIMITS_FALLBACK.get(plan_type, (30, 5))
    except Exception:
        monthly_limit, daily_limit = PLAN_LIMITS_FALLBACK.get(plan_type, (30, 5))

    # Безлимит — пропускаем проверку
    if monthly_limit is None and daily_limit is None:
        cur.close()
        return True, None

    # 4. Получить текущее использование и выполнить авто-сброс
    try:
        cur.execute(f"""
            SELECT ai_credits_used, ai_credits_reset_date, ai_credits_daily_used, ai_credits_daily_reset
            FROM {schema}.subscription_usage WHERE family_id = %s
        """, (family_id,))
        row = cur.fetchone()
    except Exception:
        row = None

    if not row:
        # Создать запись usage если нет
        try:
            cur.execute(f"""
                INSERT INTO {schema}.subscription_usage
                  (family_id, ai_credits_used, ai_credits_reset_date,
                   ai_credits_daily_used, ai_credits_daily_reset, file_storage_used_mb)
                VALUES (%s, 0, %s, 0, %s, 0)
                ON CONFLICT (family_id) DO NOTHING
            """, (family_id, month_start, today))
            conn.commit()
        except Exception:
            pass
        credits_monthly = 0
        credits_daily = 0
    else:
        credits_monthly = row[0] or 0
        credits_daily = row[2] or 0
        reset_m = row[1]
        reset_d = row[3]

        # Сброс месячного
        if reset_m and reset_m < month_start:
            try:
                cur.execute(f"""
                    UPDATE {schema}.subscription_usage
                    SET ai_credits_used = 0, ai_credits_reset_date = %s WHERE family_id = %s
                """, (month_start, family_id))
                conn.commit()
            except Exception:
                pass
            credits_monthly = 0

        # Сброс дневного
        if reset_d and reset_d < today:
            try:
                cur.execute(f"""
                    UPDATE {schema}.subscription_usage
                    SET ai_credits_daily_used = 0, ai_credits_daily_reset = %s WHERE family_id = %s
                """, (today, family_id))
                conn.commit()
            except Exception:
                pass
            credits_daily = 0

    # 5. Проверить лимиты
    if monthly_limit is not None and (credits_monthly + credits_to_spend) > monthly_limit:
        cur.close()
        available = max(0, monthly_limit - credits_monthly)
        return False, _respond_error(429, {
            'error': 'Месячный лимит AI-кредитов исчерпан',
            'credits_needed': credits_to_spend,
            'credits_available': available,
            'monthly_limit': monthly_limit,
            'monthly_used': credits_monthly,
        })

    if daily_limit is not None and (credits_daily + credits_to_spend) > daily_limit:
        cur.close()
        available = max(0, daily_limit - credits_daily)
        return False, _respond_error(429, {
            'error': 'Дневной лимит AI-кредитов исчерпан',
            'credits_needed': credits_to_spend,
            'credits_available': available,
            'daily_limit': daily_limit,
            'daily_used': credits_daily,
        })

    # 6. Списать кредиты
    try:
        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET
                ai_credits_used = ai_credits_used + %s,
                ai_credits_daily_used = ai_credits_daily_used + %s,
                ai_requests_used = ai_requests_used + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE family_id = %s
        """, (credits_to_spend, credits_to_spend, family_id))
        conn.commit()
    except Exception:
        pass  # Не блокировать AI если учёт упал

    cur.close()
    return True, None
