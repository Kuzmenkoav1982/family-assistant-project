'''
Business: Создание демо-данных для органайзера семьи
Args: event - dict с httpMethod
      context - объект с атрибутами request_id
Returns: HTTP response dict с результатом создания данных
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    # CORS OPTIONS handling
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
            'body': json.dumps({'error': 'Only POST allowed'}),
            'isBase64Encoded': False
        }
    
    # Database connection
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Use default demo family ID
        family_id_uuid = '00000000-0000-0000-0000-000000000001'  # UUID для новых таблиц
        family_id_int = 1  # Integer для старых таблиц
        
        # Shopping items (UUID)
        shopping_items = [
            (family_id_uuid, 'Молоко', 'products', '2 л', 'normal', False, 'Мама'),
            (family_id_uuid, 'Хлеб', 'products', '1 шт', 'urgent', False, 'Папа'),
            (family_id_uuid, 'Яблоки', 'products', '1 кг', 'normal', False, 'Мама'),
            (family_id_uuid, 'Стиральный порошок', 'household', '1 уп', 'normal', False, 'Мама'),
            (family_id_uuid, 'Бумажные полотенца', 'household', '2 уп', 'normal', True, 'Папа'),
            (family_id_uuid, 'Куриное филе', 'products', '500 г', 'normal', False, 'Мама'),
        ]
        
        for item in shopping_items:
            cursor.execute('''
                INSERT INTO shopping_items (family_id, name, category, quantity, priority, bought, added_by_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', item)
        
        # Family goals (UUID)
        goals = [
            (family_id_uuid, 'Купить дом', 'Накопить на первоначальный взнос', 'financial', '2026-12-31', 35, 'active', 'Папа'),
            (family_id_uuid, 'Семейный отпуск', 'Поехать всей семьей на море', 'leisure', '2026-07-01', 60, 'active', 'Мама'),
            (family_id_uuid, 'Здоровый образ жизни', 'Заниматься спортом 3 раза в неделю', 'health', '2026-12-31', 45, 'active', 'Папа'),
            (family_id_uuid, 'Изучение английского', 'Вся семья учит английский', 'education', '2026-06-30', 20, 'active', 'Мама'),
        ]
        
        for goal in goals:
            cursor.execute('''
                INSERT INTO family_goals (family_id, title, description, category, target_date, progress, status, created_by_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', goal)
        
        # Important dates
        today = datetime.now().date()
        # Important dates (UUID)
        dates = [
            (family_id_uuid, 'День рождения Маши', today + timedelta(days=45), 'birthday', 'Дочке исполнится 10 лет', True),
            (family_id_uuid, 'Годовщина свадьбы', today + timedelta(days=120), 'anniversary', '15 лет вместе', True),
            (family_id_uuid, 'День рождения бабушки', today + timedelta(days=30), 'birthday', 'Бабушке 70 лет', True),
            (family_id_uuid, 'Новый год', today + timedelta(days=36), 'holiday', 'Семейный праздник', True),
        ]
        
        for date_item in dates:
            cursor.execute('''
                INSERT INTO important_dates (family_id, title, date, type, description, recurring)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', date_item)
        
        # Calendar events (integer)
        events = [
            (family_id_int, 'Родительское собрание', 'В школе у Маши', today + timedelta(days=7), '18:00', 'Мама', 'family', 'education', 'blue'),
            (family_id_int, 'Поход к врачу', 'Плановый осмотр', today + timedelta(days=14), '10:30', 'Папа', 'family', 'health', 'green'),
            (family_id_int, 'Семейный ужин', 'Пригласили бабушку', today + timedelta(days=3), '19:00', 'Мама', 'family', 'family', 'purple'),
            (family_id_int, 'День рождения друга', 'День рождения Пети', today + timedelta(days=21), '15:00', 'Маша', 'family', 'celebration', 'orange'),
        ]
        
        for event in events:
            cursor.execute('''
                INSERT INTO calendar_events (family_id, title, description, date, time, created_by_name, visibility, category, color)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', event)
        
        # Traditions (integer)
        traditions = [
            (family_id_int, 'Воскресный завтрак', 'Каждое воскресенье готовим блины всей семьей', 'weekly', '🥞', [1, 2, 3]),
            (family_id_int, 'Вечер настольных игр', 'Каждую пятницу играем в настольные игры', 'weekly', '🎲', [1, 2, 3]),
            (family_id_int, 'Семейный кинопросмотр', 'Смотрим фильм каждую субботу', 'weekly', '🎬', [1, 2, 3]),
            (family_id_int, 'Летний пикник', 'Пикник на природе в первое воскресенье лета', 'yearly', '🧺', [1, 2, 3]),
        ]
        
        for tradition in traditions:
            cursor.execute('''
                INSERT INTO traditions (family_id, title, description, frequency, icon, participants)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', tradition)
        
        # Blog posts (integer)
        posts = [
            (family_id_int, 'Наш первый семейный поход', 'Мама', 'travel', 'Невероятные впечатления от похода в горы', 'В прошлые выходные мы всей семьей отправились в поход. Это был наш первый опыт с палатками. Дети были в восторге!', 15, 3),
            (family_id_int, 'Маша научилась плавать', 'Папа', 'achievements', 'Гордимся нашей дочкой!', 'Сегодня Маша самостоятельно проплыла 25 метров в бассейне. Мы так гордимся ею!', 22, 5),
            (family_id_int, 'Рецепт бабушкиных пирожков', 'Мама', 'recipes', 'Семейный рецепт, передающийся из поколения в поколение', 'Делюсь рецептом вкуснейших пирожков с капустой от моей бабушки...', 18, 7),
        ]
        
        for post in posts:
            cursor.execute('''
                INSERT INTO blog_posts (family_id, title, author_name, category, excerpt, content, likes, comments_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', post)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Demo data created successfully',
                'counts': {
                    'shopping_items': len(shopping_items),
                    'family_goals': len(goals),
                    'important_dates': len(dates),
                    'calendar_events': len(events),
                    'traditions': len(traditions),
                    'blog_posts': len(posts)
                }
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()