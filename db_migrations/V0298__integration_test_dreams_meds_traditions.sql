-- Сценарий 3: dreams happy path для Миши
INSERT INTO t_p5815085_family_assistant_pro.children_dreams (member_id, family_id, title, description, achieved)
VALUES 
    ('3f1aa585-176f-4ec0-85d0-7973d36de053', 'd551699f-ccdc-431c-8ff0-6910bba3f6d9', 'Стать космонавтом', 'Хочу летать на ракете', false),
    ('3f1aa585-176f-4ec0-85d0-7973d36de053', 'd551699f-ccdc-431c-8ff0-6910bba3f6d9', 'Научиться плавать', 'Хочу плавать как рыба', true);

-- Сценарий 4: medications happy path для Миши
INSERT INTO t_p5815085_family_assistant_pro.children_medications (member_id, family_id, name, start_date, frequency, dosage)
VALUES 
    ('3f1aa585-176f-4ec0-85d0-7973d36de053', 'd551699f-ccdc-431c-8ff0-6910bba3f6d9', 'Витамин D', CURRENT_DATE - INTERVAL '7 days', 'Ежедневно', '1 капля');

-- Сценарий 5: traditions family fan-out (family_id = 1 как в legacy, family_uuid = d551699f)
INSERT INTO t_p5815085_family_assistant_pro.traditions (family_id, family_uuid, title, description, icon, frequency, is_active)
VALUES 
    (1, 'd551699f-ccdc-431c-8ff0-6910bba3f6d9', 'Воскресный блинный завтрак', 'Каждое воскресенье печём блины всей семьёй', '🥞', 'weekly', true),
    (1, 'd551699f-ccdc-431c-8ff0-6910bba3f6d9', 'Вечерние сказки', 'Читаем сказки перед сном каждый вечер', '📚', 'weekly', true);