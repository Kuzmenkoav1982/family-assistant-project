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
        elif action == 'notification_settings':
            return get_notification_settings(user_id)
        elif action == 'today_activity':
            return get_today_activity(user_id, plan_id)
        elif action == 'final_report':
            return get_final_report(user_id, plan_id)

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
        elif action == 'save_notification_settings':
            return save_notification_settings(user_id, body)
        elif action == 'log_activity':
            return log_activity(user_id, body)
        elif action == 'finish_plan':
            return finish_plan(user_id, body)
        elif action == 'extend_plan':
            return extend_plan(user_id, body)

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
            FROM diet_plans WHERE user_id = '%s' AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """ % str(user_id))
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
            FROM diet_weight_log WHERE user_id = '%s' AND plan_id = %d
            ORDER BY measured_at ASC
        """ % (str(user_id), plan_id))
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
            WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at DESC LIMIT 1
        """ % (str(user_id), plan_id))
        last_w = cur.fetchone()
        last_weight = float(last_w[0]) if last_w else None

        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at ASC LIMIT 1
        """ % (str(user_id), plan_id))
        first_w = cur.fetchone()
        start_weight = float(first_w[0]) if first_w else None

        weight_lost = round(start_weight - last_weight, 1) if start_weight and last_weight else 0

        cur.execute("""
            SELECT measured_at FROM diet_weight_log
            WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at DESC LIMIT 1
        """ % (str(user_id), plan_id))
        last_log = cur.fetchone()
        days_since_log = (datetime.now() - last_log[0]).days if last_log else 999

        streak = 0
        cur.execute("""
            SELECT DISTINCT meal_date FROM diet_meals
            WHERE plan_id = %d AND completed = TRUE ORDER BY meal_date DESC
        """ % plan_id)
        completed_dates = [r[0] for r in cur.fetchall()]
        if completed_dates:
            check_date = date.today()
            for d in completed_dates:
                if d == check_date or d == check_date - timedelta(days=1):
                    streak += 1
                    check_date = d - timedelta(days=1)
                else:
                    break

        is_plateau = False
        if len(weight_log) >= 5:
            last_5 = [w['weight_kg'] for w in weight_log[-5:]]
            weight_range = max(last_5) - min(last_5)
            if weight_range < 0.5 and days_elapsed >= 7:
                is_plateau = True

        tip = None
        if is_plateau:
            tip = {'type': 'plateau', 'title': 'Плато — это нормально!', 'text': 'Вес стоит на месте несколько дней. Это обычный этап: организм перестраивается. Попробуй изменить тренировки или увеличить потребление воды. Результат скоро вернётся!'}
        elif days_elapsed == 1:
            tip = {'type': 'start', 'title': 'Первый день!', 'text': 'Самое сложное — начать. Ты уже это сделал! Следуй плану и записывай вес каждый день.'}
        elif days_elapsed == 3:
            tip = {'type': 'sugar', 'title': 'Тяга к сладкому?', 'text': 'На 2-4 день часто хочется сладкого — организм привыкает к новому режиму. Это пройдёт! Пей воду и ешь фрукты.'}
        elif weight_lost > 0 and days_elapsed >= 7:
            tip = {'type': 'success', 'title': 'Ты на верном пути!', 'text': f'Уже -{weight_lost} кг за {days_elapsed} дней. Продолжай в том же духе!'}

        stats = {
            'days_elapsed': days_elapsed,
            'days_remaining': days_remaining,
            'completed_meals': completed_meals,
            'total_meals': total_meals,
            'adherence_pct': round(completed_meals / total_meals * 100) if total_meals > 0 else 0,
            'weight_lost': weight_lost,
            'start_weight': start_weight,
            'last_weight': last_weight,
            'days_since_log': days_since_log,
            'streak': streak,
            'is_plateau': is_plateau,
        }

        return respond(200, {
            'has_plan': True,
            'plan': plan,
            'weight_log': weight_log,
            'today_meals': today_meals,
            'stats': stats,
            'tip': tip
        })
    finally:
        conn.close()


def get_weight_history(user_id, plan_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        query = "SELECT weight_kg, wellbeing, measured_at FROM diet_weight_log WHERE user_id = '%s'" % str(user_id)
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
                FROM diet_plans WHERE id = %d AND user_id = '%s'
            """ % (int(plan_id), str(user_id)))
        else:
            cur.execute("""
                SELECT id, plan_type, start_date, end_date, duration_days,
                       target_weight_loss_kg, target_calories_daily, status
                FROM diet_plans WHERE user_id = '%s' AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % str(user_id))
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
            FROM diet_plans WHERE user_id = '%s' ORDER BY created_at DESC
        """ % str(user_id))
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
                VALUES ('%s', %d, %s, '%s')
            """ % (str(user_id), int(plan_id), float(weight), str(wellbeing).replace("'", "''")))
        else:
            cur.execute("""
                INSERT INTO diet_weight_log (user_id, weight_kg, wellbeing)
                VALUES ('%s', %s, '%s')
            """ % (str(user_id), float(weight), str(wellbeing).replace("'", "''")))

        try:
            cur.execute("""
                SELECT id FROM health_profiles WHERE user_id = '%s' LIMIT 1
            """ % str(user_id))
            hp = cur.fetchone()
            if hp:
                import uuid
                record_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO vital_records (id, profile_id, type, value, unit, date, time, notes)
                    VALUES ('%s', '%s', 'weight', '%s', 'кг', CURRENT_DATE, CURRENT_TIME, '%s')
                """ % (record_id, hp[0], str(float(weight)), ('Из диеты. ' + str(wellbeing)).replace("'", "''")[:500]))
        except Exception as e:
            print(f"[diet-progress] Sync weight to health error: {e}")

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
            WHERE user_id = '%s' AND status = 'active'
        """ % str(user_id))

        duration = len(set(m.get('day', '') for m in meals_data if m.get('day')))
        if duration == 0:
            duration = 7
        start = date.today()
        end = start + timedelta(days=duration - 1)

        daily_cal = plan_data.get('daily_calories', 1800)
        daily_water = plan_data.get('daily_water_ml')
        daily_steps = plan_data.get('daily_steps')
        exercise_rec = plan_data.get('exercise_recommendation')

        target_loss = None
        if quiz_data.get('current_weight_kg') and quiz_data.get('target_weight_kg'):
            try:
                target_loss = float(quiz_data['current_weight_kg']) - float(quiz_data['target_weight_kg'])
            except (ValueError, TypeError):
                pass

        program_sql = "NULL" if not program_id else str(int(program_id))
        target_sql = "NULL" if not target_loss else str(target_loss)
        water_sql = str(int(daily_water)) if daily_water else "NULL"
        steps_sql = str(int(daily_steps)) if daily_steps else "NULL"
        exercise_sql = "'%s'" % str(exercise_rec).replace("'", "''") if exercise_rec else "NULL"

        cur.execute("""
            INSERT INTO diet_plans (user_id, plan_type, start_date, end_date, duration_days,
                target_weight_loss_kg, target_calories_daily, program_id, status,
                daily_water_ml, daily_steps, exercise_recommendation)
            VALUES ('%s', '%s', '%s', '%s', %d, %s, %d, %s, 'active', %s, %s, %s)
            RETURNING id
        """ % (str(user_id), plan_type.replace("'", ""), str(start), str(end), duration,
               target_sql, int(daily_cal), program_sql, water_sql, steps_sql, exercise_sql))
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
                    VALUES ('%s', %d, %s, 'Начало диеты')
                """ % (str(user_id), plan_id, w))
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
            WHERE dm.id = %d AND dp.user_id = '%s'
        """ % (int(meal_id), str(user_id)))
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
            VALUES ('%s', %d, '%s', '%s')
        """ % (str(user_id), int(plan_id), reason.replace("'", "''")[:50], comment.replace("'", "''")[:500]))
        conn.commit()

        reason_labels = {
            'strong_hunger': 'Сильный голод',
            'weakness': 'Упадок сил',
            'psychological': 'Психологически тяжело',
            'want_to_quit': 'Хочу бросить диету',
        }

        ctx = get_diet_context(cur, user_id, plan_id)
        stats = get_progress_stats(cur, user_id, plan_id) if ctx else None

        days_on = (date.today() - ctx['start_date']).days + 1 if ctx else 1

        system = """Ты заботливый персональный диетолог. Человек на диете просит помощи — ему сейчас плохо.
Твоя задача: поддержать, дать конкретный совет, помочь не сдаться.
Говори на «ты», тепло, как друг. 3-5 предложений. Без смайликов."""

        user_prompt = f"""Человек на диете нажал кнопку SOS.
Причина: {reason_labels.get(reason, reason)}
{f'Комментарий: {comment}' if comment else ''}

Контекст:
- День диеты: {days_on} из {ctx['duration'] if ctx else '?'}
- Сброшено: {stats['lost'] if stats else 0} кг
- Соблюдение: {round(stats['done'] / stats['total'] * 100) if stats and stats['total'] > 0 else 0}%
- Калории/день: {ctx['calories'] if ctx else '?'} ккал
- Последнее самочувствие: {stats['wellbeing'] if stats and stats['wellbeing'] else 'не указано'}

Дай конкретный совет именно по этой причине. Если голод — что съесть прямо сейчас. Если слабость — что делать. Если хочет бросить — напомни результаты и мотивируй."""

        ai_text = call_yandex_gpt(system, user_prompt, temperature=0.6, max_tokens=500)

        fallback_responses = {
            'strong_hunger': 'Сильный голод — это сигнал, что организм перестраивается. Выпей стакан тёплой воды и съешь горсть орехов или яблоко. Это пройдёт!',
            'weakness': 'Упадок сил может быть от недостатка углеводов. Съешь банан или порцию каши. Если слабость сильная — обратись к врачу.',
            'psychological': 'Это нормально — диета требует силы воли. Ты уже столько прошёл! Сделай глубокий вдох и вспомни, зачем ты начал.',
            'want_to_quit': 'Не сдавайся! Каждый день приближает тебя к цели. Ты уже продержался — это уже победа.',
            'other': 'Я рядом и помогу! Не переживай, вместе справимся.'
        }

        message = ai_text if ai_text else fallback_responses.get(reason, fallback_responses['other'])

        return respond(200, {
            'success': True,
            'message': message,
            'ai': bool(ai_text),
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
                SELECT id FROM diet_plans WHERE user_id = '%s' AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % str(user_id))
            row = cur.fetchone()
            if not row:
                return respond(200, {'message': 'Начните диету, чтобы получать мотивационные сообщения!'})
            plan_id = row[0]

        cur.execute("SELECT start_date FROM diet_plans WHERE id = %d" % int(plan_id))
        plan_row = cur.fetchone()
        days_on_diet = (date.today() - plan_row[0]).days + 1 if plan_row else 1

        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at ASC LIMIT 1
        """ % (str(user_id), int(plan_id)))
        first = cur.fetchone()
        cur.execute("""
            SELECT weight_kg FROM diet_weight_log
            WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at DESC LIMIT 1
        """ % (str(user_id), int(plan_id)))
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
            VALUES ('%s', %d, '%s', '%s')
        """ % (str(user_id), int(plan_id), time_of_day, msg.replace("'", "''")))
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


def call_yandex_gpt(system_prompt, user_prompt, temperature=0.7, max_tokens=400):
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID')
    if not api_key or not folder_id:
        return None

    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
    payload = {
        'modelUri': f'gpt://{folder_id}/yandexgpt-lite/latest',
        'completionOptions': {'stream': False, 'temperature': temperature, 'maxTokens': max_tokens},
        'messages': [
            {'role': 'system', 'text': system_prompt},
            {'role': 'user', 'text': user_prompt}
        ]
    }
    resp = requests.post(url, headers={'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}, json=payload, timeout=15)
    if resp.status_code == 200:
        return resp.json().get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
    return None


def get_diet_context(cur, user_id, plan_id):
    if not plan_id:
        cur.execute("""
            SELECT id, start_date, target_weight_loss_kg, target_calories_daily, plan_type, duration_days
            FROM diet_plans WHERE user_id = '%s' AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        """ % str(user_id))
        row = cur.fetchone()
        if not row:
            return None
        return {'plan_id': row[0], 'start_date': row[1], 'target_loss': float(row[2]) if row[2] else None, 'calories': row[3], 'plan_type': row[4], 'duration': row[5]}

    cur.execute("""
        SELECT id, start_date, target_weight_loss_kg, target_calories_daily, plan_type, duration_days
        FROM diet_plans WHERE id = %d
    """ % int(plan_id))
    row = cur.fetchone()
    if not row:
        return None
    return {'plan_id': row[0], 'start_date': row[1], 'target_loss': float(row[2]) if row[2] else None, 'calories': row[3], 'plan_type': row[4], 'duration': row[5]}


def get_progress_stats(cur, user_id, plan_id):
    cur.execute("SELECT weight_kg FROM diet_weight_log WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at ASC LIMIT 1" % (str(user_id), int(plan_id)))
    first_w = cur.fetchone()
    cur.execute("SELECT weight_kg FROM diet_weight_log WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at DESC LIMIT 1" % (str(user_id), int(plan_id)))
    last_w = cur.fetchone()
    lost = round(float(first_w[0]) - float(last_w[0]), 1) if first_w and last_w else 0

    cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d AND completed = TRUE" % int(plan_id))
    done = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d" % int(plan_id))
    total = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d AND meal_date = '%s' AND completed = TRUE" % (int(plan_id), date.today().isoformat()))
    today_done = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d AND meal_date = '%s'" % (int(plan_id), date.today().isoformat()))
    today_total = cur.fetchone()[0]

    cur.execute("SELECT wellbeing FROM diet_weight_log WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at DESC LIMIT 1" % (str(user_id), int(plan_id)))
    wb = cur.fetchone()

    return {
        'lost': lost,
        'start_weight': float(first_w[0]) if first_w else None,
        'current_weight': float(last_w[0]) if last_w else None,
        'done': done,
        'total': total,
        'today_done': today_done,
        'today_total': today_total,
        'wellbeing': wb[0] if wb else None
    }


def generate_motivation(user_id, body):
    plan_id = body.get('plan_id')
    time_of_day = body.get('time', 'morning')

    conn = get_db()
    try:
        cur = conn.cursor()
        ctx = get_diet_context(cur, user_id, plan_id)
        if not ctx:
            return respond(200, {'message': 'Начните диету — и я буду вас поддерживать каждый день!'})

        plan_id = ctx['plan_id']
        days_on = (date.today() - ctx['start_date']).days + 1
        stats = get_progress_stats(cur, user_id, plan_id)

        adherence = round(stats['done'] / stats['total'] * 100) if stats['total'] > 0 else 0
        time_label = "утреннее" if time_of_day == "morning" else "вечернее"

        user_prompt = f"""Напиши персональное {time_label} мотивационное сообщение.

Контекст:
- День диеты: {days_on} из {ctx['duration'] or 7}
- Сброшено: {stats['lost']} кг (цель: {ctx['target_loss'] or 'не указана'} кг)
- Соблюдение плана: {adherence}% ({stats['done']} из {stats['total']} приёмов пищи)
- Сегодня съедено: {stats['today_done']} из {stats['today_total']} приёмов
- Самочувствие: {stats['wellbeing'] or 'не указано'}
- Калории/день: {ctx['calories']} ккал

Правила:
- 2-4 предложения, тёплый и поддерживающий тон
- Обращайся на «ты»
- Если прогресс хороший — похвали конкретно за достижение
- Если сложно — поддержи, напомни зачем начал
- {'Утром: задай настрой на день, упомяни план питания' if time_of_day == 'morning' else 'Вечером: подведи итог дня, похвали за усилия, пожелай спокойной ночи'}
- Не используй смайлики и эмодзи"""

        system = "Ты персональный тренер-диетолог. Говоришь тепло, как друг. Знаешь конкретные данные пользователя и опираешься на них."

        ai_text = call_yandex_gpt(system, user_prompt, temperature=0.8)

        if ai_text:
            cur.execute("""
                INSERT INTO diet_motivation_log (user_id, plan_id, message_type, message_text)
                VALUES ('%s', %d, '%s', '%s')
            """ % (str(user_id), int(plan_id), time_of_day, ai_text.replace("'", "''")))
            conn.commit()
            return respond(200, {'message': ai_text, 'day': days_on, 'weight_lost': stats['lost'], 'ai': True})

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
                SELECT id FROM diet_plans WHERE user_id = '%s' AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % str(user_id))
            row = cur.fetchone()
            if not row:
                return respond(200, {'has_analysis': False, 'message': 'Нет активного плана'})
            plan_id = row[0]

        cur.execute("""
            SELECT start_date, end_date, duration_days, target_weight_loss_kg,
                   target_calories_daily, daily_water_ml, daily_steps
            FROM diet_plans WHERE id = %d AND user_id = '%s'
        """ % (int(plan_id), str(user_id)))
        plan = cur.fetchone()
        if not plan:
            return respond(404, {'error': 'План не найден'})

        start_date, end_date, duration, target_loss, target_cal, water, steps = plan

        cur.execute("""
            SELECT weight_kg, measured_at FROM diet_weight_log
            WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at ASC
        """ % (str(user_id), int(plan_id)))
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
            WHERE user_id = '%s' AND plan_id = %d
        """ % (str(user_id), int(plan_id)))
        sos_count = cur.fetchone()[0]

        cur.execute("""
            SELECT wellbeing FROM diet_weight_log
            WHERE user_id = '%s' AND plan_id = %d AND wellbeing IS NOT NULL AND wellbeing != ''
            ORDER BY measured_at DESC LIMIT 5
        """ % (str(user_id), int(plan_id)))
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
            SELECT id FROM diet_plans WHERE id = %d AND user_id = '%s' AND status = 'active'
        """ % (int(plan_id), str(user_id)))
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


NOTIFICATION_TYPES = {
    'weight_reminder': {'label': 'Напоминание взвеситься', 'default_time': '08:00'},
    'meal_reminder': {'label': 'Напоминание о приёме пищи', 'default_time': None},
    'water_reminder': {'label': 'Напоминание пить воду', 'default_interval': 120},
    'motivation': {'label': 'Мотивация от ИИ', 'default_time': '09:00'},
    'weekly_report': {'label': 'Еженедельный отчёт', 'default_time': '20:00'},
    'sos_followup': {'label': 'Проверка после SOS', 'default_time': None},
    'plan_ending': {'label': 'Окончание плана', 'default_time': '10:00'},
}


def get_notification_settings(user_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT notification_type, enabled, time_value, interval_minutes, channel, quiet_start, quiet_end
            FROM nutrition_notification_settings WHERE user_id = '%s'
        """ % str(user_id))
        rows = cur.fetchall()

        saved = {}
        for r in rows:
            saved[r[0]] = {
                'type': r[0],
                'enabled': r[1],
                'time_value': r[2],
                'interval_minutes': r[3],
                'channel': r[4],
                'quiet_start': r[5],
                'quiet_end': r[6],
            }

        settings = []
        for ntype, info in NOTIFICATION_TYPES.items():
            if ntype in saved:
                s = saved[ntype]
                s['label'] = info['label']
                settings.append(s)
            else:
                settings.append({
                    'type': ntype,
                    'label': info['label'],
                    'enabled': True,
                    'time_value': info.get('default_time'),
                    'interval_minutes': info.get('default_interval'),
                    'channel': 'push',
                    'quiet_start': '22:00',
                    'quiet_end': '07:00',
                })

        return respond(200, {'settings': settings})
    finally:
        conn.close()


def save_notification_settings(user_id, body):
    settings = body.get('settings', [])
    if not settings:
        return respond(400, {'error': 'settings обязательны'})

    conn = get_db()
    try:
        cur = conn.cursor()
        for s in settings:
            ntype = s.get('type', '')
            if ntype not in NOTIFICATION_TYPES:
                continue
            enabled = s.get('enabled', True)
            time_val = s.get('time_value')
            interval = s.get('interval_minutes')
            channel = s.get('channel', 'push')
            quiet_start = s.get('quiet_start', '22:00')
            quiet_end = s.get('quiet_end', '07:00')

            time_sql = "'%s'" % time_val.replace("'", "")[:5] if time_val else 'NULL'
            interval_sql = str(int(interval)) if interval else 'NULL'
            channel_safe = channel.replace("'", "")[:20]
            qs = quiet_start.replace("'", "")[:5] if quiet_start else '22:00'
            qe = quiet_end.replace("'", "")[:5] if quiet_end else '07:00'

            cur.execute("""
                INSERT INTO nutrition_notification_settings
                    (user_id, notification_type, enabled, time_value, interval_minutes, channel, quiet_start, quiet_end, updated_at)
                VALUES ('%s', '%s', %s, %s, %s, '%s', '%s', '%s', NOW())
                ON CONFLICT (user_id, notification_type)
                DO UPDATE SET enabled = %s, time_value = %s, interval_minutes = %s, channel = '%s',
                    quiet_start = '%s', quiet_end = '%s', updated_at = NOW()
            """ % (
                str(user_id), ntype, str(enabled).upper(), time_sql, interval_sql, channel_safe, qs, qe,
                str(enabled).upper(), time_sql, interval_sql, channel_safe, qs, qe
            ))

        conn.commit()
        return respond(200, {'success': True, 'message': 'Настройки сохранены'})
    finally:
        conn.close()


def get_today_activity(user_id, plan_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        if not plan_id:
            cur.execute("""
                SELECT id FROM diet_plans WHERE user_id = '%s' AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % str(user_id))
            row = cur.fetchone()
            if not row:
                return respond(200, {'activity': None})
            plan_id = row[0]

        cur.execute("""
            SELECT steps, exercise_type, exercise_duration_min, exercise_note, calories_burned
            FROM diet_activity_log
            WHERE user_id = '%s' AND plan_id = %d AND log_date = CURRENT_DATE
        """ % (str(user_id), int(plan_id)))
        row = cur.fetchone()
        if not row:
            return respond(200, {'activity': None})

        return respond(200, {'activity': {
            'steps': row[0], 'exercise_type': row[1],
            'exercise_duration_min': row[2], 'exercise_note': row[3],
            'calories_burned': row[4]
        }})
    finally:
        conn.close()


def log_activity(user_id, body):
    plan_id = body.get('plan_id')
    steps = body.get('steps', 0)
    exercise_type = body.get('exercise_type', '')
    exercise_duration = body.get('exercise_duration_min', 0)
    exercise_note = body.get('exercise_note', '')
    calories_burned = body.get('calories_burned', 0)

    conn = get_db()
    try:
        cur = conn.cursor()
        if not plan_id:
            cur.execute("""
                SELECT id FROM diet_plans WHERE user_id = '%s' AND status = 'active'
                ORDER BY created_at DESC LIMIT 1
            """ % str(user_id))
            row = cur.fetchone()
            if not row:
                return respond(400, {'error': 'Нет активного плана'})
            plan_id = row[0]

        ex_type_safe = exercise_type.replace("'", "''")[:100] if exercise_type else ''
        ex_note_safe = exercise_note.replace("'", "''")[:500] if exercise_note else ''

        cur.execute("""
            INSERT INTO diet_activity_log (user_id, plan_id, log_date, steps, exercise_type, exercise_duration_min, exercise_note, calories_burned)
            VALUES ('%s', %d, CURRENT_DATE, %d, '%s', %d, '%s', %d)
            ON CONFLICT (user_id, plan_id, log_date)
            DO UPDATE SET steps = %d, exercise_type = '%s', exercise_duration_min = %d,
                exercise_note = '%s', calories_burned = %d
        """ % (
            str(user_id), int(plan_id), int(steps), ex_type_safe, int(exercise_duration), ex_note_safe, int(calories_burned),
            int(steps), ex_type_safe, int(exercise_duration), ex_note_safe, int(calories_burned)
        ))
        conn.commit()
        return respond(200, {'success': True, 'message': 'Активность записана'})
    finally:
        conn.close()


def get_final_report(user_id, plan_id):
    conn = get_db()
    try:
        cur = conn.cursor()
        if not plan_id:
            cur.execute("""
                SELECT id FROM diet_plans WHERE user_id = '%s' AND status IN ('active', 'completed')
                ORDER BY created_at DESC LIMIT 1
            """ % str(user_id))
            row = cur.fetchone()
            if not row:
                return respond(404, {'error': 'План не найден'})
            plan_id = row[0]

        cur.execute("""
            SELECT plan_type, start_date, end_date, duration_days,
                   target_weight_loss_kg, target_calories_daily, status,
                   daily_water_ml, daily_steps, exercise_recommendation
            FROM diet_plans WHERE id = %d AND user_id = '%s'
        """ % (int(plan_id), str(user_id)))
        plan = cur.fetchone()
        if not plan:
            return respond(404, {'error': 'План не найден'})

        start_date, end_date, duration = plan[1], plan[2], plan[3]
        target_loss = float(plan[4]) if plan[4] else 0
        target_cal = plan[5]
        plan_status = plan[6]

        cur.execute("SELECT weight_kg, measured_at FROM diet_weight_log WHERE user_id = '%s' AND plan_id = %d ORDER BY measured_at ASC" % (str(user_id), int(plan_id)))
        weights = cur.fetchall()
        start_weight = float(weights[0][0]) if weights else None
        end_weight = float(weights[-1][0]) if weights else None
        actual_loss = round(start_weight - end_weight, 1) if start_weight and end_weight else 0
        goal_pct = round(actual_loss / target_loss * 100) if target_loss > 0 else 0

        cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d AND completed = TRUE" % int(plan_id))
        meals_done = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM diet_meals WHERE plan_id = %d" % int(plan_id))
        meals_total = cur.fetchone()[0]
        adherence = round(meals_done / meals_total * 100) if meals_total > 0 else 0

        cur.execute("SELECT COUNT(*) FROM diet_sos_requests WHERE user_id = '%s' AND plan_id = %d" % (str(user_id), int(plan_id)))
        sos_count = cur.fetchone()[0]

        cur.execute("SELECT COALESCE(SUM(steps), 0), COALESCE(SUM(exercise_duration_min), 0), COALESCE(SUM(calories_burned), 0) FROM diet_activity_log WHERE user_id = '%s' AND plan_id = %d" % (str(user_id), int(plan_id)))
        act = cur.fetchone()
        total_steps = act[0]
        total_exercise_min = act[1]
        total_cal_burned = act[2]

        days_active = (date.today() - start_date).days if plan_status == 'active' else (end_date - start_date).days
        days_active = max(days_active, 1)

        avg_daily_steps = round(total_steps / days_active) if days_active > 0 else 0

        weight_trend = []
        for w in weights:
            weight_trend.append({'weight': float(w[0]), 'date': str(w[1])[:10]})

        cur.execute("SELECT COUNT(DISTINCT log_date) FROM diet_weight_log WHERE user_id = '%s' AND plan_id = %d" % (str(user_id), int(plan_id)))
        weigh_in_days = cur.fetchone()[0]

        streak = 0
        cur.execute("""
            SELECT DISTINCT meal_date FROM diet_meals
            WHERE plan_id = %d AND completed = TRUE
            ORDER BY meal_date DESC
        """ % int(plan_id))
        completed_dates = [r[0] for r in cur.fetchall()]
        if completed_dates:
            check_date = date.today()
            for d in completed_dates:
                if d == check_date or d == check_date - timedelta(days=1):
                    streak += 1
                    check_date = d - timedelta(days=1)
                else:
                    break

        system = "Ты персональный диетолог. Напиши краткий итог диеты: что получилось, что улучшить, рекомендации на будущее. 3-5 предложений, тепло и поддерживающе."
        user_prompt = f"""Итоги диеты:
- Длительность: {days_active} дней из {duration}
- Сброшено: {actual_loss} кг (цель: {target_loss} кг, {goal_pct}%)
- Соблюдение плана: {adherence}%
- SOS-обращения: {sos_count}
- Средние шаги/день: {avg_daily_steps}
- Тренировок: {total_exercise_min} мин всего"""

        ai_summary = call_yandex_gpt(system, user_prompt, temperature=0.7, max_tokens=500)
        if not ai_summary:
            if actual_loss > 0:
                ai_summary = f'За {days_active} дней ты сбросил {actual_loss} кг — это отличный результат! Соблюдение плана {adherence}% показывает твою дисциплину. Рекомендую перейти в режим стабилизации, чтобы закрепить результат.'
            else:
                ai_summary = f'Ты продержался {days_active} дней — это уже достижение! Даже если вес пока не снизился, организм перестроился. Рекомендую продолжить с небольшими корректировками.'

        stabilization_calories = target_cal + 200 if target_cal else 1800

        return respond(200, {
            'report': {
                'days_active': days_active,
                'duration': duration,
                'start_weight': start_weight,
                'end_weight': end_weight,
                'actual_loss': actual_loss,
                'target_loss': target_loss,
                'goal_pct': min(goal_pct, 100),
                'adherence': adherence,
                'meals_done': meals_done,
                'meals_total': meals_total,
                'sos_count': sos_count,
                'total_steps': total_steps,
                'total_exercise_min': total_exercise_min,
                'total_cal_burned': total_cal_burned,
                'avg_daily_steps': avg_daily_steps,
                'weigh_in_days': weigh_in_days,
                'streak': streak,
                'weight_trend': weight_trend,
                'ai_summary': ai_summary,
                'stabilization_calories': stabilization_calories,
                'plan_status': plan_status,
            }
        })
    finally:
        conn.close()


def finish_plan(user_id, body):
    plan_id = body.get('plan_id')
    if not plan_id:
        return respond(400, {'error': 'plan_id обязателен'})

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id FROM diet_plans WHERE id = %d AND user_id = '%s' AND status = 'active'
        """ % (int(plan_id), str(user_id)))
        if not cur.fetchone():
            return respond(404, {'error': 'Активный план не найден'})

        cur.execute("""
            UPDATE diet_plans SET status = 'completed', end_date = CURRENT_DATE
            WHERE id = %d
        """ % int(plan_id))
        conn.commit()
        return respond(200, {'success': True, 'message': 'План завершён'})
    finally:
        conn.close()


def extend_plan(user_id, body):
    plan_id = body.get('plan_id')
    extra_days = body.get('extra_days', 7)
    if not plan_id:
        return respond(400, {'error': 'plan_id обязателен'})

    if extra_days not in (7, 14, 30):
        extra_days = 7

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, end_date, duration_days, target_calories_daily
            FROM diet_plans WHERE id = %d AND user_id = '%s' AND status = 'active'
        """ % (int(plan_id), str(user_id)))
        plan = cur.fetchone()
        if not plan:
            return respond(404, {'error': 'Активный план не найден'})

        old_end = plan[1]
        old_duration = plan[2]
        calories = plan[3]
        new_end = old_end + timedelta(days=extra_days)
        new_duration = old_duration + extra_days

        cur.execute("""
            UPDATE diet_plans SET end_date = '%s', duration_days = %d
            WHERE id = %d
        """ % (str(new_end), new_duration, int(plan_id)))

        type_times = {'breakfast': '08:00', 'lunch': '13:00', 'dinner': '19:00', 'snack': '16:00'}
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
        cal_per_meal = {'breakfast': round(calories * 0.25), 'lunch': round(calories * 0.35), 'dinner': round(calories * 0.25), 'snack': round(calories * 0.15)}

        for d in range(extra_days):
            meal_date = old_end + timedelta(days=d + 1)
            day_num = old_duration + d + 1
            for mt in meal_types:
                cur.execute("""
                    INSERT INTO diet_meals (plan_id, day_number, meal_date, meal_type, meal_time,
                        title, recipe, calories, protein_g, fat_g, carbs_g)
                    VALUES (%d, %d, '%s', '%s', '%s', 'Свободный выбор', 'Выберите блюдо на %d ккал', %d, 0, 0, 0)
                """ % (int(plan_id), day_num, str(meal_date), mt, type_times[mt], cal_per_meal[mt], cal_per_meal[mt]))

        conn.commit()
        return respond(200, {
            'success': True,
            'new_end_date': str(new_end),
            'new_duration': new_duration,
            'meals_added': extra_days * 4,
            'message': f'План продлён на {extra_days} дней (до {new_end.strftime("%d.%m.%Y")})'
        })
    finally:
        conn.close()