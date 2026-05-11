"""
Domovoy AI Studio backend (Stage 1).

Кабинет управления ИИ Домовым. Один action-based handler.
RBAC проверяется по таблице admin_roles (как в существующих admin-функциях).
"""
import json
import os
import time
import uuid
import hashlib
from typing import Any, Dict, List, Optional

import psycopg2
import requests

from s3_trace import write_full_trace, read_full_trace

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


def _fetch_version_by_id(conn, version_id: int) -> Optional[Dict[str, Any]]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT v.id, v.role_id, r.code AS role_code, r.name AS role_name, v.environment, "
        f"v.version_number, v.status, v.role_prompt, v.bg_class, v.image_css, v.greeting, "
        f"v.tone, v.response_length, v.notes, v.published_at, v.created_at, "
        f"a.url AS image_url "
        f"FROM {SCHEMA}.domovoy_role_versions v "
        f"JOIN {SCHEMA}.domovoy_roles r ON r.id = v.role_id "
        f"LEFT JOIN {SCHEMA}.domovoy_assets a ON a.id = v.asset_id "
        f"WHERE v.id = {int(version_id)}"
    )
    row = cur.fetchone()
    if not row:
        return None
    cols = ['id', 'role_id', 'role_code', 'role_name', 'environment', 'version_number',
            'status', 'role_prompt', 'bg_class', 'image_css', 'greeting', 'tone',
            'response_length', 'notes', 'published_at', 'created_at', 'image_url']
    return dict(zip(cols, row))


def action_version_get(conn, version_id: int) -> Dict[str, Any]:
    v = _fetch_version_by_id(conn, version_id)
    if not v:
        return {'error': 'version_not_found'}
    return v


def action_versions_compare(conn, a_id: int, b_id: int) -> Dict[str, Any]:
    a = _fetch_version_by_id(conn, a_id)
    b = _fetch_version_by_id(conn, b_id)
    if not a or not b:
        return {'error': 'version_not_found'}
    return {'a': a, 'b': b}


def _build_final_prompt(persona: str, role_prompt: str, sandbox_context: str = '') -> str:
    parts = []
    if persona:
        parts.append(persona.strip())
    if role_prompt:
        parts.append(role_prompt.strip())
    if sandbox_context:
        parts.append(sandbox_context.strip())
    return '\n\n'.join(parts)


def _approx_tokens(text: str) -> int:
    return len(text) // 4 if text else 0


def write_sandbox_trace(conn, family_id, user_id, env, role_code, version_id, ai_config_id,
                        model, temperature, max_tokens, prompt_checksum,
                        input_tokens, output_tokens, latency_ms, status, error_code,
                        full_payload=None):
    """Пишет краткий trace в БД и (опционально) полный JSON в S3.
    Возвращает trace_uuid.
    """
    try:
        trace_uuid = str(uuid.uuid4())

        s3_key = None
        full_available = False
        if full_payload is not None:
            full_payload_with_meta = dict(full_payload)
            full_payload_with_meta['trace_uuid'] = trace_uuid
            full_payload_with_meta['created_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            s3_key = write_full_trace(trace_uuid, full_payload_with_meta)
            full_available = bool(s3_key)

        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.domovoy_prompt_traces "
            f"(trace_uuid, family_id, user_id, environment, role_code, role_version_id, ai_config_id, "
            f" entry_point, model, temperature, max_tokens, history_depth, "
            f" input_tokens, output_tokens, latency_ms, status, error_code, prompt_checksum, "
            f" full_trace_available, full_trace_reason, full_trace_s3_key) "
            f"VALUES ({esc(trace_uuid)}, "
            f"{family_id if family_id else 'NULL'}, {user_id if user_id else 'NULL'}, {esc(env)}, "
            f"{esc(role_code)}, {version_id if version_id else 'NULL'}, "
            f"{ai_config_id if ai_config_id else 'NULL'}, "
            f"'sandbox', {esc(model)}, {temperature}, {int(max_tokens)}, 0, "
            f"{int(input_tokens)}, {int(output_tokens)}, {int(latency_ms)}, {esc(status)}, {esc(error_code)}, "
            f"{esc(prompt_checksum)}, {'TRUE' if full_available else 'FALSE'}, 'sandbox', {esc(s3_key)})"
        )
        conn.commit()
        return trace_uuid
    except Exception as e:
        print(f'[sandbox-trace] failed: {e}')
        return None


def action_traces_get(conn, trace_uuid: str) -> Dict[str, Any]:
    """Возвращает краткий trace из БД + полный trace из S3 (если доступен)."""
    cur = conn.cursor()
    cur.execute(
        f"SELECT trace_uuid, created_at, family_id, user_id, environment, role_code, "
        f"role_version_id, ai_config_id, entry_point, model, temperature, max_tokens, "
        f"history_depth, input_tokens, output_tokens, latency_ms, status, error_code, "
        f"prompt_checksum, full_trace_available, full_trace_s3_key, full_trace_reason "
        f"FROM {SCHEMA}.domovoy_prompt_traces WHERE trace_uuid = {esc(trace_uuid)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'trace_not_found'}
    cols = ['trace_uuid', 'created_at', 'family_id', 'user_id', 'environment', 'role_code',
            'role_version_id', 'ai_config_id', 'entry_point', 'model', 'temperature', 'max_tokens',
            'history_depth', 'input_tokens', 'output_tokens', 'latency_ms', 'status', 'error_code',
            'prompt_checksum', 'full_trace_available', 'full_trace_s3_key', 'full_trace_reason']
    short = dict(zip(cols, row))
    full = None
    if short.get('full_trace_available') and short.get('full_trace_s3_key'):
        full = read_full_trace(short['full_trace_s3_key'])
    return {'short': short, 'full': full}


def action_sandbox_run(conn, actor_id: Optional[int], env: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """Прогон вопроса через выбранную версию роли. Кошелёк НЕ списываем (это админский тестовый прогон).
    Записывает trace с full_trace_reason='sandbox'.
    """
    question = (body.get('question') or '').strip()
    if not question:
        return {'error': 'question_required'}

    version_id = body.get('version_id')
    role_code = body.get('role_code')

    # Резолвим версию: либо явная version_id, либо текущая published для role_code
    version = None
    if version_id:
        version = _fetch_version_by_id(conn, int(version_id))
        if not version:
            return {'error': 'version_not_found'}
    elif role_code:
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.domovoy_roles WHERE code = {esc(role_code)}")
        row = cur.fetchone()
        if not row:
            return {'error': 'role_not_found'}
        cur.execute(
            f"SELECT id FROM {SCHEMA}.domovoy_role_versions "
            f"WHERE role_id = {row[0]} AND environment = {esc(env)} AND status = 'published' LIMIT 1"
        )
        vrow = cur.fetchone()
        if not vrow:
            return {'error': 'no_published_version'}
        version = _fetch_version_by_id(conn, vrow[0])
    else:
        return {'error': 'version_id_or_role_code_required'}

    # AI Config для нужной среды
    ai_cfg = action_ai_config_get(conn, version['environment'])
    if not ai_cfg:
        return {'error': 'no_ai_config'}

    # Сборка финального prompt
    persona_kind = body.get('persona') or 'domovoy'
    persona_text = ai_cfg.get('persona_domovoy') if persona_kind == 'domovoy' else ai_cfg.get('persona_neutral')
    sandbox_context = body.get('extra_context') or ''
    final_prompt = _build_final_prompt(persona_text or '', version.get('role_prompt') or '', sandbox_context)
    prompt_checksum = hashlib.sha256(final_prompt.encode('utf-8')).hexdigest()[:32]

    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID') or 'b1gaglg8i7v2i32nvism'
    if not api_key:
        return {'error': 'no_api_key', 'message': 'YANDEX_GPT_API_KEY не настроен'}

    model_uri = ai_cfg['model_uri']
    if folder_id and '/' in model_uri:
        parts = model_uri.split('/')
        if len(parts) >= 4:
            parts[2] = folder_id
            model_uri = '/'.join(parts)

    temperature = float(ai_cfg.get('temperature') or 0.7)
    max_tokens = int(ai_cfg.get('max_tokens') or 3000)
    timeout_sec = int(ai_cfg.get('timeout_sec') or 30)

    yandex_messages = [
        {'role': 'system', 'text': final_prompt},
        {'role': 'user', 'text': question},
    ]
    payload = {
        'modelUri': model_uri,
        'completionOptions': {'stream': False, 'temperature': temperature, 'maxTokens': max_tokens},
        'messages': yandex_messages,
    }
    headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}

    input_tokens = _approx_tokens(final_prompt) + _approx_tokens(question)
    t0 = time.time()
    status = 'ok'
    error_code = None
    ai_text = ''
    raw_response_body: Any = None
    raw_response_status: Optional[int] = None
    try:
        resp = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers=headers, json=payload, timeout=timeout_sec
        )
        latency_ms = int((time.time() - t0) * 1000)
        raw_response_status = resp.status_code
        try:
            raw_response_body = resp.json()
        except Exception:
            raw_response_body = resp.text[:2000]
        if resp.status_code != 200:
            status = 'error'
            error_code = f'http_{resp.status_code}'
        else:
            ai_text = (raw_response_body or {}).get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
            if not ai_text:
                status = 'error'
                error_code = 'empty_response'
    except requests.exceptions.Timeout:
        latency_ms = int((time.time() - t0) * 1000)
        status = 'timeout'
        error_code = 'request_timeout'
    except Exception as e:
        latency_ms = int((time.time() - t0) * 1000)
        status = 'error'
        error_code = f'exception:{type(e).__name__}'

    output_tokens = _approx_tokens(ai_text)

    full_payload = {
        'kind': 'sandbox',
        'environment': env,
        'role': {'code': version['role_code'], 'name': version['role_name'], 'version_id': version['id'],
                 'version_number': version['version_number'], 'version_status': version['status'],
                 'version_env': version['environment']},
        'ai_config': {'id': ai_cfg.get('id'), 'provider': ai_cfg.get('provider'),
                      'model_uri': model_uri, 'temperature': temperature, 'max_tokens': max_tokens,
                      'timeout_sec': timeout_sec},
        'blocks': {
            'persona': persona_text or '',
            'role_prompt': version.get('role_prompt') or '',
            'extra_context': sandbox_context or '',
            'user_question': question,
        },
        'final_prompt': final_prompt,
        'prompt_checksum': prompt_checksum,
        'request': {
            'url': 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            'modelUri': model_uri,
            'completionOptions': {'stream': False, 'temperature': temperature, 'maxTokens': max_tokens},
            'messages': yandex_messages,
        },
        'response': {
            'status_code': raw_response_status,
            'body': raw_response_body,
            'text': ai_text,
        },
        'metrics': {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'latency_ms': latency_ms,
            'status': status,
            'error_code': error_code,
            'cost_rub': float(ai_cfg.get('price_rub') or 0),
        },
        'actor': {'user_id': actor_id, 'family_id': body.get('family_id')},
    }

    trace_id = write_sandbox_trace(
        conn, body.get('family_id'), actor_id, env, version['role_code'], version['id'],
        ai_cfg.get('id'), model_uri.split('/')[-1], temperature, max_tokens, prompt_checksum,
        input_tokens, output_tokens, latency_ms, status, error_code,
        full_payload=full_payload,
    )
    audit(conn, actor_id, 'sandbox_run', 'role_version', version['id'], env,
          f"role={version['role_code']} status={status}")

    return {
        'success': status == 'ok',
        'status': status,
        'error_code': error_code,
        'response': ai_text,
        'role': {'code': version['role_code'], 'name': version['role_name']},
        'version': {'id': version['id'], 'version_number': version['version_number'],
                    'environment': version['environment'], 'status': version['status']},
        'model': model_uri.split('/')[-1],
        'temperature': temperature,
        'max_tokens': max_tokens,
        'final_prompt': final_prompt,
        'prompt_checksum': prompt_checksum,
        'input_tokens': input_tokens,
        'output_tokens': output_tokens,
        'latency_ms': latency_ms,
        'cost_rub': float(ai_cfg.get('price_rub') or 0),
        'trace_uuid': trace_id,
    }


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
        f"SELECT trace_uuid, created_at, family_id, role_code, role_version_id, entry_point, model, "
        f"latency_ms, input_tokens, output_tokens, status, error_code, "
        f"full_trace_available, full_trace_reason "
        f"FROM {SCHEMA}.domovoy_prompt_traces "
        f"WHERE environment = {esc(env)} "
        f"ORDER BY created_at DESC LIMIT {int(limit)}"
    )
    cols = ['trace_uuid', 'created_at', 'family_id', 'role_code', 'role_version_id', 'entry_point', 'model',
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

        if action == 'versions.get':
            vid = params.get('version_id') or body.get('version_id')
            if not vid:
                return jr(400, {'error': 'version_id_required'})
            res = action_version_get(conn, int(vid))
            return jr(404 if res.get('error') else 200, res)

        if action == 'versions.compare':
            a_id = params.get('a') or body.get('a')
            b_id = params.get('b') or body.get('b')
            if not a_id or not b_id:
                return jr(400, {'error': 'a_and_b_required'})
            res = action_versions_compare(conn, int(a_id), int(b_id))
            return jr(404 if res.get('error') else 200, res)

        if action == 'sandbox.run':
            res = action_sandbox_run(conn, actor_id, env, body)
            return jr(200 if res.get('success') is not False else 200, res)

        if action == 'traces.get':
            trace_uuid = params.get('trace_uuid') or body.get('trace_uuid')
            if not trace_uuid:
                return jr(400, {'error': 'trace_uuid_required'})
            res = action_traces_get(conn, trace_uuid)
            return jr(404 if res.get('error') else 200, res)

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