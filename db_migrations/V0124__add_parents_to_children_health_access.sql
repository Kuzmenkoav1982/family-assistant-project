-- Добавить обоих родителей (18+) в shared_with для детских профилей
-- Родители должны видеть и управлять здоровьем детей

-- Для каждого детского профиля добавляем всех взрослых из семьи
WITH parent_ids AS (
    SELECT fm.family_id, array_agg(fm.id::text) as parents
    FROM t_p5815085_family_assistant_pro.family_members fm
    WHERE fm.age >= 18
    GROUP BY fm.family_id
),
child_profiles AS (
    SELECT hp.id, hp.user_id, fm.family_id
    FROM t_p5815085_family_assistant_pro.health_profiles hp
    JOIN t_p5815085_family_assistant_pro.family_members fm ON fm.id::text = hp.user_id
    WHERE hp.privacy = 'parents' AND fm.age < 18
)
UPDATE t_p5815085_family_assistant_pro.health_profiles hp
SET shared_with = p.parents
FROM child_profiles cp
JOIN parent_ids p ON p.family_id = cp.family_id
WHERE hp.id = cp.id;