-- Создаём тестового члена семьи для проверки empty-state (no stale data)
INSERT INTO t_p5815085_family_assistant_pro.family_members 
    (id, family_id, name, role, age, avatar, avatar_type, points, level, workload)
VALUES 
    ('aaaaaaaa-0000-4444-bbbb-cccccccccccc'::uuid, 
     'd551699f-ccdc-431c-8ff0-6910bba3f6d9'::uuid,
     'Тестовый Петя', 'Сын', 7,
     '👦', 'emoji', 0, 1, 0);