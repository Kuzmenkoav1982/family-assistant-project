-- Демо-контур для экспертизы Реестра РПО (заявление №372122)
-- Полностью синтетические данные, без ПДн. Все ID с префиксом d0000000 для лёгкой идентификации.

INSERT INTO t_p5815085_family_assistant_pro.users
    (id, email, password_hash, is_verified, name, privacy_policy_accepted, created_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'demo-owner@example.com',
     'demo-not-a-real-hash', true, 'Анна Тестова', true, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.families (id, name, created_at)
VALUES ('d0000000-0000-0000-0000-0000000000f1', 'Тестовая семья (демо для экспертизы)', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.family_members
    (id, family_id, name, role, relationship, access_role, member_status, user_id, age, created_at)
VALUES
    ('d0000000-0000-0000-0000-0000000000a1', 'd0000000-0000-0000-0000-0000000000f1',
     'Анна Тестова', 'Владелец', 'Мама', 'admin', 'active',
     'd0000000-0000-0000-0000-000000000001', 36, NOW()),
    ('d0000000-0000-0000-0000-0000000000a2', 'd0000000-0000-0000-0000-0000000000f1',
     'Иван Тестов', 'Родитель', 'Папа', 'parent', 'active', NULL, 38, NOW()),
    ('d0000000-0000-0000-0000-0000000000a3', 'd0000000-0000-0000-0000-0000000000f1',
     'Ребёнок Тестов', 'Ребёнок', 'Сын', 'child', 'active', NULL, 8, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.tasks
    (id, family_id, title, assignee_id, assignee_name, completed, category, points, created_at)
VALUES
    ('d0000000-0000-0000-0000-0000000000b1', 'd0000000-0000-0000-0000-0000000000f1',
     'Демо-задача: полить цветы', 'd0000000-0000-0000-0000-0000000000a3', 'Ребёнок Тестов', false, 'Дом', 10, NOW()),
    ('d0000000-0000-0000-0000-0000000000b2', 'd0000000-0000-0000-0000-0000000000f1',
     'Демо-задача: забрать посылку', 'd0000000-0000-0000-0000-0000000000a2', 'Иван Тестов', false, 'Поручения', 15, NOW()),
    ('d0000000-0000-0000-0000-0000000000b3', 'd0000000-0000-0000-0000-0000000000f1',
     'Демо-задача: спланировать меню на неделю', 'd0000000-0000-0000-0000-0000000000a1', 'Анна Тестова', true, 'Питание', 20, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.calendar_events
    (family_id, title, description, date, time, category, created_by_name, created_at)
VALUES
    ('d0000000-0000-0000-0000-0000000000f1', 'Демо-событие: семейный ужин', 'Тестовое событие', CURRENT_DATE + 1, '19:00', 'Семья', 'Анна Тестова', NOW()),
    ('d0000000-0000-0000-0000-0000000000f1', 'Демо-событие: тренировка', 'Тестовое событие', CURRENT_DATE + 2, '17:30', 'Спорт', 'Иван Тестов', NOW()),
    ('d0000000-0000-0000-0000-0000000000f1', 'Демо-событие: визит к врачу', 'Тестовое событие', CURRENT_DATE + 3, '10:00', 'Здоровье', 'Анна Тестова', NOW());

INSERT INTO t_p5815085_family_assistant_pro.shopping_items
    (id, family_id, name, category, quantity, bought, added_by_name, created_at)
VALUES
    ('d0000000-0000-0000-0000-0000000000c1', 'd0000000-0000-0000-0000-0000000000f1', 'Демо: хлеб', 'food', '1 шт', false, 'Анна Тестова', NOW()),
    ('d0000000-0000-0000-0000-0000000000c2', 'd0000000-0000-0000-0000-0000000000f1', 'Демо: молоко', 'food', '2 л', false, 'Иван Тестов', NOW()),
    ('d0000000-0000-0000-0000-0000000000c3', 'd0000000-0000-0000-0000-0000000000f1', 'Демо: тетради', 'other', '5 шт', true, 'Анна Тестова', NOW())
ON CONFLICT (id) DO NOTHING;