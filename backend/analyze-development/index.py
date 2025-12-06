import json
import os
import psycopg2
from typing import Dict, Any
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Анализирует навыки ребенка, сравнивает с нормами и создает отчет с рекомендациями
    Args: event - dict с httpMethod, body (child_id, family_id, age_range, skills)
          context - объект с атрибутами request_id
    Returns: HTTP response с анализом развития и планом
    '''
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
    
    client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
    
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

    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.7,
        max_tokens=3000
    )
    
    content = response.choices[0].message.content.strip()
    
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
