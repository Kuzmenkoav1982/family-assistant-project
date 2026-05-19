-- B-v1-freeze: staging sanity-check фикстуры для Status Banner.
-- Этот файл — отдельный, потому что данные нужны были только для финальной
-- проверки. После прогона их можно удалить, оставив миграцию как историю.

INSERT INTO status_banners (
  id, type, title, message, enabled, dismissible, audience, route_scope, priority,
  published_at, created_by, updated_by
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'info',
    'V1-FREEZE FIXTURE: общедоступный info',
    'Виден всем (аноним/auth/admin), audience=all.',
    TRUE, TRUE, 'all', '[]'::jsonb, 10,
    now(), 'v1-freeze', 'v1-freeze'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'warning',
    'V1-FREEZE FIXTURE: gated authenticated',
    'НЕ должен уходить в public read API (v1 all_only).',
    TRUE, TRUE, 'authenticated', '[]'::jsonb, 50,
    now(), 'v1-freeze', 'v1-freeze'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'maintenance',
    'V1-FREEZE FIXTURE: route-scoped /portfolio',
    'Должен быть в ответе, но клиентский resolver покажет только на /portfolio*.',
    TRUE, TRUE, 'all', '["/portfolio"]'::jsonb, 30,
    now(), 'v1-freeze', 'v1-freeze'
  );
