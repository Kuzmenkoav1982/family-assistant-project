import json
import os
import psycopg2
import requests
from typing import Dict, Any


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400'
}


def respond(status, body):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(body, ensure_ascii=False)}


def get_user_and_family(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None, None
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM sessions WHERE token = '%s' AND expires_at > NOW()" % token.replace("'", "''"))
        row = cur.fetchone()
        if not row:
            return None, None
        user_id = row[0]
        cur.execute("SELECT family_id FROM family_members WHERE user_id = '%s' LIMIT 1" % str(user_id))
        fm = cur.fetchone()
        return user_id, fm[0] if fm else None
    finally:
        conn.close()


def wallet_spend(user_id, family_id, amount, reason, description):
    if not family_id:
        return {'error': 'no_family'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()
        safe_fid = str(family_id).replace("'", "''")
        cur.execute("SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % safe_fid)
        row = cur.fetchone()
        if not row:
            cur.execute("INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub" % safe_fid)
            row = cur.fetchone()
            conn.commit()
        wallet_id, balance = row[0], float(row[1])
        if balance < amount:
            return {'error': 'insufficient_funds', 'balance': balance, 'required': amount}
        cur.execute("UPDATE family_wallet SET balance_rub = balance_rub - %s, updated_at = NOW() WHERE id = %d" % (amount, wallet_id))
        cur.execute("INSERT INTO wallet_transactions (wallet_id, type, amount_rub, reason, description, user_id) VALUES (%d, 'spend', %s, '%s', '%s', '%s')" % (wallet_id, amount, reason, description.replace("'", "''"), str(user_id)))
        conn.commit()
        return {'success': True, 'new_balance': round(balance - amount, 2)}
    finally:
        conn.close()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Анализирует навыки ребенка, сравнивает с нормами и создает отчет с рекомендациями
    Args: event - dict с httpMethod, body (child_id, family_id, age_range, skills)
          context - объект с атрибутами request_id
    Returns: HTTP response с анализом развития и планом
    '''
    print(f'[START] analyze-development handler called')
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    child_id: int = body_data.get('child_id')
    family_id: int = body_data.get('family_id')
    age_range: str = body_data.get('age_range', '1-2')
    skills: list = body_data.get('skills', [])
    
    if not child_id or not family_id or not skills:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO t_p5815085_family_assistant_pro.child_development_assessments 
        (child_id, family_id, age_range, status) 
        VALUES (%s, %s, %s, 'completed') 
        RETURNING id
    ''', (child_id, family_id, age_range))
    
    assessment_id = cur.fetchone()[0]
    
    for skill in skills:
        cur.execute('''
            INSERT INTO t_p5815085_family_assistant_pro.child_skills 
            (assessment_id, category, skill_name, skill_level) 
            VALUES (%s, %s, %s, %s)
        ''', (assessment_id, skill['category'], skill['skill_name'], skill['skill_level']))
    
    conn.commit()
    
    PRICE = 4
    auth_user_id, auth_family_id = get_user_and_family(event)
    if not auth_user_id:
        cur.close()
        conn.close()
        return respond(401, {'error': 'Не авторизован'})
    spend_result = wallet_spend(auth_user_id, auth_family_id, PRICE, 'ai_child_development', 'Анализ развития ребёнка ИИ')
    if 'error' in spend_result:
        cur.close()
        conn.close()
        if spend_result['error'] == 'insufficient_funds':
            return respond(402, {'error': 'insufficient_funds', 'message': f'Недостаточно средств. Нужно {PRICE} руб, на балансе {spend_result.get("balance", 0):.0f} руб', 'balance': spend_result.get('balance', 0), 'required': PRICE})
        return respond(400, {'error': spend_result['error']})
    print(f"[wallet] Charged {PRICE} rub for ai_child_development")
    
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    # Используем проверенный folder_id из старого каталога
    folder_id = 'b1gaglg8i7v2i32nvism'
    
    skills_summary = "\n".join([
        f"- {s['category']}: {s['skill_name']} ({s['skill_level']})"
        for s in skills
    ])
    
    prompt = f"""Ты педиатр-эксперт по развитию детей. Проанализируй навыки ребенка возраста {age_range} и создай детальный отчет.

Навыки ребенка:
{skills_summary}

Выполни анализ:
1. Оцени уровень развития по каждой категории (проценты от нормы)
2. Определи сильные стороны и зоны роста
3. Сравни с возрастными нормами
4. Создай персональный план развития с конкретными упражнениями

Формат ответа строго JSON:
{{
  "overall_score": 85,
  "categories_analysis": [
    {{
      "category": "Крупная моторика",
      "score": 90,
      "status": "отлично",
      "comment": "Развитие соответствует возрасту"
    }}
  ],
  "strengths": ["Хорошая речь", "Развитая мелкая моторика"],
  "areas_to_improve": ["Крупная моторика", "Социальные навыки"],
  "recommendations": [
    {{
      "category": "Крупная моторика",
      "tasks": [
        "Ходить по бревну или бордюру",
        "Прыгать через препятствия"
      ]
    }}
  ],
  "summary": "Общая оценка развития ребенка"
}}

Будь конкретным, дай практические советы родителям."""

    print(f'[DEBUG] Calling YandexGPT with folder_id: {folder_id}')
    print(f'[DEBUG] Skills count: {len(skills)}')

    try:
        yandex_response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'modelUri': f'gpt://{folder_id}/yandexgpt/latest',
                'completionOptions': {
                    'stream': False,
                    'temperature': 0.7,
                    'maxTokens': 3000
                },
                'messages': [
                    {
                        'role': 'user',
                        'text': prompt
                    }
                ]
            },
            timeout=30
        )
        
        print(f'[DEBUG] YandexGPT response status: {yandex_response.status_code}')
        
    except Exception as e:
        print(f'[ERROR] Request exception: {str(e)}')
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Request failed: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if yandex_response.status_code != 200:
        error_details = 'Неизвестная ошибка'
        try:
            error_data = yandex_response.json()
            error_details = error_data.get('message', error_data)
            print(f'[ERROR] YandexGPT error response: {json.dumps(error_data)}')
        except:
            error_details = yandex_response.text[:200]
            print(f'[ERROR] YandexGPT error text: {error_details}')
        
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'YandexGPT API error: {error_details}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    result = yandex_response.json()
    content = result['result']['alternatives'][0]['message']['text'].strip()
    
    if content.startswith('```json'):
        content = content[7:]
    if content.startswith('```'):
        content = content[3:]
    if content.endswith('```'):
        content = content[:-3]
    
    analysis = json.loads(content.strip())
    
    cur.execute('''
        INSERT INTO t_p5815085_family_assistant_pro.development_plans 
        (assessment_id, child_id, family_id, plan_data, status, progress) 
        VALUES (%s, %s, %s, %s, 'active', 0) 
        RETURNING id
    ''', (assessment_id, child_id, family_id, json.dumps(analysis, ensure_ascii=False)))
    
    plan_id = cur.fetchone()[0]
    
    for rec in analysis.get('recommendations', []):
        for task in rec.get('tasks', []):
            cur.execute('''
                INSERT INTO t_p5815085_family_assistant_pro.plan_tasks 
                (plan_id, category, task_description, completed) 
                VALUES (%s, %s, %s, false)
            ''', (plan_id, rec['category'], task))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'assessment_id': assessment_id,
            'plan_id': plan_id,
            'analysis': analysis
        }, ensure_ascii=False),
        'isBase64Encoded': False
    }