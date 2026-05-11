import json
import os
import time
import uuid
import hashlib
import requests
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime

SCHEMA = '"t_p5815085_family_assistant_pro"'


def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL не настроен')
    return psycopg2.connect(database_url)


def wallet_spend(user_id, family_id, amount, reason, description):
    """Списание средств с семейного кошелька"""
    if not family_id:
        return {'error': 'no_family'}
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        safe_fid = str(family_id).replace("'", "''")
        cur.execute(
            "SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % safe_fid
        )
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub"
                % safe_fid
            )
            row = cur.fetchone()
            conn.commit()
        wallet_id, balance = row[0], float(row[1])
        if balance < amount:
            return {'error': 'insufficient_funds', 'balance': balance, 'required': amount}
        cur.execute(
            "UPDATE family_wallet SET balance_rub = balance_rub - %s, updated_at = NOW() WHERE id = %d"
            % (amount, wallet_id)
        )
        cur.execute("""
            INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id)
            VALUES (%d, 'spend', %s, '%s', '%s', '%s')
        """ % (wallet_id, amount, reason, description.replace("'", "''"), str(user_id)))
        conn.commit()
        return {'success': True, 'new_balance': round(balance - amount, 2)}
    finally:
        conn.close()


def load_chat_history(family_id: str, limit: int = 10) -> List[Dict[str, str]]:
    try:
        try:
            fid_int = int(str(family_id))
        except (ValueError, TypeError):
            return []
        conn = get_db_connection()
        cursor = conn.cursor()
        query = f"""
            SELECT role, content 
            FROM chat_messages 
            WHERE family_id = {fid_int}
            ORDER BY created_at DESC 
            LIMIT {int(limit)}
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        history = []
        for row in reversed(rows):
            history.append({'role': row[0], 'content': row[1]})
        return history
    except Exception as e:
        print(f'[ERROR] Ошибка загрузки истории: {str(e)}')
        return []


def save_message(family_id: str, user_id: Optional[int], role: str, content: str):
    try:
        try:
            fid_int = int(str(family_id))
        except (ValueError, TypeError):
            print(f'[WARN] save_message: family_id не int: {family_id}')
            return
        uid_val = 'NULL'
        if user_id is not None:
            try:
                uid_val = str(int(str(user_id)))
            except (ValueError, TypeError):
                uid_val = 'NULL'
        conn = get_db_connection()
        cursor = conn.cursor()
        safe_role = role.replace("'", "''")
        safe_content = content.replace("'", "''")
        query = f"""
            INSERT INTO chat_messages (family_id, sender_id, role, content, type, created_at)
            VALUES ({fid_int}, {uid_val}, '{safe_role}', '{safe_content}', 'text', NOW())
        """
        cursor.execute(query)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f'[ERROR] Ошибка сохранения сообщения: {str(e)}')


def write_short_trace(family_id, user_id, role_code, entry_point, model, temperature,
                      max_tokens, history_depth, input_tokens, output_tokens, latency_ms,
                      status, error_code, prompt_checksum, environment='prod'):
    """Краткий trace в БД на каждый AI-ответ (Domovoy Studio §3.4)."""
    try:
        trace_uuid = str(uuid.uuid4())
        conn = get_db_connection()
        cur = conn.cursor()

        def esc(v):
            if v is None:
                return 'NULL'
            return "'" + str(v).replace("'", "''") + "'"

        def num(v):
            return 'NULL' if v is None else str(int(v))

        fid = num(family_id) if family_id else 'NULL'
        uid = num(user_id) if user_id else 'NULL'

        cur.execute(
            f"INSERT INTO {SCHEMA}.domovoy_prompt_traces "
            f"(trace_uuid, family_id, user_id, environment, role_code, entry_point, "
            f" model, temperature, max_tokens, history_depth, "
            f" input_tokens, output_tokens, latency_ms, status, error_code, prompt_checksum) "
            f"VALUES ({esc(trace_uuid)}, {fid}, {uid}, {esc(environment)}, {esc(role_code)}, {esc(entry_point)}, "
            f"{esc(model)}, {('NULL' if temperature is None else str(temperature))}, {num(max_tokens)}, {num(history_depth)}, "
            f"{num(input_tokens)}, {num(output_tokens)}, {num(latency_ms)}, {esc(status)}, {esc(error_code)}, {esc(prompt_checksum)})"
        )
        conn.commit()
        cur.close()
        conn.close()
        return trace_uuid
    except Exception as e:
        print(f'[trace] failed: {e}')
        return None


def detect_role_from_prompt(system_prompt: str) -> Optional[str]:
    """Best-effort определение role_code по началу промпта (до миграции на Studio)."""
    if not system_prompt:
        return None
    markers = {
        'ветеринар': 'vet',
        'специалист по здоровому питанию': 'nutritionist',
        'праздничный организатор': 'party',
        'автомеханик': 'mechanic',
        'художник': 'artist',
        'мудрый наставник': 'mentor',
        'семейный психолог': 'psychologist',
        'специалист по воспитанию': 'child-educator',
        'опытный повар': 'cook',
        'тревел-планер': 'travel-planner',
        'фитнес-тренер': 'fitness-trainer',
        'тайм-менеджменту': 'organizer',
        'финансовый советник': 'financial-advisor',
        'астролог': 'astrologer',
        'семейный помощник': 'family-assistant',
    }
    lower = system_prompt.lower()
    for marker, code in markers.items():
        if marker in lower:
            return code
    return None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''AI-ассистент для семьи на базе YandexGPT'''
    method = event.get('httpMethod', 'POST')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ok', 'service': 'ai-assistant'})
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body_data = json.loads(event.get('body', '{}'))
        messages = body_data.get('messages', [])
        system_prompt = body_data.get('systemPrompt')
        family_id = body_data.get('familyId')
        user_id = body_data.get('userId')

        if not messages:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не указаны сообщения'})
            }

        if not family_id:
            return {
                'statusCode': 403,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'auth_required', 'message': 'Для использования AI-помощника необходимо зарегистрироваться'})
            }

        PRICE = 3
        spend_result = wallet_spend(user_id, family_id, PRICE, 'ai_assistant', 'AI-ассистент')
        if 'error' in spend_result:
            if spend_result['error'] == 'insufficient_funds':
                return {
                    'statusCode': 402,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'error': 'insufficient_funds',
                        'message': f'Недостаточно средств. Нужно {PRICE} руб, на балансе {spend_result.get("balance", 0):.0f} руб. Пополните кошелёк.',
                        'balance': spend_result.get('balance', 0),
                        'required': PRICE
                    })
                }
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': spend_result['error']})
            }
        print(f"[wallet] Charged {PRICE} rub for ai_assistant, new balance: {spend_result.get('new_balance')}")

        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')

        if not api_key or not folder_id:
            return {
                'statusCode': 500,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не настроены ключи YandexGPT'})
            }

        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}

        history_messages = []
        if family_id:
            history_messages = load_chat_history(family_id, limit=10)

        yandex_messages = []
        if system_prompt:
            yandex_messages.append({'role': 'system', 'text': system_prompt})

        for msg in history_messages:
            yandex_messages.append({'role': msg['role'], 'text': msg['content']})

        user_message_content = ''
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'user':
                user_message_content = content
            if role in ['user', 'assistant']:
                yandex_messages.append({'role': role, 'text': content})

        correct_folder_id = 'b1gaglg8i7v2i32nvism'

        model_name = 'yandexgpt-lite'
        temperature = 0.7
        max_tokens_cfg = 3000
        history_depth_cfg = 10

        payload = {
            'modelUri': f'gpt://{correct_folder_id}/{model_name}',
            'completionOptions': {'stream': False, 'temperature': temperature, 'maxTokens': max_tokens_cfg},
            'messages': yandex_messages
        }

        role_code = detect_role_from_prompt(system_prompt or '')
        prompt_checksum = hashlib.sha256((system_prompt or '').encode('utf-8')).hexdigest()[:32]
        approx_input_tokens = sum(len(m.get('text', '')) for m in yandex_messages) // 4

        t0 = time.time()
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
        except requests.exceptions.Timeout:
            latency_ms = int((time.time() - t0) * 1000)
            write_short_trace(family_id, user_id, role_code, 'ai_assistant', model_name,
                              temperature, max_tokens_cfg, history_depth_cfg,
                              approx_input_tokens, 0, latency_ms, 'timeout', 'request_timeout',
                              prompt_checksum)
            return {
                'statusCode': 504,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Таймаут AI'})
            }
        latency_ms = int((time.time() - t0) * 1000)

        if response.status_code != 200:
            print(f'[ERROR] YandexGPT ответ: {response.status_code} {response.text[:500]}')
            write_short_trace(family_id, user_id, role_code, 'ai_assistant', model_name,
                              temperature, max_tokens_cfg, history_depth_cfg,
                              approx_input_tokens, 0, latency_ms, 'error', f'http_{response.status_code}',
                              prompt_checksum)
            return {
                'statusCode': 502,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Ошибка сервиса AI', 'details': f'Status: {response.status_code}'})
            }

        result = response.json()
        ai_text = result.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')

        if not ai_text:
            ai_text = 'Не удалось получить ответ от AI.'

        approx_output_tokens = len(ai_text) // 4

        if family_id and user_message_content:
            save_message(family_id, user_id, 'user', user_message_content)
        if family_id and ai_text:
            save_message(family_id, user_id, 'assistant', ai_text)

        write_short_trace(family_id, user_id, role_code, 'ai_assistant', model_name,
                          temperature, max_tokens_cfg, history_depth_cfg,
                          approx_input_tokens, approx_output_tokens, latency_ms, 'ok', None,
                          prompt_checksum)

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'response': ai_text, 'model': model_name})
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Некорректный JSON'})
        }
    except Exception as e:
        print(f'[ERROR] handler: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'})
        }