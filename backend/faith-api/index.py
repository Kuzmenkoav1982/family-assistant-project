import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import date, datetime

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p5815085_family_assistant_pro'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
}


def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    return conn


def escape_string(val):
    if val is None:
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"


def verify_token(token: str) -> Optional[Dict]:
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(f"""
            SELECT s.user_id, fm.family_id, fm.id as member_id, fm.name as member_name
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.family_members fm ON fm.user_id = s.user_id
            WHERE s.token = {escape_string(token)}
            AND s.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        """)
        result = cur.fetchone()
        if result:
            return {
                'user_id': result['user_id'],
                'family_id': str(result['family_id']),
                'member_id': result['member_id'],
                'member_name': result['member_name']
            }
        return None
    finally:
        cur.close()
        conn.close()


HOLIDAYS = {
    'orthodox': [
        {'title': 'Рождество Христово', 'date': '2026-01-07', 'type': 'holiday', 'fasting': False, 'description': 'Великий двунадесятый праздник Рождества Господа Иисуса Христа'},
        {'title': 'Крещение Господне', 'date': '2026-01-19', 'type': 'holiday', 'fasting': False, 'description': 'Богоявление — крещение Иисуса в Иордане'},
        {'title': 'Сретение Господне', 'date': '2026-02-15', 'type': 'holiday', 'fasting': False, 'description': 'Встреча младенца Иисуса в Иерусалимском храме'},
        {'title': 'Благовещение', 'date': '2026-04-07', 'type': 'holiday', 'fasting': False, 'description': 'Благая весть архангела Гавриила Деве Марии'},
        {'title': 'Пасха', 'date': '2026-04-12', 'type': 'holiday', 'fasting': False, 'description': 'Светлое Христово Воскресение — главный праздник'},
        {'title': 'Вознесение Господне', 'date': '2026-05-21', 'type': 'holiday', 'fasting': False, 'description': 'Вознесение Иисуса на небо на 40-й день после Пасхи'},
        {'title': 'Троица', 'date': '2026-05-31', 'type': 'holiday', 'fasting': False, 'description': 'День Святой Троицы — сошествие Святого Духа'},
        {'title': 'Преображение Господне', 'date': '2026-08-19', 'type': 'holiday', 'fasting': False, 'description': 'Яблочный Спас — преображение на горе Фавор'},
        {'title': 'Успение Богородицы', 'date': '2026-08-28', 'type': 'holiday', 'fasting': False, 'description': 'Успение Пресвятой Богородицы'},
        {'title': 'Рождество Богородицы', 'date': '2026-09-21', 'type': 'holiday', 'fasting': False, 'description': 'Рождество Пресвятой Богородицы'},
        {'title': 'Воздвижение Креста', 'date': '2026-09-27', 'type': 'holiday', 'fasting': False, 'description': 'Воздвижение Честного Креста Господня'},
        {'title': 'Покров Богородицы', 'date': '2026-10-14', 'type': 'holiday', 'fasting': False, 'description': 'Покров Пресвятой Богородицы'},
        {'title': 'Введение во храм', 'date': '2026-12-04', 'type': 'holiday', 'fasting': False, 'description': 'Введение во храм Пресвятой Богородицы'},
    ],
    'islam': [
        {'title': 'Исра и Мирадж', 'date': '2026-01-18', 'type': 'holiday', 'fasting': False, 'description': 'Ночное путешествие и вознесение пророка'},
        {'title': 'Начало Рамадана', 'date': '2026-02-18', 'type': 'holiday', 'fasting': True, 'description': 'Начало священного месяца поста Рамадан'},
        {'title': 'Ляйлят аль-Кадр', 'date': '2026-03-15', 'type': 'holiday', 'fasting': False, 'description': 'Ночь Могущества — ниспослание Корана'},
        {'title': 'Ид аль-Фитр (Ураза-байрам)', 'date': '2026-03-20', 'type': 'holiday', 'fasting': False, 'description': 'Праздник разговения — завершение Рамадана'},
        {'title': 'Ид аль-Адха (Курбан-байрам)', 'date': '2026-05-27', 'type': 'holiday', 'fasting': False, 'description': 'Праздник жертвоприношения'},
        {'title': 'Мавлид ан-Наби', 'date': '2026-08-08', 'type': 'holiday', 'fasting': False, 'description': 'Рождение пророка Мухаммада'},
    ],
    'catholic': [
        {'title': 'Богоявление', 'date': '2026-01-06', 'type': 'holiday', 'fasting': False, 'description': 'Поклонение волхвов'},
        {'title': 'Пепельная среда', 'date': '2026-02-18', 'type': 'holiday', 'fasting': True, 'description': 'Начало Великого поста'},
        {'title': 'Пасха', 'date': '2026-04-05', 'type': 'holiday', 'fasting': False, 'description': 'Воскресение Христово'},
        {'title': 'Вознесение', 'date': '2026-05-14', 'type': 'holiday', 'fasting': False, 'description': 'Вознесение Господне'},
        {'title': 'Пятидесятница', 'date': '2026-05-24', 'type': 'holiday', 'fasting': False, 'description': 'Сошествие Святого Духа'},
        {'title': 'Успение Марии', 'date': '2026-08-15', 'type': 'holiday', 'fasting': False, 'description': 'Вознесение Девы Марии'},
        {'title': 'День Всех Святых', 'date': '2026-11-01', 'type': 'holiday', 'fasting': False, 'description': 'Праздник всех святых'},
        {'title': 'Непорочное зачатие', 'date': '2026-12-08', 'type': 'holiday', 'fasting': False, 'description': 'Непорочное зачатие Девы Марии'},
        {'title': 'Рождество', 'date': '2026-12-25', 'type': 'holiday', 'fasting': False, 'description': 'Рождество Христово'},
    ],
    'judaism': [
        {'title': 'Пурим', 'date': '2026-03-05', 'type': 'holiday', 'fasting': False, 'description': 'Праздник спасения от Амана'},
        {'title': 'Песах', 'date': '2026-04-02', 'type': 'holiday', 'fasting': False, 'description': 'Исход из Египта — праздник свободы (7 дней)'},
        {'title': 'Шавуот', 'date': '2026-05-22', 'type': 'holiday', 'fasting': False, 'description': 'Дарование Торы на горе Синай'},
        {'title': 'Рош ха-Шана', 'date': '2026-09-12', 'type': 'holiday', 'fasting': False, 'description': 'Еврейский Новый год'},
        {'title': 'Йом Кипур', 'date': '2026-09-21', 'type': 'holiday', 'fasting': True, 'description': 'День искупления — строгий пост'},
        {'title': 'Суккот', 'date': '2026-09-26', 'type': 'holiday', 'fasting': False, 'description': 'Праздник кущей (7 дней)'},
        {'title': 'Ханука', 'date': '2026-12-05', 'type': 'holiday', 'fasting': False, 'description': 'Праздник свечей (8 дней)'},
    ],
    'buddhism': [
        {'title': 'Магха Пуджа', 'date': '2026-03-04', 'type': 'holiday', 'fasting': False, 'description': 'Собрание 1250 учеников Будды'},
        {'title': 'Весак (День Будды)', 'date': '2026-05-12', 'type': 'holiday', 'fasting': False, 'description': 'Рождение, просветление и уход Будды'},
        {'title': 'Асалха Пуджа', 'date': '2026-07-10', 'type': 'holiday', 'fasting': False, 'description': 'Первая проповедь Будды'},
        {'title': 'Начало Вассы', 'date': '2026-07-11', 'type': 'holiday', 'fasting': True, 'description': 'Сезон дождей — период затворничества монахов'},
        {'title': 'Лой Кратонг', 'date': '2026-11-05', 'type': 'holiday', 'fasting': False, 'description': 'Праздник фонарей и очищения'},
    ],
    'protestant': [
        {'title': 'Пасха', 'date': '2026-04-05', 'type': 'holiday', 'fasting': False, 'description': 'Воскресение Христово'},
        {'title': 'Вознесение', 'date': '2026-05-14', 'type': 'holiday', 'fasting': False, 'description': 'Вознесение Господне'},
        {'title': 'Пятидесятница', 'date': '2026-05-24', 'type': 'holiday', 'fasting': False, 'description': 'Сошествие Святого Духа'},
        {'title': 'День Реформации', 'date': '2026-10-31', 'type': 'holiday', 'fasting': False, 'description': '95 тезисов Мартина Лютера'},
        {'title': 'День благодарения', 'date': '2026-11-26', 'type': 'holiday', 'fasting': False, 'description': 'Благодарение Бога за урожай и благословения'},
        {'title': 'Рождество', 'date': '2026-12-25', 'type': 'holiday', 'fasting': False, 'description': 'Рождество Христово'},
    ],
    'hinduism': [
        {'title': 'Маха Шиваратри', 'date': '2026-02-14', 'type': 'holiday', 'fasting': True, 'description': 'Великая ночь Шивы'},
        {'title': 'Холи', 'date': '2026-03-10', 'type': 'holiday', 'fasting': False, 'description': 'Праздник красок и весны'},
        {'title': 'Джанмаштами', 'date': '2026-08-14', 'type': 'holiday', 'fasting': True, 'description': 'Рождение Кришны (пост до полуночи)'},
        {'title': 'Ганеша Чатуртхи', 'date': '2026-08-27', 'type': 'holiday', 'fasting': False, 'description': 'День рождения Ганеши'},
        {'title': 'Наваратри', 'date': '2026-10-10', 'type': 'holiday', 'fasting': True, 'description': 'Девять ночей поклонения Богине (пост)'},
        {'title': 'Дивали', 'date': '2026-10-20', 'type': 'holiday', 'fasting': False, 'description': 'Праздник огней — победа света над тьмой'},
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
        {'title': 'Великий пост', 'start': '2026-02-18', 'end': '2026-04-04', 'rules': 'Пепельная среда и Страстная пятница — строгий пост. Пятницы — без мяса.'},
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
        {'title': 'Отче наш', 'text': 'Отче наш, Иже еси на небесех! Да святится имя Твое, да приидет Царствие Твое, да будет воля Твоя, яко на небеси и на земли. Хлеб наш насущный даждь нам днесь; и остави нам долги наша, якоже и мы оставляем должником нашим; и не введи нас во искушение, но избави нас от лукаваго.', 'category': 'general', 'time': None},
        {'title': 'Символ веры', 'text': 'Верую во единаго Бога Отца, Вседержителя, Творца небу и земли, видимым же всем и невидимым. И во единаго Господа Иисуса Христа, Сына Божия, Единороднаго, Иже от Отца рожденнаго прежде всех век; Света от Света, Бога истинна от Бога истинна, рожденна, несотворенна, единосущна Отцу, Имже вся быша.', 'category': 'general', 'time': None},
        {'title': 'Утренняя молитва', 'text': 'Боже, милостив буди мне грешному. Создавый мя, Господи, помилуй мя. Без числа согреших, Господи, прости мя. Благодарю Тебя, Господи Боже мой, что Ты сохранил меня в прошедшую ночь и дал мне возможность встретить наступивший день.', 'category': 'morning', 'time': 'morning'},
        {'title': 'Вечерняя молитва', 'text': 'Господи Боже наш, еже согреших во дни сем словом, делом и помышлением, яко Благ и Человеколюбец, прости ми. Мирен сон и безмятежен даруй ми. Ангела Твоего хранителя пошли, покрывающа и соблюдающа мя от всякого зла.', 'category': 'evening', 'time': 'evening'},
        {'title': 'Молитва перед едой', 'text': 'Очи всех на Тя, Господи, уповают, и Ты даеши им пищу во благовремении, отверзаеши Ты щедрую руку Твою и исполняеши всякое животно благоволения.', 'category': 'meal', 'time': None},
        {'title': 'Молитва после еды', 'text': 'Благодарим Тя, Христе Боже наш, яко насытил еси нас земных Твоих благ; не лиши нас и Небеснаго Твоего Царствия.', 'category': 'meal', 'time': None},
        {'title': 'Молитва о семье', 'text': 'Владыко Человеколюбче, Царю веков и Подателю благих, разрушивый вражды средостение, и мир подавый роду человеческому, даруй и ныне мир семье нашей. Утверди в ней любовь, согласие и взаимное уважение.', 'category': 'family', 'time': None},
    ],
    'islam': [
        {'title': 'Аль-Фатиха', 'text': 'Бисмилляхи р-Рахмани р-Рахим. Альхамду лилляхи Раббиль-алямин. Ар-Рахмани р-Рахим. Малики яумид-дин. Ийяка набуду ва ийяка настаин. Ихдинас-сыратоль-мустакым.', 'category': 'general', 'time': None},
        {'title': 'Дуа перед едой', 'text': 'Бисмиллях. Аллахумма барик ляна фима разактана ва кына азабан-нар. (С именем Аллаха. О Аллах, благослови нам то, чем Ты нас наделил, и защити нас от наказания Огня.)', 'category': 'meal', 'time': None},
        {'title': 'Утренний азкар', 'text': 'Аль-хамду ли-Ллях аллязи ахьяна баъда ма аматана ва иляйхин-нушур. (Хвала Аллаху, Который оживил нас после того, как умертвил, и к Нему возвращение.)', 'category': 'morning', 'time': 'morning'},
        {'title': 'Вечерний азкар', 'text': 'Бисмика Аллахумма амуту ва ахья. (С именем Твоим, о Аллах, я умираю и живу.)', 'category': 'evening', 'time': 'evening'},
    ],
    'catholic': [
        {'title': 'Отче наш', 'text': 'Отче наш, сущий на небесах! Да святится имя Твоё; да приидет Царствие Твоё; да будет воля Твоя и на земле, как на небе. Хлеб наш насущный дай нам на сей день; и прости нам долги наши, как и мы прощаем должникам нашим; и не введи нас в искушение, но избавь нас от лукавого.', 'category': 'general', 'time': None},
        {'title': 'Аве Мария', 'text': 'Радуйся, Мария, благодати полная! Господь с Тобою; благословенна Ты между жёнами, и благословен плод чрева Твоего Иисус. Святая Мария, Матерь Божия, молись о нас, грешных, ныне и в час смерти нашей.', 'category': 'general', 'time': None},
        {'title': 'Молитва перед едой', 'text': 'Благослови, Господи, нас и эти дары Твои, которые мы примем от щедрот Твоих, через Христа, Господа нашего. Аминь.', 'category': 'meal', 'time': None},
    ],
    'judaism': [
        {'title': 'Шма Исраэль', 'text': 'Шма Исраэль Адонай Элохейну Адонай Эхад. (Слушай, Израиль: Господь — Бог наш, Господь — един.)', 'category': 'general', 'time': None},
        {'title': 'Благословение на хлеб', 'text': 'Барух Ата Адонай Элохейну Мелех ха-Олам ха-моци лехем мин ха-арец. (Благословен Ты, Господь Бог наш, Владыка мира, выращивающий хлеб из земли.)', 'category': 'meal', 'time': None},
        {'title': 'Модэ ани (утренняя)', 'text': 'Модэ ани лефанеха, Мелех хай вэ-каям, шэ-хэхэзарта би нишмати бэ-хэмла, раба эмунатеха. (Благодарю Тебя, Царь живой и вечный, за то что Ты вернул мне душу мою с милосердием.)', 'category': 'morning', 'time': 'morning'},
    ],
    'buddhism': [
        {'title': 'Прибежище в Трёх Драгоценностях', 'text': 'Буддхам саранам гаччхами. Дхаммам саранам гаччхами. Сангхам саранам гаччхами. (Прибегаю к Будде как к прибежищу. Прибегаю к Дхарме как к прибежищу. Прибегаю к Сангхе как к прибежищу.)', 'category': 'general', 'time': None},
        {'title': 'Метта (медитация любящей доброты)', 'text': 'Пусть все существа будут счастливы. Пусть все существа будут свободны от страданий. Пусть все существа обретут радость. Пусть все существа пребывают в покое и равностности.', 'category': 'morning', 'time': 'morning'},
    ],
    'protestant': [
        {'title': 'Отче наш', 'text': 'Отче наш, сущий на небесах! Да святится имя Твоё; да приидет Царствие Твоё; да будет воля Твоя и на земле, как на небе. Хлеб наш насущный дай нам на сей день; и прости нам долги наши, как и мы прощаем должникам нашим; и не введи нас в искушение, но избавь нас от лукавого. Ибо Твоё есть Царство и сила и слава во веки. Аминь.', 'category': 'general', 'time': None},
        {'title': 'Молитва перед едой', 'text': 'Господи, благодарим Тебя за эту пищу, за руки, которые её приготовили, и за Твою любовь, которая нас питает. Аминь.', 'category': 'meal', 'time': None},
    ],
    'hinduism': [
        {'title': 'Гаятри-мантра', 'text': 'Ом Бхур Бхувах Свах, Тат Савитур Вареньям, Бхарго Девасья Дхимахи, Дхийо Йо Нах Прачодаят. (О Божественный Свет, мы медитируем на Твоё великолепие. Просвети наш разум.)', 'category': 'morning', 'time': 'morning'},
        {'title': 'Молитва перед едой', 'text': 'Брахмарпанам Брахма Хавир Брахмагнау Брахмана Хутам. Брахмаива Тена Гантавьям Брахма Карма Самадхина. (Подношение — Брахман, масло — Брахман, огонь — Брахман. Тот, кто видит Брахмана во всём, достигнет Брахмана.)', 'category': 'meal', 'time': None},
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

    user = verify_token(token)
    family_id = user['family_id'] if user else None

    if action == 'get_religions':
        return resp(200, {'religions': RELIGION_LABELS})

    if action == 'get_settings':
        if not family_id:
            return resp(200, {'settings': None})
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(f"SELECT religion, custom_religion_name, notifications_enabled, fasting_sync_enabled, calendar_sync_enabled, my_temple_name, my_temple_address, my_temple_schedule, my_temple_contacts FROM {SCHEMA}.family_faith WHERE family_id = {escape_string(family_id)}")
            row = cur.fetchone()
        finally:
            cur.close()
            conn.close()
        if not row:
            return resp(200, {'settings': None})
        return resp(200, {'settings': {
            'religion': row['religion'],
            'customReligionName': row['custom_religion_name'],
            'notificationsEnabled': row['notifications_enabled'],
            'fastingSyncEnabled': row['fasting_sync_enabled'],
            'calendarSyncEnabled': row['calendar_sync_enabled'],
            'templeName': row['my_temple_name'],
            'templeAddress': row['my_temple_address'],
            'templeSchedule': row['my_temple_schedule'],
            'templeContacts': row['my_temple_contacts'],
        }})

    if action == 'save_settings':
        if not family_id:
            return resp(403, {'error': 'auth_required'})
        religion = body.get('religion', 'orthodox')
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(f"SELECT id FROM {SCHEMA}.family_faith WHERE family_id = {escape_string(family_id)}")
            exists = cur.fetchone()
            if exists:
                cur.execute(f"""UPDATE {SCHEMA}.family_faith SET religion={escape_string(religion)}, custom_religion_name={escape_string(body.get('customReligionName'))}, 
                    notifications_enabled={body.get('notificationsEnabled', True)}, fasting_sync_enabled={body.get('fastingSyncEnabled', True)}, calendar_sync_enabled={body.get('calendarSyncEnabled', True)},
                    my_temple_name={escape_string(body.get('templeName'))}, my_temple_address={escape_string(body.get('templeAddress'))}, my_temple_schedule={escape_string(body.get('templeSchedule'))}, my_temple_contacts={escape_string(body.get('templeContacts'))},
                    updated_at=NOW() WHERE family_id={escape_string(family_id)}""")
            else:
                cur.execute(f"""INSERT INTO {SCHEMA}.family_faith (family_id, religion, custom_religion_name, notifications_enabled, fasting_sync_enabled, calendar_sync_enabled, my_temple_name, my_temple_address, my_temple_schedule, my_temple_contacts)
                    VALUES ({escape_string(family_id)}, {escape_string(religion)}, {escape_string(body.get('customReligionName'))},
                    {body.get('notificationsEnabled', True)}, {body.get('fastingSyncEnabled', True)}, {body.get('calendarSyncEnabled', True)},
                    {escape_string(body.get('templeName'))}, {escape_string(body.get('templeAddress'))}, {escape_string(body.get('templeSchedule'))}, {escape_string(body.get('templeContacts'))})""")
        finally:
            cur.close()
            conn.close()
        return resp(200, {'success': True})

    if action == 'get_holidays':
        religion = body.get('religion', 'orthodox')
        holidays = HOLIDAYS.get(religion, [])
        today = date.today().isoformat()
        for h in holidays:
            h['is_fasting'] = h.get('fasting', False)
            h['event_date'] = h['date']
            h['event_type'] = h.get('type', 'holiday')
        custom = []
        if family_id:
            conn = get_db()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            try:
                cur.execute(f"SELECT id, title, description, event_date, event_type, is_fasting, fasting_rules FROM {SCHEMA}.faith_events WHERE family_id = {escape_string(family_id)} AND religion = {escape_string(religion)} ORDER BY event_date")
                for r in cur.fetchall():
                    custom.append({'id': r['id'], 'title': r['title'], 'description': r['description'], 'event_date': str(r['event_date']), 'event_type': r['event_type'], 'is_fasting': r['is_fasting'], 'fasting_rules': r['fasting_rules'], 'is_custom': True})
            finally:
                cur.close()
                conn.close()
        return resp(200, {'holidays': holidays, 'customEvents': custom})

    if action == 'get_fasting':
        religion = body.get('religion', 'orthodox')
        periods = FASTING_PERIODS.get(religion, [])
        today = date.today().isoformat()
        result = []
        for p in periods:
            is_active = p['start'] <= today <= p['end']
            result.append({
                'title': p['title'],
                'start_date': p['start'],
                'end_date': p['end'],
                'rules': p['rules'],
                'is_active': is_active,
            })
        return resp(200, {'fasting': result})

    if action == 'get_prayers':
        religion = body.get('religion', 'orthodox')
        category = body.get('category')
        prayers = DEFAULT_PRAYERS.get(religion, [])
        if category and category != 'all':
            prayers = [p for p in prayers if p['category'] == category]
        result = []
        for p in prayers:
            result.append({
                'title': p['title'],
                'text': p['text'],
                'category': p['category'],
                'time_of_day': p.get('time'),
            })
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            q = f"SELECT id, title, text, category, time_of_day FROM {SCHEMA}.faith_prayers WHERE religion = {escape_string(religion)}"
            if category and category != 'all':
                q += f" AND category = {escape_string(category)}"
            q += " ORDER BY sort_order"
            cur.execute(q)
            for r in cur.fetchall():
                result.append({'id': r['id'], 'title': r['title'], 'text': r['text'], 'category': r['category'], 'time_of_day': r['time_of_day']})
        finally:
            cur.close()
            conn.close()
        return resp(200, {'prayers': result})

    if action == 'get_name_days':
        name = body.get('name', '')
        month = body.get('month')
        religion = body.get('religion', 'orthodox')
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            if name:
                cur.execute(f"SELECT id, name, saint_name, day, month, description FROM {SCHEMA}.faith_name_days WHERE religion = {escape_string(religion)} AND LOWER(name) LIKE {escape_string('%' + name.lower() + '%')} ORDER BY month, day LIMIT 100")
            elif month is not None:
                cur.execute(f"SELECT id, name, saint_name, day, month, description FROM {SCHEMA}.faith_name_days WHERE religion = {escape_string(religion)} AND month = {int(month)} ORDER BY day LIMIT 100")
            else:
                cur.execute(f"SELECT id, name, saint_name, day, month, description FROM {SCHEMA}.faith_name_days WHERE religion = {escape_string(religion)} ORDER BY month, day LIMIT 50")
            results = [{'id': r['id'], 'name': r['name'], 'saint_name': r['saint_name'], 'day': r['day'], 'month': r['month'], 'description': r['description']} for r in cur.fetchall()]
        finally:
            cur.close()
            conn.close()
        return resp(200, {'nameDays': results})

    if action == 'add_custom_event':
        if not family_id:
            return resp(403, {'error': 'auth_required'})
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(f"""INSERT INTO {SCHEMA}.faith_events (family_id, title, description, event_date, event_type, religion, is_fasting, fasting_rules, is_custom, created_by)
                VALUES ({escape_string(family_id)}, {escape_string(body.get('title'))}, {escape_string(body.get('description'))},
                {escape_string(body.get('date', body.get('event_date')))}, {escape_string(body.get('eventType', 'custom'))}, {escape_string(body.get('religion', 'orthodox'))},
                {body.get('isFasting', False)}, {escape_string(body.get('fastingRules'))}, TRUE, {escape_string(user.get('member_name', '') if user else '')}) RETURNING id""")
            new_id = cur.fetchone()[0]
        finally:
            cur.close()
            conn.close()
        return resp(200, {'success': True, 'id': new_id})

    if action == 'delete_custom_event':
        if not family_id:
            return resp(403, {'error': 'auth_required'})
        event_id = body.get('eventId', body.get('event_id'))
        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute(f"DELETE FROM {SCHEMA}.faith_events WHERE id = {int(event_id)} AND family_id = {escape_string(family_id)} AND is_custom = TRUE")
        finally:
            cur.close()
            conn.close()
        return resp(200, {'success': True})

    if action == 'sync_to_calendar':
        return resp(200, {'success': True, 'message': 'Используйте API календаря для синхронизации'})

    return resp(400, {'error': 'Unknown action', 'action': action})
