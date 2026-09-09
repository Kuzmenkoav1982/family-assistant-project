#!/usr/bin/env python3
"""
Раскладывает канонические общие модули по функциям, которые их импортируют.

Платформа деплоит папку функции целиком, поэтому общий код приходится
физически копировать. Единственный источник истины — backend/_shared/*.py.
Копии помечены баннером и не должны правиться руками.

Модули:
    auth_guard.py   — сессия, AuthContext, RBAC, same_family, subject access, аудит
    health_scope.py — проверки для ресурсов, привязанных к health_profiles
    health_crud.py  — типовой защищённый CRUD

Модуль копируется в функцию, если она импортирует его напрямую ИЛИ импортирует
модуль, который от него зависит (health_crud тянет за собой health_scope
и auth_guard).

Запуск:
    python3 backend/_shared/sync_auth_guard.py          # синхронизировать
    python3 backend/_shared/sync_auth_guard.py --check  # проверить (для CI)
"""

import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHARED = ROOT / '_shared'

# module -> его собственные зависимости среди общих модулей
MODULES = {
    'auth_guard': (),
    'health_scope': ('auth_guard',),
    'health_crud': ('health_scope', 'auth_guard'),
}


def banner(module: str) -> str:
    return (
        '# ============================================================\n'
        '# АВТОСГЕНЕРИРОВАННАЯ КОПИЯ — НЕ РЕДАКТИРОВАТЬ\n'
        f'# Источник: backend/_shared/{module}.py\n'
        '# Обновление: python3 backend/_shared/sync_auth_guard.py\n'
        '# ============================================================\n'
    )


def required_modules(src: str):
    """Транзитивно раскрывает, какие общие модули нужны функции."""
    needed = set()
    pending = [m for m in MODULES if m in src]
    while pending:
        module = pending.pop()
        if module in needed:
            continue
        needed.add(module)
        pending.extend(MODULES[module])
    return needed


def plan():
    """[(папка функции, {нужные модули})] для всех функций backend."""
    result = []
    for index in sorted(ROOT.glob('*/index.py')):
        try:
            src = index.read_text(encoding='utf-8')
        except OSError:
            continue
        needed = required_modules(src)
        if needed:
            result.append((index.parent, needed))
    return result


def main() -> int:
    check_only = '--check' in sys.argv
    expected = {m: banner(m) + (SHARED / f'{m}.py').read_text(encoding='utf-8')
                for m in MODULES}
    hashes = {m: hashlib.sha256(c.encode()).hexdigest() for m, c in expected.items()}

    stale, written = [], []
    entries = plan()
    for func_dir, needed in entries:
        for module in sorted(needed):
            dest = func_dir / f'{module}.py'
            current = dest.read_text(encoding='utf-8') if dest.exists() else ''
            if hashlib.sha256(current.encode()).hexdigest() == hashes[module]:
                continue
            rel = str(dest.relative_to(ROOT.parent))
            if check_only:
                stale.append(rel)
            else:
                dest.write_text(expected[module], encoding='utf-8')
                written.append(rel)

    if check_only:
        if stale:
            print('Копии общих модулей устарели:')
            for s in stale:
                print(f'  - {s}')
            print('Запустите: python3 backend/_shared/sync_auth_guard.py')
            return 1
        print(f'Общие модули: все копии актуальны ({len(entries)} функций)')
        return 0

    print(f'Общие модули: обновлено {len(written)} файлов в {len(entries)} функциях')
    for w in written:
        print(f'  + {w}')
    return 0


if __name__ == '__main__':
    sys.exit(main())