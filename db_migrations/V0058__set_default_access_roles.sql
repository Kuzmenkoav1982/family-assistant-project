-- Установить access_role = 'viewer' для всех записей, где он NULL или пустой
UPDATE t_p5815085_family_assistant_pro.family_members
SET access_role = 'viewer'
WHERE access_role IS NULL OR access_role = '' OR access_role NOT IN ('admin', 'editor', 'viewer');

-- Установить владельцев (по user_id) как администраторов
UPDATE t_p5815085_family_assistant_pro.family_members
SET access_role = 'admin'
WHERE user_id IS NOT NULL AND role IN ('Владелец', 'Папа', 'Мама');