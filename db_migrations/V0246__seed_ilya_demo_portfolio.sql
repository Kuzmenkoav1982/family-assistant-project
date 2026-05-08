-- DEMO: Илья 5 лет (4-6 группа)
-- 1. Член семьи Илья
INSERT INTO t_p5815085_family_assistant_pro.family_members
    (id, family_id, name, role, age, birth_date, points, level, account_type, access_role)
VALUES (
    '000000d1-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Илья',
    'Сын',
    5,
    '2020-08-15',
    320,
    3,
    'child_profile',
    'child'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, role = EXCLUDED.role, age = EXCLUDED.age, birth_date = EXCLUDED.birth_date;

-- 2. Достижения (бейджи)
INSERT INTO t_p5815085_family_assistant_pro.member_achievements
    (member_id, family_id, badge_key, title, description, icon, sphere_key, category, earned_at)
VALUES
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'first_test_passed', 'Первый пройденный тест', 'Прошёл первый тест развития', 'Sparkles',
     'intellect', 'milestone', CURRENT_TIMESTAMP - INTERVAL '90 days'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'creative_kid', 'Рисующий художник', 'Нарисовал 20 картин в кружке', 'Palette',
     'creativity', 'path', CURRENT_TIMESTAMP - INTERVAL '60 days'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'bike_master', 'Освоил велосипед', 'Научился кататься на двухколёсном', 'Bike',
     'body', 'milestone', CURRENT_TIMESTAMP - INTERVAL '45 days'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'reader_5books', 'Первые 5 книг', 'Прочитал с мамой 5 книг', 'BookOpen',
     'intellect', 'path', CURRENT_TIMESTAMP - INTERVAL '30 days'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'family_ritual_4w', 'Семейный ритуал 4 недели', 'Читаем перед сном месяц подряд', 'Heart',
     'values', 'rhythm', CURRENT_TIMESTAMP - INTERVAL '14 days'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'self_dressing', 'Одевается сам', 'Освоил самостоятельное одевание', 'Shirt',
     'life_skills', 'milestone', CURRENT_TIMESTAMP - INTERVAL '20 days')
ON CONFLICT (member_id, badge_key) DO NOTHING;

-- 3. Активные планы развития
INSERT INTO t_p5815085_family_assistant_pro.member_development_plans
    (member_id, family_id, sphere_key, title, description, milestone, target_date, status, progress, next_step)
VALUES
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'social', 'Развитие общительности', 'Помочь Илье быть смелее в группе',
     'Добавить 1 новую групповую активность',
     CURRENT_DATE + INTERVAL '60 days', 'active', 35,
     'Записаться в театральный кружок'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'creativity', 'Глубже в творчество', 'Развивать сильную сторону Ильи',
     'Участвовать в выставке работ',
     CURRENT_DATE + INTERVAL '90 days', 'active', 70,
     'Собрать портфолио из 10 лучших работ'),
    ('000000d1-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'finance', 'Первое знакомство с деньгами', 'Научить ценности вещей',
     'Накопить на любимую игрушку',
     CURRENT_DATE + INTERVAL '120 days', 'active', 15,
     'Завести копилку и игру Магазин');

-- 4. Метрики
INSERT INTO t_p5815085_family_assistant_pro.member_portfolio_metrics
    (member_id, sphere_key, metric_key, metric_value, metric_unit, source_type, source_id, measured_at, raw_value)
VALUES
    -- INTELLECT
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'development_assessment', 78, 'score', 'child_development_assessments', 'demo-1', CURRENT_TIMESTAMP - INTERVAL '95 days', '78'),
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'development_assessment', 85, 'score', 'child_development_assessments', 'demo-2', CURRENT_TIMESTAMP - INTERVAL '5 days', '85'),
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'cognitive_skills', 80, 'score', 'child_skills', 'memory', CURRENT_TIMESTAMP - INTERVAL '10 days', '80'),
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'cognitive_skills', 75, 'score', 'child_skills', 'attention', CURRENT_TIMESTAMP - INTERVAL '10 days', '75'),
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'cognitive_skills', 88, 'score', 'child_skills', 'logic', CURRENT_TIMESTAMP - INTERVAL '10 days', '88'),
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'curiosity_activities', 100, 'count', 'reading', 'demo', CURRENT_TIMESTAMP - INTERVAL '20 days', '5 книг'),
    ('000000d1-0000-0000-0000-000000000001', 'intellect', 'parent_observation', 80, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '7 days', 'high'),

    -- EMOTIONS
    ('000000d1-0000-0000-0000-000000000001', 'emotions', 'mood_diary', 60, 'score', 'children_mood_entries', 'demo', CURRENT_TIMESTAMP - INTERVAL '5 days', '4/7'),
    ('000000d1-0000-0000-0000-000000000001', 'emotions', 'parent_emotion_score', 70, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '3 days', 'good'),
    ('000000d1-0000-0000-0000-000000000001', 'emotions', 'emotion_recognition', 65, 'score', 'child_skills', 'emotions', CURRENT_TIMESTAMP - INTERVAL '15 days', '65'),

    -- BODY
    ('000000d1-0000-0000-0000-000000000001', 'body', 'height_weight', 100, 'measured', 'vital_records', 'demo-h', CURRENT_TIMESTAMP - INTERVAL '15 days', '110см'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'height_weight', 100, 'measured', 'vital_records', 'demo-w', CURRENT_TIMESTAMP - INTERVAL '15 days', '18кг'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'vaccinations', 100, 'completed', 'children_vaccinations', 'demo-1', CURRENT_TIMESTAMP - INTERVAL '120 days', 'completed'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'vaccinations', 100, 'completed', 'children_vaccinations', 'demo-2', CURRENT_TIMESTAMP - INTERVAL '60 days', 'completed'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'vaccinations', 100, 'completed', 'children_vaccinations', 'demo-3', CURRENT_TIMESTAMP - INTERVAL '30 days', 'completed'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'physical_activity', 90, 'score', 'children_activities', 'demo-sport', CURRENT_TIMESTAMP - INTERVAL '7 days', 'бассейн 2р/нед'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'doctor_visits', 100, 'completed', 'children_doctor_visits', 'demo-1', CURRENT_TIMESTAMP - INTERVAL '40 days', 'check-up'),
    ('000000d1-0000-0000-0000-000000000001', 'body', 'parent_health_score', 85, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '5 days', 'great'),

    -- CREATIVITY
    ('000000d1-0000-0000-0000-000000000001', 'creativity', 'creative_activities', 100, 'score', 'children_activities', 'demo-art', CURRENT_TIMESTAMP - INTERVAL '5 days', 'рисование 2р/нед'),
    ('000000d1-0000-0000-0000-000000000001', 'creativity', 'creative_activities', 90, 'score', 'children_activities', 'demo-music', CURRENT_TIMESTAMP - INTERVAL '5 days', 'музыка 1р/нед'),
    ('000000d1-0000-0000-0000-000000000001', 'creativity', 'creative_skills', 95, 'score', 'child_skills', 'drawing', CURRENT_TIMESTAMP - INTERVAL '10 days', '95'),
    ('000000d1-0000-0000-0000-000000000001', 'creativity', 'creative_skills', 85, 'score', 'child_skills', 'imagination', CURRENT_TIMESTAMP - INTERVAL '10 days', '85'),
    ('000000d1-0000-0000-0000-000000000001', 'creativity', 'creative_achievements', 100, 'count', 'achievements', 'creative_kid', CURRENT_TIMESTAMP - INTERVAL '60 days', 'картины'),
    ('000000d1-0000-0000-0000-000000000001', 'creativity', 'parent_creativity_score', 95, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '5 days', 'highest'),

    -- SOCIAL
    ('000000d1-0000-0000-0000-000000000001', 'social', 'social_skills', 50, 'score', 'child_skills', 'communication', CURRENT_TIMESTAMP - INTERVAL '10 days', '50'),
    ('000000d1-0000-0000-0000-000000000001', 'social', 'social_skills', 45, 'score', 'child_skills', 'cooperation', CURRENT_TIMESTAMP - INTERVAL '10 days', '45'),
    ('000000d1-0000-0000-0000-000000000001', 'social', 'group_activities', 60, 'score', 'children_activities', 'demo-group', CURRENT_TIMESTAMP - INTERVAL '7 days', 'садик'),
    ('000000d1-0000-0000-0000-000000000001', 'social', 'parent_social_score', 55, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '5 days', 'shy'),

    -- FINANCE
    ('000000d1-0000-0000-0000-000000000001', 'finance', 'money_concepts', 30, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '20 days', 'basic'),
    ('000000d1-0000-0000-0000-000000000001', 'finance', 'parent_finance_score', 40, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '5 days', 'low'),

    -- VALUES
    ('000000d1-0000-0000-0000-000000000001', 'values', 'family_rituals', 90, 'count', 'family_traditions', 'reading', CURRENT_TIMESTAMP - INTERVAL '5 days', 'чтение перед сном'),
    ('000000d1-0000-0000-0000-000000000001', 'values', 'family_rituals', 85, 'count', 'family_traditions', 'sunday_lunch', CURRENT_TIMESTAMP - INTERVAL '3 days', 'воскресный обед'),
    ('000000d1-0000-0000-0000-000000000001', 'values', 'family_rituals', 80, 'count', 'family_traditions', 'morning_hug', CURRENT_TIMESTAMP - INTERVAL '1 days', 'утренние обнимашки'),
    ('000000d1-0000-0000-0000-000000000001', 'values', 'parent_values_score', 85, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '7 days', 'kind'),
    ('000000d1-0000-0000-0000-000000000001', 'values', 'values_concepts', 70, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '15 days', 'understanding'),

    -- LIFE_SKILLS
    ('000000d1-0000-0000-0000-000000000001', 'life_skills', 'self_care_skills', 80, 'score', 'child_skills', 'dressing', CURRENT_TIMESTAMP - INTERVAL '20 days', '80'),
    ('000000d1-0000-0000-0000-000000000001', 'life_skills', 'self_care_skills', 75, 'score', 'child_skills', 'eating', CURRENT_TIMESTAMP - INTERVAL '20 days', '75'),
    ('000000d1-0000-0000-0000-000000000001', 'life_skills', 'self_care_skills', 70, 'score', 'child_skills', 'hygiene', CURRENT_TIMESTAMP - INTERVAL '20 days', '70'),
    ('000000d1-0000-0000-0000-000000000001', 'life_skills', 'household_tasks', 65, 'score', 'tasks_v2', 'demo-toys', CURRENT_TIMESTAMP - INTERVAL '3 days', 'убирает игрушки'),
    ('000000d1-0000-0000-0000-000000000001', 'life_skills', 'household_tasks', 70, 'score', 'tasks_v2', 'demo-help', CURRENT_TIMESTAMP - INTERVAL '5 days', 'помогает маме'),
    ('000000d1-0000-0000-0000-000000000001', 'life_skills', 'parent_life_skills_score', 70, 'score', 'parent_input', 'demo', CURRENT_TIMESTAMP - INTERVAL '5 days', 'good');

-- 5. Snapshot 3 месяца назад
INSERT INTO t_p5815085_family_assistant_pro.member_portfolio_snapshots
    (member_id, family_id, snapshot_date, snapshot_type, age_group, scores, confidence, summary, source_count, trigger_event)
VALUES (
    '000000d1-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE - INTERVAL '90 days',
    'monthly',
    '4-6',
    '{"intellect": 65, "emotions": 55, "body": 75, "creativity": 80, "social": 45, "finance": 25, "values": 70, "life_skills": 60}',
    '{"intellect": 70, "emotions": 60, "body": 85, "creativity": 80, "social": 60, "finance": 40, "values": 75, "life_skills": 65}',
    '{"strengths": ["Творчество", "Интеллект"], "growth_zones": ["Социум", "Финансы"]}',
    18,
    'cron_monthly'
);
