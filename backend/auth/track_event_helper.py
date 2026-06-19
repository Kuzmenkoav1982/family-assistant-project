"""
Общий helper для записи бизнес-событий в таблицу product_events.
Используется как внутри track-event endpoint (frontend-события),
так и напрямую из backend-функций (auth, tasks, family-chat, ai-assistant).

Пример использования в backend-функции:
    from track_event_helper import track_event
    track_event('task_created', source='backend', user_id=user_id, family_id=family_id,
                properties={'points': task['points'], 'category': task['category']})

Принципы:
- Fire-and-forget: исключения глотаются, чтобы не ронять основной сценарий.
- Без PII: не пишем email, текст чатов, содержимое AI-запросов.
- Идемпотентность: event_id = gen_random_uuid() по умолчанию (уникальный индекс).
"""
import os
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'


def track_event(
    event_name: str,
    source: str = 'backend',
    user_id: Optional[str] = None,
    family_id: Optional[str] = None,
    session_id: Optional[str] = None,
    anonymous_id: Optional[str] = None,
    path: Optional[str] = None,
    referrer: Optional[str] = None,
    utm_source: Optional[str] = None,
    utm_medium: Optional[str] = None,
    utm_campaign: Optional[str] = None,
    properties: Optional[dict] = None,
    conn=None,          # передать открытое соединение (избегаем лишнего коннекта)
    close_conn: bool = True,
) -> None:
    """
    Записывает одно бизнес-событие в product_events.
    Если передан conn — использует его и НЕ закрывает (close_conn=False по смыслу).
    Если conn=None — открывает своё соединение и закрывает после записи.
    Никогда не бросает исключений наружу.
    """
    try:
        import psycopg2
        from psycopg2.extras import Json

        own_conn = conn is None
        if own_conn:
            conn = psycopg2.connect(DATABASE_URL)

        def _s(v):
            if v is None:
                return 'NULL'
            return "'" + str(v).replace("'", "''") + "'"

        props_sql = 'NULL' if not properties else f"'{json.dumps(properties, ensure_ascii=False).replace(chr(39), chr(39)+chr(39))}'"

        sql = f"""
            INSERT INTO {SCHEMA}.product_events
                (event_name, source, user_id, family_id, session_id, anonymous_id,
                 path, referrer, utm_source, utm_medium, utm_campaign, properties)
            VALUES (
                {_s(event_name)}, {_s(source)},
                {_s(user_id)}{'::uuid' if user_id else ''},
                {_s(family_id)}{'::uuid' if family_id else ''},
                {_s(session_id)}, {_s(anonymous_id)},
                {_s(path)}, {_s(referrer)},
                {_s(utm_source)}, {_s(utm_medium)}, {_s(utm_campaign)},
                {props_sql}::jsonb
            )
        """

        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()

        if own_conn and close_conn:
            conn.close()

    except Exception as e:
        logger.warning(f'track_event failed silently: {e}')
