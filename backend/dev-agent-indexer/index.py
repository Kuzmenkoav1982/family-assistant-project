"""
Dev Agent Indexer — V1, минимальная заглушка.

Создаёт пустой snapshot и затем seed-инициализация:
- регистрирует known-список API endpoints из переданного func2url.json
- регистрирует known-список routes (передаётся клиентом)
- создаёт db_snapshot из information_schema текущей PostgreSQL базы
- помечает snapshot как active

actions:
- seed.create  — создаёт новый snapshot (commit_sha — текстовая метка) и наполняет его
- seed.status  — статус последнего snapshot
- snapshots.activate — активирует конкретный snapshot
"""
import json
import os
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


def _get_actor(event: Dict[str, Any]) -> Optional[int]:
    h = event.get('headers') or {}
    uid = h.get('X-User-Id') or h.get('x-user-id')
    try:
        return int(uid) if uid else None
    except Exception:
        return None


def _create_snapshot(cur, env: str, commit_sha: str, message: str, actor_id: Optional[int]) -> int:
    snap_uuid = str(uuid.uuid4())
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_repo_snapshots "
        f"(snapshot_uuid, environment, branch_name, commit_sha, commit_message, indexing_status, created_by) "
        f"VALUES ({esc(snap_uuid)}, {esc(env)}, 'main', {esc(commit_sha)}, {esc(message)}, "
        f"'running', {actor_id if actor_id else 'NULL'}) RETURNING id"
    )
    return cur.fetchone()[0]


def _ingest_files(cur, snap_id: int, files: List[Dict[str, Any]]) -> int:
    count = 0
    for f in files:
        path = f.get('path')
        if not path:
            continue
        lang = f.get('language')
        cat = f.get('category') or 'other'
        size = int(f.get('size_bytes') or 0)
        lines = f.get('line_count')
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_files "
            f"(snapshot_id, path, lang_code, file_category, size_bytes, line_count) "
            f"VALUES ({snap_id}, {esc(path)}, {esc(lang)}, {esc(cat)}, {size}, "
            f"{lines if lines is not None else 'NULL'}) "
            f"ON CONFLICT (snapshot_id, path) DO NOTHING"
        )
        count += 1
    return count


def _ingest_routes(cur, snap_id: int, routes: List[Dict[str, Any]]) -> int:
    count = 0
    for r in routes:
        route_path = r.get('route_path') or r.get('path')
        if not route_path:
            continue
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_routes "
            f"(snapshot_id, route_path, page_component, area, auth_scope) "
            f"VALUES ({snap_id}, {esc(route_path)}, {esc(r.get('page_component'))}, "
            f"{esc(r.get('area') or 'public')}, {esc(r.get('auth_scope'))})"
        )
        count += 1
    return count


def _ingest_api(cur, snap_id: int, endpoints: List[Dict[str, Any]]) -> int:
    count = 0
    for e in endpoints:
        fn = e.get('function_name')
        if not fn:
            continue
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_api_endpoints "
            f"(snapshot_id, function_name, action_name, http_method, endpoint_path, auth_scope) "
            f"VALUES ({snap_id}, {esc(fn)}, {esc(e.get('action_name'))}, "
            f"{esc(e.get('http_method'))}, {esc(e.get('endpoint_path') or e.get('url'))}, "
            f"{esc(e.get('auth_scope'))})"
        )
        count += 1
    return count


def _ingest_symbols(cur, snap_id: int, symbols: List[Dict[str, Any]], path_to_file_id: Dict[str, int]) -> int:
    count = 0
    for s in symbols:
        path = s.get('path')
        fid = path_to_file_id.get(path)
        if not fid:
            continue
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_symbols "
            f"(snapshot_id, file_id, symbol_name, symbol_kind, exported, line_no) "
            f"VALUES ({snap_id}, {fid}, {esc(s.get('symbol_name'))}, "
            f"{esc(s.get('symbol_kind') or 'other')}, "
            f"{'TRUE' if s.get('exported') else 'FALSE'}, "
            f"{int(s.get('line_no')) if s.get('line_no') is not None else 'NULL'})"
        )
        count += 1
    return count


def _capture_db_snapshot(cur, env: str, actor_id: Optional[int]) -> int:
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_db_snapshots "
        f"(environment, source_type, schema_name, created_by, is_active) "
        f"VALUES ({esc(env)}, 'live_db', 't_p5815085_family_assistant_pro', "
        f"{actor_id if actor_id else 'NULL'}, TRUE) RETURNING id"
    )
    db_snap_id = cur.fetchone()[0]
    # сбросим прошлые active
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_db_snapshots SET is_active = FALSE "
        f"WHERE environment = {esc(env)} AND id <> {db_snap_id}"
    )

    cur.execute(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema = 't_p5815085_family_assistant_pro' "
        "ORDER BY table_name"
    )
    tables = [r[0] for r in cur.fetchall()]

    for tname in tables:
        cur.execute(
            "SELECT column_name, data_type, is_nullable, column_default "
            "FROM information_schema.columns "
            "WHERE table_schema = 't_p5815085_family_assistant_pro' "
            f"AND table_name = {esc(tname)} ORDER BY ordinal_position"
        )
        cols = [{
            'name': r[0], 'type': r[1], 'nullable': r[2] == 'YES', 'default': r[3]
        } for r in cur.fetchall()]
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_db_tables "
            f"(db_snapshot_id, table_name, columns_json) "
            f"VALUES ({db_snap_id}, {esc(tname)}, {esc(json.dumps(cols))}::jsonb) "
            f"ON CONFLICT DO NOTHING"
        )
    return db_snap_id


def action_seed_create(conn, env: str, body: Dict[str, Any], actor_id: Optional[int]) -> Dict[str, Any]:
    commit_sha = body.get('commit_sha') or 'seed-' + uuid.uuid4().hex[:8]
    message = body.get('commit_message') or 'Seed snapshot'
    files = body.get('files') or []
    routes = body.get('routes') or []
    endpoints = body.get('endpoints') or []
    symbols = body.get('symbols') or []

    cur = conn.cursor()
    snap_id = _create_snapshot(cur, env, commit_sha, message, actor_id)

    files_added = _ingest_files(cur, snap_id, files)
    # path -> id map
    cur.execute(
        f"SELECT id, path FROM {SCHEMA}.dev_agent_files WHERE snapshot_id = {snap_id}"
    )
    path_to_id = {p: fid for fid, p in cur.fetchall()}

    routes_added = _ingest_routes(cur, snap_id, routes)
    api_added = _ingest_api(cur, snap_id, endpoints)
    symbols_added = _ingest_symbols(cur, snap_id, symbols, path_to_id)

    # finalize
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET "
        f"indexing_status = 'ready', "
        f"files_count = {files_added}, "
        f"routes_count = {routes_added}, "
        f"endpoints_count = {api_added}, "
        f"symbols_count = {symbols_added}, "
        f"indexed_at = NOW(), is_active = TRUE "
        f"WHERE id = {snap_id}"
    )
    # deactivate older snapshots
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET is_active = FALSE "
        f"WHERE environment = {esc(env)} AND id <> {snap_id}"
    )
    conn.commit()

    # capture live DB snapshot
    db_snap_id = _capture_db_snapshot(cur, env, actor_id)
    conn.commit()

    return {
        'success': True,
        'snapshot_id': snap_id,
        'commit_sha': commit_sha,
        'files_count': files_added,
        'routes_count': routes_added,
        'endpoints_count': api_added,
        'symbols_count': symbols_added,
        'db_snapshot_id': db_snap_id,
    }


def action_seed_status(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, snapshot_uuid, commit_sha, indexing_status, files_count, "
        f"chunks_count, symbols_count, routes_count, endpoints_count, is_active, indexed_at "
        f"FROM {SCHEMA}.dev_agent_repo_snapshots WHERE environment = {esc(env)} "
        f"ORDER BY created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    if not row:
        return {'snapshot': None}
    cols = ['id', 'snapshot_uuid', 'commit_sha', 'indexing_status', 'files_count',
            'chunks_count', 'symbols_count', 'routes_count', 'endpoints_count',
            'is_active', 'indexed_at']
    return {'snapshot': dict(zip(cols, row))}


def action_snapshots_activate(conn, env: str, snap_id: int) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET is_active = FALSE "
        f"WHERE environment = {esc(env)}"
    )
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET is_active = TRUE "
        f"WHERE id = {int(snap_id)} AND environment = {esc(env)}"
    )
    conn.commit()
    return {'success': True, 'snapshot_id': snap_id}


def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Dev Agent Indexer. Создаёт seed snapshot из переданных метаданных проекта,
    делает live snapshot БД и активирует свежий snapshot."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    raw = event.get('body') or ''
    body: Dict[str, Any] = {}
    if raw:
        try:
            body = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            body = {}

    action = params.get('action') or body.get('action') or ''
    env = (params.get('env') or body.get('env') or 'stage').lower()
    if env not in ('stage', 'prod'):
        env = 'stage'

    actor_id = _get_actor(event)

    if not action:
        return jr(400, {'error': 'action_required'})

    try:
        conn = db()
        try:
            if action == 'seed.create':
                res = action_seed_create(conn, env, body, actor_id)
                return jr(200 if res.get('success') else 400, res)
            if action == 'seed.status':
                return jr(200, action_seed_status(conn, env))
            if action == 'snapshots.activate':
                sid = params.get('snapshot_id') or body.get('snapshot_id')
                if not sid:
                    return jr(400, {'error': 'snapshot_id_required'})
                return jr(200, action_snapshots_activate(conn, env, int(sid)))
            return jr(400, {'error': 'unknown_action', 'action': action})
        finally:
            conn.close()
    except Exception as e:
        return jr(500, {'error': 'internal', 'message': str(e)[:300]})
