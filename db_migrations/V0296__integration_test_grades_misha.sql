-- Integration test: создаём школу и оценки для Миши (member_id = 3f1aa585-176f-4ec0-85d0-7973d36de053)
INSERT INTO t_p5815085_family_assistant_pro.children_school (member_id, family_id, school_name, current_grade)
VALUES ('3f1aa585-176f-4ec0-85d0-7973d36de053', 'd551699f-ccdc-431c-8ff0-6910bba3f6d9', 'Тестовая школа', '3');

INSERT INTO t_p5815085_family_assistant_pro.children_grades (school_id, subject, grade, date)
SELECT id, 'Математика', 4, CURRENT_DATE FROM t_p5815085_family_assistant_pro.children_school
WHERE member_id = '3f1aa585-176f-4ec0-85d0-7973d36de053' LIMIT 1;

INSERT INTO t_p5815085_family_assistant_pro.children_grades (school_id, subject, grade, date)
SELECT id, 'Русский язык', 5, CURRENT_DATE FROM t_p5815085_family_assistant_pro.children_school
WHERE member_id = '3f1aa585-176f-4ec0-85d0-7973d36de053' LIMIT 1;

INSERT INTO t_p5815085_family_assistant_pro.children_grades (school_id, subject, grade, date)
SELECT id, 'Чтение', 3, CURRENT_DATE FROM t_p5815085_family_assistant_pro.children_school
WHERE member_id = '3f1aa585-176f-4ec0-85d0-7973d36de053' LIMIT 1;