"""Alias resolver for TS/JS imports.

Order:
1. tsconfig.json / tsconfig.app.json compilerOptions.paths
2. vite.config.ts resolve.alias
3. Hard fallback: @/* -> src/*

Inputs are raw repo files fetched from GitHub by commit_sha.
This module is pure (no I/O); the loader passes file contents in.
"""
import json
import re
from typing import Dict, List, Optional, Tuple

_CODE_EXT = ('.ts', '.tsx', '.js', '.jsx', '.json')
_INDEX_CANDIDATES = ('index.ts', 'index.tsx', 'index.js', 'index.jsx')


def _strip_json_comments(text: str) -> str:
    """tsconfig allows // and /* */ comments — strip them for json.loads."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    text = re.sub(r'(^|[^:])//.*$', r'\1', text, flags=re.MULTILINE)
    text = re.sub(r',(\s*[}\]])', r'\1', text)
    return text


def parse_tsconfig_paths(tsconfig_text: Optional[str]) -> Dict[str, List[str]]:
    if not tsconfig_text:
        return {}
    try:
        data = json.loads(_strip_json_comments(tsconfig_text))
    except Exception:
        return {}
    co = data.get('compilerOptions') or {}
    paths = co.get('paths') or {}
    base = (co.get('baseUrl') or '.').rstrip('/')
    out: Dict[str, List[str]] = {}
    for k, v in paths.items():
        if not isinstance(v, list):
            continue
        norm = []
        for target in v:
            t = target
            if base and base != '.':
                t = f'{base}/{t}'
            norm.append(t.lstrip('./'))
        out[k] = norm
    return out


_VITE_ALIAS_RE = re.compile(
    r"['\"]([^'\"]+)['\"]\s*:\s*path\.resolve\([^,]+,\s*['\"]([^'\"]+)['\"]\s*\)"
)


def parse_vite_aliases(vite_text: Optional[str]) -> Dict[str, List[str]]:
    if not vite_text:
        return {}
    out: Dict[str, List[str]] = {}
    for m in _VITE_ALIAS_RE.finditer(vite_text):
        key = m.group(1)
        target = m.group(2).lstrip('./')
        pattern = key + '/*' if not key.endswith('/*') else key
        out[pattern] = [target.rstrip('/') + '/*']
    return out


def build_alias_map(tsconfig_text: Optional[str],
                    vite_text: Optional[str]) -> Dict[str, List[str]]:
    """Merged map. tsconfig wins; fallback @/* -> src/* always present."""
    merged: Dict[str, List[str]] = {}
    merged.update(parse_vite_aliases(vite_text))
    merged.update(parse_tsconfig_paths(tsconfig_text))
    merged.setdefault('@/*', ['src/*'])
    return merged


def _normalize(path: str) -> str:
    parts: List[str] = []
    for seg in path.split('/'):
        if seg == '' or seg == '.':
            continue
        if seg == '..':
            if parts:
                parts.pop()
            continue
        parts.append(seg)
    return '/'.join(parts)


def _expand_alias(import_path: str, alias_map: Dict[str, List[str]]) -> Optional[str]:
    for pattern, targets in alias_map.items():
        if not pattern.endswith('/*'):
            if import_path == pattern.rstrip('/'):
                return targets[0].rstrip('/*').rstrip('/')
            continue
        prefix = pattern[:-1]
        if import_path.startswith(prefix):
            tail = import_path[len(prefix):]
            target = targets[0]
            if target.endswith('/*'):
                return target[:-1] + tail
            return target.rstrip('/') + '/' + tail
    return None


def resolve_import(import_path: str, current_file: str,
                   alias_map: Dict[str, List[str]]) -> Optional[str]:
    """Return repo-relative path candidate (without extension) or None.

    None == bare module (react, lodash, etc) — not local.
    """
    if not import_path:
        return None
    if import_path.startswith('./') or import_path.startswith('../'):
        cur_dir = '/'.join(current_file.split('/')[:-1])
        joined = cur_dir + '/' + import_path if cur_dir else import_path
        return _normalize(joined)
    aliased = _expand_alias(import_path, alias_map)
    if aliased is not None:
        return _normalize(aliased)
    if '/' in import_path and not import_path.startswith('@'):
        return None
    if import_path.startswith('@') and '/' not in import_path[1:]:
        return None
    return None


def candidates_for(resolved_path: str) -> List[str]:
    """Generate concrete file paths to try (extensions + index.* fallback)."""
    out: List[str] = []
    if any(resolved_path.endswith(e) for e in _CODE_EXT):
        out.append(resolved_path)
        return out
    for ext in _CODE_EXT:
        out.append(resolved_path + ext)
    for idx in _INDEX_CANDIDATES:
        out.append(resolved_path.rstrip('/') + '/' + idx)
    return out


def resolve_to_existing(import_path: str, current_file: str,
                        alias_map: Dict[str, List[str]],
                        path_exists) -> Optional[str]:
    """Try to find a real repo path. path_exists(path) -> bool."""
    base = resolve_import(import_path, current_file, alias_map)
    if not base:
        return None
    for cand in candidates_for(base):
        if path_exists(cand):
            return cand
    return None


def is_structural_import(target_path: str) -> bool:
    """For App.tsx structural-only mode: keep providers/shell/contexts/lib, drop pages."""
    p = target_path.lower()
    if '/pages/' in p:
        return False
    if '/contexts/' in p or '/providers/' in p:
        return True
    if '/lib/' in p or '/services/' in p or '/hooks/' in p:
        return True
    if '/components/ui/' in p:
        return True
    if '/components/' in p:
        return True
    return True
