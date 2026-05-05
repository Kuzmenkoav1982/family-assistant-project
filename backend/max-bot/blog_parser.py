"""
Парсер постов из MAX-канала "Наша Семья" в публичный блог.
Извлекает: title, excerpt, content, category, tags, slug, SEO-метаданные.
"""

import re
import unicodedata
from datetime import datetime
from typing import Dict, List, Optional, Tuple


CATEGORY_KEYWORDS = {
    'health': [
        'микробиом', 'иммунитет', 'кортизол', 'кишечник', 'витамин', 'болезн', 'орви',
        'клещ', 'аллерг', 'диета', 'питание', 'пищ', 'едa', 'медицин', 'врач',
        'здоровь', 'физическ', 'активность', 'сон', 'хронотип', 'мелатонин',
        'генетическ', 'наследствен', 'инфаркт', 'давление', 'диабет', 'нейр',
    ],
    'psychology': [
        'стресс', 'тревог', 'эмоци', 'психолог', 'привязанност', 'безусловн',
        'выгоран', 'внутренн', 'самооценк', 'идентичност', 'кризис', 'депресс',
        'осознанност', 'медитац', 'сознан', 'безопасн дом', 'эмоциональн',
    ],
    'children': [
        'ребён', 'ребен', 'дет', 'школьник', 'дошкольн', 'подросток', 'малыш',
        'воспитан', 'педагог', 'возраст', 'развит', 'игр', 'творчеств',
        'креативност', 'самостоятельност', 'день рождения', 'именинник',
    ],
    'relationships': [
        'пар', 'супруг', 'муж', 'жена', 'брак', 'отношения', 'партнёр', 'партнер',
        'любовь', 'язык любв', 'gottman', 'конфликт', 'свидание', 'близость',
        'семейн труд', 'распределен', 'cognitive labour',
    ],
    'finance': [
        'финанс', 'бюджет', 'деньг', 'накоп', 'кредит', 'долг', 'трат',
        'покупк', 'расход', 'доход', 'копилк', 'цел финанс',
    ],
    'leisure': [
        'традици', 'праздник', 'юмор', 'смех', 'выходн', 'отдых', 'путешеств',
        'отпуск', 'майск', 'досуг', 'хобб', 'природ', 'дач', 'огород', 'шашлык',
        'пикник', 'кемпинг', 'раскраск', 'настольн игр',
    ],
    'education': [
        'чтение', 'книг', 'учёб', 'учеб', 'школа', 'урок', 'экзамен', 'контрольн',
        'словарн запас', 'эмпати', 'обучен', 'знания', 'грамотност',
    ],
    'safety': [
        'безопасност', 'данн', 'утечк', 'мошенник', 'защит', 'шифрован', 'паспорт',
        'госуслуг', 'гпс', 'gps', 'геозон', 'маячок', 'потеря', 'тревожн кнопк',
    ],
}

CATEGORY_DEFAULT = 'psychology'

TAG_DICTIONARY = [
    ('дети', ['ребён', 'ребен', 'дет', 'малыш', 'дошкольн']),
    ('подростки', ['подросток', 'тинейдж', '13+', '14 лет']),
    ('брак', ['брак', 'муж', 'жена', 'супруг']),
    ('воспитание', ['воспитан', 'педагог']),
    ('здоровье', ['здоровь', 'иммунитет', 'болезн', 'врач', 'медицин']),
    ('питание', ['питание', 'диет', 'еда', 'пищ']),
    ('психология', ['психолог', 'эмоци', 'стресс', 'тревог']),
    ('школа', ['школа', 'школьник', 'урок', 'класс', 'экзамен']),
    ('традиции', ['традици', 'ритуал']),
    ('праздники', ['праздник', 'день рождения', 'майск']),
    ('финансы', ['финанс', 'бюджет', 'деньг']),
    ('путешествия', ['путешеств', 'отпуск', 'поездк']),
    ('природа', ['природ', 'лес', 'парк', 'огород', 'дач']),
    ('сон', ['сон ', 'засыпан', 'мелатонин', 'хронотип']),
    ('развитие', ['развит', 'навык', 'способност']),
    ('безопасность', ['безопасност', 'защит', 'мошенник']),
    ('отношения', ['отношения', 'любовь', 'близость', 'партнёр', 'партнер']),
    ('наука', ['исследован', 'учён', 'учен', 'journal', 'university', 'institute']),
    ('юмор', ['юмор', 'смех', 'шутк']),
    ('конфликты', ['конфликт', 'спор', 'ссор']),
    ('самооценка', ['самооценк']),
    ('эмпатия', ['эмпати']),
]

CYRILLIC_TO_LATIN = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
}


def transliterate(text: str) -> str:
    text = text.lower()
    result = []
    for ch in text:
        if ch in CYRILLIC_TO_LATIN:
            result.append(CYRILLIC_TO_LATIN[ch])
        elif ch.isalnum() and ord(ch) < 128:
            result.append(ch)
        elif ch in [' ', '-', '_']:
            result.append('-')
    return ''.join(result)


def make_slug(title: str, max_len: int = 80) -> str:
    cleaned = re.sub(r'[^\w\s\-а-яёА-ЯЁ]', '', title, flags=re.UNICODE)
    slug = transliterate(cleaned)
    slug = re.sub(r'-+', '-', slug).strip('-')
    if len(slug) > max_len:
        slug = slug[:max_len].rsplit('-', 1)[0]
    return slug or 'post'


def strip_emoji_at_start(line: str) -> str:
    """Удаляет ведущие emoji/символы из строки."""
    cleaned = []
    started = False
    for ch in line:
        if not started:
            if ch.isalpha() or ch.isdigit() or ch in '«"\'':
                started = True
                cleaned.append(ch)
            elif ch == ' ' and cleaned:
                cleaned.append(ch)
        else:
            cleaned.append(ch)
    return ''.join(cleaned).strip()


def extract_title(text: str) -> str:
    """Заголовок — первая значимая строка, обычно ВЕРХНИМ РЕГИСТРОМ."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:3]:
        cleaned = strip_emoji_at_start(line)
        if not cleaned:
            continue
        if len(cleaned) < 8:
            continue
        title = cleaned.rstrip('.').strip()
        if len(title) > 200:
            title = title[:200].rsplit(' ', 1)[0] + '...'
        return title.capitalize() if title.isupper() else title
    return 'Пост в блоге'


def extract_excerpt(text: str, title: str) -> str:
    """Описание для SEO (~160 символов) — первый абзац после заголовка."""
    lines = text.split('\n')
    skip_first = True
    paragraph_lines: List[str] = []
    for line in lines:
        s = line.strip()
        if not s:
            if paragraph_lines:
                break
            continue
        if skip_first and title.lower()[:20] in s.lower():
            skip_first = False
            continue
        skip_first = False
        cleaned = strip_emoji_at_start(s)
        if cleaned and len(cleaned) > 20:
            paragraph_lines.append(cleaned)
            if sum(len(l) for l in paragraph_lines) > 200:
                break
    excerpt = ' '.join(paragraph_lines)
    excerpt = re.sub(r'\s+', ' ', excerpt).strip()
    if len(excerpt) > 200:
        excerpt = excerpt[:197].rsplit(' ', 1)[0] + '...'
    return excerpt or title


def detect_category(text: str) -> str:
    text_lower = text.lower()
    scores: Dict[str, int] = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            scores[cat] += text_lower.count(kw)
    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        return CATEGORY_DEFAULT
    return best_cat


def extract_tags(text: str, max_tags: int = 5) -> List[str]:
    text_lower = text.lower()
    tag_scores: List[Tuple[str, int]] = []
    for tag, keywords in TAG_DICTIONARY:
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 0:
            tag_scores.append((tag, score))
    tag_scores.sort(key=lambda x: -x[1])
    return [t for t, _ in tag_scores[:max_tags]]


def estimate_reading_time(text: str) -> int:
    words = len(text.split())
    return max(1, round(words / 200))


def clean_content(text: str) -> str:
    """Чистит контент: убирает финальную ссылку и дубль заголовка."""
    lines = text.split('\n')
    cleaned: List[str] = []
    for line in lines:
        s = line.strip()
        if 'nasha-semiya.ru' in s.lower() and len(s) < 80:
            continue
        cleaned.append(line)
    result = '\n'.join(cleaned).strip()
    return result


def parse_max_post(text: str, image_url: Optional[str] = None,
                   max_message_id: Optional[int] = None,
                   max_chat_id: Optional[int] = None,
                   published_at: Optional[datetime] = None) -> Dict:
    """Парсит пост из MAX-канала в структуру для public_blog_posts."""
    if not text or len(text.strip()) < 30:
        return {}

    title = extract_title(text)
    excerpt = extract_excerpt(text, title)
    category_slug = detect_category(text)
    tags = extract_tags(text)
    content = clean_content(text)
    slug_base = make_slug(title)
    reading_time = estimate_reading_time(text)

    seo_title = f"{title} — Наша Семья"
    if len(seo_title) > 70:
        seo_title = title[:65] + '...'
    seo_description = excerpt[:160]
    seo_keywords = ', '.join(['семья', 'наша семья'] + tags)

    return {
        'title': title,
        'slug': slug_base,
        'excerpt': excerpt,
        'content': content,
        'cover_image_url': image_url,
        'category_slug': category_slug,
        'tags': tags,
        'reading_time_min': reading_time,
        'seo_title': seo_title,
        'seo_description': seo_description,
        'seo_keywords': seo_keywords,
        'max_message_id': max_message_id,
        'max_chat_id': max_chat_id,
        'published_at': published_at or datetime.now(),
    }
