"""
Business: CRUD операции для списка покупок семьи с реальным сохранением в БД
Args: event с httpMethod, body, headers с X-Auth-Token
Returns: JSON со списком покупок или результатом операции
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

try:
    from pywebpush import webpush, WebPushException
except ImportError:
    webpush = None
    WebPushException = Exception

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def get_db_connection_tx():
    """Соединение для атомарных операций (без autocommit)."""
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


# ─────────────────────────────────────────────────────────────
# Связь Покупки → Финансы
# ─────────────────────────────────────────────────────────────
# Источник истины: shopping_items_v2.
# Финансовая транзакция — производное отображение расхода.
# Создаётся ТОЛЬКО если у товара указана цена (price > 0).

# Системная категория «Продукты» — общая для всех семей
SHOPPING_CATEGORY_ID = '2b00cdd2-0a77-4923-ab8c-5d6f4d93a1d7'
SOURCE_TYPE_SHOPPING = 'shopping'

def escape_string(value: Any) -> str:
    if value is None or value == '':
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace("'", "''") + "'"

def send_push_notification(family_id: str, title: str, message: str, notification_type: str = 'shopping'):
    """Отправка push-уведомлений всем подписчикам семьи с проверкой настроек"""
    try:
        if webpush is None:
            print("[WARN] pywebpush not available, skipping notification")
            return
        vapid_key = os.environ.get('VAPID_PRIVATE_KEY')
        if not vapid_key:
            print(f"[WARN] VAPID key not configured, skipping notification")
            return
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = f"SELECT subscription_data, notification_settings FROM {SCHEMA}.push_subscriptions WHERE family_id::text = {escape_string(family_id)}"
        cur.execute(query)
        subscriptions = cur.fetchall()
        
        for sub_row in subscriptions:
            settings = sub_row.get('notification_settings') or {}
            if settings.get(notification_type, True) is False:
                print(f"[INFO] Skipping notification type '{notification_type}' - disabled in settings")
                continue
            
            try:
                webpush(
                    subscription_info=sub_row['subscription_data'],
                    data=json.dumps({'title': title, 'body': message, 'icon': '/icon-192.png'}),
                    vapid_private_key=vapid_key,
                    vapid_claims={'sub': 'mailto:support@family-assistant.app'}
                )
            except WebPushException as e:
                print(f"[ERROR] Push failed: {e}")
            except Exception as e:
                print(f"[ERROR] Unexpected push error: {e}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Notification error: {e}")

def verify_token(token: str) -> Optional[str]:
    if not token or token == '':
        return None
        
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = {escape_string(token)} AND expires_at > CURRENT_TIMESTAMP
    """
    cur.execute(query)
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_user_family_id(user_id: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query = f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id::text = {escape_string(user_id)} LIMIT 1
    """
    cur.execute(query)
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member and member['family_id'] else None

def get_shopping_items(family_id: str, bought: Optional[bool] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    where_clause = f"WHERE family_id::text = {escape_string(family_id)}"
    if bought is not None:
        where_clause += f" AND bought = {escape_string(bought)}"
    
    query = f"""
        SELECT * FROM {SCHEMA}.shopping_items_v2
        {where_clause}
        ORDER BY bought ASC, priority DESC, created_at DESC
    """
    
    cur.execute(query)
    items = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(item) for item in items]

def create_shopping_item(family_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    item_id = str(uuid.uuid4())
    
    user_query = f"SELECT name FROM {SCHEMA}.family_members WHERE user_id::text = {escape_string(user_id)} LIMIT 1"
    cur.execute(user_query)
    user_data = cur.fetchone()
    user_name = user_data['name'] if user_data else 'Неизвестно'
    
    # For UUID fields, we need to cast the string to uuid
    insert_query = f"""
        INSERT INTO {SCHEMA}.shopping_items_v2 (
            id, family_id, name, category, quantity, priority, bought,
            added_by, added_by_name, notes
        ) VALUES (
            {escape_string(item_id)}::uuid,
            {escape_string(family_id)}::uuid,
            {escape_string(data.get('name', ''))},
            {escape_string(data.get('category', 'Продукты'))},
            {escape_string(data.get('quantity', ''))},
            {escape_string(data.get('priority', 'normal'))},
            FALSE,
            {escape_string(user_id)}::uuid,
            {escape_string(user_name)},
            {escape_string(data.get('notes', '') if data.get('notes') else '')}
        )
    """
    
    try:
        print(f"[DEBUG] Insert query: {insert_query}")
        cur.execute(insert_query)
        
        select_query = f"SELECT * FROM {SCHEMA}.shopping_items_v2 WHERE id = {escape_string(item_id)}::uuid"
        cur.execute(select_query)
        item = cur.fetchone()
        
        if data.get('priority') == 'urgent':
            send_push_notification(family_id, "🚨 Срочная покупка", f"Нужно срочно купить: {data.get('name', 'Товар')}")
        
        cur.close()
        conn.close()
        return dict(item) if item else {}
    except Exception as e:
        print(f"[create_shopping_item] Error: {e}")
        print(f"[DEBUG] Failed query: {insert_query}")
        cur.close()
        conn.close()
        raise

def update_shopping_item(item_id: str, family_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Обновляет товар и атомарно синхронизирует связанный расход в финансах.

    Логика связи:
      * bought=true + price>0  → создаётся / обновляется расход в категории «Продукты»
      * bought=true без цены   → расход не создаётся (товар просто помечается)
      * bought=false           → связанный расход удаляется
      * Защита от дубликатов через UNIQUE INDEX (source_type, source_id)
      * Всё внутри одной DB-транзакции с SELECT FOR UPDATE
    """
    conn = get_db_connection_tx()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1. Текущее состояние с блокировкой
        cur.execute(
            f"SELECT id, name, bought, price, linked_transaction_id "
            f"FROM {SCHEMA}.shopping_items_v2 "
            f"WHERE id::text = {escape_string(item_id)} "
            f"AND family_id::text = {escape_string(family_id)} "
            f"FOR UPDATE"
        )
        current = cur.fetchone()
        if not current:
            conn.rollback()
            return {'error': 'Покупка не найдена'}

        fields = []
        if 'bought' in data and data['bought']:
            user_query = f"SELECT name FROM {SCHEMA}.family_members WHERE user_id::text = {escape_string(user_id)} LIMIT 1"
            cur.execute(user_query)
            user_data = cur.fetchone()
            user_name = user_data['name'] if user_data else 'Неизвестно'

            fields.append("bought = TRUE")
            fields.append(f"bought_by = {escape_string(user_id)}::uuid")
            fields.append(f"bought_by_name = {escape_string(user_name)}")
            fields.append("bought_at = CURRENT_TIMESTAMP")
        elif 'bought' in data and not data['bought']:
            fields.append("bought = FALSE")
            fields.append("bought_by = NULL")
            fields.append("bought_by_name = NULL")
            fields.append("bought_at = NULL")

        for field in ['name', 'category', 'quantity', 'priority', 'notes']:
            if field in data:
                fields.append(f"{field} = {escape_string(data[field])}")

        if 'price' in data:
            price_val = data['price']
            if price_val is None or price_val == '':
                fields.append("price = NULL")
            else:
                try:
                    fields.append(f"price = {float(price_val)}")
                except (TypeError, ValueError):
                    fields.append("price = NULL")

        if not fields:
            conn.rollback()
            return {'error': 'Нет данных для обновления'}

        fields.append("updated_at = CURRENT_TIMESTAMP")
        cur.execute(
            f"UPDATE {SCHEMA}.shopping_items_v2 SET {', '.join(fields)} "
            f"WHERE id::text = {escape_string(item_id)} "
            f"AND family_id::text = {escape_string(family_id)} "
            f"RETURNING *"
        )
        item = cur.fetchone()
        if not item:
            conn.rollback()
            return {'error': 'Покупка не найдена'}

        item_dict = dict(item)
        was_bought = bool(current['bought'])
        is_bought = bool(item_dict.get('bought'))
        linked_tx_id = current.get('linked_transaction_id')
        price = item_dict.get('price')
        price_value = float(price) if price not in (None, '') else 0.0

        # 2. Синхронизация с финансами
        if not was_bought and is_bought and price_value > 0:
            # Создаём расход
            description = f"Покупка: {item_dict.get('name', '')}"
            cur.execute(
                f"INSERT INTO {SCHEMA}.finance_transactions "
                f"(family_id, category_id, amount, transaction_type, "
                f"description, transaction_date, source_type, source_id, is_confirmed) "
                f"VALUES ({escape_string(family_id)}, {escape_string(SHOPPING_CATEGORY_ID)}, "
                f"{price_value}, 'expense', {escape_string(description)}, "
                f"CURRENT_DATE, {escape_string(SOURCE_TYPE_SHOPPING)}, "
                f"{escape_string(item_id)}, TRUE) "
                f"ON CONFLICT (source_type, source_id) "
                f"WHERE source_type IS NOT NULL AND source_id IS NOT NULL "
                f"DO UPDATE SET amount = EXCLUDED.amount, "
                f"description = EXCLUDED.description, "
                f"updated_at = CURRENT_TIMESTAMP "
                f"RETURNING id"
            )
            tx_row = cur.fetchone()
            if tx_row:
                new_tx_id = str(tx_row['id'])
                cur.execute(
                    f"UPDATE {SCHEMA}.shopping_items_v2 "
                    f"SET linked_transaction_id = {escape_string(new_tx_id)}::uuid "
                    f"WHERE id::text = {escape_string(item_id)}"
                )
                item_dict['linked_transaction_id'] = new_tx_id
        elif was_bought and not is_bought and linked_tx_id:
            # Снимаем отметку «куплено» — удаляем связанный расход
            cur.execute(
                f"DELETE FROM {SCHEMA}.finance_transactions "
                f"WHERE id::text = {escape_string(str(linked_tx_id))} "
                f"AND family_id::text = {escape_string(family_id)} "
                f"AND source_type = {escape_string(SOURCE_TYPE_SHOPPING)}"
            )
            cur.execute(
                f"UPDATE {SCHEMA}.shopping_items_v2 "
                f"SET linked_transaction_id = NULL "
                f"WHERE id::text = {escape_string(item_id)}"
            )
            item_dict['linked_transaction_id'] = None

        conn.commit()

        if 'priority' in data and data['priority'] == 'urgent':
            try:
                send_push_notification(family_id, "🚨 Срочная покупка", f"Помечено срочным: {item_dict.get('name', 'Товар')}")
            except Exception as push_err:
                print(f"[push] {push_err}")

        return item_dict
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def delete_shopping_item(item_id: str, family_id: str) -> Dict[str, Any]:
    """Удаляет товар и связанную финансовую транзакцию атомарно."""
    conn = get_db_connection_tx()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT linked_transaction_id FROM {SCHEMA}.shopping_items_v2 "
            f"WHERE id::text = {escape_string(item_id)} "
            f"AND family_id::text = {escape_string(family_id)} "
            f"FOR UPDATE"
        )
        row = cur.fetchone()
        if not row:
            conn.rollback()
            return {'error': 'Покупка не найдена'}

        linked_tx_id = row.get('linked_transaction_id')
        if linked_tx_id:
            cur.execute(
                f"DELETE FROM {SCHEMA}.finance_transactions "
                f"WHERE id::text = {escape_string(str(linked_tx_id))} "
                f"AND family_id::text = {escape_string(family_id)} "
                f"AND source_type = {escape_string(SOURCE_TYPE_SHOPPING)}"
            )

        cur.execute(
            f"DELETE FROM {SCHEMA}.shopping_items_v2 "
            f"WHERE id::text = {escape_string(item_id)} "
            f"AND family_id::text = {escape_string(family_id)}"
        )
        conn.commit()
        return {'success': True}
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def clear_bought_items(family_id: str) -> Dict[str, Any]:
    """Удаляет купленные товары и их связанные финансовые транзакции."""
    conn = get_db_connection_tx()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Сначала собираем все linked_transaction_id и удаляем их
        cur.execute(
            f"SELECT linked_transaction_id FROM {SCHEMA}.shopping_items_v2 "
            f"WHERE family_id::text = {escape_string(family_id)} AND bought = TRUE "
            f"AND linked_transaction_id IS NOT NULL"
        )
        linked_ids = [str(r['linked_transaction_id']) for r in cur.fetchall() if r.get('linked_transaction_id')]
        for tx_id in linked_ids:
            cur.execute(
                f"DELETE FROM {SCHEMA}.finance_transactions "
                f"WHERE id::text = {escape_string(tx_id)} "
                f"AND family_id::text = {escape_string(family_id)} "
                f"AND source_type = {escape_string(SOURCE_TYPE_SHOPPING)}"
            )
        cur.execute(
            f"DELETE FROM {SCHEMA}.shopping_items_v2 "
            f"WHERE family_id::text = {escape_string(family_id)} AND bought = TRUE"
        )
        conn.commit()
        return {'success': True}
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        family_id = get_user_family_id(user_id)
        if not family_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Пользователь не привязан к семье'})
            }
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            bought_param = params.get('bought') if params else None
            bought = None if bought_param is None else bought_param.lower() == 'true'
            
            items = get_shopping_items(family_id, bought)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'items': items}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')
            
            if action == 'clear_bought':
                result = clear_bought_items(family_id)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            else:
                item = create_shopping_item(family_id, user_id, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'item': item}, default=str)
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            item_id = body.get('id')
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID покупки'})
                }
            
            item = update_shopping_item(item_id, family_id, user_id, body)
            if 'error' in item:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps(item)
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'item': item}, default=str)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            item_id = params.get('id') if params else None
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Требуется ID покупки'})
                }
            
            result = delete_shopping_item(item_id, family_id)
            if 'error' in result:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps(result)
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }
        print(f"[ERROR] Exception occurred: {error_details}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e), 'type': type(e).__name__})
        }