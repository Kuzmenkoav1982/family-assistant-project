"""Loader for index.from_local_paths.

Strategy:
1. Caller provides repo (owner/repo), commit_sha, target_paths.
2. We fetch only the tree (1 call) and a small slice of blobs (target + neighbors).
3. Direct-imports: parse target files, resolve ./, ../ and @/ aliases.
4. App.tsx structural-only: drop /pages/* imports unless they are themselves targets.
5. Hard cap on total files to avoid runaway.
"""
import os
from typing import Any, Callable, Dict, List, Optional, Set, Tuple

from github_source import (
    GITHUB_API, MAX_FILE_BYTES, _headers, _http_get_json,
    fetch_blob, list_tree, resolve_commit,
)
from parsing import extract_imports
from alias_resolver import build_alias_map, is_structural_import, resolve_to_existing

MAX_NEIGHBORS = 20
MAX_TOTAL_FILES = 30


def _load_text(owner: str, repo: str, commit_sha: str, path: str,
               tree_by_path: Dict[str, Dict], token: Optional[str]) -> Tuple[Optional[str], Optional[Dict]]:
    t = tree_by_path.get(path)
    if not t:
        return None, {'status': 404, 'body': {'message': 'path_not_in_tree'}}
    if t.get('size', 0) > MAX_FILE_BYTES:
        return None, {'status': 413, 'body': {'message': 'too_large'}}
    return fetch_blob(owner, repo, t['sha'], token)


def load_files_from_local_paths(owner: str, repo: str, commit_sha_in: str,
                                target_paths: List[str],
                                include_direct_imports: bool = True,
                                app_import_mode: str = 'structural-only') -> Dict[str, Any]:
    """End-to-end loader for from_local_paths.

    Returns dict with same shape as load_files_from_github plus:
      - target_paths, neighbor_paths, missing_paths
    """
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        return {'success': False, 'error': 'github_token_missing',
                'message': 'Добавь секрет GITHUB_TOKEN'}
    if not owner or not repo:
        return {'success': False, 'error': 'owner_repo_required'}
    if not commit_sha_in:
        return {'success': False, 'error': 'commit_sha_required'}
    if not isinstance(target_paths, list) or not target_paths:
        return {'success': False, 'error': 'target_paths_required'}

    # Resolve commit (allow short SHA / branch name as input)
    sha, msg, err = resolve_commit(owner, repo, commit_sha_in, token)
    if err:
        return {'success': False, 'error': 'resolve_commit_failed', 'detail': err}

    tree, err = list_tree(owner, repo, sha, token)
    if err:
        return {'success': False, 'error': 'list_tree_failed', 'detail': err}

    tree_by_path: Dict[str, Dict] = {t.get('path'): t for t in tree if t.get('path')}

    def path_exists(p: str) -> bool:
        return p in tree_by_path

    # ---- Load config files for alias map (best-effort, never fatal) ----
    tsconfig_text: Optional[str] = None
    vite_text: Optional[str] = None
    for cfg in ('tsconfig.json', 'tsconfig.app.json'):
        if cfg in tree_by_path:
            txt, _ = _load_text(owner, repo, sha, cfg, tree_by_path, token)
            if txt:
                tsconfig_text = txt
                break
    for cfg in ('vite.config.ts', 'vite.config.js'):
        if cfg in tree_by_path:
            txt, _ = _load_text(owner, repo, sha, cfg, tree_by_path, token)
            if txt:
                vite_text = txt
                break
    alias_map = build_alias_map(tsconfig_text, vite_text)

    # ---- Load targets ----
    loaded: Dict[str, str] = {}
    missing: List[Dict[str, Any]] = []
    target_set: Set[str] = set(target_paths)
    for p in target_paths:
        text, ferr = _load_text(owner, repo, sha, p, tree_by_path, token)
        if ferr or text is None:
            missing.append({'path': p, 'error': ferr or {'status': 404}})
            continue
        loaded[p] = text

    # ---- Resolve direct neighbors ----
    neighbor_paths: List[str] = []
    if include_direct_imports:
        seen: Set[str] = set(loaded.keys())
        for tp, text in list(loaded.items()):
            if not tp.endswith(('.ts', '.tsx', '.js', '.jsx')):
                continue
            imports = extract_imports(text)
            is_app = tp.endswith('App.tsx') and app_import_mode == 'structural-only'
            for imp in imports:
                resolved = resolve_to_existing(imp, tp, alias_map, path_exists)
                if not resolved:
                    continue
                if resolved in seen:
                    continue
                # App.tsx structural-only: skip page imports unless target
                if is_app and not is_structural_import(resolved):
                    if resolved not in target_set:
                        continue
                if len(neighbor_paths) >= MAX_NEIGHBORS:
                    break
                ntext, nerr = _load_text(owner, repo, sha, resolved, tree_by_path, token)
                if nerr or ntext is None:
                    continue
                loaded[resolved] = ntext
                neighbor_paths.append(resolved)
                seen.add(resolved)
            if len(neighbor_paths) >= MAX_NEIGHBORS:
                break

    if len(loaded) > MAX_TOTAL_FILES:
        # Hard cap — keep targets + first N neighbors.
        keep: Dict[str, str] = {}
        for p in target_paths:
            if p in loaded:
                keep[p] = loaded[p]
        for n in neighbor_paths:
            if len(keep) >= MAX_TOTAL_FILES:
                break
            if n in loaded:
                keep[n] = loaded[n]
        loaded = keep

    files_out: List[Dict[str, Any]] = []
    for path, text in loaded.items():
        t = tree_by_path.get(path) or {}
        files_out.append({
            'path': path,
            'content': text,
            'sha': t.get('sha'),
            'size': t.get('size', len(text or '')),
        })

    return {
        'success': True,
        'commit_sha': sha,
        'commit_message': msg,
        'files': files_out,
        'target_paths': list(target_paths),
        'neighbor_paths': neighbor_paths,
        'missing_paths': missing,
        'alias_sources': {
            'tsconfig': bool(tsconfig_text),
            'vite': bool(vite_text),
        },
    }
