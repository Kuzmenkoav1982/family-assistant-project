"""
Dev Agent Studio — backend. Stage 1, read-only.

Внутренний инженерный AI-агент для админки. На этом этапе:
- управление snapshot-индексами кода/БД
- поиск по файлам/символам/роутам/API
- сессии и сообщения (чат БЕЗ LLM)
- runs и tool_calls (audit-трасса любых вызовов)

Никаких patch-apply, PR, secret-доступа. Только read+sessions.
"""
import json
import os
import time
import uuid
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
    except Exception:
        return None


def audit(conn, actor_id: Optional[int], event_type: str, entity_type: str,
          entity_id: Optional[int], env: Optional[str], notes: Optional[str] = None):
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.domovoy_audit_log "
        f"(actor_user_id, event_type, entity_type, entity_id, environment, notes) "
        f"VALUES ({actor_id if actor_id else 'NULL'}, "
        f"{esc(event_type)}, {esc(entity_type)}, "
        f"{entity_id if entity_id else 'NULL'}, {esc(env)}, {esc(notes)})"
    )
    conn.commit()


# ============================================================
# Helpers
# ============================================================
def _active_snapshot(cur, env: str) -> Optional[int]:
    cur.execute(
        f"SELECT id FROM {SCHEMA}.dev_agent_repo_snapshots "
        f"WHERE environment = {esc(env)} AND is_active = TRUE "
        f"ORDER BY created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        f"SELECT id FROM {SCHEMA}.dev_agent_repo_snapshots "
        f"WHERE environment = {esc(env)} AND indexing_status = 'ready' "
        f"ORDER BY created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    return row[0] if row else None


def _active_db_snapshot(cur, env: str) -> Optional[int]:
    cur.execute(
        f"SELECT id FROM {SCHEMA}.dev_agent_db_snapshots "
        f"WHERE environment = {esc(env)} AND is_active = TRUE "
        f"ORDER BY captured_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        f"SELECT id FROM {SCHEMA}.dev_agent_db_snapshots "
        f"WHERE environment = {esc(env)} ORDER BY captured_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    return row[0] if row else None


# ============================================================
# Actions
# ============================================================
def action_overview(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    cur.execute(
        f"SELECT id, snapshot_uuid, commit_sha, commit_message, indexing_status, "
        f"files_count, chunks_count, symbols_count, routes_count, endpoints_count, "
        f"indexed_at, created_at, is_active "
        f"FROM {SCHEMA}.dev_agent_repo_snapshots WHERE environment = {esc(env)} "
        f"ORDER BY created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    snap = None
    if row:
        cols = ['id', 'snapshot_uuid', 'commit_sha', 'commit_message', 'indexing_status',
                'files_count', 'chunks_count', 'symbols_count', 'routes_count', 'endpoints_count',
                'indexed_at', 'created_at', 'is_active']
        snap = dict(zip(cols, row))

    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.dev_agent_runs "
        f"WHERE environment = {esc(env)} AND created_at > NOW() - INTERVAL '7 days'"
    )
    runs_7d = cur.fetchone()[0]
    cur.execute(
        f"SELECT COUNT(*) FROM {SCHEMA}.dev_agent_sessions "
        f"WHERE environment = {esc(env)} AND status = 'active'"
    )
    active_sessions = cur.fetchone()[0]

    cur.execute(
        f"SELECT code, environment, is_enabled FROM {SCHEMA}.domovoy_feature_flags "
        f"WHERE code LIKE 'dev_agent.%' AND environment = {esc(env)}"
    )
    flags = [{'code': r[0], 'env': r[1], 'enabled': r[2]} for r in cur.fetchall()]

    return {
        'environment': env,
        'active_snapshot': snap,
        'snapshot_id': snap_id,
        'metrics': {
            'runs_7d': runs_7d,
            'active_sessions': active_sessions,
        },
        'flags': flags,
    }


def action_config_get(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, environment, primary_model, fallback_model, repo_provider, repo_slug, "
        f"default_branch, snapshot_s3_prefix, max_context_chars, max_chunks, "
        f"patch_apply_mode, sandbox_enabled, updated_at "
        f"FROM {SCHEMA}.dev_agent_configs WHERE environment = {esc(env)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'config_not_found'}
    cols = ['id', 'environment', 'primary_model', 'fallback_model', 'repo_provider', 'repo_slug',
            'default_branch', 'snapshot_s3_prefix', 'max_context_chars', 'max_chunks',
            'patch_apply_mode', 'sandbox_enabled', 'updated_at']
    return dict(zip(cols, row))


def action_snapshots_list(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, snapshot_uuid, commit_sha, commit_message, branch_name, indexing_status, "
        f"files_count, chunks_count, symbols_count, routes_count, endpoints_count, "
        f"indexed_at, created_at, is_active "
        f"FROM {SCHEMA}.dev_agent_repo_snapshots WHERE environment = {esc(env)} "
        f"ORDER BY created_at DESC LIMIT 50"
    )
    cols = ['id', 'snapshot_uuid', 'commit_sha', 'commit_message', 'branch_name', 'indexing_status',
            'files_count', 'chunks_count', 'symbols_count', 'routes_count', 'endpoints_count',
            'indexed_at', 'created_at', 'is_active']
    items = [dict(zip(cols, r)) for r in cur.fetchall()]
    return {'items': items}


def action_search(conn, env: str, body: Dict[str, Any]) -> Dict[str, Any]:
    query = (body.get('query') or '').strip()
    if not query:
        return {'items': [], 'total': 0}
    filters = body.get('filters') or {}
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return {'items': [], 'total': 0, 'reason': 'no_snapshot'}

    items: List[Dict[str, Any]] = []
    q_like = '%' + query.replace("'", "''") + '%'

    # Files by path
    cur.execute(
        f"SELECT id, path, lang_code, file_category, line_count "
        f"FROM {SCHEMA}.dev_agent_files "
        f"WHERE snapshot_id = {snap_id} AND path ILIKE '{q_like}' "
        f"ORDER BY path LIMIT 20"
    )
    for r in cur.fetchall():
        items.append({
            'type': 'file',
            'file_id': r[0], 'path': r[1], 'language': r[2], 'category': r[3],
            'line_count': r[4], 'score': 1.0,
        })

    # Symbols
    cur.execute(
        f"SELECT s.id, s.symbol_name, s.symbol_kind, s.line_no, f.path "
        f"FROM {SCHEMA}.dev_agent_symbols s "
        f"JOIN {SCHEMA}.dev_agent_files f ON f.id = s.file_id "
        f"WHERE s.snapshot_id = {snap_id} AND s.symbol_name ILIKE '{q_like}' "
        f"ORDER BY s.symbol_name LIMIT 20"
    )
    for r in cur.fetchall():
        items.append({
            'type': 'symbol',
            'symbol_id': r[0], 'symbol_name': r[1], 'symbol_kind': r[2],
            'line_no': r[3], 'path': r[4], 'score': 0.95,
        })

    # Routes
    cur.execute(
        f"SELECT id, route_path, page_component, area "
        f"FROM {SCHEMA}.dev_agent_routes "
        f"WHERE snapshot_id = {snap_id} AND (route_path ILIKE '{q_like}' OR page_component ILIKE '{q_like}') "
        f"ORDER BY route_path LIMIT 10"
    )
    for r in cur.fetchall():
        items.append({
            'type': 'route',
            'route_id': r[0], 'route_path': r[1], 'page_component': r[2], 'area': r[3], 'score': 0.9,
        })

    # API endpoints
    cur.execute(
        f"SELECT id, function_name, action_name, http_method, endpoint_path "
        f"FROM {SCHEMA}.dev_agent_api_endpoints "
        f"WHERE snapshot_id = {snap_id} AND (function_name ILIKE '{q_like}' OR action_name ILIKE '{q_like}') "
        f"ORDER BY function_name LIMIT 10"
    )
    for r in cur.fetchall():
        items.append({
            'type': 'api',
            'api_id': r[0], 'function_name': r[1], 'action_name': r[2],
            'http_method': r[3], 'endpoint_path': r[4], 'score': 0.9,
        })

    # Code chunks (FTS by ILIKE on chunk_text)
    if filters.get('include_chunks', True):
        cur.execute(
            f"SELECT c.id, c.symbol_name, c.start_line, c.end_line, "
            f"substring(c.chunk_text from 1 for 200) AS snippet, f.path "
            f"FROM {SCHEMA}.dev_agent_code_chunks c "
            f"JOIN {SCHEMA}.dev_agent_files f ON f.id = c.file_id "
            f"WHERE c.snapshot_id = {snap_id} AND c.chunk_text ILIKE '{q_like}' "
            f"ORDER BY c.id LIMIT 10"
        )
        for r in cur.fetchall():
            items.append({
                'type': 'chunk',
                'chunk_id': r[0], 'symbol_name': r[1], 'start_line': r[2], 'end_line': r[3],
                'snippet': r[4], 'path': r[5], 'score': 0.7,
            })

    return {'items': items, 'total': len(items), 'snapshot_id': snap_id, 'query': query}


def action_files_tree(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return {'items': [], 'reason': 'no_snapshot'}
    cur.execute(
        f"SELECT id, path, lang_code, file_category, line_count, size_bytes "
        f"FROM {SCHEMA}.dev_agent_files WHERE snapshot_id = {snap_id} "
        f"ORDER BY path"
    )
    cols = ['id', 'path', 'language', 'category', 'line_count', 'size_bytes']
    items = [dict(zip(cols, r)) for r in cur.fetchall()]
    return {'items': items, 'snapshot_id': snap_id}


def action_files_get(conn, env: str, file_id: int) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, snapshot_id, path, lang_code, file_category, line_count, size_bytes, sha256, raw_s3_key "
        f"FROM {SCHEMA}.dev_agent_files WHERE id = {int(file_id)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'file_not_found'}
    cols = ['id', 'snapshot_id', 'path', 'language', 'category', 'line_count', 'size_bytes', 'sha256', 'raw_s3_key']
    data = dict(zip(cols, row))

    cur.execute(
        f"SELECT id, chunk_index, chunk_kind, symbol_name, start_line, end_line, "
        f"substring(chunk_text from 1 for 800) "
        f"FROM {SCHEMA}.dev_agent_code_chunks WHERE file_id = {int(file_id)} "
        f"ORDER BY chunk_index"
    )
    chunks = [{
        'id': r[0], 'chunk_index': r[1], 'chunk_kind': r[2], 'symbol_name': r[3],
        'start_line': r[4], 'end_line': r[5], 'preview': r[6],
    } for r in cur.fetchall()]

    cur.execute(
        f"SELECT id, symbol_name, symbol_kind, exported, line_no "
        f"FROM {SCHEMA}.dev_agent_symbols WHERE file_id = {int(file_id)} "
        f"ORDER BY line_no NULLS LAST, symbol_name"
    )
    syms = [{
        'id': r[0], 'symbol_name': r[1], 'symbol_kind': r[2], 'exported': r[3], 'line_no': r[4],
    } for r in cur.fetchall()]

    data['chunks'] = chunks
    data['symbols'] = syms
    return data


def action_symbols_find(conn, env: str, body: Dict[str, Any]) -> Dict[str, Any]:
    name = (body.get('name') or body.get('q') or '').strip()
    kind = body.get('kind')
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return {'items': []}
    where = [f"s.snapshot_id = {snap_id}"]
    if name:
        where.append(f"s.symbol_name ILIKE '%{name.replace(chr(39), chr(39)+chr(39))}%'")
    if kind:
        where.append(f"s.symbol_kind = {esc(kind)}")
    cur.execute(
        f"SELECT s.id, s.symbol_name, s.symbol_kind, s.exported, s.line_no, f.path "
        f"FROM {SCHEMA}.dev_agent_symbols s "
        f"JOIN {SCHEMA}.dev_agent_files f ON f.id = s.file_id "
        f"WHERE {' AND '.join(where)} ORDER BY s.symbol_name LIMIT 100"
    )
    items = [{
        'id': r[0], 'symbol_name': r[1], 'symbol_kind': r[2], 'exported': r[3],
        'line_no': r[4], 'path': r[5],
    } for r in cur.fetchall()]
    return {'items': items}


def action_routes_list(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return {'items': []}
    cur.execute(
        f"SELECT r.id, r.route_path, r.page_component, r.area, r.auth_scope, f.path "
        f"FROM {SCHEMA}.dev_agent_routes r "
        f"LEFT JOIN {SCHEMA}.dev_agent_files f ON f.id = r.source_file_id "
        f"WHERE r.snapshot_id = {snap_id} ORDER BY r.area, r.route_path"
    )
    items = [{
        'id': r[0], 'route_path': r[1], 'page_component': r[2], 'area': r[3],
        'auth_scope': r[4], 'source_path': r[5],
    } for r in cur.fetchall()]
    return {'items': items}


def action_api_list(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return {'items': []}
    cur.execute(
        f"SELECT a.id, a.function_name, a.action_name, a.http_method, a.endpoint_path, "
        f"a.auth_scope, f.path "
        f"FROM {SCHEMA}.dev_agent_api_endpoints a "
        f"LEFT JOIN {SCHEMA}.dev_agent_files f ON f.id = a.source_file_id "
        f"WHERE a.snapshot_id = {snap_id} ORDER BY a.function_name, a.action_name"
    )
    items = [{
        'id': r[0], 'function_name': r[1], 'action_name': r[2], 'http_method': r[3],
        'endpoint_path': r[4], 'auth_scope': r[5], 'source_path': r[6],
    } for r in cur.fetchall()]
    return {'items': items}


def action_db_tables_list(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    snap_id = _active_db_snapshot(cur, env)
    if not snap_id:
        return {'items': []}
    cur.execute(
        f"SELECT id, table_name, jsonb_array_length(columns_json), "
        f"jsonb_array_length(indexes_json), jsonb_array_length(foreign_keys_json) "
        f"FROM {SCHEMA}.dev_agent_db_tables WHERE db_snapshot_id = {snap_id} "
        f"ORDER BY table_name"
    )
    items = [{
        'id': r[0], 'table_name': r[1], 'columns_count': r[2],
        'indexes_count': r[3], 'fk_count': r[4],
    } for r in cur.fetchall()]
    return {'items': items, 'db_snapshot_id': snap_id}


def action_db_tables_get(conn, env: str, table_id: int) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, table_name, columns_json, indexes_json, foreign_keys_json, metadata "
        f"FROM {SCHEMA}.dev_agent_db_tables WHERE id = {int(table_id)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'table_not_found'}
    cols = ['id', 'table_name', 'columns_json', 'indexes_json', 'foreign_keys_json', 'metadata']
    return dict(zip(cols, row))


def action_sessions_list(conn, env: str, actor_id: Optional[int]) -> Dict[str, Any]:
    cur = conn.cursor()
    where = f"environment = {esc(env)}"
    if actor_id:
        where += f" AND (created_by = {actor_id} OR created_by IS NULL)"
    cur.execute(
        f"SELECT id, session_uuid, title, default_mode, status, last_run_at, created_at, updated_at "
        f"FROM {SCHEMA}.dev_agent_sessions WHERE {where} "
        f"ORDER BY updated_at DESC LIMIT 50"
    )
    cols = ['id', 'session_uuid', 'title', 'default_mode', 'status', 'last_run_at', 'created_at', 'updated_at']
    items = [dict(zip(cols, r)) for r in cur.fetchall()]
    return {'items': items}


def action_session_create(conn, env: str, actor_id: int, body: Dict[str, Any]) -> Dict[str, Any]:
    if not actor_id:
        return {'error': 'actor_required'}
    title = (body.get('title') or 'New session').strip()[:200]
    default_mode = body.get('default_mode') or 'explain'
    if default_mode not in ('explain', 'locate', 'plan', 'patch'):
        default_mode = 'explain'
    sess_uuid = str(uuid.uuid4())
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_sessions "
        f"(session_uuid, environment, title, default_mode, created_by) "
        f"VALUES ({esc(sess_uuid)}, {esc(env)}, {esc(title)}, {esc(default_mode)}, {actor_id}) "
        f"RETURNING id"
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    audit(conn, actor_id, 'dev_agent.session_created', 'dev_agent_session', new_id, env, title)
    return {'success': True, 'id': new_id, 'session_uuid': sess_uuid}


def action_session_get(conn, sess_id: int) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, session_uuid, environment, title, default_mode, status, "
        f"last_run_at, created_by, created_at, updated_at "
        f"FROM {SCHEMA}.dev_agent_sessions WHERE id = {int(sess_id)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'session_not_found'}
    cols = ['id', 'session_uuid', 'environment', 'title', 'default_mode', 'status',
            'last_run_at', 'created_by', 'created_at', 'updated_at']
    sess = dict(zip(cols, row))
    cur.execute(
        f"SELECT id, speaker, content_text, citations_json, metadata, created_at "
        f"FROM {SCHEMA}.dev_agent_messages WHERE session_id = {int(sess_id)} "
        f"ORDER BY created_at"
    )
    msgs = [{
        'id': r[0], 'speaker': r[1], 'content': r[2], 'citations': r[3],
        'metadata': r[4], 'created_at': r[5],
    } for r in cur.fetchall()]
    sess['messages'] = msgs
    return sess


def action_chat_send(conn, env: str, actor_id: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """В V1 — без LLM. Сохраняем user-сообщение, делаем поиск по индексу, возвращаем найденные
    цитаты + автоматически сгенерированный assistant-ответ-заглушку.
    """
    if not actor_id:
        return {'error': 'actor_required'}
    message = (body.get('message') or '').strip()
    if not message:
        return {'error': 'message_required'}
    mode = body.get('mode') or 'explain'
    sess_id = body.get('session_id')

    # auto-create session
    if not sess_id:
        sr = action_session_create(conn, env, actor_id, {
            'title': message[:80], 'default_mode': mode
        })
        sess_id = sr['id']

    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)

    # save user msg
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_messages "
        f"(session_id, speaker, content_text) "
        f"VALUES ({int(sess_id)}, 'asker', {esc(message)}) RETURNING id"
    )
    q_id = cur.fetchone()[0]
    conn.commit()

    # search index
    t0 = time.time()
    search = action_search(conn, env, {'query': message})
    latency_ms = int((time.time() - t0) * 1000)
    items = search.get('items', [])[:12]

    # build assistant stub
    if not items:
        answer_text = (
            f"Я нашёл активный snapshot, но по запросу «{message}» ничего не подобрал. "
            f"Попробуй уточнить — имя файла, компонента, action или таблицы БД. "
            f"LLM-режим в V1 отключён, пока работаю как технический поисковик."
        )
    else:
        top = items[:5]
        lines = [f"По запросу «{message}» нашёл {len(items)} совпадений. Топ-{len(top)}:"]
        for i, it in enumerate(top, 1):
            t = it.get('type')
            if t == 'file':
                lines.append(f"{i}. file · {it['path']} ({it.get('language') or '?'})")
            elif t == 'symbol':
                lines.append(f"{i}. {it['symbol_kind']} · {it['symbol_name']} → {it['path']}:{it.get('line_no') or '?'}")
            elif t == 'route':
                lines.append(f"{i}. route · {it['route_path']} → {it['page_component']} [{it['area']}]")
            elif t == 'api':
                lines.append(f"{i}. api · {it['function_name']}#{it.get('action_name') or '-'}")
            elif t == 'chunk':
                lines.append(f"{i}. code · {it['path']}:{it.get('start_line')}—{it.get('end_line')}")
        lines.append("")
        lines.append("LLM в V1 не подключён — здесь только grounded-поиск по индексу.")
        answer_text = "\n".join(lines)

    citations = [{
        'type': it.get('type'),
        'path': it.get('path') or it.get('route_path') or it.get('function_name'),
        'start_line': it.get('start_line') or it.get('line_no'),
        'end_line': it.get('end_line'),
        'symbol_name': it.get('symbol_name'),
        'snippet': it.get('snippet'),
    } for it in items[:8]]

    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_messages "
        f"(session_id, speaker, content_text, citations_json) "
        f"VALUES ({int(sess_id)}, 'assistant', {esc(answer_text)}, "
        f"{esc(json.dumps(citations, ensure_ascii=False))}::jsonb) RETURNING id"
    )
    a_id = cur.fetchone()[0]
    conn.commit()

    # save run
    run_uuid = str(uuid.uuid4())
    retrieval = {'total': len(items), 'top_types': list({it['type'] for it in items})}
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_runs "
        f"(run_uuid, session_id, question_msg_id, answer_msg_id, environment, snapshot_id, "
        f"mode, status, model, retrieval_summary, latency_ms, created_by) "
        f"VALUES ({esc(run_uuid)}, {int(sess_id)}, {q_id}, {a_id}, {esc(env)}, "
        f"{snap_id if snap_id else 'NULL'}, {esc(mode)}, 'ok', 'none', "
        f"{esc(json.dumps(retrieval))}::jsonb, {latency_ms}, {actor_id}) RETURNING id"
    )
    run_id = cur.fetchone()[0]

    # tool call: search.query
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_tool_calls "
        f"(run_id, tool_name, tool_input_json, tool_output_summary_json, latency_ms, status) "
        f"VALUES ({run_id}, 'search.query', "
        f"{esc(json.dumps({'query': message}))}::jsonb, "
        f"{esc(json.dumps({'count': len(items)}))}::jsonb, {latency_ms}, 'ok')"
    )

    # touch session
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_sessions SET last_run_at = NOW(), updated_at = NOW() "
        f"WHERE id = {int(sess_id)}"
    )
    conn.commit()
    audit(conn, actor_id, 'dev_agent.run_created', 'dev_agent_run', run_id, env,
          f"mode={mode} citations={len(citations)}")

    return {
        'success': True,
        'session_id': sess_id,
        'run_id': run_id,
        'run_uuid': run_uuid,
        'question_msg_id': q_id,
        'answer_msg_id': a_id,
        'answer': answer_text,
        'citations': citations,
        'retrieval': {
            'total': len(items),
            'snapshot_id': snap_id,
            'latency_ms': latency_ms,
        },
    }


def action_runs_list(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT r.id, r.run_uuid, r.session_id, r.mode, r.status, r.model, "
        f"r.input_tokens, r.output_tokens, r.latency_ms, r.created_at, s.title "
        f"FROM {SCHEMA}.dev_agent_runs r "
        f"LEFT JOIN {SCHEMA}.dev_agent_sessions s ON s.id = r.session_id "
        f"WHERE r.environment = {esc(env)} "
        f"ORDER BY r.created_at DESC LIMIT 50"
    )
    cols = ['id', 'run_uuid', 'session_id', 'mode', 'status', 'model',
            'input_tokens', 'output_tokens', 'latency_ms', 'created_at', 'session_title']
    items = [dict(zip(cols, r)) for r in cur.fetchall()]
    return {'items': items}


def action_run_get(conn, run_id: int) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, run_uuid, session_id, question_msg_id, answer_msg_id, environment, "
        f"snapshot_id, mode, status, model, prompt_checksum, retrieval_summary, plan_json, "
        f"input_tokens, output_tokens, latency_ms, error_code, full_trace_available, "
        f"full_trace_s3_key, created_by, created_at "
        f"FROM {SCHEMA}.dev_agent_runs WHERE id = {int(run_id)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'run_not_found'}
    cols = ['id', 'run_uuid', 'session_id', 'question_msg_id', 'answer_msg_id', 'environment',
            'snapshot_id', 'mode', 'status', 'model', 'prompt_checksum', 'retrieval_summary',
            'plan_json', 'input_tokens', 'output_tokens', 'latency_ms', 'error_code',
            'full_trace_available', 'full_trace_s3_key', 'created_by', 'created_at']
    run = dict(zip(cols, row))
    cur.execute(
        f"SELECT id, tool_name, tool_input_json, tool_output_summary_json, latency_ms, status, created_at "
        f"FROM {SCHEMA}.dev_agent_tool_calls WHERE run_id = {int(run_id)} ORDER BY created_at"
    )
    tcols = ['id', 'tool_name', 'tool_input', 'tool_output', 'latency_ms', 'status', 'created_at']
    tools = [dict(zip(tcols, r)) for r in cur.fetchall()]
    return {'run': run, 'tool_calls': tools}


# ============================================================
# Handler
# ============================================================
def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Dev Agent Studio admin API. Action-based handler.

    Stage 1: read-only индексация и поиск, чат без LLM.
    Все ответы — JSON. Все мутации логируются в domovoy_audit_log.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    raw_body = event.get('body') or ''
    body: Dict[str, Any] = {}
    if raw_body:
        try:
            body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        except Exception:
            body = {}

    action = params.get('action') or body.get('action') or ''
    env = (params.get('env') or body.get('env') or 'stage').lower()
    if env not in ('stage', 'prod'):
        env = 'stage'

    actor_id = get_actor_user_id(event)

    if not action:
        return jr(400, {'error': 'action_required'})

    try:
        conn = db()
        try:
            if action == 'overview.get':
                return jr(200, action_overview(conn, env))
            if action == 'config.get':
                return jr(200, action_config_get(conn, env))
            if action == 'snapshots.list':
                return jr(200, action_snapshots_list(conn, env))
            if action == 'search.query':
                return jr(200, action_search(conn, env, body))
            if action == 'files.tree':
                return jr(200, action_files_tree(conn, env))
            if action == 'files.get':
                fid = params.get('file_id') or body.get('file_id')
                if not fid:
                    return jr(400, {'error': 'file_id_required'})
                res = action_files_get(conn, env, int(fid))
                return jr(404 if res.get('error') else 200, res)
            if action == 'symbols.find':
                return jr(200, action_symbols_find(conn, env, body))
            if action == 'routes.list':
                return jr(200, action_routes_list(conn, env))
            if action == 'api.list':
                return jr(200, action_api_list(conn, env))
            if action == 'db.tables.list':
                return jr(200, action_db_tables_list(conn, env))
            if action == 'db.tables.get':
                tid = params.get('table_id') or body.get('table_id')
                if not tid:
                    return jr(400, {'error': 'table_id_required'})
                res = action_db_tables_get(conn, env, int(tid))
                return jr(404 if res.get('error') else 200, res)
            if action == 'sessions.list':
                return jr(200, action_sessions_list(conn, env, actor_id))
            if action == 'sessions.create':
                if not actor_id:
                    return jr(401, {'error': 'auth_required'})
                res = action_session_create(conn, env, actor_id, body)
                return jr(200 if res.get('success') else 400, res)
            if action == 'sessions.get':
                sid = params.get('session_id') or body.get('session_id')
                if not sid:
                    return jr(400, {'error': 'session_id_required'})
                res = action_session_get(conn, int(sid))
                return jr(404 if res.get('error') else 200, res)
            if action == 'chat.send':
                if not actor_id:
                    return jr(401, {'error': 'auth_required'})
                res = action_chat_send(conn, env, actor_id, body)
                return jr(200 if res.get('success') else 400, res)
            if action == 'runs.list':
                return jr(200, action_runs_list(conn, env))
            if action == 'runs.get':
                rid = params.get('run_id') or body.get('run_id')
                if not rid:
                    return jr(400, {'error': 'run_id_required'})
                res = action_run_get(conn, int(rid))
                return jr(404 if res.get('error') else 200, res)
            return jr(400, {'error': 'unknown_action', 'action': action})
        finally:
            conn.close()
    except Exception as e:
        return jr(500, {'error': 'internal', 'message': str(e)[:300]})