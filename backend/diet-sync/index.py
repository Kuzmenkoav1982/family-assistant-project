"""
Синхронизация диеты с другими разделами: Рецепты, Покупки, Счётчик БЖУ.
"""

import json
import os
import psycopg2
from datetime import date


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    'Access-Control-Max-Age': '86400'
}


def respond(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False
    }


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_info(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None, None
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM sessions WHERE token = '%s' AND expires_at > NOW()" % token.replace("'", "''"))
        row = cur.fetchone()
        if not row:
            return None, None
        user_id = row[0]
        cur.execute("SELECT family_id FROM users WHERE id = '%s'" % str(user_id).replace("'", "''"))
        fam_row = cur.fetchone()
        family_id = fam_row[0] if fam_row else None
        return user_id, family_id
    finally:
        conn.close()


def get_food_diary_user_id(conn, uuid_user_id):
    """Получить числовой user_id для food_diary по UUID.
    food_diary.user_id — integer, а auth использует UUID.
    Ищем существующий маппинг или создаём запись в food_diary с user_id=1 (legacy)."""
    cur = conn.cursor()
    cur.execute("SELECT id FROM food_diary WHERE notes LIKE '%%uuid:%s%%' LIMIT 1" % str(uuid_user_id).replace("'", "''"))
    row = cur.fetchone()
    if row:
        cur.execute("SELECT user_id FROM food_diary WHERE id = %d" % row[0])
        return cur.fetchone()[0]
    return 1


def handler(event, context):
    """Синхронизация диеты с Рецептами, Покупками и Счётчиком БЖУ"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    user_id, family_id = get_user_info(event)
    if not user_id:
        return respond(401, {'error': 'Не авторизован'})

    raw = event.get('body') or '{}'
    body = json.loads(raw)
    action = body.get('action', '')

    if action == 'save_recipe':
        return save_recipe(user_id, family_id, body)
    elif action == 'add_to_shopping':
        return add_to_shopping(user_id, family_id, body)
    elif action == 'log_meal_bju':
        return log_meal_bju(user_id, body)
    elif action == 'save_week_menu':
        return save_week_menu(user_id, body)

    return respond(400, {'error': 'Неизвестное действие'})


def save_recipe(user_id, family_id, body):
    meal_id = body.get('meal_id')
    if not meal_id:
        return respond(400, {'error': 'meal_id не указан'})

    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT dm.title, dm.recipe, dm.calories, dm.protein_g, dm.fat_g, dm.carbs_g, dm.image_url,
                   dp.plan_type, dp.program_id
            FROM diet_meals dm
            JOIN diet_plans dp ON dm.plan_id = dp.id
            WHERE dm.id = %d AND dp.user_id = '%s'
        """ % (int(meal_id), str(user_id).replace("'", "''")))
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'Блюдо не найдено'})

        title, recipe, cal, prot, fat, carbs, img, plan_type, program_id = row

        cur.execute("""
            SELECT ingredient_name, amount, unit FROM diet_meal_ingredients
            WHERE meal_id = %d
        """ % int(meal_id))
        ingredients_rows = cur.fetchall()
        ingredients_text = '\n'.join(
            [f"- {r[0]}: {r[1]} {r[2]}" for r in ingredients_rows]
        ) if ingredients_rows else 'Ингредиенты указаны в рецепте'

        tag = 'ИИ-Диета'
        if plan_type == 'preset_program' and program_id:
            cur.execute("SELECT name FROM diet_programs WHERE id = %d" % int(program_id))
            prog = cur.fetchone()
            if prog:
                tag = prog[0]

        fid = str(family_id) if family_id else str(user_id)

        cur.execute("""
            INSERT INTO recipes (family_id, name, description, category, ingredients, instructions,
                dietary_tags, image_url, created_by)
            VALUES ('%s', '%s', '%s', 'diet', '%s', '%s', ARRAY['%s'], %s, '%s')
            RETURNING id
        """ % (
            fid,
            title.replace("'", "''")[:255],
            f'{cal} ккал | Б:{prot}г Ж:{fat}г У:{carbs}г'.replace("'", "''"),
            ingredients_text.replace("'", "''"),
            (recipe or '').replace("'", "''"),
            tag.replace("'", "''"),
            f"'{img}'" if img else 'NULL',
            str(user_id),
        ))
        recipe_id = cur.fetchone()[0]
        conn.commit()

        return respond(200, {'success': True, 'recipe_id': recipe_id, 'message': f'Рецепт «{title}» сохранён!'})
    finally:
        conn.close()


def add_to_shopping(user_id, family_id, body):
    meal_ids = body.get('meal_ids', [])
    if not meal_ids:
        return respond(400, {'error': 'meal_ids не указаны'})

    conn = get_db()
    try:
        cur = conn.cursor()

        ids_str = ','.join([str(int(mid)) for mid in meal_ids])
        cur.execute("""
            SELECT dm.id FROM diet_meals dm
            JOIN diet_plans dp ON dm.plan_id = dp.id
            WHERE dm.id IN (%s) AND dp.user_id = '%s'
        """ % (ids_str, str(user_id).replace("'", "''")))
        valid_ids = [r[0] for r in cur.fetchall()]

        if not valid_ids:
            return respond(403, {'error': 'Нет доступа к этим блюдам'})

        valid_str = ','.join([str(mid) for mid in valid_ids])
        cur.execute("""
            SELECT ingredient_name, SUM(amount) as total, unit
            FROM diet_meal_ingredients
            WHERE meal_id IN (%s)
            GROUP BY ingredient_name, unit
        """ % valid_str)
        ingredients = cur.fetchall()

        if not ingredients:
            cur.execute("""
                SELECT title FROM diet_meals WHERE id IN (%s)
            """ % valid_str)
            meal_titles = [r[0] for r in cur.fetchall()]

            if not family_id:
                return respond(200, {'success': True, 'added': 0, 'message': 'Ингредиенты для выбранных блюд не найдены в базе'})

            added = 0
            for title in meal_titles:
                cur.execute("""
                    INSERT INTO shopping_items_v2 (family_id, name, category, quantity, notes, added_by_name)
                    VALUES ('%s', '%s', 'Продукты', '1 шт', 'Из плана диеты', 'ИИ-Диета')
                """ % (str(family_id), f'Продукты для: {title}'.replace("'", "''")[:255]))
                added += 1

            conn.commit()
            return respond(200, {'success': True, 'added': added, 'message': f'Добавлено {added} позиций в покупки'})

        if not family_id:
            return respond(400, {'error': 'Не удалось определить семью'})

        added = 0
        for name, amount, unit in ingredients:
            quantity = f"{float(amount)} {unit}" if amount and unit else ''
            cur.execute("""
                INSERT INTO shopping_items_v2 (family_id, name, category, quantity, notes, added_by_name)
                VALUES ('%s', '%s', 'Продукты', '%s', 'Из плана диеты', 'ИИ-Диета')
            """ % (
                str(family_id),
                name.replace("'", "''")[:255],
                quantity.replace("'", "''"),
            ))
            added += 1

        conn.commit()
        return respond(200, {'success': True, 'added': added, 'message': f'Добавлено {added} продуктов в покупки'})
    finally:
        conn.close()


def log_meal_bju(user_id, body):
    meal_id = body.get('meal_id')
    if not meal_id:
        return respond(400, {'error': 'meal_id не указан'})

    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT dm.title, dm.meal_type, dm.calories, dm.protein_g, dm.fat_g, dm.carbs_g
            FROM diet_meals dm
            JOIN diet_plans dp ON dm.plan_id = dp.id
            WHERE dm.id = %d AND dp.user_id = '%s'
        """ % (int(meal_id), str(user_id).replace("'", "''")))
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'Блюдо не найдено'})

        title, meal_type, cal, prot, fat, carbs = row

        meal_type_map = {
            'breakfast': 'breakfast', 'lunch': 'lunch',
            'dinner': 'dinner', 'snack': 'snack',
        }
        fd_type = meal_type_map.get(meal_type, 'lunch')

        fd_user_id = get_food_diary_user_id(conn, user_id)

        cur.execute("""
            INSERT INTO food_diary (user_id, date, meal_type, product_name, amount, calories, protein, fats, carbs, notes)
            VALUES (%d, '%s', '%s', '%s', 1, %s, %s, %s, %s, 'Из плана диеты')
        """ % (
            fd_user_id,
            date.today().isoformat(),
            fd_type,
            title.replace("'", "''")[:255],
            float(cal), float(prot), float(fat), float(carbs),
        ))

        cur.execute("""
            UPDATE diet_meals SET completed = TRUE, completed_at = NOW()
            WHERE id = %d
        """ % int(meal_id))

        conn.commit()
        return respond(200, {
            'success': True,
            'message': f'«{title}» записано в дневник питания! ({cal} ккал)',
            'calories': float(cal),
            'protein': float(prot),
            'fats': float(fat),
            'carbs': float(carbs),
        })
    finally:
        conn.close()


def save_week_menu(user_id, body):
    plan_id = body.get('plan_id')
    if not plan_id:
        return respond(400, {'error': 'plan_id не указан'})

    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT dm.day_number, dm.meal_type, dm.title, dm.recipe, dm.calories,
                   dm.protein_g, dm.fat_g, dm.carbs_g
            FROM diet_meals dm
            JOIN diet_plans dp ON dm.plan_id = dp.id
            WHERE dm.plan_id = %d AND dp.user_id = '%s'
            ORDER BY dm.day_number, dm.meal_time
        """ % (int(plan_id), str(user_id).replace("'", "''")))
        meals = cur.fetchall()

        if not meals:
            return respond(404, {'error': 'Блюда не найдены'})

        day_map = {1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday',
                   5: 'friday', 6: 'saturday', 7: 'sunday'}

        cur.execute("SELECT token FROM sessions WHERE user_id = '%s' AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1" % str(user_id).replace("'", "''"))
        token_row = cur.fetchone()
        auth_token = token_row[0] if token_row else ''

        cur.execute("SELECT family_id FROM users WHERE id = '%s'" % str(user_id).replace("'", "''"))
        fam_row = cur.fetchone()
        fam_id = fam_row[0] if fam_row else None

        if not fam_id:
            return respond(400, {'error': 'Семья не найдена'})

        added = 0
        for day_num, mtype, title, recipe, cal, prot, fat, carbs in meals:
            day_name = day_map.get(day_num, 'monday')
            description = f'{title}. {cal} ккал, Б:{prot} Ж:{fat} У:{carbs}'
            cur.execute("""
                INSERT INTO family_meal_plans (family_id, day, meal_type, dish_name, description, emoji, created_by)
                VALUES (%d, '%s', '%s', '%s', '%s', '🍽', '%s')
            """ % (
                int(fam_id), day_name, mtype[:20],
                title.replace("'", "''")[:255],
                description.replace("'", "''")[:500],
                str(user_id),
            ))
            added += 1

        conn.commit()
        return respond(200, {'success': True, 'added': added, 'message': f'Добавлено {added} блюд в меню на неделю'})
    finally:
        conn.close()
