"""V1.6 — chunking & extraction for TS/TSX/Python/JSON files.

Strategy: symbol-aware + line-window fallback.
- Detect React components, hooks, exported funcs/consts, default exports.
- Each symbol = 1 chunk with start_line/end_line.
- Code outside symbols is broken into windows (~120 lines, overlap 25).
- Hard cap per chunk: 8000 chars.

Also extracts:
- symbols (name, kind, exported, line_no)
- imports (raw import lines)
- routes from <Route path=... element={X} /> or path: '...'
- api endpoints from fetch('...') / func2url mappings
"""
import re
import hashlib
from typing import Any, Dict, List, Optional, Tuple

WINDOW_LINES = 120
WINDOW_OVERLAP = 25
HARD_CAP_CHARS = 8000
HARD_CAP_LINES = 220

LANG_BY_EXT = {
    'ts': 'typescript', 'tsx': 'tsx', 'js': 'javascript', 'jsx': 'jsx',
    'py': 'python', 'json': 'json', 'md': 'markdown', 'css': 'css',
    'html': 'html', 'sql': 'sql', 'yml': 'yaml', 'yaml': 'yaml',
}

CATEGORY_BY_PATH = [
    ('backend/', 'backend'),
    ('db_migrations/', 'migration'),
    ('src/pages/admin/', 'admin_page'),
    ('src/pages/', 'page'),
    ('src/components/ui/', 'ui'),
    ('src/components/', 'component'),
    ('src/hooks/', 'hook'),
    ('src/lib/', 'lib'),
    ('src/utils/', 'utility'),
    ('public/', 'public'),
]


def detect_lang(path: str) -> str:
    ext = path.rsplit('.', 1)[-1].lower() if '.' in path else ''
    return LANG_BY_EXT.get(ext, 'text')


def detect_category(path: str) -> str:
    for prefix, cat in CATEGORY_BY_PATH:
        if path.startswith(prefix):
            return cat
    return 'other'


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


# ============================================================
# Symbol detection (regex, не AST)
# ============================================================

# Top-level React component / function / hook
_RE_EXPORT_DEFAULT_FN = re.compile(r'^export\s+default\s+function\s+([A-Z]\w*)\s*\(', re.MULTILINE)
_RE_EXPORT_FN = re.compile(r'^export\s+(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(', re.MULTILINE)
_RE_FN_DECL = re.compile(r'^(?:async\s+)?function\s+([A-Za-z_]\w*)\s*\(', re.MULTILINE)
_RE_EXPORT_CONST_ARROW = re.compile(
    r'^export\s+const\s+([A-Za-z_]\w*)\s*(?::\s*[^=]+)?=\s*(?:\([^)]*\)|[A-Za-z_]\w*)\s*=>',
    re.MULTILINE,
)
_RE_CONST_ARROW = re.compile(
    r'^const\s+([A-Za-z_]\w*)\s*(?::\s*[^=]+)?=\s*(?:\([^)]*\)|[A-Za-z_]\w*)\s*=>',
    re.MULTILINE,
)
_RE_EXPORT_DEFAULT_NAME = re.compile(r'^export\s+default\s+([A-Z][A-Za-z0-9_]*)\s*;?\s*$', re.MULTILINE)

_RE_PY_DEF = re.compile(r'^def\s+([A-Za-z_]\w*)\s*\(', re.MULTILINE)
_RE_PY_CLASS = re.compile(r'^class\s+([A-Za-z_]\w*)\s*[:\(]', re.MULTILINE)

_RE_IMPORT = re.compile(r"^import\s+[^;]+from\s+['\"]([^'\"]+)['\"]", re.MULTILINE)

_RE_ROUTE = re.compile(
    r"<Route\s+[^>]*path\s*=\s*['\"]([^'\"]+)['\"][^>]*?(?:element\s*=\s*\{\s*<\s*([A-Z]\w*))?",
    re.DOTALL,
)
_RE_ROUTE_LAZY = re.compile(r"path\s*:\s*['\"]([^'\"]+)['\"]")

_RE_FETCH_URL = re.compile(r"fetch\s*\(\s*['\"]((?:https?:|/)[^'\"]+)['\"]")
_RE_FUNC2URL_KEY = re.compile(r'^\s*"([\w\-]+)"\s*:\s*"(https?://[^"]+)"', re.MULTILINE)


def _kind_for_symbol(name: str, source: str) -> str:
    if name.startswith('use') and len(name) > 3 and name[3].isupper():
        return 'hook'
    if name[0].isupper():
        return 'component'
    if source == 'py_class':
        return 'class'
    if source.startswith('py'):
        return 'function'
    return 'function'


def extract_symbols_tsx(content: str) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    seen: set = set()

    def add(name: str, line: int, exported: bool, src: str):
        if not name or name in seen:
            return
        seen.add(name)
        out.append({
            'symbol_name': name,
            'symbol_kind': _kind_for_symbol(name, src),
            'exported': exported,
            'line_no': line,
        })

    for m in _RE_EXPORT_DEFAULT_FN.finditer(content):
        line = content[:m.start()].count('\n') + 1
        add(m.group(1), line, True, 'export_default_fn')
    for m in _RE_EXPORT_FN.finditer(content):
        line = content[:m.start()].count('\n') + 1
        add(m.group(1), line, True, 'export_fn')
    for m in _RE_FN_DECL.finditer(content):
        line = content[:m.start()].count('\n') + 1
        add(m.group(1), line, False, 'fn')
    for m in _RE_EXPORT_CONST_ARROW.finditer(content):
        line = content[:m.start()].count('\n') + 1
        add(m.group(1), line, True, 'export_const_arrow')
    for m in _RE_CONST_ARROW.finditer(content):
        line = content[:m.start()].count('\n') + 1
        add(m.group(1), line, False, 'const_arrow')

    # mark default-exported name (export default Foo;)
    for m in _RE_EXPORT_DEFAULT_NAME.finditer(content):
        name = m.group(1)
        for s in out:
            if s['symbol_name'] == name:
                s['exported'] = True

    return out


def extract_symbols_py(content: str) -> List[Dict[str, Any]]:
    out = []
    for m in _RE_PY_DEF.finditer(content):
        line = content[:m.start()].count('\n') + 1
        out.append({'symbol_name': m.group(1), 'symbol_kind': 'function',
                    'exported': not m.group(1).startswith('_'), 'line_no': line})
    for m in _RE_PY_CLASS.finditer(content):
        line = content[:m.start()].count('\n') + 1
        out.append({'symbol_name': m.group(1), 'symbol_kind': 'class',
                    'exported': True, 'line_no': line})
    return out


def extract_symbols(path: str, content: str) -> List[Dict[str, Any]]:
    lang = detect_lang(path)
    if lang in ('typescript', 'tsx', 'javascript', 'jsx'):
        return extract_symbols_tsx(content)
    if lang == 'python':
        return extract_symbols_py(content)
    return []


def extract_imports(content: str) -> List[str]:
    return list(dict.fromkeys(_RE_IMPORT.findall(content)))


def extract_routes(path: str, content: str) -> List[Dict[str, Any]]:
    if not path.endswith(('.tsx', '.ts', '.jsx', '.js')):
        return []
    out: List[Dict[str, Any]] = []
    for m in _RE_ROUTE.finditer(content):
        route_path = m.group(1)
        comp = m.group(2)
        if route_path.startswith('/'):
            out.append({
                'route_path': route_path,
                'page_component': comp,
                'area': 'admin' if route_path.startswith('/admin') else 'public',
            })
    return out


def extract_api_endpoints_from_func2url(content: str) -> List[Dict[str, Any]]:
    out = []
    for m in _RE_FUNC2URL_KEY.finditer(content):
        out.append({
            'function_name': m.group(1),
            'endpoint_path': m.group(2),
            'http_method': None,
            'auth_scope': None,
        })
    return out


# ============================================================
# Chunking — symbol-aware + windows fallback
# ============================================================

def _make_chunk(text: str, start_line: int, end_line: int,
                kind: str, symbol_name: Optional[str], lang: str) -> Dict[str, Any]:
    text_clipped = text[:HARD_CAP_CHARS]
    return {
        'chunk_kind': kind,
        'symbol_name': symbol_name,
        'start_line': start_line,
        'end_line': end_line,
        'chunk_text': text_clipped,
        'token_estimate': max(1, len(text_clipped) // 4),
        'sha256': sha256_hex(text_clipped),
        'lang_code': lang,
        'byte_size': len(text_clipped.encode('utf-8')),
    }


def _find_block_end_tsx(lines: List[str], start: int) -> int:
    """Find end of a JS/TS block starting at `start` by brace counting.
    Returns last line index (1-based, inclusive). If no braces found within
    HARD_CAP_LINES — return start + HARD_CAP_LINES."""
    depth = 0
    started = False
    end = min(len(lines), start + HARD_CAP_LINES)
    for i in range(start, end):
        line = lines[i]
        for ch in line:
            if ch == '{':
                depth += 1
                started = True
            elif ch == '}':
                depth -= 1
                if started and depth <= 0:
                    return i + 1
    return end


def _find_block_end_py(lines: List[str], start: int) -> int:
    """For python: find next line with indent <= original indent."""
    if start >= len(lines):
        return start + 1
    base_indent = len(lines[start]) - len(lines[start].lstrip())
    end = min(len(lines), start + HARD_CAP_LINES)
    for i in range(start + 1, end):
        line = lines[i]
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip())
        if indent <= base_indent and line.strip() and not line.strip().startswith(('#', ')', ']')):
            return i
    return end


def chunk_file(path: str, content: str) -> List[Dict[str, Any]]:
    """Return list of chunk dicts for one file."""
    lang = detect_lang(path)
    lines = content.split('\n')
    n = len(lines)
    if n == 0:
        return []

    chunks: List[Dict[str, Any]] = []
    covered: List[Tuple[int, int]] = []  # 1-based inclusive ranges

    symbols = extract_symbols(path, content)
    is_tsx = lang in ('typescript', 'tsx', 'javascript', 'jsx')
    is_py = lang == 'python'

    for sym in symbols:
        start_line = sym.get('line_no') or 1
        start_idx = max(0, start_line - 1)
        if is_tsx:
            end_line = _find_block_end_tsx(lines, start_idx)
        elif is_py:
            end_line = _find_block_end_py(lines, start_idx)
        else:
            end_line = min(n, start_line + 50)
        end_line = min(n, end_line)
        if end_line <= start_line:
            end_line = min(n, start_line + 20)
        text = '\n'.join(lines[start_idx:end_line])
        if not text.strip():
            continue
        chunks.append(_make_chunk(
            text, start_line, end_line, 'symbol', sym['symbol_name'], lang
        ))
        covered.append((start_line, end_line))

    # Coverage map
    covered_lines = [False] * (n + 2)
    for s, e in covered:
        for i in range(s, min(e + 1, n + 1)):
            covered_lines[i] = True

    # Walk uncovered ranges → window chunks
    i = 1
    while i <= n:
        if covered_lines[i]:
            i += 1
            continue
        win_start = i
        win_end = min(n, win_start + WINDOW_LINES - 1)
        # cut at next covered boundary
        for j in range(win_start, win_end + 1):
            if covered_lines[j]:
                win_end = j - 1
                break
        if win_end < win_start:
            i += 1
            continue
        text = '\n'.join(lines[win_start - 1:win_end])
        if text.strip():
            chunks.append(_make_chunk(text, win_start, win_end, 'window', None, lang))
        i = win_end + 1 - WINDOW_OVERLAP if (win_end + 1 - WINDOW_OVERLAP) > win_start else win_end + 1

    # Sort and assign chunk_index
    chunks.sort(key=lambda c: (c['start_line'], c['end_line']))
    for idx, c in enumerate(chunks):
        c['chunk_index'] = idx
    return chunks
