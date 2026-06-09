"""
Генерация PDF тарифной политики ПО «Наша Семья».
POST / (с X-Admin-Token) — формирует PDF, загружает в S3 и возвращает CDN-ссылку.
"""

import os
import io
import json
import urllib.request
from typing import List, Tuple

import boto3
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily


SITE = 'https://nasha-semiya.ru'
S3_KEY = 'docs/nasha-semiya-pricing-policy.pdf'

FONT_REG_URLS = [
    'https://raw.githubusercontent.com/senotrusov/dejavu-fonts-ttf/master/ttf/DejaVuSans.ttf',
    'https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/build/DejaVuSans.ttf',
]
FONT_BOLD_URLS = [
    'https://raw.githubusercontent.com/senotrusov/dejavu-fonts-ttf/master/ttf/DejaVuSans-Bold.ttf',
    'https://github.com/senotrusov/dejavu-fonts-ttf/raw/master/ttf/DejaVuSans-Bold.ttf',
]

AI_SERVICES = [
    ("Генерация ИИ-диеты", "1 запрос", "17,00"),
    ("Фото блюда от ИИ", "1 запрос", "7,00"),
    ("ИИ-открытка", "1 запрос", "7,00"),
    ("Рецепт из продуктов", "1 запрос", "5,00"),
    ("Маршрут путешествия ИИ", "1 запрос", "5,00"),
    ("Рекомендации досуга", "1 запрос", "4,00"),
    ("Анализ развития ребёнка", "1 запрос", "4,00"),
    ("AI-ассистент (запрос)", "1 запрос", "3,00"),
    ("Домовой — наставник Мастерской жизни", "1 запрос", "3,00"),
    ("ИИ-ветеринар (запрос)", "1 запрос", "3,00"),
    ("Идеи для события ИИ", "1 запрос", "3,00"),
    ("Финансовый совет ИИ", "1 запрос", "3,00"),
    ("Оценка развития ребёнка", "1 запрос", "3,00"),
    ("Рекомендации для поездки", "1 запрос", "3,00"),
    ("Рецепт (короткий)", "1 запрос", "2,00"),
]


def _fetch_font(urls: List[str], dest: str) -> bool:
    if os.path.exists(dest) and os.path.getsize(dest) > 10000:
        return True
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 pricing-pdf'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            if len(data) < 10000:
                continue
            with open(dest, 'wb') as f:
                f.write(data)
            return True
        except Exception as e:
            print(f"[WARN] font download failed {url}: {e}")
    return False


def register_fonts() -> Tuple[str, str]:
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

    return 'Helvetica', 'Helvetica-Bold'


def build_pdf() -> bytes:
    reg, bold = register_fonts()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm,
        topMargin=20*mm, bottomMargin=18*mm,
        title='Тарифная политика ПО «Наша Семья»',
        author='ИП Кузьменко Анастасия Вячеславовна',
    )

    base = getSampleStyleSheet()['Normal']
    body = ParagraphStyle('Body', parent=base, fontName=reg, fontSize=10.5, leading=15, spaceAfter=7)
    h1 = ParagraphStyle('H1', parent=base, fontName=bold, fontSize=16, leading=21, spaceAfter=6)
    h2 = ParagraphStyle('H2', parent=base, fontName=bold, fontSize=13, leading=17, spaceBefore=14, spaceAfter=6)
    meta = ParagraphStyle('Meta', parent=base, fontName=reg, fontSize=9.5, leading=13, textColor='#444444', spaceAfter=3)
    note = ParagraphStyle('Note', parent=base, fontName=reg, fontSize=8.5, leading=12, textColor='#666666', spaceAfter=4)
    foot = ParagraphStyle('Foot', parent=base, fontName=reg, fontSize=9, leading=12, alignment=TA_CENTER, textColor='#888888')

    el: List = []

    def P(t, style=body):
        el.append(Paragraph(t, style))

    P('Тарифная политика программного обеспечения «Наша Семья»', h1)
    P('Правообладатель: ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955', meta)
    P('Редакция от 09.06.2026', meta)
    el.append(HRFlowable(width='100%', thickness=1, color=colors.lightgrey, spaceAfter=10))

    P('1. Общие положения', h2)
    P('Настоящий документ определяет тарифную политику программного обеспечения '
      '«Наша Семья» (далее — ПО), правообладателем которого является '
      'ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955.')
    P(f'ПО предоставляется в формате интернет-сервиса (SaaS) по адресу: {SITE}. '
      'Базовый доступ к ПО предоставляется бесплатно. Стоимость формируется исключительно '
      'за использование ИИ-функций сервиса.')
    P('Правообладатель вправе в одностороннем порядке изменять тарифы, уведомив пользователей '
      'не менее чем за 30 дней до вступления изменений в силу.')

    P('2. Модель оплаты — семейный кошелёк', h2)
    P('Оплата ИИ-функций осуществляется через встроенный механизм «Семейный кошелёк»: '
      'пользователь пополняет баланс кошелька на выбранную сумму, после чего каждая выполненная '
      'ИИ-операция списывает соответствующую стоимость с баланса.')
    P('Минимальная сумма пополнения — 50 рублей. Максимальная сумма пополнения за одну '
      'операцию — 100 000 рублей.')
    P('Способы пополнения: банковская карта (через ЮКассу), Система быстрых платежей (СБП). '
      'Неиспользованный остаток баланса сохраняется без ограничений по сроку.')

    P('3. Стоимость ИИ-операций', h2)
    P('Стоимость списывается с баланса кошелька за каждый выполненный запрос. '
      'Цены указаны в рублях за единицу (1 запрос / 1 результат).')
    el.append(Spacer(1, 6))

    hdr_s = ParagraphStyle('TH', parent=base, fontName=bold, fontSize=9, leading=12, textColor=colors.white)
    cell_s = ParagraphStyle('TD', parent=base, fontName=reg, fontSize=9, leading=12)
    right_s = ParagraphStyle('TDR', parent=base, fontName=reg, fontSize=9, leading=12, alignment=TA_RIGHT)

    table_data = [[
        Paragraph('No', hdr_s),
        Paragraph('Наименование тарифицируемой позиции', hdr_s),
        Paragraph('Единица', hdr_s),
        Paragraph('Стоимость, руб.', hdr_s),
    ]]
    for i, (name, unit, price) in enumerate(AI_SERVICES, 1):
        table_data.append([
            Paragraph(str(i), cell_s),
            Paragraph(name, cell_s),
            Paragraph(unit, cell_s),
            Paragraph(price, right_s),
        ])

    tbl = Table(table_data, colWidths=[10*mm, 100*mm, 30*mm, 28*mm], repeatRows=1)
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a5f')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f4f6f9')]),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    el.append(tbl)
    el.append(Spacer(1, 4))
    P('Все цены указаны в рублях РФ. Пополнение и списание отражаются в истории '
      'транзакций в разделе «Семейный кошелёк» личного кабинета.', note)

    P('4. Возврат средств', h2)
    P(f'Возврат неиспользованного баланса осуществляется в соответствии с Политикой возврата: '
      f'{SITE}/refund-policy. Средства, списанные за выполненные ИИ-операции, возврату не подлежат.')

    P('5. Порядок изменения тарифов', h2)
    P('Правообладатель вправе изменять стоимость ИИ-операций, уведомив пользователей по '
      'электронной почте и/или через интерфейс сервиса не менее чем за 30 (тридцать) '
      'календарных дней до вступления изменений в силу.')
    P('Изменение тарифов не затрагивает уже зачисленный баланс кошелька — он продолжает '
      'использоваться по актуальным на момент расходования ценам.')

    el.append(Spacer(1, 20))
    el.append(HRFlowable(width='100%', thickness=0.5, color=colors.lightgrey))
    el.append(Spacer(1, 6))
    P('ИП Кузьменко Анастасия Вячеславовна, ОГРНИП 325774600908955', foot)

    doc.build(el)
    return buf.getvalue()


def handler(event: dict, context) -> dict:
    """Генерирует PDF тарифной политики ПО Наша Семья и загружает на CDN."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            },
            'body': '',
        }

    pdf_bytes = build_pdf()

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=S3_KEY, Body=pdf_bytes, ContentType='application/pdf')

    cdn_url = (
        f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}"
        f"/bucket/{S3_KEY}"
    )
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'url': cdn_url}),
    }