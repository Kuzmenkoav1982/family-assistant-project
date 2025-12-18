"""
Яндекс Алиса навык "Наша Семья"

Обработчик webhook-запросов от Яндекс.Алисы для управления семейным органайзером.
Поддерживает команды для задач, календаря, покупок и семейной статистики.
"""

import json
import os
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработчик запросов от Яндекс.Алисы
    
    Args:
        event: HTTP запрос с данными от Алисы
        context: Контекст выполнения функции
        
    Returns:
        HTTP ответ для Алисы с текстом и кнопками
    """
    method = event.get('httpMethod', 'POST')
    
    # CORS для OPTIONS
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
        return alice_response('Метод не поддерживается', 405)
    
    # Парсим запрос от Алисы
    try:
        alice_request = json.loads(event.get('body', '{}'))
    except json.JSONDecodeError:
        return alice_response('Ошибка парсинга запроса', 400)
    
    # Извлекаем данные
    session = alice_request.get('session', {})
    request_data = alice_request.get('request', {})
    
    yandex_user_id = session.get('user', {}).get('user_id', '')
    command = request_data.get('command', '').lower().strip()
    nlu = request_data.get('nlu', {})
    new_session = session.get('new', False)
    
    # Подключение к БД
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        return build_alice_response('Ошибка конфигурации сервиса', end_session=True)
    
    try:
        conn = psycopg2.connect(db_url)
        
        # Проверка авторизации пользователя
        user_info = get_user_by_yandex_id(conn, yandex_user_id)
        
        # Приветствие для новой сессии
        if new_session:
            if user_info:
                text = f"Привет! Я помогу управлять делами вашей семьи. Что вы хотите узнать?"
            else:
                text = "Привет! Чтобы начать работу, привяжите аккаунт. Скажите: 'Алиса, привяжи аккаунт' и я расскажу как это сделать."
            conn.close()
            return build_alice_response(text, buttons=['Привяжи аккаунт', 'Помощь'])
        
        # Команда помощи доступна всегда (без авторизации)
        if any(word in command for word in ['помощ', 'что ты умеешь', 'команд']):
            conn.close()
            return handle_help_command()
        
        # Команда привязки аккаунта
        if 'привяжи' in command or 'привязать' in command or 'код' in command:
            conn.close()
            return handle_auth_command(yandex_user_id, command, nlu)
        
        # Требуем авторизацию для остальных команд
        if not user_info:
            conn.close()
            return build_alice_response(
                'Сначала привяжите аккаунт. Скажите "привяжи аккаунт" и назовите код из приложения.',
                buttons=['Привяжи аккаунт']
            )
        
        family_id = user_info['family_id']
        member_id = user_info['member_id']
        
        # Обновляем время последнего взаимодействия
        update_last_interaction(conn, yandex_user_id)
        
        # Логируем команду (начало)
        start_time = datetime.now()
        
        # Роутинг команд
        response = route_command(conn, command, nlu, family_id, member_id, yandex_user_id)
        
        # Логируем команду (конец)
        response_time = int((datetime.now() - start_time).total_seconds() * 1000)
        category = detect_command_category(command)
        log_command(conn, yandex_user_id, family_id, command, category, True, None, response_time)
        
        conn.close()
        return response
        
    except Exception as e:
        return build_alice_response(f'Произошла ошибка: {str(e)}', end_session=False)


def route_command(conn, command: str, nlu: Dict, family_id: str, member_id: str, yandex_user_id: str) -> Dict:
    """Маршрутизация команд пользователя"""
    
    # Задачи
    if any(word in command for word in ['задач', 'дел', 'todo', 'список дел']):
        return handle_tasks_command(conn, command, nlu, family_id, member_id)
    
    # Календарь
    elif any(word in command for word in ['календар', 'событи', 'встреч', 'мероприяти']):
        return handle_calendar_command(conn, command, nlu, family_id)
    
    # Покупки
    elif any(word in command for word in ['покупк', 'купить', 'список покупок', 'магазин']):
        return handle_shopping_command(conn, command, nlu, family_id)
    
    # Статистика семьи
    elif any(word in command for word in ['статистик', 'балл', 'рейтинг', 'лидер']):
        return handle_stats_command(conn, family_id)
    
    else:
        return build_alice_response(
            'Не поняла команду. Попробуйте: "задачи на сегодня", "что в календаре", "список покупок".',
            buttons=['Задачи', 'Календарь', 'Покупки', 'Помощь']
        )


def handle_auth_command(yandex_user_id: str, command: str, nlu: Dict) -> Dict:
    """Обработка команды привязки аккаунта"""
    
    print(f"[AUTH] Получена команда: {command}")
    print(f"[AUTH] Yandex User ID: {yandex_user_id}")
    
    # Извлекаем код из команды (формат: XXXX-XXXX, XXXX - XXXX или XXXXXXXX)
    code_match = re.search(r'\b(\d{4})\s*[-\s]\s*(\d{4})\b|\b(\d{8})\b', command)
    
    if not code_match:
        print("[AUTH] Код не найден в команде")
        return build_alice_response(
            'Чтобы привязать аккаунт:\n\n'
            '1. Откройте семейный органайзер на сайте\n'
            '2. Нажмите "Интеграция с Алисой" → "Создать код"\n'
            '3. Скажите мне: "Алиса, привяжи аккаунт с кодом" и назовите 8 цифр',
            buttons=['Отмена']
        )
    
    # Определяем формат кода (с дефисом или без)
    if code_match.group(1):
        code = code_match.group(1) + code_match.group(2)  # Формат: XXXX-XXXX
    else:
        code = code_match.group(3)  # Формат: XXXXXXXX
    
    print(f"[AUTH] Извлечённый код: {code}")
    
    # Проверяем код в БД
    db_url = os.environ.get('DATABASE_URL', '')
    if not db_url:
        print("[AUTH] DATABASE_URL не найден")
        return build_alice_response('Ошибка конфигурации сервиса', end_session=True)
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Ищем код (SIMPLE QUERY - без плейсхолдеров)
        query = f"""
            SELECT id, family_id, member_id, code_expires_at
            FROM t_p5815085_family_assistant_pro.alice_users
            WHERE linking_code = '{code}' AND code_expires_at > NOW()
        """
        print(f"[AUTH] SQL запрос: {query}")
        cursor.execute(query)
        
        code_record = cursor.fetchone()
        print(f"[AUTH] Результат поиска кода: {code_record}")
        
        if not code_record:
            cursor.close()
            conn.close()
            print(f"[AUTH] Код {code} не найден или истёк")
            return build_alice_response(
                f'Код {code[:4]}-{code[4:]} не найден или истёк. Создайте новый код в приложении.',
                buttons=['Отмена']
            )
        
        # Привязываем yandex_user_id к аккаунту (SIMPLE QUERY)
        update_query = f"""
            UPDATE t_p5815085_family_assistant_pro.alice_users
            SET yandex_user_id = '{yandex_user_id}', linked_at = NOW()
            WHERE id = '{code_record['id']}'
        """
        print(f"[AUTH] UPDATE запрос: {update_query}")
        cursor.execute(update_query)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"[AUTH] ✅ Успешно привязан аккаунт для user_id={yandex_user_id}")
        
        return build_alice_response(
            f'Отлично! Аккаунт успешно привязан. Теперь вы можете управлять своими делами голосом.',
            buttons=['Задачи на сегодня', 'Календарь', 'Покупки']
        )
        
    except Exception as e:
        print(f"[AUTH] ❌ Ошибка: {str(e)}")
        return build_alice_response(f'Ошибка привязки: {str(e)}', buttons=['Повторить', 'Отмена'])


def handle_tasks_command(conn, command: str, nlu: Dict, family_id: str, member_id: str) -> Dict:
    """Обработка команд по задачам"""
    
    # Добавить задачу
    if 'добав' in command or 'созда' in command or 'новая' in command:
        return add_task_from_voice(conn, command, family_id, member_id)
    
    # Отметить выполненной
    elif 'отмет' in command or 'выполн' in command or 'сделал' in command:
        return complete_task_from_voice(conn, command, family_id)
    
    # Список задач
    else:
        return get_tasks_list(conn, family_id, member_id, command)


def handle_calendar_command(conn, command: str, nlu: Dict, family_id: str) -> Dict:
    """Обработка команд по календарю"""
    
    # Добавить событие
    if 'добав' in command or 'созда' in command or 'запланир' in command:
        return build_alice_response(
            'Добавление событий через Алису будет доступно в следующей версии. Пока используйте приложение.',
            buttons=['Что в календаре', 'Задачи', 'Отмена']
        )
    
    # Показать события
    else:
        return get_calendar_events(conn, family_id, command)


def handle_shopping_command(conn, command: str, nlu: Dict, family_id: str) -> Dict:
    """Обработка команд по покупкам"""
    
    # Добавить в список
    if 'добав' in command or 'купить' in command:
        return add_shopping_item(conn, command, family_id)
    
    # Показать список
    else:
        return get_shopping_list(conn, family_id)


def handle_stats_command(conn, family_id: str) -> Dict:
    """Показать статистику семьи"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получаем топ-3 членов семьи по выполненным задачам
    cursor.execute("""
        SELECT fm.name, COUNT(t.id) as completed_count
        FROM t_p5815085_family_assistant_pro.family_members fm
        LEFT JOIN t_p5815085_family_assistant_pro.tasks_v2 t 
            ON t.assignee_id = fm.id AND t.completed = true
        WHERE fm.family_id = %s
        GROUP BY fm.id, fm.name
        ORDER BY completed_count DESC
        LIMIT 3
    """, (family_id,))
    
    leaders = cursor.fetchall()
    cursor.close()
    
    if not leaders:
        return build_alice_response('Статистика пока пуста. Начните выполнять задачи!', buttons=['Задачи', 'Отмена'])
    
    text = "Топ активных членов семьи:\n"
    for i, leader in enumerate(leaders, 1):
        text += f"{i}. {leader['name']} - {leader['completed_count']} задач\n"
    
    return build_alice_response(text.strip(), buttons=['Задачи', 'Календарь', 'Отмена'])


def handle_help_command() -> Dict:
    """Показать список команд"""
    
    text = """Я умею:
• Показывать задачи: "какие задачи на сегодня"
• Добавлять задачи: "добавь задачу купить молоко"
• Отмечать задачи: "отметь задачу про молоко"
• Показывать календарь: "что в календаре на неделю"
• Список покупок: "что нужно купить"
• Статистику семьи: "кто лидер по задачам"

Чем помочь?"""
    
    return build_alice_response(text, buttons=['Задачи', 'Календарь', 'Покупки', 'Отмена'])


def get_tasks_list(conn, family_id: str, member_id: str, command: str) -> Dict:
    """Получить список задач"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Определяем период
    today = datetime.now().date()
    if 'сегодня' in command or 'на сегодня' in command:
        date_filter = f"AND DATE(deadline) = '{today}'"
        period_text = "на сегодня"
    elif 'завтра' in command:
        tomorrow = today + timedelta(days=1)
        date_filter = f"AND DATE(deadline) = '{tomorrow}'"
        period_text = "на завтра"
    elif 'недел' in command:
        week_end = today + timedelta(days=7)
        date_filter = f"AND DATE(deadline) BETWEEN '{today}' AND '{week_end}'"
        period_text = "на неделю"
    else:
        date_filter = "AND (deadline IS NULL OR DATE(deadline) >= CURRENT_DATE)"
        period_text = ""
    
    # Определяем фильтр по исполнителю
    if 'мои' in command or 'мне' in command:
        assignee_filter = f"AND assignee_id = '{member_id}'"
        assignee_text = "ваши "
    else:
        assignee_filter = ""
        assignee_text = ""
    
    query = f"""
        SELECT t.id, t.title, t.deadline, fm.name as assignee_name
        FROM t_p5815085_family_assistant_pro.tasks_v2 t
        LEFT JOIN t_p5815085_family_assistant_pro.family_members fm ON t.assignee_id = fm.id
        WHERE t.family_id = '{family_id}' 
            AND t.completed = false
            {date_filter}
            {assignee_filter}
        ORDER BY t.deadline ASC NULLS LAST, t.created_at DESC
        LIMIT 10
    """
    
    cursor.execute(query)
    tasks = cursor.fetchall()
    cursor.close()
    
    if not tasks:
        text = f"У вас нет активных {assignee_text}задач {period_text}. Отлично! 🎉"
        return build_alice_response(text, buttons=['Добавить задачу', 'Календарь', 'Отмена'])
    
    text = f"У вас {len(tasks)} {assignee_text}{'задача' if len(tasks) == 1 else 'задачи' if len(tasks) < 5 else 'задач'} {period_text}:\n"
    for i, task in enumerate(tasks[:5], 1):  # Ограничиваем 5 задачами для голоса
        deadline_text = f" (до {task['deadline'].strftime('%d.%m')})" if task['deadline'] else ""
        assignee = f" - {task['assignee_name']}" if task['assignee_name'] else ""
        text += f"{i}. {task['title']}{deadline_text}{assignee}\n"
    
    if len(tasks) > 5:
        text += f"\nИ ещё {len(tasks) - 5} задач. Откройте приложение для подробностей."
    
    return build_alice_response(text.strip(), buttons=['Добавить задачу', 'Календарь', 'Отмена'])


def add_task_from_voice(conn, command: str, family_id: str, member_id: str) -> Dict:
    """Добавить задачу из голосовой команды"""
    
    # Извлекаем название задачи (после слов "добавь задачу", "создай задачу" и т.д.)
    patterns = [
        r'добав(?:ь|ить)?\s+задач[уа]\s+(.+)',
        r'созда(?:й|ть)?\s+задач[уа]\s+(.+)',
        r'новая\s+задача\s+(.+)',
    ]
    
    title = None
    for pattern in patterns:
        match = re.search(pattern, command, re.IGNORECASE)
        if match:
            title = match.group(1).strip()
            break
    
    if not title:
        return build_alice_response(
            'Не поняла, какую задачу добавить. Скажите, например: "Добавь задачу купить молоко"',
            buttons=['Список задач', 'Отмена']
        )
    
    # Определяем дедлайн из текста
    deadline = None
    if 'сегодня' in title:
        deadline = datetime.now().date()
        title = title.replace('сегодня', '').strip()
    elif 'завтра' in title:
        deadline = (datetime.now() + timedelta(days=1)).date()
        title = title.replace('завтра', '').strip()
    
    # Добавляем в БД
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO t_p5815085_family_assistant_pro.tasks_v2 
            (id, family_id, assignee_id, title, completed, deadline, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, %s, %s, false, %s, NOW(), NOW())
        """, (family_id, member_id, title, deadline))
        conn.commit()
        cursor.close()
        
        deadline_text = f" на {deadline.strftime('%d.%m')}" if deadline else ""
        return build_alice_response(
            f'Задача "{title}"{deadline_text} добавлена!',
            buttons=['Список задач', 'Добавить ещё', 'Отмена']
        )
    except Exception as e:
        conn.rollback()
        cursor.close()
        return build_alice_response(f'Ошибка добавления: {str(e)}', buttons=['Повторить', 'Отмена'])


def complete_task_from_voice(conn, command: str, family_id: str) -> Dict:
    """Отметить задачу выполненной"""
    
    # Пытаемся извлечь название задачи
    patterns = [
        r'отмет[ьи]?\s+задач[уа]?\s+(.+)',
        r'выполн[ие][нл][ао]?\s+задач[уа]?\s+(.+)',
        r'сделал[аи]?\s+(.+)',
    ]
    
    task_title = None
    for pattern in patterns:
        match = re.search(pattern, command, re.IGNORECASE)
        if match:
            task_title = match.group(1).strip()
            break
    
    if not task_title:
        return build_alice_response(
            'Не поняла, какую задачу отметить. Скажите, например: "отметь задачу про молоко"',
            buttons=['Список задач', 'Отмена']
        )
    
    # Ищем задачу по частичному совпадению названия
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT id, title FROM t_p5815085_family_assistant_pro.tasks_v2
        WHERE family_id = %s AND completed = false AND LOWER(title) LIKE %s
        LIMIT 1
    """, (family_id, f'%{task_title.lower()}%'))
    
    task = cursor.fetchone()
    
    if not task:
        cursor.close()
        return build_alice_response(
            f'Не нашла активную задачу про "{task_title}". Проверьте список задач.',
            buttons=['Список задач', 'Отмена']
        )
    
    # Отмечаем выполненной
    try:
        cursor.execute("""
            UPDATE t_p5815085_family_assistant_pro.tasks_v2
            SET completed = true, updated_at = NOW()
            WHERE id = %s
        """, (task['id'],))
        conn.commit()
        cursor.close()
        
        return build_alice_response(
            f'Отлично! Задача "{task["title"]}" выполнена! 🎉',
            buttons=['Список задач', 'Календарь', 'Отмена']
        )
    except Exception as e:
        conn.rollback()
        cursor.close()
        return build_alice_response(f'Ошибка: {str(e)}', buttons=['Повторить', 'Отмена'])


def get_calendar_events(conn, family_id: str, command: str) -> Dict:
    """Получить события календаря"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Определяем период
    today = datetime.now().date()
    if 'сегодня' in command:
        date_filter = f"date = '{today}'"
        period_text = "на сегодня"
    elif 'завтра' in command:
        tomorrow = today + timedelta(days=1)
        date_filter = f"date = '{tomorrow}'"
        period_text = "на завтра"
    elif 'недел' in command:
        week_end = today + timedelta(days=7)
        date_filter = f"date BETWEEN '{today}' AND '{week_end}'"
        period_text = "на неделю"
    else:
        week_end = today + timedelta(days=7)
        date_filter = f"date BETWEEN '{today}' AND '{week_end}'"
        period_text = "на ближайшую неделю"
    
    cursor.execute(f"""
        SELECT title, date, time, description
        FROM t_p5815085_family_assistant_pro.calendar_events
        WHERE family_id = %s AND {date_filter}
        ORDER BY date, time
        LIMIT 10
    """, (family_id,))
    
    events = cursor.fetchall()
    cursor.close()
    
    if not events:
        return build_alice_response(
            f'В календаре нет событий {period_text}.',
            buttons=['Задачи', 'Покупки', 'Отмена']
        )
    
    text = f"События {period_text}:\n"
    for event in events[:5]:
        date_str = event['date'].strftime('%d.%m')
        time_str = f" в {event['time']}" if event['time'] else ""
        text += f"• {date_str}{time_str} - {event['title']}\n"
    
    if len(events) > 5:
        text += f"\nИ ещё {len(events) - 5} событий."
    
    return build_alice_response(text.strip(), buttons=['Задачи', 'Покупки', 'Отмена'])


def get_shopping_list(conn, family_id: str) -> Dict:
    """Получить список покупок"""
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT name, quantity FROM t_p5815085_family_assistant_pro.shopping_items_v2
        WHERE family_id = %s AND purchased = false
        ORDER BY created_at DESC
        LIMIT 15
    """, (family_id,))
    
    items = cursor.fetchall()
    cursor.close()
    
    if not items:
        return build_alice_response(
            'Список покупок пуст!',
            buttons=['Добавить покупку', 'Задачи', 'Отмена']
        )
    
    text = f"Нужно купить ({len(items)} позиций):\n"
    for item in items[:10]:
        quantity_text = f" ({item['quantity']})" if item['quantity'] else ""
        text += f"• {item['name']}{quantity_text}\n"
    
    if len(items) > 10:
        text += f"\nИ ещё {len(items) - 10} позиций."
    
    return build_alice_response(text.strip(), buttons=['Добавить покупку', 'Задачи', 'Отмена'])


def add_shopping_item(conn, command: str, family_id: str) -> Dict:
    """Добавить покупку в список"""
    
    # Извлекаем название покупки
    patterns = [
        r'добав(?:ь|ить)?\s+(?:в\s+список\s+)?покупк[уи]\s+(.+)',
        r'купить\s+(.+)',
        r'добав(?:ь|ить)?\s+(.+)',
    ]
    
    item_name = None
    for pattern in patterns:
        match = re.search(pattern, command, re.IGNORECASE)
        if match:
            item_name = match.group(1).strip()
            break
    
    if not item_name:
        return build_alice_response(
            'Не поняла, что добавить. Скажите: "добавь покупку хлеб и молоко"',
            buttons=['Список покупок', 'Отмена']
        )
    
    # Добавляем в БД
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO t_p5815085_family_assistant_pro.shopping_items_v2 
            (id, family_id, name, purchased, created_at)
            VALUES (gen_random_uuid(), %s, %s, false, NOW())
        """, (family_id, item_name))
        conn.commit()
        cursor.close()
        
        return build_alice_response(
            f'Добавлено в список покупок: {item_name}',
            buttons=['Список покупок', 'Добавить ещё', 'Отмена']
        )
    except Exception as e:
        conn.rollback()
        cursor.close()
        return build_alice_response(f'Ошибка: {str(e)}', buttons=['Повторить', 'Отмена'])


# === Вспомогательные функции БД ===

def get_user_by_yandex_id(conn, yandex_user_id: str) -> Optional[Dict]:
    """Получить информацию о пользователе по Yandex User ID"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT family_id, member_id 
        FROM t_p5815085_family_assistant_pro.alice_users
        WHERE yandex_user_id = %s
    """, (yandex_user_id,))
    
    user = cursor.fetchone()
    cursor.close()
    return dict(user) if user else None


def update_last_interaction(conn, yandex_user_id: str):
    """Обновить время последнего взаимодействия"""
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE t_p5815085_family_assistant_pro.alice_users
        SET last_interaction = NOW()
        WHERE yandex_user_id = %s
    """, (yandex_user_id,))
    conn.commit()
    cursor.close()


def log_command(conn, yandex_user_id: str, family_id: str, command: str, 
                category: Optional[str], success: bool, error: Optional[str], response_time: int):
    """Логирует команду Алисы для статистики"""
    
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO t_p5815085_family_assistant_pro.alice_commands_log
        (yandex_user_id, family_id, command_text, command_category, success, error_message, response_time_ms)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (yandex_user_id, family_id, command, category, success, error, response_time))
    
    conn.commit()
    cursor.close()


def detect_command_category(command: str) -> Optional[str]:
    """Определяет категорию команды для статистики"""
    
    if any(word in command for word in ['задач', 'дел', 'todo']):
        return 'tasks'
    elif any(word in command for word in ['календар', 'событи', 'встреч']):
        return 'calendar'
    elif any(word in command for word in ['покупк', 'купить', 'магазин']):
        return 'shopping'
    elif any(word in command for word in ['статистик', 'балл', 'рейтинг', 'лидер']):
        return 'stats'
    elif any(word in command for word in ['помощ', 'команд']):
        return 'help'
    else:
        return 'other'


# === Вспомогательные функции для Алисы ===

def build_alice_response(text: str, buttons: List[str] = None, end_session: bool = False) -> Dict:
    """
    Создать ответ в формате Яндекс.Алисы
    
    Args:
        text: Текст ответа
        buttons: Список кнопок для показа
        end_session: Завершить ли сессию
    """
    response_data = {
        'version': '1.0',
        'response': {
            'text': text,
            'end_session': end_session
        }
    }
    
    if buttons:
        response_data['response']['buttons'] = [
            {'title': btn, 'hide': True} for btn in buttons
        ]
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(response_data, ensure_ascii=False),
        'isBase64Encoded': False
    }


def alice_response(message: str, status_code: int = 200) -> Dict:
    """Простой HTTP ответ (не для Алисы)"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': message}, ensure_ascii=False),
        'isBase64Encoded': False
    }