"""
Трекинг прогресса диеты: вес, самочувствие, мотивация, SOS, сохранение/получение планов.
"""

import json
import os
import requests
import psycopg2
from datetime import datetime, date, timedelta
from decimal import Decimal


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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


def get_user_id(event):
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    if not token:
        return None
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT user_id FROM sessions WHERE token = '%s' AND expires_at > NOW()" % token.replace("'", "''"))
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def handler(event, context):
    """Трекинг прогресса диеты: вес, мотивация, SOS, планы"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '', 'isBase64Encoded': False}

    user_id = get_user_id(event)
    if not user_id:
        return respond(401, {'error': 'Не авторизован'})

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'dashboard')
        plan_id = params.get('plan_id')

        if action == 'dashboard':
            return get_dashboard(user_id)
        elif action == 'weight_history':
            return get_weight_history(user_id, plan_id)
        elif action == 'plan':
            return get_plan(user_id, plan_id)
        elif action == 'plans':
            return get_plans(user_id)
        elif action == 'motivation':
            time_of_day = params.get('time', 'morning')
            return get_motivation(user_id, plan_id, time_of_day)

    if method == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw)
        action = body.get('action', '')

        if action == 'log_weight':
            return log_weight(user_id, body)
        elif action == 'save_plan':
            return save_plan(user_id, body)
        elif action == 'mark_meal':
            return mark_meal(user_id, body)
        elif action == 'sos':
            return handle_sos(user_id, body)
        elif action == 'motivation':
            return generate_motivation(user_id, body)
        elif action == 'analyze_progress':
            return analyze_progress(user_id, body)
        elif action == 'adjust_plan':
            return adjust_plan(user_id, body)

    return respond(400, {'error': 'Неизвестное действие'})


def get_dashboard(user_id):
    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT id, plan_type, start_date, end_date, duration_days,
                   target_weight_loss_kg, target_calories_daily, status,
                   daily_water_ml, daily_steps, exercise_recommendation,
                   program_id, created_at
            FROM diet_plans WHERE user_id = %d AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """ % user_id)
        plan_row = cur.fetchone()

        if not plan_row:
            return respond(200, {'has_plan': False, 'plan': None, 'weight_log': [], 'stats': None})

        plan = {
            'id': plan_row[0], 'plan_type': plan_row[1],
            'start_date': str(plan_row[2]), 'end_date': str(plan_row[3]),
            'duration_days': plan_row[4], 'target_weight_loss_kg': float(plan_row[5]) if plan_row[5] else None,
            'target_calories_daily': plan_row[6], 'status': plan_row[7],
            'daily_water_ml': plan_row[8], 'daily_steps': plan_row[9],
            'exercise_recommendation': plan_row[10], 'program_id': plan_row[11],
            'created_at': str(plan_row[12])
        }
        plan_id = plan_row[0]

        cur.execute("""
            SELECT weight_kg, wellbeing, measured_at
            FROM diet_weight_log WHERE user_id = %d AND plan_id = %d
            ORDER BY measured_at ASC
        """ % (user_id, plan_id))
        weight_log = [
            {'weight_kg': float(r[0]), 'wellbeing': r[1], 'measured_at': str(r[2])}
            for r in cur.fetchall()
        ]

        cur.execute("""
            SELECT COUNT(*) FROM diet_meals
            WHERE plan_id = %d AND completed = TRUE
        """ % plan_id)
        completed_meals = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d" % plan_id)
        total_meals = cur.fetchone()[0]

        today_str = date.today().isoformat()
        cur.execute("""
            SELECT id, day_number, meal_type, meal_time, title, calories,
                   protein_g, fat_g, carbs_g, completed, image_url, recipe
            FROM diet_meals WHERE plan_id = %d AND meal_date = '%s'
            ORDER BY meal_time
        """ % (plan_id, today_str))
        today_meals = [
            {
                'id': r[0], 'day_number': r[1], 'meal_type': r[2],
                'time': str(r[3])[:5], 'title': r[4], 'calories': r[5],
                'protein': float(r[6]), 'fats': float(r[7]), 'carbs': float(r[8]),
                'completed': r[9], 'image_url': r[10], 'recipe': r[11]
            }
            for r in cur.fetchall()
        ]

        days_elapsed = (date.today() - plan_row[2]).days
        days_remaining = max(0, (plan_row[3] - date.today()).days)

        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d ORDER BY measured_at DESC LIMIT 1
        """ % (user_id, plan_id))
        last_w = cur.fetchone()
        last_weight = float(last_w[0]) if last_w else None

        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d ORDER BY measured_at ASC LIMIT 1
        """ % (user_id, plan_id))
        first_w = cur.fetchone()
        start_weight = float(first_w[0]) if first_w else None

        weight_lost = round(start_weight - last_weight, 1) if start_weight and last_weight else 0

        cur.execute("""
            SELECT measured_at FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d ORDER BY measured_at DESC LIMIT 1
        """ % (user_id, plan_id))
        last_log = cur.fetchone()
        days_since_log = (datetime.now() - last_log[0]).days if last_log else 999

        stats = {
            'days_elapsed': days_elapsed,
            'days_remaining': days_remaining,
            'completed_meals': completed_meals,
            'total_meals': total_meals,
            'adherence_pct': round(completed_meals / total_meals * 100) if total_meals > 0 else 0,
            'weight_lost': weight_lost,
            'start_weight': start_weight,
            'last_weight': last_weight,
            'days_since_log': days_since_log
        }

        return respond(200, {
            'has_plan': True,
            'plan': plan,
            'weight_log': weight_log,
            'today_meals': today_meals,
            'stats': stats
        })
    finally:
        conn.close()


def get_weight_history(user_id, plan_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        query = "SELECT weight_kg, wellbeing, measured_at FROM diet_weight_log WHERE user_id = %d" % user_id
        if plan_id:
            query += " AND plan_id = %s" % int(plan_id)
        query += " ORDER BY measured_at ASC"
        cur.execute(query)
        rows = [{'weight_kg': float(r[0]), 'wellbeing': r[1], 'measured_at': str(r[2])} for r in cur.fetchall()]
        return respond(200, {'weight_log': rows})
    finally:
        conn.close()


def get_plan(user_id, plan_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        if plan_id:
            cur.execute("""
                SELECT id, plan_type, start_date, end_date, duration_days,
                       target_weight_loss_kg, target_calories_daily, status
                FROM diet_plans WHERE id = %d AND user_id = %d
            """ % (int(plan_id), user_id))
        else:
            cur.execute("""
                SELECT id, plan_type, start_date, end_date, duration_days,
                       target_weight_loss_kg, target_calories_daily, status
                FROM diet_plans WHERE user_id = %d AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % user_id)
        row = cur.fetchone()
        if not row:
            return respond(404, {'error': 'План не найден'})

        pid = row[0]
        cur.execute("""
            SELECT id, day_number, meal_date, meal_type, meal_time, title,
                   recipe, image_url, calories, protein_g, fat_g, carbs_g,
                   completed, completed_at
            FROM diet_meals WHERE plan_id = %d ORDER BY day_number, meal_time
        """ % pid)
        meals = [
            {
                'id': r[0], 'day_number': r[1], 'meal_date': str(r[2]),
                'meal_type': r[3], 'time': str(r[4])[:5], 'title': r[5],
                'recipe': r[6], 'image_url': r[7], 'calories': r[8],
                'protein': float(r[9]), 'fats': float(r[10]), 'carbs': float(r[11]),
                'completed': r[12], 'completed_at': str(r[13]) if r[13] else None
            }
            for r in cur.fetchall()
        ]

        return respond(200, {
            'plan': {
                'id': row[0], 'plan_type': row[1], 'start_date': str(row[2]),
                'end_date': str(row[3]), 'duration_days': row[4],
                'target_weight_loss_kg': float(row[5]) if row[5] else None,
                'target_calories_daily': row[6], 'status': row[7]
            },
            'meals': meals
        })
    finally:
        conn.close()


def get_plans(user_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, plan_type, start_date, end_date, duration_days,
                   target_weight_loss_kg, target_calories_daily, status, created_at
            FROM diet_plans WHERE user_id = %d ORDER BY created_at DESC
        """ % user_id)
        plans = [
            {
                'id': r[0], 'plan_type': r[1], 'start_date': str(r[2]),
                'end_date': str(r[3]), 'duration_days': r[4],
                'target_weight_loss_kg': float(r[5]) if r[5] else None,
                'target_calories_daily': r[6], 'status': r[7],
                'created_at': str(r[8])
            }
            for r in cur.fetchall()
        ]
        return respond(200, {'plans': plans})
    finally:
        conn.close()


def log_weight(user_id, body):
    weight = body.get('weight_kg')
    wellbeing = body.get('wellbeing', '')
    plan_id = body.get('plan_id')

    if not weight:
        return respond(400, {'error': 'Вес не указан'})

    conn = get_db()
    try:
        cur = conn.cursor()
        if plan_id:
            cur.execute("""
                INSERT INTO diet_weight_log (user_id, plan_id, weight_kg, wellbeing)
                VALUES (%d, %d, %s, '%s')
            """ % (user_id, int(plan_id), float(weight), str(wellbeing).replace("'", "''")))
        else:
            cur.execute("""
                INSERT INTO diet_weight_log (user_id, weight_kg, wellbeing)
                VALUES (%d, %s, '%s')
            """ % (user_id, float(weight), str(wellbeing).replace("'", "''")))
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def save_plan(user_id, body):
    plan_data = body.get('plan', {})
    quiz_data = body.get('quiz_data', {})
    meals_data = body.get('meals', [])
    plan_type = body.get('plan_type', 'ai_personal')
    program_id = body.get('program_id')

    if not meals_data:
        return respond(400, {'error': 'Данные плана не переданы'})

    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute("""
            UPDATE diet_plans SET status = 'completed'
            WHERE user_id = %d AND status = 'active'
        """ % user_id)

        duration = len(set(m.get('day', '') for m in meals_data if m.get('day')))
        if duration == 0:
            duration = 7
        start = date.today()
        end = start + timedelta(days=duration - 1)

        daily_cal = plan_data.get('daily_calories', 1800)
        target_loss = None
        if quiz_data.get('current_weight_kg') and quiz_data.get('target_weight_kg'):
            try:
                target_loss = float(quiz_data['current_weight_kg']) - float(quiz_data['target_weight_kg'])
            except (ValueError, TypeError):
                pass

        program_sql = "NULL" if not program_id else str(int(program_id))
        target_sql = "NULL" if not target_loss else str(target_loss)

        cur.execute("""
            INSERT INTO diet_plans (user_id, plan_type, start_date, end_date, duration_days,
                target_weight_loss_kg, target_calories_daily, program_id, status)
            VALUES (%d, '%s', '%s', '%s', %d, %s, %d, %s, 'active')
            RETURNING id
        """ % (user_id, plan_type.replace("'", ""), str(start), str(end), duration,
               target_sql, int(daily_cal), program_sql))
        plan_id = cur.fetchone()[0]

        day_names = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
        type_times = {'breakfast': '08:00', 'lunch': '13:00', 'dinner': '19:00', 'snack': '16:00'}

        day_counter = {}
        for meal in meals_data:
            day_name = meal.get('day', 'Понедельник')
            if day_name not in day_counter:
                day_counter[day_name] = len(day_counter) + 1
            day_num = day_counter[day_name]
            meal_date = start + timedelta(days=day_num - 1)
            mtype = meal.get('type', meal.get('mealType', 'lunch'))
            mtime = meal.get('time', type_times.get(mtype, '12:00'))
            if len(mtime) < 5:
                mtime = '12:00'

            title = meal.get('name', meal.get('title', 'Блюдо')).replace("'", "''")
            recipe = meal.get('description', meal.get('recipe', '')).replace("'", "''")
            cal = int(meal.get('calories', 0))
            prot = float(meal.get('protein', 0))
            fat = float(meal.get('fats', meal.get('fat', 0)))
            carb = float(meal.get('carbs', 0))

            cur.execute("""
                INSERT INTO diet_meals (plan_id, day_number, meal_date, meal_type, meal_time,
                    title, recipe, calories, protein_g, fat_g, carbs_g)
                VALUES (%d, %d, '%s', '%s', '%s', '%s', '%s', %d, %s, %s, %s)
                RETURNING id
            """ % (plan_id, day_num, str(meal_date), mtype[:20], mtime[:5],
                   title[:255], recipe, cal, prot, fat, carb))
            meal_id = cur.fetchone()[0]

            ingredients_raw = meal.get('ingredients', [])
            if ingredients_raw and isinstance(ingredients_raw, list):
                for ing_str in ingredients_raw:
                    ing_str = str(ing_str).strip()
                    if not ing_str:
                        continue
                    ing_name = ing_str
                    ing_amount = 0
                    ing_unit = 'шт'
                    for sep in [' — ', ' - ', ' – ', ': ']:
                        idx = ing_str.find(sep)
                        if idx > 0:
                            ing_name = ing_str[:idx].strip()
                            qty_part = ing_str[idx + len(sep):].strip()
                            import re
                            m = re.match(r'([\d.,]+)\s*(.*)', qty_part)
                            if m:
                                try:
                                    ing_amount = float(m.group(1).replace(',', '.'))
                                except ValueError:
                                    ing_amount = 0
                                ing_unit = m.group(2).strip() or 'г'
                            else:
                                ing_unit = qty_part or 'шт'
                            break
                    cur.execute("""
                        INSERT INTO diet_meal_ingredients (meal_id, ingredient_name, amount, unit)
                        VALUES (%d, '%s', %s, '%s')
                    """ % (meal_id, ing_name.replace("'", "''")[:255], ing_amount, ing_unit.replace("'", "''")[:20]))

        if quiz_data.get('current_weight_kg'):
            try:
                w = float(quiz_data['current_weight_kg'])
                cur.execute("""
                    INSERT INTO diet_weight_log (user_id, plan_id, weight_kg, wellbeing)
                    VALUES (%d, %d, %s, 'Начало диеты')
                """ % (user_id, plan_id, w))
            except (ValueError, TypeError):
                pass

        conn.commit()
        return respond(200, {'success': True, 'plan_id': plan_id})
    finally:
        conn.close()


def mark_meal(user_id, body):
    meal_id = body.get('meal_id')
    completed = body.get('completed', True)

    if not meal_id:
        return respond(400, {'error': 'meal_id не указан'})

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT dm.id FROM diet_meals dm
            JOIN diet_plans dp ON dm.plan_id = dp.id
            WHERE dm.id = %d AND dp.user_id = %d
        """ % (int(meal_id), user_id))
        if not cur.fetchone():
            return respond(403, {'error': 'Нет доступа'})

        if completed:
            cur.execute("""
                UPDATE diet_meals SET completed = TRUE, completed_at = NOW()
                WHERE id = %d
            """ % int(meal_id))
        else:
            cur.execute("""
                UPDATE diet_meals SET completed = FALSE, completed_at = NULL
                WHERE id = %d
            """ % int(meal_id))
        conn.commit()
        return respond(200, {'success': True})
    finally:
        conn.close()


def handle_sos(user_id, body):
    plan_id = body.get('plan_id')
    reason = body.get('reason', 'other')
    comment = body.get('comment', '')

    if not plan_id:
        return respond(400, {'error': 'plan_id не указан'})

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO diet_sos_requests (user_id, plan_id, reason, user_comment)
            VALUES (%d, %d, '%s', '%s')
        """ % (user_id, int(plan_id), reason.replace("'", "''")[:50], comment.replace("'", "''")[:500]))
        conn.commit()

        responses = {
            'strong_hunger': 'Сильный голод — это сигнал, что организм перестраивается. Выпей стакан тёплой воды и съешь горсть орехов или яблоко. Завтра я добавлю тебе +200 ккал — будет легче!',
            'weakness': 'Упадок сил может быть связан с недостатком углеводов. Сделай завтра более лёгкий день — добавлю порцию каши. Если слабость сильная, обратись к врачу.',
            'psychological': 'Это нормально — диета требует силы воли. Ты уже столько прошёл! Давай сделаем завтра «день комфорта» — включу твои любимые продукты в рацион.',
            'want_to_quit': 'Не сдавайся! Каждый день приближает тебя к цели. Давай смягчим план на следующую неделю — уменьшим ограничения, чтобы было комфортнее.',
            'other': 'Я рядом и помогу! Расскажи подробнее, что случилось, и мы найдём решение вместе.'
        }

        return respond(200, {
            'success': True,
            'message': responses.get(reason, responses['other']),
            'suggestion': 'rest_day' if reason in ('strong_hunger', 'weakness', 'psychological') else 'soften_diet'
        })
    finally:
        conn.close()


def get_motivation(user_id, plan_id, time_of_day):
    conn = get_db()
    try:
        cur = conn.cursor()

        if not plan_id:
            cur.execute("""
                SELECT id FROM diet_plans WHERE user_id = %d AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % user_id)
            row = cur.fetchone()
            if not row:
                return respond(200, {'message': 'Начните диету, чтобы получать мотивационные сообщения!'})
            plan_id = row[0]

        cur.execute("SELECT start_date FROM diet_plans WHERE id = %d" % int(plan_id))
        plan_row = cur.fetchone()
        days_on_diet = (date.today() - plan_row[0]).days + 1 if plan_row else 1

        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d ORDER BY measured_at ASC LIMIT 1
        """ % (user_id, int(plan_id)))
        first = cur.fetchone()
        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d ORDER BY measured_at DESC LIMIT 1
        """ % (user_id, int(plan_id)))
        last = cur.fetchone()

        lost = round(float(first[0]) - float(last[0]), 1) if first and last else 0

        cur.execute("""
            SELECT COUNT(*) FROM diet_meals
            WHERE plan_id = %d AND completed = TRUE
        """ % int(plan_id))
        completed = cur.fetchone()[0]

        if time_of_day == 'morning':
            if lost > 0:
                msg = f"Доброе утро! День {days_on_diet} твоей диеты. Ты уже сбросил {lost} кг — отличный результат! Сегодня ещё один шаг к цели. Ты справишься!"
            else:
                msg = f"Доброе утро! День {days_on_diet}. Каждый день — это вклад в твоё здоровье. Не торопись, результат придёт. Сегодня будет отличный день!"
        else:
            if completed > 0:
                msg = f"День {days_on_diet} позади! Ты выполнил {completed} приёмов пищи по плану — молодец! Отдыхай, завтра продолжим. Спокойной ночи!"
            else:
                msg = f"День {days_on_diet} подходит к концу. Даже если сегодня было непросто — ты не сдался! Завтра новый день и новые возможности."

        cur.execute("""
            INSERT INTO diet_motivation_log (user_id, plan_id, message_type, message_text)
            VALUES (%d, %d, '%s', '%s')
        """ % (user_id, int(plan_id), time_of_day, msg.replace("'", "''")))
        conn.commit()

        return respond(200, {'message': msg, 'day': days_on_diet, 'weight_lost': lost})
    finally:
        conn.close()


def wallet_spend(user_id, amount, reason, description):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT family_id FROM family_members WHERE user_id = '%s' LIMIT 1" % str(user_id)
        )
        fm = cur.fetchone()
        if not fm:
            return {'error': 'no_family'}
        family_id = fm[0]
        cur.execute(
            "SELECT id, balance_rub FROM family_wallet WHERE family_id = '%s'" % str(family_id)
        )
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO family_wallet (family_id, balance_rub) VALUES ('%s', 0) RETURNING id, balance_rub"
                % str(family_id)
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


def generate_motivation(user_id, body):
    plan_id = body.get('plan_id')
    time_of_day = body.get('time', 'morning')

    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')

    if not api_key or not folder_id:
        return get_motivation(user_id, plan_id, time_of_day)

    spend_result = wallet_spend(user_id, 1, 'ai_motivation', 'Мотивация от ИИ')
    if spend_result.get('error') == 'insufficient_funds':
        return get_motivation(user_id, plan_id, time_of_day)

    conn = get_db()
    try:
        cur = conn.cursor()
        if not plan_id:
            cur.execute("""
                SELECT id, start_date, target_weight_loss_kg, target_calories_daily
                FROM diet_plans WHERE user_id = %d AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % user_id)
            row = cur.fetchone()
            if not row:
                return respond(200, {'message': 'Начните диету — и я буду вас поддерживать каждый день!'})
            plan_id, start, target_loss, cals = row
        else:
            cur.execute("SELECT start_date, target_weight_loss_kg, target_calories_daily FROM diet_plans WHERE id = %d" % int(plan_id))
            row = cur.fetchone()
            start, target_loss, cals = row

        days_on = (date.today() - start).days + 1

        cur.execute("SELECT weight_kg FROM diet_weight_log WHERE user_id = %d AND plan_id = %d ORDER BY measured_at ASC LIMIT 1" % (user_id, int(plan_id)))
        first_w = cur.fetchone()
        cur.execute("SELECT weight_kg FROM diet_weight_log WHERE user_id = %d AND plan_id = %d ORDER BY measured_at DESC LIMIT 1" % (user_id, int(plan_id)))
        last_w = cur.fetchone()
        lost = round(float(first_w[0]) - float(last_w[0]), 1) if first_w and last_w else 0

        cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d AND completed = TRUE" % int(plan_id))
        done = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d" % int(plan_id))
        total = cur.fetchone()[0]

        time_label = "утреннее" if time_of_day == "morning" else "вечернее"
        prompt = f"""Напиши короткое {time_label} мотивационное сообщение для человека на диете.
День диеты: {days_on}. Сброшено: {lost} кг. Выполнено приёмов пищи: {done} из {total}.
Цель: сбросить {float(target_loss) if target_loss else 'N/A'} кг.
Сообщение должно быть тёплым, поддерживающим, на русском языке, 2-3 предложения. Без смайликов."""

        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        headers_gpt = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}
        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
            'completionOptions': {'stream': False, 'temperature': 0.7, 'maxTokens': 300},
            'messages': [
                {'role': 'system', 'text': 'Ты заботливый тренер-мотиватор. Пиши кратко и тепло.'},
                {'role': 'user', 'text': prompt}
            ]
        }

        resp = requests.post(url, headers=headers_gpt, json=payload, timeout=15)
        if resp.status_code == 200:
            ai_text = resp.json().get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
            if ai_text:
                cur.execute("""
                    INSERT INTO diet_motivation_log (user_id, plan_id, message_type, message_text)
                    VALUES (%d, %d, '%s', '%s')
                """ % (user_id, int(plan_id), time_of_day, ai_text.replace("'", "''")))
                conn.commit()
                return respond(200, {'message': ai_text, 'day': days_on, 'weight_lost': lost, 'ai': True})

        return get_motivation(user_id, plan_id, time_of_day)
    except Exception as e:
        print(f"[diet-progress] AI motivation error: {e}")
        return get_motivation(user_id, plan_id if isinstance(plan_id, int) else None, time_of_day)
    finally:
        conn.close()


def analyze_progress(user_id, body):
    plan_id = body.get('plan_id')
    conn = get_db()
    try:
        cur = conn.cursor()

        if not plan_id:
            cur.execute("""
                SELECT id FROM diet_plans WHERE user_id = %d AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % user_id)
            row = cur.fetchone()
            if not row:
                return respond(200, {'has_analysis': False, 'message': 'Нет активного плана'})
            plan_id = row[0]

        cur.execute("""
            SELECT start_date, end_date, duration_days, target_weight_loss_kg,
                   target_calories_daily, daily_water_ml, daily_steps
            FROM diet_plans WHERE id = %d AND user_id = %d
        """ % (int(plan_id), user_id))
        plan = cur.fetchone()
        if not plan:
            return respond(404, {'error': 'План не найден'})

        start_date, end_date, duration, target_loss, target_cal, water, steps = plan

        cur.execute("""
            SELECT weight_kg, measured_at FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d ORDER BY measured_at ASC
        """ % (user_id, int(plan_id)))
        weights = cur.fetchall()

        if len(weights) < 2:
            return respond(200, {
                'has_analysis': False,
                'message': 'Нужно минимум 2 записи веса для анализа'
            })

        first_w = float(weights[0][0])
        last_w = float(weights[-1][0])
        actual_loss = round(first_w - last_w, 2)
        days_elapsed = (date.today() - start_date).days
        days_elapsed = max(days_elapsed, 1)

        weekly_loss_actual = round(actual_loss / (days_elapsed / 7), 2) if days_elapsed >= 3 else 0

        if target_loss and target_loss > 0:
            expected_loss = round(float(target_loss) * (days_elapsed / duration), 2) if duration > 0 else 0
        else:
            expected_loss = round(0.5 * (days_elapsed / 7), 2)

        cur.execute("""
            SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d AND completed = TRUE
        """ % int(plan_id))
        done_meals = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d" % int(plan_id))
        total_meals = cur.fetchone()[0]
        adherence = round(done_meals / total_meals * 100) if total_meals > 0 else 0

        cur.execute("""
            SELECT COUNT(*) FROM diet_sos_requests
            WHERE user_id = %d AND plan_id = %d
        """ % (user_id, int(plan_id)))
        sos_count = cur.fetchone()[0]

        cur.execute("""
            SELECT wellbeing FROM diet_weight_log
            WHERE user_id = %d AND plan_id = %d AND wellbeing IS NOT NULL AND wellbeing != ''
            ORDER BY measured_at DESC LIMIT 5
        """ % (user_id, int(plan_id)))
        recent_wellbeing = [r[0] for r in cur.fetchall()]

        recommendation = 'keep'
        cal_adjustment = 0
        reason = ''
        advice = ''

        if weekly_loss_actual > 1.5:
            recommendation = 'ease'
            cal_adjustment = 200
            reason = 'Слишком быстрое снижение веса (более 1.5 кг/нед)'
            advice = 'Рекомендую увеличить калорийность на 200 ккал. Резкое похудение вредит здоровью и приводит к потере мышц.'
        elif weekly_loss_actual > 1.0 and sos_count >= 2:
            recommendation = 'ease'
            cal_adjustment = 150
            reason = 'Быстрое снижение + частые SOS-запросы'
            advice = 'Темп хороший, но вам тяжело. Добавлю 150 ккал для комфорта — результат сохранится.'
        elif actual_loss < 0 and days_elapsed >= 7:
            recommendation = 'intensify'
            cal_adjustment = -150
            reason = 'Вес не снижается более 7 дней'
            advice = 'Результата пока нет. Снизим калорийность на 150 ккал и добавим активности.'
        elif 0 <= actual_loss < expected_loss * 0.5 and days_elapsed >= 10:
            recommendation = 'intensify'
            cal_adjustment = -100
            reason = 'Прогресс значительно ниже ожидаемого'
            advice = 'Снижение идёт медленнее плана. Небольшое уменьшение калорий поможет ускориться.'
        elif adherence < 50 and days_elapsed >= 5:
            recommendation = 'ease'
            cal_adjustment = 100
            reason = 'Низкая приверженность плану (%d%%)' % adherence
            advice = 'Вы пропускаете много приёмов пищи. Возможно, план слишком строгий — смягчим его.'
        elif sos_count >= 3:
            recommendation = 'ease'
            cal_adjustment = 150
            reason = 'Много SOS-запросов (%d)' % sos_count
            advice = 'Диета даётся тяжело. Смягчу план, чтобы вы не бросили — лучше медленнее, но стабильно.'
        else:
            reason = 'Прогресс в норме'
            advice = 'Всё идёт по плану! Продолжайте в том же духе.'

        new_calories = target_cal + cal_adjustment if cal_adjustment else target_cal

        return respond(200, {
            'has_analysis': True,
            'plan_id': plan_id,
            'days_elapsed': days_elapsed,
            'actual_loss_kg': actual_loss,
            'expected_loss_kg': expected_loss,
            'weekly_loss_kg': weekly_loss_actual,
            'adherence_pct': adherence,
            'sos_count': sos_count,
            'current_calories': target_cal,
            'recommendation': recommendation,
            'cal_adjustment': cal_adjustment,
            'new_calories': new_calories,
            'reason': reason,
            'advice': advice,
            'recent_wellbeing': recent_wellbeing
        })
    finally:
        conn.close()


def adjust_plan(user_id, body):
    plan_id = body.get('plan_id')
    new_calories = body.get('new_calories')

    if not plan_id or not new_calories:
        return respond(400, {'error': 'plan_id и new_calories обязательны'})

    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT id FROM diet_plans WHERE id = %d AND user_id = %d AND status = 'active'
        """ % (int(plan_id), user_id))
        if not cur.fetchone():
            return respond(403, {'error': 'План не найден или неактивен'})

        cur.execute("""
            UPDATE diet_plans SET target_calories_daily = %d
            WHERE id = %d
        """ % (int(new_calories), int(plan_id)))

        remaining_dates = []
        cur.execute("""
            SELECT DISTINCT meal_date FROM diet_meals
            WHERE plan_id = %d AND meal_date >= '%s' AND completed = FALSE
            ORDER BY meal_date
        """ % (int(plan_id), str(date.today())))
        remaining_dates = [r[0] for r in cur.fetchall()]

        if remaining_dates:
            cur.execute("""
                SELECT id, calories FROM diet_meals
                WHERE plan_id = %d AND meal_date >= '%s' AND completed = FALSE
            """ % (int(plan_id), str(date.today())))
            meals = cur.fetchall()
            if meals:
                cur.execute("""
                    SELECT SUM(calories) FROM diet_meals
                    WHERE plan_id = %d AND meal_date = '%s'
                """ % (int(plan_id), str(remaining_dates[0])))
                day_total = cur.fetchone()[0] or 1
                ratio = int(new_calories) / day_total if day_total > 0 else 1

                ratio = max(0.7, min(1.4, ratio))

                for meal_id, cal in meals:
                    adj_cal = max(50, round(cal * ratio))
                    cur.execute("""
                        UPDATE diet_meals SET calories = %d
                        WHERE id = %d
                    """ % (adj_cal, meal_id))

        conn.commit()
        return respond(200, {
            'success': True,
            'new_calories': int(new_calories),
            'meals_adjusted': len(remaining_dates) if remaining_dates else 0,
            'message': 'План скорректирован!'
        })
    finally:
        conn.close()