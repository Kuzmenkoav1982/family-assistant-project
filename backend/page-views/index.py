import json
import os
import re
import psycopg2
from typing import Dict, Any, Tuple
from datetime import datetime


def parse_user_agent(ua: str) -> Tuple[str, str, str]:
    '''Определяет устройство, ОС и браузер из User-Agent строки.'''
    if not ua:
        return 'unknown', 'unknown', 'unknown'
    ua_lower = ua.lower()

    if 'ipad' in ua_lower or ('tablet' in ua_lower and 'mobile' not in ua_lower):
        device = 'tablet'
    elif 'mobile' in ua_lower or 'iphone' in ua_lower or 'android' in ua_lower:
        device = 'mobile'
    else:
        device = 'desktop'

    if 'iphone' in ua_lower or 'ipad' in ua_lower or 'ios' in ua_lower or 'mac os' in ua_lower:
        os_name = 'iOS/macOS'
    elif 'android' in ua_lower:
        os_name = 'Android'
    elif 'windows' in ua_lower:
        os_name = 'Windows'
    elif 'linux' in ua_lower:
        os_name = 'Linux'
    else:
        os_name = 'Other'

    if 'yabrowser' in ua_lower or 'yandex' in ua_lower:
        browser = 'Yandex'
    elif 'edg/' in ua_lower or 'edge' in ua_lower:
        browser = 'Edge'
    elif 'opera' in ua_lower or 'opr/' in ua_lower:
        browser = 'Opera'
    elif 'firefox' in ua_lower:
        browser = 'Firefox'
    elif 'chrome' in ua_lower:
        browser = 'Chrome'
    elif 'safari' in ua_lower:
        browser = 'Safari'
    else:
        browser = 'Other'

    return device, os_name, browser


def categorize_referrer(ref: str) -> str:
    '''Категоризирует источник трафика.'''
    if not ref:
        return 'Прямой заход'
    ref_lower = ref.lower()

    if 'yandex.ru' in ref_lower or 'ya.ru' in ref_lower:
        return 'Яндекс.Поиск'
    if 'google.com' in ref_lower or 'google.ru' in ref_lower:
        return 'Google.Поиск'
    if 'bing.com' in ref_lower or 'duckduckgo' in ref_lower:
        return 'Другие поисковики'
    if 'vk.com' in ref_lower or 'vkontakte' in ref_lower:
        return 'ВКонтакте'
    if 'ok.ru' in ref_lower:
        return 'Одноклассники'
    if 'telegram' in ref_lower or 't.me' in ref_lower:
        return 'Telegram'
    if 'whatsapp' in ref_lower or 'wa.me' in ref_lower:
        return 'WhatsApp'
    if 'instagram' in ref_lower:
        return 'Instagram'
    if 'facebook' in ref_lower or 'fb.com' in ref_lower:
        return 'Facebook'
    if 'youtube' in ref_lower:
        return 'YouTube'
    if 'dzen' in ref_lower:
        return 'Дзен'
    if 'nasha-semiya' in ref_lower or 'poehali' in ref_lower:
        return 'Внутренний переход'
    return 'Другие сайты'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для отслеживания посещаемости и активности пользователей.
    POST - записать просмотр страницы.
    GET ?action=stats - получить расширенную статистику (устройства, источники, по часам).
    '''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': '', 'isBase64Encoded': False}

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', **cors_headers},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False,
        }

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    headers = {'Content-Type': 'application/json', **cors_headers}

    try:
        if method == 'POST':
            body = event.get('body') or '{}'
            data = json.loads(body) if body else {}

            page_path = data.get('page_path', '/')
            page_title = data.get('page_title', '')
            referrer = data.get('referrer', '')
            session_id = data.get('session_id', '')

            request_context = event.get('requestContext', {})
            req_headers = event.get('headers', {}) or {}
            user_agent = (
                req_headers.get('user-agent')
                or req_headers.get('User-Agent')
                or data.get('user_agent', '')
                or ''
            )
            ip_address = request_context.get('identity', {}).get('sourceIp', '')

            cur.execute(
                """
                INSERT INTO page_views
                (page_path, page_title, referrer, session_id, user_agent, ip_address)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (page_path, page_title, referrer, session_id, user_agent, ip_address),
            )
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False,
            }

        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'stats')

            if action != 'stats':
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False,
                }

            cur.execute(
                """
                SELECT COUNT(*), COUNT(DISTINCT session_id),
                       COUNT(DISTINCT DATE(created_at)), COUNT(DISTINCT ip_address)
                FROM page_views
                """
            )
            total_row = cur.fetchone()

            cur.execute(
                """
                SELECT COUNT(*), COUNT(DISTINCT session_id)
                FROM page_views
                WHERE created_at >= CURRENT_DATE
                """
            )
            today_row = cur.fetchone()

            cur.execute(
                """
                SELECT COUNT(*), COUNT(DISTINCT session_id)
                FROM page_views
                WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
                """
            )
            week_row = cur.fetchone()

            cur.execute(
                """
                SELECT COUNT(*), COUNT(DISTINCT session_id)
                FROM page_views
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                """
            )
            month_row = cur.fetchone()

            cur.execute(
                """
                SELECT page_path, COUNT(*)
                FROM page_views
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY page_path
                ORDER BY COUNT(*) DESC
                LIMIT 15
                """
            )
            top_pages = cur.fetchall()

            cur.execute(
                """
                SELECT DATE(created_at), COUNT(*), COUNT(DISTINCT session_id)
                FROM page_views
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) DESC
                """
            )
            daily_rows = cur.fetchall()

            cur.execute(
                """
                SELECT EXTRACT(HOUR FROM created_at)::int, COUNT(*)
                FROM page_views
                WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY EXTRACT(HOUR FROM created_at)
                """
            )
            hourly_rows = cur.fetchall()
            hourly_map = {int(r[0]): int(r[1]) for r in hourly_rows}
            hourly_chart = [{'hour': h, 'views': hourly_map.get(h, 0)} for h in range(24)]

            cur.execute(
                """
                SELECT user_agent, referrer
                FROM page_views
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                """
            )
            rows = cur.fetchall()

            devices: Dict[str, int] = {}
            os_counts: Dict[str, int] = {}
            browsers: Dict[str, int] = {}
            sources: Dict[str, int] = {}

            for ua, ref in rows:
                device, os_name, browser = parse_user_agent(ua or '')
                devices[device] = devices.get(device, 0) + 1
                os_counts[os_name] = os_counts.get(os_name, 0) + 1
                browsers[browser] = browsers.get(browser, 0) + 1
                src = categorize_referrer(ref or '')
                sources[src] = sources.get(src, 0) + 1

            def sort_dict(d: Dict[str, int]):
                return [{'name': k, 'count': v} for k, v in sorted(d.items(), key=lambda x: -x[1])]

            result = {
                'total': {
                    'views': int(total_row[0]),
                    'sessions': int(total_row[1]),
                    'active_days': int(total_row[2]),
                    'unique_ips': int(total_row[3] or 0),
                },
                'today': {'views': int(today_row[0]), 'sessions': int(today_row[1])},
                'week': {'views': int(week_row[0]), 'sessions': int(week_row[1])},
                'month': {'views': int(month_row[0]), 'sessions': int(month_row[1])},
                'top_pages': [{'path': r[0], 'views': int(r[1])} for r in top_pages],
                'daily_chart': [
                    {'date': str(r[0]), 'views': int(r[1]), 'sessions': int(r[2])}
                    for r in daily_rows
                ],
                'hourly_chart': hourly_chart,
                'devices': sort_dict(devices),
                'os': sort_dict(os_counts),
                'browsers': sort_dict(browsers),
                'sources': sort_dict(sources),
            }

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result),
                'isBase64Encoded': False,
            }

        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False,
        }

    finally:
        cur.close()
        conn.close()
