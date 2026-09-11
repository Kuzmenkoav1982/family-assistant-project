#!/usr/bin/env python3
"""
CI-проверка: identity не должна читаться из заголовка запроса.

Запуск:
    python3 backend/_shared/check_no_header_identity.py            # мигрированные функции
    python3 backend/_shared/check_no_header_identity.py --report   # статус всех функций

Что запрещено в функциях, уже переведённых на серверную авторизацию:

  1) чтение X-User-Id иначе как через resolve_requested_member();
  2) grace-period-паттерн `if token: ... else: actor = X-User-Id`;
  3) доверие клиентским family_id / user_id / role из body или query;
  4) отдача данных без require_session().

Проверка нужна, потому что уязвимость возвращается тихо: достаточно одной
новой функции, скопированной со старого образца, чтобы снова начать доверять
заголовку. Тесты этого не поймают — новая функция просто не будет ими покрыта.

Список мигрированных функций ведётся явно (MIGRATED). Функция попадает
в него, когда переведена на auth_guard, и с этого момента нарушение
правил ломает сборку.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Функции, переведённые на серверную авторизацию.
# Пополняется по мере миграции. Убирать отсюда нельзя.
MIGRATED = {
    # Волна 4: блок геолокации после инцидента SEC-2026-001.
    'location-history',
    'family-tracker',
    'family-tracker-members',
    'geofences',
    # Волна 1: здоровье.
    'auth-me',
    'health-profiles',
    'health-medications',
    'medication-intakes',
    'health-records',
    'health-vitals',
    'health-vaccinations',
    'health-insurance',
    'health-telemedicine',
    'health-doctors',
}

# Заголовок можно упоминать только в этих контекстах.
ALLOWED_HEADER_CONTEXT = re.compile(
    r"(Access-Control-Allow-Headers|#|\"\"\"|'''|resolve_requested_member|X-User-Id \(переходный)"
)

HEADER_READ = re.compile(
    r"""headers.*?\.get\(\s*['"](?:X-User-Id|x-user-id)['"]""", re.I)

CLIENT_SCOPE = re.compile(
    r"""body\.get\(\s*['"](?:family_id|familyId|user_id|userId|access_role|role)['"]""")

QUERY_SCOPE = re.compile(
    r"""queryStringParameters.*?\.get\(\s*['"](?:family_id|familyId|user_id|userId)['"]""", re.I)


def scan(func_dir: pathlib.Path):
    """Возвращает список нарушений в index.py функции."""
    index = func_dir / 'index.py'
    if not index.exists():
        return []
    problems = []
    src = index.read_text(encoding='utf-8')
    lines = src.split('\n')

    # require_session может вызываться и в общем обработчике (health_crud.run_crud),
    # который лежит копией в этой же папке — тогда защита всё равно на месте.
    guarded = 'require_session' in src or any(
        'require_session' in shared.read_text(encoding='utf-8')
        for shared in func_dir.glob('*.py') if shared.name != 'index.py'
    )
    if not guarded:
        problems.append((0, 'нет require_session() — actor не подтверждён сервером'))

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith('#'):
            continue
        if HEADER_READ.search(line) and not ALLOWED_HEADER_CONTEXT.search(line):
            problems.append((i, 'X-User-Id читается напрямую — используйте resolve_requested_member()'))
        if CLIENT_SCOPE.search(line):
            # Значение из body допустимо, если тут же проверяется правом
            # доступа к субъекту/семье, а не используется как identity.
            window = '\n'.join(lines[i - 1:i + 8])
            if not re.search(r'require_subject_access|require_same_family|guard_profile', window):
                problems.append((i, 'scope берётся из тела запроса — используйте ctx из сессии'))
        if QUERY_SCOPE.search(line):
            problems.append((i, 'scope берётся из query — используйте ctx из сессии'))

    # grace-period: ветка else после проверки токена, назначающая actor
    if re.search(r'if\s+\w*token\w*\s*:.*?\n\s*else\s*:.*?X-User-Id', src, re.S | re.I):
        problems.append((0, 'grace-period fallback на X-User-Id при отсутствии токена'))

    return problems


def report_all():
    """Статус всех функций backend: мигрирована / доверяет заголовку."""
    trusting, clean, migrated = [], [], []
    for index in sorted(ROOT.glob('*/index.py')):
        name = index.parent.name
        src = index.read_text(encoding='utf-8')
        uses_header = bool(HEADER_READ.search(src))
        has_session = 'require_session' in src or 'verify_token' in src
        if name in MIGRATED:
            migrated.append(name)
        elif uses_header and not has_session:
            trusting.append(name)
        elif uses_header:
            clean.append(name)

    print(f'Мигрировано на auth_guard: {len(migrated)}')
    print(f'Доверяют X-User-Id БЕЗ проверки сессии (волна 2, приоритет): {len(trusting)}')
    for n in trusting:
        print(f'    ! {n}')
    print(f'Читают X-User-Id, но проверяют токен (волна 3): {len(clean)}')
    for n in clean:
        print(f'    ~ {n}')
    return 0


def main() -> int:
    if '--report' in sys.argv:
        return report_all()

    failures = {}
    for name in sorted(MIGRATED):
        problems = scan(ROOT / name)
        if problems:
            failures[name] = problems

    if failures:
        print('НАРУШЕНИЯ правил серверной авторизации:\n')
        for name, problems in failures.items():
            for line, msg in problems:
                where = f'{name}/index.py:{line}' if line else f'{name}/index.py'
                print(f'  {where}: {msg}')
        print('\nIdentity определяется ТОЛЬКО из серверной сессии.')
        return 1

    print(f'OK: {len(MIGRATED)} мигрированных функций не читают identity из заголовков')
    return 0


if __name__ == '__main__':
    sys.exit(main())