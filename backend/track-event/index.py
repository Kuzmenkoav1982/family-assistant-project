"""
Endpoint для frontend-событий воронки (signup_started, signup_failed, login_failed и др.).
Backend-события (signup_completed, login_success, task_created и т.д.) пишутся
напрямую через track_event_helper из каждой backend-функции — без HTTP-прыжка.
"""
import json
import os
from track_event_helper import track_event

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id, X-Anonymous-Id',
}

ALLOWED_EVENTS = {
    'signup_started',
    'signup_failed',
    'login_failed',
    'onboarding_started',
    'onboarding_completed',
    'page_404_hit',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}

    try:
        body = json.loads(event.get('body') or '{}')
    except Exception:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'invalid json'})}

    event_name = (body.get('event_name') or '').strip()
    if event_name not in ALLOWED_EVENTS:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': f'unknown event: {event_name}'})}

    headers = event.get('headers') or {}
    track_event(
        event_name=event_name,
        source='web',
        user_id=body.get('user_id'),
        family_id=body.get('family_id'),
        session_id=body.get('session_id') or headers.get('X-Session-Id'),
        anonymous_id=body.get('anonymous_id') or headers.get('X-Anonymous-Id'),
        path=body.get('path'),
        referrer=body.get('referrer'),
        utm_source=body.get('utm_source'),
        utm_medium=body.get('utm_medium'),
        utm_campaign=body.get('utm_campaign'),
        properties=body.get('properties'),
    )

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}
