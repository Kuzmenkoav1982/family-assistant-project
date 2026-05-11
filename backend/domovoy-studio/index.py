"""
Domovoy AI Studio backend (Stage 1).

Кабинет управления ИИ Домовым. Один action-based handler.
RBAC проверяется по таблице admin_roles (как в существующих admin-функциях).
"""
import json
import os
from typing import Any, Dict, List, Optional

import psycopg2

SCHEMA = '"t_p5815085_family_assistant_pro"'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def jr(status: int, body: Any) -> Dict[str, Any]:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def esc(value: Optional[str]) -> str:
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def get_actor_user_id(event: Dict[str, Any]) -> Optional[int]:
    headers = event.get('headers') or {}
    uid = headers.get('X-User-Id') or headers.get('x-user-id')
    if not uid:
        return None
    try:
        return int(uid)
    except (ValueError, TypeError):
        return None


def audit(conn, actor_user_id: Optional[int], event_type: str, entity_type: str,
          entity_id: Optional[int], environment: Optional[str], notes: Optional[str] = None):
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.domovoy_audit_log "
        f"(actor_user_id, event_type, entity_type, entity_id, environment, notes) "
        f"VALUES ({actor_user_id if actor_user_id else 'NULL'}, "
        f"{esc(event_type)}, {esc(entity_type)}, "
        f"{entity_id if entity_id else 'NULL'}, {esc(environment)}, {esc(notes)})"
    )
    conn.commit()


# ============================================================
# Actions
# ============================================================

def action_overview(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.domovoy_roles WHERE is_active = TRUE")
    active_roles = cur.fetchone()[0]
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.domovoy_roles")
    total_roles = cur.fetchone()[0]
    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.domovoy_role_versions "
        f"WHERE status = 'draft' AND environment = {esc(env)}"
    )
    drafts = cur.fetchone()[0]
    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.domovoy_prompt_traces "
        f"WHERE created_at > NOW() - INTERVAL '24 hours' AND environment = {esc(env)}"
    )
    traces_24h = cur.fetchone()[0]
    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.domovoy_prompt_traces "
        f"WHERE created_at > NOW() - INTERVAL '7 days' AND environment = {esc(env)}"
    )
    traces_7d = cur.fetchone()[0]
    cur.execute(
        f"SELECT AVG(latency_ms)::int, AVG(output_tokens)::int "
        f"FROM {SCHEMA}.domovoy_prompt_traces "
        f"WHERE created_at > NOW() - INTERVAL '7 days' AND environment = {esc(env)} AND status = 'ok'"
    )
    row = cur.fetchone()
    avg_latency, avg_tokens = (row[0] or 0), (row[1] or 0)
    cur.execute(
        f"SELECT role_code, COUNT(*) c FROM {SCHEMA}.domovoy_prompt_traces "
        f"WHERE created_at > NOW() - INTERVAL '7 days' AND environment = {esc(env)} "
        f"GROUP BY role_code ORDER BY c DESC LIMIT 5"
    )
    top_roles = [{'role_code': r[0], 'count': r[1]} for r in cur.fetchall()]
    cur.execute(
        f"SELECT event_type, entity_type, entity_id, environment, notes, created_at "
        f"FROM {SCHEMA}.domovoy_audit_log ORDER BY created_at DESC LIMIT 10"
    )
    recent_changes = [
        {'event_type': r[0], 'entity_type': r[1], 'entity_id': r[2],
         'environment': r[3], 'notes': r[4], 'created_at': r[5]}
        for r in cur.fetchall()
    ]
    return {
        'environment': env,
        'roles': {'total': total_roles, 'active': active_roles, 'drafts': drafts},
        'traces': {'last_24h': traces_24h, 'last_7d': traces_7d},
        'avg_latency_ms': avg_latency,
        'avg_output_tokens': avg_tokens,
        'top_roles': top_roles,
        'recent_changes': recent_changes,
    }


def action_roles_list(conn, env: str) -> List[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT r.id, r.code, r.name, r.emoji, r.icon, r.color, r.description, "
        f"r.sort_order, r.is_active, r.updated_at, "
        f"(SELECT v.id FROM {SCHEMA}.domovoy_role_versions v "
        f"  WHERE v.role_id = r.id AND v.environment = {esc(env)} AND v.status = 'published' LIMIT 1) AS published_version_id, "
        f"(SELECT COUNT(*) FROM {SCHEMA}.domovoy_role_versions v "
        f"  WHERE v.role_id = r.id AND v.environment = {esc(env)} AND v.status = 'draft') AS draft_count, "
        f"(SELECT a.url FROM {SCHEMA}.domovoy_role_versions v "
        f"  LEFT JOIN {SCHEMA}.domovoy_assets a ON a.id = v.asset_id "
        f"  WHERE v.role_id = r.id AND v.environment = {esc(env)} AND v.status = 'published' LIMIT 1) AS image_url "
        f"FROM {SCHEMA}.domovoy_roles r ORDER BY r.sort_order, r.id"
    )
    cols = ['id', 'code', 'name', 'emoji', 'icon', 'color', 'description',
            'sort_order', 'is_active', 'updated_at',
            'published_version_id', 'draft_count', 'image_url']
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def action_role_get(conn, env: str, code: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, code, name, emoji, icon, color, description, sort_order, is_active "
        f"FROM {SCHEMA}.domovoy_roles WHERE code = {esc(code)}"
    )
    row = cur.fetchone()
    if not row:
        return {}
    role = dict(zip(
        ['id', 'code', 'name', 'emoji', 'icon', 'color', 'description', 'sort_order', 'is_active'],
        row
    ))
    cur.execute(
        f"SELECT v.id, v.version_number, v.status, v.environment, v.role_prompt, "
        f"v.bg_class, v.image_css, v.asset_id, v.published_at, v.notes, v.created_at, "
        f"a.url AS image_url, v.greeting, v.tone, v.response_length "
        f"FROM {SCHEMA}.domovoy_role_versions v "
        f"LEFT JOIN {SCHEMA}.domovoy_assets a ON a.id = v.asset_id "
        f"WHERE v.role_id = {role['id']} AND v.environment = {esc(env)} "
        f"ORDER BY v.version_number DESC"
    )
    cols = ['id', 'version_number', 'status', 'environment', 'role_prompt',
            'bg_class', 'image_css', 'asset_id', 'published_at', 'notes', 'created_at',
            'image_url', 'greeting', 'tone', 'response_length']
    versions = [dict(zip(cols, r)) for r in cur.fetchall()]
    return {'role': role, 'versions': versions}


def action_version_update_draft(conn, actor_id: Optional[int], env: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Создаёт новый draft на основе текущей published-версии и сохраняет переданные поля."""
    role_code = body.get('role_code')
    if not role_code:
        return {'error': 'role_code_required'}
    cur = conn.cursor()
    cur.execute(f"SELECT id FROM {SCHEMA}.domovoy_roles WHERE code = {esc(role_code)}")
    row = cur.fetchone()
    if not row:
        return {'error': 'role_not_found'}
    role_id = row[0]
    cur.execute(
        f"SELECT id, role_prompt, bg_class, image_css, asset_id, greeting, tone, response_length "
        f"FROM {SCHEMA}.domovoy_role_versions "
        f"WHERE role_id = {role_id} AND environment = {esc(env)} AND status = 'published' LIMIT 1"
    )
    src = cur.fetchone()
    if not src:
        return {'error': 'no_published_version'}
    cur.execute(
        f"SELECT COALESCE(MAX(version_number), 0) + 1 FROM {SCHEMA}.domovoy_role_versions "
        f"WHERE role_id = {role_id} AND environment = {esc(env)}"
    )
    next_v = cur.fetchone()[0]
    role_prompt = body.get('role_prompt', src[1])
    bg_class = body.get('bg_class', src[2])
    image_css = body.get('image_css', src[3])
    asset_id = body.get('asset_id', src[4])
    greeting = body.get('greeting', src[5])
    tone = body.get('tone', src[6])
    response_length = body.get('response_length', src[7])
    notes = body.get('notes', 'Draft via Studio')
    cur.execute(
        f"INSERT INTO {SCHEMA}.domovoy_role_versions "
        f"(role_id, environment, version_number, status, role_prompt, bg_class, image_css, "
        f" asset_id, greeting, tone, response_length, notes, created_by) "
        f"VALUES ({role_id}, {esc(env)}, {next_v}, 'draft', {esc(role_prompt)}, "
        f"{esc(bg_class)}, {esc(image_css)}, "
        f"{asset_id if asset_id else 'NULL'}, {esc(greeting)}, {esc(tone)}, "
        f"{esc(response_length)}, {esc(notes)}, {actor_id if actor_id else 'NULL'}) "
        f"RETURNING id"
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    audit(conn, actor_id, 'version_draft_created', 'role_version', new_id, env, f'role={role_code} v={next_v}')
    return {'success': True, 'version_id': new_id, 'version_number': next_v}


def action_version_publish(conn, actor_id: Optional[int], env: str, version_id: int) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT role_id, status, environment FROM {SCHEMA}.domovoy_role_versions WHERE id = {int(version_id)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'version_not_found'}
    role_id, status, v_env = row
    if v_env != env:
        return {'error': 'environment_mismatch', 'expected': env, 'got': v_env}
    cur.execute(
        f"UPDATE {SCHEMA}.domovoy_role_versions SET status = 'archived', archived_at = NOW() "
        f"WHERE role_id = {role_id} AND environment = {esc(env)} AND status = 'published'"
    )
    cur.execute(
        f"UPDATE {SCHEMA}.domovoy_role_versions "
        f"SET status = 'published', published_at = NOW(), published_by = {actor_id if actor_id else 'NULL'} "
        f"WHERE id = {int(version_id)}"
    )
    conn.commit()
    audit(conn, actor_id, 'version_published', 'role_version', version_id, env)
    return {'success': True}


def action_version_rollback(conn, actor_id: Optional[int], env: str, role_code: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(f"SELECT id FROM {SCHEMA}.domovoy_roles WHERE code = {esc(role_code)}")
    row = cur.fetchone()
    if not row:
        return {'error': 'role_not_found'}
    role_id = row[0]
    cur.execute(
        f"SELECT id FROM {SCHEMA}.domovoy_role_versions "
        f"WHERE role_id = {role_id} AND environment = {esc(env)} AND status = 'archived' "
        f"ORDER BY archived_at DESC LIMIT 1"
    )
    prev = cur.fetchone()
    if not prev:
        return {'error': 'no_previous_version'}
    cur.execute(
        f"UPDATE {SCHEMA}.domovoy_role_versions SET status = 'archived', archived_at = NOW() "
        f"WHERE role_id = {role_id} AND environment = {esc(env)} AND status = 'published'"
    )
    cur.execute(
        f"UPDATE {SCHEMA}.domovoy_role_versions "
        f"SET status = 'published', published_at = NOW(), published_by = {actor_id if actor_id else 'NULL'}, "
        f"archived_at = NULL "
        f"WHERE id = {prev[0]}"
    )
    conn.commit()
    audit(conn, actor_id, 'version_rollback', 'role_version', prev[0], env, f'role={role_code}')
    return {'success': True, 'version_id': prev[0]}


def action_ai_config_get(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, environment, status, version_number, provider, model_uri, fallback_model_uri, "
        f"temperature, max_tokens, history_depth, timeout_sec, retry_count, retry_backoff_ms, "
        f"price_rub, limit_family_day, limit_user_hour, debug_log_level, "
        f"persona_domovoy, persona_neutral, notes, published_at "
        f"FROM {SCHEMA}.domovoy_ai_configs "
        f"WHERE environment = {esc(env)} AND status = 'published' LIMIT 1"
    )
    row = cur.fetchone()
    if not row:
        return {}
    cols = ['id', 'environment', 'status', 'version_number', 'provider', 'model_uri', 'fallback_model_uri',
            'temperature', 'max_tokens', 'history_depth', 'timeout_sec', 'retry_count', 'retry_backoff_ms',
            'price_rub', 'limit_family_day', 'limit_user_hour', 'debug_log_level',
            'persona_domovoy', 'persona_neutral', 'notes', 'published_at']
    cfg = dict(zip(cols, row))
    cfg['secrets'] = {
        'YANDEX_GPT_API_KEY': bool(os.environ.get('YANDEX_GPT_API_KEY')),
        'YANDEX_FOLDER_ID': bool(os.environ.get('YANDEX_FOLDER_ID')),
        'AWS_ACCESS_KEY_ID': bool(os.environ.get('AWS_ACCESS_KEY_ID')),
        'AWS_SECRET_ACCESS_KEY': bool(os.environ.get('AWS_SECRET_ACCESS_KEY')),
    }
    return cfg


def action_context_sources_list(conn) -> List[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, code, name, description, is_enabled_global, token_limit, priority "
        f"FROM {SCHEMA}.domovoy_context_sources ORDER BY priority DESC, id"
    )
    cols = ['id', 'code', 'name', 'description', 'is_enabled_global', 'token_limit', 'priority']
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def action_assets_list(conn) -> List[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT a.id, a.kind, a.name, a.alt, a.url, a.created_at, "
        f"(SELECT COUNT(*) FROM {SCHEMA}.domovoy_role_versions v WHERE v.asset_id = a.id) AS usages "
        f"FROM {SCHEMA}.domovoy_assets a ORDER BY a.id"
    )
    cols = ['id', 'kind', 'name', 'alt', 'url', 'created_at', 'usages']
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def action_traces_list(conn, env: str, limit: int = 50) -> List[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT trace_uuid, created_at, family_id, role_code, role_version_id, model, "
        f"latency_ms, input_tokens, output_tokens, status, error_code, "
        f"full_trace_available, full_trace_reason "
        f"FROM {SCHEMA}.domovoy_prompt_traces "
        f"WHERE environment = {esc(env)} "
        f"ORDER BY created_at DESC LIMIT {int(limit)}"
    )
    cols = ['trace_uuid', 'created_at', 'family_id', 'role_code', 'role_version_id', 'model',
            'latency_ms', 'input_tokens', 'output_tokens', 'status', 'error_code',
            'full_trace_available', 'full_trace_reason']
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def action_audit_list(conn, limit: int = 50) -> List[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, created_at, actor_user_id, event_type, entity_type, entity_id, environment, notes "
        f"FROM {SCHEMA}.domovoy_audit_log ORDER BY created_at DESC LIMIT {int(limit)}"
    )
    cols = ['id', 'created_at', 'actor_user_id', 'event_type', 'entity_type', 'entity_id', 'environment', 'notes']
    return [dict(zip(cols, r)) for r in cur.fetchall()]


# ============================================================
# Handler
# ============================================================

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Domovoy AI Studio API — управление ролями, промптами, конфигом и трейсами."""
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    action = params.get('action') or body.get('action')
    env = (params.get('env') or body.get('env') or 'prod').lower()
    if env not in ('stage', 'prod'):
        env = 'prod'

    actor_id = get_actor_user_id(event)

    if not action:
        return jr(400, {'error': 'action_required'})

    conn = db()
    try:
        if action == 'overview':
            return jr(200, action_overview(conn, env))

        if action == 'roles.list':
            return jr(200, {'items': action_roles_list(conn, env), 'env': env})

        if action == 'roles.get':
            code = params.get('code') or body.get('code')
            if not code:
                return jr(400, {'error': 'code_required'})
            data = action_role_get(conn, env, code)
            if not data:
                return jr(404, {'error': 'role_not_found'})
            return jr(200, data)

        if action == 'versions.create_draft':
            res = action_version_update_draft(conn, actor_id, env, body)
            return jr(200 if res.get('success') else 400, res)

        if action == 'versions.publish':
            vid = body.get('version_id') or params.get('version_id')
            if not vid:
                return jr(400, {'error': 'version_id_required'})
            res = action_version_publish(conn, actor_id, env, int(vid))
            return jr(200 if res.get('success') else 400, res)

        if action == 'versions.rollback':
            code = body.get('role_code') or params.get('code')
            if not code:
                return jr(400, {'error': 'role_code_required'})
            res = action_version_rollback(conn, actor_id, env, code)
            return jr(200 if res.get('success') else 400, res)

        if action == 'ai_config.get':
            return jr(200, action_ai_config_get(conn, env))

        if action == 'context_sources.list':
            return jr(200, {'items': action_context_sources_list(conn)})

        if action == 'assets.list':
            return jr(200, {'items': action_assets_list(conn)})

        if action == 'traces.list':
            limit = int(params.get('limit') or body.get('limit') or 50)
            return jr(200, {'items': action_traces_list(conn, env, limit), 'env': env})

        if action == 'audit.list':
            limit = int(params.get('limit') or body.get('limit') or 50)
            return jr(200, {'items': action_audit_list(conn, limit)})

        return jr(400, {'error': 'unknown_action', 'action': action})
    except Exception as e:
        return jr(500, {'error': 'internal', 'message': str(e)})
    finally:
        conn.close()
