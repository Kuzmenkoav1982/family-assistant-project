"""
Backend функция для работы с питанием и подсчётом калорий.
Поддерживает: поиск продуктов, расчёт калорий, работу с дневником питания, аналитику.
"""

import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor


def decimal_to_float(obj):
    """Конвертирует Decimal в float для JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def get_db_connection():
    """Создаёт подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обрабатывает запросы для работы с питанием и калориями
    
    GET /?action=search&query=молоко - поиск продуктов
    GET /?action=products - получить все продукты
    GET /?action=diary&user_id=1&date=2024-01-15 - дневник питания
    POST / body: {"action":"add_diary",...} - добавить запись в дневник
    POST / body: {"action":"update_diary","entry_id":1,...} - обновить запись в дневнике
    POST / body: {"action":"delete_diary","entry_id":1} - удалить запись из дневника
    GET /?action=analytics&user_id=1&date=2024-01-15 - аналитика за день
    GET /?action=goals&user_id=1 - получить цели пользователя
    POST / body: {"action":"set_goals",...} - установить цели пользователя
    POST / body: {"action":"calculate",...} - рассчитать калории для рецепта/блюда
    """
    
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    # CORS
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': '', 'isBase64Encoded': False}
    
    try:
        conn = get_db_connection()
        
        # Поиск продуктов
        if method == 'GET' and action == 'search':
            query = params.get('query', '')
            products = search_products(conn, query)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'products': products}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Получить все продукты
        if method == 'GET' and action == 'products':
            category = params.get('category')
            products = get_products(conn, category)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'products': products}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Дневник питания
        if method == 'GET' and action == 'diary':
            user_id = int(params.get('user_id', 1))
            diary_date = params.get('date', str(date.today()))
            diary = get_food_diary(conn, user_id, diary_date)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'diary': diary}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Добавить запись в дневник
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            post_action = body.get('action', '')
            
            if post_action == 'add_diary':
                entry = add_diary_entry(conn, body)
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'entry': entry}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if post_action == 'update_diary':
                entry = update_diary_entry(conn, body)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'entry': entry}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            if post_action == 'delete_diary':
                entry_id = body.get('entry_id')
                delete_diary_entry(conn, entry_id)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'success': True}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Аналитика питания
        if method == 'GET' and action == 'analytics':
            user_id = int(params.get('user_id', 1))
            analytics_date = params.get('date', str(date.today()))
            analytics = get_nutrition_analytics(conn, user_id, analytics_date)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(analytics, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Получить цели пользователя
        if method == 'GET' and action == 'goals':
            user_id = int(params.get('user_id', 1))
            goals = get_user_goals(conn, user_id)
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'goals': goals}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        # Установить цели пользователя (POST)
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            post_action = body.get('action', '')
            
            if post_action == 'set_goals':
                goals = set_user_goals(conn, body)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'goals': goals}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        # Расчёт калорий для рецепта (POST)
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            post_action = body.get('action', '')
            
            if post_action == 'calculate':
                result = calculate_recipe_nutrition(conn, body)
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(result, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'conn' in locals():
            conn.close()


def search_products(conn, query: str) -> List[Dict]:
    """Поиск продуктов по названию"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM nutrition_products WHERE LOWER(name) LIKE LOWER(%s) LIMIT 20",
            (f'%{query}%',)
        )
        results = []
        for row in cur.fetchall():
            result = dict(row)
            # Конвертируем Decimal и datetime в JSON-совместимые типы
            for key, value in result.items():
                if isinstance(value, Decimal):
                    result[key] = float(value)
                elif isinstance(value, (datetime, date)):
                    result[key] = value.isoformat()
            results.append(result)
        return results


def get_products(conn, category: Optional[str] = None) -> List[Dict]:
    """Получить все продукты или по категории"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        if category:
            cur.execute("SELECT * FROM nutrition_products WHERE category = %s ORDER BY name", (category,))
        else:
            cur.execute("SELECT * FROM nutrition_products ORDER BY category, name")
        results = []
        for row in cur.fetchall():
            result = dict(row)
            for key, value in result.items():
                if isinstance(value, Decimal):
                    result[key] = float(value)
                elif isinstance(value, (datetime, date)):
                    result[key] = value.isoformat()
            results.append(result)
        return results


def get_food_diary(conn, user_id: int, diary_date: str) -> List[Dict]:
    """Получить дневник питания за день"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT fd.*, np.name as product_full_name, np.unit
            FROM food_diary fd
            LEFT JOIN nutrition_products np ON fd.product_id = np.id
            WHERE fd.user_id = %s AND fd.date = %s
            ORDER BY fd.created_at
            """,
            (user_id, diary_date)
        )
        return [dict(row) for row in cur.fetchall()]


def add_diary_entry(conn, data: Dict) -> Dict:
    """Добавить запись в дневник питания"""
    user_id = data['user_id']
    meal_type = data['meal_type']
    product_id = data.get('product_id')
    product_name = data.get('product_name')
    amount = float(data['amount'])
    
    # Если указан product_id, берём данные из базы
    if product_id:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM nutrition_products WHERE id = %s", (product_id,))
            product = dict(cur.fetchone())
            
            # Пересчитываем на указанное количество (конвертируем Decimal в float)
            calories = (float(product['calories']) * amount) / 100
            protein = (float(product['protein']) * amount) / 100
            fats = (float(product['fats']) * amount) / 100
            carbs = (float(product['carbs']) * amount) / 100
            product_name = product['name']
    else:
        # Если продукта нет в базе, используем переданные значения
        calories = data.get('calories', 0)
        protein = data.get('protein', 0)
        fats = data.get('fats', 0)
        carbs = data.get('carbs', 0)
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO food_diary (user_id, date, meal_type, product_id, product_name, 
                                   amount, calories, protein, fats, carbs, notes)
            VALUES (%s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, meal_type, product_id, product_name, amount, 
             calories, protein, fats, carbs, data.get('notes'))
        )
        conn.commit()
        return dict(cur.fetchone())


def update_diary_entry(conn, data: Dict) -> Dict:
    """Обновить запись в дневнике питания"""
    entry_id = data['entry_id']
    amount = float(data['amount'])
    meal_type = data.get('meal_type')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Получаем текущую запись
        cur.execute("SELECT * FROM food_diary WHERE id = %s", (entry_id,))
        entry = dict(cur.fetchone())
        
        # Если есть product_id, пересчитываем БЖУ
        if entry.get('product_id'):
            cur.execute("SELECT * FROM nutrition_products WHERE id = %s", (entry['product_id'],))
            product = dict(cur.fetchone())
            
            calories = (float(product['calories']) * amount) / 100
            protein = (float(product['protein']) * amount) / 100
            fats = (float(product['fats']) * amount) / 100
            carbs = (float(product['carbs']) * amount) / 100
            
            cur.execute(
                """
                UPDATE food_diary 
                SET amount = %s, meal_type = %s, calories = %s, protein = %s, fats = %s, carbs = %s
                WHERE id = %s
                RETURNING *
                """,
                (amount, meal_type or entry['meal_type'], calories, protein, fats, carbs, entry_id)
            )
        else:
            cur.execute(
                "UPDATE food_diary SET amount = %s, meal_type = %s WHERE id = %s RETURNING *",
                (amount, meal_type or entry['meal_type'], entry_id)
            )
        
        conn.commit()
        return dict(cur.fetchone())


def delete_diary_entry(conn, entry_id: int) -> None:
    """Удалить запись из дневника питания"""
    with conn.cursor() as cur:
        cur.execute("DELETE FROM food_diary WHERE id = %s", (entry_id,))
        conn.commit()


def get_nutrition_analytics(conn, user_id: int, analytics_date: str) -> Dict:
    """Получить аналитику питания за день"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Суммарные показатели за день
        cur.execute(
            """
            SELECT 
                COALESCE(SUM(calories), 0) as total_calories,
                COALESCE(SUM(protein), 0) as total_protein,
                COALESCE(SUM(fats), 0) as total_fats,
                COALESCE(SUM(carbs), 0) as total_carbs,
                COUNT(*) as entries_count
            FROM food_diary
            WHERE user_id = %s AND date = %s
            """,
            (user_id, analytics_date)
        )
        totals_row = dict(cur.fetchone())
        # Конвертируем Decimal в float
        totals = {}
        for key, value in totals_row.items():
            totals[key] = float(value) if isinstance(value, Decimal) else value
        
        # По типам приёма пищи
        cur.execute(
            """
            SELECT 
                meal_type,
                COALESCE(SUM(calories), 0) as calories,
                COALESCE(SUM(protein), 0) as protein,
                COALESCE(SUM(fats), 0) as fats,
                COALESCE(SUM(carbs), 0) as carbs
            FROM food_diary
            WHERE user_id = %s AND date = %s
            GROUP BY meal_type
            """,
            (user_id, analytics_date)
        )
        by_meal = []
        for row in cur.fetchall():
            meal = dict(row)
            for key, value in meal.items():
                if isinstance(value, Decimal):
                    meal[key] = float(value)
            by_meal.append(meal)
        
        # Получаем цели пользователя
        cur.execute("SELECT * FROM user_nutrition_goals WHERE user_id = %s", (user_id,))
        goals_row = cur.fetchone()
        if goals_row:
            goals = dict(goals_row)
            for key, value in goals.items():
                if isinstance(value, Decimal):
                    goals[key] = float(value)
        else:
            goals = {
                'daily_calories': 2000,
                'daily_protein': 100,
                'daily_fats': 70,
                'daily_carbs': 250
            }
        
        # Вычисляем процент выполнения
        return {
            'date': analytics_date,
            'totals': totals,
            'by_meal': by_meal,
            'goals': goals,
            'progress': {
                'calories': round((float(totals['total_calories']) / float(goals['daily_calories'])) * 100, 1),
                'protein': round((float(totals['total_protein']) / float(goals['daily_protein'])) * 100, 1),
                'fats': round((float(totals['total_fats']) / float(goals['daily_fats'])) * 100, 1),
                'carbs': round((float(totals['total_carbs']) / float(goals['daily_carbs'])) * 100, 1)
            }
        }


def get_user_goals(conn, user_id: int) -> Optional[Dict]:
    """Получить цели пользователя"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM user_nutrition_goals WHERE user_id = %s", (user_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def set_user_goals(conn, data: Dict) -> Dict:
    """Установить цели пользователя"""
    user_id = data['user_id']
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            INSERT INTO user_nutrition_goals 
            (user_id, daily_calories, daily_protein, daily_fats, daily_carbs, 
             weight, target_weight, height, age, gender, activity_level, goal)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                daily_calories = EXCLUDED.daily_calories,
                daily_protein = EXCLUDED.daily_protein,
                daily_fats = EXCLUDED.daily_fats,
                daily_carbs = EXCLUDED.daily_carbs,
                weight = EXCLUDED.weight,
                target_weight = EXCLUDED.target_weight,
                height = EXCLUDED.height,
                age = EXCLUDED.age,
                gender = EXCLUDED.gender,
                activity_level = EXCLUDED.activity_level,
                goal = EXCLUDED.goal,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
            """,
            (user_id, data.get('daily_calories', 2000), data.get('daily_protein', 100),
             data.get('daily_fats', 70), data.get('daily_carbs', 250),
             data.get('weight'), data.get('target_weight'), data.get('height'),
             data.get('age'), data.get('gender'), data.get('activity_level'), data.get('goal'))
        )
        conn.commit()
        return dict(cur.fetchone())


def calculate_recipe_nutrition(conn, data: Dict) -> Dict:
    """Рассчитать калории и БЖУ для рецепта"""
    ingredients = data.get('ingredients', [])  # [{'product_id': 1, 'amount': 200}, ...]
    servings = data.get('servings', 1)
    
    total_calories = 0
    total_protein = 0
    total_fats = 0
    total_carbs = 0
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        for ing in ingredients:
            product_id = ing.get('product_id')
            amount = float(ing.get('amount', 0))
            
            if product_id:
                cur.execute("SELECT * FROM nutrition_products WHERE id = %s", (product_id,))
                product = dict(cur.fetchone())
                
                # Пересчитываем на количество (конвертируем Decimal в float)
                total_calories += (float(product['calories']) * amount) / 100
                total_protein += (float(product['protein']) * amount) / 100
                total_fats += (float(product['fats']) * amount) / 100
                total_carbs += (float(product['carbs']) * amount) / 100
    
    return {
        'total': {
            'calories': round(total_calories, 1),
            'protein': round(total_protein, 1),
            'fats': round(total_fats, 1),
            'carbs': round(total_carbs, 1)
        },
        'per_serving': {
            'calories': round(total_calories / servings, 1),
            'protein': round(total_protein / servings, 1),
            'fats': round(total_fats / servings, 1),
            'carbs': round(total_carbs / servings, 1)
        },
        'servings': servings
    }