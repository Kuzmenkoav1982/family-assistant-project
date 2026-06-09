"""
Генерация PDF эксплуатационной документации ПО «Наша Семья».
GET / — формирует PDF, загружает в S3 и возвращает прямую CDN-ссылку.
PDF отдаётся напрямую из хранилища, открывается без JavaScript в любом браузере.
"""

import os
import io
import json
import urllib.request
from typing import Dict, Any, List, Tuple

import boto3
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily


SITE = 'https://nasha-semiya.ru'
S3_KEY = 'docs/nasha-semiya-documentation.pdf'

# Кириллические шрифты DejaVu. Скачиваются один раз и кэшируются в /tmp.
# Несколько источников — на случай недоступности одного из них.
FONT_REG_URLS = [
    'https://raw.githubusercontent.com/senotrusov/dejavu-fonts-ttf/master/ttf/DejaVuSans.ttf',
    'https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/build/DejaVuSans.ttf',
    'https://github.com/senotrusov/dejavu-fonts-ttf/raw/master/ttf/DejaVuSans.ttf',
]
FONT_BOLD_URLS = [
    'https://raw.githubusercontent.com/senotrusov/dejavu-fonts-ttf/master/ttf/DejaVuSans-Bold.ttf',
    'https://github.com/senotrusov/dejavu-fonts-ttf/raw/master/ttf/DejaVuSans-Bold.ttf',
]


def _fetch_font(urls: List[str], dest: str) -> bool:
    if os.path.exists(dest) and os.path.getsize(dest) > 10000:
        return True
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 docs-pdf'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            if len(data) < 10000:
                continue
            with open(dest, 'wb') as f:
                f.write(data)
            return True
        except Exception as e:
            print(f"[WARN] font download failed {url}: {e}")
            continue
    return False


def register_fonts() -> Tuple[str, str]:
    """Регистрирует кириллические шрифты DejaVu. Возвращает (regular, bold)."""
    # 1) системные пути
    sys_candidates = [
        ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
         '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
        ('/usr/share/fonts/dejavu/DejaVuSans.ttf',
         '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'),
    ]
    for reg, bold in sys_candidates:
        if os.path.exists(reg) and os.path.exists(bold):
            pdfmetrics.registerFont(TTFont('Doc', reg))
            pdfmetrics.registerFont(TTFont('Doc-Bold', bold))
            registerFontFamily('Doc', normal='Doc', bold='Doc-Bold',
                               italic='Doc', boldItalic='Doc-Bold')
            return 'Doc', 'Doc-Bold'

    # 2) скачиваем в /tmp
    reg_path = '/tmp/DejaVuSans.ttf'
    bold_path = '/tmp/DejaVuSans-Bold.ttf'
    ok_reg = _fetch_font(FONT_REG_URLS, reg_path)
    ok_bold = _fetch_font(FONT_BOLD_URLS, bold_path)
    if ok_reg:
        pdfmetrics.registerFont(TTFont('Doc', reg_path))
        bold_name = 'Doc'
        if ok_bold:
            pdfmetrics.registerFont(TTFont('Doc-Bold', bold_path))
            bold_name = 'Doc-Bold'
        registerFontFamily('Doc', normal='Doc', bold=bold_name,
                           italic='Doc', boldItalic=bold_name)
        return 'Doc', bold_name

    # 3) крайний фолбэк (без кириллицы)
    return 'Helvetica', 'Helvetica-Bold'


def build_pdf() -> Tuple[bytes, str]:
    reg, bold = register_fonts()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=22 * mm, rightMargin=22 * mm,
        topMargin=20 * mm, bottomMargin=18 * mm,
        title='Документация ПО «Наша Семья»',
        author='ИП Кузьменко Анастасия Вячеславовна',
    )

    base = getSampleStyleSheet()['Normal']
    p_style = ParagraphStyle('Body', parent=base, fontName=reg, fontSize=10.5,
                             leading=15, alignment=TA_LEFT, spaceAfter=7)
    h1 = ParagraphStyle('H1', parent=base, fontName=bold, fontSize=17,
                        leading=22, spaceAfter=6)
    h2 = ParagraphStyle('H2', parent=base, fontName=bold, fontSize=13.5,
                        leading=18, spaceBefore=14, spaceAfter=8)
    h3 = ParagraphStyle('H3', parent=base, fontName=bold, fontSize=11,
                        leading=15, spaceBefore=8, spaceAfter=3)
    meta = ParagraphStyle('Meta', parent=base, fontName=reg, fontSize=9.5,
                          leading=13, textColor='#444444', spaceAfter=3)

    el: List = []

    def P(t):
        el.append(Paragraph(t, p_style))

    def bullets(items):
        el.append(ListFlowable(
            [ListItem(Paragraph(i, p_style), leftIndent=10) for i in items],
            bulletType='bullet', start='•', leftIndent=12, spaceAfter=7))

    def numbered(items):
        el.append(ListFlowable(
            [ListItem(Paragraph(i, p_style), leftIndent=10) for i in items],
            bulletType='1', leftIndent=14, spaceAfter=7))

    el.append(Paragraph('Документация программного обеспечения «Наша Семья»', h1))
    el.append(Paragraph('Правообладатель: ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955', meta))
    el.append(Paragraph(f'Версия документации: 1.0 · Дата актуализации: 08.06.2026 · Адрес ПО: {SITE}', meta))
    el.append(Spacer(1, 10))

    el.append(Paragraph('1. О программном обеспечении', h2))
    P('Программное обеспечение <b>«Наша Семья»</b> представляет собой интернет-сервис, '
      'предназначенный для совместного планирования семейных задач, ведения календаря событий, '
      'управления списками дел и покупок, распределения обязанностей, хранения семейной информации '
      'и организации взаимодействия между членами семьи.')
    P('Программное обеспечение предоставляется в формате интернет-сервиса (SaaS) и доступно '
      'через веб-браузер без установки на устройство пользователя.')
    bullets([
        '<b>Наименование:</b> Наша Семья',
        '<b>Правообладатель:</b> ИП Кузьменко Анастасия Вячеславовна',
        '<b>ОГРНИП:</b> 325774600908955',
        '<b>Форма предоставления:</b> Интернет-сервис (SaaS)',
        '<b>Лицензия:</b> Проприетарное программное обеспечение',
    ])
    P('Программное обеспечение предназначено для личного семейного использования. Функции, '
      'связанные с оказанием медицинских, юридических или финансовых консультаций, не предусмотрены.')

    el.append(Paragraph('2. Доступ к программному обеспечению', h2))
    P('Для доступа к программному обеспечению установка специального программного обеспечения '
      'на устройство пользователя не требуется.')
    P(f'Адрес для доступа: <b>{SITE}</b>')
    P('Для ознакомления с функциональными возможностями программного обеспечения без регистрации '
      'предусмотрен демонстрационный режим:')
    numbered([
        f'Откройте веб-браузер и перейдите по адресу: <b>{SITE}</b>',
        'На главной странице нажмите кнопку «Смотреть демо».',
        'Выберите один из доступных вариантов демонстрационного режима.',
        'После перехода в демонстрационный режим пользователю предоставляется доступ к экземпляру '
        'программного обеспечения с предзаполненными демонстрационными данными. Регистрация не требуется.',
    ])
    P('В правом верхнем углу интерфейса отображается индикатор «Гостевой просмотр», подтверждающий '
      'работу в демонстрационном режиме.')
    P('Для завершения работы закройте вкладку браузера или выберите команду «Выйти» в интерфейсе сервиса.')

    el.append(Paragraph('3. Системные требования', h2))
    P('Для использования программного обеспечения необходимы:')
    bullets([
        'устройство с доступом в сеть Интернет (компьютер, планшет, смартфон);',
        'веб-браузер актуальной версии (Google Chrome, Яндекс.Браузер, Mozilla Firefox, Microsoft Edge);',
        'стабильное интернет-соединение;',
        'рекомендуется использование устройства, обеспечивающего корректное отображение веб-интерфейса сервиса.',
    ])
    P('Обработка и хранение данных осуществляются на стороне серверной инфраструктуры сервиса.')

    el.append(Paragraph('4. Функциональные характеристики', h2))
    features = [
        ('4.1. Семейный календарь', 'Ведение общего календаря событий с возможностью добавления, '
         'редактирования и просмотра мероприятий участниками семейной группы.'),
        ('4.2. Задачи и поручения', 'Постановка задач, назначение ответственных, установка сроков '
         'и отслеживание статуса выполнения.'),
        ('4.3. Списки покупок и бытовых дел', 'Формирование и ведение совместных списков покупок '
         'и домашних дел с возможностью отметки выполненных пунктов.'),
        ('4.4. Планирование мероприятий', 'Планирование семейных поездок, праздников, подарков и иных '
         'совместных мероприятий с фиксацией деталей и состава участников.'),
        ('4.5. Профили членов семьи', 'Создание и ведение профилей членов семьи, назначение ролей, '
         'управление составом семейной группы.'),
        ('4.6. Детские активности', 'Планирование и учёт занятий, кружков, мероприятий и иных '
         'активностей для детей.'),
        ('4.7. Семейные правила и традиции', 'Фиксация семейных договорённостей, правил поведения, '
         'традиций и значимых дат.'),
        ('4.8. Хранение материалов', 'Сохранение заметок, рецептов и иных пользовательских материалов '
         'в структурированном виде.'),
        ('4.9. Уведомления и напоминания', 'Формирование уведомлений и напоминаний о предстоящих '
         'событиях, задачах и важных датах.'),
        ('4.10. Аналитика', 'Просмотр сводной информации об активности пользователей, выполненных '
         'задачах и предстоящих событиях.'),
        ('4.11. Рекомендательные механизмы', 'Предоставление вспомогательных подсказок и рекомендаций '
         'для упрощения планирования и организации совместной семейной деятельности.'),
    ]
    for title, text in features:
        el.append(Paragraph(title, h3))
        P(text)

    el.append(Paragraph('5. Порядок работы с программным обеспечением', h2))
    P('Пользователь может выполнять следующие действия:')
    bullets([
        'просматривать и добавлять события в семейный календарь;',
        'создавать и назначать задачи;',
        'вести списки покупок и бытовых дел;',
        'просматривать и редактировать профили членов семьи;',
        'работать с заметками, рецептами и иными пользовательскими материалами;',
        'просматривать уведомления и напоминания.',
    ])
    P('Пользовательские данные сохраняются штатными средствами сервиса при выполнении '
      'соответствующих операций.')
    el.append(Paragraph('Ограничения:', h3))
    bullets([
        'для работы с программным обеспечением требуется доступ к сети Интернет;',
        'не рекомендуется одновременное редактирование одних и тех же данных из нескольких сессий '
        'одной учётной записи.',
    ])

    el.append(Paragraph('6. Поддержка жизненного цикла', h2))
    el.append(Paragraph('6.1. Общие положения', h3))
    P('Поддержка жизненного цикла программного обеспечения «Наша Семья» обеспечивается '
      'правообладателем — ИП Кузьменко Анастасия Вячеславовна. Поддержка включает исправление ошибок, '
      'обновление и развитие функциональных возможностей, обеспечение работоспособности сервиса.')
    el.append(Paragraph('6.2. Исправление ошибок', h3))
    P('Выявленные ошибки классифицируются по степени влияния на работоспособность сервиса. '
      'Ошибки, влияющие на доступность или корректность функционирования, устраняются в '
      'приоритетном порядке. Прочие ошибки исправляются по мере необходимости.')
    el.append(Paragraph('6.3. Обновление и совершенствование', h3))
    P('Обновление функциональных возможностей выполняется по мере необходимости. Изменения, '
      'как правило, вносятся без прерывания доступа к сервису; при необходимости могут проводиться '
      'регламентные работы. Пользователи уведомляются о значимых изменениях при необходимости.')
    el.append(Paragraph('6.4. Резервное копирование данных', h3))
    P('Резервное копирование данных осуществляется в рамках инфраструктуры, используемой '
      'для размещения сервиса.')

    el.append(Paragraph('7. Техническая поддержка', h2))
    P('Обращения пользователей принимаются по адресу электронной почты: '
      '<b>support@nasha-semiya.ru</b>. Ответ предоставляется в рабочее время, как правило, '
      'в течение 1 рабочего дня.')
    P('При необходимости к выполнению отдельных технических работ могут привлекаться специалисты '
      'на договорной основе.')
    P('Решение о прекращении поддержки программного обеспечения принимается правообладателем. '
      'Пользователи уведомляются о таком решении заблаговременно.')

    el.append(Spacer(1, 14))
    el.append(Paragraph('ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955', meta))

    doc.build(el)
    return buf.getvalue(), reg


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Формирует PDF документации и загружает в S3, возвращает CDN-ссылку."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': '', 'isBase64Encoded': False}

    pdf_bytes, font_used = build_pdf()

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(
        Bucket='files', Key=S3_KEY, Body=pdf_bytes,
        ContentType='application/pdf',
        ContentDisposition='inline; filename="nasha-semiya-documentation.pdf"',
    )
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{S3_KEY}"

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'url': cdn_url, 'size': len(pdf_bytes), 'font': font_used}, ensure_ascii=False),
        'isBase64Encoded': False,
    }