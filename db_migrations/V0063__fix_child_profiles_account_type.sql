-- Исправление типа аккаунта для профилей без привязанных пользователей
UPDATE t_p5815085_family_assistant_pro.family_members
SET account_type = 'child_profile'
WHERE user_id IS NULL AND account_type = 'full';