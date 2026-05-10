"""Business: Агрегатор живого контекста семьи для ИИ-помощника Домового.

Собирает срез реальных данных семьи из всех ключевых модулей:
  - Семья (состав)
  - Дом (квартира, неоплаченные платежи, ремонты)
  - Финансы (последние расходы, бюджетные категории)
  - Покупки (что нужно купить)
  - Планирование (открытые задачи, цели)
  - Календарь (ближайшие события)

Возвращает компактную структуру, которую фронтенд подмешивает
в systemPrompt Домового, чтобы ИИ знал контекст семьи.
"""

import json
import os
from datetime import datetime, date
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def respond(status: int, body: Any) -> Dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str, ensure_ascii=False),
    }


def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def esc(value: Any) -> str:
    if value is None or value == '':
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def verify_token(token: str) -> Optional[str]:
    if not token:
        return None
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT user_id FROM {SCHEMA}.sessions "
            f"WHERE token = {esc(token)} AND expires_at > CURRENT_TIMESTAMP"
        )
        row = cur.fetchone()
        return str(row['user_id']) if row else None
    finally:
        cur.close()
        conn.close()


def get_family_id(user_id: str) -> Optional[str]:
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            f"SELECT family_id FROM {SCHEMA}.family_members "
            f"WHERE user_id::text = {esc(user_id)} LIMIT 1"
        )
        row = cur.fetchone()
        return str(row['family_id']) if row and row['family_id'] else None
    finally:
        cur.close()
        conn.close()


def safe_query(cur, sql: str) -> List[Dict]:
    """Выполняет запрос, проглатывая отсутствующие таблицы/колонки."""
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    except Exception as e:
        print(f"[domovoy-context] skip query: {e}")
        try:
            cur.connection.rollback()
        except Exception:
            pass
        return []


def collect_context(family_id: str) -> Dict[str, Any]:
    """Собирает все срезы контекста семьи параллельно (одно соединение)."""
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    context: Dict[str, Any] = {}

    try:
        # ───────── СЕМЬЯ ─────────
        members = safe_query(
            cur,
            f"SELECT name, role FROM {SCHEMA}.family_members "
            f"WHERE family_id::text = {esc(family_id)} "
            f"ORDER BY created_at ASC LIMIT 20"
        )
        context['family'] = {
            'members_count': len(members),
            'members': [{'name': m.get('name'), 'role': m.get('role')} for m in members],
        }

        # ───────── ДОМ ─────────
        apartment = safe_query(
            cur,
            f"SELECT address, area, rooms, ownership "
            f"FROM {SCHEMA}.home_apartment "
            f"WHERE family_id::text = {esc(family_id)} LIMIT 1"
        )
        utilities_all = safe_query(
            cur,
            f"SELECT name, amount, due_date, paid "
            f"FROM {SCHEMA}.home_utilities "
            f"WHERE family_id::text = {esc(family_id)} "
            f"ORDER BY paid ASC, due_date ASC NULLS LAST LIMIT 20"
        )
        unpaid = [u for u in utilities_all if not u.get('paid')]
        unpaid_total = sum(float(u.get('amount') or 0) for u in unpaid)
        repairs = safe_query(
            cur,
            f"SELECT title, status, priority FROM {SCHEMA}.home_repairs "
            f"WHERE family_id::text = {esc(family_id)} "
            f"AND status <> 'done' ORDER BY created_at DESC LIMIT 10"
        )
        context['home'] = {
            'apartment_filled': bool(apartment and apartment[0].get('address')),
            'apartment': apartment[0] if apartment else None,
            'unpaid_utilities_count': len(unpaid),
            'unpaid_utilities_total': round(unpaid_total, 2),
            'unpaid_utilities': [
                {'name': u.get('name'), 'amount': float(u.get('amount') or 0), 'due_date': str(u.get('due_date')) if u.get('due_date') else None}
                for u in unpaid[:5]
            ],
            'active_repairs_count': len(repairs),
            'active_repairs': [{'title': r.get('title'), 'priority': r.get('priority')} for r in repairs[:5]],
        }

        # ───────── ФИНАНСЫ ─────────
        # Расходы и доходы за текущий месяц
        finance_summary = safe_query(
            cur,
            f"SELECT "
            f"COALESCE(SUM(CASE WHEN transaction_type='income' THEN amount ELSE 0 END), 0) as income, "
            f"COALESCE(SUM(CASE WHEN transaction_type='expense' THEN amount ELSE 0 END), 0) as expense "
            f"FROM {SCHEMA}.finance_transactions "
            f"WHERE family_id::text = {esc(family_id)} "
            f"AND date_trunc('month', transaction_date) = date_trunc('month', CURRENT_DATE)"
        )
        # Топ-3 категорий расхода в этом месяце
        top_categories = safe_query(
            cur,
            f"SELECT fc.name as category, SUM(ft.amount) as total "
            f"FROM {SCHEMA}.finance_transactions ft "
            f"LEFT JOIN {SCHEMA}.finance_categories fc ON ft.category_id = fc.id "
            f"WHERE ft.family_id::text = {esc(family_id)} "
            f"AND ft.transaction_type = 'expense' "
            f"AND date_trunc('month', ft.transaction_date) = date_trunc('month', CURRENT_DATE) "
            f"GROUP BY fc.name ORDER BY total DESC LIMIT 3"
        )
        # Активные финансовые цели
        finance_goals = safe_query(
            cur,
            f"SELECT title, target_amount, current_amount, target_date "
            f"FROM {SCHEMA}.finance_goals "
            f"WHERE family_id::text = {esc(family_id)} "
            f"AND status = 'active' ORDER BY created_at DESC LIMIT 5"
        )
        # Активные кредиты/долги
        debts = safe_query(
            cur,
            f"SELECT name, remaining_amount, monthly_payment "
            f"FROM {SCHEMA}.finance_debts "
            f"WHERE family_id::text = {esc(family_id)} "
            f"AND status = 'active' ORDER BY remaining_amount DESC LIMIT 5"
        )
        if finance_summary:
            month_income = float(finance_summary[0].get('income') or 0)
            month_expense = float(finance_summary[0].get('expense') or 0)
        else:
            month_income = 0.0
            month_expense = 0.0
        context['finance'] = {
            'month_income': round(month_income, 2),
            'month_expense': round(month_expense, 2),
            'month_balance': round(month_income - month_expense, 2),
            'top_expense_categories': [
                {'category': c.get('category') or 'Без категории', 'total': float(c.get('total') or 0)}
                for c in top_categories
            ],
            'active_goals_count': len(finance_goals),
            'active_goals': [
                {
                    'title': g.get('title'),
                    'current': float(g.get('current_amount') or 0),
                    'target': float(g.get('target_amount') or 0),
                }
                for g in finance_goals[:3]
            ],
            'active_debts_count': len(debts),
            'active_debts': [
                {
                    'name': d.get('name'),
                    'remaining': float(d.get('remaining_amount') or 0),
                    'monthly': float(d.get('monthly_payment') or 0),
                }
                for d in debts[:3]
            ],
        }

        # ───────── ПОКУПКИ ─────────
        shopping = safe_query(
            cur,
            f"SELECT name, category, priority, price, bought "
            f"FROM {SCHEMA}.shopping_items_v2 "
            f"WHERE family_id::text = {esc(family_id)} AND bought = FALSE "
            f"ORDER BY priority DESC, created_at DESC LIMIT 20"
        )
        urgent_shopping = [s for s in shopping if s.get('priority') == 'urgent']
        context['shopping'] = {
            'pending_count': len(shopping),
            'urgent_count': len(urgent_shopping),
            'top_items': [
                {'name': s.get('name'), 'category': s.get('category'), 'priority': s.get('priority')}
                for s in shopping[:8]
            ],
        }

        # ───────── ЗАДАЧИ ─────────
        tasks_open = safe_query(
            cur,
            f"SELECT title, priority, deadline, category "
            f"FROM {SCHEMA}.tasks_v2 "
            f"WHERE family_id::text = {esc(family_id)} AND completed = FALSE "
            f"ORDER BY (deadline IS NULL), deadline ASC, priority DESC LIMIT 15"
        )
        today_str = str(date.today())
        overdue = [
            t for t in tasks_open
            if t.get('deadline') and str(t.get('deadline'))[:10] < today_str
        ]
        context['tasks'] = {
            'open_count': len(tasks_open),
            'overdue_count': len(overdue),
            'top_tasks': [
                {
                    'title': t.get('title'),
                    'priority': t.get('priority'),
                    'deadline': str(t.get('deadline'))[:10] if t.get('deadline') else None,
                }
                for t in tasks_open[:5]
            ],
        }

        # ───────── ЦЕЛИ СЕМЬИ ─────────
        family_goals = safe_query(
            cur,
            f"SELECT title, category, progress, target_date "
            f"FROM {SCHEMA}.family_goals "
            f"WHERE family_id::text = {esc(family_id)} "
            f"AND status = 'active' ORDER BY created_at DESC LIMIT 5"
        )
        context['goals'] = {
            'active_count': len(family_goals),
            'goals': [
                {
                    'title': g.get('title'),
                    'category': g.get('category'),
                    'progress': int(g.get('progress') or 0),
                }
                for g in family_goals[:3]
            ],
        }

        # ───────── КАЛЕНДАРЬ (ближайшие 7 дней) ─────────
        events = safe_query(
            cur,
            f"SELECT title, event_date, start_time, location "
            f"FROM {SCHEMA}.calendar_events "
            f"WHERE family_id::text = {esc(family_id)} "
            f"AND event_date >= CURRENT_DATE "
            f"AND event_date <= CURRENT_DATE + INTERVAL '7 days' "
            f"ORDER BY event_date ASC, start_time ASC LIMIT 10"
        )
        context['calendar'] = {
            'upcoming_count': len(events),
            'upcoming_events': [
                {
                    'title': e.get('title'),
                    'date': str(e.get('event_date')) if e.get('event_date') else None,
                    'time': str(e.get('start_time')) if e.get('start_time') else None,
                }
                for e in events[:5]
            ],
        }

        # Метка времени
        context['generated_at'] = datetime.now().isoformat()
        return context
    finally:
        cur.close()
        conn.close()


def build_text_summary(ctx: Dict[str, Any]) -> str:
    """Текстовая выжимка контекста — подмешивается в systemPrompt."""
    lines = []
    lines.append('=== ЖИВОЙ КОНТЕКСТ СЕМЬИ ===')
    lines.append(f"Дата сборки: {ctx.get('generated_at', '')[:16]}")

    # Семья
    fam = ctx.get('family') or {}
    if fam.get('members_count'):
        names = ', '.join(f"{m.get('name')} ({m.get('role')})" for m in fam.get('members', []))
        lines.append(f"\nСЕМЬЯ ({fam['members_count']}): {names}")

    # Дом
    home = ctx.get('home') or {}
    if home.get('apartment_filled') or home.get('unpaid_utilities_count') or home.get('active_repairs_count'):
        lines.append('\nДОМ:')
        if home.get('apartment_filled'):
            apt = home.get('apartment') or {}
            lines.append(f"  Квартира: {apt.get('address')}")
        if home.get('unpaid_utilities_count', 0) > 0:
            lines.append(
                f"  Неоплачено {home['unpaid_utilities_count']} счёт(ов) на сумму "
                f"{home['unpaid_utilities_total']:.0f} ₽"
            )
            for u in home.get('unpaid_utilities', [])[:3]:
                lines.append(f"    • {u.get('name')}: {u.get('amount'):.0f} ₽" + (f" (до {u.get('due_date')})" if u.get('due_date') else ''))
        if home.get('active_repairs_count', 0) > 0:
            lines.append(f"  Активных ремонтов: {home['active_repairs_count']}")

    # Финансы
    fin = ctx.get('finance') or {}
    if fin.get('month_income') or fin.get('month_expense') or fin.get('active_debts_count'):
        lines.append('\nФИНАНСЫ (текущий месяц):')
        lines.append(f"  Доходы: {fin.get('month_income', 0):.0f} ₽")
        lines.append(f"  Расходы: {fin.get('month_expense', 0):.0f} ₽")
        lines.append(f"  Баланс: {fin.get('month_balance', 0):.0f} ₽")
        if fin.get('top_expense_categories'):
            cats = ', '.join(f"{c['category']} ({c['total']:.0f} ₽)" for c in fin['top_expense_categories'][:3])
            lines.append(f"  Топ-категории расходов: {cats}")
        if fin.get('active_debts_count'):
            lines.append(f"  Активных кредитов/долгов: {fin['active_debts_count']}")
            for d in fin.get('active_debts', []):
                lines.append(f"    • {d.get('name')}: остаток {d.get('remaining'):.0f} ₽, платёж {d.get('monthly'):.0f} ₽/мес")
        if fin.get('active_goals_count'):
            lines.append(f"  Финансовых целей: {fin['active_goals_count']}")
            for g in fin.get('active_goals', []):
                lines.append(f"    • {g.get('title')}: {g.get('current'):.0f} / {g.get('target'):.0f} ₽")

    # Покупки
    sh = ctx.get('shopping') or {}
    if sh.get('pending_count'):
        lines.append(f"\nПОКУПКИ: {sh['pending_count']} к покупке" + (f", {sh['urgent_count']} срочно" if sh.get('urgent_count') else ''))
        for s in sh.get('top_items', [])[:5]:
            mark = '🔥 ' if s.get('priority') == 'urgent' else ''
            lines.append(f"  • {mark}{s.get('name')}")

    # Задачи
    t = ctx.get('tasks') or {}
    if t.get('open_count'):
        lines.append(f"\nЗАДАЧИ: открыто {t['open_count']}" + (f", просрочено {t['overdue_count']}" if t.get('overdue_count') else ''))
        for tk in t.get('top_tasks', [])[:5]:
            line = f"  • {tk.get('title')}"
            if tk.get('deadline'):
                line += f" (до {tk['deadline']})"
            lines.append(line)

    # Цели семьи
    g = ctx.get('goals') or {}
    if g.get('active_count'):
        lines.append(f"\nЦЕЛИ СЕМЬИ: {g['active_count']} активных")
        for goal in g.get('goals', []):
            lines.append(f"  • {goal.get('title')} — {goal.get('progress')}%")

    # Календарь
    cal = ctx.get('calendar') or {}
    if cal.get('upcoming_count'):
        lines.append(f"\nКАЛЕНДАРЬ (ближайшие 7 дней): {cal['upcoming_count']} событий")
        for e in cal.get('upcoming_events', []):
            line = f"  • {e.get('date')}"
            if e.get('time'):
                line += f" {str(e['time'])[:5]}"
            line += f" — {e.get('title')}"
            lines.append(line)

    lines.append('\n=== КАК ИСПОЛЬЗОВАТЬ ===')
    lines.append('Это реальные данные семьи на момент запроса.')
    lines.append('Учитывай их при ответе: называй конкретные цифры, имена, даты.')
    lines.append('Не пересказывай данные подряд — органично вплетай в советы.')
    lines.append('Если пользователь спрашивает о чём-то, что есть в контексте, — отвечай конкретно по его данным.')
    lines.append('Если контекст пустой — мягко предлагай заполнить соответствующий раздел.')

    return '\n'.join(lines)


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Возвращает живой контекст семьи для Домового.

    Метод: GET
    Заголовки: X-Auth-Token обязателен
    Ответ:
      {
        "summary": "...",   # текст для systemPrompt
        "data": {...}       # структурированные данные на будущее
      }
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'GET':
        return respond(405, {'error': 'method_not_allowed'})

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    user_id = verify_token(token)
    if not user_id:
        return respond(401, {'error': 'unauthorized'})

    family_id = get_family_id(user_id)
    if not family_id:
        return respond(200, {'summary': '', 'data': {'family': {'members_count': 0}}})

    try:
        ctx = collect_context(family_id)
        summary = build_text_summary(ctx)
        return respond(200, {'summary': summary, 'data': ctx})
    except Exception as e:
        print(f"[domovoy-context] error: {e}")
        return respond(500, {'error': 'internal', 'detail': str(e)})