import json
import os
import psycopg2
from typing import Dict, Any


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
}


def get_db():
    return psycopg2.connect(os.environ.get('DATABASE_URL', ''))


def safe(val):
    if val is None:
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"


def get_family_id(token):
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT family_id FROM users WHERE auth_token = %s" % safe(token))
    row = cur.fetchone()
    conn.close()
    return str(row[0]) if row else None


HOLIDAYS = {
    'orthodox': [
        {'title': 'Рождество Христово', 'date': '2026-01-07', 'type': 'holiday', 'fasting': False, 'desc': 'Великий двунадесятый праздник Рождества Господа Иисуса Христа'},
        {'title': 'Крещение Господне', 'date': '2026-01-19', 'type': 'holiday', 'fasting': False, 'desc': 'Богоявление — крещение Иисуса в Иордане'},
        {'title': 'Сретение Господне', 'date': '2026-02-15', 'type': 'holiday', 'fasting': False, 'desc': 'Встреча младенца Иисуса в Иерусалимском храме'},
        {'title': 'Благовещение', 'date': '2026-04-07', 'type': 'holiday', 'fasting': False, 'desc': 'Благая весть архангела Гавриила Деве Марии'},
        {'title': 'Пасха', 'date': '2026-04-12', 'type': 'holiday', 'fasting': False, 'desc': 'Светлое Христово Воскресение — главный праздник'},
        {'title': 'Вознесение Господне', 'date': '2026-05-21', 'type': 'holiday', 'fasting': False, 'desc': 'Вознесение Иисуса на небо на 40-й день после Пасхи'},
        {'title': 'Троица', 'date': '2026-05-31', 'type': 'holiday', 'fasting': False, 'desc': 'День Святой Троицы — сошествие Святого Духа'},
        {'title': 'Преображение Господне', 'date': '2026-08-19', 'type': 'holiday', 'fasting': False, 'desc': 'Яблочный Спас — преображение на горе Фавор'},
        {'title': 'Успение Богородицы', 'date': '2026-08-28', 'type': 'holiday', 'fasting': False, 'desc': 'Успение Пресвятой Богородицы'},
        {'title': 'Рождество Богородицы', 'date': '2026-09-21', 'type': 'holiday', 'fasting': False, 'desc': 'Рождество Пресвятой Богородицы'},
        {'title': 'Воздвижение Креста', 'date': '2026-09-27', 'type': 'holiday', 'fasting': False, 'desc': 'Воздвижение Честного Креста Господня'},
        {'title': 'Введение во храм', 'date': '2026-12-04', 'type': 'holiday', 'fasting': False, 'desc': 'Введение во храм Пресвятой Богородицы'},
        {'title': 'Покров Богородицы', 'date': '2026-10-14', 'type': 'holiday', 'fasting': False, 'desc': 'Покров Пресвятой Богородицы'},
    ],
    'islam': [
        {'title': 'Начало Рамадана', 'date': '2026-02-18', 'type': 'holiday', 'fasting': True, 'desc': 'Начало священного месяца поста Рамадан'},
        {'title': 'Ляйлят аль-Кадр', 'date': '2026-03-15', 'type': 'holiday', 'fasting': False, 'desc': 'Ночь Могущества — ниспослание Корана'},
        {'title': 'Ид аль-Фитр (Ураза-байрам)', 'date': '2026-03-20', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник разговения — завершение Рамадана'},
        {'title': 'Ид аль-Адха (Курбан-байрам)', 'date': '2026-05-27', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник жертвоприношения'},
        {'title': 'Мавлид ан-Наби', 'date': '2026-08-08', 'type': 'holiday', 'fasting': False, 'desc': 'Рождение пророка Мухаммада'},
        {'title': 'Исра и Мирадж', 'date': '2026-01-18', 'type': 'holiday', 'fasting': False, 'desc': 'Ночное путешествие и вознесение пророка'},
    ],
    'catholic': [
        {'title': 'Рождество', 'date': '2026-12-25', 'type': 'holiday', 'fasting': False, 'desc': 'Рождество Христово'},
        {'title': 'Богоявление', 'date': '2026-01-06', 'type': 'holiday', 'fasting': False, 'desc': 'Поклонение волхвов'},
        {'title': 'Пепельная среда', 'date': '2026-02-18', 'type': 'holiday', 'fasting': True, 'desc': 'Начало Великого поста'},
        {'title': 'Пасха', 'date': '2026-04-05', 'type': 'holiday', 'fasting': False, 'desc': 'Воскресение Христово'},
        {'title': 'Вознесение', 'date': '2026-05-14', 'type': 'holiday', 'fasting': False, 'desc': 'Вознесение Господне'},
        {'title': 'Пятидесятница', 'date': '2026-05-24', 'type': 'holiday', 'fasting': False, 'desc': 'Сошествие Святого Духа'},
        {'title': 'Успение Марии', 'date': '2026-08-15', 'type': 'holiday', 'fasting': False, 'desc': 'Вознесение Девы Марии'},
        {'title': 'День Всех Святых', 'date': '2026-11-01', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник всех святых'},
        {'title': 'Непорочное зачатие', 'date': '2026-12-08', 'type': 'holiday', 'fasting': False, 'desc': 'Непорочное зачатие Девы Марии'},
    ],
    'judaism': [
        {'title': 'Песах', 'date': '2026-04-02', 'type': 'holiday', 'fasting': False, 'desc': 'Исход из Египта — праздник свободы (7 дней)'},
        {'title': 'Шавуот', 'date': '2026-05-22', 'type': 'holiday', 'fasting': False, 'desc': 'Дарование Торы на горе Синай'},
        {'title': 'Рош ха-Шана', 'date': '2026-09-12', 'type': 'holiday', 'fasting': False, 'desc': 'Еврейский Новый год'},
        {'title': 'Йом Кипур', 'date': '2026-09-21', 'type': 'holiday', 'fasting': True, 'desc': 'День искупления — строгий пост'},
        {'title': 'Суккот', 'date': '2026-09-26', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник кущей (7 дней)'},
        {'title': 'Ханука', 'date': '2026-12-05', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник свечей (8 дней)'},
        {'title': 'Пурим', 'date': '2026-03-05', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник спасения от Амана'},
    ],
    'buddhism': [
        {'title': 'Весак (День Будды)', 'date': '2026-05-12', 'type': 'holiday', 'fasting': False, 'desc': 'Рождение, просветление и уход Будды'},
        {'title': 'Магха Пуджа', 'date': '2026-03-04', 'type': 'holiday', 'fasting': False, 'desc': 'Собрание 1250 учеников Будды'},
        {'title': 'Асалха Пуджа', 'date': '2026-07-10', 'type': 'holiday', 'fasting': False, 'desc': 'Первая проповедь Будды'},
        {'title': 'Начало Вассы', 'date': '2026-07-11', 'type': 'holiday', 'fasting': True, 'desc': 'Сезон дождей — период затворничества монахов'},
        {'title': 'Лой Кратонг', 'date': '2026-11-05', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник фонарей и очищения'},
    ],
    'protestant': [
        {'title': 'Рождество', 'date': '2026-12-25', 'type': 'holiday', 'fasting': False, 'desc': 'Рождество Христово'},
        {'title': 'Пасха', 'date': '2026-04-05', 'type': 'holiday', 'fasting': False, 'desc': 'Воскресение Христово'},
        {'title': 'Пятидесятница', 'date': '2026-05-24', 'type': 'holiday', 'fasting': False, 'desc': 'Сошествие Святого Духа'},
        {'title': 'День Реформации', 'date': '2026-10-31', 'type': 'holiday', 'fasting': False, 'desc': '95 тезисов Мартина Лютера'},
        {'title': 'Вознесение', 'date': '2026-05-14', 'type': 'holiday', 'fasting': False, 'desc': 'Вознесение Господне'},
        {'title': 'День благодарения', 'date': '2026-11-26', 'type': 'holiday', 'fasting': False, 'desc': 'Благодарение Бога за урожай и благословения'},
    ],
    'hinduism': [
        {'title': 'Дивали', 'date': '2026-10-20', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник огней — победа света над тьмой'},
        {'title': 'Холи', 'date': '2026-03-10', 'type': 'holiday', 'fasting': False, 'desc': 'Праздник красок и весны'},
        {'title': 'Наваратри', 'date': '2026-10-10', 'type': 'holiday', 'fasting': True, 'desc': 'Девять ночей поклонения Богине (пост)'},
        {'title': 'Ганеша Чатуртхи', 'date': '2026-08-27', 'type': 'holiday', 'fasting': False, 'desc': 'День рождения Ганеши'},
        {'title': 'Джанмаштами', 'date': '2026-08-14', 'type': 'holiday', 'fasting': True, 'desc': 'Рождение Кришны (пост до полуночи)'},
        {'title': 'Маха Шиваратри', 'date': '2026-02-14', 'type': 'holiday', 'fasting': True, 'desc': 'Великая ночь Шивы'},
    ],
}

FASTING_PERIODS = {
    'orthodox': [
        {'title': 'Великий пост', 'start': '2026-02-23', 'end': '2026-04-11', 'rules': 'Исключается мясо, молочные продукты, яйца. По будням — растительная пища без масла. В субботу и воскресенье допускается масло. Рыба — на Благовещение и Вербное воскресенье.'},
        {'title': 'Петров пост', 'start': '2026-06-08', 'end': '2026-07-11', 'rules': 'Исключается мясо и молочные продукты. Рыба — в субботу, воскресенье и праздники.'},
        {'title': 'Успенский пост', 'start': '2026-08-14', 'end': '2026-08-27', 'rules': 'Строгий пост, аналогичный Великому. Рыба — на Преображение.'},
        {'title': 'Рождественский пост', 'start': '2026-11-28', 'end': '2027-01-06', 'rules': 'Исключается мясо. Рыба — в субботу и воскресенье до 2 января. Последняя неделя — строгий.'},
    ],
    'islam': [
        {'title': 'Рамадан', 'start': '2026-02-18', 'end': '2026-03-19', 'rules': 'Полный пост от рассвета до заката. Запрещается еда, питьё, курение. Ифтар — разговение на закате. Сухур — приём пищи до рассвета.'},
    ],
    'catholic': [
        {'title': 'Великий пост', 'start': '2026-02-18', 'end': '2026-04-04', 'rules': 'Пепельная среда и Страстная пятница — строгий пост (один полный приём пищи). Пятницы — без мяса.'},
    ],
    'judaism': [
        {'title': 'Йом Кипур', 'start': '2026-09-21', 'end': '2026-09-22', 'rules': 'Полный 25-часовой пост. Запрещается еда, питьё, кожаная обувь, умывание, парфюмерия.'},
    ],
    'hinduism': [
        {'title': 'Наваратри (пост)', 'start': '2026-10-10', 'end': '2026-10-18', 'rules': 'Вегетарианская пища. Исключается лук, чеснок, зерновые. Допускается: фрукты, молоко, саго, картофель.'},
    ],
}

DEFAULT_PRAYERS = {
    'orthodox': [
        {'title': 'Отче наш', 'text': 'Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, яко на небеси и на земли. Хлеб наш насущный даждь нам днесь; и остави нам долги наша, якоже и мы оставляем должником нашим; и не введи нас во искушение, но избави нас от лукаваго.', 'category': 'general', 'time': None, 'order': 1},
        {'title': 'Символ веры', 'text': 'Верую во единаго Бога Отца, Вседержителя, Творца небу и земли, видимым же всем и невидимым. И во единаго Господа Иисуса Христа, Сына Божия, Единороднаго, Иже от Отца рожденнаго прежде всех век; Света от Света, Бога истинна от Бога истинна, рожденна, несотворенна, единосущна Отцу, Имже вся быша.', 'category': 'general', 'time': None, 'order': 2},
        {'title': 'Утренняя молитва', 'text': 'Боже, милостив буди мне грешному. Создавый мя, Господи, помилуй мя. Без числа согреших, Господи, прости мя. Благодарю Тебя, Господи Боже мой, что Ты сохранил меня в прошедшую ночь и дал мне возможность встретить наступивший день.', 'category': 'morning', 'time': 'morning', 'order': 1},
        {'title': 'Вечерняя молитва', 'text': 'Господи Боже наш, еже согреших во дни сем словом, делом и помышлением, яко Благ и Человеколюбец, прости ми. Мирен сон и безмятежен даруй ми. Ангела Твоего хранителя пошли, покрывающа и соблюдающа мя от всякого зла.', 'category': 'evening', 'time': 'evening', 'order': 1},
        {'title': 'Молитва перед едой', 'text': 'Очи всех на Тя, Господи, уповают, и Ты даеши им пищу во благовремении, отверзаеши Ты щедрую руку Твою и исполняеши всякое животно благоволения.', 'category': 'meal', 'time': None, 'order': 1},
        {'title': 'Молитва после еды', 'text': 'Благодарим Тя, Христе Боже наш, яко насытил еси нас земных Твоих благ; не лиши нас и Небеснаго Твоего Царствия.', 'category': 'meal', 'time': None, 'order': 2},
        {'title': 'Молитва о семье', 'text': 'Владыко Человеколюбче, Царю веков и Подателю благих, разрушивый вражды средостение, и мир подавый роду человеческому, даруй и ныне мир семье нашей. Утверди в ней любовь, согласие и взаимное уважение.', 'category': 'family', 'time': None, 'order': 1},
    ],
    'islam': [
        {'title': 'Аль-Фатиха', 'text': 'Бисмилляхи р-Рахмани р-Рахим. Альхамду лилляхи Раббиль-алямин. Ар-Рахмани р-Рахим. Малики яумид-дин. Ийяка набуду ва ийяка настаин. Ихдинас-сыратоль-мустакым. Сыратоль-лязина анъамта аляйхим, гайриль-магдуби аляйхим валяд-доллин.', 'category': 'general', 'time': None, 'order': 1},
        {'title': 'Дуа перед едой', 'text': 'Бисмиллях. Аллахумма барик ляна фима разактана ва кына азабан-нар. (С именем Аллаха. О Аллах, благослови нам то, чем Ты нас наделил, и защити нас от наказания Огня.)', 'category': 'meal', 'time': None, 'order': 1},
        {'title': 'Утренний азкар', 'text': 'Аль-хамду ли-Ллях аллязи ахьяна баъда ма аматана ва иляйхин-нушур. (Хвала Аллаху, Который оживил нас после того, как умертвил, и к Нему возвращение.)', 'category': 'morning', 'time': 'morning', 'order': 1},
    ],
}

RELIGION_LABELS = {
    'orthodox': 'Православие',
    'catholic': 'Католицизм',
    'protestant': 'Протестантизм',
    'islam': 'Ислам',
    'judaism': 'Иудаизм',
    'buddhism': 'Буддизм',
    'hinduism': 'Индуизм',
    'other': 'Другая',
}


def resp(status, body):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False, default=str)}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''API раздела «Вера» — религиозные праздники, посты, молитвы и настройки'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': '{}'}

    if method == 'GET':
        return resp(200, {'status': 'ok', 'service': 'faith-api', 'religions': list(RELIGION_LABELS.keys())})

    if method != 'POST':
        return resp(405, {'error': 'Method not allowed'})

    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    body = json.loads(event.get('body', '{}'))
    action = body.get('action', '')

    family_id = get_family_id(token)

    if action == 'get_religions':
        return resp(200, {'religions': RELIGION_LABELS})

    if action == 'get_settings':
        if not family_id:
            return resp(200, {'settings': None})
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT religion, custom_religion_name, notifications_enabled, fasting_sync_enabled, calendar_sync_enabled, my_temple_name, my_temple_address, my_temple_schedule, my_temple_contacts FROM family_faith WHERE family_id = %s" % safe(family_id))
        row = cur.fetchone()
        conn.close()
        if not row:
            return resp(200, {'settings': None})
        return resp(200, {'settings': {
            'religion': row[0], 'customReligionName': row[1],
            'notificationsEnabled': row[2], 'fastingSyncEnabled': row[3], 'calendarSyncEnabled': row[4],
            'templeName': row[5], 'templeAddress': row[6], 'templeSchedule': row[7], 'templeContacts': row[8],
        }})

    if action == 'save_settings':
        if not family_id:
            return resp(403, {'error': 'auth_required'})
        religion = body.get('religion', 'orthodox')
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM family_faith WHERE family_id = %s" % safe(family_id))
        exists = cur.fetchone()
        if exists:
            cur.execute("""UPDATE family_faith SET religion=%s, custom_religion_name=%s, 
                notifications_enabled=%s, fasting_sync_enabled=%s, calendar_sync_enabled=%s,
                my_temple_name=%s, my_temple_address=%s, my_temple_schedule=%s, my_temple_contacts=%s,
                updated_at=NOW() WHERE family_id=%s""" % (
                safe(religion), safe(body.get('customReligionName')),
                body.get('notificationsEnabled', True), body.get('fastingSyncEnabled', True), body.get('calendarSyncEnabled', True),
                safe(body.get('templeName')), safe(body.get('templeAddress')), safe(body.get('templeSchedule')), safe(body.get('templeContacts')),
                safe(family_id)))
        else:
            cur.execute("""INSERT INTO family_faith (family_id, religion, custom_religion_name, notifications_enabled, fasting_sync_enabled, calendar_sync_enabled, my_temple_name, my_temple_address, my_temple_schedule, my_temple_contacts)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""" % (
                safe(family_id), safe(religion), safe(body.get('customReligionName')),
                body.get('notificationsEnabled', True), body.get('fastingSyncEnabled', True), body.get('calendarSyncEnabled', True),
                safe(body.get('templeName')), safe(body.get('templeAddress')), safe(body.get('templeSchedule')), safe(body.get('templeContacts'))))
        conn.commit()
        conn.close()
        return resp(200, {'success': True})

    if action == 'get_holidays':
        religion = body.get('religion', 'orthodox')
        holidays = HOLIDAYS.get(religion, [])
        conn = get_db()
        cur = conn.cursor()
        custom = []
        if family_id:
            cur.execute("SELECT id, title, description, event_date, event_type, is_fasting, fasting_rules FROM faith_events WHERE family_id = %s AND religion = %s ORDER BY event_date" % (safe(family_id), safe(religion)))
            for r in cur.fetchall():
                custom.append({'id': r[0], 'title': r[1], 'desc': r[2], 'date': str(r[3]), 'type': r[4], 'fasting': r[5], 'fastingRules': r[6], 'isCustom': True})
        conn.close()
        return resp(200, {'holidays': holidays, 'customEvents': custom})

    if action == 'get_fasting':
        religion = body.get('religion', 'orthodox')
        periods = FASTING_PERIODS.get(religion, [])
        return resp(200, {'fastingPeriods': periods})

    if action == 'get_prayers':
        religion = body.get('religion', 'orthodox')
        category = body.get('category')
        prayers = DEFAULT_PRAYERS.get(religion, [])
        if category:
            prayers = [p for p in prayers if p['category'] == category]
        conn = get_db()
        cur = conn.cursor()
        q = "SELECT id, title, text, category, time_of_day FROM faith_prayers WHERE religion = %s" % safe(religion)
        if category:
            q += " AND category = %s" % safe(category)
        q += " ORDER BY sort_order"
        cur.execute(q)
        db_prayers = [{'id': r[0], 'title': r[1], 'text': r[2], 'category': r[3], 'time': r[4]} for r in cur.fetchall()]
        conn.close()
        return resp(200, {'prayers': prayers, 'customPrayers': db_prayers})

    if action == 'get_name_days':
        name = body.get('name', '')
        month = body.get('month')
        religion = body.get('religion', 'orthodox')
        conn = get_db()
        cur = conn.cursor()
        if name:
            cur.execute("SELECT id, name, saint_name, day, month, description FROM faith_name_days WHERE religion = %s AND LOWER(name) LIKE %s ORDER BY month, day" % (safe(religion), safe('%' + name.lower() + '%')))
        elif month:
            cur.execute("SELECT id, name, saint_name, day, month, description FROM faith_name_days WHERE religion = %s AND month = %d ORDER BY day" % (safe(religion), int(month)))
        else:
            cur.execute("SELECT id, name, saint_name, day, month, description FROM faith_name_days WHERE religion = %s ORDER BY month, day LIMIT 50" % safe(religion))
        results = [{'id': r[0], 'name': r[1], 'saintName': r[2], 'day': r[3], 'month': r[4], 'description': r[5]} for r in cur.fetchall()]
        conn.close()
        return resp(200, {'nameDays': results})

    if action == 'add_custom_event':
        if not family_id:
            return resp(403, {'error': 'auth_required'})
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""INSERT INTO faith_events (family_id, title, description, event_date, event_type, religion, is_fasting, fasting_rules, is_custom, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE, %s) RETURNING id""" % (
            safe(family_id), safe(body.get('title')), safe(body.get('description')),
            safe(body.get('date')), safe(body.get('eventType', 'custom')), safe(body.get('religion', 'orthodox')),
            body.get('isFasting', False), safe(body.get('fastingRules')), safe(body.get('createdBy'))))
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return resp(200, {'success': True, 'id': new_id})

    if action == 'delete_custom_event':
        if not family_id:
            return resp(403, {'error': 'auth_required'})
        event_id = body.get('eventId')
        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM faith_events WHERE id = %d AND family_id = %s AND is_custom = TRUE" % (int(event_id), safe(family_id)))
        conn.commit()
        conn.close()
        return resp(200, {'success': True})

    return resp(400, {'error': 'Unknown action', 'action': action})