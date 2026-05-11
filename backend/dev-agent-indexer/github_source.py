"""V1.6 — GitHub source loader.

Strategy:
1. Resolve ref → commit SHA via /repos/{owner}/{repo}/commits/{ref}
2. Fetch tree (recursive) via /repos/{owner}/{repo}/git/trees/{sha}?recursive=1
3. Filter by whitelist (priority files) and exclude patterns
4. Download blobs via /repos/{owner}/{repo}/git/blobs/{sha} (base64) — one-by-one

Limits:
- Max files per snapshot: 40 (configurable)
- Skip files > 200KB
- Auth via GITHUB_TOKEN env

Returns list of {path, content, sha} dicts.
"""
import base64
import fnmatch
import json
import os
from typing import Any, Dict, List, Optional, Tuple
from urllib import request, error
from urllib.parse import quote

GITHUB_API = 'https://api.github.com'
MAX_FILE_BYTES = 200_000
MAX_FILES_PER_SNAPSHOT = 40
USER_AGENT = 'PoehaliDevAgent/1.6'

EXCLUDE_GLOBS = [
    'node_modules/*', '*/node_modules/*',
    'dist/*', '*/dist/*',
    'build/*', '*/build/*',
    '.next/*', '*/.next/*',
    'coverage/*', '*/coverage/*',
    'public/*',
    '*.map', '*.min.*',
    '*.test.*', '*.spec.*', '*.stories.*',
    'bun.lockb', 'package-lock.json',
]

DEFAULT_WHITELIST = [
    # Wave 1 — must
    'src/App.tsx',
    'src/main.tsx',
    'src/pages/ProfileNew.tsx',
    'src/pages/Settings.tsx',
    'src/pages/Pricing.tsx',
    'src/pages/DomovoyStudio.tsx',
    'src/pages/DevAgentStudio.tsx',
    'src/pages/AdminDashboard.tsx',
    'src/pages/AdminPanel.tsx',
    'src/pages/FamilyChat.tsx',
    'src/pages/FamilyWallet.tsx',
    'src/components/Sidebar.tsx',
    'src/components/FamilyMembersGrid.tsx',
    'src/components/TasksWidget.tsx',
    'src/components/MemberProfileQuestionnaire.tsx',
    'src/components/AIAssistantWidget.tsx',
    # Wave 2
    'src/pages/PlansSettings.tsx',
    'src/pages/AdminRatingCampaigns.tsx',
    'src/pages/AdminMAX.tsx',
    'src/pages/AdminValuation.tsx',
    'src/pages/AdminProjectV2.tsx',
    'src/pages/AdminMaxInstructions.tsx',
    'src/pages/Calendar.tsx',
    'src/pages/MarketingStrategy.tsx',
    'src/pages/MarketingSale.tsx',
    'src/pages/Recipes.tsx',
    'src/pages/Faith.tsx',
    'src/pages/Wisdom.tsx',
    # Always include
    'func2url.json',
]


def _headers(token: Optional[str]) -> Dict[str, str]:
    h = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': USER_AGENT,
    }
    if token:
        h['Authorization'] = f'Bearer {token}'
    return h


def _http_get_json(url: str, token: Optional[str], timeout: int = 20) -> Tuple[int, Any]:
    req = request.Request(url, headers=_headers(token))
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            data = resp.read().decode('utf-8')
            return resp.getcode(), json.loads(data)
    except error.HTTPError as e:
        try:
            payload = json.loads(e.read().decode('utf-8'))
        except Exception:
            payload = {'message': str(e)}
        return e.code, payload
    except Exception as e:
        return 599, {'message': str(e)[:200]}


def _match_any(path: str, globs: List[str]) -> bool:
    return any(fnmatch.fnmatch(path, g) for g in globs)


def resolve_commit(owner: str, repo: str, ref: str, token: Optional[str]) -> Tuple[Optional[str], Optional[str], Optional[Dict]]:
    """Return (commit_sha, message, error_dict)."""
    url = f'{GITHUB_API}/repos/{quote(owner)}/{quote(repo)}/commits/{quote(ref)}'
    code, body = _http_get_json(url, token)
    if code != 200:
        return None, None, {'status': code, 'body': body}
    sha = body.get('sha')
    msg = ((body.get('commit') or {}).get('message') or '').split('\n', 1)[0][:200]
    return sha, msg, None


def list_tree(owner: str, repo: str, commit_sha: str, token: Optional[str]) -> Tuple[Optional[List[Dict]], Optional[Dict]]:
    url = f'{GITHUB_API}/repos/{quote(owner)}/{quote(repo)}/git/trees/{commit_sha}?recursive=1'
    code, body = _http_get_json(url, token)
    if code != 200:
        return None, {'status': code, 'body': body}
    tree = body.get('tree') or []
    files = [t for t in tree if t.get('type') == 'blob']
    return files, None


def select_files(tree: List[Dict], whitelist: Optional[List[str]] = None,
                 extra_globs: Optional[List[str]] = None,
                 max_files: int = MAX_FILES_PER_SNAPSHOT) -> List[Dict]:
    wl = whitelist or DEFAULT_WHITELIST
    wl_set = set(wl)
    selected: List[Dict] = []

    # 1) priority whitelist (exact paths)
    by_path = {t.get('path'): t for t in tree}
    for p in wl:
        t = by_path.get(p)
        if t and t.get('size', 0) <= MAX_FILE_BYTES:
            selected.append(t)
            if len(selected) >= max_files:
                return selected

    # 2) extra include globs (optional)
    if extra_globs:
        for t in tree:
            path = t.get('path') or ''
            if path in wl_set:
                continue
            if _match_any(path, EXCLUDE_GLOBS):
                continue
            if t.get('size', 0) > MAX_FILE_BYTES:
                continue
            if _match_any(path, extra_globs):
                selected.append(t)
                if len(selected) >= max_files:
                    break
    return selected


def fetch_blob(owner: str, repo: str, blob_sha: str, token: Optional[str]) -> Tuple[Optional[str], Optional[Dict]]:
    url = f'{GITHUB_API}/repos/{quote(owner)}/{quote(repo)}/git/blobs/{blob_sha}'
    code, body = _http_get_json(url, token, timeout=20)
    if code != 200:
        return None, {'status': code, 'body': body}
    enc = body.get('encoding')
    data = body.get('content') or ''
    if enc == 'base64':
        try:
            text = base64.b64decode(data).decode('utf-8', errors='replace')
            return text, None
        except Exception as e:
            return None, {'status': 500, 'body': {'message': f'decode_error: {e}'}}
    return data, None


def load_files_from_github(owner: str, repo: str, ref: str,
                           whitelist: Optional[List[str]] = None,
                           extra_globs: Optional[List[str]] = None,
                           max_files: int = MAX_FILES_PER_SNAPSHOT) -> Dict[str, Any]:
    """End-to-end: resolve ref → tree → fetch blobs.

    Returns: {success, commit_sha, commit_message, files: [{path, content, sha, size}], errors}
    """
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        return {'success': False, 'error': 'github_token_missing',
                'message': 'Добавь секрет GITHUB_TOKEN'}

    commit_sha, msg, err = resolve_commit(owner, repo, ref, token)
    if err:
        return {'success': False, 'error': 'resolve_commit_failed', 'detail': err}

    tree, err = list_tree(owner, repo, commit_sha, token)
    if err:
        return {'success': False, 'error': 'list_tree_failed', 'detail': err}

    picked = select_files(tree, whitelist, extra_globs, max_files)

    files_out: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []
    for t in picked:
        path = t['path']
        text, ferr = fetch_blob(owner, repo, t['sha'], token)
        if ferr:
            errors.append({'path': path, 'error': ferr})
            continue
        files_out.append({
            'path': path,
            'content': text,
            'sha': t['sha'],
            'size': t.get('size', len(text)),
        })

    return {
        'success': True,
        'commit_sha': commit_sha,
        'commit_message': msg,
        'files': files_out,
        'errors': errors,
        'total_in_tree': len(tree),
        'requested_in_whitelist': len(whitelist or DEFAULT_WHITELIST),
    }
