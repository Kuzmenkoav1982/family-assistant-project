"""
Business: Admin API для управления подписками, промокодами и аналитикой
Args: event с httpMethod, path, queryStringParameters, headers с X-Admin-Token
Returns: JSON с данными дашборда, подписок, промокодов или отчётов
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'
ADMIN_TOKEN = 'admin_authenticated'  # В продакшене использовать реальную авторизацию

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_admin(token: str) -> bool:
    """Проверка прав администратора"""
    return token == ADMIN_TOKEN

def get_dashboard_stats() -> Dict[str, Any]:
    """Получить статистику для главного дашборда"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Общая статистика подписок
    cur.execute(f"""
        SELECT 
            COUNT(*) as total_subscriptions,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_subscriptions,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
            SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as mrr
        FROM {SCHEMA}.subscriptions
    """)
    subscription_stats = cur.fetchone()
    
    # Статистика по тарифам
    cur.execute(f"""
        SELECT 
            plan_type,
            COUNT(*) as count,
            SUM(amount) as revenue
        FROM {SCHEMA}.subscriptions
        WHERE status = 'active'
        GROUP BY plan_type
    """)
    plans_breakdown = cur.fetchall()
    
    # Подписки истекающие в ближайшие 3 дня
    cur.execute(f"""
        SELECT DISTINCT ON (s.id)
            s.id,
            s.plan_type,
            s.end_date,
            f.name as family_name,
            u.email as owner_email
        FROM {SCHEMA}.subscriptions s
        JOIN {SCHEMA}.families f ON s.family_id = f.id
        JOIN {SCHEMA}.family_members fm ON f.id = fm.family_id AND fm.access_role = 'admin'
        JOIN {SCHEMA}.users u ON fm.user_id = u.id
        WHERE s.status = 'active' 
        AND s.end_date <= CURRENT_TIMESTAMP + INTERVAL '3 days'
        AND s.end_date > CURRENT_TIMESTAMP
        ORDER BY s.id, fm.created_at ASC
        LIMIT 10
    """)
    expiring_soon = cur.fetchall()
    
    # Выручка за последние 30 дней
    cur.execute(f"""
        SELECT 
            DATE(created_at) as date,
            SUM(amount) as daily_revenue
        FROM {SCHEMA}.payments
        WHERE status = 'succeeded'
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    """)
    revenue_chart = cur.fetchall()
    
    # Конверсия (упрощённая версия)
    cur.execute(f"""
        SELECT 
            COUNT(DISTINCT family_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM {SCHEMA}.families), 0) as conversion_rate
        FROM {SCHEMA}.subscriptions
        WHERE status IN ('active', 'cancelled')
    """)
    conversion = cur.fetchone()
    
    # Статистика промокодов
    cur.execute(f"""
        SELECT 
            COUNT(*) as total_promos,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_promos,
            SUM(current_uses) as total_uses
        FROM {SCHEMA}.promo_codes
    """)
    promo_stats = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return {
        'subscription_stats': dict(subscription_stats) if subscription_stats else {},
        'plans_breakdown': [dict(p) for p in plans_breakdown],
        'expiring_soon': [dict(e) for e in expiring_soon],
        'revenue_chart': [dict(r) for r in revenue_chart],
        'conversion_rate': float(conversion['conversion_rate']) if conversion and conversion['conversion_rate'] else 0,
        'promo_stats': dict(promo_stats) if promo_stats else {}
    }

def get_all_subscriptions(filters: Dict[str, str]) -> List[Dict[str, Any]]:
    """Получить список всех подписок с фильтрами"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    where_clauses = []
    status_filter = filters.get('status', '')
    plan_filter = filters.get('plan', '')
    search_query = filters.get('search', '')
    
    if status_filter and status_filter != 'all':
        safe_status = status_filter.replace("'", "''")
        where_clauses.append(f"s.status = '{safe_status}'")
    
    if plan_filter and plan_filter != 'all':
        safe_plan = plan_filter.replace("'", "''")
        where_clauses.append(f"s.plan_type = '{safe_plan}'")
    
    if search_query:
        safe_search = search_query.replace("'", "''")
        where_clauses.append(f"(f.name ILIKE '%{safe_search}%' OR u.email ILIKE '%{safe_search}%')")
    
    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    cur.execute(f"""
        SELECT DISTINCT ON (s.id)
            s.id,
            s.plan_type,
            s.status,
            s.amount,
            s.start_date,
            s.end_date,
            s.auto_renew,
            f.id as family_id,
            f.name as family_name,
            u.email as owner_email,
            fm.name as owner_name
        FROM {SCHEMA}.subscriptions s
        JOIN {SCHEMA}.families f ON s.family_id = f.id
        JOIN {SCHEMA}.family_members fm ON f.id = fm.family_id AND fm.access_role = 'admin'
        JOIN {SCHEMA}.users u ON fm.user_id = u.id
        {where_sql}
        ORDER BY s.id, fm.created_at ASC
        LIMIT 100
    """)
    
    subscriptions = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(s) for s in subscriptions]

def get_subscription_details(subscription_id: str) -> Optional[Dict[str, Any]]:
    """Получить детальную информацию о подписке"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_id = subscription_id.replace("'", "''")
    
    cur.execute(f"""
        SELECT 
            s.*,
            f.name as family_name,
            f.id as family_id,
            u.email as owner_email,
            fm.name as owner_name
        FROM {SCHEMA}.subscriptions s
        JOIN {SCHEMA}.families f ON s.family_id = f.id
        JOIN {SCHEMA}.family_members fm ON f.id = fm.family_id AND fm.access_role = 'admin'
        JOIN {SCHEMA}.users u ON fm.user_id = u.id
        WHERE s.id = '{safe_id}'
    """)
    subscription = cur.fetchone()
    
    if not subscription:
        cur.close()
        conn.close()
        return None
    
    # История платежей
    cur.execute(f"""
        SELECT * FROM {SCHEMA}.payments
        WHERE subscription_id = '{safe_id}'
        ORDER BY created_at DESC
    """)
    payments = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'subscription': dict(subscription),
        'payments': [dict(p) for p in payments]
    }

def get_cohort_analysis() -> Dict[str, Any]:
    """Когортный анализ retention пользователей по месяцам регистрации"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        WITH cohorts AS (
            SELECT 
                DATE_TRUNC('month', created_at) as cohort_month,
                id as family_id
            FROM {SCHEMA}.families
            WHERE created_at >= NOW() - INTERVAL '12 months'
        ),
        activity AS (
            SELECT DISTINCT
                c.cohort_month,
                c.family_id,
                DATE_TRUNC('month', ce.created_at) as activity_month
            FROM cohorts c
            LEFT JOIN {SCHEMA}.calendar_events ce ON c.family_id = ce.family_id
            WHERE ce.created_at IS NOT NULL
        )
        SELECT 
            c.cohort_month,
            COUNT(DISTINCT c.family_id) as users,
            COUNT(DISTINCT CASE 
                WHEN a.activity_month = c.cohort_month 
                THEN a.family_id 
            END) * 100.0 / NULLIF(COUNT(DISTINCT c.family_id), 0) as month0,
            COUNT(DISTINCT CASE 
                WHEN a.activity_month = c.cohort_month + INTERVAL '1 month' 
                THEN a.family_id 
            END) * 100.0 / NULLIF(COUNT(DISTINCT c.family_id), 0) as month1,
            COUNT(DISTINCT CASE 
                WHEN a.activity_month = c.cohort_month + INTERVAL '2 months' 
                THEN a.family_id 
            END) * 100.0 / NULLIF(COUNT(DISTINCT c.family_id), 0) as month2,
            COUNT(DISTINCT CASE 
                WHEN a.activity_month = c.cohort_month + INTERVAL '3 months' 
                THEN a.family_id 
            END) * 100.0 / NULLIF(COUNT(DISTINCT c.family_id), 0) as month3
        FROM cohorts c
        LEFT JOIN activity a ON c.cohort_month = a.cohort_month AND c.family_id = a.family_id
        GROUP BY c.cohort_month
        ORDER BY c.cohort_month DESC
        LIMIT 12
    """)
    cohorts = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {'cohorts': [dict(c) for c in cohorts]}

def extend_subscription(subscription_id: str, days: int, admin_email: str) -> Dict[str, Any]:
    """Продлить подписку на N дней (бесплатно, как подарок)"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        safe_id = subscription_id.replace("'", "''")
        
        cur.execute(f"""
            UPDATE {SCHEMA}.subscriptions
            SET end_date = end_date + INTERVAL '{days} days',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = '{safe_id}'
            RETURNING *
        """)
        updated = cur.fetchone()
        
        # Логируем действие
        safe_email = admin_email.replace("'", "''")
        details_json = json.dumps({'days_added': days}).replace("'", "''")
        
        cur.execute(f"""
            INSERT INTO {SCHEMA}.admin_actions_log 
            (admin_email, action_type, target_type, target_id, details)
            VALUES ('{safe_email}', 'extend_subscription', 'subscription', '{safe_id}', '{details_json}')
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True, 'subscription': dict(updated)}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def change_subscription_plan(subscription_id: str, new_plan: str, admin_email: str) -> Dict[str, Any]:
    """Изменить тариф подписки"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        safe_id = subscription_id.replace("'", "''")
        safe_plan = new_plan.replace("'", "''")
        
        # Получаем старый тариф
        cur.execute(f"""
            SELECT plan_type FROM {SCHEMA}.subscriptions
            WHERE id = '{safe_id}'
        """)
        old_sub = cur.fetchone()
        
        if not old_sub:
            cur.close()
            conn.close()
            return {'error': 'Subscription not found'}
        
        old_plan = old_sub['plan_type']
        
        # Обновляем тариф
        cur.execute(f"""
            UPDATE {SCHEMA}.subscriptions
            SET plan_type = '{safe_plan}',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = '{safe_id}'
            RETURNING *
        """)
        updated = cur.fetchone()
        
        # Логируем действие
        safe_email = admin_email.replace("'", "''")
        details_json = json.dumps({'old_plan': old_plan, 'new_plan': new_plan}).replace("'", "''")
        
        cur.execute(f"""
            INSERT INTO {SCHEMA}.admin_actions_log 
            (admin_email, action_type, target_type, target_id, details)
            VALUES ('{safe_email}', 'change_plan', 'subscription', '{safe_id}', '{details_json}')
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True, 'subscription': dict(updated)}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def get_promo_codes() -> List[Dict[str, Any]]:
    """Получить список всех промокодов"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"""
        SELECT 
            pc.*,
            COALESCE(
                (SELECT SUM(discount_amount) FROM {SCHEMA}.promo_code_usage WHERE promo_code_id = pc.id),
                0
            ) as total_revenue_impact
        FROM {SCHEMA}.promo_codes pc
        ORDER BY created_at DESC
    """)
    
    promos = cur.fetchall()
    cur.close()
    conn.close()
    
    return [dict(p) for p in promos]

def create_promo_code(data: Dict[str, Any], admin_email: str) -> Dict[str, Any]:
    """Создать новый промокод"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        safe_code = data['code'].replace("'", "''")
        safe_type = data['discount_type'].replace("'", "''")
        discount_value = float(data['discount_value'])
        max_uses = data.get('max_uses')
        valid_until = data.get('valid_until')
        safe_email = admin_email.replace("'", "''")
        
        applicable_plans = data.get('applicable_plans')
        plans_sql = f"ARRAY{applicable_plans}::TEXT[]" if applicable_plans else 'NULL'
        max_uses_sql = str(max_uses) if max_uses else 'NULL'
        valid_until_sql = f"'{valid_until}'" if valid_until else 'NULL'
        
        cur.execute(f"""
            INSERT INTO {SCHEMA}.promo_codes 
            (code, discount_type, discount_value, applicable_plans, max_uses, valid_until, created_by)
            VALUES ('{safe_code}', '{safe_type}', {discount_value}, {plans_sql}, {max_uses_sql}, {valid_until_sql}, '{safe_email}')
            RETURNING *
        """)
        
        promo = cur.fetchone()
        
        # Логируем
        details_json = json.dumps(data).replace("'", "''")
        cur.execute(f"""
            INSERT INTO {SCHEMA}.admin_actions_log 
            (admin_email, action_type, target_type, target_id, details)
            VALUES ('{safe_email}', 'create_promo_code', 'promo_code', '{promo['id']}', '{details_json}')
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {'success': True, 'promo_code': dict(promo)}
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {'error': str(e)}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        admin_token = event.get('headers', {}).get('X-Admin-Token', '')
        
        if not verify_admin(admin_token):
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Требуются права администратора'})
            }
        
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        
        # GET ?action=dashboard - статистика
        if method == 'GET' and action == 'dashboard':
            stats = get_dashboard_stats()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(stats, default=str)
            }
        
        # GET ?action=subscriptions - список подписок
        if method == 'GET' and action == 'subscriptions':
            subscriptions = get_all_subscriptions(query_params)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'subscriptions': subscriptions}, default=str)
            }
        
        # GET ?action=subscription&id=xxx - детали подписки
        if method == 'GET' and action == 'subscription':
            sub_id = query_params.get('id', '')
            details = get_subscription_details(sub_id)
            if not details:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Подписка не найдена'})
                }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(details, default=str)
            }
        
        # POST ?action=extend - продлить подписку
        if method == 'POST' and action == 'extend':
            body = json.loads(event.get('body', '{}'))
            sub_id = body.get('subscription_id', '')
            days = body.get('days', 30)
            admin_email = body.get('admin_email', 'admin@family.com')
            
            result = extend_subscription(sub_id, days, admin_email)
            return {
                'statusCode': 200 if 'success' in result else 400,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
        
        # POST ?action=change-plan - изменить тариф
        if method == 'POST' and action == 'change-plan':
            body = json.loads(event.get('body', '{}'))
            sub_id = body.get('subscription_id', '')
            new_plan = body.get('new_plan', '')
            admin_email = body.get('admin_email', 'admin@family.com')
            
            result = change_subscription_plan(sub_id, new_plan, admin_email)
            return {
                'statusCode': 200 if 'success' in result else 400,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
        
        # GET ?action=promo-codes - список промокодов
        if method == 'GET' and action == 'promo-codes':
            promos = get_promo_codes()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'promo_codes': promos}, default=str)
            }
        
        # POST ?action=create-promo - создать промокод
        if method == 'POST' and action == 'create-promo':
            body = json.loads(event.get('body', '{}'))
            admin_email = body.get('admin_email', 'admin@family.com')
            
            result = create_promo_code(body, admin_email)
            return {
                'statusCode': 201 if 'success' in result else 400,
                'headers': headers,
                'body': json.dumps(result, default=str)
            }
        
        # GET ?action=cohort-analysis - когортный анализ
        if method == 'GET' and action == 'cohort-analysis':
            cohort_data = get_cohort_analysis()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(cohort_data, default=str)
            }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Endpoint not found'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }