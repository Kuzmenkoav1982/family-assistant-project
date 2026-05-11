"""Dev Agent Indexer — V1.6.

Real ingestion: GitHub Trees API + manual snapshot fallback.

Actions:
- index.from_github     — load real files via GitHub API, chunk & extract, store
- index.from_snapshot   — accept manual JSON snapshot, ingest the same way
- index.status          — counts and status of latest snapshot
- index.activate_snapshot — activate specific snapshot by id

Legacy (kept for backward compat):
- seed.create
- seed.status
- snapshots.activate
"""
import json
import os
import time
import uuid
from typing import Any, Dict, List, Optional

import psycopg2

from parsing import (
    chunk_file, detect_category, detect_lang,
    extract_api_endpoints_from_func2url, extract_imports,
    extract_routes, extract_symbols, sha256_hex,
)
from github_source import load_files_from_github, DEFAULT_WHITELIST
from local_paths_loader import load_files_from_local_paths

SCHEMA = '"' + os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro') + '"'

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


def _get_actor(event: Dict[str, Any]) -> Optional[str]:
    """Extract acting user UUID from X-User-Id header.
    Returns canonical UUID string or None for system / anonymous calls.
    """
    h = event.get('headers') or {}
    raw = h.get('X-User-Id') or h.get('x-user-id') or h.get('x-userId')
    if not raw:
        return None
    try:
        from uuid import UUID
        return str(UUID(str(raw).strip()))
    except Exception:
        return None


# ============================================================
# Snapshot lifecycle
# ============================================================

def _create_snapshot(cur, env: str, branch: str, commit_sha: str, message: str,
                     source_kind: str, source_repo: Optional[str], source_ref: Optional[str],
                     source_meta: Dict[str, Any], actor_id: Optional[str]) -> int:
    snap_uuid = str(uuid.uuid4())
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_repo_snapshots "
        f"(snapshot_uuid, environment, branch_name, commit_sha, commit_message, "
        f"indexing_status, source_kind, source_repo, source_ref, source_meta, created_by) "
        f"VALUES ({esc(snap_uuid)}, {esc(env)}, {esc(branch)}, {esc(commit_sha)}, "
        f"{esc(message)}, 'running', {esc(source_kind)}, {esc(source_repo)}, "
        f"{esc(source_ref)}, {esc(json.dumps(source_meta, ensure_ascii=False))}::jsonb, "
        f"{esc(actor_id)}) RETURNING id"
    )
    return cur.fetchone()[0]


def _finalize_snapshot(cur, snap_id: int, env: str, counts: Dict[str, int],
                       status: str = 'ready', err: Optional[str] = None):
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET "
        f"indexing_status = {esc(status)}, "
        f"files_count = {int(counts.get('files', 0))}, "
        f"chunks_count = {int(counts.get('chunks', 0))}, "
        f"routes_count = {int(counts.get('routes', 0))}, "
        f"endpoints_count = {int(counts.get('endpoints', 0))}, "
        f"symbols_count = {int(counts.get('symbols', 0))}, "
        f"indexed_at = NOW(), "
        f"is_active = {'TRUE' if status == 'ready' else 'FALSE'}, "
        f"err_text = {esc(err)} "
        f"WHERE id = {snap_id}"
    )
    if status == 'ready':
        cur.execute(
            f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET is_active = FALSE "
            f"WHERE environment = {esc(env)} AND id <> {snap_id}"
        )


# ============================================================
# Ingestion — real files
# ============================================================

def _insert_file(cur, snap_id: int, path: str, content: str) -> int:
    lang = detect_lang(path)
    cat = detect_category(path)
    size = len(content.encode('utf-8'))
    lines = content.count('\n') + 1
    digest = sha256_hex(content)
    imports = extract_imports(content) if lang in ('typescript', 'tsx', 'javascript', 'jsx') else []
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_files "
        f"(snapshot_id, path, lang_code, file_category, size_bytes, line_count, sha256, imports) "
        f"VALUES ({snap_id}, {esc(path)}, {esc(lang)}, {esc(cat)}, {size}, {lines}, "
        f"{esc(digest)}, {esc(json.dumps(imports, ensure_ascii=False))}::jsonb) "
        f"ON CONFLICT (snapshot_id, path) DO UPDATE SET "
        f"lang_code = EXCLUDED.lang_code, file_category = EXCLUDED.file_category, "
        f"size_bytes = EXCLUDED.size_bytes, line_count = EXCLUDED.line_count, "
        f"sha256 = EXCLUDED.sha256, imports = EXCLUDED.imports "
        f"RETURNING id"
    )
    return cur.fetchone()[0]


def _insert_chunks(cur, snap_id: int, file_id: int, chunks: List[Dict[str, Any]]) -> int:
    n = 0
    for c in chunks:
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_code_chunks "
            f"(snapshot_id, file_id, chunk_index, chunk_kind, symbol_name, "
            f"start_line, end_line, token_estimate, chunk_text, sha256, lang_code, byte_size) "
            f"VALUES ({snap_id}, {file_id}, {int(c['chunk_index'])}, {esc(c['chunk_kind'])}, "
            f"{esc(c.get('symbol_name'))}, "
            f"{int(c['start_line']) if c.get('start_line') else 'NULL'}, "
            f"{int(c['end_line']) if c.get('end_line') else 'NULL'}, "
            f"{int(c.get('token_estimate') or 0)}, "
            f"{esc(c['chunk_text'])}, "
            f"{esc(c.get('sha256'))}, "
            f"{esc(c.get('lang_code'))}, "
            f"{int(c.get('byte_size') or 0)}) "
            f"ON CONFLICT (file_id, chunk_index) DO NOTHING"
        )
        n += 1
    return n


def _insert_symbols(cur, snap_id: int, file_id: int, symbols: List[Dict[str, Any]]) -> int:
    n = 0
    for s in symbols:
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_symbols "
            f"(snapshot_id, file_id, symbol_name, symbol_kind, exported, line_no) "
            f"VALUES ({snap_id}, {file_id}, {esc(s['symbol_name'])}, "
            f"{esc(s.get('symbol_kind') or 'other')}, "
            f"{'TRUE' if s.get('exported') else 'FALSE'}, "
            f"{int(s['line_no']) if s.get('line_no') else 'NULL'})"
        )
        n += 1
    return n


def _insert_routes(cur, snap_id: int, file_id: int, routes: List[Dict[str, Any]]) -> int:
    n = 0
    for r in routes:
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_routes "
            f"(snapshot_id, route_path, page_component, source_file_id, area, auth_scope) "
            f"VALUES ({snap_id}, {esc(r['route_path'])}, {esc(r.get('page_component'))}, "
            f"{file_id}, {esc(r.get('area') or 'public')}, {esc(r.get('auth_scope'))})"
        )
        n += 1
    return n


def _insert_api(cur, snap_id: int, file_id: Optional[int], endpoints: List[Dict[str, Any]]) -> int:
    n = 0
    for e in endpoints:
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_api_endpoints "
            f"(snapshot_id, function_name, action_name, http_method, endpoint_path, "
            f"source_file_id, auth_scope) "
            f"VALUES ({snap_id}, {esc(e['function_name'])}, {esc(e.get('action_name'))}, "
            f"{esc(e.get('http_method'))}, {esc(e.get('endpoint_path'))}, "
            f"{file_id if file_id else 'NULL'}, {esc(e.get('auth_scope'))})"
        )
        n += 1
    return n


def ingest_files(cur, snap_id: int, files: List[Dict[str, Any]]) -> Dict[str, int]:
    """Run full pipeline for a list of {path, content} files."""
    totals = {'files': 0, 'chunks': 0, 'symbols': 0, 'routes': 0, 'endpoints': 0}
    for f in files:
        path = f.get('path') or ''
        content = f.get('content') or ''
        if not path or not content:
            continue
        try:
            file_id = _insert_file(cur, snap_id, path, content)
        except Exception:
            continue
        totals['files'] += 1

        chunks = chunk_file(path, content)
        totals['chunks'] += _insert_chunks(cur, snap_id, file_id, chunks)

        symbols = extract_symbols(path, content)
        totals['symbols'] += _insert_symbols(cur, snap_id, file_id, symbols)

        routes = extract_routes(path, content)
        totals['routes'] += _insert_routes(cur, snap_id, file_id, routes)

        # func2url.json → api endpoints
        if path.endswith('func2url.json'):
            eps = extract_api_endpoints_from_func2url(content)
            totals['endpoints'] += _insert_api(cur, snap_id, file_id, eps)
    return totals


# ============================================================
# DB schema capture
# ============================================================

def _capture_db_snapshot(cur, env: str, actor_id: Optional[str]) -> int:
    schema_name = os.environ.get('MAIN_DB_SCHEMA', 't_p5815085_family_assistant_pro')
    cur.execute(
        f"INSERT INTO {SCHEMA}.dev_agent_db_snapshots "
        f"(environment, source_type, schema_name, created_by, is_active) "
        f"VALUES ({esc(env)}, 'live_db', {esc(schema_name)}, "
        f"{esc(actor_id)}, TRUE) RETURNING id"
    )
    db_snap_id = cur.fetchone()[0]
    cur.execute(
        f"UPDATE {SCHEMA}.dev_agent_db_snapshots SET is_active = FALSE "
        f"WHERE environment = {esc(env)} AND id <> {db_snap_id}"
    )
    cur.execute(
        f"SELECT table_name FROM information_schema.tables "
        f"WHERE table_schema = {esc(schema_name)} ORDER BY table_name"
    )
    tables = [r[0] for r in cur.fetchall()]
    for tname in tables:
        cur.execute(
            f"SELECT column_name, data_type, is_nullable, column_default "
            f"FROM information_schema.columns WHERE table_schema = {esc(schema_name)} "
            f"AND table_name = {esc(tname)} ORDER BY ordinal_position"
        )
        cols = [{'name': r[0], 'type': r[1], 'nullable': r[2] == 'YES', 'default': r[3]}
                for r in cur.fetchall()]
        cur.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_db_tables "
            f"(db_snapshot_id, table_name, columns_json) "
            f"VALUES ({db_snap_id}, {esc(tname)}, {esc(json.dumps(cols))}::jsonb) "
            f"ON CONFLICT DO NOTHING"
        )
    return db_snap_id


# ============================================================
# Actions — V1.6
# ============================================================

def action_index_from_github(conn, env: str, body: Dict[str, Any],
                             actor_id: Optional[str]) -> Dict[str, Any]:
    owner = body.get('owner')
    repo = body.get('repo')
    ref = body.get('ref') or 'main'
    whitelist = body.get('whitelist') or DEFAULT_WHITELIST
    extra_globs = body.get('extra_globs')
    max_files = int(body.get('max_files') or 40)
    if not owner or not repo:
        return {'success': False, 'error': 'owner_repo_required'}

    started = time.time()
    loaded = load_files_from_github(owner, repo, ref, whitelist, extra_globs, max_files)
    if not loaded.get('success'):
        return {'success': False, 'error': loaded.get('error'),
                'detail': loaded.get('detail') or loaded.get('message')}

    cur = conn.cursor()
    snap_id = _create_snapshot(
        cur, env=env, branch=ref,
        commit_sha=loaded['commit_sha'],
        message=loaded.get('commit_message') or '',
        source_kind='github',
        source_repo=f'{owner}/{repo}',
        source_ref=ref,
        source_meta={
            'total_in_tree': loaded.get('total_in_tree'),
            'requested_in_whitelist': loaded.get('requested_in_whitelist'),
            'errors': loaded.get('errors') or [],
        },
        actor_id=actor_id,
    )
    conn.commit()

    try:
        counts = ingest_files(cur, snap_id, loaded['files'])
        conn.commit()
        _capture_db_snapshot(cur, env, actor_id)
        _finalize_snapshot(cur, snap_id, env, counts, status='ready')
        conn.commit()
    except Exception as e:
        _finalize_snapshot(cur, snap_id, env, {}, status='failed', err=str(e)[:300])
        conn.commit()
        return {'success': False, 'error': 'ingest_failed', 'message': str(e)[:300],
                'snapshot_id': snap_id}

    return {
        'success': True,
        'snapshot_id': snap_id,
        'commit_sha': loaded['commit_sha'],
        'commit_message': loaded.get('commit_message'),
        'counts': counts,
        'fetch_errors': loaded.get('errors') or [],
        'elapsed_sec': round(time.time() - started, 2),
    }


def action_index_from_local_paths(conn, env: str, body: Dict[str, Any],
                                  actor_id: Optional[str]) -> Dict[str, Any]:
    """Fetch a small repo slice (targets + direct imports) and ingest it.

    Required body: repo ('owner/repo'), commit_sha, target_paths.
    Optional: include_direct_imports (default True), app_import_mode
    ('structural-only' | 'all', default 'structural-only'), activate_snapshot
    (default True).
    """
    repo_full = (body.get('repo') or '').strip()
    commit_sha = (body.get('commit_sha') or '').strip()
    target_paths = body.get('target_paths') or []
    include_neighbors = body.get('include_direct_imports', True)
    app_mode = body.get('app_import_mode') or 'structural-only'
    activate = body.get('activate_snapshot', True)
    branch = (body.get('branch') or '').strip() or None

    if not repo_full or '/' not in repo_full:
        return {'success': False, 'error': 'repo_required',
                'message': 'body.repo must be "owner/repo"'}
    if not commit_sha:
        return {'success': False, 'error': 'commit_sha_required'}
    if not isinstance(target_paths, list) or not target_paths:
        return {'success': False, 'error': 'target_paths_required'}

    owner, repo = repo_full.split('/', 1)
    started = time.time()
    loaded = load_files_from_local_paths(
        owner=owner, repo=repo, commit_sha_in=commit_sha,
        target_paths=target_paths,
        include_direct_imports=bool(include_neighbors),
        app_import_mode=app_mode,
    )
    if not loaded.get('success'):
        return {'success': False, 'error': loaded.get('error'),
                'detail': loaded.get('detail') or loaded.get('message')}

    cur = conn.cursor()
    snap_id = _create_snapshot(
        cur, env=env, branch=branch or commit_sha[:12],
        commit_sha=loaded['commit_sha'],
        message=loaded.get('commit_message') or '',
        source_kind='local_paths',
        source_repo=repo_full,
        source_ref=commit_sha,
        source_meta={
            'target_paths': loaded.get('target_paths') or [],
            'neighbor_paths': loaded.get('neighbor_paths') or [],
            'missing_paths': loaded.get('missing_paths') or [],
            'alias_sources': loaded.get('alias_sources') or {},
            'app_import_mode': app_mode,
        },
        actor_id=actor_id,
    )
    conn.commit()

    try:
        counts = ingest_files(cur, snap_id, loaded['files'])
        conn.commit()
        _capture_db_snapshot(cur, env, actor_id)
        _finalize_snapshot(cur, snap_id, env, counts,
                           status='ready' if activate else 'ready')
        if not activate:
            cur.execute(
                f"UPDATE {SCHEMA}.dev_agent_repo_snapshots SET is_active = FALSE "
                f"WHERE id = {snap_id}"
            )
        conn.commit()
    except Exception as e:
        _finalize_snapshot(cur, snap_id, env, {}, status='failed', err=str(e)[:300])
        conn.commit()
        return {'success': False, 'error': 'ingest_failed', 'message': str(e)[:300],
                'snapshot_id': snap_id}

    return {
        'success': True,
        'snapshot_id': snap_id,
        'commit_sha': loaded['commit_sha'],
        'commit_message': loaded.get('commit_message'),
        'counts': counts,
        'targets_loaded': len([p for p in loaded.get('target_paths') or []
                              if p not in {m.get('path') for m in loaded.get('missing_paths') or []}]),
        'neighbors_loaded': len(loaded.get('neighbor_paths') or []),
        'missing_paths': loaded.get('missing_paths') or [],
        'alias_sources': loaded.get('alias_sources') or {},
        'activated': bool(activate),
        'elapsed_sec': round(time.time() - started, 2),
    }


def action_index_from_snapshot(conn, env: str, body: Dict[str, Any],
                               actor_id: Optional[str]) -> Dict[str, Any]:
    branch = body.get('branch_name') or 'manual'
    commit_sha = body.get('commit_sha') or ('manual-' + uuid.uuid4().hex[:8])
    message = body.get('commit_message') or 'Manual snapshot'
    files = body.get('files') or []
    if not isinstance(files, list) or not files:
        return {'success': False, 'error': 'files_required'}

    cur = conn.cursor()
    snap_id = _create_snapshot(
        cur, env=env, branch=branch, commit_sha=commit_sha, message=message,
        source_kind='manual', source_repo=None, source_ref=None,
        source_meta={'files_provided': len(files)}, actor_id=actor_id,
    )
    conn.commit()

    try:
        counts = ingest_files(cur, snap_id, files)
        conn.commit()
        _capture_db_snapshot(cur, env, actor_id)
        _finalize_snapshot(cur, snap_id, env, counts, status='ready')
        conn.commit()
    except Exception as e:
        _finalize_snapshot(cur, snap_id, env, {}, status='failed', err=str(e)[:300])
        conn.commit()
        return {'success': False, 'error': 'ingest_failed', 'message': str(e)[:300]}

    return {'success': True, 'snapshot_id': snap_id, 'counts': counts,
            'commit_sha': commit_sha}


def action_index_status(conn, env: str) -> Dict[str, Any]:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, snapshot_uuid, commit_sha, commit_message, branch_name, indexing_status, "
        f"files_count, chunks_count, symbols_count, routes_count, endpoints_count, "
        f"is_active, indexed_at, created_at, source_kind, source_repo, source_ref, err_text "
        f"FROM {SCHEMA}.dev_agent_repo_snapshots WHERE environment = {esc(env)} "
        f"ORDER BY created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    if not row:
        return {'snapshot': None}
    cols = ['id', 'snapshot_uuid', 'commit_sha', 'commit_message', 'branch_name', 'indexing_status',
            'files_count', 'chunks_count', 'symbols_count', 'routes_count', 'endpoints_count',
            'is_active', 'indexed_at', 'created_at', 'source_kind', 'source_repo', 'source_ref',
            'err_text']
    return {'snapshot': dict(zip(cols, row))}


def action_activate_snapshot(conn, env: str, snap_id: int) -> Dict[str, Any]:
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


# ============================================================
# Legacy actions (seed.create / seed.status / snapshots.activate)
# kept for backward compat
# ============================================================

def action_seed_create(conn, env: str, body: Dict[str, Any], actor_id: Optional[str]) -> Dict[str, Any]:
    """Legacy: accept metadata-only seed (no real file contents)."""
    commit_sha = body.get('commit_sha') or 'seed-' + uuid.uuid4().hex[:8]
    message = body.get('commit_message') or 'Seed snapshot'
    cur = conn.cursor()
    snap_id = _create_snapshot(
        cur, env=env, branch=body.get('branch_name') or 'main',
        commit_sha=commit_sha, message=message,
        source_kind='seed', source_repo=None, source_ref=None,
        source_meta={}, actor_id=actor_id,
    )
    conn.commit()

    # legacy: files come as metadata (no content)
    legacy_files = body.get('files') or []
    cur2 = conn.cursor()
    counts = {'files': 0, 'chunks': 0, 'symbols': 0, 'routes': 0, 'endpoints': 0}
    for f in legacy_files:
        path = f.get('path')
        if not path:
            continue
        cur2.execute(
            f"INSERT INTO {SCHEMA}.dev_agent_files "
            f"(snapshot_id, path, lang_code, file_category, size_bytes, line_count) "
            f"VALUES ({snap_id}, {esc(path)}, {esc(f.get('language'))}, "
            f"{esc(f.get('category') or 'other')}, {int(f.get('size_bytes') or 0)}, "
            f"{int(f.get('line_count')) if f.get('line_count') else 'NULL'}) "
            f"ON CONFLICT (snapshot_id, path) DO NOTHING"
        )
        counts['files'] += 1
    conn.commit()
    _capture_db_snapshot(cur2, env, actor_id)
    _finalize_snapshot(cur2, snap_id, env, counts, status='ready')
    conn.commit()
    return {'success': True, 'snapshot_id': snap_id, 'counts': counts}


# ============================================================
# Handler
# ============================================================

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Dev Agent Indexer V1.6 — реальная индексация из GitHub или ручного snapshot.

    Поддерживаемые actions: index.from_github, index.from_snapshot, index.status,
    index.activate_snapshot, seed.create (legacy), seed.status, snapshots.activate.
    """
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
            if action == 'index.from_github':
                res = action_index_from_github(conn, env, body, actor_id)
                return jr(200 if res.get('success') else 400, res)
            if action == 'index.from_local_paths':
                res = action_index_from_local_paths(conn, env, body, actor_id)
                return jr(200 if res.get('success') else 400, res)
            if action == 'index.from_snapshot':
                res = action_index_from_snapshot(conn, env, body, actor_id)
                return jr(200 if res.get('success') else 400, res)
            if action in ('index.status', 'seed.status'):
                return jr(200, action_index_status(conn, env))
            if action in ('index.activate_snapshot', 'snapshots.activate'):
                sid = params.get('snapshot_id') or body.get('snapshot_id')
                if not sid:
                    return jr(400, {'error': 'snapshot_id_required'})
                return jr(200, action_activate_snapshot(conn, env, int(sid)))
            if action == 'seed.create':
                res = action_seed_create(conn, env, body, actor_id)
                return jr(200 if res.get('success') else 400, res)
            return jr(400, {'error': 'unknown_action', 'action': action})
        finally:
            conn.close()
    except Exception as e:
        return jr(500, {'error': 'internal', 'message': str(e)[:300]})