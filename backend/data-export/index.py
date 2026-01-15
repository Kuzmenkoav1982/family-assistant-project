"""
Business: Экспорт данных семьи в PDF или Excel для резервных копий
Args: event с httpMethod, queryStringParameters (format: pdf/excel), headers с X-Auth-Token
Returns: файл PDF или Excel со всеми данными семьи
"""

import json
import os
import csv
import io
from datetime import datetime
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from audit_helper import log_data_export

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = %s AND expires_at > CURRENT_TIMESTAMP
        """,
        (token,)
    )
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_family_data(user_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        f"""
        SELECT fm.family_id, f.name as family_name
        FROM {SCHEMA}.family_members fm
        JOIN {SCHEMA}.families f ON fm.family_id = f.id
        WHERE fm.user_id = %s LIMIT 1
        """,
        (user_id,)
    )
    family_info = cur.fetchone()
    
    if not family_info:
        cur.close()
        conn.close()
        return {'error': 'Семья не найдена'}
    
    family_id = family_info['family_id']
    
    cur.execute(
        f"""
        SELECT id, name, role, relationship, points, level, workload, created_at
        FROM {SCHEMA}.family_members
        WHERE family_id = %s
        ORDER BY created_at
        """,
        (family_id,)
    )
    members = cur.fetchall()
    
    cur.execute(
        f"""
        SELECT t.id, t.title, t.description, t.completed, t.points, t.priority, 
               t.category, t.created_at, fm.name as assignee_name
        FROM {SCHEMA}.tasks t
        LEFT JOIN {SCHEMA}.family_members fm ON t.assignee_id = fm.id
        WHERE t.family_id = %s
        ORDER BY t.created_at DESC
        """,
        (family_id,)
    )
    tasks = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'family_name': family_info['family_name'],
        'members': [dict(m) for m in members],
        'tasks': [dict(t) for t in tasks],
        'export_date': datetime.now().isoformat()
    }

def generate_csv_export(data: Dict[str, Any]) -> str:
    output = io.StringIO()
    
    output.write(f"Семейный Органайзер - Экспорт данных\n")
    output.write(f"Семья: {data['family_name']}\n")
    output.write(f"Дата экспорта: {datetime.now().strftime('%d.%m.%Y %H:%M')}\n")
    output.write("\n")
    
    output.write("=== ЧЛЕНЫ СЕМЬИ ===\n")
    output.write("Имя,Роль,Родство,Баллы,Уровень,Загрузка %,Дата добавления\n")
    for member in data['members']:
        output.write(f"{member['name']},{member['role']},{member.get('relationship', '')},{member['points']},{member['level']},{member['workload']},{member['created_at']}\n")
    
    output.write("\n=== ЗАДАЧИ ===\n")
    output.write("Название,Описание,Исполнитель,Выполнена,Баллы,Приоритет,Категория,Дата создания\n")
    for task in data['tasks']:
        completed = 'Да' if task['completed'] else 'Нет'
        desc = (task['description'] or '').replace('\n', ' ').replace(',', ';')
        output.write(f"{task['title']},{desc},{task.get('assignee_name', '')},{completed},{task['points']},{task['priority']},{task.get('category', '')},{task['created_at']}\n")
    
    output.write(f"\n=== СТАТИСТИКА ===\n")
    output.write(f"Всего членов семьи,{len(data['members'])}\n")
    output.write(f"Всего задач,{len(data['tasks'])}\n")
    output.write(f"Выполнено задач,{sum(1 for t in data['tasks'] if t['completed'])}\n")
    output.write(f"Общие баллы семьи,{sum(m['points'] for m in data['members'])}\n")
    
    return output.getvalue()

def generate_html_for_pdf(data: Dict[str, Any]) -> str:
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            h1 {{ color: #2563eb; }}
            h2 {{ color: #4b5563; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th {{ background: #3b82f6; color: white; padding: 12px; text-align: left; }}
            td {{ padding: 10px; border-bottom: 1px solid #e5e7eb; }}
            .completed {{ color: #10b981; font-weight: bold; }}
            .pending {{ color: #ef4444; }}
            .stats {{ background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <h1>🏠 Семейный Органайзер</h1>
        <p><strong>Семья:</strong> {data['family_name']}</p>
        <p><strong>Дата экспорта:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
        
        <h2>👨‍👩‍👧‍👦 Члены семьи</h2>
        <table>
            <tr>
                <th>Имя</th>
                <th>Роль</th>
                <th>Родство</th>
                <th>Баллы</th>
                <th>Уровень</th>
                <th>Загрузка</th>
            </tr>
    """
    
    for member in data['members']:
        html += f"""
            <tr>
                <td>{member['name']}</td>
                <td>{member['role']}</td>
                <td>{member.get('relationship', '-')}</td>
                <td>{member['points']}</td>
                <td>{member['level']}</td>
                <td>{member['workload']}%</td>
            </tr>
        """
    
    html += """
        </table>
        
        <h2>✅ Задачи</h2>
        <table>
            <tr>
                <th>Название</th>
                <th>Исполнитель</th>
                <th>Статус</th>
                <th>Баллы</th>
                <th>Приоритет</th>
            </tr>
    """
    
    for task in data['tasks'][:50]:
        status = '<span class="completed">✓ Выполнена</span>' if task['completed'] else '<span class="pending">⏳ В работе</span>'
        html += f"""
            <tr>
                <td>{task['title']}</td>
                <td>{task.get('assignee_name', '-')}</td>
                <td>{status}</td>
                <td>{task['points']}</td>
                <td>{task['priority']}</td>
            </tr>
        """
    
    total_tasks = len(data['tasks'])
    completed_tasks = sum(1 for t in data['tasks'] if t['completed'])
    total_points = sum(m['points'] for m in data['members'])
    
    html += f"""
        </table>
        
        <div class="stats">
            <h2>📊 Статистика</h2>
            <p><strong>Всего членов семьи:</strong> {len(data['members'])}</p>
            <p><strong>Всего задач:</strong> {total_tasks}</p>
            <p><strong>Выполнено задач:</strong> {completed_tasks} ({round(completed_tasks/total_tasks*100 if total_tasks > 0 else 0)}%)</p>
            <p><strong>Общие баллы семьи:</strong> {total_points}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
            Экспортировано из Семейного Органайзера • poehali.dev
        </p>
    </body>
    </html>
    """
    
    return html

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        data = get_family_data(user_id)
        
        if 'error' in data:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(data)
            }
        
        params = event.get('queryStringParameters', {})
        export_format = params.get('format', 'csv').lower()
        
        # Подсчет количества записей
        total_records = len(data.get('members', [])) + len(data.get('tasks', []))
        
        # Логирование экспорта
        log_data_export(
            user_id=int(user_id),
            export_format=export_format,
            records_count=total_records
        )
        
        if export_format == 'pdf':
            html_content = generate_html_for_pdf(data)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': f'attachment; filename="family_export_{datetime.now().strftime("%Y%m%d")}.html"'
                },
                'body': html_content
            }
        
        else:
            csv_content = generate_csv_export(data)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': f'attachment; filename="family_export_{datetime.now().strftime("%Y%m%d")}.csv"'
                },
                'body': csv_content
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }