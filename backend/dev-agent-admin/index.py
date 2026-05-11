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
import hashlib
import re
from typing import Any, Dict, List, Optional, Tuple

import psycopg2
import requests

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


# ============================================================
# V1.5 — LLM-ответ через YandexGPT
# ============================================================
def _flag_enabled(cur, code: str, env: str) -> bool:
    cur.execute(
        f"SELECT is_enabled FROM {SCHEMA}.domovoy_feature_flags "
        f"WHERE code = {esc(code)} AND environment = {esc(env)}"
    )
    row = cur.fetchone()
    return bool(row and row[0])


def _build_allowed_citations(conn, env: str, query: str, max_chunks: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Делает retrieval по dev_agent_* и формирует список allowed citations [c1..cN].
    Возвращает (allowed_list, retrieval_summary).
    """
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return [], {'snapshot_id': None, 'total': 0, 'reason': 'no_snapshot'}

    q_like = '%' + query.replace("'", "''") + '%'
    allowed: List[Dict[str, Any]] = []
    counters = {'files': 0, 'symbols': 0, 'routes': 0, 'api': 0, 'chunks': 0, 'db': 0}

    # 1. Code chunks (top 8)
    cur.execute(
        f"SELECT c.id, c.symbol_name, c.start_line, c.end_line, "
        f"substring(c.chunk_text from 1 for 1200), f.path "
        f"FROM {SCHEMA}.dev_agent_code_chunks c "
        f"JOIN {SCHEMA}.dev_agent_files f ON f.id = c.file_id "
        f"WHERE c.snapshot_id = {snap_id} AND c.chunk_text ILIKE '{q_like}' "
        f"ORDER BY c.id LIMIT {min(max_chunks, 8)}"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'chunk', 'file_path': r[5],
            'start_line': r[2], 'end_line': r[3],
            'symbol_name': r[1], 'snippet': r[4] or '',
            'reason': f"Код в {r[5]}" + (f" (символ {r[1]})" if r[1] else ''),
        })
        counters['chunks'] += 1

    # 2. Symbols (top 5)
    cur.execute(
        f"SELECT s.symbol_name, s.symbol_kind, s.line_no, f.path "
        f"FROM {SCHEMA}.dev_agent_symbols s "
        f"JOIN {SCHEMA}.dev_agent_files f ON f.id = s.file_id "
        f"WHERE s.snapshot_id = {snap_id} AND s.symbol_name ILIKE '{q_like}' "
        f"ORDER BY s.symbol_name LIMIT 5"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'symbol', 'file_path': r[3],
            'start_line': r[2], 'end_line': r[2],
            'symbol_name': r[0], 'snippet': f"{r[1]} {r[0]}",
            'reason': f"{r[1]} {r[0]} в {r[3]}",
        })
        counters['symbols'] += 1

    # 3. Files (top 5)
    cur.execute(
        f"SELECT id, path, lang_code, file_category "
        f"FROM {SCHEMA}.dev_agent_files "
        f"WHERE snapshot_id = {snap_id} AND path ILIKE '{q_like}' "
        f"ORDER BY path LIMIT 5"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'file', 'file_path': r[1],
            'start_line': None, 'end_line': None,
            'symbol_name': None, 'snippet': f"file: {r[1]} ({r[2]})",
            'reason': f"Файл {r[1]}",
        })
        counters['files'] += 1

    # 4. Routes (top 3)
    cur.execute(
        f"SELECT r.route_path, r.page_component, r.area, f.path "
        f"FROM {SCHEMA}.dev_agent_routes r "
        f"LEFT JOIN {SCHEMA}.dev_agent_files f ON f.id = r.source_file_id "
        f"WHERE r.snapshot_id = {snap_id} "
        f"AND (r.route_path ILIKE '{q_like}' OR r.page_component ILIKE '{q_like}') "
        f"ORDER BY r.route_path LIMIT 3"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'route', 'file_path': r[3] or 'src/App.tsx',
            'start_line': None, 'end_line': None, 'symbol_name': r[1],
            'snippet': f"route {r[0]} → {r[1]} [{r[2]}]",
            'reason': f"Роут {r[0]} → {r[1]}",
        })
        counters['routes'] += 1

    # 5. API endpoints (top 3)
    cur.execute(
        f"SELECT a.function_name, a.action_name, a.http_method, f.path "
        f"FROM {SCHEMA}.dev_agent_api_endpoints a "
        f"LEFT JOIN {SCHEMA}.dev_agent_files f ON f.id = a.source_file_id "
        f"WHERE a.snapshot_id = {snap_id} "
        f"AND (a.function_name ILIKE '{q_like}' OR a.action_name ILIKE '{q_like}') "
        f"ORDER BY a.function_name LIMIT 3"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'api', 'file_path': r[3] or f"backend/{r[0]}/index.py",
            'start_line': None, 'end_line': None, 'symbol_name': r[1],
            'snippet': f"api {r[0]}" + (f"#{r[1]}" if r[1] else ''),
            'reason': f"Endpoint {r[0]}" + (f"#{r[1]}" if r[1] else ''),
        })
        counters['api'] += 1

    # 6. DB tables (top 3) — берём имена по name match
    cur.execute(
        f"SELECT t.id, t.table_name "
        f"FROM {SCHEMA}.dev_agent_db_tables t "
        f"WHERE t.table_name ILIKE '{q_like}' "
        f"ORDER BY t.table_name LIMIT 3"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'db_table', 'file_path': f"db:{r[1]}",
            'start_line': None, 'end_line': None, 'symbol_name': r[1],
            'snippet': f"table {r[1]}",
            'reason': f"Таблица БД {r[1]}",
        })
        counters['db'] += 1

    # назначаем citation_id
    for i, c in enumerate(allowed, 1):
        c['citation_id'] = f'c{i}'

    summary = {
        'snapshot_id': snap_id, 'total': len(allowed),
        'breakdown': counters, 'query': query,
    }
    return allowed, summary


def _build_llm_prompt(mode: str, message: str, allowed: List[Dict[str, Any]],
                     max_context_chars: int) -> str:
    """Собирает финальный prompt по слоям 1-7 из ТЗ."""
    mode_contracts = {
        'explain': (
            "Задача: объяснить, как устроен указанный участок проекта.\n"
            "Нужно: дать сжатое объяснение, сослаться на самые важные цитаты, "
            "назвать ключевые файлы."
        ),
        'locate': (
            "Задача: найти, где находится или используется сущность.\n"
            "Нужно: назвать основные релевантные места, кратко объяснить, "
            "почему они подходят, сослаться на цитаты."
        ),
    }
    mode_text = mode_contracts.get(mode, mode_contracts['explain'])

    system = (
        "Ты — внутренний технический AI-агент проекта.\n"
        "Ты помогаешь разработчику разбираться в кодовой базе.\n\n"
        "Правила:\n"
        "1. Отвечай только на основе переданного контекста.\n"
        "2. Не выдумывай файлы, маршруты, таблицы, функции и строки.\n"
        "3. Используй только разрешённые citation_id (c1..cN).\n"
        "4. Если данных недостаточно — явно напиши об этом и поставь confidence=low.\n"
        "5. Ответ должен быть кратким, техническим и полезным.\n"
        "6. Верни только JSON без markdown, без ```json, без пояснений вне JSON."
    )

    cit_lines = []
    for c in allowed:
        lines = ''
        if c.get('start_line'):
            lines = f":{c['start_line']}"
            if c.get('end_line') and c['end_line'] != c['start_line']:
                lines += f"-{c['end_line']}"
        cit_lines.append(f"[{c['citation_id']}] {c['file_path']}{lines} — {c['reason']}")
    citations_block = "\n".join(cit_lines) or "(контекст пуст — данных нет)"

    # Снизим контекстный бюджет
    ctx_lines = []
    used = 0
    for c in allowed:
        snippet = (c.get('snippet') or '').strip()
        if not snippet:
            continue
        block = f"\n[{c['citation_id']}]\n{snippet}\n"
        if used + len(block) > max_context_chars:
            break
        ctx_lines.append(block)
        used += len(block)
    context_block = "".join(ctx_lines) or "(контекст пуст)"

    schema_block = (
        "Верни JSON строго по схеме:\n"
        "{\n"
        '  "answer": "string — краткий технический ответ",\n'
        '  "citation_ids": ["c1", "c2"],\n'
        '  "confidence": "low | medium | high"\n'
        "}"
    )

    return (
        f"{system}\n\n"
        f"=== РЕЖИМ ===\n{mode_text}\n\n"
        f"=== РАЗРЕШЁННЫЕ ЦИТАТЫ ===\n{citations_block}\n\n"
        f"=== КОНТЕКСТ ===\n{context_block}\n\n"
        f"=== ВОПРОС ПОЛЬЗОВАТЕЛЯ ===\n{message}\n\n"
        f"=== ВЫВОД ===\n{schema_block}"
    )


def _call_yandex_gpt_dev(prompt: str, user_msg: str, model_uri: str,
                       timeout_sec: int = 25) -> Dict[str, Any]:
    """Вызов YandexGPT. Возвращает dict {status, text, latency_ms, error_code, raw, input_tokens_approx}."""
    api_key = os.environ.get('YANDEX_GPT_API_KEY')
    folder_id = os.environ.get('YANDEX_FOLDER_ID') or 'b1gaglg8i7v2i32nvism'
    if not api_key:
        return {'status': 'error', 'error_code': 'no_api_key', 'text': '',
                'latency_ms': 0, 'raw': None, 'input_tokens_approx': 0}

    if '/' in model_uri:
        parts = model_uri.split('/')
        if len(parts) >= 4:
            parts[2] = folder_id
            model_uri = '/'.join(parts)

    payload = {
        'modelUri': model_uri,
        'completionOptions': {'stream': False, 'temperature': 0.2, 'maxTokens': 1500},
        'messages': [
            {'role': 'system', 'text': prompt},
            {'role': 'user', 'text': user_msg},
        ],
    }
    headers = {'Authorization': f'Api-Key {api_key}', 'Content-Type': 'application/json'}
    t0 = time.time()
    try:
        resp = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
            headers=headers, json=payload, timeout=timeout_sec,
        )
        latency_ms = int((time.time() - t0) * 1000)
        try:
            raw_body = resp.json()
        except Exception:
            raw_body = {'_text': resp.text[:1500]}
        if resp.status_code != 200:
            return {'status': 'error', 'error_code': f'http_{resp.status_code}',
                    'text': '', 'latency_ms': latency_ms, 'raw': raw_body,
                    'input_tokens_approx': len(prompt) // 4}
        text = (raw_body or {}).get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', '')
        if not text:
            return {'status': 'error', 'error_code': 'empty_response',
                    'text': '', 'latency_ms': latency_ms, 'raw': raw_body,
                    'input_tokens_approx': len(prompt) // 4}
        return {'status': 'ok', 'error_code': None, 'text': text,
                'latency_ms': latency_ms, 'raw': raw_body,
                'input_tokens_approx': len(prompt) // 4}
    except requests.exceptions.Timeout:
        return {'status': 'timeout', 'error_code': 'request_timeout',
                'text': '', 'latency_ms': int((time.time() - t0) * 1000),
                'raw': None, 'input_tokens_approx': len(prompt) // 4}
    except Exception as e:
        return {'status': 'error', 'error_code': f'exception:{type(e).__name__}',
                'text': '', 'latency_ms': int((time.time() - t0) * 1000),
                'raw': None, 'input_tokens_approx': len(prompt) // 4}


def _parse_llm_json(text: str) -> Optional[Dict[str, Any]]:
    """Парсит ответ модели — пытается выделить JSON-объект."""
    if not text:
        return None
    # уберём markdown-обёртку
    cleaned = text.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    # ищем первый { ... }
    m = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None


def _validate_llm_response(parsed: Optional[Dict[str, Any]],
                          allowed_ids: List[str]) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    """Возвращает (ok, error_code, normalized)."""
    if not parsed:
        return False, 'invalid_model_json', {}
    if not isinstance(parsed, dict):
        return False, 'not_object', {}
    answer = parsed.get('answer')
    cit_ids = parsed.get('citation_ids')
    confidence = parsed.get('confidence') or 'medium'
    if not isinstance(answer, str) or not answer.strip():
        return False, 'empty_answer', {}
    if not isinstance(cit_ids, list) or not cit_ids:
        return False, 'no_citations', {}
    allowed_set = set(allowed_ids)
    valid_ids = [c for c in cit_ids if isinstance(c, str) and c in allowed_set]
    if not valid_ids:
        return False, 'invalid_citations', {}
    if confidence not in ('low', 'medium', 'high'):
        confidence = 'medium'
    if len(answer) > 8000:
        answer = answer[:8000]
    return True, None, {
        'answer': answer.strip(),
        'citation_ids': valid_ids[:8],
        'confidence': confidence,
    }


def _build_fallback(allowed: List[Dict[str, Any]], reason: str) -> Dict[str, Any]:
    """Серверный grounded-ответ, когда LLM недоступен или вернул мусор."""
    if not allowed:
        answer = (
            "LLM не использован. По запросу ничего не найдено в индексе — "
            "уточни имя файла, компонента, action или таблицы БД."
        )
        return {'answer': answer, 'citation_ids': [], 'confidence': 'low'}
    top = allowed[:3]
    files = sorted({c['file_path'] for c in top})
    file_list = ', '.join(files)
    answer = (
        f"LLM не использован ({reason}). Найдены релевантные места: {file_list}. "
        f"Открой цитаты справа для точной навигации."
    )
    return {
        'answer': answer,
        'citation_ids': [c['citation_id'] for c in top],
        'confidence': 'low',
    }


def _write_full_trace_s3(env: str, run_uuid: str, payload: Dict[str, Any]) -> Optional[str]:
    """Сохраняет полный trace в S3. Возвращает s3 key или None."""
    try:
        import boto3
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        key = f"dev-agent/traces/{env}/{run_uuid}.json"
        s3.put_object(
            Bucket='files', Key=key,
            Body=json.dumps(payload, ensure_ascii=False, default=str).encode('utf-8'),
            ContentType='application/json',
        )
        return key
    except Exception as e:
        print(f"[dev-agent] full trace save failed: {e}")
        return None


def action_chat_send_llm(conn, env: str, actor_id: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """V1.5 — chat с LLM. Retrieval → prompt → YandexGPT → validation → fallback."""
    if not actor_id:
        return {'error': 'auth_required'}
    message = (body.get('message') or '').strip()
    if not message:
        return {'error': 'message_required'}
    mode = body.get('mode') or 'explain'
    if mode not in ('explain', 'locate'):
        mode = 'explain'
    sess_id = body.get('session_id')
    debug = bool(body.get('debug'))
    include_ctx_preview = body.get('include_context_preview', True)

    cur = conn.cursor()
    llm_enabled = _flag_enabled(cur, 'dev_agent.llm_enabled', env)
    full_trace_enabled = _flag_enabled(cur, 'dev_agent.llm_debug_enabled', env)

    # config
    cfg = action_config_get(conn, env)
    max_chunks = int(body.get('max_chunks') or cfg.get('max_chunks') or 12)
    max_context_chars = int(cfg.get('max_context_chars') or 32000)
    primary_model = cfg.get('primary_model') or 'yandexgpt'
    model_uri = f"gpt://b1gaglg8i7v2i32nvism/{primary_model}/latest"

    # session
    if not sess_id:
        sr = action_session_create(conn, env, actor_id, {
            'title': message[:80], 'default_mode': mode
        })
        sess_id = sr['id']

    # save user msg
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_messages "
        f"(session_id, speaker, content_text) "
        f"VALUES ({int(sess_id)}, 'asker', {esc(message)}) RETURNING id"
    )
    q_id = cur.fetchone()[0]
    conn.commit()

    audit(conn, actor_id, 'dev_agent.chat_llm_requested', 'dev_agent_session',
          int(sess_id), env, f"mode={mode}")

    tool_calls = []
    overall_t0 = time.time()

    # tool 1: search.query (retrieval)
    t_search = time.time()
    allowed, retrieval_summary = _build_allowed_citations(conn, env, message, max_chunks)
    tool_calls.append({
        'name': 'search.query',
        'input': {'query': message, 'max_chunks': max_chunks},
        'output': {'allowed_count': len(allowed), 'breakdown': retrieval_summary.get('breakdown')},
        'latency_ms': int((time.time() - t_search) * 1000),
        'status': 'ok',
    })

    # tool 2: context.build
    t_ctx = time.time()
    prompt = _build_llm_prompt(mode, message, allowed, max_context_chars)
    prompt_checksum = hashlib.sha256(prompt.encode('utf-8')).hexdigest()[:32]
    tool_calls.append({
        'name': 'context.build',
        'input': {'mode': mode, 'allowed_count': len(allowed)},
        'output': {'prompt_chars': len(prompt), 'prompt_checksum': prompt_checksum},
        'latency_ms': int((time.time() - t_ctx) * 1000),
        'status': 'ok',
    })

    # tool 3: llm.generate
    llm_result: Dict[str, Any] = {'status': 'skipped', 'error_code': 'llm_disabled',
                                   'text': '', 'latency_ms': 0,
                                   'input_tokens_approx': 0, 'raw': None}
    fallback_used = False
    fallback_reason: Optional[str] = None
    validated: Dict[str, Any] = {}

    if not llm_enabled:
        fallback_used = True
        fallback_reason = 'llm_disabled'
        tool_calls.append({
            'name': 'llm.generate', 'input': {'model': model_uri},
            'output': {'reason': 'llm_disabled'}, 'latency_ms': 0, 'status': 'skipped',
        })
    elif not allowed:
        fallback_used = True
        fallback_reason = 'empty_retrieval'
        tool_calls.append({
            'name': 'llm.generate', 'input': {'model': model_uri},
            'output': {'reason': 'no_context'}, 'latency_ms': 0, 'status': 'skipped',
        })
    else:
        llm_result = _call_yandex_gpt_dev(prompt, message, model_uri)
        tool_calls.append({
            'name': 'llm.generate',
            'input': {'model': model_uri, 'temperature': 0.2},
            'output': {'status': llm_result['status'], 'error_code': llm_result.get('error_code'),
                      'output_chars': len(llm_result.get('text') or '')},
            'latency_ms': llm_result['latency_ms'],
            'status': 'ok' if llm_result['status'] == 'ok' else 'error',
        })
        if llm_result['status'] != 'ok':
            fallback_used = True
            fallback_reason = llm_result.get('error_code') or 'llm_error'
        else:
            # tool 4: response.validate
            t_val = time.time()
            parsed = _parse_llm_json(llm_result['text'])
            allowed_ids = [c['citation_id'] for c in allowed]
            ok, err, norm = _validate_llm_response(parsed, allowed_ids)
            tool_calls.append({
                'name': 'response.validate',
                'input': {'allowed_count': len(allowed_ids)},
                'output': {'ok': ok, 'error': err},
                'latency_ms': int((time.time() - t_val) * 1000),
                'status': 'ok' if ok else 'error',
            })
            if not ok:
                fallback_used = True
                fallback_reason = err
            else:
                validated = norm

    # build final response (validated or fallback)
    if fallback_used:
        validated = _build_fallback(allowed, fallback_reason or 'unknown')

    # map citation_ids -> full objects
    by_id = {c['citation_id']: c for c in allowed}
    citations = []
    for cid in validated.get('citation_ids', []):
        c = by_id.get(cid)
        if c:
            citations.append({
                'citation_id': cid,
                'file_path': c['file_path'],
                'start_line': c.get('start_line'),
                'end_line': c.get('end_line'),
                'symbol_name': c.get('symbol_name'),
                'reason': c.get('reason'),
            })
    affected_files = sorted({c['file_path'] for c in citations})

    overall_latency = int((time.time() - overall_t0) * 1000)
    output_tokens = len(validated.get('answer') or '') // 4
    input_tokens = llm_result.get('input_tokens_approx') or (len(prompt) // 4)

    # save assistant msg
    cit_json = json.dumps(citations, ensure_ascii=False)
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_messages "
        f"(session_id, speaker, content_text, citations_json) "
        f"VALUES ({int(sess_id)}, 'assistant', {esc(validated.get('answer') or '')}, "
        f"{esc(cit_json)}::jsonb) RETURNING id"
    )
    a_id = cur.fetchone()[0]
    conn.commit()

    # snapshot id
    snap_id = retrieval_summary.get('snapshot_id')

    # full trace decision
    save_full = debug or full_trace_enabled or fallback_used or (llm_result.get('status') == 'error')
    full_trace_key: Optional[str] = None
    run_uuid_v = str(uuid.uuid4())
    if save_full:
        full_trace_key = _write_full_trace_s3(env, run_uuid_v, {
            'mode': mode, 'environment': env, 'prompt': prompt,
            'prompt_checksum': prompt_checksum,
            'message': message,
            'allowed_citations': allowed,
            'llm_raw': llm_result.get('raw'),
            'llm_text': llm_result.get('text'),
            'validated': validated,
            'fallback_used': fallback_used, 'fallback_reason': fallback_reason,
        })

    # final status
    if fallback_used:
        run_status = 'partial'
    elif llm_result.get('status') == 'ok':
        run_status = 'ok'
    else:
        run_status = 'partial'

    # save run
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_runs "
        f"(run_uuid, session_id, question_msg_id, answer_msg_id, environment, snapshot_id, "
        f"mode, status, model, prompt_checksum, retrieval_summary, "
        f"input_tokens, output_tokens, latency_ms, error_code, "
        f"full_trace_available, full_trace_s3_key, created_by) "
        f"VALUES ({esc(run_uuid_v)}, {int(sess_id)}, {q_id}, {a_id}, {esc(env)}, "
        f"{snap_id if snap_id else 'NULL'}, {esc(mode)}, {esc(run_status)}, "
        f"{esc(primary_model)}, {esc(prompt_checksum)}, "
        f"{esc(json.dumps(retrieval_summary))}::jsonb, "
        f"{input_tokens}, {output_tokens}, {overall_latency}, "
        f"{esc(fallback_reason)}, "
        f"{'TRUE' if full_trace_key else 'FALSE'}, "
        f"{esc(full_trace_key) if full_trace_key else 'NULL'}, "
        f"{actor_id}) RETURNING id"
    )
    run_id = cur.fetchone()[0]

    # save tool calls
    for tc in tool_calls:
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_tool_calls "
            f"(run_id, tool_name, tool_input_json, tool_output_summary_json, latency_ms, status) "
            f"VALUES ({run_id}, {esc(tc['name'])}, "
            f"{esc(json.dumps(tc.get('input') or {}))}::jsonb, "
            f"{esc(json.dumps(tc.get('output') or {}))}::jsonb, "
            f"{int(tc.get('latency_ms') or 0)}, {esc(tc['status'])})"
        )

    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_sessions SET last_run_at = NOW(), updated_at = NOW() "
        f"WHERE id = {int(sess_id)}"
    )
    conn.commit()

    audit_evt = 'dev_agent.chat_llm_fallback' if fallback_used else 'dev_agent.chat_llm_completed'
    audit(conn, actor_id, audit_evt, 'dev_agent_run', run_id, env,
          f"mode={mode} status={run_status} citations={len(citations)}")

    response: Dict[str, Any] = {
        'success': True,
        'session_id': sess_id,
        'run_id': run_id,
        'run_uuid': run_uuid_v,
        'answer': validated.get('answer'),
        'citations': citations,
        'affected_files': affected_files,
        'confidence': validated.get('confidence', 'low'),
        'run_meta': {
            'model': primary_model,
            'status': run_status,
            'latency_ms': overall_latency,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'fallback_used': fallback_used,
            'fallback_reason': fallback_reason,
            'llm_enabled': llm_enabled,
            'full_trace_s3_key': full_trace_key,
        },
    }
    if include_ctx_preview:
        response['context_preview'] = {
            'files': affected_files or sorted({c['file_path'] for c in allowed[:5]}),
            'chunks_count': retrieval_summary.get('breakdown', {}).get('chunks', 0),
            'total_allowed': len(allowed),
        }
    return response


def action_runs_list(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT r.id, r.run_uuid, r.session_id, r.mode, r.status, r.model, "
        f"r.input_tokens, r.output_tokens, r.latency_ms, r.created_at, s.title, "
        f"r.full_trace_available, r.error_code "
        f"FROM {SCHEMA}.dev_agent_runs r "
        f"LEFT JOIN {SCHEMA}.dev_agent_sessions s ON s.id = r.session_id "
        f"WHERE r.environment = {esc(env)} "
        f"ORDER BY r.created_at DESC LIMIT 50"
    )
    cols = ['id', 'run_uuid', 'session_id', 'mode', 'status', 'model',
            'input_tokens', 'output_tokens', 'latency_ms', 'created_at', 'session_title',
            'full_trace_available', 'error_code']
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


def action_run_trace_get(conn, run_id: int, actor_id: int, env: str) -> Dict[str, Any]:
    """Читает full trace из S3 по run_id. Только для админа."""
    if not actor_id:
        return {'error': 'auth_required'}
    cur = conn.cursor()
    cur.execute(
        f"SELECT run_uuid, full_trace_s3_key, full_trace_available, environment, model, status "
        f"FROM {SCHEMA}.dev_agent_runs WHERE id = {int(run_id)}"
    )
    row = cur.fetchone()
    if not row:
        return {'error': 'run_not_found'}
    run_uuid_v, s3_key, available, run_env, model, status = row
    if not available or not s3_key:
        return {'error': 'trace_not_available', 'run_uuid': run_uuid_v,
                'reason': 'Run выполнялся без full trace (включи dev_agent.llm_debug_enabled или debug=true)'}

    try:
        import boto3
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        obj = s3.get_object(Bucket='files', Key=s3_key)
        body = obj['Body'].read().decode('utf-8')
        trace = json.loads(body)
    except Exception as e:
        return {'error': 'trace_read_failed', 'message': str(e)[:300],
                'run_uuid': run_uuid_v, 's3_key': s3_key}

    audit(conn, actor_id, 'dev_agent.chat_llm_trace_opened', 'dev_agent_run',
          int(run_id), run_env, f"key={s3_key}")

    return {
        'success': True,
        'run_uuid': run_uuid_v,
        's3_key': s3_key,
        'environment': run_env,
        'model': model,
        'status': status,
        'trace': trace,
    }


# ============================================================
# V1.7 — review.file (file-centric review/improve with citations)
# ============================================================

_REVIEW_MODE_CONTRACTS = {
    'review': (
        "Задача: провести технический обзор файла.\n"
        "Нужно: выявить проблемы (issues), указать severity, кратко описать.\n"
        "Не предлагай поверхностный рефакторинг без обоснования."
    ),
    'improve': (
        "Задача: предложить план улучшений файла.\n"
        "Нужно: дать конкретные actionable рекомендации (suggestions) "
        "с приоритетом и оценкой impact. Выделить quick_wins."
    ),
}

_REVIEW_FOCUS_TIPS = {
    'readability': 'читаемость кода и именование',
    'architecture': 'разделение ответственности и связанность',
    'performance': 'избыточные ре-рендеры, тяжёлые операции',
    'state': 'управление состоянием, useState/useReducer',
    'types': 'TypeScript-типизация, any, unknown',
    'routing': 'маршрутизация и навигация',
    'forms': 'формы, валидация, контролируемые компоненты',
    'effects': 'useEffect, зависимости, side-effects',
    'api': 'работа с backend и обработка ошибок',
    'testing': 'тестируемость и изоляция логики',
}


def _build_review_citations(conn, env: str, file_path: str, max_chunks: int) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """File-centric retrieval для review.file.

    Источники:
      P1 — chunks целевого файла (до max_chunks-2)
      P1 — symbols целевого файла (до 5)
      P2 — routes, в которых файл встречается (до 2)
      P2 — api endpoints с этим source_file (до 2)
    """
    cur = conn.cursor()
    snap_id = _active_snapshot(cur, env)
    if not snap_id:
        return [], {'snapshot_id': None, 'total': 0, 'reason': 'no_snapshot',
                    'file_path': file_path}

    fp = file_path.replace("'", "''")
    cur.execute(
        f"SELECT id, lang_code, file_category, line_count, size_bytes "
        f"FROM {SCHEMA}.dev_agent_files "
        f"WHERE snapshot_id = {snap_id} AND path = '{fp}' LIMIT 1"
    )
    row = cur.fetchone()
    if not row:
        return [], {'snapshot_id': snap_id, 'total': 0,
                    'reason': 'file_not_in_snapshot', 'file_path': file_path}
    file_id, lang_code, category, line_count, size_bytes = row

    allowed: List[Dict[str, Any]] = []
    counters = {'chunks': 0, 'symbols': 0, 'routes': 0, 'api': 0}

    chunks_limit = max(2, min(max_chunks - 2, 10))
    cur.execute(
        f"SELECT id, chunk_kind, symbol_name, start_line, end_line, "
        f"substring(chunk_text from 1 for 1800), byte_size "
        f"FROM {SCHEMA}.dev_agent_code_chunks "
        f"WHERE snapshot_id = {snap_id} AND file_id = {file_id} "
        f"ORDER BY chunk_index LIMIT {chunks_limit}"
    )
    for r in cur.fetchall():
        sym = r[2]
        reason = f"Чанк {r[1]}"
        if sym:
            reason += f" ({sym})"
        if r[3] and r[4]:
            reason += f" [строки {r[3]}–{r[4]}]"
        allowed.append({
            'kind': 'chunk', 'file_path': file_path,
            'start_line': r[3], 'end_line': r[4], 'symbol_name': sym,
            'snippet': r[5] or '', 'reason': reason,
        })
        counters['chunks'] += 1

    cur.execute(
        f"SELECT symbol_name, symbol_kind, exported, line_no "
        f"FROM {SCHEMA}.dev_agent_symbols "
        f"WHERE snapshot_id = {snap_id} AND file_id = {file_id} "
        f"ORDER BY line_no NULLS LAST LIMIT 5"
    )
    for r in cur.fetchall():
        exp = 'exported ' if r[2] else ''
        allowed.append({
            'kind': 'symbol', 'file_path': file_path,
            'start_line': r[3], 'end_line': r[3], 'symbol_name': r[0],
            'snippet': f"{exp}{r[1]} {r[0]}",
            'reason': f"{exp}{r[1]} {r[0]}",
        })
        counters['symbols'] += 1

    cur.execute(
        f"SELECT route_path, page_component, area "
        f"FROM {SCHEMA}.dev_agent_routes "
        f"WHERE snapshot_id = {snap_id} AND source_file_id = {file_id} "
        f"ORDER BY route_path LIMIT 2"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'route', 'file_path': file_path,
            'start_line': None, 'end_line': None, 'symbol_name': r[1],
            'snippet': f"route {r[0]} → {r[1]} [{r[2]}]",
            'reason': f"Роут {r[0]} ведёт к {r[1]}",
        })
        counters['routes'] += 1

    cur.execute(
        f"SELECT function_name, action_name, http_method "
        f"FROM {SCHEMA}.dev_agent_api_endpoints "
        f"WHERE snapshot_id = {snap_id} AND source_file_id = {file_id} "
        f"ORDER BY function_name LIMIT 2"
    )
    for r in cur.fetchall():
        allowed.append({
            'kind': 'api', 'file_path': file_path,
            'start_line': None, 'end_line': None, 'symbol_name': r[1],
            'snippet': f"api {r[0]}" + (f"#{r[1]}" if r[1] else ''),
            'reason': f"Endpoint {r[0]}" + (f"#{r[1]}" if r[1] else ''),
        })
        counters['api'] += 1

    for i, c in enumerate(allowed, 1):
        c['citation_id'] = f'c{i}'

    summary = {
        'snapshot_id': snap_id, 'total': len(allowed),
        'breakdown': counters, 'file_path': file_path, 'file_id': file_id,
        'lang_code': lang_code, 'file_category': category,
        'line_count': line_count, 'size_bytes': size_bytes,
    }
    return allowed, summary


def _build_review_prompt(mode: str, file_path: str, focus: List[str],
                         allowed: List[Dict[str, Any]], max_context_chars: int) -> str:
    """Prompt для review.file."""
    mode_text = _REVIEW_MODE_CONTRACTS.get(mode, _REVIEW_MODE_CONTRACTS['review'])

    focus_text = ''
    if focus:
        tips = [f"- {f}: {_REVIEW_FOCUS_TIPS[f]}" for f in focus
                if f in _REVIEW_FOCUS_TIPS]
        if tips:
            focus_text = "Сфокусируйся на:\n" + "\n".join(tips)

    system = (
        "Ты — внутренний AI-ревьюер кода проекта.\n"
        "Твоя задача — проанализировать переданный файл и предложить полезные улучшения.\n\n"
        "Правила:\n"
        "1. Опирайся только на переданный контекст.\n"
        "2. Не выдумывай код, архитектуру и зависимости.\n"
        "3. Используй только разрешённые citation_id.\n"
        "4. Замечания должны быть техническими и конкретными.\n"
        "5. Не предлагай абстрактные советы без привязки к цитатам.\n"
        "6. Каждый issue/suggestion обязан иметь минимум 1 citation_id.\n"
        "7. Верни только JSON, без markdown, без ```json."
    )

    cit_lines = []
    for c in allowed:
        lines = ''
        if c.get('start_line'):
            lines = f":{c['start_line']}"
            if c.get('end_line') and c['end_line'] != c['start_line']:
                lines += f"-{c['end_line']}"
        cit_lines.append(f"[{c['citation_id']}] {c['file_path']}{lines} — {c['reason']}")
    citations_block = "\n".join(cit_lines) or "(контекст пуст)"

    ctx_lines = []
    used = 0
    for c in allowed:
        snippet = (c.get('snippet') or '').strip()
        if not snippet:
            continue
        block = f"\n[{c['citation_id']}]\n{snippet}\n"
        if used + len(block) > max_context_chars:
            break
        ctx_lines.append(block)
        used += len(block)
    context_block = "".join(ctx_lines) or "(контекст пуст)"

    schema_block = (
        "Верни JSON строго по схеме:\n"
        "{\n"
        '  "summary": "string — 1-3 предложения о файле",\n'
        '  "issues": [\n'
        '    {"id": "i1", "title": "...", "severity": "low|medium|high",\n'
        '     "description": "...", "citation_ids": ["c1"]}\n'
        '  ],\n'
        '  "suggestions": [\n'
        '    {"id": "s1", "title": "...", "priority": "low|medium|high",\n'
        '     "impact": "low|medium|high", "description": "...",\n'
        '     "citation_ids": ["c1"]}\n'
        '  ],\n'
        '  "quick_wins": ["string", "string"],\n'
        '  "confidence": "low|medium|high"\n'
        "}"
    )

    head = f"{system}\n\n=== РЕЖИМ ===\n{mode_text}\n"
    if focus_text:
        head += f"{focus_text}\n"
    head += "\n"

    return (
        f"{head}"
        f"=== ЦЕЛЕВОЙ ФАЙЛ ===\n{file_path}\n\n"
        f"=== РАЗРЕШЁННЫЕ ЦИТАТЫ ===\n{citations_block}\n\n"
        f"=== КОНТЕКСТ ===\n{context_block}\n\n"
        f"=== ВЫВОД ===\n{schema_block}"
    )


def _validate_review_response(parsed: Optional[Dict[str, Any]],
                              allowed_ids: List[str]) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    """Валидация структурированного review-ответа."""
    if not parsed:
        return False, 'invalid_model_json', {}
    if not isinstance(parsed, dict):
        return False, 'not_object', {}
    summary = parsed.get('summary')
    issues = parsed.get('issues')
    suggestions = parsed.get('suggestions')
    quick_wins = parsed.get('quick_wins')
    confidence = parsed.get('confidence') or 'medium'

    if not isinstance(summary, str) or not summary.strip():
        return False, 'empty_summary', {}
    if not isinstance(issues, list):
        issues = []
    if not isinstance(suggestions, list):
        suggestions = []
    if not isinstance(quick_wins, list):
        quick_wins = []
    if confidence not in ('low', 'medium', 'high'):
        confidence = 'medium'

    allowed_set = set(allowed_ids)

    def _normalize_item(it: Any, kind: str) -> Optional[Dict[str, Any]]:
        if not isinstance(it, dict):
            return None
        title = it.get('title')
        desc = it.get('description')
        cits = it.get('citation_ids')
        if not isinstance(title, str) or not title.strip():
            return None
        if not isinstance(desc, str) or not desc.strip():
            return None
        if not isinstance(cits, list):
            return None
        valid_cits = [c for c in cits if isinstance(c, str) and c in allowed_set]
        if not valid_cits:
            return None
        out = {
            'id': str(it.get('id') or ''),
            'title': title.strip()[:300],
            'description': desc.strip()[:1500],
            'citation_ids': valid_cits[:4],
        }
        if kind == 'issue':
            sev = it.get('severity')
            out['severity'] = sev if sev in ('low', 'medium', 'high') else 'medium'
        else:
            pr = it.get('priority')
            im = it.get('impact')
            out['priority'] = pr if pr in ('low', 'medium', 'high') else 'medium'
            out['impact'] = im if im in ('low', 'medium', 'high') else 'medium'
        return out

    norm_issues = [x for x in (_normalize_item(i, 'issue') for i in issues[:8]) if x]
    norm_suggs = [x for x in (_normalize_item(s, 'sugg') for s in suggestions[:8]) if x]
    norm_quick = [str(q).strip()[:300] for q in quick_wins[:6]
                  if isinstance(q, str) and q.strip()]

    # Хотя бы один issue ИЛИ suggestion с валидными citations
    if not norm_issues and not norm_suggs:
        return False, 'no_grounded_items', {}

    # auto-assign ids if missing
    for idx, it in enumerate(norm_issues, 1):
        if not it['id']:
            it['id'] = f'i{idx}'
    for idx, it in enumerate(norm_suggs, 1):
        if not it['id']:
            it['id'] = f's{idx}'

    return True, None, {
        'summary': summary.strip()[:3000],
        'issues': norm_issues,
        'suggestions': norm_suggs,
        'quick_wins': norm_quick,
        'confidence': confidence,
    }


def _build_review_fallback(allowed: List[Dict[str, Any]], reason: str,
                           file_path: str) -> Dict[str, Any]:
    """Grounded fallback для review.file."""
    if not allowed:
        return {
            'summary': (
                f"LLM недоступен ({reason}). Файл {file_path} не найден в индексе или "
                "не содержит чанков. Проверь, что snapshot собран с реальным содержимым."
            ),
            'issues': [],
            'suggestions': [],
            'quick_wins': ['Проверить наличие файла в активном snapshot',
                          'Запустить индексацию из GitHub'],
            'confidence': 'low',
        }
    top = allowed[:3]
    cits = [c['citation_id'] for c in top]
    return {
        'summary': (
            f"LLM недоступен ({reason}). Показан grounded fallback по найденным "
            f"участкам файла {file_path}. Открой citations для ручного ревью."
        ),
        'issues': [],
        'suggestions': [{
            'id': 's1',
            'title': 'Проверить ключевые участки файла вручную',
            'priority': 'medium',
            'impact': 'medium',
            'description': (
                'Открой указанные цитаты — это основные чанки/символы файла. '
                'Проверь их на разделение ответственности, типизацию и размер компонента.'
            ),
            'citation_ids': cits[:3],
        }],
        'quick_wins': [
            'Открыть top citations',
            'Проверить размер компонента',
            'Проверить количество useState/useEffect',
        ],
        'confidence': 'low',
    }


def action_review_file(conn, env: str, actor_id: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """V1.7 — структурированный review/improve файла с цитатами."""
    if not actor_id:
        return {'error': 'auth_required'}
    file_path = (body.get('file_path') or '').strip()
    if not file_path:
        return {'error': 'file_path_required'}
    mode = body.get('mode') or 'review'
    if mode not in ('review', 'improve'):
        mode = 'review'
    focus_raw = body.get('focus') or []
    focus = [f for f in focus_raw if isinstance(f, str) and f in _REVIEW_FOCUS_TIPS][:5]
    sess_id = body.get('session_id')
    debug = bool(body.get('debug'))

    cur = conn.cursor()
    llm_enabled = _flag_enabled(cur, 'dev_agent.llm_enabled', env)
    full_trace_enabled = _flag_enabled(cur, 'dev_agent.llm_debug_enabled', env)

    cfg = action_config_get(conn, env)
    max_chunks = int(body.get('max_chunks') or 10)
    max_context_chars = int(cfg.get('max_context_chars') or 32000)
    primary_model = cfg.get('primary_model') or 'yandexgpt'
    model_uri = f"gpt://b1gaglg8i7v2i32nvism/{primary_model}/latest"

    if not sess_id:
        sr = action_session_create(conn, env, actor_id, {
            'title': f"[{mode}] {file_path}"[:80], 'default_mode': 'explain',
        })
        sess_id = sr['id']

    user_msg = f"{mode}: {file_path}"
    if focus:
        user_msg += f" (focus: {', '.join(focus)})"

    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_messages "
        f"(session_id, speaker, content_text) "
        f"VALUES ({int(sess_id)}, 'asker', {esc(user_msg)}) RETURNING id"
    )
    q_id = cur.fetchone()[0]
    conn.commit()

    audit(conn, actor_id, 'dev_agent.review_file_requested', 'dev_agent_session',
          int(sess_id), env, f"mode={mode} path={file_path}")

    tool_calls = []
    overall_t0 = time.time()

    # 1. file-centric retrieval
    t_r = time.time()
    allowed, retrieval_summary = _build_review_citations(conn, env, file_path, max_chunks)
    tool_calls.append({
        'name': 'review.retrieve',
        'input': {'file_path': file_path, 'max_chunks': max_chunks},
        'output': {'allowed_count': len(allowed),
                   'breakdown': retrieval_summary.get('breakdown'),
                   'file_in_snapshot': retrieval_summary.get('reason') != 'file_not_in_snapshot'},
        'latency_ms': int((time.time() - t_r) * 1000),
        'status': 'ok' if allowed else 'empty',
    })

    # 2. prompt build
    t_p = time.time()
    prompt = _build_review_prompt(mode, file_path, focus, allowed, max_context_chars)
    prompt_checksum = hashlib.sha256(prompt.encode('utf-8')).hexdigest()[:32]
    tool_calls.append({
        'name': 'review.context',
        'input': {'mode': mode, 'focus': focus, 'allowed_count': len(allowed)},
        'output': {'prompt_chars': len(prompt), 'prompt_checksum': prompt_checksum},
        'latency_ms': int((time.time() - t_p) * 1000),
        'status': 'ok',
    })

    # 3. LLM call
    llm_result: Dict[str, Any] = {'status': 'skipped', 'error_code': 'llm_disabled',
                                   'text': '', 'latency_ms': 0,
                                   'input_tokens_approx': 0, 'raw': None}
    fallback_used = False
    fallback_reason: Optional[str] = None
    validated: Dict[str, Any] = {}

    if not llm_enabled:
        fallback_used = True
        fallback_reason = 'llm_disabled'
        tool_calls.append({'name': 'review.llm', 'input': {'model': model_uri},
                          'output': {'reason': 'llm_disabled'}, 'latency_ms': 0,
                          'status': 'skipped'})
    elif not allowed:
        fallback_used = True
        fallback_reason = retrieval_summary.get('reason') or 'empty_retrieval'
        tool_calls.append({'name': 'review.llm', 'input': {'model': model_uri},
                          'output': {'reason': fallback_reason}, 'latency_ms': 0,
                          'status': 'skipped'})
    else:
        llm_result = _call_yandex_gpt_dev(prompt, user_msg, model_uri)
        tool_calls.append({
            'name': 'review.llm',
            'input': {'model': model_uri, 'temperature': 0.2},
            'output': {'status': llm_result['status'],
                      'error_code': llm_result.get('error_code'),
                      'output_chars': len(llm_result.get('text') or '')},
            'latency_ms': llm_result['latency_ms'],
            'status': 'ok' if llm_result['status'] == 'ok' else 'error',
        })
        if llm_result['status'] != 'ok':
            fallback_used = True
            fallback_reason = llm_result.get('error_code') or 'llm_error'
        else:
            t_v = time.time()
            parsed = _parse_llm_json(llm_result['text'])
            allowed_ids = [c['citation_id'] for c in allowed]
            ok, err, norm = _validate_review_response(parsed, allowed_ids)
            tool_calls.append({
                'name': 'review.validate',
                'input': {'allowed_count': len(allowed_ids)},
                'output': {'ok': ok, 'error': err,
                          'issues': len(norm.get('issues') or []),
                          'suggestions': len(norm.get('suggestions') or [])},
                'latency_ms': int((time.time() - t_v) * 1000),
                'status': 'ok' if ok else 'error',
            })
            if not ok:
                fallback_used = True
                fallback_reason = err
            else:
                validated = norm

    if fallback_used:
        validated = _build_review_fallback(allowed, fallback_reason or 'unknown', file_path)

    # citations enrichment
    by_id = {c['citation_id']: c for c in allowed}
    used_cit_ids: List[str] = []
    for it in (validated.get('issues') or []) + (validated.get('suggestions') or []):
        for cid in it.get('citation_ids') or []:
            if cid not in used_cit_ids:
                used_cit_ids.append(cid)
    citations_out = []
    for cid in used_cit_ids:
        c = by_id.get(cid)
        if c:
            citations_out.append({
                'citation_id': cid,
                'file_path': c['file_path'],
                'start_line': c.get('start_line'),
                'end_line': c.get('end_line'),
                'symbol_name': c.get('symbol_name'),
                'reason': c.get('reason'),
            })
    affected_files = sorted({c['file_path'] for c in citations_out}) or [file_path]

    overall_latency = int((time.time() - overall_t0) * 1000)
    answer_text = (
        f"[{mode}] {file_path}\n\n"
        f"{validated.get('summary', '')}\n\n"
        f"Issues: {len(validated.get('issues') or [])}, "
        f"Suggestions: {len(validated.get('suggestions') or [])}"
    )
    output_tokens = len(answer_text) // 4
    input_tokens = llm_result.get('input_tokens_approx') or (len(prompt) // 4)

    cit_json = json.dumps(citations_out, ensure_ascii=False)
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_messages "
        f"(session_id, speaker, content_text, citations_json) "
        f"VALUES ({int(sess_id)}, 'assistant', {esc(answer_text)}, "
        f"{esc(cit_json)}::jsonb) RETURNING id"
    )
    a_id = cur.fetchone()[0]
    conn.commit()

    snap_id = retrieval_summary.get('snapshot_id')

    save_full = debug or full_trace_enabled or fallback_used or (llm_result.get('status') == 'error')
    full_trace_key: Optional[str] = None
    run_uuid_v = str(uuid.uuid4())
    if save_full:
        full_trace_key = _write_full_trace_s3(env, run_uuid_v, {
            'mode': mode, 'environment': env, 'prompt': prompt,
            'prompt_checksum': prompt_checksum,
            'file_path': file_path, 'focus': focus,
            'allowed_citations': allowed,
            'llm_raw': llm_result.get('raw'),
            'llm_text': llm_result.get('text'),
            'validated': validated,
            'fallback_used': fallback_used,
            'fallback_reason': fallback_reason,
            'action': 'review.file',
        })

    if fallback_used:
        run_status = 'partial'
    elif llm_result.get('status') == 'ok':
        run_status = 'ok'
    else:
        run_status = 'partial'

    review_mode_db = f"review_{mode}"  # review_review / review_improve
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_runs "
        f"(run_uuid, session_id, question_msg_id, answer_msg_id, environment, snapshot_id, "
        f"mode, status, model, prompt_checksum, retrieval_summary, "
        f"input_tokens, output_tokens, latency_ms, error_code, "
        f"full_trace_available, full_trace_s3_key, created_by) "
        f"VALUES ({esc(run_uuid_v)}, {int(sess_id)}, {q_id}, {a_id}, {esc(env)}, "
        f"{snap_id if snap_id else 'NULL'}, {esc(review_mode_db)}, {esc(run_status)}, "
        f"{esc(primary_model)}, {esc(prompt_checksum)}, "
        f"{esc(json.dumps(retrieval_summary))}::jsonb, "
        f"{input_tokens}, {output_tokens}, {overall_latency}, "
        f"{esc(fallback_reason)}, "
        f"{'TRUE' if full_trace_key else 'FALSE'}, "
        f"{esc(full_trace_key) if full_trace_key else 'NULL'}, "
        f"{actor_id}) RETURNING id"
    )
    run_id = cur.fetchone()[0]

    for tc in tool_calls:
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_tool_calls "
            f"(run_id, tool_name, tool_input_json, tool_output_summary_json, latency_ms, status) "
            f"VALUES ({run_id}, {esc(tc['name'])}, "
            f"{esc(json.dumps(tc['input'], ensure_ascii=False))}::jsonb, "
            f"{esc(json.dumps(tc['output'], ensure_ascii=False))}::jsonb, "
            f"{int(tc['latency_ms'])}, {esc(tc['status'])})"
        )
    conn.commit()

    return {
        'success': True,
        'ok': True,
        'session_id': int(sess_id),
        'run_id': run_id,
        'file_path': file_path,
        'mode': mode,
        'focus': focus,
        'summary': validated.get('summary') or '',
        'issues': validated.get('issues') or [],
        'suggestions': validated.get('suggestions') or [],
        'quick_wins': validated.get('quick_wins') or [],
        'confidence': validated.get('confidence') or 'low',
        'citations': citations_out,
        'affected_files': affected_files,
        'context_preview': {
            'files': [file_path],
            'chunks_count': retrieval_summary.get('breakdown', {}).get('chunks', 0),
            'allowed_count': len(allowed),
        },
        'run_meta': {
            'model': primary_model,
            'status': run_status,
            'latency_ms': overall_latency,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'fallback_used': fallback_used,
            'fallback_reason': fallback_reason,
            'full_trace_available': bool(full_trace_key),
        },
    }


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
            if action == 'chat.send_llm':
                if not actor_id:
                    return jr(401, {'error': 'auth_required'})
                res = action_chat_send_llm(conn, env, actor_id, body)
                return jr(200 if res.get('success') else 400, res)
            if action in ('review.file', 'review.by_path'):
                if not actor_id:
                    return jr(401, {'error': 'auth_required'})
                res = action_review_file(conn, env, actor_id, body)
                return jr(200 if res.get('success') else 400, res)
            if action == 'runs.list':
                return jr(200, action_runs_list(conn, env))
            if action == 'runs.get':
                rid = params.get('run_id') or body.get('run_id')
                if not rid:
                    return jr(400, {'error': 'run_id_required'})
                res = action_run_get(conn, int(rid))
                return jr(404 if res.get('error') else 200, res)
            if action == 'runs.trace':
                if not actor_id:
                    return jr(401, {'error': 'auth_required'})
                rid = params.get('run_id') or body.get('run_id')
                if not rid:
                    return jr(400, {'error': 'run_id_required'})
                res = action_run_trace_get(conn, int(rid), actor_id, env)
                if res.get('error') == 'run_not_found':
                    return jr(404, res)
                if res.get('error') == 'trace_not_available':
                    return jr(404, res)
                if res.get('error'):
                    return jr(400, res)
                return jr(200, res)
            return jr(400, {'error': 'unknown_action', 'action': action})
        finally:
            conn.close()
    except Exception as e:
        return jr(500, {'error': 'internal', 'message': str(e)[:300]})