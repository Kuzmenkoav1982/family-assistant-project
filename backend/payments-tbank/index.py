"""
Управление подписками через Т-Банк (рекуррентные платежи)
Обрабатывает создание подписок, проверку статуса и автопродление
"""

import json
import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')
TBANK_API_KEY = os.environ.get('TBANK_API_KEY', '')
TBANK_TERMINAL_KEY = os.environ.get('TBANK_TERMINAL_KEY', '')

# Email настройки
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@nasha-semiya.ru')
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587

# Тарифные планы (подписки)
SUBSCRIPTION_PLANS = {
    'ai_assistant': {
        'name': 'AI-Помощник Домовой',
        'price': 200,
        'period_days': 30,
        'features': ['AI-чат', 'Умные напоминания', 'Подбор рецептов', 'Анализ бюджета']
    },
    'storage_5gb': {
        'name': 'Хранилище 5 ГБ',
        'price': 99,
        'period_days': 30,
        'features': ['5 ГБ для фото и документов', 'Резервное копирование']
    },
    'storage_20gb': {
        'name': 'Хранилище 20 ГБ',
        'price': 249,
        'period_days': 30,
        'features': ['20 ГБ для фото и документов', 'Резервное копирование', 'Видео-архив']
    },
    'storage_50gb': {
        'name': 'Хранилище 50 ГБ',
        'price': 499,
        'period_days': 30,
        'features': ['50 ГБ для фото и документов', 'Безлимитное резервное копирование']
    },
    'storage_100gb': {
        'name': 'Хранилище 100 ГБ',
        'price': 899,
        'period_days': 30,
        'features': ['100 ГБ для фото и документов', 'Приоритетная загрузка']
    },
    'unlimited_history': {
        'name': 'Безлимитная история',
        'price': 149,
        'period_days': 30,
        'features': ['Вся история событий навсегда', 'Расширенная аналитика']
    },
    'priority_support': {
        'name': 'Приоритетная поддержка',
        'price': 99,
        'period_days': 30,
        'features': ['Ответ в течение 2 часов', 'Персональный менеджер']
    },
    'full_package': {
        'name': 'Полный пакет "Всё включено"',
        'price': 699,
        'period_days': 30,
        'features': [
            'AI-Помощник Домовой',
            '20 ГБ хранилища',
            'Безлимитная история',
            'Приоритетная поддержка',
            'Ранний доступ к новинкам',
            'Бейджик "Друг платформы" 🏆'
        ]
    }
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_token(token: str) -> Optional[str]:
    """Проверка токена авторизации"""
    if not token:
        return None
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_token = token.replace("'", "''")
    cur.execute(
        f"""
        SELECT user_id FROM {SCHEMA}.sessions 
        WHERE token = '{safe_token}' AND expires_at > CURRENT_TIMESTAMP
        """
    )
    session = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(session['user_id']) if session else None

def get_user_family_id(user_id: str) -> Optional[str]:
    """Получение ID семьи пользователя"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_user_id = user_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT family_id FROM {SCHEMA}.family_members 
        WHERE user_id = '{safe_user_id}' LIMIT 1
        """
    )
    member = cur.fetchone()
    cur.close()
    conn.close()
    
    return str(member['family_id']) if member else None

def send_admin_notification(subscription_id: str, plan_name: str, amount: float, family_id: str, user_email: str):
    """Отправка email-уведомления админу о новой подписке"""
    if not SMTP_USER or not SMTP_PASSWORD or not ADMIN_EMAIL:
        return  # Пропускаем если нет настроек
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'🔔 Новая подписка: {plan_name} — {amount}₽'
        msg['From'] = SMTP_USER
        msg['To'] = ADMIN_EMAIL
        
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #7c3aed; margin-bottom: 20px;">💳 Новая подписка оформлена!</h2>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #92400e;">⏳ Ожидает подтверждения оплаты</p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">План:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{plan_name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Сумма:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 18px; color: #7c3aed; font-weight: bold;">{amount}₽</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">ID Семьи:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">{family_id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{user_email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold;">ID Подписки:</td>
                  <td style="padding: 10px; font-family: monospace; font-size: 12px;">{subscription_id}</td>
                </tr>
              </table>
              
              <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>📝 Следующие шаги:</strong></p>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>Проверь поступление денег на счёт Т-Банка</li>
                  <li>Перейди в админ-панель → Подписки → Платежи</li>
                  <li>Подтверди платёж для активации подписки</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://nasha-semiya.ru/admin/subscriptions" 
                   style="display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Перейти в админ-панель
                </a>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 12px; text-align: center;">
                Платформа "Наша семья" • nasha-semiya.ru
              </p>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html, 'html', 'utf-8')
        msg.attach(part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
            
    except Exception as e:
        print(f'Ошибка отправки email: {str(e)}')  # Логируем но не падаем

def create_tbank_payment(amount: float, plan_type: str, user_id: str, family_id: str) -> Dict[str, Any]:
    """
    Создание платежа через Т-Банк (заглушка для интеграции)
    
    В реальной интеграции здесь будет запрос к API Т-Банка:
    https://business.tbank.ru/openapi/docs/payment/init
    """
    
    # Пока возвращаем инструкции для ручной оплаты
    plan = SUBSCRIPTION_PLANS.get(plan_type, {})
    
    return {
        'success': True,
        'payment_method': 'manual',
        'payment_instructions': {
            'bank_name': 'АО «Т-Банк»',
            'inn': '7710140679',
            'bik': '044525974',
            'account': '30101810145250000974',
            'recipient': 'ИП Кузьменко Анастасия Вячеславовна',
            'recipient_inn': '231805288780',
            'recipient_account': '40802810300092188156',
            'amount': amount,
            'purpose': f'Подписка "{plan.get("name", plan_type)}" для семьи {family_id}',
            'qr_image': 'https://cdn.poehali.dev/files/Т-Банк.JPG'
        },
        'next_steps': [
            'Оплатите по указанным реквизитам через приложение Т-Банк',
            'В назначении платежа укажите ваш family_id для автоматической активации',
            'Подписка активируется в течение 1-2 часов после получения платежа'
        ]
    }

def create_subscription(family_id: str, user_id: str, plan_type: str) -> Dict[str, Any]:
    """Создание подписки"""
    if plan_type not in SUBSCRIPTION_PLANS:
        return {'error': f'Неверный тип подписки: {plan_type}'}
    
    plan = SUBSCRIPTION_PLANS[plan_type]
    
    # Создаём платёж
    payment_result = create_tbank_payment(
        plan['price'],
        plan_type,
        user_id,
        family_id
    )
    
    if not payment_result.get('success'):
        return {'error': 'Ошибка создания платежа'}
    
    # Сохраняем подписку в БД со статусом 'pending'
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        subscription_id = str(uuid.uuid4())
        end_date = datetime.now() + timedelta(days=plan['period_days'])
        
        safe_subscription_id = subscription_id.replace("'", "''")
        safe_family_id = family_id.replace("'", "''")
        safe_plan_type = plan_type.replace("'", "''")
        safe_end_date = end_date.strftime('%Y-%m-%d %H:%M:%S')
        
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.subscriptions
            (id, family_id, plan_type, status, amount, end_date, payment_provider, created_at)
            VALUES ('{safe_subscription_id}', '{safe_family_id}', '{safe_plan_type}', 
                    'pending', {plan['price']}, '{safe_end_date}', 'tbank', CURRENT_TIMESTAMP)
            """
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Отправляем уведомление админу
        try:
            # Получаем email пользователя
            conn2 = get_db_connection()
            cur2 = conn2.cursor(cursor_factory=RealDictCursor)
            safe_user_id_check = user_id.replace("'", "''")
            cur2.execute(f"SELECT email FROM {SCHEMA}.users WHERE id = '{safe_user_id_check}'")
            user_data = cur2.fetchone()
            user_email = user_data['email'] if user_data else 'unknown'
            cur2.close()
            conn2.close()
            
            send_admin_notification(subscription_id, plan['name'], plan['price'], family_id, user_email)
        except Exception as e:
            print(f'Email notification error (ignored): {str(e)}')
        
        return {
            'success': True,
            'subscription_id': subscription_id,
            'plan': plan['name'],
            'amount': plan['price'],
            'status': 'pending',
            'payment_instructions': payment_result.get('payment_instructions', {}),
            'next_steps': payment_result.get('next_steps', [])
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': f'Ошибка сохранения подписки: {str(e)}'}

def get_family_subscriptions(family_id: str) -> Dict[str, Any]:
    """Получение всех активных подписок семьи"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_family_id = family_id.replace("'", "''")
    cur.execute(
        f"""
        SELECT id, plan_type, status, amount, start_date, end_date, auto_renew, payment_provider
        FROM {SCHEMA}.subscriptions
        WHERE family_id = '{safe_family_id}' 
        AND (status = 'active' OR status = 'pending')
        ORDER BY created_at DESC
        """
    )
    subscriptions = cur.fetchall()
    
    cur.close()
    conn.close()
    
    if not subscriptions:
        return {
            'has_subscriptions': False,
            'subscriptions': [],
            'message': 'Нет активных подписок'
        }
    
    result_subscriptions = []
    for sub in subscriptions:
        plan = SUBSCRIPTION_PLANS.get(sub['plan_type'], {})
        result_subscriptions.append({
            'id': sub['id'],
            'plan_type': sub['plan_type'],
            'plan_name': plan.get('name', sub['plan_type']),
            'status': sub['status'],
            'amount': float(sub['amount']) if sub['amount'] else 0,
            'end_date': sub['end_date'].isoformat() if sub['end_date'] else None,
            'auto_renew': sub.get('auto_renew', False),
            'features': plan.get('features', []),
            'payment_provider': sub.get('payment_provider', 'unknown')
        })
    
    return {
        'has_subscriptions': True,
        'subscriptions': result_subscriptions
    }

def get_available_plans() -> Dict[str, Any]:
    """Получение списка доступных тарифных планов"""
    plans = []
    for plan_type, plan_data in SUBSCRIPTION_PLANS.items():
        plans.append({
            'plan_type': plan_type,
            'name': plan_data['name'],
            'price': plan_data['price'],
            'period': f"{plan_data['period_days']} дней",
            'features': plan_data['features']
        })
    
    return {'plans': plans}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        
        # GET ?action=plans - список доступных планов (без авторизации)
        if method == 'GET' and action == 'plans':
            result = get_available_plans()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Для остальных методов нужна авторизация
        token = event.get('headers', {}).get('X-Auth-Token', '')
        user_id = verify_token(token)
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуется авторизация'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        family_id = get_user_family_id(user_id)
        if not family_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Пользователь не состоит в семье'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # GET - получение подписок семьи
        if method == 'GET':
            result = get_family_subscriptions(family_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result, ensure_ascii=False, default=str),
                'isBase64Encoded': False
            }
        
        # POST - создание подписки
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', '')
            
            if action == 'create':
                plan_type = body.get('plan_type')
                if not plan_type:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'Не указан plan_type'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                result = create_subscription(family_id, user_id, plan_type)
                
                if 'error' in result:
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps(result, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Неизвестное действие'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Внутренняя ошибка: {str(e)}'}, ensure_ascii=False),
            'isBase64Encoded': False
        }