"""
Утилита лимита S3-хранилища на семью.
Вызвать ДО записи в S3: check_and_track_storage(conn, schema, family_id, file_size_bytes)
Возвращает (ok: bool, error_response: dict | None)
"""
import json

# Лимиты в МБ по тарифам (fallback если БД недоступна)
STORAGE_LIMITS_MB = {
    'free_2026':       500,    # 500 МБ
    'premium_monthly': 5120,   # 5 ГБ
    'premium_3m':      5120,
    'premium_6m':      5120,
    'premium_12m':     5120,
    'ai_assistant':    5120,
    'full':            5120,
    'bank_partner':    2048,   # 2 ГБ (банковский пакет)
}
DEFAULT_FREE_LIMIT_MB = 500
DEFAULT_PREMIUM_LIMIT_MB = 5120

CORS = {'Access-Control-Allow-Origin': '*'}

def _err(status, body):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', **CORS},
        'body': json.dumps(body, ensure_ascii=False),
    }


def check_and_track_storage(conn, schema: str, family_id: str, file_size_bytes: int):
    """
    Проверяет лимит S3 и увеличивает счётчик после успешной загрузки.
    Возвращает (True, None) если ok, (False, error_dict) если лимит превышен.
    Использует мягкую логику: если учёт падает — файл всё равно загружается.
    """
    file_size_mb = file_size_bytes / (1024 * 1024)

    try:
        cur = conn.cursor()

        # 1. Тариф семьи
        cur.execute(f"""
            SELECT COALESCE(plan_type, 'free_2026') AS plan_type
            FROM {schema}.subscriptions
            WHERE family_id = %s AND status = 'active' AND end_date > CURRENT_TIMESTAMP
            ORDER BY end_date DESC LIMIT 1
        """, (family_id,))
        sub = cur.fetchone()
        plan_type = sub[0] if sub else 'free_2026'

        limit_mb = STORAGE_LIMITS_MB.get(plan_type, DEFAULT_FREE_LIMIT_MB)

        # 2. Текущее использование
        cur.execute(f"""
            SELECT file_storage_used_mb
            FROM {schema}.subscription_usage
            WHERE family_id = %s
        """, (family_id,))
        row = cur.fetchone()

        if not row:
            # Создать запись если нет
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

        # 3. Проверить лимит
        if (used_mb + file_size_mb) > limit_mb:
            cur.close()
            available_mb = max(0.0, limit_mb - used_mb)
            return False, _err(413, {
                'error': 'Превышен лимит хранилища',
                'used_mb': round(used_mb, 2),
                'limit_mb': limit_mb,
                'available_mb': round(available_mb, 2),
                'file_size_mb': round(file_size_mb, 2),
                'plan': plan_type,
            })

        # 4. Обновить счётчик
        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET file_storage_used_mb = file_storage_used_mb + %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE family_id = %s
        """, (round(file_size_mb, 4), family_id))
        conn.commit()
        cur.close()
        return True, None

    except Exception:
        # Если учёт упал — не блокируем загрузку (мягкий режим)
        return True, None


def track_storage_increase(conn, schema: str, family_id: str, file_size_bytes: int):
    """Только увеличить счётчик (без проверки лимита). Для случаев где проверка уже пройдена."""
    try:
        file_size_mb = file_size_bytes / (1024 * 1024)
        cur = conn.cursor()
        cur.execute(f"""
            UPDATE {schema}.subscription_usage
            SET file_storage_used_mb = file_storage_used_mb + %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE family_id = %s
        """, (round(file_size_mb, 4), family_id))
        conn.commit()
        cur.close()
    except Exception:
        pass
