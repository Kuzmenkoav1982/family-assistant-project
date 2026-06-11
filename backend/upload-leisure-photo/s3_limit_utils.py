"""
Утилита лимита S3-хранилища на семью.
Вызвать ДО записи в S3: check_and_track_storage(conn, schema, family_id, file_size_bytes)
Возвращает (ok: bool, error_response: dict | None)
"""
import json

STORAGE_LIMITS_MB = {
    'free_2026':       500,
    'premium_monthly': 5120,
    'premium_3m':      5120,
    'premium_6m':      5120,
    'premium_12m':     5120,
    'ai_assistant':    5120,
    'full':            5120,
    'bank_partner':    2048,
}
DEFAULT_FREE_LIMIT_MB = 500

CORS = {'Access-Control-Allow-Origin': '*'}

def _err(status, body):
    return {'statusCode': status, 'headers': {'Content-Type': 'application/json', **CORS}, 'body': json.dumps(body, ensure_ascii=False)}


def check_and_track_storage(conn, schema: str, family_id: str, file_size_bytes: int):
    file_size_mb = file_size_bytes / (1024 * 1024)
    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT COALESCE(plan_type, 'free_2026') FROM {schema}.subscriptions
            WHERE family_id = %s AND status = 'active' AND end_date > CURRENT_TIMESTAMP
            ORDER BY end_date DESC LIMIT 1
        """, (family_id,))
        sub = cur.fetchone()
        plan_type = sub[0] if sub else 'free_2026'
        limit_mb = STORAGE_LIMITS_MB.get(plan_type, DEFAULT_FREE_LIMIT_MB)

        cur.execute(f"SELECT file_storage_used_mb FROM {schema}.subscription_usage WHERE family_id = %s", (family_id,))
        row = cur.fetchone()
        if not row:
            cur.execute(f"""
                INSERT INTO {schema}.subscription_usage
                  (family_id, file_storage_used_mb, ai_credits_used, ai_requests_used,
                   ai_credits_reset_date, ai_credits_daily_reset)
                VALUES (%s, 0, 0, 0, DATE_TRUNC('month', CURRENT_DATE)::date, CURRENT_DATE)
                ON CONFLICT (family_id) DO NOTHING
            """, (family_id,))
            conn.commit()
            used_mb = 0.0
        else:
            used_mb = float(row[0] or 0)

        if (used_mb + file_size_mb) > limit_mb:
            cur.close()
            return False, _err(413, {
                'error': 'Превышен лимит хранилища',
                'used_mb': round(used_mb, 2),
                'limit_mb': limit_mb,
                'available_mb': round(max(0.0, limit_mb - used_mb), 2),
                'file_size_mb': round(file_size_mb, 2),
            })

        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET file_storage_used_mb = file_storage_used_mb + %s, updated_at = CURRENT_TIMESTAMP
            WHERE family_id = %s
        """, (round(file_size_mb, 4), family_id))
        conn.commit()
        cur.close()
        return True, None
    except Exception:
        return True, None
