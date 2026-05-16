-- Добавляем правила sphere_metric_rules для новых metric_key:
-- grades_average → intellect (вес 0.3 для школьных возрастов, 0 для остальных)
-- dreams_count → values (вес 0.1 для всех возрастов кроме 0-3)
-- medications_count → body (вес 0.05 информационный — лекарства сигнализируют об активном здоровье)

-- Оценки: grades_average влияет на intellect для школьных возрастов (7-10, 11-14, 15-17)
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (sphere_key, metric_key, metric_label, metric_group, weight, expected_count, age_group)
VALUES
    ('intellect', 'grades_average', 'Средний балл', 'academic', 0.3, 1, '7-10'),
    ('intellect', 'grades_average', 'Средний балл', 'academic', 0.3, 1, '11-14'),
    ('intellect', 'grades_average', 'Средний балл', 'academic', 0.2, 1, '15-17');

-- Мечты: dreams_count влияет на values для возрастов 4+
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (sphere_key, metric_key, metric_label, metric_group, weight, expected_count, age_group)
VALUES
    ('values', 'dreams_count', 'Мечты и цели', 'aspirations', 0.1, 1, '4-6'),
    ('values', 'dreams_count', 'Мечты и цели', 'aspirations', 0.1, 1, '7-10'),
    ('values', 'dreams_count', 'Мечты и цели', 'aspirations', 0.1, 1, '11-14'),
    ('values', 'dreams_count', 'Мечты и цели', 'aspirations', 0.1, 1, '15-17'),
    ('values', 'dreams_count', 'Мечты и цели', 'aspirations', 0.1, 1, '18+');

-- Лекарства: medications_count → body (сигнал активного мониторинга здоровья, малый вес)
INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (sphere_key, metric_key, metric_label, metric_group, weight, expected_count, age_group)
VALUES
    ('body', 'medications_count', 'Лекарства и назначения', 'medical', 0.05, 1, '0-3'),
    ('body', 'medications_count', 'Лекарства и назначения', 'medical', 0.05, 1, '4-6'),
    ('body', 'medications_count', 'Лекарства и назначения', 'medical', 0.05, 1, '7-10'),
    ('body', 'medications_count', 'Лекарства и назначения', 'medical', 0.05, 1, '11-14'),
    ('body', 'medications_count', 'Лекарства и назначения', 'medical', 0.05, 1, '15-17'),
    ('body', 'medications_count', 'Лекарства и назначения', 'medical', 0.05, 1, '18+');